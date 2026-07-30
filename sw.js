const CACHE_NAME = 'starlink-keeper-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html'
];

// Cache core UI shell elements during initialization
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Purge obsolete network caches automatically across deployment versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// High-Performance Network Interceptor
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CRITICAL RESOLVER PATH: Force raw physical network interface queries for 'ping.txt'
  if (url.pathname.includes('ping.txt')) {
    event.respondWith(
      fetch(event.request, { mode: 'same-origin' })
        .then((response) => {
          // If the network responds but it's a server error status, pass it to trigger the drop event handler
          if (!response.ok) {
            return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
          }
          return response;
        })
        .catch(() => {
          // If a true physical link micro-drop occurs, return a distinct broken status code to the client script
          return new Response("Network Down", { status: 404, statusText: "Not Found" });
        })
    );
    return;
  }

  // Fallback cache routing logic for absolute offline system boot capabilities
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
