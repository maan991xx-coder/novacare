/* =====================================================================
   VITALX — الموقع (6 شاشات) بنسق لوحة التحكم
   يشغّل المحرك (engine.js) على طاقم من 4 رواد صناعيين، ويكشف البيانات
   يوماً بيوم. النصوص في content.js → site.
   كل تنبيه في يوم ما محسوب من بيانات ذلك اليوم وما قبله فقط.
   ===================================================================== */
(function () {
  "use strict";
  const C = window.VITALX_CONTENT, E = window.VITALX_ENGINE, A = C.site;
  const $ = id => document.getElementById(id);
  const clone = o => JSON.parse(JSON.stringify(o));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let sim = clone(C.sim);
  const D = sim.missionDays;

  // ---------- اللغة ----------
  let lang = C.defaultLang || "ar";
  try { lang = new URLSearchParams(location.search).get("lang") || localStorage.getItem("vitalx-lang") || lang; } catch (e) { /* */ }
  if (lang !== "ar" && lang !== "en") lang = "ar";
  const t = x => (x && typeof x === "object" && ("ar" in x || "en" in x)) ? (x[lang] != null ? x[lang] : x.ar) : (x == null ? "" : String(x));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const tx = x => esc(t(x)).replace(/⟨([^⟩]*)⟩/g, '<span class="ph">⟨$1⟩</span>');
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const fmt = (v, d = 1) => v == null || isNaN(v) ? "—" : Number(v).toFixed(d);
  const LV = l => `var(--lv${l})`;
  const lvColor = l => css("--lv" + l) || ["#3ddc97", "#6aa8ff", "#ffb547", "#ff5d6c"][l];

  const state = {
    day: 0, playing: false, speed: 2, screen: "home", member: "A" };
  const SPEEDS = [0.5, 1, 2, 4, 8];

  // ---------- تشغيل المحرك لكل رائد ----------
  let crew = [];
  function chIds() { return E.activeChannels(sim); }
  function compute() {
    crew = A.crew.map(m => {
      const rng = E.mulberry32(m.seed * 7919 + 1);
      const ast = E.generateAstronaut(sim, rng, { driftMult: m.driftMult, noiseMult: m.noiseMult, onset: m.onset });
      const pers = E.runPersonal(ast, sim);
      const fx = E.runFixed(ast, sim);
      // نقاط التنبيه: كل صعود في المستوى
      const events = [];
      for (let d = pers.active; d < D; d++) {
        const l = pers.level[d], prev = d > 0 ? pers.level[d - 1] : 0;
        if (l > 0 && l > prev) events.push({ day: d, level: l });
      }
      return { m, ast, pers, fx, events };
    });
    cohortStats = E.cohort(sim, { n: sim.cohortSize });
  }
  let cohortStats = null;
  const crewById = id => crew.find(c => c.m.id === id) || crew[0];

  function phaseOf(day) {
    const c = crew[0];
    if (day < sim.adaptation.days) return "adapt";
    if (day < c.pers.active) return "calib";
    return "watch";
  }
  // حالة الرائد: أعلى مستوى في آخر 3 أيام
  function statusOf(c, day) {
    if (day < c.pers.active) return "calib";
    let l = 0;
    for (let d = Math.max(c.pers.active, day - 2); d <= day; d++) l = Math.max(l, c.pers.level[d]);
    return l;
  }
  const statusColor = s => s === "calib" ? css("--simulated") : lvColor(s);
  const statusCss = s => s === "calib" ? "var(--simulated)" : LV(s);

  // ---------- أيقونات ----------
  const ICONS = {
    crew: '<path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 0a3 3 0 1 0 0-6M1 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1m2-7a5 5 0 0 1 4 5v2"/>',
    member: '<path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-8 10a8 8 0 0 1 16 0"/><path d="M3 12h3l2-3 3 6 2-3h2"/>',
    trends: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-7"/><path d="M16 7h4v4"/>',
    alerts: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    review: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    habitat: '<path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M8 21v-6h8v6"/><circle cx="12" cy="10" r="1.5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    problem: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>',
    solution: '<rect x="2" y="6" width="13" height="12" rx="2"/><rect x="17" y="8" width="5" height="8" rx="1.5"/>',
    edge: '<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
    demo: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-7"/><path d="M16 7h4v4"/>',
    nasa: '<circle cx="12" cy="12" r="5"/><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(-20 12 12)"/>',
    home: '<path d="M12 3 3 8v8l9 5 9-5V8z"/><circle cx="12" cy="12" r="3"/>',
    video: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>',
    details: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    devices: '<rect x="6" y="5" width="12" height="14" rx="3"/><path d="M9 5V2h6v3M9 19v3h6v-3M10 12h4"/>'
  };
  const icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;
  const TABS = ["home", "problem", "solution", "edge", "demo", "nasa"];

  // =====================================================================
  //  الرسم البياني (Canvas بدقة الشاشة، تدرّج، توهج، مؤشر قراءة)
  // =====================================================================
  function setupCanvas(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return null;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { g, W, H };
  }
  function hexA(col, a) {
    col = col.trim();
    if (col[0] === "#") {
      let h = col.slice(1); if (h.length === 3) h = h.split("").map(x => x + x).join("");
      const n = parseInt(h, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
    }
    return col;
  }

  /* o: { day, series:[{data,color,width,fill,dash,glow,label,unit,dec}], band:{lo,hi}, hlines:[{y,color,label}],
          vlines:[{x,color,label}], markers:[{x,level}], shadeTo, yMin, yMax, tooltip:true } */
  function drawChart(cv, o) {
    const s = setupCanvas(cv); if (!s) return;
    const { g, W, H } = s;
    const pad = { l: 46, r: 14, t: 18, b: 26 };
    const n = o.n || D;
    let vals = [];
    o.series.forEach(se => se.data.forEach((v, i) => v != null && i <= (se.xs ? Infinity : o.day) && vals.push(v)));
    (o.hlines || []).forEach(h => vals.push(h.y));
    if (o.band) { o.band.lo.forEach((v, i) => v != null && i <= o.day && vals.push(v)); o.band.hi.forEach((v, i) => v != null && i <= o.day && vals.push(v)); }
    if (!vals.length) vals = [0, 1];
    let lo = Math.min(...vals), hi = Math.max(...vals);
    if (o.yMin != null) lo = Math.min(lo, o.yMin);
    if (o.yMax != null) hi = Math.max(hi, o.yMax);
    const sp = (hi - lo) || 1; lo -= sp * 0.08; hi += sp * 0.1;
    if (o.yMin != null) lo = Math.max(lo, o.yMin);
    const X = i => pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
    const Y = v => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
    const muted = css("--muted");
    g.font = "11px " + (css("--mono") || "monospace");

    // خلفية اللوحة
    const bg = g.createLinearGradient(0, pad.t, 0, H - pad.b);
    bg.addColorStop(0, "rgba(255,255,255,.035)"); bg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = bg; g.fillRect(pad.l, pad.t, W - pad.l - pad.r, H - pad.t - pad.b);
    // التكيف
    g.fillStyle = "rgba(165,175,196,.07)";
    g.fillRect(X(0), pad.t, X(sim.adaptation.days) - X(0), H - pad.t - pad.b);
    // المستقبل (لم يحدث بعد)
    if (o.day < n - 1) {
      const x0 = X(o.day);
      g.save(); g.beginPath(); g.rect(x0, pad.t, W - pad.r - x0, H - pad.t - pad.b); g.clip();
      g.strokeStyle = "rgba(255,255,255,.035)"; g.lineWidth = 6;
      for (let x = x0 - H; x < W; x += 14) { g.beginPath(); g.moveTo(x, H); g.lineTo(x + H, 0); g.stroke(); }
      g.restore();
    }
    // شبكة
    g.lineWidth = 1; g.textAlign = "right"; g.fillStyle = muted;
    for (let k = 0; k <= 4; k++) {
      const v = lo + (k / 4) * (hi - lo), y = Math.round(Y(v)) + .5;
      g.strokeStyle = "rgba(255,255,255,.07)"; g.beginPath(); g.moveTo(pad.l, y); g.lineTo(W - pad.r, y); g.stroke();
      g.fillText(Math.abs(hi) >= 100 ? v.toFixed(0) : Math.abs(hi) >= 10 ? v.toFixed(1) : v.toFixed(2), pad.l - 7, y + 4);
    }
    g.textAlign = "center";
    for (let d = 0; d < n; d += 10) {
      const x = Math.round(X(d)) + .5;
      g.strokeStyle = "rgba(255,255,255,.04)"; g.beginPath(); g.moveTo(x, pad.t); g.lineTo(x, H - pad.b); g.stroke();
      if (d % 20 === 0) g.fillText(d, x, H - 8);
    }
    // نطاق خط الأساس
    if (o.band) {
      const grd = g.createLinearGradient(0, pad.t, 0, H - pad.b);
      grd.addColorStop(0, "rgba(95,212,255,.10)"); grd.addColorStop(.5, "rgba(95,212,255,.20)"); grd.addColorStop(1, "rgba(95,212,255,.10)");
      g.fillStyle = grd; g.beginPath(); let st = false, last = -1;
      for (let i = 0; i <= Math.min(o.day, n - 1); i++) { if (o.band.hi[i] == null) continue; st ? g.lineTo(X(i), Y(o.band.hi[i])) : (g.moveTo(X(i), Y(o.band.hi[i])), st = true); last = i; }
      for (let i = last; i >= 0; i--) if (o.band.lo[i] != null) g.lineTo(X(i), Y(o.band.lo[i]));
      g.closePath(); g.fill();
      g.strokeStyle = "rgba(95,212,255,.35)"; g.lineWidth = 1; g.setLineDash([3, 3]);
      ["hi", "lo"].forEach(k => { g.beginPath(); let p = false; for (let i = 0; i <= last; i++) { const v = o.band[k][i]; if (v == null) { p = false; continue; } p ? g.lineTo(X(i), Y(v)) : (g.moveTo(X(i), Y(v)), p = true); } g.stroke(); });
      g.setLineDash([]);
    }
    // خطوط أفقية
    (o.hlines || []).forEach(h => {
      g.strokeStyle = h.color; g.lineWidth = 1.3; g.setLineDash(h.dash || [6, 4]);
      g.beginPath(); g.moveTo(pad.l, Y(h.y)); g.lineTo(W - pad.r, Y(h.y)); g.stroke(); g.setLineDash([]);
      if (h.label) { g.font = "600 11px " + css("--font"); g.fillStyle = h.color; g.textAlign = "left"; g.fillText(h.label, pad.l + 6, Y(h.y) - 5); }
    });
    (o.vlines || []).forEach(v => {
      g.strokeStyle = v.color; g.lineWidth = 1.4; g.setLineDash([4, 3]);
      g.beginPath(); g.moveTo(X(v.x), pad.t); g.lineTo(X(v.x), H - pad.b); g.stroke(); g.setLineDash([]);
      if (v.label) { g.font = "600 11px " + css("--font"); g.fillStyle = v.color; g.textAlign = "center"; g.fillText(v.label, X(v.x), pad.t - 5); }
    });
    // السلاسل
    o.series.forEach(se => {
      const pts = [];
      se.data.forEach((v, i) => { const x = se.xs ? se.xs[i] : i; if (v != null && (se.xs || x <= o.day)) pts.push([X(x), Y(v)]); });
      if (pts.length < 2) return;
      if (se.fill) {
        const grd = g.createLinearGradient(0, pad.t, 0, H - pad.b);
        grd.addColorStop(0, hexA(se.color, .32)); grd.addColorStop(1, hexA(se.color, 0));
        g.fillStyle = grd; g.beginPath(); g.moveTo(pts[0][0], H - pad.b);
        pts.forEach(p => g.lineTo(p[0], p[1])); g.lineTo(pts[pts.length - 1][0], H - pad.b); g.closePath(); g.fill();
      }
      g.save();
      if (se.glow) { g.shadowColor = hexA(se.color, .8); g.shadowBlur = 10; }
      g.strokeStyle = se.color; g.lineWidth = se.width || 1.8; g.lineJoin = "round"; g.lineCap = "round"; g.setLineDash(se.dash || []);
      g.globalAlpha = se.alpha || 1;
      g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
      g.restore();
      if (se.head) { // نقطة اليوم الحالي
        const p = pts[pts.length - 1];
        g.save(); g.shadowColor = se.color; g.shadowBlur = 14; g.fillStyle = se.color;
        g.beginPath(); g.arc(p[0], p[1], 4.5, 0, Math.PI * 2); g.fill(); g.restore();
        g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 1.5; g.beginPath(); g.arc(p[0], p[1], 4.5, 0, Math.PI * 2); g.stroke();
      }
    });
    // علامات التنبيه
    (o.markers || []).forEach(mk => {
      if (mk.x > o.day) return;
      const x = X(mk.x), c = lvColor(mk.level);
      g.save(); g.shadowColor = c; g.shadowBlur = 8; g.fillStyle = c;
      g.beginPath(); g.moveTo(x, pad.t + 9); g.lineTo(x - 5, pad.t + 1); g.lineTo(x + 5, pad.t + 1); g.closePath(); g.fill(); g.restore();
    });
    // خط اليوم الحالي
    if (o.day < n - 1) {
      const x = Math.round(X(o.day)) + .5;
      g.strokeStyle = "rgba(95,212,255,.6)"; g.lineWidth = 1; g.beginPath(); g.moveTo(x, pad.t); g.lineTo(x, H - pad.b); g.stroke();
    }
    cv._geom = { pad, W, H, n, X, o };
  }

  // مؤشر القراءة على الرسم
  function attachHover(box) {
    const cv = box.querySelector("canvas"), xh = box.querySelector(".xhair"), tip = box.querySelector(".tip");
    if (!cv || !xh || !tip) return;
    const show = ev => {
      const gm = cv._geom; if (!gm) return;
      const r = cv.getBoundingClientRect();
      const px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
      let d = Math.round((px - gm.pad.l) / (gm.W - gm.pad.l - gm.pad.r) * (gm.n - 1));
      d = clamp(d, 0, gm.o.day);
      const x = gm.X(d);
      xh.style.display = "block"; xh.style.left = x + "px"; xh.style.top = gm.pad.t + "px"; xh.style.bottom = gm.pad.b + "px";
      const rows = gm.o.series.filter(se => se.label && !se.xs).map(se => `<div><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${se.color};margin-inline-end:6px"></i>${esc(se.label)}: <b dir="ltr">${fmt(se.data[d], se.dec == null ? 1 : se.dec)}</b> ${esc(se.unit || "")}</div>`);
      if (gm.o.band && gm.o.band.lo[d] != null) rows.push(`<div class="muted">${tx(A.labels.baselineBand)}: <span dir="ltr">${fmt(gm.o.band.lo[d])} – ${fmt(gm.o.band.hi[d])}</span></div>`);
      const mk = (gm.o.markers || []).filter(m => m.x === d);
      mk.forEach(m => rows.push(`<div style="color:${lvColor(m.level)}">● ${tx(C.alerts[m.level].name)}</div>`));
      tip.innerHTML = `<div class="muted">${tx(A.player.day)} <b dir="ltr">${d}</b></div>` + rows.join("");
      tip.style.display = "block";
      const tw = tip.offsetWidth;
      tip.style.left = clamp(x + 12, 0, gm.W - tw) + "px";
      if (x + 12 + tw > gm.W) tip.style.left = Math.max(0, x - tw - 12) + "px";
    };
    const hide = () => { xh.style.display = "none"; tip.style.display = "none"; };
    cv.addEventListener("pointermove", show);
    cv.addEventListener("pointerdown", show);
    cv.addEventListener("pointerleave", hide);
  }
  const chartBox = (id, cls) => `<div class="chartbox ${cls || ""}"><canvas id="${id}"></canvas><div class="xhair"></div><div class="tip"></div></div>`;

  function sparkline(cv, data, day, color) {
    const s = setupCanvas(cv); if (!s) return;
    const { g, W, H } = s;
    const pts = [];
    const vals = data.slice(0, day + 1).filter(v => v != null);
    const lo = Math.min(-1, ...vals), hi = Math.max(3, ...vals);
    const X = i => 2 + i / (D - 1) * (W - 4), Y = v => 4 + (1 - (v - lo) / (hi - lo)) * (H - 8);
    for (let i = 0; i <= day; i++) if (data[i] != null) pts.push([X(i), Y(data[i])]);
    // خط الصفر والعتبة
    g.strokeStyle = "rgba(255,255,255,.12)"; g.setLineDash([2, 3]); g.beginPath(); g.moveTo(0, Y(0)); g.lineTo(W, Y(0)); g.stroke(); g.setLineDash([]);
    g.fillStyle = "rgba(255,255,255,.03)"; g.fillRect(X(day), 0, W - X(day), H);
    if (pts.length < 2) return;
    const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, hexA(color, .35)); grd.addColorStop(1, hexA(color, 0));
    g.fillStyle = grd; g.beginPath(); g.moveTo(pts[0][0], H); pts.forEach(p => g.lineTo(p[0], p[1])); g.lineTo(pts[pts.length - 1][0], H); g.fill();
    g.save(); g.shadowColor = color; g.shadowBlur = 6; g.strokeStyle = color; g.lineWidth = 1.6; g.lineJoin = "round";
    g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.restore();
    const p = pts[pts.length - 1]; g.fillStyle = color; g.beginPath(); g.arc(p[0], p[1], 3, 0, 7); g.fill();
  }

  // =====================================================================
  //  مقياس دائري بأسلوب الأجهزة (SVG): النطاق الشخصي ملوّن حول خط الأساس
  // =====================================================================
  function gauge(o) {
    // o: {label, unit, value, med, scale, dir, dec, calibrating, id}
    const cx = 100, cy = 100, R = 78, a0 = -210, a1 = 30; // درجات (قوس 240°)
    const rad = a => a * Math.PI / 180;
    const pt = (a, r) => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))];
    const arc = (from, to, r) => { const [x0, y0] = pt(from, r), [x1, y1] = pt(to, r); return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; };
    const Z = 5; // المدى ±5 وحدات مقياس
    const zToA = z => a0 + (clamp(z, -Z, Z) + Z) / (2 * Z) * (a1 - a0);
    const id = o.id;
    let zones = "", ticks = "", needle = "", zTxt = "";
    if (!o.calibrating && o.scale) {
      const segs = [[-Z, -3], [-3, -2], [-2, 2], [2, 3], [3, Z]];
      const colFor = (a, b) => {
        const mid = (a + b) / 2, bad = mid * o.dir > 0;
        if (Math.abs(mid) < 2) return "url(#gz-" + id + ")";
        if (Math.abs(mid) < 3) return bad ? "#ffb547" : "rgba(106,168,255,.55)";
        return bad ? "#ff5d6c" : "rgba(106,168,255,.35)";
      };
      zones = segs.map(([a, b]) => `<path d="${arc(zToA(a) + .8, zToA(b) - .8, R)}" stroke="${colFor(a, b)}" stroke-width="10" fill="none" stroke-linecap="butt"/>`).join("");
      for (let k = -Z; k <= Z; k++) {
        const a = zToA(k), [x0, y0] = pt(a, R - 9), [x1, y1] = pt(a, R - (k % 5 === 0 ? 18 : 14));
        ticks += `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="rgba(255,255,255,${k === 0 ? .7 : .3})" stroke-width="${k === 0 ? 2 : 1.2}"/>`;
      }
      const lab = v => Math.abs(o.med) >= 100 ? v.toFixed(0) : v.toFixed(o.dec);
      { const [x, y] = pt(zToA(0), R - 26); ticks += `<text class="g-tick" x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="middle">${lab(o.med)}</text>`; }
      [-Z, Z].forEach(k => { const [x, y] = pt(zToA(k), R); ticks += `<text class="g-tick" x="${x.toFixed(1)}" y="${(y + 18).toFixed(1)}" text-anchor="middle">${lab(o.med + k * o.scale)}</text>`; });
      const z = (o.value - o.med) / o.scale, a = zToA(z);
      const [nx, ny] = pt(a, R - 4), [bx, by] = pt(a + 90, 4), [cx2, cy2] = pt(a - 90, 4);
      const bad = z * o.dir;
      const col = Math.abs(z) < 2 ? "#3ddc97" : bad > 0 ? (Math.abs(z) < 3 ? "#ffb547" : "#ff5d6c") : "#6aa8ff";
      needle = `<g filter="url(#gl-${id})"><path d="M${bx.toFixed(1)} ${by.toFixed(1)} L${nx.toFixed(1)} ${ny.toFixed(1)} L${cx2.toFixed(1)} ${cy2.toFixed(1)} Z" fill="${col}"/></g>
        <circle cx="${cx}" cy="${cy}" r="7" fill="#0b1426" stroke="${col}" stroke-width="2"/>`;
      zTxt = `<text class="g-z" x="${cx}" y="${cy + 56}" text-anchor="middle" fill="${col}" direction="ltr">z ${z >= 0 ? "+" : ""}${z.toFixed(1)}</text>`;
    } else {
      zTxt = `<text class="g-z" x="${cx}" y="${cy + 56}" text-anchor="middle" fill="${css("--future")}">${esc(t(A.status.calib))}</text>`;
    }
    return `<div class="card gauge"><h4>${tx(o.label)}</h4>
      <svg viewBox="0 0 200 178" role="img" aria-label="${esc(t(o.label))}">
        <defs>
          <linearGradient id="gz-${id}" x1="0" x2="1"><stop offset="0" stop-color="#2bbf83"/><stop offset=".5" stop-color="#4af0a8"/><stop offset="1" stop-color="#2bbf83"/></linearGradient>
          <radialGradient id="gf-${id}" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="rgba(95,212,255,.10)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
          <filter id="gl-${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <circle cx="${cx}" cy="${cy}" r="${R + 10}" fill="url(#gf-${id})"/>
        <path d="${arc(a0, a1, R)}" stroke="rgba(255,255,255,.07)" stroke-width="12" fill="none"/>
        ${zones}${ticks}${needle}
        <text class="g-val" x="${cx}" y="${cy + 40}" text-anchor="middle" direction="ltr">${fmt(o.value, o.dec)}</text>
        <text class="g-unit" x="${cx}" y="${cy + 68}" text-anchor="middle">${esc(o.unit)}</text>
        ${zTxt}
      </svg></div>`;
  }

  // رائد ببدلة فضائية (SVG مفصّل) مع نقاط الحساسات ومنصة هولوغرام
  function chanCol(c, id, day) {
    const z = c.pers.z[id] ? c.pers.z[id][day] : null;
    return z == null ? css("--simulated") : Math.abs(z) < 2 ? "#3ddc97" : z * sim.channels[id].direction > 0 ? (Math.abs(z) < 3 ? "#ffb547" : "#ff5d6c") : "#6aa8ff";
  }
  function astronautSVG(c, day) {
    const u = "a" + Math.random().toString(36).slice(2, 7);
    const dot = (x, y, col) => `<g class="sens"><circle cx="${x}" cy="${y}" r="13" fill="${col}" opacity=".16" class="sdot"/><circle cx="${x}" cy="${y}" r="7" fill="none" stroke="${col}" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="3.6" fill="${col}"/></g>`;
    const S = `url(#${u}s)`, Sd = `url(#${u}sd)`;
    return `<svg class="astro" viewBox="0 0 220 380" role="img" aria-label="${esc(t(A.labels.sensors))}">
      <defs>
        <linearGradient id="${u}s" x1="0" x2="1"><stop offset="0" stop-color="#b9c4d4"/><stop offset=".35" stop-color="#f4f7fb"/><stop offset=".7" stop-color="#e3e9f2"/><stop offset="1" stop-color="#9eabbf"/></linearGradient>
        <linearGradient id="${u}sd" x1="0" x2="1"><stop offset="0" stop-color="#8f9bb0"/><stop offset=".5" stop-color="#cfd7e3"/><stop offset="1" stop-color="#7f8ba0"/></linearGradient>
        <radialGradient id="${u}v" cx=".38" cy=".32" r=".85"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".18" stop-color="#c49a3a"/><stop offset=".55" stop-color="#3a2a12"/><stop offset="1" stop-color="#0b0905"/></radialGradient>
        <radialGradient id="${u}p" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgba(95,212,255,.55)"/><stop offset=".6" stop-color="rgba(95,212,255,.12)"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></radialGradient>
        <linearGradient id="${u}beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="rgba(95,212,255,.22)"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></linearGradient>
        <filter id="${u}f" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity=".45"/></filter>
      </defs>
      <!-- منصة الهولوغرام -->
      <path d="M40 352 L70 40 L150 40 L180 352 Z" fill="url(#${u}beam)" opacity=".6"/>
      <ellipse cx="110" cy="352" rx="92" ry="20" fill="url(#${u}p)"/>
      <ellipse cx="110" cy="352" rx="70" ry="13" fill="none" stroke="rgba(95,212,255,.7)" stroke-width="1.5"/>
      <ellipse cx="110" cy="352" rx="48" ry="8" fill="none" stroke="rgba(95,212,255,.45)" stroke-width="1" stroke-dasharray="4 4"/>
      <g filter="url(#${u}f)">
        <!-- حقيبة الظهر -->
        <rect x="66" y="92" width="88" height="104" rx="14" fill="${Sd}"/>
        <!-- الساقان -->
        <path d="M78 214 Q74 262 80 318 L104 318 Q106 266 108 222 Z" fill="${S}"/>
        <path d="M142 214 Q146 262 140 318 L116 318 Q114 266 112 222 Z" fill="${S}"/>
        <rect x="77" y="262" width="30" height="9" rx="3" fill="#c8384a"/><rect x="113" y="262" width="30" height="9" rx="3" fill="#c8384a"/>
        <path d="M74 316 h34 v18 q0 6 -6 6 h-30 q-6 0 -6 -6 z" fill="#6f7b90"/><path d="M112 316 h34 v18 q0 6 -6 6 h-30 q-6 0 -6 -6 z" fill="#6f7b90"/>
        <!-- الجذع -->
        <path d="M70 104 Q110 88 150 104 L156 214 Q110 232 64 214 Z" fill="${S}"/>
        <path d="M66 196 Q110 212 154 196 L156 214 Q110 232 64 214 Z" fill="#c4ccd8"/>
        <!-- الذراعان -->
        <path d="M70 106 Q52 112 48 140 L40 204 L58 208 L68 150 Z" fill="${S}"/>
        <path d="M150 106 Q168 112 172 140 L180 204 L162 208 L152 150 Z" fill="${S}"/>
        <rect x="43" y="150" width="24" height="8" rx="3" transform="rotate(8 55 154)" fill="#c8384a"/><rect x="153" y="150" width="24" height="8" rx="3" transform="rotate(-8 165 154)" fill="#c8384a"/>
        <ellipse cx="48" cy="214" rx="12" ry="14" fill="#7d889c"/><ellipse cx="172" cy="214" rx="12" ry="14" fill="#7d889c"/>
        <rect x="38" y="194" width="22" height="8" rx="2" fill="#a7b2c4"/><rect x="160" y="194" width="22" height="8" rx="2" fill="#a7b2c4"/>
        <!-- وحدة التحكم على الصدر -->
        <rect x="88" y="140" width="44" height="30" rx="5" fill="#5e6a80" stroke="#9aa6ba" stroke-width="1"/>
        <circle cx="98" cy="150" r="3" fill="#ff5d6c"/><circle cx="108" cy="150" r="3" fill="#3ddc97"/><circle cx="118" cy="150" r="3" fill="#5fd4ff"/>
        <rect x="95" y="158" width="30" height="5" rx="2" fill="#2a3446"/>
        <path d="M92 172 Q88 186 96 196 M128 172 Q132 186 124 196" stroke="#8a96aa" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- الخوذة -->
        <rect x="86" y="92" width="48" height="14" rx="6" fill="#aeb8c8"/>
        <circle cx="110" cy="64" r="36" fill="${S}"/>
        <ellipse cx="110" cy="66" rx="26" ry="23" fill="url(#${u}v)"/>
        <path d="M92 56 Q100 46 114 46" stroke="rgba(255,255,255,.75)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M120 80 Q126 76 128 70" stroke="rgba(255,255,255,.35)" stroke-width="2" fill="none" stroke-linecap="round"/>
        <rect x="74" y="54" width="7" height="18" rx="3" fill="#9aa6ba"/><rect x="139" y="54" width="7" height="18" rx="3" fill="#9aa6ba"/>
        <rect x="132" y="112" width="14" height="9" rx="1.5" fill="#24427a"/><rect x="132" y="112" width="6" height="5" fill="#fff" opacity=".8"/>
      </g>
      ${dot(110, 128, chanCol(c, "hr", day))}
      ${dot(46, 186, chanCol(c, "sleep", day))}
      ${dot(136, 184, "#3ddc97")}
      ${chIds().includes("chem") ? dot(166, 176, chanCol(c, "chem", day)) : ""}
    </svg>`;
  }

  // موجة قلب توضيحية بمعدل النبض اليومي
  let ecgRaf = 0;
  function startEcg(cv, getHr) {
    cancelAnimationFrame(ecgRaf);
    const s = setupCanvas(cv); if (!s) return;
    const { g, W, H } = s;
    const buf = new Float32Array(Math.ceil(W));
    let phase = 0, x = 0, last = performance.now();
    const wave = p => { // p ∈ [0,1) ضمن النبضة
      const gs = (m, w, a) => a * Math.exp(-((p - m) ** 2) / (2 * w * w));
      return gs(.18, .025, .12) + gs(.36, .008, -.12) + gs(.39, .011, 1) + gs(.42, .01, -.25) + gs(.66, .045, .3);
    };
    const pxPerSec = 90;
    { const hr0 = getHr() || 60; for (let i = 0; i < buf.length; i++) { phase = (phase + hr0 / 60 / pxPerSec) % 1; buf[i] = wave(phase); } x = 0; }
    const step = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const hr = getHr() || 60, bps = hr / 60;
      let adv = dt * pxPerSec;
      while (adv > 0) {
        phase = (phase + bps / pxPerSec) % 1;
        buf[x] = wave(phase) + (Math.random() - .5) * .015;
        x = (x + 1) % buf.length; adv -= 1;
      }
      g.clearRect(0, 0, W, H);
      g.save(); g.shadowColor = "rgba(61,220,151,.9)"; g.shadowBlur = 8; g.strokeStyle = "#3ddc97"; g.lineWidth = 1.8; g.lineJoin = "round";
      g.beginPath();
      for (let i = 0; i < buf.length; i++) {
        if (Math.abs(i - x) < 10) { g.stroke(); g.beginPath(); continue; }
        const y = H * .72 - buf[i] * H * .58;
        (i === 0 || Math.abs(i - x) === 10) ? g.moveTo(i, y) : g.lineTo(i, y);
      }
      g.stroke(); g.restore();
      ecgRaf = requestAnimationFrame(step);
    };
    ecgRaf = requestAnimationFrame(step);
  }

  // =====================================================================
  //  الشاشات
  // =====================================================================
  const L = A.labels;
  const chName = id => t(sim.channels[id].name);

  // ---------- الرئيسية ----------
  const VICON = {
    hr: '<path d="M12 21s-7-4.4-9.3-9A5.3 5.3 0 0 1 12 6.2 5.3 5.3 0 0 1 21.3 12C19 16.6 12 21 12 21Z"/><path d="M4 12h4l2-3 3 6 2-3h5"/>',
    sleep: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/><path d="M15 4h4l-4 4h4"/>',
    co2: '<text x="12" y="16" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor" stroke="none" font-family="sans-serif">CO2</text><rect x="2.5" y="5" width="19" height="14" rx="3"/>',
    rad: '<circle cx="12" cy="12" r="2"/><path d="M12 10 9 4.8A8 8 0 0 0 4.2 13H10M14 12h6a8 8 0 0 0-4.8-7.4L12 10M13 13.7l3 5.2a8 8 0 0 1-8 0l3-5.2"/>',
    comp: '<path d="M3 12h4l2-6 4 12 2-6h6"/>'
  };
  const vicon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${VICON[k]}</svg>`;
  function vitalsFor(c, d) {
    const calib = d < c.pers.active;
    const row = (k, name, val, unit, col, go) => `<button type="button" class="vital" data-go="${go}" style="--c:${col}"><span class="vi">${vicon(k)}</span><span class="vn">${esc(name)}</span><b class="vv" dir="ltr">${val}<em>${esc(unit)}</em></b></button>`;
    const lim = sim.radiation.limit, dose = c.ast.rad[d];
    const radCol = dose / lim < .7 ? "#3ddc97" : dose / lim < .9 ? "#ffb547" : "#ff5d6c";
    const comp = c.pers.composite[d];
    const s = statusOf(c, d);
    return row("hr", chName("hr"), fmt(c.ast.obs.hr[d], 0), "bpm", chanCol(c, "hr", d), "solution")
      + row("sleep", chName("sleep"), fmt(c.ast.obs.sleep[d], 1), "h", chanCol(c, "sleep", d), "solution")
      + row("co2", chName("co2"), fmt(c.ast.obs.co2[d], 2), "mmHg", chanCol(c, "co2", d), "solution")
      + row("rad", t(L.radShort), fmt(dose, 1), "mSv", radCol, "solution")
      + row("comp", t(L.composite), calib ? "—" : fmt(comp, 1), "z", statusColor(s === "calib" ? 0 : s), "solution");
  }
  let hasAstroImg = false;
  function screenHome() {
    const d = state.day, c = crewById(state.member), s = statusOf(c, d);
    const open = crew.filter(x => { const sx = statusOf(x, d); return sx !== "calib" && sx >= 2; }).length;
    const crewCol = crew.map(x => { const sx = statusOf(x, d); return `<button type="button" class="mini-crew ${x.m.id === c.m.id ? "on" : ""}" data-member="${x.m.id}" style="--c:${statusCss(sx)}" title="${esc(t(x.m.name))}"><span class="avatar">${esc(x.m.id)}</span><small>${tx(A.status[sx])}</small></button>`; }).join("");
    return `<div class="home">
      <div class="vitals">${vitalsFor(c, d)}</div>
      <div class="figure">
        ${hasAstroImg ? `<div class="astro-img"><img src="media/astronaut.png" alt="${esc(t(c.m.name))}"><i class="pad"></i></div>` : astronautSVG(c, d)}
        <div class="namepill" style="--c:${statusCss(s)}">
          <button type="button" class="pill-nav" data-step="-1" aria-label="prev">‹</button>
          <span><b>${tx(c.m.name)}</b> · ${tx(A.status[s])}</span>
          <button type="button" class="pill-nav" data-step="1" aria-label="next">›</button>
        </div>
      </div>
      <div class="side-col">
        ${crewCol}
        <button type="button" class="alert-btn ${open ? "hot" : ""}" data-go="demo">${icon("alerts")}<b dir="ltr">${open}</b><small>${tx(A.status[2])}</small></button>
      </div>
    </div>`;
  }
  // ---------- شريط القياسات العلوي ----------
  function tinySpark(cv, data, day, color) {
    const s = setupCanvas(cv); if (!s) return;
    const { g, W, H } = s;
    const from = Math.max(0, day - 40), vals = [];
    for (let i = from; i <= day; i++) if (data[i] != null) vals.push([i, data[i]]);
    if (vals.length < 2) return;
    let lo = Math.min(...vals.map(v => v[1])), hi = Math.max(...vals.map(v => v[1])); if (hi === lo) hi = lo + 1;
    const X = i => (i - from) / Math.max(1, day - from) * (W - 2) + 1, Y = v => 3 + (1 - (v - lo) / (hi - lo)) * (H - 6);
    const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, hexA(color, .35)); grd.addColorStop(1, hexA(color, 0));
    g.fillStyle = grd; g.beginPath(); g.moveTo(X(vals[0][0]), H); vals.forEach(v => g.lineTo(X(v[0]), Y(v[1]))); g.lineTo(X(vals[vals.length - 1][0]), H); g.fill();
    g.save(); g.shadowColor = color; g.shadowBlur = 5; g.strokeStyle = color; g.lineWidth = 1.4; g.lineJoin = "round";
    g.beginPath(); vals.forEach((v, i) => i ? g.lineTo(X(v[0]), Y(v[1])) : g.moveTo(X(v[0]), Y(v[1]))); g.stroke(); g.restore();
  }
  function renderTelemetry() {
    const c = crewById(state.member), d = state.day;
    const items = [
      { k: "hr", name: chName("hr"), v: fmt(c.ast.obs.hr[d], 0), u: "bpm", data: c.ast.obs.hr, col: "#ff6b81" },
      { k: "sleep", name: chName("sleep"), v: fmt(c.ast.obs.sleep[d], 1), u: "h", data: c.ast.obs.sleep, col: "#8b7bff" },
      { k: "co2", name: chName("co2"), v: fmt(c.ast.obs.co2[d], 2), u: "mmHg", data: c.ast.obs.co2, col: "#5fd4ff" },
      { k: "rad", name: t(L.dose), v: fmt(c.ast.rad[d], 1), u: "mSv", data: c.ast.rad, col: "#ffd166" },
      { k: "comp", name: t(L.composite), v: d < c.pers.active ? "—" : fmt(c.pers.composite[d], 1), u: "z", data: c.pers.composite, col: "#3ddc97" }
    ];
    $("telemetry").innerHTML = `<div class="tm-who"><span class="avatar" style="--c:${statusCss(statusOf(c, d))}">${esc(c.m.id)}</span><b>${tx(c.m.name)}</b></div>` +
      items.map(it => `<div class="tm"><div class="tm-top"><span class="tm-i" style="color:${it.col}">${vicon(it.k)}</span><small>${esc(it.name)}</small><b dir="ltr">${it.v}<em>${it.u}</em></b></div><canvas data-tm="${it.k}"></canvas></div>`).join("");
    items.forEach(it => tinySpark($("telemetry").querySelector(`[data-tm="${it.k}"]`), it.data, d, it.col));
  }

  // =====================================================================
  //  الشاشات الست
  // =====================================================================
  const S6 = A;
  const lastAlertDay = (c, d) => { for (let i = d; i >= c.pers.active; i--) if (c.pers.level[i] >= 1) return i; return null; };
  const firstDet = (lv, from) => { for (let i = from; i < D; i++) if (lv[i] >= 2) return i; return null; };
  const monitorThr = c => { const b = c.pers.band.hr[c.pers.active], ch = sim.channels.hr; return b.med + ch.direction * sim.projection.monitorZ * b.scale; };
  function projectionNow(c, d) {
    if (d < c.pers.active + sim.projection.window) return null;
    const thr = monitorThr(c);
    return { thr, p: E.projectCrossing(c.ast.obs.hr, d, sim.projection.window, thr, sim.channels.hr.direction) };
  }
  const projOk = (pj, d) => pj && pj.p && pj.p.day > d && pj.p.day - d <= 60;

  // رسم نبض الراحة: o = { band, fixed, proj, onset, ours, fixedDet }
  function drawHr(cv, c, d, o) {
    const pers = c.pers, series = [{ data: c.ast.obs.hr, color: "#e7ecf7", width: 1.8, fill: true, glow: true, head: true, label: chName("hr"), unit: "bpm", dec: 0 }];
    const hl = [], vl = [];
    let band = null;
    if (o.band) band = { lo: pers.band.hr.map((b, i) => i >= pers.active ? b.med - 3 * b.scale : null), hi: pers.band.hr.map((b, i) => i >= pers.active ? b.med + 3 * b.scale : null) };
    if (o.fixed) hl.push({ y: sim.fixed.thresholds.hr.value, color: css("--fixed"), label: t(L.fixedThr) });
    if (o.proj) {
      const pj = projectionNow(c, d);
      hl.push({ y: monitorThr(c), color: css("--accent-2"), dash: [2, 3] });
      if (projOk(pj, d)) {
        const xs = [], ys = [], end = Math.min(D - 1, Math.ceil(pj.p.day) + 2);
        for (let x = d - sim.projection.window + 1; x <= end; x++) { xs.push(x); ys.push(pj.p.fit.at(x)); }
        series.push({ data: ys, xs, color: css("--accent-2"), width: 2.2, dash: [7, 5], glow: true });
      }
    }
    if (o.onset && d >= c.ast.onset) vl.push({ x: c.ast.onset, color: "rgba(255,255,255,.45)", label: t(S6.problem.onset) });
    if (o.ours != null && o.ours <= d) vl.push({ x: o.ours, color: css("--personal"), label: "VITALX" });
    if (o.fixedDet != null && o.fixedDet <= d) vl.push({ x: o.fixedDet, color: css("--fixed"), label: t(L.fixedThr) });
    const markers = o.markers ? c.events.filter(e => e.level >= 2).map(e => ({ x: e.day, level: e.level })) : [];
    drawChart(cv, { day: d, series, band, hlines: hl, vlines: vl, markers });
    attachHover(cv.parentNode);
  }
  const legend = items => `<div class="legend">${items.map(([col, lab]) => `<span><i style="background:${col}"></i>${tx(lab)}</span>`).join("")}</div>`;

  // ---------- 1) المشكلة ----------
  function screenProblem() {
    const P = S6.problem;
    return `<div class="six-head">${tx(P.head)}</div>
      <div class="stat-row">${P.stats.map(s => `<div class="card stat"><b dir="ltr">${esc(s.v)}<em>${tx(s.u)}</em></b><span>${tx(s.t)}</span></div>`).join("")}</div>
      <div class="card" style="margin-top:14px"><h3>${tx(P.chart)} <span class="unit">bpm</span></h3>${chartBox("cvProblem", "mid")}
        ${legend([["#e7ecf7", L.observed], [css("--fixed"), L.fixedThr]])}</div>`;
  }
  function afterProblem() { const c = crewById("A"); drawHr($("cvProblem"), c, state.day, { fixed: true, onset: true }); }

  // ---------- 2) الحل: الساعة + اللوحي ----------
  function watchFace(c, d) {
    const s = statusOf(c, d), col = statusColor(s === "calib" ? 0 : s);
    const comp = c.pers.composite[d], frac = s === "calib" ? .15 : clamp((comp == null ? 0 : comp + 1) / 5, .06, 1);
    const R = 64, C2 = 2 * Math.PI * R;
    const row = (k, v, u) => `<div class="w-row"><span class="w-i" style="color:${chanCol(c, k, d)}">${vicon(k)}</span><b dir="ltr">${v}<em>${u}</em></b></div>`;
    return `<div class="dev wdev" style="--c:${col}">
        <i class="w-crown"></i><i class="w-btn"></i><i class="w-strap top"></i><i class="w-strap bot"></i>
        <div class="w-screen">
          <div class="w-top"><span dir="ltr">D${d}</span><span>${esc(c.m.id)}</span></div>
          <div class="w-ring"><svg viewBox="0 0 160 160"><circle cx="80" cy="80" r="${R}" stroke="rgba(255,255,255,.1)" stroke-width="10" fill="none"/>
            <circle cx="80" cy="80" r="${R}" stroke="${col}" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="${(C2 * frac).toFixed(1)} ${C2.toFixed(1)}" transform="rotate(-90 80 80)" style="filter:drop-shadow(0 0 6px ${col})"/></svg>
            <div class="w-mid"><b dir="ltr">${fmt(c.ast.obs.hr[d], 0)}</b><small>bpm</small></div></div>
          ${row("sleep", fmt(c.ast.obs.sleep[d], 1), "h")}${row("co2", fmt(c.ast.obs.co2[d], 2), "mmHg")}
          <div class="w-status">${tx(A.status[s])}</div>
        </div></div>`;
  }
  function tabletFace(d) {
    const rows = crew.map(x => { const s = statusOf(x, d);
      return `<button type="button" class="t-row ${x.m.id === state.member ? "on" : ""}" data-member="${x.m.id}" style="--c:${statusCss(s)}"><span class="avatar">${esc(x.m.id)}</span>
        <b dir="ltr">${fmt(x.ast.obs.hr[d], 0)}<em>bpm</em></b><span class="lv-pill">${tx(A.status[s])}</span></button>`; }).join("");
    return `<div class="dev tablet"><i class="t-cam"></i><div class="t-screen">
        <div class="t-crew">${rows}</div>
        <div class="t-chart">${chartBox("cvTablet", "short")}</div>
      </div></div>`;
  }
  function screenSolution() {
    const c = crewById(state.member), d = state.day, P = S6.solution;
    const FI = ['<path d="M3 12h4l2-5 4 10 2-5h6"/>', '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/>', '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>', '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/>'];
    return `<div class="flow">${P.steps.map((s, i) => `<span class="flow-step"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${FI[i] || ""}</svg>${tx(s)}</span>${i < P.steps.length - 1 ? '<i class="flow-arr"></i>' : ""}`).join("")}</div>
      <div class="devices">
        <figure>${watchFace(c, d)}<figcaption>${tx(P.watch)} · ${tx(c.m.name)}</figcaption></figure>
        <figure class="wide">${tabletFace(d)}<figcaption>${tx(P.tablet)}</figcaption></figure>
      </div>
      `;
  }
  function afterSolution() { drawHr($("cvTablet"), crewById(state.member), state.day, { band: true, markers: true }); }

  // ---------- 3) ما يميزنا ----------
  function screenEdge() {
    const c = crewById(state.member), d = state.day, P = S6.edge, calib = d < c.pers.active;
    const b = c.pers.band.hr[d], ch = sim.channels.hr;
    const g = gauge({ id: "edgehr", label: ch.name, unit: "bpm", value: c.ast.obs.hr[d], med: b.med, scale: b.scale, dir: ch.direction, dec: 0, calibrating: calib });
    const chips = crew.map(x => `<span dir="ltr" class="bchip ${x.m.id === c.m.id ? "on" : ""}" data-member="${x.m.id}"><b>${esc(x.m.id)}</b> <span dir="ltr">${fmt(x.pers.band.hr[x.pers.active].med, 0)}</span></span>`).join("");
    const ad = lastAlertDay(c, d);
    let bars = `<p class="muted">${tx(P.noAlert)}</p>`;
    if (ad != null) {
      const ex = c.pers.explain[ad].filter(x => x.bad > 0), tot = ex.reduce((s, x) => s + x.bad * x.w, 0) || 1;
      bars = `<div class="bars">${chIds().map(id => { const e = ex.find(x => x.id === id), pc = e ? e.bad * e.w / tot * 100 : 0;
        return `<div class="bar-row"><span>${esc(chName(id))}</span><div class="bar-track"><span class="bar-fill" style="--c:${pc > 40 ? "#ff5d6c" : pc > 0 ? "#ffb547" : "#3ddc97"};left:0;width:${pc.toFixed(0)}%"></span></div><span class="mono" dir="ltr">${pc.toFixed(0)}%</span></div>`; }).join("")}</div>
        <div class="why-day" style="--c:${LV(c.pers.level[ad])}">${tx(C.alerts[c.pers.level[ad]].name)} · ${tx(A.player.day)} <b dir="ltr">${ad}</b></div>`;
    }
    const pj = projectionNow(c, d);
    const pTxt = projOk(pj, d) ? `${tx(P.projAt)} <b dir="ltr">${Math.round(pj.p.day)}</b>` : tx(P.projNone);
    const pe = cohortStats.projection.find(p => p.off === 14) || cohortStats.projection[0];
    return `<div class="grid g3 edge-grid">
        <div class="card"><h3>${tx(P.personal)}</h3>${g.replace('<div class="card gauge">', '<div class="gauge">')}
          <div class="chips" title="${esc(t(P.personalNote))}">${chips}</div></div>
        <div class="card"><h3>${tx(P.why)}</h3>${bars}</div>
        <div class="card"><h3>${tx(P.proj)}</h3>${chartBox("cvProj", "short")}<p class="big-line">${pTxt}</p>
          <p class="six-note" title="${esc(t(P.projErr))}"><span dir="ltr">±${fmt(pe.medAbs, 0)}</span> ${tx(P.days)}</p></div>
      </div>`;
  }
  function afterEdge() { drawHr($("cvProj"), crewById(state.member), state.day, { proj: true }); }

  // ---------- 4) العرض الحي ----------
  function screenDemo() {
    const c = crewById(state.member), d = state.day, P = S6.demo;
    const ours = firstDet(c.pers.level, c.ast.onset), fx = firstDet(c.fx.level, c.ast.onset);
    const box = (cls, name, det) => `<div class="card score ${cls}"><small>${tx(name)}</small>${det != null && det <= d
        ? `<b>${tx(P.detected)} <span dir="ltr">${det}</span></b>` : `<b class="wait">${tx(P.waiting)}</b>`}</div>`;
    const gap = ours != null && ours <= d && (fx == null || fx > ours) ? (fx != null && fx <= d ? fx - ours : d - ours) : null;
    const cs = cohortStats, pct = v => Math.round(v * 100) + "%";
    const m = (lab, a, b) => `<div class="cmp"><span>${tx(lab)}</span><b class="o" dir="ltr">${a}</b><b class="f" dir="ltr">${b}</b></div>`;
    return `<div class="demo">
        <div class="card demo-chart"><h3>${tx(c.m.name)} · ${esc(chName("hr"))} <span class="unit">bpm</span></h3>${chartBox("cvDemo", "tall")}
          ${legend([["#e7ecf7", L.observed], ["rgba(95,212,255,.45)", L.baselineBand], [css("--fixed"), L.fixedThr]])}</div>
        <div class="demo-side">
          ${box("o", P.ours, ours)}${box("f", P.fixed, fx)}
          ${gap ? `<div class="gap">${tx(P.earlier)} <b dir="ltr">${gap}</b> ${tx(S6.edge.days)}</div>` : `<p class="six-note">${tx(P.hint)}</p>`}
          <div class="card cohort"><h3>${tx(P.cohort)}</h3>
            <div class="cmp head"><span></span><b class="o">VITALX</b><b class="f">${tx(L.fixedThr)}</b></div>
            ${m(P.rate, pct(cs.personal.rate), pct(cs.fixed.rate))}
            ${m(P.delay, fmt(cs.personal.medianDelay, 0), fmt(cs.fixed.medianDelay, 0))}
            ${m(P.fa, fmt(cs.personal.faPer100, 2), fmt(cs.fixed.faPer100, 2))}</div>
        </div></div>`;
  }
  function afterDemo() {
    const c = crewById(state.member);
    drawHr($("cvDemo"), c, state.day, { band: true, fixed: true, markers: true, ours: firstDet(c.pers.level, c.ast.onset), fixedDet: firstDet(c.fx.level, c.ast.onset) });
  }

  // ---------- 5) ناسا ----------
  function screenNasa() {
    const P = S6.nasa;
    const nm = k => k === "rad" ? t(L.radShort) : chName(k);
    return `<div class="six-head">${tx(P.head)}</div>
      <div class="grid g2 hrp">${P.map.map(r => `<div class="card hrp-row"><span class="vi" style="--c:var(--accent)">${vicon(r.ch)}</span><div><b>${esc(nm(r.ch))}</b><small>${tx(r.risk)}</small></div></div>`).join("")}</div>
      <div class="card honest"><span class="tag-synth">${tx(A.synthetic)}</span><p>${tx(P.honest)}</p>
        <a class="key" href="https://humanresearchroadmap.nasa.gov/" target="_blank" rel="noopener">${tx(P.link)} ↗</a></div>
      <div class="team-row"><div><small>${tx(P.team)}</small><b>NovaCare</b></div><div><small>${tx(P.challenge)}</small><b>${tx(P.challengeName)}</b></div><div><small>${tx(P.members)}</small><b>${tx(P.membersNames)}</b></div></div>`;
  }

  const SCREENS = {
    home: [screenHome], problem: [screenProblem, afterProblem], solution: [screenSolution, afterSolution],
    edge: [screenEdge, afterEdge], demo: [screenDemo, afterDemo], nasa: [screenNasa]
  };

  // =====================================================================
  //  الإطار: التنقل، المشغّل، خط الزمن
  // =====================================================================
  function renderTabs() {
    $("tabs").innerHTML = TABS.map(k => `<a class="tab ${state.screen === k ? "on" : ""}" href="#${k}" ${state.screen === k ? 'aria-current="page"' : ""}>${icon(k)}<span>${tx(A.screens[k])}</span></a>`).join("");
  }
  // أيقونات لوحة الأزرار (بدل النصوص)
  const KI = {
    restart: '<path d="M6 5v14M19 6l-9 6 9 6z"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
    pause: '<path d="M8 5v14M16 5v14" stroke-width="3"/>',
    step: '<path d="M5 6l8 6-8 6zM17 6v12"/>',
    next: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M17 9l3 3-3 3"/>',
    tilt: '<rect x="7" y="3" width="10" height="18" rx="2" transform="rotate(-15 12 12)"/><path d="M2 9a8 8 0 0 0 0 6M22 9a8 8 0 0 1 0 6"/>',
    lang: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18"/>'
  };
  const kicon = k => `<svg class="ki" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${KI[k]}</svg>`;
  const setKey = (id, ic, label, extra) => { const b = $(id); if (!b) return; b.innerHTML = kicon(ic) + (extra || ""); b.title = label; b.setAttribute("aria-label", label); };
  function renderFrame() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t(A.title);
    setKey("langBtn", "lang", t(C.ui.langToggle), `<b class="kt">${lang === "ar" ? "EN" : "ع"}</b>`);
    if ($("nextBtn")) setKey("nextBtn", "next", t(A.player.next));
    setKey("restartBtn", "restart", t(A.player.restart));
    setKey("stepBtn", "step", t(A.player.step) + " +1");
    $("speedLab").textContent = "";
    $("speedSel").title = t(A.player.speed); $("speedSel").setAttribute("aria-label", t(A.player.speed));
    $("speedSel").innerHTML = SPEEDS.map((s, i) => `<option value="${i}" ${i === state.speed ? "selected" : ""}>×${s}</option>`).join("");
    $("dayLab").textContent = t(A.player.day);
    $("dayOf").textContent = "/" + (D - 1);
    $("synthTag").textContent = t(A.synthetic);
    $("disclaimer").textContent = ""; $("synthTag").title = t(A.disclaimer);
    const pct = x => x / (D - 1) * 100 + "%";
    $("tlAdapt").style.width = pct(sim.adaptation.days);
    $("tlCalib").style.left = pct(sim.adaptation.days); $("tlCalib").style.width = pct(crew[0].pers.active - sim.adaptation.days);
  }
  function renderTimeline() {
    const d = state.day;
    $("tlDone").style.width = d / (D - 1) * 100 + "%";
    $("scrub").value = d;
    $("tlTicks").innerHTML = crew.flatMap(c => c.events.filter(e => e.level >= 2 && e.day <= d).map(e => `<i style="left:${e.day / (D - 1) * 100}%;background:${LV(e.level)};box-shadow:0 0 6px ${LV(e.level)}"></i>`)).join("");
  }
  function renderPlayer() {
    setKey("playBtn", state.playing ? "pause" : "play", state.playing ? t(A.player.pause) : t(A.player.play));
    $("dayNum").textContent = state.day;
    const ph = phaseOf(state.day);
    $("phase").className = "phase " + ph; $("phase").textContent = t(A.phase[ph]);
  }

  function render() {
    cancelAnimationFrame(ecgRaf);
    const [html, after] = SCREENS[state.screen] || SCREENS.home;
    if ($("subtitle")) $("subtitle").textContent = state.screen === "home" ? t(A.subtitle) : "";
    $("screenTitle").textContent = state.screen === "home" ? t(A.title) : t(A.screens[state.screen]);
    $("view").innerHTML = html();
    if (slideDir) {
      const v = $("view"), fromLeft = (slideDir > 0) === isRtl();
      v.classList.remove("in-l", "in-r"); void v.offsetWidth; v.classList.add(fromLeft ? "in-l" : "in-r");
      slideDir = 0;
    }
    if (after) after();
    renderDots(); renderGhosts();
    renderTabs(); renderTimeline(); renderPlayer();
    if ($("telemetry")) renderTelemetry();
  }
  function stepMember(k) {
    const i = crew.findIndex(c => c.m.id === state.member);
    state.member = crew[(i + k + crew.length) % crew.length].m.id;
    render();
  }
  // أثناء التشغيل: لا نعيد بناء الشاشة إذا كان المستخدم يكتب
  function tickRender() {
    const ae = document.activeElement;
    if (ae && $("view").contains(ae) && /TEXTAREA|INPUT|SELECT/.test(ae.tagName)) { renderTabs(); renderTimeline(); renderPlayer(); return; }
    render();
  }

  // ---------- التشغيل ----------
  let timer = 0, lastTick = 0, acc = 0, seen = new Set();
  function loop(now) {
    if (!state.playing) return;
    const dt = (now - lastTick) / 1000; lastTick = now;
    acc += dt * SPEEDS[state.speed];
    if (acc >= 1) {
      const steps = Math.floor(acc); acc -= steps;
      setDay(state.day + steps, true);
      if (state.day >= D - 1) { state.playing = false; renderPlayer(); return; }
    }
    timer = requestAnimationFrame(loop);
  }
  function setPlaying(p) {
    state.playing = p;
    if (p) { if (state.day >= D - 1) setDay(0); lastTick = performance.now(); acc = 0; timer = requestAnimationFrame(loop); }
    else cancelAnimationFrame(timer);
    renderPlayer();
  }
  function setDay(d, fromPlay) {
    const prev = state.day;
    state.day = clamp(d, 0, D - 1);
    if (fromPlay) notifyNew(prev, state.day);
    else seenUpTo(state.day);
    tickRender();
  }
  function seenUpTo(d) { seen = new Set(); crew.forEach(c => c.events.forEach(e => { if (e.day <= d) seen.add(c.m.id + e.day); })); }
  function notifyNew(from, to) {
    crew.forEach(c => c.events.forEach(e => {
      const k = c.m.id + e.day;
      if (e.day > from && e.day <= to && e.level >= 2 && !seen.has(k)) { seen.add(k); toast(c, e); }
    }));
  }
  function toast(c, e) {
    const el = document.createElement("div");
    el.className = "toast"; el.style.setProperty("--c", lvColor(e.level));
    el.innerHTML = `<span class="dot" style="--c:${lvColor(e.level)};margin-top:6px"></span><div><b>${tx(L.newAlert)} · ${tx(C.alerts[e.level].name)}</b>${tx(c.m.name)} · ${tx(A.player.day)} <span dir="ltr">${e.day}</span></div>`;
    el.onclick = () => { state.member = c.m.id; go("demo"); el.remove(); };
    $("toasts").appendChild(el);
    while ($("toasts").children.length > 3) $("toasts").firstChild.remove();
    setTimeout(() => el.remove(), 6000);
  }

  // ---------- التنقل بين الشاشات: سحب بالماوس أو الإصبع، عجلة أفقية، أسهم، وإمالة الجوال ----------
  let slideDir = 0;
  function navStep(k) {
    let i = TABS.indexOf(state.screen); if (i < 0) i = 0;
    slideDir = k;
    go(TABS[(i + k + TABS.length) % TABS.length]);
  }
  const isRtl = () => lang === "ar";
  function bindGestures() {
    const vp = document.querySelector(".viewport") || $("view");
    let st = null, moved = false;
    const view = () => $("view");
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rubber = (x, dim) => { const c = .55; return (x * dim * c) / (dim + c * Math.abs(x)); };
    vp.addEventListener("pointerdown", e => {
      if (e.button > 0 || e.target.closest("input,select,textarea,video,.edge")) { st = null; return; }
      st = { x: e.clientX, y: e.clientY, hist: [{ x: e.clientX, t: performance.now() }], id: e.pointerId, lock: 0 }; moved = false;
      view().style.transition = "none";
    });
    vp.addEventListener("pointermove", e => {
      if (!st) return;
      const dx = e.clientX - st.x, dy = e.clientY - st.y;
      if (!st.lock && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) st.lock = Math.abs(dx) > Math.abs(dy) ? 1 : -1;
      if (st.lock !== 1) return;
      if (!moved) { moved = true; try { vp.setPointerCapture(st.id); } catch (er) { /* */ } }
      st.hist.push({ x: e.clientX, t: performance.now() }); if (st.hist.length > 6) st.hist.shift();
      const w = vp.clientWidth || 800, x = rubber(dx, w);
      if (!reduce) { view().style.transform = `translate3d(${x}px,0,0)`; view().style.opacity = String(1 - Math.min(.35, Math.abs(x) / w)); }
    });
    const settle = () => { const v = view(); v.style.transition = "transform .42s cubic-bezier(.2,.9,.25,1), opacity .3s"; v.style.transform = ""; v.style.opacity = ""; };
    const end = e => {
      if (!st) return;
      const dx = e.clientX - st.x, h = st.hist, a = h[0], b = h[h.length - 1];
      const vel = b.t > a.t ? (b.x - a.x) / (b.t - a.t) * 1000 : 0; // px/s
      const proj = dx + (vel / 1000) * .998 / (1 - .998) * .25;      // إسقاط الزخم
      const ok = moved && st.lock === 1 && Math.abs(proj) > Math.min(160, (vp.clientWidth || 800) * .18);
      st = null;
      if (ok) { const v = view(); v.style.transition = "none"; v.style.transform = ""; v.style.opacity = ""; navStep((isRtl() ? proj > 0 : proj < 0) ? 1 : -1); }
      else settle();
    };
    vp.addEventListener("pointerup", end);
    vp.addEventListener("pointercancel", () => { st = null; settle(); });
    // منع النقرة بعد السحب
    vp.addEventListener("click", e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    // عجلة/لوحة لمس أفقية
    let acc = 0, lastNav = 0;
    vp.addEventListener("wheel", e => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      acc += e.deltaX;
      const now = Date.now();
      if (Math.abs(acc) > 80 && now - lastNav > 700) {
        const next = isRtl() ? acc < 0 : acc > 0;
        acc = 0; lastNav = now; navStep(next ? 1 : -1);
      }
    }, { passive: false });
    $("edgePrev").onclick = () => navStep(-1);
    $("edgeNext").onclick = () => navStep(1);
    // ميلان ثلاثي الأبعاد خفيف للوحة مع حركة الماوس
    const holo = document.querySelector(".holo");
    if (holo && window.matchMedia && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.matchMedia("(pointer: fine)").matches) {
      holo.addEventListener("mousemove", e => {
        const r = holo.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
        holo.style.setProperty("--ry", (nx * 2.4).toFixed(2) + "deg"); holo.style.setProperty("--rx", (-ny * 1.6).toFixed(2) + "deg");
      });
      holo.addEventListener("mouseleave", () => { holo.style.setProperty("--ry", "0deg"); holo.style.setProperty("--rx", "0deg"); });
    }
    // إمالة الجوال يمين/يسار
    const tb = $("tiltBtn");
    const hasTilt = "DeviceOrientationEvent" in window && window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    if (tb && hasTilt) {
      tb.hidden = false;
      let on = false, armed = true, cool = 0;
      const onTilt = ev => {
        const gm = ev.gamma; if (gm == null) return;
        const now = Date.now();
        if (Math.abs(gm) < 10) { armed = true; return; }
        if (!armed || now < cool || Math.abs(gm) < 25) return;
        armed = false; cool = now + 900;
        const next = isRtl() ? gm < 0 : gm > 0;   // الإمالة نحو جهة الشاشة التالية
        navStep(next ? 1 : -1);
      };
      const label = () => { setKey("tiltBtn", "tilt", t(on ? A.player.tiltOn : A.player.tilt)); tb.classList.toggle("on", on); };
      tb.onclick = async () => {
        if (!on && typeof DeviceOrientationEvent.requestPermission === "function") {
          try { await DeviceOrientationEvent.requestPermission(); } catch (e) { /* نكمل؛ إن لم يُسمح فلن تصل أحداث */ }
        }
        on = !on;
        if (on) window.addEventListener("deviceorientation", onTilt); else window.removeEventListener("deviceorientation", onTilt);
        label();
      };
      label();
      tb._label = label;
    }
  }
  // الصفحتان السابقة والتالية على جانبي اللوحة (عرض منحنٍ بمنظور الشخص الأول)
  let ghostKey = "";
  function renderGhosts() {
    if (!$("ghostL")) return;
    const i = Math.max(0, TABS.indexOf(state.screen)), n = TABS.length;
    const prev = TABS[(i - 1 + n) % n], next = TABS[(i + 1) % n];
    const left = isRtl() ? next : prev, right = isRtl() ? prev : next;
    const key = [left, right, lang, state.member, Math.floor(state.day / 5)].join("|");
    if (key === ghostKey) return; ghostKey = key;
    const fill = (el, scr, k) => {
      let body = "";
      try { body = SCREENS[scr][0]().replace(/\s(id|for)="[^"]*"/g, "").replace(/<video[\s\S]*?<\/video>/g, `<img src="media/vitalx-poster.jpg" alt="" style="width:100%;border-radius:14px">`); } catch (e) { body = ""; }
      el.innerHTML = `<div class="g-head">${icon(scr)}<b>${tx(A.screens[scr])}</b></div><div class="g-body">${body}</div>`;
      el.onclick = () => navStep(k);
      el.title = t(A.screens[scr]);
    };
    fill($("ghostL"), left, isRtl() ? 1 : -1);
    fill($("ghostR"), right, isRtl() ? -1 : 1);
  }
  function renderDots() {
    if (!$("dots")) return;
    $("dots").innerHTML = TABS.map(k => `<i class="${k === state.screen ? "on" : ""}"></i>`).join("");
    const L1 = isRtl() ? "›" : "‹", R1 = isRtl() ? "‹" : "›";
    $("edgePrev").textContent = L1; $("edgeNext").textContent = R1;
    if ($("tiltBtn") && $("tiltBtn")._label) $("tiltBtn")._label();
  }

  // ---------- التوجيه عبر الرابط ----------
  function go(path) { if (location.hash.slice(1) === path) route(); else location.hash = path; }
  function route() {
    const [scr, arg] = location.hash.slice(1).split("/");
    state.screen = SCREENS[scr] ? scr : "home";
    render();
    $("view").focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }

  // ---------- الأحداث ----------
  function bind() {
    $("playBtn").onclick = () => setPlaying(!state.playing);
    $("restartBtn").onclick = () => { setPlaying(false); setDay(0); };
    $("stepBtn").onclick = () => { setPlaying(false); setDay(state.day + 1, true); };
    $("speedSel").onchange = e => { state.speed = +e.target.value; };
    $("scrub").oninput = e => setDay(+e.target.value);
    const toggleLang = () => { lang = lang === "ar" ? "en" : "ar"; try { localStorage.setItem("vitalx-lang", lang); } catch (e) { /* */ } renderFrame(); render(); };
    $("langBtn").onclick = toggleLang;
    if ($("nextBtn")) $("nextBtn").onclick = () => stepMember(1);
    window.addEventListener("hashchange", route);
    if ($("edgePrev")) bindGestures();
    let rz = 0; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(render, 120); });
    document.addEventListener("keydown", e => {
      if (/INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || "")) return;
      if (e.code === "Space") { e.preventDefault(); setPlaying(!state.playing); }
      if (e.key === "ArrowRight") navStep(isRtl() ? -1 : 1);
      if (e.key === "ArrowLeft") navStep(isRtl() ? 1 : -1);
      if (e.key === "PageUp" || e.key === "]" ) setDay(state.day + 1);
      if (e.key === "PageDown" || e.key === "[") setDay(state.day - 1);
    });
    $("view").addEventListener("click", e => {
      const el = e.target.closest("[data-go],[data-member],[data-step]");
      if (!el) return;
      if (el.dataset.go) return go(el.dataset.go);
      if (el.dataset.member) { state.member = el.dataset.member; return render(); }
      if (el.dataset.step) return stepMember(+el.dataset.step);
    });
    $("view").addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.dataset && e.target.dataset.go) { e.preventDefault(); go(e.target.dataset.go); } });
  }

  // ---------- البدء ----------
  compute();
  // يوم البداية: نظامنا كشف الانحراف والحد الثابت لم يكشفه بعد (يمكن الرجوع لليوم 0)
  let start = 75;
  try { const q = new URLSearchParams(location.search).get("day"); if (q != null) start = clamp(parseInt(q, 10) || 0, 0, D - 1); } catch (e) { /* */ }
  state.day = start; seenUpTo(start);
  // صور اختيارية: خلفية المركبة وصورة الرائد. إذا لم تكن موجودة يبقى الرسم المدمج
  const probe = (src, cls, cb) => { const im = new Image(); im.onload = () => { document.body.classList.add(cls); if (cb) cb(); }; im.src = src; };
  probe("media/ship-bg.jpg", "has-ship");
  probe("media/astronaut.png", "has-astro", () => { hasAstroImg = true; render(); });
  renderFrame(); bind(); route();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render());
})();
