const CACHE = "ruta-dele-v34";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png"].concat(["verbdata/verbs-d-0.json", "verbdata/verbs-d-1.json", "verbdata/verbs-d-10.json", "verbdata/verbs-d-11.json", "verbdata/verbs-d-12.json", "verbdata/verbs-d-13.json", "verbdata/verbs-d-14.json", "verbdata/verbs-d-15.json", "verbdata/verbs-d-16.json", "verbdata/verbs-d-2.json", "verbdata/verbs-d-3.json", "verbdata/verbs-d-4.json", "verbdata/verbs-d-5.json", "verbdata/verbs-d-6.json", "verbdata/verbs-d-7.json", "verbdata/verbs-d-8.json", "verbdata/verbs-d-9.json", "verbdata/verbs-index.json"].concat(["gramdata/adjetivos.json", "gramdata/adverbios.json", "gramdata/articulos.json", "gramdata/conectores.json", "gramdata/conjunciones.json", "gramdata/determinantes.json", "gramdata/interjecciones.json", "gramdata/numerales.json", "gramdata/preposiciones.json", "gramdata/pronombres.json", "gramdata/reflexivos.json", "gramdata/sustantivos.json"]));

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("ruta-dele-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Google Fonts: serve from cache, refresh in the background
  // Fonts and the on-device AI engine code (the AI model itself is cached by the engine): cache, refresh in the background
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com" || url.hostname === "cdn.jsdelivr.net") {
    e.respondWith(caches.open(CACHE).then((c) => c.match(req).then((hit) => {
      const net = fetch(req).then((res) => { c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
    return;
  }
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith("/version.json")) return; // always from the network
  // Pages: network first so updates arrive, cache when offline
  if (req.mode === "navigate") {
    e.respondWith(fetch(req, { cache: "no-store" }).then((res) => { caches.open(CACHE).then((c) => c.put("index.html", res.clone())); return res; }).catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })));
});
