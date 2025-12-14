// App version for cache invalidation
// Update this version whenever significant changes are made to force cache refresh

export const APP_VERSION = '0.2.3'

const VERSION_KEY = 'learnkick_app_version'

/**
 * Check if the app version has changed and handle cache invalidation
 * Returns true if version changed (cache was cleared), false otherwise
 */
export function checkVersionAndInvalidateCache(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const storedVersion = localStorage.getItem(VERSION_KEY)

    if (storedVersion !== APP_VERSION) {
      console.log(`🔄 App version changed: ${storedVersion || 'none'} → ${APP_VERSION}`)

      // Clear caches
      clearAppCaches()

      // Store new version
      localStorage.setItem(VERSION_KEY, APP_VERSION)

      return true
    }

    return false
  } catch (error) {
    console.error('Error checking app version:', error)
    return false
  }
}

/**
 * Clear all app-related caches
 */
async function clearAppCaches(): Promise<void> {
  try {
    // Clear IndexedDB caches (questions, game data, etc.)
    const dbNames = ['learnkick-offline', 'learnkick-questions', 'learnkick-cache']

    for (const dbName of dbNames) {
      try {
        const deleteRequest = indexedDB.deleteDatabase(dbName)
        deleteRequest.onsuccess = () => console.log(`✅ Cleared IndexedDB: ${dbName}`)
        deleteRequest.onerror = () => console.log(`⚠️ Could not clear IndexedDB: ${dbName}`)
      } catch {
        // Database might not exist, that's okay
      }
    }

    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      for (const cacheName of cacheNames) {
        if (cacheName.includes('learnkick') || cacheName.includes('workbox')) {
          await caches.delete(cacheName)
          console.log(`✅ Cleared cache: ${cacheName}`)
        }
      }
    }

    // Clear specific localStorage items (keep user preferences)
    const keysToKeep = [
      'learnkick_app_version',
      'learnkick_theme',
      'learnkick_language',
      'admin_language',
      'learnkick_device_id',        // CRITICAL: Preserves user identity
      'learnkick_sound_settings',   // Preserves sound preferences
      'learnkick_accessibility',    // Preserves accessibility settings
    ]
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('learnkick') && !keysToKeep.includes(key)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`✅ Cleared localStorage: ${key}`)
    })

    console.log('🎉 Cache invalidation complete for version', APP_VERSION)

  } catch (error) {
    console.error('Error clearing caches:', error)
  }
}

/**
 * Force cache refresh (can be called manually)
 */
export async function forceRefreshCache(): Promise<void> {
  await clearAppCaches()
  localStorage.setItem(VERSION_KEY, APP_VERSION)

  // Reload the page to get fresh content
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

/**
 * Get current app version
 */
export function getAppVersion(): string {
  return APP_VERSION
}

/**
 * Get stored version from localStorage
 */
export function getStoredVersion(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(VERSION_KEY)
}
