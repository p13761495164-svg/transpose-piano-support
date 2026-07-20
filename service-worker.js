const CACHE_NAME = "transpose-piano-pwa-v4";
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

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./piano.html", copy));
          return response;
        })
        .catch(() => caches.match("./piano.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
