// sw.js — GiaBaoDashboard offline support
// Chiến lược: cache-first cho asset tĩnh (app shell + CDN libs), network-first
// cho chính index.html (để luôn lấy bản mới nhất khi có mạng, fallback cache khi mất mạng).
// Bump CACHE_VERSION mỗi khi deploy bản mới để buộc trình duyệt tải lại cache.

const CACHE_VERSION = "giabao-v1";
const CACHE_NAME = `giabao-dashboard-${CACHE_VERSION}`;

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
];

const CDN_ASSETS = [
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.25.0/babel.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.7/jsmediatags.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // App shell phải cache được, nếu lỗi thì install thất bại (đúng ý muốn).
      return cache.addAll(APP_SHELL).then(() =>
        // CDN assets: cố gắng cache nhưng không chặn install nếu 1 cái lỗi mạng.
        Promise.allSettled(
          CDN_ASSETS.map((url) =>
            cache.add(new Request(url, { mode: "cors" })).catch((err) => {
              console.warn("[SW] Could not pre-cache CDN asset:", url, err);
            })
          )
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("giabao-dashboard-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isCDN = url.hostname === "cdnjs.cloudflare.com";
  const isNavigation = request.mode === "navigate";

  if (isNavigation) {
    // Network-first cho trang chính: ưu tiên bản mới nhất, fallback cache khi offline.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", clone));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  if (isCDN) {
    // Cache-first cho thư viện CDN (React/Babel/jsmediatags) — versioned URL nên an toàn để cache dài hạn.
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request, { mode: "cors" }).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Mặc định: cache-first cho asset còn lại (manifest, icons).
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
