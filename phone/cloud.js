/* VITALX — سجل الأحداث إلى Firestore (REST). كل حدث يُحفظ أولاً في الجوال، ثم يُرفع على دفعات عند توفر الإنترنت.
   الاتصال يمر عبر جسر أندرويد (Android.http) إن وُجد، وإلا XMLHttpRequest في المتصفح. */
(function () {
  "use strict";
  var CFG = window.VX_CLOUD || {}, QK = "vx-queue", AK = "vx-auth", DK = "vx-device", CK = "vx-cap";
  var ls = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ممتلئ */ } }
  };
  var enabled = !!(CFG.apiKey && CFG.projectId);
  var device = ls.get(DK, null);
  if (!device) { device = "dev-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8); ls.set(DK, device); }
  var info = {};
  try { if (window.Android && window.Android.deviceInfo) info = JSON.parse(window.Android.deviceInfo()); } catch (e) { /* */ }
  var session = "s-" + Date.now().toString(36);

  // ---------- HTTP ----------
  var cbs = {}, cbN = 0;
  window.vxHttpCb = function (id, status, body) { var f = cbs[id]; delete cbs[id]; if (f) f(status, body); };
  function http(method, url, body, cb) {
    var A = window.Android;
    if (A && A.http) { var id = "h" + (++cbN); cbs[id] = cb; A.http(id, method, url, body ? JSON.stringify(body) : ""); return; }
    try {
      var x = new XMLHttpRequest(); x.open(method, url, true); x.setRequestHeader("Content-Type", "application/json");
      if (http.token) x.setRequestHeader("Authorization", "Bearer " + http.token);
      x.onreadystatechange = function () { if (x.readyState === 4) cb(x.status, x.responseText); };
      x.send(body ? JSON.stringify(body) : null);
    } catch (e) { cb(0, ""); }
  }
  function setToken(tk) { http.token = tk; try { if (window.Android && window.Android.setToken) window.Android.setToken(tk || ""); } catch (e) { /* */ } }

  // ---------- تسجيل الدخول المجهول (Firebase Auth) ----------
  function auth(cb) {
    var a = ls.get(AK, null), now = Date.now();
    if (a && a.idToken && a.exp > now + 60000) { setToken(a.idToken); cb(true); return; }
    if (a && a.refresh) {
      http("POST", "https://securetoken.googleapis.com/v1/token?key=" + CFG.apiKey, { grant_type: "refresh_token", refresh_token: a.refresh }, function (s, b) {
        if (s === 200) { var j = JSON.parse(b); save(j.id_token, j.refresh_token, j.expires_in); cb(true); } else { ls.set(AK, null); auth(cb); }
      });
      return;
    }
    http("POST", "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + CFG.apiKey, { returnSecureToken: true }, function (s, b) {
      if (s === 200) { var j = JSON.parse(b); save(j.idToken, j.refreshToken, j.expiresIn); cb(true); } else cb(false);
    });
    function save(tk, rf, ex) { ls.set(AK, { idToken: tk, refresh: rf, exp: Date.now() + (+ex || 3600) * 1000 }); setToken(tk); }
  }

  // ---------- تحويل القيم لصيغة Firestore ----------
  function fv(v) {
    if (v == null) return { nullValue: null };
    if (typeof v === "boolean") return { booleanValue: v };
    if (typeof v === "number") return isFinite(v) ? (Math.floor(v) === v ? { integerValue: String(v) } : { doubleValue: v }) : { nullValue: null };
    if (v instanceof Date) return { timestampValue: v.toISOString() };
    if (Object.prototype.toString.call(v) === "[object Array]") return { arrayValue: { values: v.map(fv) } };
    if (typeof v === "object") { var f = {}; for (var k in v) if (Object.prototype.hasOwnProperty.call(v, k)) f[k] = fv(v[k]); return { mapValue: { fields: f } }; }
    return { stringValue: String(v) };
  }

  // ---------- الطابور والرفع ----------
  var busy = false;
  function log(type, data) {
    var q = ls.get(QK, []);
    q.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), type: type, at: new Date().toISOString(), data: data || {} });
    if (q.length > 3000) q = q.slice(q.length - 3000);
    ls.set(QK, q);
  }
  function capOk(n) {
    var today = new Date().toISOString().slice(0, 10), c = ls.get(CK, { d: today, n: 0 });
    if (c.d !== today) c = { d: today, n: 0 };
    if (c.n + n > (CFG.dailyCap || 15000)) return false;
    c.n += n; ls.set(CK, c); return true;
  }
  function flush() {
    if (!enabled || busy) return;
    var q = ls.get(QK, []); if (!q.length) return;
    var batch = q.slice(0, 200); if (!capOk(batch.length)) return;
    busy = true;
    auth(function (ok) {
      if (!ok) { busy = false; return; }
      var base = "projects/" + CFG.projectId + "/databases/(default)/documents/" + (CFG.collection || "vitalx_events") + "/";
      var writes = batch.map(function (e) {
        return { update: { name: base + device + "-" + e.id, fields: {
          type: fv(e.type), at: { timestampValue: e.at }, device: fv(device), session: fv(e.session || session), model: fv(info.model || ""), data: fv(e.data) } },
          currentDocument: { exists: false } };
      });
      http("POST", "https://firestore.googleapis.com/v1/projects/" + CFG.projectId + "/databases/(default)/documents:commit", { writes: writes }, function (s, b) {
        busy = false;
        if (s === 200 || (s === 400 && /ALREADY_EXISTS/.test(b))) {
          var done = {}; batch.forEach(function (e) { done[e.id] = 1; });
          ls.set(QK, ls.get(QK, []).filter(function (e) { return !done[e.id]; }));
          if (s === 200) setTimeout(flush, 500);
        } else if (s === 401 || s === 403) { ls.set(AK, null); }
      });
    });
  }
  // نعلّم كل حدث بجلسته وقت إنشائه
  var rawLog = log;
  log = function (type, data) { rawLog(type, data); var q = ls.get(QK, []); if (q.length) { q[q.length - 1].session = session; ls.set(QK, q); } };

  setInterval(flush, 15000); setTimeout(flush, 3000);
  window.VXLOG = {
    log: log, flush: flush, enabled: enabled, device: device,
    pending: function () { return ls.get(QK, []).length; }
  };
  log("session_start", { info: info, lang: document.documentElement.lang, cloud: enabled });
})();
