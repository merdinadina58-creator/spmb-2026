// SPMB 2026 Service Worker — v3
// Network-first for all requests, only cache for offline fallback

const CACHE_NAME = 'spmb2026-v3'

// Install event — just activate immediately, no pre-caching
self.addEventListener('install', () => {
  self.skipWaiting()
})

// Activate event — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event — always network-first, cache for offline fallback only
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip non-http requests
  if (!url.protocol.startsWith('http')) return

  // For API calls: network-first, offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstAPI(request))
    return
  }

  // For everything else: network-first with cache fallback
  event.respondWith(networkFirst(request))
})

// Network-first for API — with offline fallback
async function networkFirstAPI(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // Try cache
    const cached = await caches.match(request)
    if (cached) return cached

    // For auth check, return not authenticated when offline
    const url = new URL(request.url)
    if (url.pathname === '/api/auth/me') {
      return new Response(
        JSON.stringify({ success: false, authenticated: false }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Offline' }),
      { headers: { 'Content-Type': 'application/json' }, status: 503 }
    )
  }
}

// Network-first for pages/assets — no stale-while-revalidate (prevents hydration mismatch)
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return new Response('', { status: 503, statusText: 'Offline' })
  }
}
