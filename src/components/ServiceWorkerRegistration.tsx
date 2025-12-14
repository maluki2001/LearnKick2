'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Register service worker as early as possible
    if ('serviceWorker' in navigator) {
      // Wait for window load to not block initial render
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          })

          console.log('[PWA] Service Worker registered successfully:', registration.scope)

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available, show update notification if needed
                  console.log('[PWA] New content available, refresh to update')
                }
              })
            }
          })

          // Force update check
          registration.update().catch(() => {
            // Ignore update errors
          })
        } catch (error) {
          console.error('[PWA] Service Worker registration failed:', error)
        }
      }

      // Register immediately if document already loaded
      if (document.readyState === 'complete') {
        registerSW()
      } else {
        window.addEventListener('load', registerSW)
        return () => window.removeEventListener('load', registerSW)
      }
    }
  }, [])

  return null
}
