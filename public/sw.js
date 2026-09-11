const CACHE_NAME = "videoreduce-v2";
const OFFLINE_FALLBACK = "/";

// Assets for offline baseline
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/favicon.ico",
  "/logo.png"
];

// Install Event: Precache baseline and immediately take control
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Precache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Purge ALL old caches (including 'privatemedia-v1') immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting legacy stale cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-First for HTML/Navigations (ensures latest design on mobiles!)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Do not intercept Wasm binaries, API calls, or third-party CDN scripts
  if (
    url.pathname.endsWith(".wasm") ||
    url.pathname.includes("/api/") ||
    url.host.includes("googletagmanager") ||
    url.host.includes("google-analytics") ||
    url.host.includes("unpkg.com")
  ) {
    return;
  }

  // 1. HTML Pages (Navigation): ALWAYS NETWORK-FIRST
  // This guarantees mobile and desktop visitors immediately receive the latest design and code.
  if (event.request.mode === "navigate" || event.request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback when network is completely unreachable
          return caches.match(event.request).then((cached) => {
            return cached || caches.match(OFFLINE_FALLBACK);
          });
        })
    );
    return;
  }

  // 2. Static Assets (_next/static chunks): Stale-While-Revalidate
  // Next.js static chunks have hashes in filenames, so they are safe to cache
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Revalidate in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});

// Listen for messages from client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "PURGE_CACHE") {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    });
  }
});
