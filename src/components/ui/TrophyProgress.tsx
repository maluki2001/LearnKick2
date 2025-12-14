'use client'

import { useEffect, useState } from 'react'
import {
  getLeagueByTrophies,
  getNextLeague,
  getTrophiesToNextLeague,
  getLeagueProgress,
  formatLeagueName,
  LEAGUE_DISPLAY,
} from '@/constants/leagues'

interface TrophyProgressProps {
  trophies: number
  showAnimation?: boolean
  showLeagueIcons?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TrophyProgress({
  trophies,
  showAnimation = true,
  showLeagueIcons = true,
  size = 'md',
  className = '',
}: TrophyProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const currentLeague = getLeagueByTrophies(trophies)
  const nextLeague = getNextLeague(currentLeague.id)
  const progress = getLeagueProgress(trophies)
  const toNextLeague = getTrophiesToNextLeague(trophies)

  const currentDisplay = LEAGUE_DISPLAY[currentLeague.id as keyof typeof LEAGUE_DISPLAY]
  const nextDisplay = nextLeague
    ? LEAGUE_DISPLAY[nextLeague.id as keyof typeof LEAGUE_DISPLAY]
    : null

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setAnimatedProgress(progress)
    }
  }, [progress, showAnimation])

  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }

  const iconSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const isMaxLeague = !nextLeague

  return (
    <div className={`w-full ${className}`}>
      {/* League icons and labels */}
      {showLeagueIcons && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <span className={iconSizes[size]}>{currentDisplay?.emoji}</span>
            <span
              className={`font-medium ${textSizes[size]}`}
              style={{ color: currentLeague.color }}
            >
              {formatLeagueName(currentLeague)}
            </span>
          </div>

          {!isMaxLeague && nextDisplay && (
            <div className="flex items-center gap-1">
              <span
                className={`font-medium ${textSizes[size]}`}
                style={{ color: nextLeague?.color }}
              >
                {formatLeagueName(nextLeague!)}
              </span>
              <span className={iconSizes[size]}>{nextDisplay.emoji}</span>
            </div>
          )}

          {isMaxLeague && (
            <span className={`font-medium ${textSizes[size]} text-yellow-500`}>
              MAX LEAGUE!
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div
        className={`
          relative w-full ${heights[size]} rounded-full overflow-hidden
          bg-gray-200 dark:bg-gray-700
        `}
      >
        <div
          className={`
            absolute inset-y-0 left-0 rounded-full
            transition-all duration-700 ease-out
          `}
          style={{
            width: `${animatedProgress}%`,
            background: `linear-gradient(90deg, ${currentLeague.color}, ${nextLeague?.color || currentLeague.color})`,
          }}
        />

        {/* Shine effect */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
            animation: showAnimation ? 'shimmer 2s infinite' : 'none',
          }}
        />
      </div>

      {/* Progress text */}
      <div className={`flex justify-between mt-1 ${textSizes[size]} text-gray-500`}>
        <span>{trophies.toLocaleString()} trophies</span>
        {!isMaxLeague ? (
          <span>{toNextLeague} to go</span>
        ) : (
          <span>You&apos;re at the top!</span>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

// Compact version for headers
export function TrophyProgressCompact({
  trophies,
  className = '',
}: {
  trophies: number
  className?: string
}) {
  const currentLeague = getLeagueByTrophies(trophies)
  const progress = getLeagueProgress(trophies)
  const display = LEAGUE_DISPLAY[currentLeague.id as keyof typeof LEAGUE_DISPLAY]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-lg">{display?.emoji}</span>
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${progress}%`,
            backgroundColor: currentLeague.color,
          }}
        />
      </div>
      <span className="text-sm font-medium" style={{ color: currentLeague.color }}>
        {trophies}
      </span>
    </div>
  )
}

// Trophy change animation
export function TrophyChangeAnimation({
  change,
  onComplete,
}: {
  change: number
  onComplete?: () => void
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onComplete?.()
    }, 2000)
    return () => clearTimeout(timer)
  }, [onComplete])

  if (!visible) return null

  const isPositive = change > 0

  return (
    <div
      className={`
        fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
        text-4xl font-bold z-50
        animate-bounce
        ${isPositive ? 'text-green-500' : 'text-red-500'}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-5xl">{isPositive ? '+' : ''}{change}</span>
      </div>
    </div>
  )
}
