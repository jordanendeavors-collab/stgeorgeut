/* Keeps the site installable and shows the last page you saw when offline.
   Pages always come from the network first, so a new version appears right away.
   Live data is never stored here. */
var V = 'watch-shell-v1';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(function (res) { var c = res.clone(); caches.open(V).then(function (ch) { ch.put(r, c); }); return res; })
      .catch(function () { return caches.match(r).then(function (m) { return m || caches.match('/'); }); }));
  } else if (/\.(png|webmanifest)$/.test(u.pathname)) {
    e.respondWith(caches.match(r).then(function (m) { return m || fetch(r).then(function (res) { var c = res.clone(); caches.open(V).then(function (ch) { ch.put(r, c); }); return res; }); }));
  }
});
