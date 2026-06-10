const CACHE = "prisan-beauty-v1"

const STATIC_ASSETS = [
  "/",
  "/services",
  "/gallery",
  "/contact",
  "/faq",
  "/manifest.json",
  "/prisanbeautylogo.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok && !response.bodyUsed) {
            const cloned = response.clone()
            caches.open(CACHE).then((cache) => {
              cache.put(event.request, cloned)
            })
          }
          return response
        })
        .catch(() => cached)

      return cached || fetchPromise
    })
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      )
    })
  )
})
