// SPMB 2026 Service Worker — v2
// Cache-first for static assets, network-first for API, always show app shell

const CACHE_NAME = 'spmb2026-v2'
const APP_SHELL_CACHE = 'spmb2026-shell-v2'

// Static assets to pre-cache on install (app shell)
const APP_SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Install event — pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => {
      console.log('[SW] Pre-caching app shell')
      return cache.addAll(APP_SHELL_ASSETS).catch((err) => {
        console.warn('[SW] Some app shell assets failed to cache:', err)
      })
    })
  )
  // Activate immediately without waiting for old SW to finish
  self.skipWaiting()
})

// Activate event — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== APP_SHELL_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )
  // Take control of all clients immediately
  self.clients.claim()
})

// Fetch event — routing strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return

  // Strategy: Network-first for API calls (always get fresh data)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithFallback(request))
    return
  }

  // Strategy: Stale-while-revalidate for navigation (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  // Strategy: Cache-first for static assets (JS, CSS, images, fonts)
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Default: Network-first
  event.respondWith(networkFirstWithFallback(request))
})

// Cache-first strategy — serve from cache, fallback to network
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('', { status: 503, statusText: 'Offline' })
  }
}

// Network-first strategy with cache fallback
async function networkFirstWithFallback(request) {
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

    // For API auth check, return not authenticated
    const url = new URL(request.url)
    if (url.pathname === '/api/auth/me') {
      return new Response(
        JSON.stringify({ success: false, authenticated: false }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Offline' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 503,
      }
    )
  }
}

// Stale-while-revalidate — serve from cache, update in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  // Fetch in background to update cache
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => cached)

  // Return cached version immediately if available, otherwise wait for network
  return cached || fetchPromise
}

// Check if URL is a static asset
function isStaticAsset(url) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    '.json', '.webp', '.avif',
  ]
  return staticExtensions.some((ext) => url.pathname.endsWith(ext))
}
