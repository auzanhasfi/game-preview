/* JawiKu service worker — naikkan VERSI setiap kali fail berubah */
const VERSI = 'jawiku-20261019-0202';
const FAIL = ['./', 'index.html', 'styles.css', 'data.js', 'icons.js', 'app.js', 'manifest.webmanifest', 'icons/ikon.svg', 'icons/ikon-192.png', 'icons/ikon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSI).then(c => c.addAll(FAIL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== VERSI).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    if (res.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.includes('fonts.g'))) { const c = res.clone(); caches.open(VERSI).then(ca => ca.put(e.request, c)); }
    return res;
  }).catch(() => caches.match('index.html'))));
});
