const CACHE_NAME = 'workout-tracker-v1'; // Change version if you update assets
const urlsToCache = [
  '/', // Often caches index.html at the root
  'index.html',
  'style.css',
  'script.js',
  'app-icon.png',
  'manifest.json' // Also cache the manifest
];

// Install event: Cache the core application shell files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
         console.error('Failed to cache during install:', err);
      })
  );
});

// Fetch event: Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network, then cache it for next time
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(err => {
             console.error('Fetch failed:', err);
             // Optional: return an offline fallback page here if desired
        });
      })
  );
});

// Activate event: Clean up old caches (optional but good practice)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // Current cache name
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches if name doesn't match current version
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
