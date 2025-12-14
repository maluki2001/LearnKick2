'use client'

import { useState, useEffect, useMemo, useRef } from 'react'

export type LayoutMode = 'portrait-compact' | 'portrait-normal' | 'landscape' | 'desktop'

interface LayoutConfig {
  mode: LayoutMode
  arenaHeight: string      // CSS value
  questionHeight: string   // CSS value
  isStacked: boolean       // Arena above questions (true) or side-by-side (false)
  gridTemplate: string     // CSS grid-template value
  arenaScale: number       // Scale factor for arena elements
  showFullArena: boolean   // Whether to show full pitch or mini scoreboard
}

interface WindowSize {
  width: number
  height: number
  aspectRatio: number
  isPortrait: boolean
  isLandscape: boolean
}

// Debounced window size hook - only updates after resize settles
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>(() => {
    // Initialize with correct values on client
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      const height = window.innerHeight
      const aspectRatio = width / height
      return {
        width,
        height,
        aspectRatio,
        isPortrait: aspectRatio < 1,
        isLandscape: aspectRatio >= 1,
      }
    }
    // SSR fallback
    return {
      width: 400,
      height: 800,
      aspectRatio: 0.5,
      isPortrait: true,
      isLandscape: false,
    }
  })

  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleResize = () => {
      // Debounce resize events to prevent rapid re-renders
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }

      resizeTimeoutRef.current = setTimeout(() => {
        const width = window.innerWidth
        const height = window.innerHeight
        const aspectRatio = width / height

        setSize(prev => {
          // Only update if values actually changed significantly
          if (Math.abs(prev.width - width) < 10 && Math.abs(prev.height - height) < 10) {
            return prev
          }
          return {
            width,
            height,
            aspectRatio,
            isPortrait: aspectRatio < 1,
            isLandscape: aspectRatio >= 1,
          }
        })
      }, 100) // 100ms debounce
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [])

  return size
}

export function useResponsiveLayout(): LayoutConfig {
  const { width, height, isLandscape } = useWindowSize()

  // Memoize the layout config to prevent unnecessary recalculations
  const layoutConfig = useMemo((): LayoutConfig => {
    // LANDSCAPE: Wide screens (tablets, desktops) - Side by side layout
    if (isLandscape) {
      if (width >= 1024) {
        // Desktop: Large side-by-side
        return {
          mode: 'desktop',
          arenaHeight: '100%',
          questionHeight: '100%',
          isStacked: false,
          gridTemplate: '1fr 1fr', // 50% arena, 50% questions
          arenaScale: 1,
          showFullArena: true,
        }
      } else {
        // Tablet landscape: Side by side but arena smaller
        return {
          mode: 'landscape',
          arenaHeight: '100%',
          questionHeight: '100%',
          isStacked: false,
          gridTemplate: '45% 55%', // Arena takes 45%, questions 55%
          arenaScale: 0.9,
          showFullArena: true,
        }
      }
    }

    // PORTRAIT: Tall screens (phones) - Stacked layout
    const headerHeight = 44 // Fixed header
    const availableHeight = height - headerHeight

    // For very short screens (< 600px), minimize arena
    if (height < 600) {
      return {
        mode: 'portrait-compact',
        arenaHeight: '25vh', // Mini arena
        questionHeight: 'calc(75vh - 44px)',
        isStacked: true,
        gridTemplate: `${headerHeight}px 25vh 1fr`,
        arenaScale: 0.7,
        showFullArena: false, // Show mini scoreboard only
      }
    }

    // For normal portrait screens (600-900px)
    if (height < 900) {
      const minQuestionHeight = 250
      const maxArenaHeight = Math.min(availableHeight - minQuestionHeight, height * 0.4)

      return {
        mode: 'portrait-normal',
        arenaHeight: `${Math.max(150, maxArenaHeight)}px`,
        questionHeight: `calc(100vh - ${headerHeight + maxArenaHeight}px)`,
        isStacked: true,
        gridTemplate: `${headerHeight}px ${maxArenaHeight}px 1fr`,
        arenaScale: 0.85,
        showFullArena: true,
      }
    }

    // For tall portrait screens (> 900px, like tablets in portrait)
    return {
      mode: 'portrait-normal',
      arenaHeight: '35vh',
      questionHeight: 'calc(65vh - 44px)',
      isStacked: true,
      gridTemplate: `${headerHeight}px 35vh 1fr`,
      arenaScale: 1,
      showFullArena: true,
    }
  }, [width, height, isLandscape])

  return layoutConfig
}

// Hook to get just the screen info for debugging
export function useScreenInfo() {
  const { width, height, aspectRatio } = useWindowSize()
  const layout = useResponsiveLayout()

  return {
    width,
    height,
    aspectRatio: aspectRatio.toFixed(2),
    mode: layout.mode,
  }
}
