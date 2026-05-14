const CACHE_NAME = 'cantondict-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/icon.png'
];

const DB_PATH = '/data/CantonDict.db';

// Install Event - Cache only the essential app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Fetch Event - Strategic caching
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle the Database separately
  if (url.pathname.endsWith('CantonDict.db')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then((networkResponse) => {
          // Check if we should cache the DB (only if in standalone mode or explicitly requested)
          // We can't easily check standalone in SW, but we can check for a 'pwa' query param
          // that we'll add to the manifest start_url.
          return caches.open(CACHE_NAME).then((cache) => {
            const isPWA = url.searchParams.get('source') === 'pwa';
            if (isPWA && networkResponse.status === 200) {
              console.log('[Service Worker] Caching DB for PWA use');
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Standard assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});
