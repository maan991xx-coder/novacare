/* =====================================================================
   VITALX — العرض (يقرأ content.js ويرسم الصفحة والرسوم)
   لا حاجة لتعديله لتغيير النصوص أو الأرقام.
   ===================================================================== */
(function () {
  "use strict";
  const C = window.VITALX_CONTENT, E = window.VITALX_ENGINE;
  const $ = id => document.getElementById(id);
  const clone = o => JSON.parse(JSON.stringify(o));

  // ---------- اللغة ----------
  let lang = C.defaultLang || "ar";
  try {
    const q = new URLSearchParams(location.search).get("lang");
    lang = q || localStorage.getItem("vitalx-lang") || lang;
  } catch (e) { /* التخزين غير متاح */ }
  if (lang !== "ar" && lang !== "en") lang = "ar";

  const t = x => (x && typeof x === "object" && ("ar" in x || "en" in x)) ? (x[lang] != null ? x[lang] : x.ar) : (x == null ? "" : String(x));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // نص آمن مع إبراز الخانات غير المستكملة ⟨...⟩
  const tx = x => esc(t(x)).replace(/⟨([^⟩]*)⟩/g, '<span class="ph">⟨$1⟩</span>');
  const U = C.ui;
  const chip = s => `<span class="chip s-${s}">${tx(C.statusLabels[s])}</span>`;
  const fmt = (v, d = 1) => v == null || isNaN(v) ? "—" : Number(v).toFixed(d);
  const pct = v => v == null ? "—" : Math.round(v * 100) + "%";

  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  // ---------- المحتوى الثابت ----------
  function renderStatic() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t(C.meta.title);
    $("langBtn").textContent = t(U.langToggle);

    $("nav").innerHTML = Object.keys(U.nav).map(k => `<a href="#${k}">${tx(U.nav[k])}</a>`).join("") +
      (C.devicesPage ? `<a href="devices.html" style="color:var(--accent)">${tx(C.devicesPage.navLink)} ↗</a>` : "");
    $("heroKicker").innerHTML = tx(C.meta.teamName) + " · " + tx(C.hero.kicker) + " · " + C.meta.targetPrizes.map(esc).join(" / ");
    $("heroVision").innerHTML = tx(C.hero.vision);
    $("heroScope").innerHTML = tx(C.hero.scope);
    $("ctaDemo").innerHTML = tx(C.hero.ctaDemo);
    $("ctaLayers").innerHTML = tx(C.hero.ctaLayers);
    if (C.devicesPage && !$("ctaDevices")) $("ctaLayers").insertAdjacentHTML("afterend", `<a class="btn" href="devices.html" id="ctaDevices"></a>`);
    if ($("ctaDevices")) $("ctaDevices").innerHTML = tx(C.devicesPage.navLink) + " ↗";
    $("heroDisclaimer").innerHTML = tx(C.meta.disclaimer);
    $("statusLegend").innerHTML = Object.keys(C.statusLabels).map(chip).join("");

    const S = U.sections;
    $("hLayers").innerHTML = tx(S.layers);
    $("layersGrid").innerHTML = C.layers.map(l => `
      <article class="layer" style="--c:var(--${l.status})">
        ${chip(l.status)}<h3>${tx(l.title)}</h3><p>${tx(l.text)}</p>
        <ul>${l.items.map(i => `<li>${tx(i)}</li>`).join("")}</ul>
      </article>`).join("");

    $("hDevice").innerHTML = tx(S.device) + " " + chip("designed");
    renderDevice();

    $("hChannels").innerHTML = tx(S.channels);
    const T = U.table;
    $("channelsTbl").innerHTML = `<thead><tr><th>${tx(T.channel)}</th><th>${tx(T.sensor)}</th><th>${tx(T.source)}</th><th>${tx(T.reason)}</th><th>${tx(T.status)}</th></tr></thead><tbody>` +
      C.channels.map(c => `<tr><td><b>${tx(c.name)}</b><br><span class="muted num">${tx(c.unit)}</span></td><td>${tx(c.sensor)}</td><td>${tx(c.source)}</td><td>${tx(c.reason)}</td><td>${chip(c.status)}</td></tr>`).join("") + "</tbody>";

    $("hData").innerHTML = tx(S.data);
    $("dataDisclosure").innerHTML = tx(C.data.disclosure);
    $("dataNotClaim").innerHTML = tx(C.data.notClaim);
    const ds = C.data.nasaDataset;
    $("dataset").innerHTML = `${chip(ds.status)} <b>${tx(ds.name)}</b>${ds.url ? ` — <a href="${esc(ds.url)}" target="_blank" rel="noopener">${esc(ds.url)}</a>` : ""}<p class="muted" style="margin:.5em 0 0">${tx(ds.note)}</p>`;
    $("hHypothesis").innerHTML = tx(S.hypothesis);
    $("hypoQ").innerHTML = tx(C.hypothesis.question);
    $("hypoProof").innerHTML = tx(C.hypothesis.proof);

    $("hDemo").innerHTML = tx(S.demo);
    $("synthTag").innerHTML = tx(U.synthetic) + " · " + tx(C.data.disclosure);
    $("hProof").innerHTML = tx(S.proof);
    $("cohortNote").innerHTML = `${tx(U.synthetic)}: ${C.sim.cohortSize} ${tx(U.cohortNote)}`;
    $("hSens").innerHTML = tx(S.sensitivity);
    $("sensBtn").innerHTML = tx(U.controls.runSens);
    $("hForecast").innerHTML = tx(S.forecast);
    $("forecastText").innerHTML = tx(C.forecast.text);
    $("forecastNot").innerHTML = tx(C.forecast.notThis);

    $("hMethod").innerHTML = tx(S.method);
    $("methodNotes").innerHTML = C.methodNotes.map(n => `<li>${tx(n)}</li>`).join("");
    $("hAlerts").innerHTML = tx(S.alerts || { ar: "مستويات التنبيه", en: "Alert levels" });
    $("alertsGrid").innerHTML = [1, 2, 3].map(k => { const a = C.alerts[k]; return `
      <div class="alert-card"><span class="lvl lvl-${k}">${tx(a.name)}</span> ${chip(a.status)}<p>${tx(a.text)}</p></div>`; }).join("");

    $("hDiff").innerHTML = tx(S.diff);
    $("diffGrid").innerHTML = C.differentiation.map(d => `<div class="diff-card"><h3>${tx(d.vs)}</h3><p>${tx(d.point)}</p></div>`).join("");
    $("hNurses").innerHTML = tx(S.nurses);
    $("nursesTbl").innerHTML = `<thead><tr><th>${tx(T.item)}</th><th>${tx(T.current)}</th><th>${tx(T.status)}</th></tr></thead><tbody>` +
      C.nurseDecisions.map(n => `<tr><td><b>${tx(n.item)}</b></td><td>${tx(n.current)}</td><td>${chip(n.status)}</td></tr>`).join("") + "</tbody>";

    $("hRoadmap").innerHTML = tx(S.roadmap);
    $("roadmapList").innerHTML = C.roadmap.map(r => `<div class="road" style="--c:var(--${r.status})">${chip(r.status)}<h3>${tx(r.phase)}</h3><p>${tx(r.text)}</p></div>`).join("");
    $("hRefs").innerHTML = tx(S.refs);
    $("refsList").innerHTML = C.references.map(r => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${tx(r.name)}</a><span>${tx(r.use)}</span></li>`).join("");

    $("footDisclaimer").innerHTML = tx(C.meta.disclaimer);
    $("footMeta").innerHTML = `VITALX · ${tx(C.meta.teamName)} · ${tx(C.meta.challenge)} · ${tx(C.data.disclosure)}`;
  }

  function renderDevice() {
    const col = s => `var(--${s})`;
    const body = `
      <rect x="1" y="1" width="98" height="68" rx="4" fill="none" stroke="var(--line)" stroke-dasharray="1.5 1.5" stroke-width=".4"/>
      <rect x="80" y="4" width="16" height="12" rx="1.5" fill="var(--panel-2)" stroke="var(--line)" stroke-width=".5"/>
      <circle cx="50" cy="13" r="7" fill="var(--panel-2)" stroke="var(--muted)" stroke-width=".6"/>
      <path d="M36 24 Q50 19 64 24 L66 58 Q50 62 34 58 Z" fill="var(--panel-2)" stroke="var(--muted)" stroke-width=".6"/>
      <path d="M36 25 L24 50 L28 60" fill="none" stroke="var(--muted)" stroke-width="3" stroke-linecap="round"/>
      <path d="M64 25 L74 48 L71 60" fill="none" stroke="var(--muted)" stroke-width="3" stroke-linecap="round"/>
      <rect x="20.5" y="53" width="7" height="5" rx="1.2" fill="var(--designed)" opacity=".35"/>`;
    const pts = C.deviceDiagram.map((d, i) => `
      <circle cx="${d.x}" cy="${d.y}" r="3.6" fill="${col(d.status)}" opacity=".25"/>
      <circle cx="${d.x}" cy="${d.y}" r="2.3" fill="${col(d.status)}" ${d.status === "future" ? 'stroke="var(--bg)" stroke-dasharray=".8 .6" stroke-width=".5"' : ""}/>
      <text x="${d.x}" y="${d.y + 0.9}" text-anchor="middle" font-size="2.6" font-weight="700" fill="#061021" font-family="sans-serif">${i + 1}</text>`).join("");
    $("deviceSvg").innerHTML = body + pts;
    $("deviceList").innerHTML = C.deviceDiagram.map((d, i) =>
      `<li><span class="num" style="background:${col(d.status)}">${i + 1}</span><span>${tx(d.label)}</span>${chip(d.status)}</li>`).join("");
  }

  // ---------- حالة العرض التفاعلي ----------
  let sim = clone(C.sim);
  const state = { idx: 1, noise: 1, drift: 1 };

  function controlsHTML() {
    const K = U.controls, p = sim.personal;
    const range = (id, lab, min, max, step, val) => `<div class="ctl"><label for="${id}">${tx(lab)} <b id="${id}V">${val}</b></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`;
    return `
      ${range("cIdx", K.astronaut, 1, 30, 1, state.idx)}
      <div class="ctl"><label for="cMode">${tx(K.baseline)}</label><select id="cMode">
        ${Object.keys(K.modes).map(m => `<option value="${m}" ${p.baselineMode === m ? "selected" : ""}>${tx(K.modes[m])}</option>`).join("")}
      </select></div>
      <div class="ctl check" id="anchorWrap"><label><input type="checkbox" id="cAnchor" ${p.useAnchor ? "checked" : ""}> ${tx(K.anchor)}</label></div>
      <div class="ctl check"><label><input type="checkbox" id="cChem" ${p.includeChem ? "checked" : ""}> ${tx(K.chem)} ${chip("future")}</label></div>
      ${range("cNoise", K.noise, 0.5, 2.5, 0.1, state.noise)}
      ${range("cDrift", K.drift, 0, 2, 0.1, state.drift)}
      ${range("cK", K.k, 0.1, 1.5, 0.05, p.k)}
      ${range("cH", K.h, 1, 12, 0.5, p.h)}
      ${range("cWin", K.window, 5, 21, 1, sim.projection.window)}
      <div class="ctl-row"><button class="btn" id="cReset" type="button">${tx(K.reset)}</button></div>`;
  }

  function bindControls() {
    const on = (id, fn) => $(id).addEventListener("input", e => { fn(e.target); const v = $(id + "V"); if (v) v.textContent = e.target.value; refresh(); });
    on("cIdx", el => state.idx = +el.value);
    on("cMode", el => sim.personal.baselineMode = el.value);
    on("cAnchor", el => sim.personal.useAnchor = el.checked);
    on("cChem", el => sim.personal.includeChem = el.checked);
    on("cNoise", el => state.noise = +el.value);
    on("cDrift", el => state.drift = +el.value);
    on("cK", el => sim.personal.k = +el.value);
    on("cH", el => sim.personal.h = +el.value);
    on("cWin", el => sim.projection.window = +el.value);
    $("cReset").addEventListener("click", () => { sim = clone(C.sim); state.idx = 1; state.noise = 1; state.drift = 1; renderControls(); refresh(); });
  }
  function renderControls() {
    $("controls").innerHTML = controlsHTML();
    $("anchorWrap").style.display = sim.personal.baselineMode === "rolling" ? "" : "none";
    bindControls();
  }

  // ---------- الرسم ----------
  function drawChart(canvas, o) {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const g = canvas.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pad = { l: 44, r: 10, t: 14, b: 22 };
    const n = o.n;
    let vals = [];
    o.series.forEach(s => s.data.forEach(v => v != null && vals.push(v)));
    (o.hlines || []).forEach(h => vals.push(h.y));
    if (o.band) { o.band.lo.forEach(v => v != null && vals.push(v)); o.band.hi.forEach(v => v != null && vals.push(v)); }
    let lo = Math.min(...vals), hi = Math.max(...vals);
    if (o.yMin != null) lo = Math.min(lo, o.yMin);
    const sp = (hi - lo) || 1; lo -= sp * 0.06; hi += sp * 0.08;
    if (o.yMin != null) lo = Math.max(lo, o.yMin - sp * 0.02);
    const X = i => pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
    const Y = v => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
    const line = css("--line"), muted = css("--muted");
    g.font = "11px " + css("--mono");

    (o.shade || []).forEach(s => { g.fillStyle = s.color; g.fillRect(X(s.x0), pad.t, X(s.x1) - X(s.x0), H - pad.t - pad.b); });
    // شبكة
    g.strokeStyle = line; g.lineWidth = 1; g.fillStyle = muted; g.textAlign = "right";
    for (let k = 0; k <= 4; k++) {
      const v = lo + (k / 4) * (hi - lo), y = Y(v);
      g.globalAlpha = .5; g.beginPath(); g.moveTo(pad.l, y); g.lineTo(W - pad.r, y); g.stroke(); g.globalAlpha = 1;
      g.fillText(Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1), pad.l - 6, y + 4);
    }
    g.textAlign = "center";
    for (let d = 0; d < n; d += 20) g.fillText(d, X(d), H - 6);

    if (o.band) {
      g.fillStyle = o.band.color; g.beginPath();
      let started = false;
      for (let i = 0; i < n; i++) { if (o.band.hi[i] == null) continue; started ? g.lineTo(X(i), Y(o.band.hi[i])) : (g.moveTo(X(i), Y(o.band.hi[i])), started = true); }
      for (let i = n - 1; i >= 0; i--) if (o.band.lo[i] != null) g.lineTo(X(i), Y(o.band.lo[i]));
      g.closePath(); g.fill();
    }
    (o.hlines || []).forEach(h => { g.strokeStyle = h.color; g.setLineDash(h.dash || [5, 4]); g.lineWidth = 1.4; g.beginPath(); g.moveTo(pad.l, Y(h.y)); g.lineTo(W - pad.r, Y(h.y)); g.stroke(); g.setLineDash([]); });
    (o.vlines || []).forEach(v => { g.strokeStyle = v.color; g.setLineDash(v.dash || [3, 3]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(X(v.x), pad.t); g.lineTo(X(v.x), H - pad.b); g.stroke(); g.setLineDash([]); });
    o.series.forEach(s => {
      g.strokeStyle = s.color; g.lineWidth = s.width || 1.6; g.setLineDash(s.dash || []); g.globalAlpha = s.alpha || 1;
      g.beginPath(); let pen = false;
      s.data.forEach((v, i) => { if (v == null) { pen = false; return; } const x = s.xs ? X(s.xs[i]) : X(i); pen ? g.lineTo(x, Y(v)) : (g.moveTo(x, Y(v)), pen = true); });
      g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
    });
    // شرائط التنبيه في الأعلى
    (o.strips || []).forEach((st, r) => {
      g.fillStyle = st.color;
      st.days.forEach(d => { g.fillRect(X(d) - 1.5, r === 0 ? 2 : H - pad.b - 6, 3, 6); });
    });
    (o.points || []).forEach(p => { g.fillStyle = p.color; g.beginPath(); g.arc(X(p.x), Y(p.y), p.r || 4, 0, Math.PI * 2); g.fill(); });
  }

  function legendHTML() {
    const L = U.chart;
    const it = (color, label, dash) => `<span><i style="background:${color};${dash ? "background:repeating-linear-gradient(90deg," + color + " 0 4px,transparent 4px 7px)" : ""}"></i>${tx(label)}</span>`;
    return [
      it("rgba(149,163,192,.25)", L.adaptation),
      it(css("--danger"), L.onset, true),
      it("rgba(95,212,255,.25)", L.baseline),
      it(css("--fixed"), L.fixedThr, true),
      it(css("--personal"), L.personalAlert),
      it(css("--fixed"), L.fixedAlert),
      it(css("--accent-2"), L.projection, true)
    ].join("");
  }

  let lastAst = null;
  function runOne() {
    const rng = E.mulberry32(sim.seed * 1000 + state.idx * 7919);
    const ast = E.generateAstronaut(sim, rng, { driftMult: state.drift, noiseMult: state.noise });
    const pers = E.runPersonal(ast, sim), fx = E.runFixed(ast, sim);
    const proj = E.projectionFor(ast, sim, pers);
    lastAst = { ast, pers, fx, proj };
    return lastAst;
  }

  function renderCharts() {
    const { ast, pers, fx, proj } = runOne();
    const n = sim.missionDays, L = U.chart;
    const ids = E.activeChannels(sim);
    const shade = [{ x0: 0, x1: sim.adaptation.days, color: "rgba(149,163,192,.12)" }];
    const vlines = [{ x: ast.onset, color: css("--danger") }];
    const pDays = [], fDays = [];
    pers.level.forEach((l, i) => l >= 2 && pDays.push(i));
    fx.level.forEach((l, i) => l >= 2 && fDays.push(i));
    const strips = [{ days: pDays, color: css("--personal") }, { days: fDays, color: css("--fixed") }];

    const panels = ids.concat(["comp", "rad"]);
    $("chartPanels").innerHTML = panels.map(id => `<div class="panel"><div class="panel-title"><span id="pt-${id}"></span><span class="num" id="pu-${id}"></span></div><canvas id="cv-${id}"></canvas></div>`).join("");

    ids.forEach(id => {
      const c = sim.channels[id];
      const band = pers.band[id];
      const lo = band.map((b, i) => i >= pers.active ? b.med - 3 * b.scale : null);
      const hi = band.map((b, i) => i >= pers.active ? b.med + 3 * b.scale : null);
      const hl = [];
      const th = sim.fixed.thresholds[id];
      if (th) hl.push({ y: th.value, color: css("--fixed") });
      const series = [
        { data: ast.truth[id], color: css("--muted"), width: 1, dash: [2, 3], alpha: .7 },
        { data: ast.obs[id], color: id === "chem" ? css("--future") : css("--text"), width: 1.4 }
      ];
      if (id === "hr") {
        hl.push({ y: proj.thr, color: css("--accent-2"), dash: [2, 2] });
        const e0 = proj.evals[0];
        if (e0 && e0.proj && e0.proj.fit) {
          const w = sim.projection.window, d = e0.day, end = Math.min(n - 1, Math.round(e0.proj.day) + 2);
          const xs = [], ys = [];
          for (let x = d - w + 1; x <= end; x++) { xs.push(x); ys.push(e0.proj.fit.at(x)); }
          series.push({ data: ys, xs, color: css("--accent-2"), width: 2, dash: [6, 4] });
        }
      }
      $("pt-" + id).innerHTML = tx(c.name) + (id === "chem" ? " " + chip("future") : "");
      $("pu-" + id).textContent = c.unit;
      drawChart($("cv-" + id), { n, series, band: { lo, hi, color: "rgba(95,212,255,.13)" }, hlines: hl, vlines, shade, strips });
    });

    $("pt-comp").innerHTML = tx(L.composite);
    $("pu-comp").textContent = "S+ · h=" + sim.personal.h;
    drawChart($("cv-comp"), { n, series: [{ data: pers.compS, color: css("--personal"), width: 1.8 }], hlines: [{ y: sim.personal.h, color: css("--danger") }], vlines, shade, strips: [strips[0]], yMin: 0 });

    $("pt-rad").innerHTML = tx(L.radiation) + " " + chip("built");
    $("pu-rad").textContent = "mSv · " + tx(L.radLimit) + " " + sim.radiation.limit;
    drawChart($("cv-rad"), { n, series: [{ data: ast.rad, color: css("--built"), width: 2 }], hlines: [{ y: sim.radiation.limit, color: css("--danger") }], yMin: 0 });

    renderExplain();
  }

  function renderExplain() {
    const { ast, pers, fx, proj } = lastAst, X = U.explain;
    const sp = E.scoreRun(pers.level, ast.onset, pers.active, sim), sf = E.scoreRun(fx.level, ast.onset, fx.active, sim);
    const day = sp.delay != null ? ast.onset + sp.delay : null;
    const days = tx(U.table.days);
    const facts = `<div class="facts">
      <span>${tx(X.detected)}: <b>${sp.delay != null ? sp.delay + " " + days : tx(X.notDetected)}</b></span>
      <span>${tx(X.fixedDetected)}: <b>${sf.delay != null ? sf.delay + " " + days : tx(X.notDetected)}</b></span>
      <span>${tx(X.falseAlarms)}: <b>${sp.falseAlarms}</b> / <b style="color:var(--fixed)">${sf.falseAlarms}</b></span>
      ${proj.evals[0] && proj.evals[0].proj ? `<span>${tx(X.projSaid)} <b>${fmt(proj.evals[0].proj.day, 0)}</b> · ${tx(X.truthSaid)} <b>${proj.trueCross != null ? proj.trueCross : "—"}</b></span>` : ""}
    </div>`;
    if (day == null) { $("explain").innerHTML = `<h3>${tx(X.title)}</h3><p class="muted">${tx(X.none)}</p>${facts}`; return; }
    const lv = pers.level[day], a = C.alerts[lv];
    const contrib = pers.explain[day] || [];
    const tot = contrib.reduce((s, c) => s + Math.max(0, c.w * c.bad), 0) || 1;
    const bars = contrib.map(c => {
      const share = Math.max(0, c.w * c.bad) / tot;
      return `<div class="bar"><span>${tx(sim.channels[c.id].name)}</span><div class="track"><div class="fill" style="width:${(share * 100).toFixed(0)}%"></div></div><span class="num">z=${fmt(c.z, 2)} · ${pct(share)}</span></div>`;
    }).join("");
    $("explain").innerHTML = `<h3>${tx(X.title)}</h3>
      <p><span class="lvl lvl-${lv}">${tx(a.name)}</span> · ${tx(X.day)} <b class="num">${day}</b> — ${tx(a.text)}</p>
      <div class="bars">${bars}</div>${facts}`;
  }

  // ---------- المقارنة على مجموعة ----------
  function cohortSim() { return sim; }
  function renderCohort() {
    const r = E.cohort(cohortSim(), { driftMult: state.drift, noiseMult: state.noise });
    const T = U.table, d = tx(T.days);
    const better = (a, b, lowIsGood) => (a == null || b == null) ? ["", ""] : (lowIsGood ? (a < b ? ["win", ""] : b < a ? ["", "win"] : ["", ""]) : (a > b ? ["win", ""] : b > a ? ["", "win"] : ["", ""]));
    const P = r.personal, F = r.fixed;
    const k = (lab, pv, fv) => `<div class="kpi"><div class="lab">${tx(lab)}</div><div class="vals"><span class="v p">${pv}<small>${tx(T.personal)}</small></span><span class="v f">${fv}<small>${tx(T.fixed)}</small></span></div></div>`;
    $("kpis").innerHTML = k(T.delay, fmt(P.medianDelay, 0) + " " + d, fmt(F.medianDelay, 0) + " " + d) + k(T.rate, pct(P.rate), pct(F.rate)) + k(T.fa, fmt(P.faPer100, 2), fmt(F.faPer100, 2));
    const b1 = better(P.rate, F.rate), b2 = better(P.medianDelay, F.medianDelay, true), b3 = better(P.faPer100, F.faPer100, true), b4 = better(P.faRuns, F.faRuns, true);
    $("cohortTbl").innerHTML = `<thead><tr><th>${tx(T.method)}</th><th>${tx(T.rate)}</th><th>${tx(T.delay)}</th><th>${tx(T.fa)}</th><th>${tx(T.faRuns)}</th></tr></thead><tbody>
      <tr><td><b style="color:var(--personal)">${tx(T.personal)}</b><br><span class="muted">${tx(U.controls.modes[sim.personal.baselineMode])}</span></td><td class="num ${b1[0]}">${pct(P.rate)}</td><td class="num ${b2[0]}">${fmt(P.medianDelay, 0)} ${d}</td><td class="num ${b3[0]}">${fmt(P.faPer100, 2)}</td><td class="num ${b4[0]}">${pct(P.faRuns)}</td></tr>
      <tr><td><b style="color:var(--fixed)">${tx(T.fixed)}</b></td><td class="num ${b1[1]}">${pct(F.rate)}</td><td class="num ${b2[1]}">${fmt(F.medianDelay, 0)} ${d}</td><td class="num ${b3[1]}">${fmt(F.faPer100, 2)}</td><td class="num ${b4[1]}">${pct(F.faRuns)}</td></tr></tbody>`;
    renderProjection();
  }

  function renderProjection() {
    const T = U.table, d = tx(T.days);
    const wins = Array.from(new Set((sim.projection.compareWindows || []).concat([sim.projection.window]))).sort((a, b) => a - b);
    const offs = sim.projection.evalOffsets;
    const rows = wins.map(w => {
      const s = clone(sim); s.projection.window = w;
      const r = E.cohort(s, { driftMult: state.drift, noiseMult: state.noise });
      return { w, p: r.projection };
    });
    const head = offs.map(o => `<th>${o === 0 ? tx(T.atAlert) : tx(T.plus) + " " + o + " " + d}</th>`).join("");
    $("projTbl").innerHTML = `<thead><tr><th>${tx(U.controls.window)}</th>${head}</tr></thead><tbody>` +
      rows.map(r => `<tr class="${r.w === sim.projection.window ? "current" : ""}"><td class="num"><b>${r.w}</b></td>` +
        r.p.map(p => p.n ? `<td class="num">${fmt(p.medAbs, 1)} ${d}<br><span class="muted">±5: ${pct(p.within5)} · n=${p.n}</span></td>` : "<td>—</td>").join("") + "</tr>").join("") +
      `</tbody><caption style="caption-side:bottom;text-align:start;padding:8px 4px" class="muted">${tx(T.medAbs)} · ${tx(T.within5)} · ${tx(T.n)}</caption>`;
  }

  function renderSensitivity() {
    const btn = $("sensBtn"); btn.disabled = true; btn.textContent = t(U.controls.running);
    setTimeout(() => {
      const S = sim.sensitivity, T = U.table, d = tx(T.days);
      let html = `<table class="tbl"><thead><tr><th>${tx(T.noise)} / ${tx(T.drift)}</th>${S.drift.map(x => `<th class="num">${x}</th>`).join("")}</tr></thead><tbody>`;
      S.noise.forEach(nz => {
        html += `<tr><td class="num"><b>${nz}</b></td>`;
        S.drift.forEach(dr => {
          const r = E.cohort(sim, { n: S.reps, driftMult: dr, noiseMult: nz, skipProjection: true });
          html += `<td class="num"><span style="color:var(--personal)">${pct(r.personal.rate)} · ${fmt(r.personal.medianDelay, 0)}${d ? " " + d : ""} · FA ${fmt(r.personal.faPer100, 2)}</span><br><span style="color:var(--fixed)">${pct(r.fixed.rate)} · ${fmt(r.fixed.medianDelay, 0)} ${d} · FA ${fmt(r.fixed.faPer100, 2)}</span></td>`;
        });
        html += "</tr>";
      });
      html += `</tbody><caption style="caption-side:bottom;text-align:start;padding:8px 4px" class="muted"><span style="color:var(--personal)">${tx(T.personal)}</span> / <span style="color:var(--fixed)">${tx(T.fixed)}</span> — ${tx(T.rate)} · ${tx(T.delay)} · FA = ${tx(T.fa)} · n=${S.reps}</caption></table>`;
      $("sensOut").innerHTML = html;
      btn.disabled = false; btn.innerHTML = tx(U.controls.runSens);
    }, 30);
  }

  // ---------- التحديث ----------
  let timer = null;
  function refresh() {
    $("anchorWrap").style.display = sim.personal.baselineMode === "rolling" ? "" : "none";
    renderCharts();
    clearTimeout(timer);
    timer = setTimeout(renderCohort, 120);
  }

  function renderAll() {
    renderStatic();
    $("chartLegend").innerHTML = legendHTML();
    renderControls();
    renderCharts();
    renderCohort();
    if ($("sensOut").innerHTML) renderSensitivity();
  }

  $("langBtn").addEventListener("click", () => {
    lang = lang === "ar" ? "en" : "ar";
    try { localStorage.setItem("vitalx-lang", lang); } catch (e) { /* تجاهل */ }
    renderAll();
  });
  $("sensBtn").addEventListener("click", renderSensitivity);
  let rz = null;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(renderCharts, 150); });

  renderAll();
})();
