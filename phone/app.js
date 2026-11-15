/* VITALX — تطبيق الهاتف v3.5: شاشة اختيار، ساعة الرائد، لوحة الأرض.
   البيئة حقيقية: رحلة ناسا RR-12 (2019) بعد التحقق والتنظيف ومحرك المخاطر (rr12-app.js، مولّد من pipeline.js).
   نبض الراحة محاكى لكل رائد ويتأثر بـ CO2 الحقيقي، لأن ناسا لا تنشر بيانات صحية للرواد. */
(function () {
  "use strict";
  var C = window.VITALX_CONTENT, R = window.VITALX_RR12, S = C.site;
  var $ = function (id) { return document.getElementById(id); };
  var lang = "ar";
  try { lang = localStorage.getItem("vx-phone-lang") || "ar"; } catch (e) { /* */ }
  var t = function (x) { return x && typeof x === "object" ? (x[lang] != null ? x[lang] : x.ar) : String(x == null ? "" : x); };
  var fmt = function (v, d) { return v == null || isNaN(v) ? "—" : Number(v).toFixed(d); };
  var nf = function (v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
  var COL = { 0: "#3ddc97", 1: "#6aa8ff", 2: "#ffb547", 3: "#ff5d6c", calib: "#a5afc4" };
  var N = R.dates.length, BASE = R.base, HOR = 14;
  var TX = {
    watch: { ar: "ساعة الرائد", en: "Astronaut watch" }, watchSub: { ar: "ما يراه الرائد على معصمه", en: "What the astronaut sees on the wrist" },
    ground: { ar: "لوحة الأرض", en: "Ground dashboard" }, groundSub: { ar: "بيانات الطاقم كما يراها الفريق الطبي", en: "Crew data as the medical team sees it" },
    groundTitle: { ar: "مركز المتابعة الطبية", en: "Medical monitoring center" },
    hr: { ar: "نبض الراحة", en: "Resting HR" }, co2: { ar: "CO2", en: "CO2" }, temp: { ar: "الحرارة", en: "Temp" }, hum: { ar: "الرطوبة", en: "Humidity" }, rad: { ar: "الإشعاع", en: "Radiation" },
    chT: { hr: { ar: "نبض الراحة", en: "Resting heart rate" }, co2: { ar: "CO2 المقصورة", en: "Cabin CO2" }, temp: { ar: "حرارة المقصورة", en: "Cabin temperature" },
      hum: { ar: "رطوبة المقصورة", en: "Cabin humidity" }, rad: { ar: "الإشعاع اليومي", en: "Daily radiation" } },
    day: { ar: "اليوم", en: "Day" }, real: { ar: "ناسا", en: "NASA" }, sim: { ar: "محاكاة", en: "Simulated" },
    band: { ar: "خط الأساس", en: "Baseline" }, fixedThr: { ar: "الحد الثابت", en: "Fixed limit" }, fc: { ar: "توقع 14 يومًا", en: "14-day forecast" },
    cum: { ar: "تراكمي", en: "Total" },
    val: { ar: "التحقق من البيانات", en: "Data validation" }, checked: { ar: "قراءة فُحصت", en: "values checked" },
    fcHead: { ar: "توقع 14 يومًا", en: "14-day forecast" },
    fcLimit: { ar: "يبلغ الحد بعد", en: "Reaches limit in" }, fcBand: { ar: "يخرج عن خطه بعد", en: "Leaves baseline in" },
    fcOk: { ar: "مستقر 14 يومًا", en: "Stable for 14 days" }, fcWait: { ar: "يبدأ بعد خط الأساس", en: "Starts after baseline" }, 
    test: { ar: "اختبار انجراف", en: "Drift test" },
    note: { ar: "بيئة المقصورة حقيقية · النبض محاكى · دعم قرار", en: "Real cabin environment · simulated HR · decision support" },
    gNote: { ar: "CO2 والحرارة والرطوبة والإشعاع: ناسا RR-12 (2019) · النبض محاكى", en: "CO2, temp, humidity, radiation: NASA RR-12 (2019) · HR simulated" },
    testNote: { ar: "اختبار: انجراف CO2 مضاف 0.05 mmHg/يوم من اليوم 16 فوق بيانات ناسا", en: "Test: CO2 drift +0.05 mmHg/day from day 16 added on top of NASA data" },
    conn: [{ ar: "متصل", en: "Online" }, { ar: "ضعيف", en: "Weak" }, { ar: "منقطع", en: "Offline" }]
  };
  // المستشار الذكي: ما تغيّر ← إن استمر ← نقترح. اقتراح لطبيب الطاقم، ليس تشخيصًا.
  var AD = {
    head: { ar: "المستشار الذكي", en: "Smart Advisor" }, tag: { ar: "اقتراح", en: "Suggestion" }, foot: { ar: "يقرر الطبيب", en: "Doctor decides" },
    ok: { ar: "كل شيء ضمن خطك", en: "All within baseline" },
    ch: {
      hr: { what: { ar: "النبض ↑", en: "HR ↑" }, risk: { ar: "إجهاد", en: "Strain" }, act: { ar: "راحة + ماء", en: "Rest + water" } },
      co2: { what: { ar: "CO2 ↑", en: "CO2 ↑" }, risk: { ar: "صداع", en: "Headache" }, act: { ar: "تهوية", en: "Ventilate" } },
      temp: { what: { ar: "الحرارة ↕", en: "Temp ↕" }, risk: { ar: "نوم أسوأ", en: "Poor sleep" }, act: { ar: "ضبط الحرارة", en: "Adjust thermal" } },
      hum: { what: { ar: "الرطوبة ↕", en: "Humidity ↕" }, risk: { ar: "جفاف", en: "Dryness" }, act: { ar: "ضبط الرطوبة", en: "Adjust humidity" } },
      rad: { what: { ar: "الإشعاع ↑", en: "Radiation ↑" }, risk: { ar: "جرعة أعلى", en: "Higher dose" }, act: { ar: "الملجأ", en: "Shelter" } }
    }
  };
  var SV = function (p, cls) { return '<svg class="' + (cls || "si") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>"; };
  var VI = {
    hr: '<path d="M12 21s-7-4.4-9.3-9A5.3 5.3 0 0 1 12 6.2 5.3 5.3 0 0 1 21.3 12C19 16.6 12 21 12 21Z"/><path d="M4 12h4l2-3 3 6 2-3h5"/>',
    co2: '<text x="12" y="15.5" text-anchor="middle" font-size="8.5" font-weight="700" fill="currentColor" stroke="none" font-family="sans-serif">CO2</text><rect x="2.5" y="5" width="19" height="14" rx="3"/>',
    rad: '<circle cx="12" cy="12" r="2"/><path d="M12 10 9 4.8A8 8 0 0 0 4.2 13H10M14 12h6a8 8 0 0 0-4.8-7.4L12 10M13 13.7l3 5.2a8 8 0 0 1-8 0l3-5.2"/>',
    temp: '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z"/><path d="M12 9v7"/>',
    hum: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
    filter: '<path d="M3 4h18l-7 8.5V19l-4 2v-8.5z"/>', stuck: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    spike: '<path d="M3 17h5l3-12 3 12h7"/>', gap: '<path d="M3 12h5M16 12h5M11 7l-2 10M15 7l-2 10"/>',
    fc: '<path d="M3 17l5-5 4 3 4-6"/><path d="M16 9l5-4" stroke-dasharray="2 2.5"/>', spark: '<path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.5 2.5M16.5 16.5 19 19M5 19l2.5-2.5M16.5 7.5 19 5"/>',
    ok: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>', flask: '<path d="M9 3h6M10 3v6L4.5 19A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.5-2L14 9V3"/><path d="M7 15h10"/>',
    risk: { hr: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>', co2: '<circle cx="12" cy="10" r="7"/><path d="M9 21h6"/><path d="m8.5 9 2 2-2 2M15.5 9l-2 2 2 2"/>',
      temp: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>', hum: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/><path d="M5 5l14 14"/>',
      rad: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/>' },
    act: { hr: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>', co2: '<circle cx="12" cy="12" r="1.6"/><path d="M12 10.4c0-4 1-7 3.5-7 1.6 0 2 1.8.5 3.5L12 10.4ZM13.4 12.8c3.5 2 5.6 4.3 4.4 6.4-.8 1.4-2.6.9-3.3-1.3l-1.1-5.1ZM10.6 12.8c-3.5 2-6.6 2.6-7.8.5-.8-1.4.5-2.7 2.8-2.2l5 1.7Z"/>',
      temp: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>', hum: '<path d="M4 8h16M4 12h10M4 16h13"/>',
      rad: '<path d="M3 11 12 4l9 7v9H3z"/><path d="M9 20v-6h6v6"/>' }
  };
  var CHS = ["co2", "temp", "hum", "rad", "hr"];

  // ---------- البيانات (حقيقي أو اختبار انجراف) ----------
  var st = { mode: "menu", day: BASE, playing: true, member: "A", gMember: "A", ch: "co2", test: false, hold: 0 };
  function env() { return st.test ? { co2: R.test.co2, temp: R.ch.temp, hum: R.ch.hum, rad: R.ch.rad } : R.ch; }
  function crewData() { return st.test ? R.test.crew : R.crew; }
  var crewMeta = S.crew;
  function member(id) { var cs = crewData(); for (var i = 0; i < cs.length; i++) if (cs[i].id === id) return { m: crewMeta[i], d: cs[i] }; return { m: crewMeta[0], d: cs[0] }; }
  function series(ch, id) {
    if (ch === "hr") { var c = member(id).d; return { v: c.hr, lvl: c.lvl, z: c.z, med: c.med, scale: c.scale, limit: R.hrLimit, unit: "bpm", dec: 0 }; }
    return env()[ch];
  }
  function lvlAt(s, d) { var l = 0; for (var i = Math.max(0, d - 2); i <= d; i++) l = Math.max(l, s.lvl[i] || 0); return l; }
  // أعلى قناة مساهمة الآن: نبض الرائد أولًا ثم البيئة
  function topCh(id, d) {
    var best = null, order = ["hr", "co2", "temp", "hum", "rad"];
    for (var k = 0; k < order.length; k++) { var l = lvlAt(series(order[k], id), d); if (l >= 2 && (!best || l > best.l)) best = { id: order[k], l: l }; }
    return best;
  }
  function status(id, d) { if (d < BASE) return "calib"; var tc = topCh(id, d); return tc ? tc.l : 0; }
  function connOf(seed, d) { var h = ((seed * 2654435761) ^ (d * 40503 + 7)) >>> 0, r = h % 100; return r < 4 ? 2 : r < 14 ? 1 : 0; }
  function dWord(n) { return lang === "en" ? (n === 1 ? "day" : "days") : n === 1 || n === 2 || n > 10 ? "يومًا" : "أيام"; }
  function md(i) { var s = R.dates[i] || ""; return s.slice(5).replace("-", "/"); }

  // توقع: انحدار خطي لآخر 14 يومًا ← أيام حتى الحد (أو حافة خط الأساس) خلال 14 يومًا
  function forecast(s, d) {
    var xs = [], ys = [];
    for (var i = Math.max(0, d - 13); i <= d; i++) if (s.v[i] != null) { xs.push(i); ys.push(s.v[i]); }
    if (xs.length < 5) return null;
    var n = xs.length, xm = 0, ym = 0, k; for (k = 0; k < n; k++) { xm += xs[k]; ym += ys[k]; } xm /= n; ym /= n;
    var num = 0, den = 0; for (k = 0; k < n; k++) { num += (xs[k] - xm) * (ys[k] - ym); den += (xs[k] - xm) * (xs[k] - xm); }
    var slope = den ? num / den : 0, at = function (x) { return ym + slope * (x - xm); }, now = at(d);
    var hi = s.limit != null ? s.limit : s.med + 3 * s.scale, lo = s.med - 3 * s.scale, days = null, kind = s.limit != null ? "limit" : "band";
    if (slope > 0 && hi > now) days = Math.ceil((hi - now) / slope);
    else if (slope < 0 && s.limit == null && now > lo) days = Math.ceil((now - lo) / -slope);
    if (days != null && days > HOR) days = null;
    return { slope: slope, at: at, days: days, kind: kind };
  }

  // ---------- الحالة والتشغيل ----------
  var L = function (type, data) { try { if (window.VXLOG) window.VXLOG.log(type, data); } catch (e) { /* */ } };
  var timer = null;
  function setMode(m) {
    if (m !== st.mode) L("screen", { from: st.mode, to: m });
    st.mode = m;
    ["menu", "watch", "ground"].forEach(function (k) { $(k).className = "view" + (k === m ? " on" : ""); });
    try { if (window.Android && window.Android.setMode) window.Android.setMode(m); } catch (e) { /* */ }
    clearInterval(timer);
    if (m !== "menu") {
      st.day = BASE; st.playing = true; st.hold = 0;
      timer = setInterval(function () {
        if (!st.playing) return;
        if (st.day >= N - 1) { if (++st.hold < 4) return; st.hold = 0; st.day = 0; } else st.day++;
        draw();
      }, m === "watch" ? 1600 : 1100);
      setTimeout(draw, 60); // بعد تدوير الشاشة
    }
    renderMenu();
  }
  window.vxBack = function () {
    if (pin.open) { closePin(); return true; }
    if (st.mode !== "menu") { setMode("menu"); return true; }
    return false; // في القائمة: لا خروج
  };

  // ---------- لوحة رمز الخروج (تظهر بضغطة رجوع مطوّلة) ----------
  var PX = {
    title: { ar: "أدخل رمز الخروج", en: "Enter exit code" }, bad: { ar: "رمز خاطئ", en: "Wrong code" },
    exit: { ar: "خروج من التطبيق", en: "Exit app" }, exitAll: { ar: "خروج وإلغاء القفل الكامل", en: "Exit and remove full lock" },
    cancel: { ar: "إلغاء", en: "Cancel" }
  };
  var pin = { open: false, code: "" };
  var bridge = function () { return window.Android || null; };
  function pinDraw() {
    var dots = ""; for (var i = 0; i < 5; i++) dots += '<i class="' + (i < pin.code.length ? "on" : "") + '"></i>';
    $("pinDots").innerHTML = dots;
  }
  window.vxPin = function () {
    pin.open = true; pin.code = "";
    $("pinT").textContent = t(PX.title); $("pinMsg").textContent = ""; $("pinExit").innerHTML = "";
    var k = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "x", "0", "<"], html = "";
    k.forEach(function (d) { html += '<button data-k="' + d + '">' + (d === "x" ? t(PX.cancel) : d === "<" ? "⌫" : d) + "</button>"; });
    $("pinKeys").innerHTML = html; $("pinKeys").style.display = "";
    pinDraw(); $("pin").className = "pin on";
  };
  function closePin() {
    pin.open = false; pin.code = ""; $("pin").className = "pin";
    var b = bridge(); try { if (b && b.pinClosed) b.pinClosed(); } catch (e) { /* */ }
  }
  function pinKey(d) {
    if (d === "x") { closePin(); return; }
    if (d === "<") { pin.code = pin.code.slice(0, -1); pinDraw(); return; }
    if (pin.code.length >= 5) return;
    pin.code += d; pinDraw();
    if (pin.code.length < 5) return;
    var b = bridge(), ok = false;
    try { ok = b && b.tryPin ? b.tryPin(pin.code) : pin.code === "12345"; } catch (e) { ok = false; }
    L("exit_code", { ok: !!ok });
    if (!ok) {
      $("pinMsg").textContent = t(PX.bad); $("pin").className = "pin on shake";
      setTimeout(function () { pin.code = ""; pinDraw(); $("pin").className = "pin on"; }, 500);
      return;
    }
    var owner = false; try { owner = b && b.isOwner ? b.isOwner() : false; } catch (e) { /* */ }
    $("pinKeys").style.display = "none"; $("pinMsg").textContent = "";
    $("pinExit").innerHTML = '<button class="go" data-x="0">' + t(PX.exit) + "</button>" +
      (owner ? '<button data-x="1">' + t(PX.exitAll) + "</button>" : "") + '<button data-x="c">' + t(PX.cancel) + "</button>";
  }
  $("pinKeys").onclick = function (e) { var k = e.target.getAttribute && e.target.getAttribute("data-k"); if (k) pinKey(k); };
  $("pinExit").onclick = function (e) {
    var x = e.target.getAttribute && e.target.getAttribute("data-x"); if (!x) return;
    if (x === "c") { closePin(); return; }
    L("exit", { removeFullLock: x === "1" }); try { window.VXLOG && window.VXLOG.flush(); } catch (e2) { /* */ }
    var b = bridge(); if (b && b.exit) setTimeout(function () { b.exit(x === "1"); }, 800); else closePin();
  };
  window.vxMode = function () { return st.mode; };
  window.addEventListener("resize", function () { if (st.mode !== "menu") draw(); });

  var lastAlert = {};
  function snapshot() {
    var d = st.day, rows = {}, E = env();
    crewData().forEach(function (c, i) {
      var s = status(c.id, d);
      rows[c.id] = { name: crewMeta[i].name.en, hr: c.hr[d], status: String(s) };
      if (s !== "calib" && s >= 2 && lastAlert[c.id] !== d) {
        if (lastAlert[c.id] == null || d < lastAlert[c.id] || d - lastAlert[c.id] > 3) { var tc = topCh(c.id, d); L("alert", { crew: c.id, name: crewMeta[i].name.en, date: R.dates[d], level: s, channel: tc && tc.id, test: st.test }); }
        lastAlert[c.id] = d;
      }
    });
    if (d % 5 === 0) L("day_snapshot", { mode: st.mode, mission: R.mission, date: R.dates[d], test: st.test, co2: E.co2.v[d], temp: E.temp.v[d], hum: E.hum.v[d], rad: E.rad.v[d], crew: rows });
  }
  function draw() { if (st.mode === "watch") drawWatch(); else if (st.mode === "ground") drawGround(); if (st.mode !== "menu") snapshot(); }

  // ---------- القائمة ----------
  function renderMenu() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    $("bWatch").innerHTML = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="#6fe3ff" stroke-width="1.6"><rect x="6" y="5" width="12" height="14" rx="3"/><path d="M9 5V2h6v3M9 19v3h6v-3M10 12h2l1-2 1 4 1-2h1"/></svg><b>' + t(TX.watch) + "</b><small>" + t(TX.watchSub) + "</small>";
    $("bGround").innerHTML = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="#6fe3ff" stroke-width="1.6"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4M5 13l4-4 3 3 5-5"/></svg><b>' + t(TX.ground) + "</b><small>" + t(TX.groundSub) + "</small>";
    $("team").textContent = lang === "ar" ? "فريق NovaCare" : "Team NovaCare";
    $("note").innerHTML = '<span class="tag-real">' + t(TX.real) + " RR-12</span> " + t(TX.note);
    $("langBtn").textContent = lang === "ar" ? "English" : "العربية";
  }

  // ---------- رسم ----------
  function canvasCtx(cv) {
    var r = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return null;
    cv.width = Math.round(W * r); cv.height = Math.round(H * r);
    var g = cv.getContext("2d"); g.setTransform(r, 0, 0, r, 0, 0);
    return { g: g, W: W, H: H };
  }
  function hexA(h, a) { var n = parseInt(h.slice(1), 16); return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")"; }
  function dash(g, a) { if (g.setLineDash) g.setLineDash(a); }

  function drawRing(cv, frac, col) {
    var s = canvasCtx(cv); if (!s) return;
    var g = s.g, cx = s.W / 2, cy = s.H / 2, R0 = Math.min(cx, cy) - s.W * .06, lw = s.W * .07;
    g.lineCap = "round"; g.lineWidth = lw;
    g.strokeStyle = "rgba(255,255,255,.08)"; g.beginPath(); g.arc(cx, cy, R0, 0, Math.PI * 2); g.stroke();
    g.save(); g.shadowColor = col; g.shadowBlur = s.W * .06; g.strokeStyle = col;
    g.beginPath(); g.arc(cx, cy, R0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); g.stroke(); g.restore();
    g.lineWidth = 1.5; g.strokeStyle = "rgba(255,255,255,.18)";
    for (var k = 0; k < 60; k++) { var a = k / 60 * Math.PI * 2, r1 = R0 + lw * .9, r2 = r1 + (k % 5 ? 4 : 9);
      g.beginPath(); g.moveTo(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)); g.lineTo(cx + r2 * Math.cos(a), cy + r2 * Math.sin(a)); g.stroke(); }
  }
  // خط صغير: CO2 الحقيقي حتى اليوم مع خط الحد
  function drawSpark(cv, s, d, col) {
    var c = canvasCtx(cv); if (!c) return;
    var g = c.g, pts = [];
    for (var i = 0; i <= d; i++) if (s.v[i] != null) pts.push([i, s.v[i]]);
    if (pts.length < 2) return;
    var lo = Infinity, hi = -Infinity; s.v.forEach(function (v) { if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v); } });
    if (s.limit != null) hi = Math.max(hi, s.limit);
    var X = function (i) { return i / (N - 1) * (c.W - 6) + 3; }, Y = function (v) { return 4 + (1 - (v - lo) / (hi - lo)) * (c.H - 8); };
    if (s.limit != null) { g.strokeStyle = "rgba(255,181,71,.7)"; g.lineWidth = 1; dash(g, [4, 3]); g.beginPath(); g.moveTo(0, Y(s.limit)); g.lineTo(c.W, Y(s.limit)); g.stroke(); dash(g, []); }
    var grd = g.createLinearGradient(0, 0, 0, c.H); grd.addColorStop(0, hexA(col, .35)); grd.addColorStop(1, hexA(col, 0));
    g.fillStyle = grd; g.beginPath(); g.moveTo(X(pts[0][0]), c.H); pts.forEach(function (p) { g.lineTo(X(p[0]), Y(p[1])); }); g.lineTo(X(pts[pts.length - 1][0]), c.H); g.fill();
    g.strokeStyle = col; g.lineWidth = 2; g.lineJoin = "round"; g.beginPath(); pts.forEach(function (p, k) { k ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1])); }); g.stroke();
    var p = pts[pts.length - 1]; g.fillStyle = col; g.beginPath(); g.arc(X(p[0]), Y(p[1]), 3.5, 0, 7); g.fill();
  }
  // الرسم الرئيسي: القراءة الحقيقية + خط الأساس + الحد الثابت + توقع 14 يومًا + التنبيهات
  function drawChart(cv, s, d) {
    var c = canvasCtx(cv); if (!c) return;
    var g = c.g, W = c.W, H = c.H, pad = { l: 36, r: 8, t: 14, b: 18 }, M = N - 1 + HOR, fc = d >= BASE ? forecast(s, d) : null;
    var vals = [s.med + 3.4 * s.scale, s.med - 3.4 * s.scale];
    s.v.forEach(function (v) { if (v != null) vals.push(v); });
    if (s.limit != null) vals.push(s.limit);
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), sp = (hi - lo) * .06 || 1; lo -= sp; hi += sp;
    var X = function (i) { return pad.l + i / M * (W - pad.l - pad.r); }, Y = function (v) { return pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b); };
    g.font = "10px monospace"; g.fillStyle = "#95a3c0"; g.textAlign = "right";
    for (var k = 0; k <= 3; k++) { var v = lo + k / 3 * (hi - lo), y = Y(v); g.strokeStyle = "rgba(255,255,255,.06)"; g.beginPath(); g.moveTo(pad.l, y); g.lineTo(W - pad.r, y); g.stroke(); g.fillText(v.toFixed(s.dec >= 3 ? 2 : s.dec >= 1 ? 1 : 0), pad.l - 4, y + 3); }
    g.textAlign = "center"; for (var x = 0; x < N; x += 7) g.fillText(md(x), X(x), H - 4);
    // أيام خط الأساس + منطقة التوقع
    g.fillStyle = "rgba(165,175,196,.08)"; g.fillRect(X(0), pad.t, X(BASE - .5) - X(0), H - pad.t - pad.b);
    g.fillStyle = "rgba(95,212,255,.05)"; g.fillRect(X(N - 1), pad.t, X(M) - X(N - 1), H - pad.t - pad.b);
    // نطاق خط الأساس الشخصي
    g.fillStyle = "rgba(95,212,255,.15)"; g.fillRect(X(BASE), Y(s.med + 3 * s.scale), X(Math.min(M, d + HOR)) - X(BASE), Y(s.med - 3 * s.scale) - Y(s.med + 3 * s.scale));
    // الحد الثابت
    if (s.limit != null) { g.strokeStyle = "#ffb547"; dash(g, [6, 4]); g.lineWidth = 1.3; g.beginPath(); g.moveTo(pad.l, Y(s.limit)); g.lineTo(W - pad.r, Y(s.limit)); g.stroke(); dash(g, []); }
    // القراءات
    var last = -1; g.strokeStyle = "#e7ecf7"; g.lineWidth = 1.8; g.lineJoin = "round"; g.beginPath();
    for (var i = 0, on = false; i <= d; i++) { if (s.v[i] == null) { on = false; continue; } on ? g.lineTo(X(i), Y(s.v[i])) : g.moveTo(X(i), Y(s.v[i])); on = true; last = i; }
    g.stroke();
    // التوقع
    if (fc && last >= 0) {
      g.save(); g.beginPath(); g.rect(pad.l, pad.t, W - pad.l - pad.r, H - pad.t - pad.b); g.clip();
      g.strokeStyle = "#5fd4ff"; g.lineWidth = 1.8; dash(g, [4, 4]); g.beginPath(); g.moveTo(X(last), Y(fc.at(last))); g.lineTo(X(last + HOR), Y(fc.at(last + HOR))); g.stroke(); dash(g, []);
      if (fc.days != null) { var dx = last + fc.days; g.fillStyle = "#ff5d6c"; g.beginPath(); g.arc(X(dx), Y(fc.at(dx)), 4, 0, 7); g.fill(); }
      g.restore();
    }
    if (last >= 0) { g.fillStyle = "#fff"; g.beginPath(); g.arc(X(last), Y(s.v[last]), 3.8, 0, 7); g.fill(); }
    // التنبيهات (كل صعود في المستوى)
    for (i = BASE; i <= d; i++) {
      var l = s.lvl[i] || 0, pl = i ? s.lvl[i - 1] || 0 : 0;
      if (l >= 2 && l > pl) { var col = COL[l]; g.strokeStyle = col; g.lineWidth = 1.5; dash(g, [3, 3]); g.beginPath(); g.moveTo(X(i), pad.t); g.lineTo(X(i), H - pad.b); g.stroke(); dash(g, []);
        g.fillStyle = col; g.beginPath(); g.arc(X(i), pad.t + 2, 3.5, 0, 7); g.fill(); }
    }
  }

  // تحريك الأرقام بسلاسة
  var tw = {};
  function tween(el, to, dec) {
    if (to == null || isNaN(to)) { el.textContent = "—"; tw[el.id] = null; return; }
    var from = tw[el.id], t0 = Date.now();
    tw[el.id] = to;
    if (from == null) { el.textContent = Number(to).toFixed(dec); return; }
    (function step() { var k = Math.min(1, (Date.now() - t0) / 450), e = 1 - Math.pow(1 - k, 3); el.textContent = (from + (to - from) * e).toFixed(dec); if (k < 1 && tw[el.id] === to) setTimeout(step, 30); })();
  }

  function advisorHtml(tc) {
    if (!tc) return '<div class="adv calm"><span class="orb">' + SV(VI.ok) + "</span><small>" + t(AD.ok) + "</small></div>";
    var a = AD.ch[tc.id], node = function (icon, txt) { return '<span class="an"><span class="orb">' + icon + "</span><small>" + t(txt) + "</small></span>"; }, arr = '<i class="aa"></i>';
    return '<div class="adv" style="color:' + COL[tc.l] + '">' + node(SV(VI[tc.id]), a.what) + arr + node(SV(VI.risk[tc.id]), a.risk) + arr + node(SV(VI.act[tc.id]), a.act) + "</div>";
  }

  // ---------- ساعة الرائد ----------
  function drawWatch() {
    var d = st.day, M = member(st.member), c = M.d, s = status(c.id, d), col = COL[s], E = env();
    var z = c.z[d], frac = s === "calib" ? .12 : Math.max(.06, Math.min(1, ((z == null ? 0 : Math.abs(z)) + 1) / 5));
    $("wDay").innerHTML = '<span class="tag-real">RR-12</span> <b class="mono">' + md(d) + '</b><span class="mono dim">' + (d + 1) + "/" + N + "</span>";
    $("wName").textContent = t(M.m.name);
    $("wLab").innerHTML = SV(VI.hr) + t(TX.hr) + ' <span class="tag-sim">' + t(TX.sim) + "</span>";
    tween($("wHr"), c.hr[d], 0);
    var tile = function (id, ch, v, dec, unit) { var l = s === "calib" ? 0 : lvlAt(ch, d); return '<i style="color:' + (l >= 2 ? COL[l] : "") + '">' + SV(VI[id]) + '</i><b class="mono">' + fmt(v, dec) + "<em>" + unit + "</em></b>"; };
    $("wSleep").innerHTML = tile("co2", E.co2, E.co2.v[d], 2, "mmHg");
    $("wCo2").innerHTML = tile("temp", E.temp, E.temp.v[d], 1, "°C");
    $("wDose").innerHTML = tile("rad", E.rad, E.rad.cum[d], 1, "mGy");
    var stEl = $("wState"); stEl.textContent = t(S.status[s]); stEl.style.background = col; stEl.style.boxShadow = "0 0 22px " + hexA(col, .55);
    $("wWhy").innerHTML = s === "calib" ? t(S.phase.calib) : advisorHtml(topCh(c.id, d));
    $("wTag").innerHTML = '<span class="tag-real">' + t(TX.real) + "</span> CO2 · " + t(TX.temp) + " · " + t(TX.rad) + (st.test ? ' · <span class="tag-sim">' + t(TX.test) + "</span>" : "");
    drawRing($("wRing"), frac, col);
    drawSpark($("wSpark"), E.co2, d, col === COL.calib ? "#5fd4ff" : col);
  }

  // ---------- لوحة الأرض ----------
  function drawGround() {
    var d = st.day, E = env();
    $("gTitle").textContent = t(TX.groundTitle);
    $("gDay").innerHTML = '<span class="tag-real">RR-12</span> <b class="mono">' + R.dates[d] + '</b> <span class="mono">' + (d + 1) + "/" + N + "</span>";
    $("gTest").className = "tbtn" + (st.test ? " on" : ""); $("gTest").innerHTML = SV(VI.flask); $("gTest").title = t(TX.test);
    $("gCrew").innerHTML = crewData().map(function (c, i) {
      var m = crewMeta[i], s = status(c.id, d), k = connOf(m.seed, d);
      return '<button class="cr' + (c.id === st.gMember ? " on" : "") + '" data-m="' + c.id + '"><span class="av" style="border-color:' + COL[s] + ';color:' + COL[s] + '">' + c.id + "</span>" +
        '<span class="nm">' + t(m.name) + '<small style="color:' + COL[s] + '">' + t(S.status[s]) + "</small></span>" +
        '<span class="cn" style="color:' + ["#3ddc97", "#ffb547", "#ff5d6c"][k] + '" title="' + t(TX.conn[k]) + '">' + SV(k === 2 ? '<path d="M4 20h.01M3 3l18 18M9 20v-4M14 20v-6"/>' : '<path d="M4 20v-2"/><path d="M9 20v-6"/><path d="M14 20v-10"' + (k ? ' opacity=".25"' : "") + '/><path d="M19 20V5"' + (k ? ' opacity=".25"' : "") + "/>") + "</span>" +
        '<span class="v mono">' + fmt(c.hr[d], 0) + "<em>bpm</em></span></button>";
    }).join("");
    var M = member(st.gMember), ch = st.ch, s = series(ch, M.d.id), lv = d < BASE ? 0 : lvlAt(s, d);
    $("gChips").innerHTML = CHS.map(function (k) {
      var l = d < BASE ? 0 : lvlAt(series(k, M.d.id), d);
      return '<button class="chip' + (k === ch ? " on" : "") + '" data-c="' + k + '" title="' + t(TX.chT[k]) + '" style="color:' + (l >= 2 ? COL[l] : "") + '">' + SV(VI[k]) + "</button>";
    }).join("");
    var val = s.v[d], tag = ch === "hr" ? '<span class="tag-sim">' + t(TX.sim) + "</span>" : '<span class="tag-real">' + t(TX.real) + "</span>";
    $("gChartT").innerHTML = '<span class="ct">' + (ch === "hr" ? t(M.m.name) + " · " : "") + t(TX.chT[ch]) + " " + tag + (st.test && ch === "co2" ? ' <span class="tag-sim">' + t(TX.test) + "</span>" : "") + "</span>" +
      '<b class="cv mono" style="color:' + (lv >= 2 ? COL[lv] : "#fff") + '">' + (ch === "rad" ? fmt(s.cum[d], 2) + "<em>mGy Σ</em>" : fmt(val, s.dec) + "<em>" + s.unit + "</em>") + "</b>";
    $("gLegend").innerHTML = '<i style="background:#e7ecf7"></i>' + t(TX.chT[ch]) + ' <i style="background:rgba(95,212,255,.5)"></i>' + t(TX.band) +
      (s.limit != null ? ' <i style="background:#ffb547"></i>' + t(TX.fixedThr) + ' <span class="mono">' + s.limit + "</span>" : "") + ' <i class="dsh"></i>' + t(TX.fc) +
      '<span class="gn">' + (st.test ? t(TX.testNote) : t(TX.gNote)) + "</span>";
    // 1) التحقق
    var v = R.val[d];
    $("gOurs").innerHTML = "<small>" + SV(VI.filter) + t(TX.val) + '</small><b class="mono">' + nf(v.checked) + "</b>" +
      '<span class="vrow"><span title="stuck">' + SV(VI.stuck) + '<em class="mono">' + nf(v.stuck) + '</em></span><span title="spike">' + SV(VI.spike) + '<em class="mono">' + v.spike + '</em></span><span title="gap">' + SV(VI.gap) + '<em class="mono">' + v.gap + "</em></span></span>";
    // 2) التوقع
    var fc = d >= BASE ? forecast(s, d) : null, ftxt;
    if (!fc) ftxt = '<b style="color:#a5afc4">' + t(TX.fcWait) + "</b>";
    else if (fc.days != null) ftxt = '<b style="color:#ff5d6c">' + t(fc.kind === "limit" ? TX.fcLimit : TX.fcBand) + ' <span class="mono">' + fc.days + "</span> " + dWord(fc.days) + "</b>";
    else ftxt = '<b style="color:#3ddc97">' + t(TX.fcOk) + "</b>";
    $("gFixed").innerHTML = "<small>" + SV(VI.fc) + t(TX.fcHead) + "</small>" + ftxt;
    // 3) المستشار الذكي
    var tc = d < BASE ? null : topCh(M.d.id, d);
    $("gAlert").innerHTML = "<small>" + SV(VI.spark) + t(AD.head) + ' · <span class="tag-sim">' + t(AD.tag) + "</span> · " + t(AD.foot) + "</small>" + advisorHtml(tc);
    drawChart($("gCv"), s, d);
  }

  // ---------- الأحداث ----------
  $("bWatch").onclick = function () { setMode("watch"); };
  $("bGround").onclick = function () { setMode("ground"); };
  $("langBtn").onclick = function () { lang = lang === "ar" ? "en" : "ar"; L("lang", { lang: lang }); try { localStorage.setItem("vx-phone-lang", lang); } catch (e) { /* */ } renderMenu(); };
  $("watch").onclick = function () { st.playing = !st.playing; $("watch").className = "view on" + (st.playing ? "" : " paused"); };
  $("gCrew").onclick = function (e) { var b = e.target; while (b && !(b.getAttribute && b.getAttribute("data-m"))) b = b.parentNode; if (b) { st.gMember = b.getAttribute("data-m"); L("select_crew", { crew: st.gMember }); drawGround(); } };
  $("gChips").onclick = function (e) { e.stopPropagation(); var b = e.target; while (b && !(b.getAttribute && b.getAttribute("data-c"))) b = b.parentNode; if (b) { st.ch = b.getAttribute("data-c"); L("select_channel", { ch: st.ch }); drawGround(); } };
  $("gTest").onclick = function (e) { e.stopPropagation(); st.test = !st.test; L("drift_test", { on: st.test }); drawGround(); };
  $("gMain").onclick = function () { st.playing = !st.playing; $("ground").className = "view on" + (st.playing ? "" : " paused"); };
  // بدون جسر أندرويد (في المتصفح): زر Esc يرجع
  var escT = 0, escLong = false;
  document.addEventListener("keydown", function (e) { if (e.keyCode === 27 && !escT) { escLong = false; escT = setTimeout(function () { escLong = true; window.vxPin(); }, 700); } });
  document.addEventListener("keyup", function (e) { if (e.keyCode === 27) { clearTimeout(escT); escT = 0; if (!escLong) window.vxBack(); } });
  var q = (location.hash || "").slice(1).split(",");
  if (q[1]) st.ch = q[1];
  if (q[2] === "test") st.test = true;
  setMode(q[0] === "watch" || q[0] === "ground" ? q[0] : "menu");
  if (q[3] != null && q[3] !== "") { st.day = Math.min(N - 1, +q[3]); st.playing = false; setTimeout(draw, 120); }
})();
