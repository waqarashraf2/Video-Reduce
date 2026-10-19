const CACHE_NAME = "videoreduce-v5";
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

// Activate Event: Purge ALL old caches (including 'videoreduce-v4', 'videoreduce-v2', 'privatemedia-v1') immediately
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

  // Bypass service worker completely on local development environments
  if (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname.endsWith(".local")
  ) {
    return;
  }

  // Only intercept same-origin requests (never intercept cross-origin media/CDNs like GitHub or Unsplash)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Never intercept streaming media files (MP4, WebM, MP3) or HTTP Range requests
  // CacheStorage does NOT support 206 Partial Content (causes net::ERR_CACHE_OPERATION_NOT_SUPPORTED)
  const isMediaFile = /\.(mp4|webm|ogg|mp3|wav|mov|mkv|avi|flv|m4v)(\?.*)?$/i.test(url.pathname);
  if (isMediaFile || event.request.headers.has("range")) {
    return;
  }

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

  // 1. HTML Pages (Navigation) & Next.js RSC Flight Payloads (.txt): ALWAYS NETWORK-FIRST
  // This guarantees visitors immediately receive fresh chunk hashes without webpack module mismatch errors.
  const isHtmlNavigation = event.request.mode === "navigate" || event.request.headers.get("accept")?.includes("text/html");
  const isRscPayload = url.pathname.endsWith(".txt") || event.request.headers.get("RSC") === "1";

  if (isHtmlNavigation || isRscPayload) {
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
            return cached || (isHtmlNavigation ? caches.match(OFFLINE_FALLBACK) : undefined);
          });
        })
    );
    return;
  }

  // 2. Static Assets (_next/static chunks): Stale-While-Revalidate with strict MIME integrity check
  // Next.js static chunks have hashes in filenames, so they are safe to cache IF AND ONLY IF they are valid assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const isJsAsset = url.pathname.endsWith(".js") || url.pathname.includes("/_next/static/chunks/");
      const isCssAsset = url.pathname.endsWith(".css");

      if (cachedResponse) {
        const cachedCt = cachedResponse.headers.get("content-type") || "";

        // CRITICAL INTEGRITY CHECK: Discard poisoned cache where 404 HTML was cached as JS/CSS
        if ((isJsAsset && !cachedCt.includes("javascript")) || (isCssAsset && !cachedCt.includes("css"))) {
          console.warn("[SW] Purging corrupted non-script cached asset:", url.pathname);
          caches.open(CACHE_NAME).then((cache) => cache.delete(event.request));
        } else {
          // Valid cached asset: revalidate in background
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const netCt = networkResponse.headers.get("content-type") || "";
                if ((isJsAsset && netCt.includes("javascript")) || (isCssAsset && netCt.includes("css")) || (!isJsAsset && !isCssAsset)) {
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                  });
                }
              }
            })
            .catch(() => {});
          return cachedResponse;
        }
      }

      // Fetch from network with strict validation
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }

        const netCt = networkResponse.headers.get("content-type") || "";

        // NEVER cache HTML responses for JavaScript or CSS assets (prevents strict MIME type execution errors)
        if ((isJsAsset && !netCt.includes("javascript")) || (isCssAsset && !netCt.includes("css"))) {
          console.warn("[SW] Refusing to cache non-script response for static asset:", url.pathname, netCt);
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
