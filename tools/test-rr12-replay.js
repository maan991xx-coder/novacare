#!/usr/bin/env node
// اختبار المسار كاملًا بإعادة تشغيل مهمة RR-12 الحقيقية: node tools/test-rr12-replay.js
// 1) البيانات الحقيقية كما هي  2) أعطال مصطنعة نحقنها ونتأكد أن التحقق يلتقطها  3) انجراف مصطنع ونتأكد أن المحرك يسبق الحد الثابت
global.window = global;
require("../engine.js"); require("../data/rr12-raw.js");
const P = require("../pipeline.js"), RAW = window.VITALX_RAW;
let fail = 0; const ok = (c, m) => { console.log((c ? "✔ " : "✘ ") + m); if (!c) fail++; };

const r = P.run(RAW), s = r.stats, d = i => r.daily.dates[i];
console.log("\n— RR-12 الحقيقية —");
console.log(`readings ${s.readings} · values checked ${s.checked} · flagged ${s.flagged} (stuck ${s.counts.stuck}, spike ${s.counts.spike}, range ${s.counts.range}, missing ${s.counts.missing}) · gaps ${s.gaps} (${s.gapMin} min)`);
ok(s.counts.stuck > 1000, "قيمة التعبئة 3000 ppm في أول أيام المهمة اكتُشفت كحساس عالق");
ok(s.droppedDays.join() === "2019-04-17,2019-04-18,2019-04-19,2019-04-20,2019-04-21", "أيام التعبئة الخمسة استُبعدت من الحساب");
ok(r.daily.co2[0] > 2.5, `يوم 04-22 صار وسيطه ${r.daily.co2[0]} mmHg بدل قيمة التعبئة 2.28`);
ok(s.gaps === 1, "فجوة الاتصال الوحيدة (52 دقيقة) اكتُشفت");
ok(r.eng.co2.ours == null && r.eng.co2.fixed == null, "CO2 الحقيقي: لا إنذار من VITALX ولا تجاوز لحد 3 mmHg");
ok(r.hour.mmhg < 3, `أعلى متوسط ساعة ${r.hour.mmhg} mmHg أقل من 3`);
ok(r.eng.rad.ours == null, `الإشعاع: معدل مستقر، الجرعة التراكمية ${r.rad.cum.at(-1).toFixed(2)} mGy في ${r.rad.rate.length} يومًا`);
console.log(`الحرارة: ${r.eng.temp.ours == null ? "لا تنبيه" : "مراقبة يوم " + d(r.eng.temp.ours) + " (المقصورة بردت ببطء من " + r.eng.temp.st.med + "°C)"}`);

console.log("\n— حقن أعطال —");
const i0 = 4000;
const f = P.validate(RAW, [
  { ch: "co2", i: i0, kind: "spike", value: 4000 },
  { ch: "temp", i: i0 + 50, kind: "range", value: 99 },
  { ch: "hum", i: i0 + 100, kind: "stuck", value: 40, len: 300 },
  { ch: "co2", i: i0 + 500, kind: "missing", len: 3 }
]);
ok(f.status.co2[i0] === "spike" && f.clean.co2[i0] < 4000, "قفزة CO2 مصطنعة اكتُشفت وصُحّحت بالوسيط");
ok(f.status.temp[i0 + 50] === "range", "حرارة 99°C مستحيلة اكتُشفت كخارج المدى");
ok(f.status.hum[i0 + 150] === "stuck", "رطوبة عالقة 25 ساعة اكتُشفت");
ok(f.counts.missing === 3, "3 قراءات مفقودة عُدّت");

console.log("\n— انجراف مصطنع 0.05 mmHg/يوم من اليوم 16 —");
const T = r.eng.test;
ok(T.ours != null && T.fixed != null && T.ours < T.fixed, `VITALX ${d(T.ours)} قبل الحد الثابت ${d(T.fixed)} بـ ${T.fixed - T.ours} أيام`);
const r3 = P.run(RAW, { drift: 0.03 });
ok(r3.eng.test.ours != null && r3.eng.test.fixed == null, `مع 0.03/يوم: VITALX ${r3.daily.dates[r3.eng.test.ours]} والحد الثابت لا يُتجاوز`);

console.log(fail ? `\n${fail} فشل` : "\nكل الاختبارات نجحت");
process.exit(fail ? 1 : 0);
