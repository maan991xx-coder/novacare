/* =====================================================================
   VITALX — مسار البيانات: ناسا (EDA) ← تحقق وتنظيف ← محرك المخاطر ← المخرجات
   يعمل في المتصفح (window.VITALX_PIPELINE) وفي Node (module.exports) بنفس الكود.

   1) التحقق (Data Validation) على كل قراءة خام كل 5 دقائق:
      - فجوة: فرق الوقت أكبر من 15 دقيقة (المتوقع 5)
      - مفقودة: قيمة فارغة
      - خارج المدى الفيزيائي للحساس (ليس حدًّا صحيًّا)
      - حساس عالق: نفس القيمة بالضبط لمدة طويلة (قيمة تعبئة مثل 3000 ppm)
      - قفزة: بعيدة جدًّا عن وسيط الساعة المحيطة (مرشح Hampel) ← تُصحَّح بالوسيط
      المستبعد لا يدخل الحساب. المصحَّح يدخل بقيمة الوسيط.
   2) محرك المخاطر: الوسيط اليومي ← خط أساس شخصي (أول 14 يومًا) ← robust_z ← CUSUM
      + حد ناسا الثابت لـ CO2 (3 mmHg). الإشعاع: معدل يومي مقابل جرعة تراكمية.
   3) المخرجات: مراقبة المخاطر، التنبيهات، لوحة العرض، التحليلات.
   ===================================================================== */
