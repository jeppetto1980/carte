// Le mie card - funziona offline. Cambia VERSION quando aggiorni index.html.
const VERSION = "card-v15";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Apre subito dalla cache, poi aggiorna in background
self.addEventListener("fetch", e => {
  // solo i file dell'app: le richieste verso altri siti (mappe, motore di lettura) vanno dirette in rete
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r && r.ok && new URL(e.request.url).origin === location.origin) cache.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
