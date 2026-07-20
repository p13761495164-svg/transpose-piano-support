const CACHE_NAME = "transpose-piano-pwa-v14";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./piano.html",
  "./manifest.webmanifest",
  "./assets/app-icon.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/transpose-piano-screenshot.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => (
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isHtmlShell = isSameOrigin && (
    request.mode === "navigate" ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/piano.html")
  );

  if (isHtmlShell) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./piano.html", copy));
          return response;
        })
        .catch(() => caches.match("./piano.html"))
    );
    return;
  }

  if (isSameOrigin && (url.searchParams.has("v") || url.pathname.endsWith("/service-worker.js"))) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  event.respondWith(
    fetch(request, { cache: "no-store" })
      .then((response) => {
        if (isSameOrigin && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
