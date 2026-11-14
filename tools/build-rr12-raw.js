#!/usr/bin/env node
// يبني data/rr12-raw.js من ملفات ناسا الخام (data/nasa/rr12-telemetry.csv و rr12-radiation.csv) بدون أي تعديل على القيم.
// القراءات كل 5 دقائق مخزنة مضغوطة: فرق الوقت بالدقائق، CO2 ppm، الحرارة ×10، الرطوبة %.
// node tools/build-rr12-raw.js
const fs = require("fs"), path = require("path");
const dir = path.join(__dirname, "..", "data", "nasa");
const rows = f => { const l = fs.readFileSync(path.join(dir, f), "utf8").replace(/^﻿/, "").trim().split(/\r?\n/); const h = l[0].split(",").map(s => s.replace(/"/g, ""));
  return l.slice(1).map(x => { const c = x.split(",").map(s => s.replace(/"/g, "")); const o = {}; h.forEach((k, i) => o[k] = c[i]); return o; }); };
const tel = rows("rr12-telemetry.csv"), rad = rows("rr12-radiation.csv");
const num = s => s === undefined || s === "" ? null : +s;
const t0 = Date.parse(tel[0].time);
let prev = t0; const dt = [], co2 = [], temp = [], hum = [];
for (const r of tel) { const t = Date.parse(r.time); dt.push(Math.round((t - prev) / 60000)); prev = t;
  co2.push(num(r.co2_iss)); temp.push(r.temperature_iss === "" ? null : Math.round(+r.temperature_iss * 10)); hum.push(num(r.humidity_iss)); }
const out = { mission: "RR-12", source: "NASA OSDR Environmental Data App (EDA)", url: "https://visualization.osdr.nasa.gov/eda/",
  t0: tel[0].time, dt, co2, temp10: temp, hum,
  rad: { dates: rad.map(r => r.time.slice(0, 10)), gcr: rad.map(r => num(r.gcr)), saa: rad.map(r => num(r.saa)), total: rad.map(r => num(r.total)), milestones: rad.map(r => r.milestones || null) } };
const js = "/* مولّد بـ tools/build-rr12-raw.js من data/nasa/ — قراءات ناسا الخام كل 5 دقائق (RR-12، 2019) بدون تعديل */\nwindow.VITALX_RAW = " + JSON.stringify(out) + ";\n";
fs.writeFileSync(path.join(__dirname, "..", "data", "rr12-raw.js"), js);
console.log("rows", tel.length, "bytes", js.length);
