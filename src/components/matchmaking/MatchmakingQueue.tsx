'use client'

import { useEffect, useState } from 'react'
import { useMatchmaking } from '@/hooks/useMatchmaking'
import { getLeagueByTrophies, LEAGUE_DISPLAY } from '@/constants/leagues'
import { useLanguage } from '@/contexts/LanguageContext'

interface MatchmakingQueueProps {
  language?: string
  onMatchFound?: (matchId: string) => void
  onCancel?: () => void
}

export function MatchmakingQueue({
  language = 'en',
  onMatchFound,
  onCancel,
}: MatchmakingQueueProps) {
  const { t } = useLanguage()
  const matchmaking = useMatchmaking()
  const [dots, setDots] = useState('.')

  // Animate dots
  useEffect(() => {
    if (matchmaking.isSearching) {
      const interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? '.' : prev + '.'))
      }, 500)
      return () => clearInterval(interval)
    }
  }, [matchmaking.isSearching])

  // Handle match found
  useEffect(() => {
    if (matchmaking.status === 'matched' && matchmaking.matchId && onMatchFound) {
      onMatchFound(matchmaking.matchId)
    }
  }, [matchmaking.status, matchmaking.matchId, onMatchFound])

  // Auto-join queue on mount
  useEffect(() => {
    matchmaking.joinQueue(language)

    return () => {
      // Cleanup: leave queue if still searching
      if (matchmaking.isSearching) {
        matchmaking.leaveQueue()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCancel = async () => {
    await matchmaking.leaveQueue()
    onCancel?.()
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    return `${secs}s`
  }

  if (matchmaking.status === 'error') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">{t.matchmaking.error}</div>
          <h2 className="text-xl font-bold text-red-500 mb-2">
            {t.matchmaking.somethingWrong}
          </h2>
          <p className="text-gray-500 mb-6">{matchmaking.error}</p>
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-200 rounded-xl font-medium hover:bg-gray-300"
          >
            {t.matchmaking.goBack}
          </button>
        </div>
      </div>
    )
  }

  if (matchmaking.status === 'matched' && matchmaking.opponent) {
    return <MatchFoundScreen matchmaking={matchmaking} />
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-center z-50">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-9xl rotate-12">Soccer Ball</div>
        <div className="absolute bottom-10 right-10 text-9xl -rotate-12">Trophy</div>
      </div>

      <div className="relative z-10 text-center text-white px-4">
        {/* Searching animation */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto relative">
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
            <div
              className="absolute inset-4 rounded-full border-4 border-white/50 animate-ping"
              style={{ animationDelay: '0.2s' }}
            />
            <div
              className="absolute inset-8 rounded-full border-4 border-white/70 animate-ping"
              style={{ animationDelay: '0.4s' }}
            />
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl">Soccer Ball</span>
            </div>
          </div>
        </div>

        {/* Status text */}
        <h1 className="text-3xl font-bold mb-2">
          {matchmaking.statusMessage || t.matchmaking.findingOpponent}{dots}
        </h1>

        {/* Wait time */}
        <p className="text-xl opacity-80 mb-6">
          {formatTime(matchmaking.waitTime)}
        </p>

        {/* Queue info */}
        <div className="flex justify-center gap-6 mb-8 text-sm opacity-70">
          <div>
            <span className="font-bold">{matchmaking.playersInQueue}</span>
            <span> {t.matchmaking.playersOnline}</span>
          </div>
          {matchmaking.queuePosition > 0 && (
            <div>
              <span>{t.matchmaking.position} </span>
              <span className="font-bold">#{matchmaking.queuePosition}</span>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="max-w-sm mx-auto bg-white/10 rounded-xl p-4 mb-8">
          <p className="text-sm opacity-80">
            {matchmaking.waitTime < 10
              ? t.matchmaking.tips.lookingSkillLevel
              : matchmaking.waitTime < 20
              ? t.matchmaking.tips.expandingSearch
              : matchmaking.waitTime < 30
              ? t.matchmaking.tips.almostThere
              : t.matchmaking.tips.hangTight}
          </p>
        </div>

        {/* Cancel button */}
        <button
          onClick={handleCancel}
          className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors"
        >
          {t.matchmaking.cancel}
        </button>
      </div>
    </div>
  )
}

// Match Found Screen
function MatchFoundScreen({
  matchmaking,
}: {
  matchmaking: ReturnType<typeof useMatchmaking>
}) {
  const { t } = useLanguage()
  const [countdown, setCountdown] = useState(5)
  const opponent = matchmaking.opponent!

  const opponentLeague = getLeagueByTrophies(opponent.trophies || 0)
  const display = LEAGUE_DISPLAY[opponentLeague.id as keyof typeof LEAGUE_DISPLAY]

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          // Navigate to game
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-green-600 to-green-800 flex items-center justify-center z-50">
      <div className="text-center text-white px-4">
        {/* Match Found Header */}
        <div className="mb-8 animate-bounce">
          <span className="text-6xl">Trophy</span>
          <h1 className="text-4xl font-bold mt-4">{t.matchmaking.matchFound}</h1>
        </div>

        {/* VS Display */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {/* You */}
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-2">
              <span className="text-4xl">YOU</span>
            </div>
            <p className="font-bold">{t.matchmaking.you}</p>
          </div>

          {/* VS */}
          <div className="text-4xl font-bold text-yellow-300">{t.matchmaking.vs}</div>

          {/* Opponent */}
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-2">
              <span className="text-4xl">{display?.emoji}</span>
            </div>
            <p className="font-bold">{opponent.name}</p>
            <p className="text-sm opacity-80">
              {opponent.trophies} {t.matchmaking.trophies}
            </p>
          </div>
        </div>

        {/* Match Quality Badge */}
        {matchmaking.matchQuality && (
          <div className={`
            inline-block px-4 py-2 rounded-full mb-6
            ${matchmaking.matchQuality === 'perfect' ? 'bg-yellow-400 text-yellow-900' :
              matchmaking.matchQuality === 'good' ? 'bg-green-400 text-green-900' :
              matchmaking.matchQuality === 'fair' ? 'bg-blue-400 text-blue-900' :
              'bg-gray-400 text-gray-900'}
          `}>
            {matchmaking.matchQuality === 'perfect' ? t.matchmaking.matchQuality.perfect :
             matchmaking.matchQuality === 'good' ? t.matchmaking.matchQuality.great :
             matchmaking.matchQuality === 'fair' ? t.matchmaking.matchQuality.good :
             t.matchmaking.matchQuality.found}
          </div>
        )}

        {/* Countdown */}
        <div className="text-6xl font-bold mb-4">
          {countdown > 0 ? countdown : t.matchmaking.go}
        </div>

        <p className="text-lg opacity-80">
          {countdown > 0 ? t.matchmaking.gameStartingIn : t.matchmaking.startingGame}
        </p>
      </div>
    </div>
  )
}

// Compact queue button for main menu
export function MatchmakingButton({
  onClick,
  disabled = false,
  className = '',
}: {
  onClick: () => void
  disabled?: boolean
  className?: string
}) {
  const { t } = useLanguage()

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        px-8 py-4 rounded-2xl font-bold text-xl
        bg-gradient-to-r from-green-500 to-green-600
        hover:from-green-600 hover:to-green-700
        text-white shadow-lg
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center gap-2">
        <span>{t.matchmaking.playMultiplayer}</span>
        <span className="text-2xl">Play Button</span>
      </span>

      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{
            transform: 'translateX(-100%)',
            animation: 'shimmer 2s infinite',
          }}
        />
      </div>
    </button>
  )
}
