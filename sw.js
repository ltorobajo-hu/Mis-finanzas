/* Service worker: guarda la app para que abra sin conexión. Los datos NO pasan por aquí. */
const VERSION = 'mf-v1';
const SHELL = ['./','index.html','styles.css','app.js','views.js','main.js','manifest.webmanifest',
  'icon-192.png','icon-512.png','vendor/leaflet.js','vendor/leaflet.css','vendor/leaflet-heat.js',
  'vendor/fonts/sora-latin-600-normal.woff2','vendor/fonts/sora-latin-700-normal.woff2',
  'vendor/fonts/plus-jakarta-sans-latin-400-normal.woff2','vendor/fonts/plus-jakarta-sans-latin-500-normal.woff2',
  'vendor/fonts/plus-jakarta-sans-latin-600-normal.woff2','vendor/fonts/plus-jakarta-sans-latin-700-normal.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // API de Google y mapas: directo a la red
  // Primero la red (para ver cambios nuevos); si no hay conexión, la copia guardada.
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
