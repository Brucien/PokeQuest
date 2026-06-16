/**
 * PokeQuest Service Worker
 * Hardened Hybrid Caching Architecture
 */

const CACHE_VERSION = 'v1.0.1';
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
        // Using relative paths ensures compatibility across different deployment directories
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

  // Enforce bypass for non-GET mutators and alternative protocol schemes (extensions, etc.)
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Strategy Separation: Check if the asset belongs to the pre-cached static shell
  const isStaticAsset = STATIC_ASSETS.some(asset => {
    const absoluteAssetUrl = new URL(asset, self.location.href).toString();
    return request.url === absoluteAssetUrl || (asset === './' && request.url === self.location.href);
  });

  if (isStaticAsset) {
    // CACHE-FIRST Strategy for the App Shell to combat "Lie-Fi" latency drops
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback safety catch
        return fetch(request);
      })
    );
  } else {
    // NETWORK-FIRST Strategy for everything else (external sprite repositories, API configs)
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
          // Network failure mitigation pipeline
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Universal Document Fallback
            if (request.destination === 'document') {
              return caches.match('./index.html');
            }

            // Asset Fallback defaults
            if (request.destination === 'image') {
              return new Response(
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#475569"><rect width="24" height="24" rx="4" fill="#0f172a"/><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-5-7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }

            return new Response('Offline Channel Interrupted — Resource Unavailable', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
        })
    );
  }
});

// ============================================
// MESSAGING - Administrative Operations Sync
// ============================================
self.addEventListener('message', (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              console.log(`🗑️ Administrative flush of cache target: ${cacheName}`);
              return caches.delete(cacheName);
            })
          );
        })
      );
      break;
  }
});
