#!/usr/bin/env node
// يشغّل محرك VITALX على CO2 المقصورة لكل مهمات NASA OSDR EDA (مجلد فيه <MISSION>/telemetry_data.csv)
// node data/run-all-missions.js <dir>
const fs = require("fs"), path = require("path"), E = require("../engine.js");
const dir = process.argv[2], BASE = 14, K = 0.5, H = 5, LIMIT = 3;
const out = [];
for (const m of fs.readdirSync(dir).sort()) {
  const f = path.join(dir, m, "telemetry_data.csv"); if (!fs.existsSync(f)) continue;
  const lines = fs.readFileSync(f, "utf8").trim().split(/\r?\n/), head = lines[0].split(",");
  const ti = head.indexOf("time"), ci = head.indexOf("co2_iss"); if (ti < 0 || ci < 0) continue;
  const by = new Map();
  for (const l of lines.slice(1)) { const c = l.split(","), v = parseFloat(c[ci]); if (!isFinite(v)) continue; const k = c[ti].slice(0, 10); if (!by.has(k)) by.set(k, []); by.get(k).push(v); }
  const days = [...by.keys()].sort().filter(k => { const a = by.get(k); return !(a.length > 3 && Math.min(...a) === Math.max(...a)); });
  const daily = days.map(k => E.median(by.get(k)) * 760 / 1e6);
  if (daily.length < BASE + 3) { out.push({ mission: m, days: daily.length, skipped: "too short" }); continue; }
  const st = E.baselineStats(daily.slice(0, BASE), { type: "relative", value: 0.05 }), step = E.makeCusum(K, H);
  const alerts = []; let over = 0, firstOver = null;
  daily.forEach((v, i) => { if (v > LIMIT) { over++; if (!firstOver) firstOver = days[i]; } if (i < BASE) return; const r = step(E.robustZ(v, st)); if (r.fired && r.side > 0) alerts.push(days[i]); });
  out.push({ mission: m, from: days[0], to: days.at(-1), days: daily.length, median: +E.median(daily).toFixed(2), max: +Math.max(...daily).toFixed(2), alerts, firstAlert: alerts[0] || null, overLimitDays: over, firstOver });
}
console.log(JSON.stringify(out, null, 1));
