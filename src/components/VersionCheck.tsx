'use client'

import { useEffect, useState } from 'react'
import { checkVersionAndInvalidateCache, APP_VERSION } from '@/lib/appVersion'

export function VersionCheck() {
  const [versionChanged, setVersionChanged] = useState(false)

  useEffect(() => {
    const changed = checkVersionAndInvalidateCache()
    setVersionChanged(changed)

    if (changed) {
      // Show a brief notification that cache was refreshed
      console.log(`✨ LearnKick updated to v${APP_VERSION} - Cache refreshed!`)
    }
  }, [])

  // Show a brief toast when version changes (optional visual feedback)
  if (versionChanged) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
        <p className="text-sm font-medium">✨ App updated to v{APP_VERSION}</p>
      </div>
    )
  }

  return null
}
