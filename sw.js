/* Ceol Gan Eagla Tuner — minimal service worker
   Offline core cache; cache-first for same-origin GETs. */
const CACHE = "cge-tuner-v1";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png?v=2",
  "./icons/icon-512.png?v=2",
  "./logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(CORE_ASSETS.map(url => new Request(url, { cache: "reload" })))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only same-origin GET requests
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  // Strip cache-busting query for icons/etc
  const url = new URL(req.url);
  const cleanURL = url.pathname.startsWith("/icons/")
    ? url.pathname
    : url.href;

  event.respondWith(
    caches.match(cleanURL, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;

      return fetch(req).then((resp) => {
        // Cache successful basic/opaque responses
        if (resp && resp.status === 200 && resp.type === "basic") {
          const copy = resp.clone();
          caches.open(CACHE).then((cache) => cache.put(cleanURL, copy)).catch(()=>{});
        }
        return resp;
      }).catch(() => {
        // Optional: return a minimal fallback page if offline and not cached
        return caches.match("./index.html");
      });
    })
  );
});
