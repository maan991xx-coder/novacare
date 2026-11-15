// يشغّل مسار البيانات الكامل (pipeline.js) على قراءات ناسا الخام لرحلة RR-12 وقت البناء،
// ويكتب النتائج اليومية في ملف صغير يُضمَّن داخل التطبيق (يعمل بلا إنترنت، ولا يحتاج Map/Set في WebView القديم).
// node phone/build-rr12.js  →  phone/rr12-app.js
const fs = require("fs"), path = require("path");
global.window = global;
require("../content.js"); require("../engine.js");
require("../data/rr12-raw.js");
const PL = require("../pipeline.js");
const RAW = window.VITALX_RAW, S = window.VITALX_CONTENT.site;

const P = PL.run(RAW, { drift: 0.05, from: 16 });
const dates = P.daily.dates, n = dates.length;
const r3 = v => v == null || !isFinite(v) ? null : Math.round(v * 1000) / 1000;
const pack = (vals, r, limit, unit, dec) => ({ v: vals.map(r3), lvl: r.level, z: r.z, med: r3(r.st.med), scale: r3(r.st.scale), limit, unit, dec });

// الإشعاع: مصفوفة ناسا بتواريخها، تُحاذى على أيام المهمة (الجرعة التراكمية تشمل الأيام قبل 04-22)
const rd = P.rad, rIdx = {}; rd.dates.forEach((d, i) => { rIdx[d] = i; });
let lastCum = 0;
const radV = [], radCum = [], radLvl = [], radZ = [];
dates.forEach(d => {
  const i = rIdx[d];
  if (i != null) { lastCum = rd.cum[i]; radV.push(r3(rd.rate[i])); radLvl.push(rd.r.level[i]); radZ.push(rd.r.z[i]); }
  else { radV.push(null); radLvl.push(0); radZ.push(null); }
  radCum.push(r3(lastCum));
});
// إذا لم يبدأ اليوم في سجل الإشعاع بعد 04-22، فالجرعة قبلها تبقى محسوبة
const rad = { v: radV, cum: radCum, lvl: radLvl, z: radZ, med: r3(rd.r.st.med), scale: r3(rd.r.st.scale), limit: null, unit: "mGy", dec: 3, last: rd.dates[rd.dates.length - 1] };

// التحقق: عدّادات تراكمية حتى نهاية كل يوم من أيام المهمة
const V = P.V, CH = ["co2", "temp", "hum"], val = [];
const endOf = d => Date.parse(d + "T00:00:00Z") + 864e5;
let gi = 0;
dates.forEach(d => {
  const end = endOf(d), c = { checked: 0, stuck: 0, spike: 0, range: 0, missing: 0, gap: 0 };
  for (let i = 0; i < V.n && V.time[i] < end; i++) CH.forEach(ch => { c.checked++; const s = V.status[ch][i]; if (s !== "ok") c[s]++; });
  c.gap = V.gaps.filter(g => g.at < end).length;
  c.valid = c.checked - c.stuck - c.range - c.missing;
  val.push(c);
});

// العلامات الحيوية: لا توجد بيانات صحية حقيقية للرواد → نبض راحة محاكى يتأثر بـ CO2 الحقيقي (نفس نموذج الموقع)
const SENS = { A: 1, B: 3, C: 6, D: 2, E: 4 };
const crewM = S.crew.map(m => ({ id: m.id, seed: m.seed, sens: SENS[m.id] || 2 }));
const crewOf = co2 => PL.crewExposure(co2, crewM).map(c => ({ id: c.id, sens: c.sens, hr: c.hr, lvl: c.r.level, z: c.r.z, med: r3(c.r.st.med), scale: r3(c.r.st.scale) }));

const out = {
  mission: "RR-12", source: "NASA OSDR Environmental Data App (EDA)", url: RAW.url, dates, base: P.base,
  ch: {
    co2: pack(P.daily.co2, P.eng.co2, P.limit, "mmHg", 2),
    temp: pack(P.daily.temp, P.eng.temp, null, "°C", 1),
    hum: pack(P.daily.hum, P.eng.hum, null, "%", 0),
    rad
  },
  val, hour: P.hour, stats: P.stats, droppedDays: P.daily.dropped,
  crew: crewOf(P.daily.co2), hrLimit: 85,
  test: { co2: pack(P.test, P.eng.test, P.limit, "mmHg", 2), crew: crewOf(P.test), drift: 0.05, from: 16 }
};
const js = "/* مولّد بـ phone/build-rr12.js من data/rr12-raw.js عبر pipeline.js — ناسا RR-12 (2019) بعد التحقق والتنظيف ومحرك المخاطر */\nwindow.VITALX_RR12 = " + JSON.stringify(out) + ";\n";
fs.writeFileSync(path.join(__dirname, "rr12-app.js"), js);
console.log("rr12-app.js", js.length, "bytes,", n, "days", dates[0], "→", dates[n - 1], "| stuck", P.stats.counts.stuck, "spikes", P.stats.counts.spike, "gaps", P.stats.gaps);
