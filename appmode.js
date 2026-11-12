/* =====================================================================
   VITALX — وضع التطبيق (app.html)
   يشغّل المحرك نفسه (engine.js) على طاقم من 4 رواد صناعيين، ويكشف
   البيانات يوماً بيوم كأنها تصل من الحساسات. النصوص في content.js → appMode.
   كل تنبيه في يوم ما محسوب من بيانات ذلك اليوم وما قبله فقط.
   ===================================================================== */
(function () {
  "use strict";
  const C = window.VITALX_CONTENT, E = window.VITALX_ENGINE, A = C.appMode;
  const $ = id => document.getElementById(id);
  const clone = o => JSON.parse(JSON.stringify(o));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const DEFAULT_SIM = clone(C.sim);
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

  // ---------- الحالة المحفوظة ----------
  const STORE = "vitalx-app-v1";
  let saved = { acks: {}, decisions: {}, log: [] };
  try { const s = JSON.parse(localStorage.getItem(STORE) || "null"); if (s) saved = Object.assign(saved, s); } catch (e) { /* */ }
  const persist = () => { try { localStorage.setItem(STORE, JSON.stringify(saved)); } catch (e) { /* */ } };

  const state = {
    day: 0, playing: false, speed: 2, screen: "crew", member: "A", channel: "hr",
    showTruth: false, showInfo: false, filter: "open", episode: null
  };
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
  }
  const crewById = id => crew.find(c => c.m.id === id) || crew[0];

  // نوبات التنبيه: تنبيهات الرائد المتقاربة (خلال 7 أيام) تُجمع في نوبة واحدة
  const MERGE = 7;
  function episodesUpTo(day) {
    const out = [];
    crew.forEach(c => {
      let ep = null;
      c.events.forEach(ev => {
        if (ev.day > day) return;
        if (ep && ev.day - ep.last <= MERGE) {
          ep.last = ev.day; ep.events.push(ev);
          if (ev.level > ep.level) { ep.level = ev.level; ep.peakDay = ev.day; }
        } else {
          ep = { id: c.m.id + "-" + ev.day, crew: c, start: ev.day, last: ev.day, level: ev.level, peakDay: ev.day, events: [ev] };
          out.push(ep);
        }
      });
    });
    out.forEach(ep => {
      const dec = saved.decisions[ep.id];
      ep.decision = dec || null;
      ep.acked = saved.acks[ep.id] != null;
      ep.reopened = !!(dec && ep.last > dec.day);
      ep.open = ep.level >= 2 ? (!dec || ep.reopened) : !ep.acked;
    });
    return out.sort((a, b) => b.last - a.last || b.level - a.level);
  }

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
    devices: '<rect x="6" y="5" width="12" height="14" rx="3"/><path d="M9 5V2h6v3M9 19v3h6v-3M10 12h4"/>'
  };
  const icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;
  const TABS = ["crew", "member", "trends", "alerts", "review", "habitat", "settings"];

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

  // =====================================================================
  //  رسم الرائد مع مواضع الحساسات (SVG)
  // =====================================================================
  function bodySVG(c, day) {
    const cols = {};
    chIds().forEach(id => {
      const z = c.pers.z[id][day];
      cols[id] = z == null ? css("--simulated") : Math.abs(z) < 2 ? "#3ddc97" : z * sim.channels[id].direction > 0 ? (Math.abs(z) < 3 ? "#ffb547" : "#ff5d6c") : "#6aa8ff";
    });
    const dot = (x, y, col, r) => `<circle cx="${x}" cy="${y}" r="${r + 6}" fill="${col}" opacity=".18" class="sdot"/><circle cx="${x}" cy="${y}" r="${r}" fill="${col}" stroke="#fff" stroke-width="1.2"/>`;
    return `<svg viewBox="0 0 120 220" role="img" aria-label="${esc(t(A.labels.sensors))}">
      <defs>
        <linearGradient id="suit" x1="0" x2="1"><stop offset="0" stop-color="#cfd8e8"/><stop offset=".55" stop-color="#eef3fb"/><stop offset="1" stop-color="#a9b6cc"/></linearGradient>
        <radialGradient id="visor" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#7fe3ff"/><stop offset=".45" stop-color="#1b4a7a"/><stop offset="1" stop-color="#071528"/></radialGradient>
        <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".5"/></filter>
      </defs>
      <g filter="url(#sh)">
        <path d="M38 64 Q60 54 82 64 L90 118 Q60 128 30 118 Z" fill="url(#suit)"/>
        <path d="M38 66 L24 112 Q22 122 28 124 L34 122 L44 82 Z" fill="url(#suit)"/>
        <path d="M82 66 L96 112 Q98 122 92 124 L86 122 L76 82 Z" fill="url(#suit)"/>
        <path d="M34 116 L40 196 Q41 204 50 204 L56 202 L58 124 Z" fill="url(#suit)"/>
        <path d="M86 116 L80 196 Q79 204 70 204 L64 202 L62 124 Z" fill="url(#suit)"/>
        <rect x="44" y="198" width="14" height="10" rx="3" fill="#7d8aa3"/><rect x="62" y="198" width="14" height="10" rx="3" fill="#7d8aa3"/>
        <circle cx="60" cy="38" r="22" fill="url(#suit)"/>
        <ellipse cx="60" cy="40" rx="15" ry="13" fill="url(#visor)"/>
        <path d="M50 33 Q55 29 62 30" stroke="rgba(255,255,255,.7)" stroke-width="2" fill="none" stroke-linecap="round"/>
        <rect x="48" y="78" width="24" height="16" rx="3" fill="#8794ad" opacity=".6"/>
      </g>
      ${dot(60, 86, cols.hr, 4.5)}
      ${dot(27, 116, cols.sleep, 4)}
      ${dot(76, 70, css("--built"), 3.5)}
      ${chIds().includes("chem") ? dot(86, 90, cols.chem, 3.5) : ""}
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
  const pill = (s, pulse) => `<span class="lv-pill${pulse ? " pulse" : ""}" style="--c:${statusCss(s)}">${tx(A.status[s])}</span>`;
  const chName = id => t(sim.channels[id].name);
  const lastEpisodeOf = (eps, c) => eps.find(e => e.crew === c);

  function screenCrew() {
    const d = state.day, eps = episodesUpTo(d);
    const cards = crew.map(c => {
      const s = statusOf(c, d), ep = lastEpisodeOf(eps.filter(e => e.level >= 2 || state.showInfo), c);
      const v = id => c.ast.obs[id][d];
      return `<div class="card crew-card" tabindex="0" role="button" data-go="member/${c.m.id}" style="--c:${statusCss(s)}">
        <div class="crew-head"><div class="avatar">${esc(c.m.id)}</div>
          <div><b>${tx(c.m.name)}</b><small>${tx(c.m.role)}</small></div>${pill(s, s === 3)}</div>
        <div class="mini">
          <div><small>${esc(chName("hr"))}</small><b dir="ltr">${fmt(v("hr"), 0)}<em>bpm</em></b></div>
          <div><small>${esc(chName("sleep"))}</small><b dir="ltr">${fmt(v("sleep"), 1)}<em>h</em></b></div>
          <div><small>${tx(L.dose)}</small><b dir="ltr">${fmt(c.ast.rad[d], 1)}<em>mSv</em></b></div>
        </div>
        <small class="muted">${tx(L.composite)}</small>
        <canvas class="spark" data-spark="${c.m.id}"></canvas>
        <div class="crew-foot"><span>${tx(L.lastAlert)}: ${ep ? `<b style="color:${LV(ep.level)}">${tx(C.alerts[ep.level].name)}</b> · ${tx(A.player.day)} <span dir="ltr">${ep.last}</span>` : tx(L.none)}</span><span>${tx(L.open)} ›</span></div>
      </div>`;
    }).join("");
    const co2 = cabinCo2(), cb = crew[0].pers.band.co2[d];
    const openEps = eps.filter(e => e.open && e.level >= 2);
    return `<div class="grid g4">${cards}</div>
      <div class="grid g-main" style="margin-top:14px">
        <div class="card"><h3>${tx(A.screens.alerts)} <span class="unit">${openEps.length}</span></h3>${alertList(openEps.slice(0, 4), true)}</div>
        <div class="card"><h3>${tx(L.cabinCo2)} <span class="unit">mmHg</span></h3>${chartBox("cvCo2Mini", "short")}
          <div class="legend"><span><i style="background:${css("--fixed")}"></i>${tx(L.fixedThr)} <span dir="ltr">${sim.fixed.thresholds.co2.value}</span></span>
          <span class="mono" dir="ltr">${fmt(co2[d], 2)} mmHg</span></div></div>
      </div>`;
  }
  function afterCrew() {
    const d = state.day;
    document.querySelectorAll("[data-spark]").forEach(cv => { const c = crewById(cv.dataset.spark); sparkline(cv, c.pers.composite, d, statusColor(statusOf(c, d) === "calib" ? 0 : statusOf(c, d))); });
    const co2 = cabinCo2();
    drawChart($("cvCo2Mini"), { day: d, series: [{ data: co2, color: "#8b7bff", width: 2, fill: true, glow: true, head: true, label: t(L.cabinCo2), unit: "mmHg", dec: 2 }],
      hlines: [{ y: sim.fixed.thresholds.co2.value, color: css("--fixed") }] });
  }
  function cabinCo2() { return Array.from({ length: D }, (_, i) => crew.reduce((s, c) => s + c.ast.obs.co2[i], 0) / crew.length); }

  function memberTabs() {
    return `<div class="seg" role="tablist">${crew.map(c => `<button type="button" data-member="${c.m.id}" class="${c.m.id === state.member ? "on" : ""}">${tx(c.m.name)}</button>`).join("")}</div>`;
  }

  function screenMember() {
    const c = crewById(state.member), d = state.day, s = statusOf(c, d);
    const calib = d < c.pers.active;
    const g = id => {
      const b = c.pers.band[id][d], ch = sim.channels[id];
      return gauge({ id, label: ch.name, unit: ch.unit, value: c.ast.obs[id][d], med: b.med, scale: b.scale, dir: ch.direction, dec: id === "hr" ? 0 : id === "co2" ? 2 : 1, calibrating: calib });
    };
    const comp = c.pers.composite[d];
    const compG = gauge({ id: "comp", label: L.composite, unit: "z", value: comp == null ? 0 : comp, med: 0, scale: 1, dir: 1, dec: 1, calibrating: calib });
    // المساهمات اليوم
    const ids = chIds();
    const bars = calib ? `<p class="muted">${tx(A.phase.calib)}</p>` : `<div class="bars">${ids.map(id => {
      const z = c.pers.z[id][d], bad = z * sim.channels[id].direction;
      const w = clamp(Math.abs(bad) / 5, 0, 1) * 50;
      const col = Math.abs(z) < 2 ? "#3ddc97" : bad > 0 ? (Math.abs(z) < 3 ? "#ffb547" : "#ff5d6c") : "#6aa8ff";
      const side = bad >= 0 ? `left:50%;width:${w}%` : `left:${50 - w}%;width:${w}%`;
      return `<div class="bar-row"><span>${esc(chName(id))}</span><div class="bar-track"><span class="mid"></span><span class="bar-fill" style="--c:${col};${side}"></span></div><span class="mono" dir="ltr">${bad >= 0 ? "+" : ""}${fmt(bad, 1)}</span></div>`;
    }).join("")}</div>`;
    const lvText = s !== "calib" && s > 0 ? `<p style="margin:12px 0 0">${tx(C.alerts[s].text)}</p>` : "";
    return `<div class="toolbar">${memberTabs()} ${pill(s, s === 3)} <span class="muted">${tx(c.m.role)}</span></div>
      <div class="gauges">${g("hr")}${g("sleep")}${g("co2")}${compG}</div>
      <div class="grid g3" style="margin-top:14px">
        <div class="card"><h3>${tx(L.why)} <span class="unit">${tx(A.player.day)} <span dir="ltr">${d}</span></span></h3>
          <p class="card-sub">${tx(L.contrib)}</p>${bars}${lvText}</div>
        <div class="card"><h3>${esc(chName("hr"))} <span class="unit">ECG · bpm</span></h3>
          <canvas class="ecg" id="ecg"></canvas>
          <div class="ecg-row"><span>${tx(L.waveform)}</span><b dir="ltr">${fmt(c.ast.obs.hr[d], 0)}</b></div></div>
        <div class="card"><h3>${tx(L.sensors)}</h3><div class="body-wrap">${bodySVG(c, d)}
          <ul class="sensor-list">${(C.deviceDiagram || []).slice(0, 4).map(x => `<li><span class="dot" style="--c:var(--${x.status})"></span>${tx(x.label)}</li>`).join("")}</ul></div></div>
      </div>
      <h3 class="sec-h">${tx(A.screens.trends)}</h3>
      <div class="card">${chartBox("cvMember")}${trendLegend()}</div>`;
  }
  function afterMember() {
    const c = crewById(state.member), d = state.day;
    startEcg($("ecg"), () => crewById(state.member).ast.obs.hr[state.day]);
    drawChannel($("cvMember"), c, "hr", d);
  }

  function trendLegend() {
    return `<div class="legend"><span><i style="background:#e7ecf7"></i>${tx(L.observed)}</span>
      <span><i style="background:rgba(95,212,255,.45)"></i>${tx(L.baselineBand)}</span>
      <span><i style="background:${css("--fixed")}"></i>${tx(L.fixedThr)}</span>
      <span><i style="background:${css("--accent-2")}"></i>${tx(L.projection)}</span>
      <span>▼ ${tx(C.ui.chart.personalAlert)}</span><span class="muted">${tx(L.hover)}</span></div>`;
  }
  function projectionNow(c, d) {
    const ch = sim.channels.hr, pr = sim.projection, at = c.pers.active;
    if (d < at + pr.window) return null;
    const b = c.pers.band.hr[at];
    const thr = b.med + ch.direction * pr.monitorZ * b.scale;
    const p = E.projectCrossing(c.ast.obs.hr, d, pr.window, thr, ch.direction);
    return { thr, p };
  }
  function drawChannel(cv, c, id, d) {
    const ch = sim.channels[id], pers = c.pers;
    const lo = pers.band[id].map((b, i) => i >= pers.active ? b.med - 3 * b.scale : null);
    const hi = pers.band[id].map((b, i) => i >= pers.active ? b.med + 3 * b.scale : null);
    const series = [{ data: c.ast.obs[id], color: id === "chem" ? css("--future") : "#e7ecf7", width: 1.8, fill: true, glow: true, head: true, label: t(ch.name), unit: ch.unit, dec: id === "co2" ? 2 : 1 }];
    const hl = [], vl = [];
    const th = sim.fixed.thresholds[id];
    if (th) hl.push({ y: th.value, color: css("--fixed"), label: t(L.fixedThr) });
    if (id === "hr") {
      const pj = projectionNow(c, d);
      if (pj) {
        hl.push({ y: pj.thr, color: css("--accent-2"), dash: [2, 3] });
        if (pj.p && pj.p.fit && pj.p.day > d && pj.p.day - d <= 60) {
          const xs = [], ys = [], end = Math.min(D - 1, Math.ceil(pj.p.day) + 2);
          for (let x = d - sim.projection.window + 1; x <= end; x++) { xs.push(x); ys.push(pj.p.fit.at(x)); }
          series.push({ data: ys, xs, color: css("--accent-2"), width: 2.2, dash: [7, 5], glow: true });
        }
      }
    }
    if (state.showTruth) vl.push({ x: c.ast.onset, color: css("--danger"), label: t(L.onset) });
    const markers = c.events.filter(e => e.level >= 2).map(e => ({ x: e.day, level: e.level }));
    drawChart(cv, { day: d, series, band: { lo, hi }, hlines: hl, vlines: vl, markers });
    attachHover(cv.parentNode);
  }

  function screenTrends() {
    const c = crewById(state.member), d = state.day;
    const pj = projectionNow(c, d);
    let pText = "";
    if (state.channel === "hr") {
      if (pj && pj.p && pj.p.day > d && pj.p.day - d <= 60) pText = `${tx(L.projText)} <b dir="ltr">${Math.round(pj.p.day)}</b>.`;
      else pText = tx(L.projNone);
      pText = `<div class="card" style="margin-top:14px"><h3>${tx(L.projection)} <span class="unit" dir="ltr">w=${sim.projection.window}</span></h3><p style="margin:0">${pText}</p><p class="muted" style="margin:6px 0 0;font-size:.85rem">${tx(L.projNote)}</p></div>`;
    }
    return `<div class="toolbar">${memberTabs()}
        <div class="seg">${chIds().map(id => `<button type="button" data-channel="${id}" class="${id === state.channel ? "on" : ""}">${esc(chName(id))}</button>`).join("")}</div>
        <label class="chk"><input type="checkbox" id="truthChk" ${state.showTruth ? "checked" : ""}> ${tx(L.truth)}</label></div>
      <div class="card"><h3>${tx(c.m.name)} · ${esc(chName(state.channel))} <span class="unit">${esc(t(sim.channels[state.channel].unit))}</span></h3>${chartBox("cvTrend", "tall")}${trendLegend()}</div>
      ${pText}
      <div class="card" style="margin-top:14px"><h3>${tx(C.ui.chart.composite)} <span class="unit" dir="ltr">S+ · h=${sim.personal.h}</span></h3>${chartBox("cvCus", "short")}</div>`;
  }
  function afterTrends() {
    const c = crewById(state.member), d = state.day;
    if (!chIds().includes(state.channel)) state.channel = "hr";
    drawChannel($("cvTrend"), c, state.channel, d);
    drawChart($("cvCus"), { day: d, yMin: 0, series: [{ data: c.pers.compS, color: css("--personal"), width: 2, fill: true, glow: true, head: true, label: "S+", dec: 2 }],
      hlines: [{ y: sim.personal.h, color: css("--danger"), label: "h" }], markers: c.events.filter(e => e.level >= 2).map(e => ({ x: e.day, level: e.level })) });
    attachHover($("cvCus").parentNode);
  }

  // ---------- التنبيهات ----------
  function topContrib(ep) {
    const ex = ep.crew.pers.explain[ep.peakDay];
    if (!ex) return [];
    return ex.filter(x => x.bad > 0).sort((a, b) => b.bad * b.w - a.bad * a.w).slice(0, 2);
  }
  function epState(ep) {
    if (ep.decision) {
      const k = ep.decision.type;
      const lab = { approved: A.review.approved, dismissed: A.review.dismissed, escalated: A.review.escalated }[k];
      return `<span class="state ${k === "approved" ? "ok" : k === "escalated" ? "esc" : "no"}">${tx(lab)}${ep.reopened ? " · " + tx(A.alertsUi.newAlert) : ""}</span>`;
    }
    if (ep.acked) return `<span class="state">${tx(A.alertsUi.acked)}</span>`;
    return "";
  }
  function alertList(eps, compact) {
    if (!eps.length) return `<div class="empty">${tx(A.alertsUi.empty)}</div>`;
    return `<div class="alist">${eps.map(ep => {
      const tc = topContrib(ep).map(x => `${esc(chName(x.id))} <span dir="ltr">z ${x.z >= 0 ? "+" : ""}${x.z.toFixed(1)}</span>`).join(" · ");
      const acts = [];
      if (!ep.acked && !ep.decision) acts.push(`<button class="abtn" type="button" data-ack="${ep.id}">${tx(A.alertsUi.ack)}</button>`);
      if (ep.level >= 2) acts.push(`<button class="abtn ${ep.open ? "go" : ""}" type="button" data-go="review/${ep.id}">${tx(A.alertsUi.review)}</button>`);
      return `<div class="card aitem ${ep.open ? "" : "done"}" style="--c:${LV(ep.level)}"><span class="stripe"></span>
        <div><div class="a-top"><b style="color:${LV(ep.level)}">${tx(C.alerts[ep.level].name)}</b><b>${tx(ep.crew.m.name)}</b>
          <span class="muted">${tx(A.player.day)} <span dir="ltr">${ep.start}${ep.last !== ep.start ? "–" + ep.last : ""}</span></span>${epState(ep)}</div>
          ${compact ? "" : `<div class="a-text">${tx(C.alerts[ep.level].text)}</div>`}
          ${tc ? `<div class="a-text">${tx(A.alertsUi.top)}: ${tc}</div>` : ""}</div>
        <div class="a-act">${acts.join("")}</div></div>`;
    }).join("")}</div>`;
  }
  function screenAlerts() {
    let eps = episodesUpTo(state.day);
    if (!state.showInfo) eps = eps.filter(e => e.level >= 2);
    if (state.filter === "open") eps = eps.filter(e => e.open);
    return `<div class="toolbar"><div class="seg">
        <button type="button" data-filter="open" class="${state.filter === "open" ? "on" : ""}">${tx(A.alertsUi.filterOpen)}</button>
        <button type="button" data-filter="all" class="${state.filter === "all" ? "on" : ""}">${tx(A.alertsUi.filterAll)}</button></div>
        <label class="chk"><input type="checkbox" id="infoChk" ${state.showInfo ? "checked" : ""}> ${tx(A.alertsUi.filterInfo)}</label></div>
      ${alertList(eps)}`;
  }

  // ---------- مراجعة الطبيب ----------
  function screenReview() {
    const eps = episodesUpTo(state.day);
    const ep = eps.find(e => e.id === state.episode) || eps.find(e => e.open && e.level >= 2);
    const log = saved.log.slice().reverse();
    const logHTML = `<div class="card"><h3>${tx(A.review.log)} ${saved.log.length ? `<button class="abtn" type="button" id="clearLog">${tx(A.review.clear)}</button>` : ""}</h3>
      ${log.length ? `<ul class="log">${log.map(l => `<li><small dir="ltr">D${l.day}</small> · <b>${esc(l.who)}</b> · ${esc(l.what)}${l.note ? ` — <span class="muted">${esc(l.note)}</span>` : ""}</li>`).join("")}</ul>` : `<p class="muted">${tx(A.review.logEmpty)}</p>`}</div>`;
    if (!ep) return `<div class="grid g-main"><div class="card"><p class="empty">${tx(A.review.pick)}</p></div>${logHTML}</div>`;
    state.episode = ep.id;
    const c = ep.crew, tc = topContrib(ep);
    const keys = tc.map(x => x.id).filter((v, i, a) => a.indexOf(v) === i);
    const sugg = keys.concat(["monitor"]).concat(ep.level >= 3 ? ["ground"] : []);
    const dec = ep.decision;
    const evid = (c.pers.explain[ep.peakDay] || []).map(x => {
      const w = clamp(Math.abs(x.bad) / 5, 0, 1) * 50, col = x.bad > 3 ? "#ff5d6c" : x.bad > 2 ? "#ffb547" : x.bad > -2 ? "#3ddc97" : "#6aa8ff";
      const side = x.bad >= 0 ? `left:50%;width:${w}%` : `left:${50 - w}%;width:${w}%`;
      return `<div class="bar-row"><span>${esc(chName(x.id))}</span><div class="bar-track"><span class="mid"></span><span class="bar-fill" style="--c:${col};${side}"></span></div><span class="mono" dir="ltr">${x.bad >= 0 ? "+" : ""}${x.bad.toFixed(1)}</span></div>`;
    }).join("");
    return `<div class="grid g-main">
      <div>
        <div class="card" style="border-top:3px solid ${LV(ep.level)}">
          <h3><span><b style="color:${LV(ep.level)}">${tx(C.alerts[ep.level].name)}</b> · ${tx(c.m.name)} · ${tx(A.player.day)} <span dir="ltr">${ep.peakDay}</span></span>${epState(ep)}</h3>
          <p style="margin-top:0">${tx(C.alerts[ep.level].text)}</p>
          <h4 class="sec-h" style="margin-top:6px">${tx(A.review.evidence)}</h4>
          <p class="card-sub">${tx(L.contrib)}</p><div class="bars">${evid}</div>
          <div style="margin-top:14px">${chartBox("cvReview", "short")}</div>
        </div>
        <div class="card" style="margin-top:14px">
          <h3>${tx(A.review.suggestions)} <span class="chip s-pending" title="${esc(t(A.review.pendingWording))}">${tx(C.statusLabels.pending)}</span></h3>
          <div class="guard">🛡 <span>${tx(A.review.suggestNote)}</span></div>
          <ul class="sugg">${sugg.map(k => `<li><label><input type="checkbox" name="sg" value="${k}" ${dec ? "disabled" : ""} ${dec && dec.actions && dec.actions.includes(k) ? "checked" : ""}> <span>${tx(A.suggestions[k])}</span></label></li>`).join("")}</ul>
          ${dec && !ep.reopened ? `<p><b>${tx(A.review.decided)}:</b> ${epState(ep)} ${dec.reason ? `— <span class="muted">${esc(dec.reason)}</span>` : ""}</p><button class="abtn" type="button" id="undoDec">${tx(A.review.undo)}</button>` : `
          <textarea class="reason" id="reason" placeholder="${esc(t(A.review.reason))}"></textarea>
          <div class="toolbar" style="margin:0">
            <button class="abtn go" type="button" id="approveBtn">${tx(A.review.approve)}</button>
            <button class="abtn bad" type="button" id="dismissBtn">${tx(A.review.dismiss)}</button>
            <button class="abtn warn" type="button" id="escBtn">${tx(A.review.escalate)}</button>
          </div>`}
        </div>
      </div>
      ${logHTML}
    </div>`;
  }
  function afterReview() {
    const eps = episodesUpTo(state.day), ep = eps.find(e => e.id === state.episode);
    if (ep && $("cvReview")) {
      const c = ep.crew;
      drawChart($("cvReview"), { day: state.day, series: [{ data: c.pers.composite, color: css("--personal"), width: 2, fill: true, glow: true, head: true, label: t(L.composite), dec: 2 }],
        hlines: [{ y: 0, color: "rgba(255,255,255,.3)", dash: [2, 3] }], markers: c.events.filter(e => e.level >= 2).map(e => ({ x: e.day, level: e.level })),
        vlines: [{ x: ep.peakDay, color: lvColor(ep.level) }] });
      attachHover($("cvReview").parentNode);
    }
  }
  function decide(type) {
    const eps = episodesUpTo(state.day), ep = eps.find(e => e.id === state.episode); if (!ep) return;
    const actions = Array.from(document.querySelectorAll('input[name="sg"]:checked')).map(i => i.value);
    const reason = ($("reason") && $("reason").value.trim()) || "";
    if (type === "approved" && !actions.length) { $("approveBtn").animate([{ transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "none" }], 200); return; }
    if (type === "dismissed" && !reason) { $("reason").focus(); $("reason").style.borderColor = "var(--danger)"; return; }
    saved.decisions[ep.id] = { type, actions, reason, day: state.day };
    saved.acks[ep.id] = state.day;
    const lab = { approved: A.review.approved, dismissed: A.review.dismissed, escalated: A.review.escalated }[type];
    const what = `${t(lab)} · ${t(ep.crew.m.name)} · ${t(C.alerts[ep.level].name)}` + (actions.length ? ": " + actions.map(k => t(A.suggestions[k])).join("؛ ") : "");
    saved.log.push({ day: state.day, who: t(A.review.who), what, note: reason });
    persist(); render();
  }

  // ---------- المقصورة ----------
  function screenHabitat() {
    const d = state.day, lim = sim.radiation.limit;
    const doses = crew.map(c => `<div class="dose-row"><span>${tx(c.m.name)}</span><div class="dose-track"><span class="dose-fill" style="width:${clamp(c.ast.rad[d] / lim * 100, 0, 100)}%"></span></div><span class="mono" dir="ltr">${fmt(c.ast.rad[d], 1)}</span></div>`).join("");
    return `<div class="grid g-main">
      <div class="card"><h3>${tx(L.cabinCo2)} <span class="unit">mmHg</span></h3>${chartBox("cvCo2", "tall")}
        <div class="legend"><span><i style="background:#8b7bff"></i>${tx(L.observed)}</span><span><i style="background:${css("--fixed")}"></i>${tx(L.fixedThr)}</span><span class="muted">${tx(L.hover)}</span></div></div>
      <div class="card"><h3>${tx(L.dose)} <span class="unit">mSv · ${tx(L.limitDemo)} <span dir="ltr">${lim}</span></span></h3>
        <p class="card-sub">${tx((C.channels.find(x => x.id === "rad") || {}).reason)}</p>${doses}
        <div style="margin-top:14px">${chartBox("cvRad", "short")}</div></div>
    </div>`;
  }
  function afterHabitat() {
    const d = state.day, co2 = cabinCo2();
    drawChart($("cvCo2"), { day: d, series: [{ data: co2, color: "#8b7bff", width: 2.2, fill: true, glow: true, head: true, label: "CO2", unit: "mmHg", dec: 2 }],
      hlines: [{ y: sim.fixed.thresholds.co2.value, color: css("--fixed"), label: t(L.fixedThr) }] });
    attachHover($("cvCo2").parentNode);
    const cols = ["#5fd4ff", "#3ddc97", "#ffb547", "#c08bff"];
    drawChart($("cvRad"), { day: d, yMin: 0, series: crew.map((c, i) => ({ data: c.ast.rad, color: cols[i], width: 1.8, glow: true, head: true, label: t(c.m.name), unit: "mSv" })),
      hlines: [{ y: sim.radiation.limit, color: css("--danger"), label: t(L.limitDemo) }] });
    attachHover($("cvRad").parentNode);
  }

  // ---------- الإعدادات ----------
  function screenSettings() {
    const U = C.ui.controls, p = sim.personal;
    const rng = (id, lab, min, max, step, v) => `<div class="card set"><label for="${id}">${tx(lab)} <span class="val" id="${id}V" dir="ltr">${v}</span></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${v}"></div>`;
    return `<p class="muted" style="margin-top:0">${tx(A.settingsUi.intro)}</p>
      <div class="set-grid">
        <div class="card set"><label for="sMode">${tx(U.baseline)}</label><select id="sMode">${Object.keys(U.modes).map(k => `<option value="${k}" ${p.baselineMode === k ? "selected" : ""}>${tx(U.modes[k])}</option>`).join("")}</select></div>
        ${rng("sK", U.k, 0.1, 1.5, 0.1, p.k)}
        ${rng("sH", U.h, 2, 10, 0.5, p.h)}
        ${rng("sW", U.window, 5, 21, 1, sim.projection.window)}
        <div class="card set"><label class="chk"><input type="checkbox" id="sChem" ${p.includeChem ? "checked" : ""}> ${tx(U.chem)}</label>
          <label class="chk" style="margin-top:10px"><input type="checkbox" id="sAnchor" ${p.useAnchor ? "checked" : ""}> ${tx(U.anchor)}</label></div>
      </div>
      <div class="toolbar" style="margin-top:16px"><button class="abtn bad" type="button" id="sReset">${tx(A.settingsUi.reset)}</button>
        <a class="abtn" href="index.html#demo">${tx(C.ui.nav.demo)} ↗</a> <a class="abtn" href="devices.html">${tx(A.screens.devices)} ↗</a></div>`;
  }

  const SCREENS = {
    crew: [screenCrew, afterCrew], member: [screenMember, afterMember], trends: [screenTrends, afterTrends],
    alerts: [screenAlerts], review: [screenReview, afterReview], habitat: [screenHabitat, afterHabitat], settings: [screenSettings]
  };

  // =====================================================================
  //  الإطار: التنقل، المشغّل، خط الزمن
  // =====================================================================
  function renderTabs() {
    const open = episodesUpTo(state.day).filter(e => e.open && e.level >= 2).length;
    $("tabs").innerHTML = TABS.map(k => `<a class="tab ${state.screen === k ? "on" : ""}" href="#${k}" ${state.screen === k ? 'aria-current="page"' : ""}>${icon(k)}<span>${tx(A.screens[k])}</span>${k === "alerts" && open ? `<span class="badge">${open}</span>` : ""}</a>`).join("")
      + `<a class="tab ext" href="devices.html">${icon("devices")}<span>${tx(A.screens.devices)}</span></a>`;
  }
  function renderFrame() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t(A.title);
    $("langBtn").textContent = $("langBtnTop").textContent = t(C.ui.langToggle);
    $("backLink").textContent = (lang === "ar" ? "→ " : "← ") + t(A.back);
    $("restartBtn").textContent = "⏮ " + t(A.player.restart);
    $("stepBtn").textContent = t(A.player.step) + " +1";
    $("speedLab").textContent = t(A.player.speed);
    $("speedSel").innerHTML = SPEEDS.map((s, i) => `<option value="${i}" ${i === state.speed ? "selected" : ""}>${s}× ${esc(t(A.player.perSec))}</option>`).join("");
    $("dayLab").textContent = t(A.player.day);
    $("dayOf").textContent = "/" + (D - 1);
    $("synthTag").textContent = t(A.synthetic);
    $("disclaimer").textContent = t(A.disclaimer);
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
    $("playBtn").textContent = state.playing ? "❚❚ " + t(A.player.pause) : "▶ " + t(A.player.play);
    $("dayNum").textContent = state.day;
    const ph = phaseOf(state.day);
    $("phase").className = "phase " + ph; $("phase").textContent = t(A.phase[ph]);
  }

  function render() {
    cancelAnimationFrame(ecgRaf);
    const [html, after] = SCREENS[state.screen] || SCREENS.crew;
    $("screenTitle").textContent = t(A.screens[state.screen]);
    $("view").innerHTML = html();
    if (after) after();
    renderTabs(); renderTimeline(); renderPlayer();
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
    el.innerHTML = `<span class="dot" style="--c:${lvColor(e.level)};margin-top:6px"></span><div><b>${tx(A.alertsUi.newAlert)} · ${tx(C.alerts[e.level].name)}</b>${tx(c.m.name)} · ${tx(A.player.day)} <span dir="ltr">${e.day}</span></div>`;
    el.onclick = () => { state.member = c.m.id; go("alerts"); el.remove(); };
    $("toasts").appendChild(el);
    while ($("toasts").children.length > 3) $("toasts").firstChild.remove();
    setTimeout(() => el.remove(), 6000);
  }

  // ---------- التوجيه عبر الرابط ----------
  function go(path) { if (location.hash.slice(1) === path) route(); else location.hash = path; }
  function route() {
    const [scr, arg] = location.hash.slice(1).split("/");
    state.screen = SCREENS[scr] ? scr : "crew";
    if (scr === "member" && arg) state.member = arg;
    if (scr === "review" && arg) state.episode = arg;
    render();
    $("view").focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }

  // ---------- الأحداث ----------
  function recompute() { compute(); renderFrame(); render(); }
  function bind() {
    $("playBtn").onclick = () => setPlaying(!state.playing);
    $("restartBtn").onclick = () => { setPlaying(false); setDay(0); };
    $("stepBtn").onclick = () => { setPlaying(false); setDay(state.day + 1, true); };
    $("speedSel").onchange = e => { state.speed = +e.target.value; };
    $("scrub").oninput = e => setDay(+e.target.value);
    const toggleLang = () => { lang = lang === "ar" ? "en" : "ar"; try { localStorage.setItem("vitalx-lang", lang); } catch (e) { /* */ } renderFrame(); render(); };
    $("langBtn").onclick = toggleLang; $("langBtnTop").onclick = toggleLang;
    window.addEventListener("hashchange", route);
    let rz = 0; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(render, 120); });
    document.addEventListener("keydown", e => {
      if (/INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || "")) return;
      if (e.code === "Space") { e.preventDefault(); setPlaying(!state.playing); }
      if (e.key === "ArrowRight") setDay(state.day + (lang === "ar" ? -1 : 1));
      if (e.key === "ArrowLeft") setDay(state.day + (lang === "ar" ? 1 : -1));
    });
    $("view").addEventListener("click", e => {
      const el = e.target.closest("[data-go],[data-member],[data-channel],[data-filter],[data-ack],button[id]");
      if (!el) return;
      if (el.dataset.go) return go(el.dataset.go);
      if (el.dataset.member) { state.member = el.dataset.member; return render(); }
      if (el.dataset.channel) { state.channel = el.dataset.channel; return render(); }
      if (el.dataset.filter) { state.filter = el.dataset.filter; return render(); }
      if (el.dataset.ack) { saved.acks[el.dataset.ack] = state.day; persist(); return render(); }
      switch (el.id) {
        case "approveBtn": return decide("approved");
        case "dismissBtn": return decide("dismissed");
        case "escBtn": return decide("escalated");
        case "undoDec": delete saved.decisions[state.episode]; persist(); return render();
        case "clearLog": saved.log = []; persist(); return render();
        case "sReset": sim = clone(DEFAULT_SIM); saved = { acks: {}, decisions: {}, log: [] }; persist(); return recompute();
      }
    });
    $("view").addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.dataset && e.target.dataset.go) { e.preventDefault(); go(e.target.dataset.go); } });
    $("view").addEventListener("change", e => {
      const el = e.target;
      if (el.id === "truthChk") { state.showTruth = el.checked; return render(); }
      if (el.id === "infoChk") { state.showInfo = el.checked; return render(); }
      if (el.id === "sMode") { sim.personal.baselineMode = el.value; return recompute(); }
      if (el.id === "sChem") { sim.personal.includeChem = el.checked; return recompute(); }
      if (el.id === "sAnchor") { sim.personal.useAnchor = el.checked; return recompute(); }
      if (el.id === "sK") { sim.personal.k = +el.value; return recompute(); }
      if (el.id === "sH") { sim.personal.h = +el.value; return recompute(); }
      if (el.id === "sW") { sim.projection.window = +el.value; return recompute(); }
    });
    $("view").addEventListener("input", e => { const v = $(e.target.id + "V"); if (v) v.textContent = e.target.value; });
  }

  // ---------- البدء ----------
  compute();
  // يوم البداية: بعد المعايرة بقليل حتى تظهر البيانات فوراً (يمكن الرجوع لليوم 0)
  let start = 40;
  try { const q = new URLSearchParams(location.search).get("day"); if (q != null) start = clamp(parseInt(q, 10) || 0, 0, D - 1); } catch (e) { /* */ }
  state.day = start; seenUpTo(start);
  renderFrame(); bind(); route();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render());
})();
