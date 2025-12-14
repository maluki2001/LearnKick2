// LearnKick Service Worker
// Version: 2.0.0 - Full Offline PWA Support

const CACHE_VERSION = 'v2'
const STATIC_CACHE = `learnkick-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `learnkick-dynamic-${CACHE_VERSION}`
const PAGES_CACHE = `learnkick-pages-${CACHE_VERSION}`

// Files to cache immediately on install for offline shell
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/fonts/OpenDyslexic-Regular.woff',
  '/fonts/OpenDyslexic-Bold.woff'
]

// Offline fallback HTML - minimal app shell that loads from IndexedDB
const OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LearnKick - Offline</title>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#3B82F6">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .container {
      max-width: 400px;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      padding: 40px 30px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    .icon { font-size: 64px; margin-bottom: 20px; }
    h1 { font-size: 24px; margin-bottom: 16px; }
    p { font-size: 16px; opacity: 0.9; margin-bottom: 24px; line-height: 1.5; }
    .btn {
      display: inline-block;
      background: #3B82F6;
      color: white;
      padding: 14px 28px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59,130,246,0.4); }
    .btn:active { transform: translateY(0); }
    .status { margin-top: 20px; font-size: 14px; opacity: 0.7; }
    .cached-info { margin-top: 16px; padding: 12px; background: rgba(34,197,94,0.2); border-radius: 8px; font-size: 14px; }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top-color: #3B82F6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📱</div>
    <h1>Du bist offline</h1>
    <p>Keine Sorge! Wenn du Fragen heruntergeladen hast, kannst du trotzdem spielen.</p>
    <div id="loading" style="display:none;">
      <div class="spinner"></div>
      <p>App wird geladen...</p>
    </div>
    <div id="content">
      <button class="btn" onclick="tryReload()">Erneut versuchen</button>
      <div id="cached-status" class="status"></div>
    </div>
  </div>
  <script>
    // Check cached questions count
    async function checkCachedQuestions() {
      try {
        const request = indexedDB.open('LearnKickOffline', 1);
        request.onsuccess = function(event) {
          const db = event.target.result;
          if (db.objectStoreNames.contains('questions')) {
            const tx = db.transaction(['questions'], 'readonly');
            const store = tx.objectStore('questions');
            const countRequest = store.count();
            countRequest.onsuccess = function() {
              const count = countRequest.result;
              const statusEl = document.getElementById('cached-status');
              if (count > 0) {
                statusEl.innerHTML = '<div class="cached-info">✅ ' + count + ' Fragen sind offline verfuegbar!</div>';
              } else {
                statusEl.innerHTML = '<p>Lade Fragen herunter wenn du online bist, um offline spielen zu koennen.</p>';
              }
            };
          }
        };
      } catch (e) {
        console.log('Could not check IndexedDB:', e);
      }
    }

    function tryReload() {
      document.getElementById('content').style.display = 'none';
      document.getElementById('loading').style.display = 'block';

      // Try to reload after a short delay
      setTimeout(() => {
        if (navigator.onLine) {
          window.location.reload();
        } else {
          document.getElementById('loading').style.display = 'none';
          document.getElementById('content').style.display = 'block';
          alert('Immer noch offline. Bitte ueberpreufe deine Internetverbindung.');
        }
      }, 1500);
    }

    // Check on load
    checkCachedQuestions();

    // Listen for online event
    window.addEventListener('online', () => {
      window.location.reload();
    });
  </script>
</body>
</html>
`

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v2...')

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Precaching static assets')
        return Promise.all(
          PRECACHE_ASSETS.map(url =>
            cache.add(new Request(url, { cache: 'reload' })).catch(err => {
              console.log('[SW] Failed to cache:', url, err)
            })
          )
        )
      }),
      // Cache the offline page
      caches.open(PAGES_CACHE).then((cache) => {
        const offlineResponse = new Response(OFFLINE_HTML, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        })
        return cache.put('/offline.html', offlineResponse)
      })
    ]).then(() => {
      console.log('[SW] Installation complete')
      return self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete old versioned caches
            return name.startsWith('learnkick-') &&
                   !name.endsWith(CACHE_VERSION)
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    }).then(() => {
      console.log('[SW] Activation complete, claiming clients')
      return self.clients.claim()
    })
  )
})

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return

  // Skip requests to different origins (except CDN assets)
  if (url.origin !== self.location.origin) {
    // Allow caching of font/image CDN resources
    if (url.pathname.includes('fonts') || url.pathname.includes('images')) {
      event.respondWith(cacheFirst(request, STATIC_CACHE))
    }
    return
  }

  // API requests: network-first with offline JSON fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstAPI(request))
    return
  }

  // Static assets: cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/patterns/') ||
    url.pathname.match(/\.(js|css|woff|woff2|png|jpg|jpeg|svg|ico|webp)$/)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Next.js chunks and builds
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE))
    return
  }

  // HTML pages: network-first with offline fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstPage(request))
    return
  }

  // Everything else: network-first
  event.respondWith(networkFirst(request, DYNAMIC_CACHE))
})

// Cache-first strategy (for static assets)
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch (_error) {
    console.log('[SW] Cache-first failed for:', request.url)
    return new Response('Offline', { status: 503 })
  }
}

// Network-first strategy (for dynamic content)
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch (_error) {
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    return new Response('Offline', { status: 503 })
  }
}

// Stale-while-revalidate (for Next.js chunks)
async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request)

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(cacheName)
      cache.then(c => c.put(request, response.clone()))
    }
    return response
  }).catch(() => null)

  return cached || fetchPromise || new Response('Offline', { status: 503 })
}

// Network-first for API with offline JSON response
async function networkFirstAPI(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (_error) {
    // Try cache first
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }

    // Return offline JSON response
    return new Response(JSON.stringify({
      success: false,
      error: 'Offline - using cached questions',
      offline: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Network-first for pages with offline HTML fallback
async function networkFirstPage(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      // Cache the page for offline use
      const cache = await caches.open(PAGES_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (_error) {
    console.log('[SW] Page fetch failed, trying cache:', request.url)

    // Try to get the cached page
    const cached = await caches.match(request)
    if (cached) {
      console.log('[SW] Serving cached page:', request.url)
      return cached
    }

    // Try to get the cached home page
    const cachedHome = await caches.match('/')
    if (cachedHome) {
      console.log('[SW] Serving cached home page instead')
      return cachedHome
    }

    // Last resort: serve offline HTML
    console.log('[SW] Serving offline fallback page')
    const offlinePage = await caches.match('/offline.html')
    if (offlinePage) {
      return offlinePage
    }

    // Ultimate fallback - return inline offline HTML
    return new Response(OFFLINE_HTML, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    // Cache specific URLs on demand
    const urls = event.data.urls || []
    if (urls.length > 0) {
      caches.open(DYNAMIC_CACHE).then(cache => {
        urls.forEach(url => {
          fetch(url).then(response => {
            if (response.ok) {
              cache.put(url, response)
            }
          }).catch(() => {})
        })
      })
    }
  }
})

console.log('[SW] Service worker loaded v2')
