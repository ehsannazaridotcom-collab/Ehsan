const CACHE_NAME = 'masir-ehsan-v3';
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// network-first: همیشه اول نسخه‌ی تازه از سرور رو می‌گیره تا آپدیت‌ها فوری دیده بشن؛
// فقط وقتی آفلاینی و به سرور دسترسی نیست، سراغ نسخه‌ی کش‌شده می‌ره.
// همچنین پاسخ‌های cross-origin (مثل فونت گوگل) رو هم کش می‌کنه تا آفلاین کامل کار کنه.
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res && (res.status === 200 || res.type === 'opaque') && e.request.method === 'GET') {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});

