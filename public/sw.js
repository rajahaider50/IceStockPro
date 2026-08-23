// IceStock Pro — Service Worker (PWA Offline Engine)
const CACHE_NAME = 'icestock-pro-v1.0';

// App shell (Vite injects hashed asset URLs at runtime; those get cached on first load)
const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.webmanifest',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-192.png',
    './icons/icon-maskable-512.png'
];

// Install: cache core shell — each asset individually so one failure never blocks install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                CORE_ASSETS.map((asset) =>
                    cache.add(asset).catch((err) => {
                        console.log('[SW] Skipped during install:', asset, err);
                    })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// Activate: clean outdated caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (!request.url.startsWith('http')) return;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    const sameOrigin = url.origin === self.location.origin;

    // Page navigations: Network-First with offline fallback to cached app shell (SPA)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(request);
                    return cached || caches.match('./index.html');
                })
        );
        return;
    }

    // Static assets: Stale-While-Revalidate → instant native-like loads + background refresh
    event.respondWith(
        caches.match(request).then((cached) => {
            const refresh = fetch(request)
                .then((response) => {
                    // Cache successful & opaque responses (CDN fonts etc.)
                    if (response && (response.status === 200 || response.type === 'opaque')) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => cached);
            return cached || refresh;
        })
    );
});
