/**
 * PokeQuest Service Worker
 * Hardened Hybrid Caching Architecture
 */

const CACHE_VERSION = 'v1.0.4'; // Incremented cache key to force immediate browser updates
const STATIC_CACHE = `pokequest-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `pokequest-runtime-${CACHE_VERSION}`;

// Core application shell assets required for instant offline startup
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json'
];

// ============================================
// INSTALL - Pre-cache App Shell
// ============================================
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Installing & Pre-caching Core Shell...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.error('❌ Service Worker: Static pre-cache failed:', err))
  );
});

// ============================================
// ACTIVATE - Purge Legacy Cache Storage
// ============================================
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating & Hardening Channels...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== STATIC_CACHE && cache !== RUNTIME_CACHE) {
              console.log(`🗑️ Service Worker: Purging deprecated cache bucket: ${cache}`);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ============================================
// FETCH - Tactical Routing Engine
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Check if asset is static app shell
  const isStaticAsset = STATIC_ASSETS.some(asset => {
    const absoluteAssetUrl = new URL(asset, self.location.href).toString();
    return request.url === absoluteAssetUrl || (asset === './' && request.url === self.location.href);
  });

  if (isStaticAsset) {
    // Cache-First strategy
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request);
      })
    );
  } else {
    // Network-First strategy
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            if (request.destination === 'document') {
              return caches.match('./index.html');
            }

            return new Response('Offline - Resource Interrupted', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
        })
    );
  }
});
