/* =====================================================================
   VITALX — صفحة الأجهزة: الساعة والشريحة والنظام يعمل داخلهما
   النصوص من content.js (devicesPage)، والحساب من engine.js
   ===================================================================== */
(function () {
  "use strict";
  const C = window.VITALX_CONTENT, E = window.VITALX_ENGINE, D = C.devicesPage;
  const $ = id => document.getElementById(id);

  let lang = C.defaultLang || "ar";
  try { lang = new URLSearchParams(location.search).get("lang") || localStorage.getItem("vitalx-lang") || lang; } catch (e) { /* لا تخزين */ }
  if (lang !== "ar" && lang !== "en") lang = "ar";
  const t = x => (x && typeof x === "object" && ("ar" in x || "en" in x)) ? (x[lang] != null ? x[lang] : x.ar) : (x == null ? "" : String(x));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const tx = x => esc(t(x)).replace(/⟨([^⟩]*)⟩/g, '<span class="ph">⟨$1⟩</span>');
  const chip = s => `<span class="chip s-${s}">${tx(C.statusLabels[s])}</span>`;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const f = (v, d = 1) => v == null || isNaN(v) ? "--" : Number(v).toFixed(d);

  // ---------- محاكاة رائد واحد (نفس محرك الصفحة الرئيسية) ----------
  const sim = JSON.parse(JSON.stringify(C.sim));
  const ast = E.generateAstronaut(sim, E.mulberry32(sim.seed * 1000 + 7919), {});
  const pers = E.runPersonal(ast, sim);
  const proj = E.projectionFor(ast, sim, pers);
  const N = sim.missionDays;
  const ids = E.activeChannels(sim);

  const state = { day: 0, playing: true, view: 0, exploded: false, lastAlertDay: null };
  const views = ["vitals", "explain", "trend"];

  // ---------- النصوص ----------
  function renderText() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = "VITALX — " + t(D.navLink);
    $("langBtn").textContent = t(C.ui.langToggle);
    $("backLink").innerHTML = (lang === "ar" ? "→ " : "← ") + tx(D.back);
    if (C.appMode && !$("appLink")) $("backLink").insertAdjacentHTML("afterend", `<a href="app.html" id="appLink" style="color:var(--built)"></a>`);
    if ($("appLink")) $("appLink").innerHTML = tx(C.appMode.navLink) + " ↗";
    $("dvKicker").innerHTML = tx(C.meta.teamName) + " · " + tx(D.kicker) + " " + chip("designed");
    $("dvTitle").innerHTML = tx(D.title);
    $("dvIntro").innerHTML = tx(D.intro);
    $("restartBtn").innerHTML = tx(D.restart);
    $("speedLab").innerHTML = tx(D.speed);
    $("dayLab").innerHTML = tx(D.day);
    $("synthTag").innerHTML = tx(C.ui.synthetic);
    setPlayLabel();

    const W = D.watch;
    $("wTitle").innerHTML = tx(W.title) + " " + chip(W.status) + " " + `<span class="chip s-built">${lang === "ar" ? "النظام داخلها: يعمل" : "System inside: running"}</span>`;
    $("wText").innerHTML = tx(W.text);
    $("tabs").innerHTML = views.map((v, i) => `<button type="button" data-i="${i}">${tx(W.screens[v])}</button>`).join("");
    $("tabs").querySelectorAll("button").forEach(b => b.addEventListener("click", () => setView(+b.dataset.i)));
    $("dots").innerHTML = views.map(() => "<i></i>").join("");
    $("lSleep").textContent = t({ ar: "النوم", en: "Sleep" });
    $("lDose").textContent = t(W.dose);

    const P = D.patch;
    $("pTitle").innerHTML = tx(P.title) + " " + chip(P.status);
    $("pText").innerHTML = tx(P.text);
    setExplodeLabel();
    const L = P.layers.length;
    $("patch3d").innerHTML = P.layers.map((l, j) => `<div class="pl L${L - 1 - j}" style="--i:${L - 1 - j}" title="${esc(t(l.name))}"></div>`).join("");
    $("layerLabels").innerHTML = P.layers.map(l => `<li><b>${tx(l.name)}</b><span>${tx(l.note)}</span>${l.status === "future" ? chip("future") : ""}</li>`).join("");

    $("flowTitle").innerHTML = tx(D.flow.title);
    const icons = [iconPatch(), iconWatch(), iconServer(), iconDoctor()];
    $("flow").innerHTML = D.flow.nodes.map((n, i) => `<div class="node"><div class="ic">${icons[i]}</div><b>${tx(n)}</b></div>`).join("") +
      [0, 1, 2].map(i => `<div class="link" style="inset-inline-start:${12.5 + i * 25 + 5}%;width:${25 - 10}%"><i></i><i></i><i></i></div>`).join("");
    const earth = document.querySelector(".earth") || Object.assign(document.createElement("div"), { className: "earth" });
    earth.innerHTML = `<span>🌍 ${tx(D.flow.earth)}</span>`;
    $("flow").after(earth);

    const oi = { cabin: iconCabin(), dose: iconDose() };
    $("others").innerHTML = D.others.map(o => `<div class="other"><div class="ic">${oi[o.icon] || ""}</div><div><h3>${tx(o.name)} ${chip(o.status)}</h3><p>${tx(o.text)}</p><div class="live" id="live-${o.icon}">--</div></div></div>`).join("");
    $("footDisclaimer").innerHTML = tx(C.meta.disclaimer) + " · " + tx(C.data.disclosure);
    setView(state.view);
    update();
  }
  function setPlayLabel() { $("playBtn").innerHTML = tx(state.playing ? D.pause : D.play); }
  function setExplodeLabel() { $("explodeBtn").innerHTML = tx(state.exploded ? D.patch.collapse : D.patch.explode); }

  // ---------- أيقونات بسيطة ----------
  const stroke = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  function iconPatch() { return `<svg viewBox="0 0 40 40" style="color:var(--designed)"><rect x="6" y="12" width="28" height="16" rx="8" ${stroke}/><circle cx="14" cy="20" r="2.5" fill="currentColor"/><circle cx="26" cy="20" r="2.5" fill="currentColor"/></svg>`; }
  function iconWatch() { return `<svg viewBox="0 0 40 40" style="color:var(--accent)"><rect x="11" y="10" width="18" height="20" rx="6" ${stroke}/><path d="M15 10V4h10v6M15 30v6h10v-6" ${stroke}/><path d="M14 21h3l2-4 2 7 2-3h3" ${stroke}/></svg>`; }
  function iconServer() { return `<svg viewBox="0 0 40 40" style="color:var(--built)"><rect x="8" y="8" width="24" height="10" rx="3" ${stroke}/><rect x="8" y="22" width="24" height="10" rx="3" ${stroke}/><circle cx="13" cy="13" r="1.4" fill="currentColor"/><circle cx="13" cy="27" r="1.4" fill="currentColor"/></svg>`; }
  function iconDoctor() { return `<svg viewBox="0 0 40 40" style="color:var(--accent-2)"><circle cx="20" cy="13" r="6" ${stroke}/><path d="M9 34c1-7 5-10 11-10s10 3 11 10" ${stroke}/><path d="M20 24v5m-2.5-2.5h5" ${stroke}/></svg>`; }
  function iconCabin() { return `<svg viewBox="0 0 40 40" style="color:var(--designed)"><path d="M8 30V14l12-7 12 7v16z" ${stroke}/><path d="M14 22c2-2 4-2 6 0s4 2 6 0" ${stroke}/><text x="20" y="31" font-size="6" text-anchor="middle" fill="currentColor" font-family="sans-serif">CO2</text></svg>`; }
  function iconDose() { return `<svg viewBox="0 0 40 40" style="color:var(--built)"><circle cx="20" cy="20" r="3" fill="currentColor"/><path d="M20 17l-5-9a11 11 0 0 1 10 0zM17.4 21.5l-10 .5a11 11 0 0 0 5 8.6zM22.6 21.5l5 8.6a11 11 0 0 0 5-8.6z" fill="currentColor" opacity=".8"/></svg>`; }

  // ---------- الشاشات ----------
  function setView(i) {
    state.view = i;
    views.forEach((v, k) => document.querySelector(`.view[data-view="${v}"]`).classList.toggle("on", k === i));
    $("dots").querySelectorAll("i").forEach((d, k) => d.classList.toggle("on", k === i));
    $("tabs").querySelectorAll("button").forEach((b, k) => b.classList.toggle("on", k === i));
  }

  const levelColor = l => [css("--built"), css("--designed"), css("--future"), css("--danger")][l];

  function update() {
    const d = state.day, W = D.watch;
    $("dayNum").textContent = d;
    $("sDay").textContent = `D${d}/${N - 1}`;
    const calibrating = d < pers.active;
    const lv = pers.level[d] || 0;
    if (lv >= 1) state.lastAlertDay = d;
    const pill = $("sPill");
    pill.className = "scr-pill " + (calibrating ? "l0c" : lv ? "l" + lv : "");
    pill.textContent = calibrating ? t(W.calibrating) : lv ? t(C.alerts[lv].name) : t(W.ok);

    // الحلقة = نسبة CUSUM المركب إلى h
    const s = pers.compS[d];
    const frac = calibrating ? (d / pers.active) : Math.min(1, (s || 0) / sim.personal.h);
    const ring = $("ringFg");
    ring.style.strokeDashoffset = 327 * (1 - frac);
    const col = calibrating ? css("--simulated") : levelColor(lv ? lv : frac > .6 ? 2 : 0);
    ring.style.stroke = col; ring.style.color = col;
    $("watchGlow").style.background = `radial-gradient(circle, ${col}44, transparent 60%)`;

    const hr = ast.obs.hr[d];
    $("sHr").textContent = f(hr, 0);
    const b = pers.band.hr[d];
    $("sHrBase").textContent = calibrating ? "" : `${t(W.baseline)} ${f(b.med, 0)} ±${f(3 * b.scale, 0)}`;
    const beat = (60 / Math.max(40, hr)).toFixed(2) + "s";
    $("heart").style.animationDuration = beat;
    document.documentElement.style.setProperty("--beat", beat);
    $("sSleep").textContent = f(ast.obs.sleep[d], 1) + "h";
    $("sCo2").textContent = f(ast.obs.co2[d], 1);
    $("sDose").textContent = f(ast.rad[d], 0);
    const lc = $("live-cabin"), ld = $("live-dose");
    if (lc) lc.textContent = `CO2 ${f(ast.obs.co2[d], 2)} mmHg`;
    if (ld) ld.textContent = `${f(ast.rad[d], 1)} / ${sim.radiation.limit} mSv`;

    renderExplain(d);
    renderTrend(d);
  }

  function renderExplain(d) {
    const W = D.watch, ad = state.lastAlertDay;
    if (ad == null || ad < pers.active || !pers.explain[ad]) { $("vExplain").innerHTML = `<div class="ex-h">${tx(W.screens.explain)}</div><div class="ex-msg">${tx(W.noAlert)}</div>`; return; }
    const c = pers.explain[ad], lv = pers.level[ad];
    const tot = c.reduce((s, x) => s + Math.max(0, x.w * x.bad), 0) || 1;
    $("vExplain").innerHTML = `<div class="ex-h" style="color:${levelColor(lv)}">${tx(C.alerts[lv].name)} · D${ad}</div>` +
      c.map(x => { const sh = Math.max(0, x.w * x.bad) / tot; return `<div class="ex-row"><span>${esc(t(sim.channels[x.id].name)).slice(0, 12)}</span><div class="tr"><div class="fl" style="width:${(sh * 100).toFixed(0)}%"></div></div><b>${Math.round(sh * 100)}%</b></div>`; }).join("") +
      `<div class="ex-msg">${esc(t(C.alerts[lv].text).replace(/⟨[^⟩]*⟩\s*/g, ""))}</div>`;
  }

  function renderTrend(d) {
    const cv = $("trendCv"), W = D.watch;
    const dpr = window.devicePixelRatio || 1, w = cv.clientWidth || 180, h = cv.clientHeight || 120;
    cv.width = w * dpr; cv.height = h * dpr;
    const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    const from = Math.max(0, d - 29), xs = [];
    for (let i = from; i <= d; i++) xs.push(i);
    const horizon = 14;
    const vals = xs.map(i => ast.obs.hr[i]).concat([proj.thr]);
    const lo = Math.min(...vals) - 2, hi = Math.max(...vals) + 2;
    const X = i => ((i - from) / (29 + horizon)) * (w - 4) + 2, Y = v => h - 4 - ((v - lo) / (hi - lo)) * (h - 8);
    g.strokeStyle = "rgba(139,123,255,.6)"; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(0, Y(proj.thr)); g.lineTo(w, Y(proj.thr)); g.stroke(); g.setLineDash([]);
    g.strokeStyle = "#e9f3ff"; g.lineWidth = 1.5; g.beginPath();
    xs.forEach((i, k) => k ? g.lineTo(X(i), Y(ast.obs.hr[i])) : g.moveTo(X(i), Y(ast.obs.hr[i]))); g.stroke();
    g.fillStyle = "#5fd4ff"; g.beginPath(); g.arc(X(d), Y(ast.obs.hr[d]), 3, 0, 7); g.fill();
    let txt = t(W.flat);
    if (d >= pers.active) {
      const p = E.projectCrossing(ast.obs.hr, d, sim.projection.window, proj.thr, 1);
      if (p && p.fit) {
        g.strokeStyle = css("--accent-2"); g.lineWidth = 2; g.setLineDash([5, 3]); g.beginPath();
        g.moveTo(X(d - sim.projection.window + 1), Y(p.fit.at(d - sim.projection.window + 1)));
        g.lineTo(X(d + horizon), Y(p.fit.at(d + horizon))); g.stroke(); g.setLineDash([]);
        const left = p.day - d;
        if (left <= 0) txt = `<b>!</b>`;
        else if (left < 60) txt = `${tx(W.projection)} <b>${Math.round(left)}</b> ${tx(W.days)}`;
      }
    } else txt = t(W.calibrating);
    $("trendTxt").innerHTML = txt;
  }

  // ---------- مخطط القلب على الشريحة ----------
  let ecgX = 0, ecgPhase = 0, ecgLast = performance.now(); const ecgBuf = [];
  function ecgTick() {
    const cv = $("ecgCv"), dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
    const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const hr = ast.obs.hr[state.day] || 60;
    ecgPhase = (ecgPhase + (performance.now() - ecgLast) / 1000 * hr / 60) % 1; ecgLast = performance.now();
    const ph = ecgPhase;
    let v = 0;
    if (ph < .06) v = Math.sin(ph / .06 * Math.PI) * .12;
    else if (ph > .12 && ph < .14) v = -.15; else if (ph >= .14 && ph < .17) v = 1; else if (ph >= .17 && ph < .2) v = -.3;
    else if (ph > .35 && ph < .5) v = Math.sin((ph - .35) / .15 * Math.PI) * .22;
    ecgBuf.push(v + (Math.random() - .5) * .03); if (ecgBuf.length > w) ecgBuf.shift();
    ecgX++;
    g.clearRect(0, 0, w, h);
    g.strokeStyle = "rgba(95,212,255,.08)";
    for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.strokeStyle = css("--built"); g.lineWidth = 1.6; g.shadowColor = css("--built"); g.shadowBlur = 6; g.beginPath();
    ecgBuf.forEach((y, i) => { const px = w - ecgBuf.length + i, py = h * .62 - y * h * .5; i ? g.lineTo(px, py) : g.moveTo(px, py); });
    g.stroke(); g.shadowBlur = 0;
  }

  // ---------- التشغيل ----------
  let acc = 0, last = performance.now(), viewTimer = 0;
  function loop(now) {
    const dt = now - last; last = now;
    if (state.playing) {
      acc += dt * (+$("speed").value);
      if (acc > 2400) { acc = 0; state.day = (state.day + 1) % N; if (state.day === 0) state.lastAlertDay = null; update(); }
      viewTimer += dt;
      if (viewTimer > 5000) { viewTimer = 0; setView((state.view + 1) % views.length); }
    }
    ecgTick();
    requestAnimationFrame(loop);
  }

  $("playBtn").addEventListener("click", () => { state.playing = !state.playing; setPlayLabel(); });
  $("restartBtn").addEventListener("click", () => { state.day = 0; state.lastAlertDay = null; update(); });
  $("screen").addEventListener("click", () => { viewTimer = 0; setView((state.view + 1) % views.length); });
  $("explodeBtn").addEventListener("click", toggleExplode);
  $("patchStage").addEventListener("click", e => { if (e.target.closest(".pl")) toggleExplode(); });
  function toggleExplode() {
    state.exploded = !state.exploded;
    $("patch3d").classList.toggle("exploded", state.exploded);
    $("layerLabels").classList.toggle("exploded-labels", state.exploded);
    setExplodeLabel();
  }
  $("langBtn").addEventListener("click", () => {
    lang = lang === "ar" ? "en" : "ar";
    try { localStorage.setItem("vitalx-lang", lang); } catch (e) { /* تجاهل */ }
    renderText();
  });

  renderText();
  requestAnimationFrame(loop);
})();