(function (root) {
  "use strict";
  const E = root.VITALX_ENGINE || (typeof require !== "undefined" ? require("./engine.js") : null);

  const STEP = 5, GAP = 15;                      // دقائق
  const PPM_TO_MMHG = 760 / 1e6;
  const CO2_LIMIT = 3;                           // mmHg — NASA-STD-3001 V2 6004
  // حدود فيزيائية للحساس (قراءة مستحيلة = عطل)، وليست حدودًا صحية
  const RULES = {
    co2:  { min: 300, max: 20000, stuck: 36,  spike: 5, floor: 60,  win: 6 },   // ppm؛ عالق = 3 ساعات بنفس القيمة
    temp: { min: 5,   max: 45,    stuck: 288, spike: 5, floor: 0.4, win: 6 },   // °C؛ 24 ساعة
    hum:  { min: 5,   max: 100,   stuck: 288, spike: 5, floor: 3,   win: 6 }    // %RH
  };
  const CH = ["co2", "temp", "hum"];
  const BASE = 14, K = 0.5, H = 5;

  const median = a => { const s = a.slice().sort((x, y) => x - y), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : NaN; };

  // ---------- فك الملف الخام ----------
  function decode(raw) {
    const t0 = Date.parse(raw.t0), n = raw.dt.length, time = new Array(n);
    let t = t0; for (let i = 0; i < n; i++) { t += raw.dt[i] * 60000; time[i] = t; }
    return { n, time, co2: raw.co2.slice(), temp: raw.temp10.map(v => v == null ? null : v / 10), hum: raw.hum.slice() };
  }

  // ---------- 1) التحقق ----------
  // faults: حقن أعطال اختبارية {ch, i, kind:"spike"|"stuck"|"range"|"missing", len, value}
  function validate(raw, faults) {
    const R = decode(raw), n = R.n;
    (faults || []).forEach(f => {
      const a = R[f.ch], len = f.len || 1;
      for (let i = f.i; i < Math.min(n, f.i + len); i++) a[i] = f.kind === "missing" ? null : f.kind === "stuck" ? f.value : f.kind === "range" ? f.value : a[i] + f.value;
    });
    const out = { n, time: R.time, checked: 0, gaps: [], gapMin: 0, flags: {}, clean: {}, status: {}, counts: { missing: 0, range: 0, stuck: 0, spike: 0, gap: 0 } };
    for (let i = 1; i < n; i++) { const d = (R.time[i] - R.time[i - 1]) / 60000; if (d > GAP) { out.gaps.push({ at: R.time[i - 1], min: d }); out.gapMin += d - STEP; } }
    out.counts.gap = out.gaps.length;
    for (const ch of CH) {
      const a = R[ch], r = RULES[ch], st = new Array(n).fill("ok");
      for (let i = 0; i < n; i++) {
        out.checked++;
        if (a[i] == null || !isFinite(a[i])) st[i] = "missing";
        else if (a[i] < r.min || a[i] > r.max) st[i] = "range";
      }
      // عالق: تسلسل بنفس القيمة بالضبط ≥ r.stuck
      for (let i = 0; i < n;) {
        let j = i; while (j + 1 < n && st[j + 1] === "ok" && st[i] === "ok" && a[j + 1] === a[i]) j++;
        if (st[i] === "ok" && j - i + 1 >= r.stuck) for (let k = i; k <= j; k++) st[k] = "stuck";
        i = j + 1;
      }
      // قفزة: Hampel على الجيران الصالحين (±ساعة)
      const c = a.slice();
      for (let i = 0; i < n; i++) {
        if (st[i] !== "ok") { c[i] = null; continue; }
        const w = [];
        for (let k = Math.max(0, i - r.win); k <= Math.min(n - 1, i + r.win); k++) if (k !== i && st[k] === "ok" && Math.abs(R.time[k] - R.time[i]) <= 3600000) w.push(a[k]);
        if (w.length < 4) continue;
        const m = median(w), s = Math.max(1.4826 * median(w.map(v => Math.abs(v - m))), r.floor);
        if (Math.abs(a[i] - m) > r.spike * s) { st[i] = "spike"; c[i] = m; }
      }
      st.forEach(s => { if (s !== "ok") out.counts[s]++; });
      out.status[ch] = st; out.clean[ch] = c;
    }
    const cn = out.counts;
    out.flagged = cn.missing + cn.range + cn.stuck + cn.spike;
    out.cleaned = cn.spike;                         // صُحّحت بالوسيط
    out.excluded = cn.missing + cn.range + cn.stuck; // لا تدخل الحساب
    out.valid = out.checked - out.excluded;
    return out;
  }

  // ---------- تجميع يومي (الوسيط) ----------
  function daily(V, minCount) {
    minCount = minCount || 12;   // ساعة واحدة على الأقل من القراءات الصالحة
    const by = new Map();
    for (let i = 0; i < V.n; i++) {
      const k = new Date(V.time[i]).toISOString().slice(0, 10);
      if (!by.has(k)) by.set(k, { co2: [], temp: [], hum: [], all: 0 });
      const b = by.get(k); b.all++;
      CH.forEach(ch => { const v = V.clean[ch][i]; if (v != null) b[ch].push(v); });
    }
    const keys = [...by.keys()].sort(), dropped = keys.filter(k => by.get(k).co2.length < minCount);
    const dates = keys.filter(k => by.get(k).co2.length >= minCount);
    const pick = (ch, f) => dates.map(k => { const a = by.get(k)[ch]; return a.length >= minCount ? +f(median(a)).toFixed(3) : null; });
    return { dates, dropped, co2: pick("co2", v => v * PPM_TO_MMHG), temp: pick("temp", v => v), hum: pick("hum", v => v) };
  }

  // أعلى متوسط ساعة لـ CO2 (حد ناسا 3 mmHg لمتوسط الساعة أيضًا)
  function maxHourCo2(V) {
    let best = 0, at = null, q = [], sum = 0;
    for (let i = 0; i < V.n; i++) {
      const v = V.clean.co2[i]; if (v == null) continue;
      q.push([V.time[i], v]); sum += v;
      while (q.length && V.time[i] - q[0][0] >= 3600000) sum -= q.shift()[1];
      if (q.length >= 10) { const m = sum / q.length * PPM_TO_MMHG; if (m > best) { best = m; at = V.time[i]; } }
    }
    return { mmhg: +best.toFixed(2), at: at && new Date(at).toISOString() };
  }

  // ---------- 2) محرك المخاطر ----------
  // side: 1 = الارتفاع فقط (CO2، الإشعاع)، 0 = الاتجاهين (الحرارة، الرطوبة)
  function risk(series, side, limit, minScale) {
    const st = E.baselineStats(series.slice(0, BASE).filter(v => v != null), minScale || { type: "relative", value: 0.05 });
    const step = E.makeCusum(K, H), level = [], z = [];
    let ours = null, fixed = null; const marks = [];
    series.forEach((v, i) => {
      let l = 0;
      if (limit != null && v != null && v > limit) { l = 3; if (fixed == null) fixed = i; }
      if (i >= BASE && v != null) {
        const zz = E.robustZ(v, st), r = step(zz); z.push(+zz.toFixed(2));
        if (r.fired && (side === 0 || r.side === side)) { l = Math.max(l, 2); marks.push(i); if (ours == null) ours = i; }
      } else z.push(null);
      level.push(l);
    });
    return { st, level, z, ours, fixed, marks, now: level[level.length - 1] };
  }

  // الإشعاع: معدل يومي + جرعة تراكمية
  function radiation(rad) {
    const ok = rad.total.map(v => v != null && isFinite(v) && v > 0 && v < 50);
    const rate = rad.total.map((v, i) => ok[i] ? v : null);
    let s = 0; const cum = rate.map(v => (s += v || 0, +s.toFixed(3)));
    return { dates: rad.dates, rate, gcr: rad.gcr, saa: rad.saa, cum, bad: ok.filter(x => !x).length, r: risk(rate, 1, null) };
  }

  // ---------- المسار الكامل ----------
  // opt.drift: اختبار حساسية (mmHg/يوم) يُضاف فوق CO2 الحقيقي من اليوم opt.from — مُعلَّم كاختبار
  function run(raw, opt) {
    opt = opt || {};
    const V = validate(raw, opt.faults), Dd = daily(V), rad = radiation(raw.rad);
    const drift = opt.drift != null ? opt.drift : 0.05, from = opt.from != null ? opt.from : 16;
    const test = Dd.co2.map((v, i) => v == null ? null : +(v + Math.max(0, i - from) * drift).toFixed(3));
    const eng = {
      co2: risk(Dd.co2, 1, CO2_LIMIT), temp: risk(Dd.temp, 0, null),
      hum: risk(Dd.hum, 0, null), rad: rad.r, test: risk(test, 1, CO2_LIMIT)
    };
    // التنبيهات: كل صعود في المستوى (حقيقي أو اختبار)
    const alerts = [];
    const push = (src, ch, r, dates) => r.level.forEach((l, i) => { const p = i ? r.level[i - 1] : 0; if (l >= 2 && l > p) alerts.push({ src, ch, i, date: dates[i], level: l }); });
    push("real", "co2", eng.co2, Dd.dates); push("real", "temp", eng.temp, Dd.dates); push("real", "hum", eng.hum, Dd.dates);
    push("real", "rad", eng.rad, rad.dates); push("test", "co2", eng.test, Dd.dates);
    return { V, daily: Dd, rad, test, eng, alerts, hour: maxHourCo2(V), limit: CO2_LIMIT, base: BASE,
      stats: { readings: V.n, checked: V.checked, flagged: V.flagged, cleaned: V.cleaned, excluded: V.excluded, valid: V.valid, gaps: V.counts.gap, gapMin: V.gapMin, counts: V.counts,
        days: Dd.dates.length, droppedDays: Dd.dropped, channels: 4, realAlerts: alerts.filter(a => a.src === "real").length, testAlerts: alerts.filter(a => a.src === "test").length } };
  }

  const api = { RULES, CO2_LIMIT, PPM_TO_MMHG, decode, validate, daily, maxHourCo2, risk, radiation, run };
  root.VITALX_PIPELINE = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
