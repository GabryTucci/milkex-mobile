// MILKeX Mobile: l'app si apre anche senza rete (file dell'app in cache); i PDF li salva app.js.
const CACHE = "milkex-mobile-shell";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;   // GitHub: sempre dalla rete
  // prima la rete (versione aggiornata), senza rete la copia salvata
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => {
    if (r.ok) { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./"))));
});
