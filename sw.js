/* VITALX service worker: offline + install as an app.
   Bump VERSION on each deploy so visitors get the new files. */
const VERSION = "vitalx-v3";
const CORE = [
  "./", "index.html", "manifest.webmanifest",
  "styles.css", "fonts.css", "appmode.css", "console.css", "six.css",
  "content.js", "engine.js", "pipeline.js", "site.js",
  "data/rr12-daily.js", "data/eda-missions.js", "data/rr12-raw.js",
  "icons/icon.svg", "icons/icon-32.png", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png",
  "media/astronaut.webp", "media/astronaut-440.webp", "media/ship-bg.webp", "media/ship-bg-1000.webp",
  "webfonts/ibm-plex-mono-400-latin-ext.woff2",
  "webfonts/ibm-plex-mono-400-latin.woff2",
  "webfonts/ibm-plex-mono-500-latin-ext.woff2",
  "webfonts/ibm-plex-mono-500-latin.woff2",
  "webfonts/ibm-plex-mono-600-latin-ext.woff2",
  "webfonts/ibm-plex-mono-600-latin.woff2",
  "webfonts/ibm-plex-sans-arabic-400-arabic.woff2",
  "webfonts/ibm-plex-sans-arabic-400-latin-ext.woff2",
  "webfonts/ibm-plex-sans-arabic-400-latin.woff2",
  "webfonts/ibm-plex-sans-arabic-500-arabic.woff2",
  "webfonts/ibm-plex-sans-arabic-500-latin-ext.woff2",
  "webfonts/ibm-plex-sans-arabic-500-latin.woff2",
  "webfonts/ibm-plex-sans-arabic-600-arabic.woff2",
  "webfonts/ibm-plex-sans-arabic-600-latin-ext.woff2",
  "webfonts/ibm-plex-sans-arabic-600-latin.woff2",
  "webfonts/ibm-plex-sans-arabic-700-arabic.woff2",
  "webfonts/ibm-plex-sans-arabic-700-latin-ext.woff2",
  "webfonts/ibm-plex-sans-arabic-700-latin.woff2",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("vitalx-") && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (/\.(mp4|webm)$/i.test(url.pathname) || req.headers.has("range")) return;   // الفيديو يبقى من الشبكة

  // الصفحة: الشبكة أولًا (لتصل التحديثات)، وعند انقطاع الإنترنت من الكاش
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put("index.html", copy)); } return res; })
      .catch(() => caches.match("index.html", { ignoreSearch: true })));
    return;
  }
  // بقية الملفات: من الكاش فورًا، وتحديثها في الخلفية
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res.ok && res.type === "basic") c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
