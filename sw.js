const CACHE_NAME = 'starlink-keeper-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html'
];

// Cache core files on installation step
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Clean outdated caches 
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Network intercept routing strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CRITICAL: Force the real network to handle 'ping.txt' request pulses.
  // Do not let the Service Worker mock it from the browser's cache storage.
  if (url.pathname.includes('ping.txt')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Use a Cache-First approach for UI resources so the program boots instantly while completely offline
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
