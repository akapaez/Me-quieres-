/* Parte de Hueco — funcionamiento sin conexión */
const CACHE = "parte-hueco-v1";
const BASE = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    // la página siempre disponible, aunque no haya cobertura
    e.respondWith(
      fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put("./index.html", c)); return r; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      const c = r.clone();
      caches.open(CACHE).then(k => k.put(req, c)).catch(() => {});
      return r;
    }).catch(() => hit))
  );
});
