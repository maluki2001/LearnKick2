'use client'

import { getLeagueByTrophies, LEAGUE_DISPLAY, League } from '@/constants/leagues'

interface LeagueBadgeProps {
  trophies?: number
  league?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showName?: boolean
  showTrophies?: boolean
  animated?: boolean
  className?: string
}

export function LeagueBadge({
  trophies = 0,
  league,
  size = 'md',
  showName = true,
  showTrophies = false,
  animated = false,
  className = '',
}: LeagueBadgeProps) {
  const leagueInfo = league
    ? getLeagueByTrophies(trophies) // Use trophies to get current league
    : getLeagueByTrophies(trophies)

  const display = LEAGUE_DISPLAY[leagueInfo.id as keyof typeof LEAGUE_DISPLAY] || {
    emoji: '',
    label: formatLeagueName(leagueInfo),
  }

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl',
  }

  const containerSizes = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3',
    xl: 'gap-4',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }

  return (
    <div
      className={`inline-flex items-center ${containerSizes[size]} ${className}`}
    >
      {/* League Icon */}
      <div
        className={`
          ${sizeClasses[size]}
          ${animated ? 'animate-pulse' : ''}
          select-none
        `}
        style={{
          filter: animated ? 'drop-shadow(0 0 8px gold)' : 'none',
        }}
      >
        {display.emoji}
      </div>

      {/* League Name and Trophies */}
      {(showName || showTrophies) && (
        <div className="flex flex-col">
          {showName && (
            <span
              className={`font-semibold ${textSizes[size]}`}
              style={{ color: leagueInfo.color }}
            >
              {display.label}
            </span>
          )}
          {showTrophies && (
            <span className={`text-gray-500 ${textSizes[size]}`}>
              {trophies.toLocaleString()} trophies
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Compact version for leaderboards and small displays
export function LeagueBadgeCompact({
  trophies = 0,
  className = '',
}: {
  trophies?: number
  className?: string
}) {
  const league = getLeagueByTrophies(trophies)
  const display = LEAGUE_DISPLAY[league.id as keyof typeof LEAGUE_DISPLAY]

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      title={display?.label || formatLeagueName(league)}
    >
      <span className="text-sm">{display?.emoji}</span>
      <span className="text-xs font-medium" style={{ color: league.color }}>
        {trophies.toLocaleString()}
      </span>
    </span>
  )
}

// Badge with background for headers
export function LeagueBadgeCard({
  trophies = 0,
  name,
  wins = 0,
  losses = 0,
  className = '',
}: {
  trophies?: number
  name?: string
  wins?: number
  losses?: number
  className?: string
}) {
  const league = getLeagueByTrophies(trophies)
  const display = LEAGUE_DISPLAY[league.id as keyof typeof LEAGUE_DISPLAY]
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl p-4
        bg-gradient-to-r ${league.bgGradient}
        text-white shadow-lg
        ${className}
      `}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-8 -top-8 text-9xl">{display?.emoji}</div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center gap-4">
        <div className="text-5xl">{display?.emoji}</div>
        <div className="flex-1">
          {name && <div className="text-lg font-bold">{name}</div>}
          <div className="text-2xl font-bold">{display?.label}</div>
          <div className="flex gap-4 text-sm opacity-90">
            <span>{trophies.toLocaleString()} Trophies</span>
            <span>{winRate}% Win Rate</span>
          </div>
        </div>
      </div>
    </div>
  )
}
