#!/usr/bin/env node
/*
  VITALX ← NASA OSDR Environmental Data App (EDA)
  يقرأ ملف CSV مُنزَّل من https://visualization.osdr.nasa.gov/eda/ (جدول Telemetry أو Radiation)
  ويشغّل عليه محرك VITALX نفسه (robust_z + CUSUM) بدون أي تعديل على المحرك.

  الاستخدام:
    node data/nasa-eda-adapter.js <file.csv> [--baseline-days 14] [--column CO2]
  المخرجات: تجميع يومي (الوسيط)، خط الأساس، أيام الإنذار، ومقارنة بحد ناسا 3 mmHg (متوسط 24 ساعة).
*/
const fs = require("fs");
const path = require("path");
const E = require(path.join(__dirname, "..", "engine.js"));

const args = process.argv.slice(2);
if (!args[0]) { console.error("usage: node data/nasa-eda-adapter.js <file.csv> [--baseline-days N] [--column NAME]"); process.exit(1); }
const opt = (n, d) => { const i = args.indexOf(n); return i > -1 ? args[i + 1] : d; };
const BASE_DAYS = +opt("--baseline-days", 14);
const WANT = (opt("--column", "") || "").toLowerCase();
const K = 0.5, H = 5;               // نفس قيم content.js
const CO2_LIMIT_MMHG = 3.0;         // NASA-STD-3001 V2 6004 + flight rule 2016 (24-h avg)

function parseCSV(txt) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) { if (c === '"' && txt[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && txt[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(v => v.trim() !== ""));
}

const rows = parseCSV(fs.readFileSync(args[0], "utf8"));
const head = rows[0].map(h => h.trim());
const lc = head.map(h => h.toLowerCase());
const tCol = lc.findIndex(h => /time|date|day/.test(h));
// أعمدة ISS فقط (نتجاهل Ground)
const pick = re => lc.findIndex(h => re.test(h) && !/ground/.test(h));
let cols = WANT ? [lc.findIndex(h => h.includes(WANT))]
  : [pick(/co2/), pick(/temp/), pick(/humid/), pick(/total|gcr|dose/)].filter(i => i > -1);
cols = [...new Set(cols)].filter(i => i > -1 && i !== tCol);
if (tCol < 0 || !cols.length) { console.error("لم أجد عمود الوقت أو القيم. الأعمدة:", head.join(" | ")); process.exit(2); }

function dayKey(s) {
  const d = new Date(s);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);
  const n = parseFloat(s); return isNaN(n) ? null : String(Math.floor(n)); // وقت نسبي بالأيام
}

for (const c of cols) {
  const name = head[c];
  const byDay = new Map();
  for (const r of rows.slice(1)) {
    const k = dayKey(r[tCol]); const v = parseFloat(r[c]);
    if (k == null || !isFinite(v)) continue;
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k).push(v);
  }
  const days = [...byDay.keys()].sort((a, b) => (isNaN(a) ? a.localeCompare(b) : a - b));
  let daily = days.map(d => E.median(byDay.get(d)));
  const isCO2 = /co2/i.test(name);
  let unit = "";
  if (isCO2 && E.median(daily) > 50) { daily = daily.map(v => v * 760 / 1e6); unit = " (ppm→mmHg)"; } else if (isCO2) unit = " mmHg";
  if (daily.length < BASE_DAYS + 3) { console.log(`\n# ${name}: ${daily.length} يوم فقط — غير كافٍ (نحتاج > ${BASE_DAYS + 3})`); continue; }

  const st = E.baselineStats(daily.slice(0, BASE_DAYS), { type: "relative", value: 0.05 });
  const step = E.makeCusum(K, H);
  const alerts = [], over = [];
  daily.forEach((v, i) => {
    if (isCO2 && v > CO2_LIMIT_MMHG) over.push(days[i]);
    if (i < BASE_DAYS) return;
    const r = step(E.robustZ(v, st));
    if (r.fired) alerts.push(`${days[i]} (${r.side > 0 ? "↑" : "↓"} ${v.toFixed(2)})`);
  });
  console.log(`\n# ${name}${unit}`);
  console.log(`أيام: ${daily.length} | من ${days[0]} إلى ${days.at(-1)}`);
  console.log(`خط الأساس (أول ${BASE_DAYS} يوم): وسيط ${st.med.toFixed(3)} | مقياس ${st.scale.toFixed(3)}`);
  console.log(`إنذارات VITALX (CUSUM k=${K}, h=${H}): ${alerts.length ? alerts.join(", ") : "لا يوجد"}`);
  if (isCO2) console.log(`أيام تجاوزت حد ناسا الثابت ${CO2_LIMIT_MMHG} mmHg: ${over.length ? over.join(", ") : "لا يوجد"}`);
}
