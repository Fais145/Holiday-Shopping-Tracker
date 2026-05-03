/* YV Japan Buy Quest — offline shell + runtime caching. Bump *_v suffix when changing semantics. */

const PRECACHE_STATIC = "yv-quest-precache-v1"
const RUNTIME = "yv-quest-runtime-v1"

const PRECACHE_URLS = [
  "/offline.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/bg-strawberry-pattern.png",
]

self.addEventListener("install", (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches
      .open(PRECACHE_STATIC)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((err) => console.error("[sw] precache failed", err))
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      const keep = new Set([PRECACHE_STATIC, RUNTIME])
      await Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k)))
      await self.clients.claim()
    })()
  )
})

function isSameOrigin(url) {
  return url.origin === self.location.origin
}

function shouldPutInRuntime(request, response) {
  if (request.method !== "GET") return false
  if (!response || response.status !== 200) return false
  if (response.type !== "basic") return false
  return true
}

async function navigationHtmlFallback(request) {
  const url = new URL(request.url)
  const paths = [`${url.origin}${url.pathname}`, `${self.location.origin}/stores`, `${self.location.origin}/`]
  for (const p of paths) {
    const hit = await caches.match(p)
    if (hit) return hit
  }
  const offline = await caches.match("/offline.html")
  return offline
}

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return

  const url = new URL(request.url)

  // Maps, CDN, fonts, etc. — do not intercept; never cache externally.
  if (!isSameOrigin(url)) return

  const acceptHtml = request.headers.get("accept")?.includes("text/html")

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request)
        if (shouldPutInRuntime(request, response)) {
          const copy = response.clone()
          caches.open(RUNTIME).then((cache) => cache.put(request, copy))
        }
        return response
      } catch {
        const cached = await caches.match(request)
        if (cached) return cached
        if (request.mode === "navigate" || acceptHtml) {
          const nav = await navigationHtmlFallback(request)
          if (nav) return nav
        }
        const fallback = await caches.match("/offline.html")
        return fallback || Response.error()
      }
    })()
  )
})
