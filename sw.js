/**
 * PokeQuest Service Worker
 * Enables offline functionality and caches app shell
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `pokequest-${CACHE_VERSION}`;
const RUNTIME_CACHE = `pokequest-runtime-${CACHE_VERSION}`;

// Files to cache on install (app shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
];

// ============================================
// INSTALL - Cache app shell
// ============================================
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Caching app shell');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('❌ Cache failed:', err);
      })
  );
});

// ============================================
// ACTIVATE - Clean up old caches
// ============================================
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// ============================================
// FETCH - Network first, fall back to cache
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other non-http(s)
  if (!request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    // Try network first
    fetch(request)
      .then((response) => {
        // Don't cache if not a success response
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseClone = response.clone();

        // Cache successful responses for runtime caching
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Fallback for images
            if (request.destination === 'image') {
              return caches.match('/placeholder-image.png');
            }

            // Fallback for documents
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }

            return new Response('Offline - Resource not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// ============================================
// MESSAGE HANDLER - Communicate with app
// ============================================
self.addEventListener('message', (event) => {
  console.log('💬 Message received by SW:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    });
  }
});

console.log('✅ Service Worker loaded');
