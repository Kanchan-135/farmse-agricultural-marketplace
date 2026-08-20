const CACHE_NAME = 'farmse-pwa-v1';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png'
];

// Install: Pre-cache core shell and offline assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch handler: Network-first for navigation/API with fallback to cache/offline
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Non-GET requests (POST, PUT, DELETE) pass directly to network
  if (request.method !== 'GET') {
    return;
  }

  // Handle HTML document navigation
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Update cache with fresh copy of visited pages
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline, check cache first, otherwise show offline fallback page
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) {
            return offlinePage;
          }
          return new Response('FarmSe is currently offline. Please check your internet connection.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        })
    );
    return;
  }

  // Static Assets (Images, Icons, CSS, JS): Stale-While-Revalidate
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default fetch fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
