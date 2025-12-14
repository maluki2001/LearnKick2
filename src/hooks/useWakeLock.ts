'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface WakeLockSentinel {
  released: boolean
  type: 'screen'
  release(): Promise<void>
  addEventListener(type: 'release', listener: () => void): void
  removeEventListener(type: 'release', listener: () => void): void
}

interface NavigatorWithWakeLock extends Navigator {
  wakeLock?: {
    request(type: 'screen'): Promise<WakeLockSentinel>
  }
}

/**
 * Hook to manage Screen Wake Lock API
 * Keeps the screen on during gameplay to prevent mobile devices from sleeping
 */
export function useWakeLock() {
  const [isSupported, setIsSupported] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Check if Wake Lock API is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const nav = navigator as NavigatorWithWakeLock
      setIsSupported('wakeLock' in navigator && nav.wakeLock !== undefined)
    }
  }, [])

  // Handle visibility change - reacquire wake lock when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && wakeLockRef.current?.released) {
        // Wake lock was released when tab was hidden, try to reacquire
        try {
          const nav = navigator as NavigatorWithWakeLock
          if (nav.wakeLock) {
            wakeLockRef.current = await nav.wakeLock.request('screen')
            setIsActive(true)
          }
        } catch {
          // Silently fail - user may have navigated away
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  /**
   * Request a screen wake lock to keep the display on
   */
  const requestWakeLock = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false

    const nav = navigator as NavigatorWithWakeLock
    if (!nav.wakeLock) {
      console.log('Wake Lock API not supported')
      return false
    }

    try {
      wakeLockRef.current = await nav.wakeLock.request('screen')

      // Handle wake lock release
      wakeLockRef.current.addEventListener('release', () => {
        setIsActive(false)
      })

      setIsActive(true)
      console.log('Wake Lock acquired - screen will stay on')
      return true
    } catch (err) {
      console.warn('Failed to acquire wake lock:', err)
      setIsActive(false)
      return false
    }
  }, [])

  /**
   * Release the wake lock to allow the screen to turn off
   */
  const releaseWakeLock = useCallback(async (): Promise<void> => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
        setIsActive(false)
        console.log('Wake Lock released - screen can turn off')
      } catch (err) {
        console.warn('Failed to release wake lock:', err)
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
      }
    }
  }, [])

  return {
    isSupported,
    isActive,
    requestWakeLock,
    releaseWakeLock,
  }
}

/**
 * Simple utility to request wake lock outside React components
 */
export async function keepScreenOn(): Promise<WakeLockSentinel | null> {
  if (typeof window === 'undefined') return null

  const nav = navigator as NavigatorWithWakeLock
  if (!nav.wakeLock) return null

  try {
    const wakeLock = await nav.wakeLock.request('screen')
    console.log('Screen wake lock acquired')
    return wakeLock
  } catch {
    console.warn('Could not acquire screen wake lock')
    return null
  }
}
