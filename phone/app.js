/* VITALX — تطبيق الهاتف: شاشة اختيار، ساعة الرائد، لوحة الأرض. الحساب كله من engine.js */
(function () {
  "use strict";
  var C = window.VITALX_CONTENT, E = window.VITALX_ENGINE, S = C.site, sim = C.sim, D = sim.missionDays;
  var $ = function (id) { return document.getElementById(id); };
  var lang = "ar";
  try { lang = localStorage.getItem("vx-phone-lang") || "ar"; } catch (e) { /* */ }
  var t = function (x) { return x && typeof x === "object" ? (x[lang] != null ? x[lang] : x.ar) : String(x == null ? "" : x); };
  var fmt = function (v, d) { return v == null || isNaN(v) ? "—" : Number(v).toFixed(d); };
  var COL = { 0: "#3ddc97", 1: "#6aa8ff", 2: "#ffb547", 3: "#ff5d6c", calib: "#a5afc4" };
  var TX = {
    watch: { ar: "ساعة الرائد", en: "Astronaut watch" }, watchSub: { ar: "ما يراه الرائد على معصمه", en: "What the astronaut sees on the wrist" },
    ground: { ar: "لوحة الأرض", en: "Ground dashboard" }, groundSub: { ar: "بيانات الطاقم كما يراها الفريق الطبي", en: "Crew data as the medical team sees it" },
    groundTitle: { ar: "مركز المتابعة الطبية", en: "Medical monitoring center" },
    hr: { ar: "نبض الراحة", en: "Resting HR" }, sleep: { ar: "النوم", en: "Sleep" }, co2: { ar: "CO2", en: "CO2" }, dose: { ar: "الجرعة", en: "Dose" },
    day: { ar: "اليوم", en: "Day" }, why: { ar: "السبب:", en: "Reason:" },
    ours: { ar: "VITALX كشف", en: "VITALX caught it" }, fixed: { ar: "الحد الثابت كشف", en: "Fixed limit caught it" },
    notYet: { ar: "لم يكشف بعد", en: "Not yet" }, lastAlert: { ar: "آخر تنبيه", en: "Last alert" }, none: { ar: "لا يوجد", en: "None" },
    band: { ar: "خط الأساس الشخصي", en: "Personal baseline" }, fixedThr: { ar: "الحد الثابت", en: "Fixed limit" },
    note: { ar: "بيانات مولّدة · أداة دعم قرار وليست تشخيصاً", en: "Synthetic data · decision support, not diagnosis" }
  };

  // ---------- الحساب ----------
  var crew = S.crew.map(function (m) {
    var ast = E.generateAstronaut(sim, E.mulberry32(m.seed * 7919 + 1), { driftMult: m.driftMult, noiseMult: m.noiseMult, onset: m.onset });
    var pers = E.runPersonal(ast, sim), fx = E.runFixed(ast, sim);
    var first = function (lv) { for (var i = ast.onset; i < D; i++) if (lv[i] >= 2) return i; return null; };
    return { m: m, ast: ast, pers: pers, fx: fx, ours: first(pers.level), fixedDet: first(fx.level) };
  });
  function status(c, d) {
    if (d < c.pers.active) return "calib";
    var l = 0; for (var i = Math.max(c.pers.active, d - 2); i <= d; i++) l = Math.max(l, c.pers.level[i]);
    return l;
  }
  function reason(c, d) {
    for (var i = d; i >= c.pers.active && i > d - 6; i--) {
      var ex = c.pers.explain[i];
      if (ex) {
        var bad = ex.filter(function (x) { return x.bad > 0; }), tot = 0;
        bad.forEach(function (x) { tot += x.bad * x.w; });
        bad.sort(function (a, b) { return b.bad * b.w - a.bad * a.w; });
        if (bad.length) return t(sim.channels[bad[0].id].name) + " " + Math.round(bad[0].bad * bad[0].w / tot * 100) + "%";
      }
    }
    return "";
  }

  // ---------- الحالة والتشغيل ----------
  var L = function (type, data) { try { if (window.VXLOG) window.VXLOG.log(type, data); } catch (e) { /* */ } };
  var st = { mode: "menu", day: 40, playing: true, member: "A", gMember: "A" };
  var timer = null;
  function setMode(m) {
    if (m !== st.mode) L("screen", { from: st.mode, to: m });
    st.mode = m;
    ["menu", "watch", "ground"].forEach(function (k) { $(k).className = "view" + (k === m ? " on" : ""); });
    try { if (window.Android && window.Android.setMode) window.Android.setMode(m); } catch (e) { /* */ }
    clearInterval(timer);
    if (m !== "menu") {
      st.day = 45; st.playing = true;
      timer = setInterval(function () { if (st.playing) { st.day = st.day >= D - 1 ? 45 : st.day + 1; draw(); } }, m === "watch" ? 1400 : 900);
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
    var d = st.day, rows = {};
    crew.forEach(function (c) {
      var s = status(c, d), o = c.ast.obs;
      var r2 = function (v) { return v == null || isNaN(v) ? null : Math.round(v * 100) / 100; };
      rows[c.m.id] = { name: c.m.name.en, hr: r2(o.hr[d]), sleep: r2(o.sleep[d]), co2: r2(o.co2[d]), dose: r2(c.ast.rad[d]), composite: r2(c.pers.composite[d]), status: String(s) };
      if (s !== "calib" && s >= 2 && lastAlert[c.m.id] !== d) {
        if (lastAlert[c.m.id] == null || d < lastAlert[c.m.id] || d - lastAlert[c.m.id] > 3) L("alert", { crew: c.m.id, name: c.m.name.en, day: d, level: s, reason: reason(c, d) });
        lastAlert[c.m.id] = d;
      }
    });
    if (d % 5 === 0) L("day_snapshot", { mode: st.mode, day: d, crew: rows });
  }
  function draw() { if (st.mode === "watch") drawWatch(); else if (st.mode === "ground") drawGround(); if (st.mode !== "menu") snapshot(); }

  // ---------- القائمة ----------
  function renderMenu() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    $("bWatch").innerHTML = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="#6fe3ff" stroke-width="1.6"><rect x="6" y="5" width="12" height="14" rx="3"/><path d="M9 5V2h6v3M9 19v3h6v-3M10 12h2l1-2 1 4 1-2h1"/></svg><b>' + t(TX.watch) + "</b><small>" + t(TX.watchSub) + "</small>";
    $("bGround").innerHTML = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="#6fe3ff" stroke-width="1.6"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4M5 13l4-4 3 3 5-5"/></svg><b>' + t(TX.ground) + "</b><small>" + t(TX.groundSub) + "</small>";
    $("team").textContent = lang === "ar" ? "فريق NovaCare" : "Team NovaCare";
    $("note").textContent = t(TX.note);
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

  function drawRing(cv, frac, col) {
    var s = canvasCtx(cv); if (!s) return;
    var g = s.g, cx = s.W / 2, cy = s.H / 2, R = Math.min(cx, cy) - s.W * .06, lw = s.W * .07;
    g.lineCap = "round"; g.lineWidth = lw;
    g.strokeStyle = "rgba(255,255,255,.08)"; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
    g.save(); g.shadowColor = col; g.shadowBlur = s.W * .06; g.strokeStyle = col;
    g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); g.stroke(); g.restore();
    // علامات خفيفة
    g.lineWidth = 1.5; g.strokeStyle = "rgba(255,255,255,.18)";
    for (var k = 0; k < 60; k++) { var a = k / 60 * Math.PI * 2, r1 = R + lw * .9, r2 = r1 + (k % 5 ? 4 : 9);
      g.beginPath(); g.moveTo(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)); g.lineTo(cx + r2 * Math.cos(a), cy + r2 * Math.sin(a)); g.stroke(); }
  }
  function drawSpark(cv, data, d, col, minFrom) {
    var s = canvasCtx(cv); if (!s) return;
    var g = s.g, from = Math.max(minFrom || 0, d - 45), pts = [];
    for (var i = from; i <= d; i++) if (data[i] != null) pts.push([i, data[i]]);
    if (pts.length < 2) return;
    var lo = Infinity, hi = -Infinity; pts.forEach(function (p) { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); }); if (hi === lo) hi = lo + 1;
    var X = function (i) { return (i - from) / Math.max(1, d - from) * (s.W - 6) + 3; }, Y = function (v) { return 4 + (1 - (v - lo) / (hi - lo)) * (s.H - 8); };
    var grd = g.createLinearGradient(0, 0, 0, s.H); grd.addColorStop(0, hexA(col, .35)); grd.addColorStop(1, hexA(col, 0));
    g.fillStyle = grd; g.beginPath(); g.moveTo(X(pts[0][0]), s.H); pts.forEach(function (p) { g.lineTo(X(p[0]), Y(p[1])); }); g.lineTo(X(pts[pts.length - 1][0]), s.H); g.fill();
    g.strokeStyle = col; g.lineWidth = 2; g.lineJoin = "round"; g.beginPath(); pts.forEach(function (p, k) { k ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1])); }); g.stroke();
    var p = pts[pts.length - 1]; g.fillStyle = col; g.beginPath(); g.arc(X(p[0]), Y(p[1]), 3.5, 0, 7); g.fill();
  }
  function drawChart(cv, c, d) {
    var s = canvasCtx(cv); if (!s) return;
    var g = s.g, W = s.W, H = s.H, pad = { l: 34, r: 8, t: 14, b: 18 }, hr = c.ast.obs.hr, pers = c.pers, fixedV = sim.fixed.thresholds.hr.value;
    var vals = [fixedV]; for (var i = 0; i <= d; i++) vals.push(hr[i]);
    var lo = Math.min.apply(null, vals) - 3, hi = Math.max.apply(null, vals) + 3;
    var X = function (i) { return pad.l + i / (D - 1) * (W - pad.l - pad.r); }, Y = function (v) { return pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b); };
    g.font = "10px monospace"; g.fillStyle = "#95a3c0"; g.textAlign = "right";
    for (var k = 0; k <= 3; k++) { var v = lo + k / 3 * (hi - lo), y = Y(v); g.strokeStyle = "rgba(255,255,255,.06)"; g.beginPath(); g.moveTo(pad.l, y); g.lineTo(W - pad.r, y); g.stroke(); g.fillText(v.toFixed(0), pad.l - 4, y + 3); }
    g.textAlign = "center"; for (var x = 0; x < D; x += 20) g.fillText(x, X(x), H - 4);
    g.fillStyle = "rgba(165,175,196,.08)"; g.fillRect(X(0), pad.t, X(sim.adaptation.days) - X(0), H - pad.t - pad.b);
    // نطاق خط الأساس
    g.fillStyle = "rgba(95,212,255,.16)"; g.beginPath(); var st0 = pers.active, last = Math.min(d, D - 1);
    if (last > st0) {
      for (i = st0; i <= last; i++) { var b = pers.band.hr[i]; i === st0 ? g.moveTo(X(i), Y(b.med + 3 * b.scale)) : g.lineTo(X(i), Y(b.med + 3 * b.scale)); }
      for (i = last; i >= st0; i--) { b = pers.band.hr[i]; g.lineTo(X(i), Y(b.med - 3 * b.scale)); }
      g.closePath(); g.fill();
    }
    // الحد الثابت
    g.strokeStyle = "#ffb547"; g.setLineDash && g.setLineDash([6, 4]); g.lineWidth = 1.3;
    g.beginPath(); g.moveTo(pad.l, Y(fixedV)); g.lineTo(W - pad.r, Y(fixedV)); g.stroke(); g.setLineDash && g.setLineDash([]);
    // القراءات
    g.strokeStyle = "#e7ecf7"; g.lineWidth = 1.7; g.lineJoin = "round"; g.beginPath();
    for (i = 0; i <= last; i++) i ? g.lineTo(X(i), Y(hr[i])) : g.moveTo(X(i), Y(hr[i])); g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(X(last), Y(hr[last]), 3.5, 0, 7); g.fill();
    // خطوط الكشف
    function vline(day, col, lab) {
      if (day == null || day > d) return;
      g.strokeStyle = col; g.lineWidth = 1.5; g.setLineDash && g.setLineDash([3, 3]); g.beginPath(); g.moveTo(X(day), pad.t); g.lineTo(X(day), H - pad.b); g.stroke(); g.setLineDash && g.setLineDash([]);
      g.fillStyle = col; g.font = "bold 10px sans-serif"; g.fillText(lab, X(day), pad.t - 3);
    }
    vline(c.ours, "#5fd4ff", "VITALX"); vline(c.fixedDet, "#ffb547", t(TX.fixedThr));
  }

  // ---------- ساعة الرائد ----------
  function drawWatch() {
    var c = crew.filter(function (x) { return x.m.id === st.member; })[0], d = st.day, s = status(c, d), col = COL[s];
    var comp = c.pers.composite[d], frac = s === "calib" ? .12 : Math.max(.06, Math.min(1, ((comp == null ? 0 : comp) + 1) / 5));
    $("wDay").innerHTML = t(TX.day) + ' <b class="mono">' + d + "</b>";
    $("wName").textContent = t(c.m.name);
    $("wLab").textContent = t(TX.hr);
    $("wHr").textContent = fmt(c.ast.obs.hr[d], 0);
    $("wSleep").innerHTML = '<i>' + t(TX.sleep) + '</i><b class="mono">' + fmt(c.ast.obs.sleep[d], 1) + "<em>h</em></b>";
    $("wCo2").innerHTML = '<i>' + t(TX.co2) + '</i><b class="mono">' + fmt(c.ast.obs.co2[d], 2) + "<em>mmHg</em></b>";
    $("wDose").innerHTML = '<i>' + t(TX.dose) + '</i><b class="mono">' + fmt(c.ast.rad[d], 1) + "<em>mSv</em></b>";
    var stEl = $("wState"); stEl.textContent = t(S.status[s]); stEl.style.background = col; stEl.style.boxShadow = "0 0 22px " + hexA(col, .55);
    var r = s !== "calib" && s >= 1 ? reason(c, d) : "";
    $("wWhy").textContent = r ? t(TX.why) + " " + r : (s === "calib" ? t(S.phase.calib) : t(S.phase.watch));
    drawRing($("wRing"), frac, col);
    drawSpark($("wSpark"), c.pers.composite, d, col, c.pers.active);
  }

  // ---------- لوحة الأرض ----------
  function drawGround() {
    var d = st.day;
    $("gTitle").textContent = t(TX.groundTitle);
    $("gDay").innerHTML = t(TX.day) + ' <b class="mono">' + d + '</b><span class="mono">/' + (D - 1) + "</span>";
    $("gCrew").innerHTML = crew.map(function (c) {
      var s = status(c, d);
      return '<button class="cr' + (c.m.id === st.gMember ? " on" : "") + '" data-m="' + c.m.id + '"><span class="av" style="border-color:' + COL[s] + ';color:' + COL[s] + '">' + c.m.id + "</span>" +
        '<span class="nm">' + t(c.m.name) + '<small style="color:' + COL[s] + '">' + t(S.status[s]) + "</small></span>" +
        '<span class="v mono">' + fmt(c.ast.obs.hr[d], 0) + "<em>bpm</em></span></button>";
    }).join("");
    var c = crew.filter(function (x) { return x.m.id === st.gMember; })[0], s = status(c, d);
    $("gChartT").innerHTML = t(c.m.name) + " · " + t(TX.hr) + " <span>" + t(c.m.role) + "</span>";
    $("gLegend").innerHTML = '<i style="background:#e7ecf7"></i>' + t(TX.hr) + ' <i style="background:rgba(95,212,255,.5)"></i>' + t(TX.band) + ' <i style="background:#ffb547"></i>' + t(TX.fixedThr);
    var det = function (day) { return day != null && day <= d ? t(TX.day) + ' <span class="mono">' + day + "</span>" : t(TX.notYet); };
    $("gOurs").innerHTML = "<small>" + t(TX.ours) + '</small><b style="color:#5fd4ff">' + det(c.ours) + "</b>";
    $("gFixed").innerHTML = "<small>" + t(TX.fixed) + '</small><b style="color:#ffb547">' + det(c.fixedDet) + "</b>";
    var r = s !== "calib" && s >= 1 ? reason(c, d) : "";
    $("gAlert").innerHTML = "<small>" + t(TX.lastAlert) + '</small><b style="color:' + COL[s] + '">' + (r ? t(S.status[s]) + " · " + r : t(TX.none)) + "</b>";
    drawChart($("gCv"), c, d);
  }

  // ---------- الأحداث ----------
  $("bWatch").onclick = function () { setMode("watch"); };
  $("bGround").onclick = function () { setMode("ground"); };
  $("langBtn").onclick = function () { lang = lang === "ar" ? "en" : "ar"; L("lang", { lang: lang }); try { localStorage.setItem("vx-phone-lang", lang); } catch (e) { /* */ } renderMenu(); };
  $("watch").onclick = function () { st.playing = !st.playing; $("watch").className = "view on" + (st.playing ? "" : " paused"); };
  $("gCrew").onclick = function (e) { var b = e.target; while (b && !b.getAttribute("data-m")) b = b.parentNode; if (b && b.getAttribute) { st.gMember = b.getAttribute("data-m"); L("select_crew", { crew: st.gMember }); drawGround(); } };
  $("gMain").onclick = function () { st.playing = !st.playing; $("ground").className = "view on" + (st.playing ? "" : " paused"); };
  // بدون جسر أندرويد (في المتصفح): زر Esc يرجع
  var escT = 0, escLong = false;
  document.addEventListener("keydown", function (e) { if (e.keyCode === 27 && !escT) { escLong = false; escT = setTimeout(function () { escLong = true; window.vxPin(); }, 700); } });
  document.addEventListener("keyup", function (e) { if (e.keyCode === 27) { clearTimeout(escT); escT = 0; if (!escLong) window.vxBack(); } });
  var q = (location.hash || "").slice(1);
  setMode(q === "watch" || q === "ground" ? q : "menu");
})();
