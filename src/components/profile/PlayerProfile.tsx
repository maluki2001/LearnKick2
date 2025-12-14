'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { LeagueBadgeCard } from '@/components/ui/LeagueBadge'
import { TrophyProgress } from '@/components/ui/TrophyProgress'
import { getLeagueByTrophies, LEAGUE_DISPLAY } from '@/constants/leagues'

interface ProfileData {
  id: string
  name: string
  email?: string
  role: string
  grade?: number
  school?: string
  schoolCode?: string
  trophies: number
  highestTrophies: number
  league: string
  leagueInfo: {
    id: string
    name: string
    color: string
    bgGradient: string
    minTrophies: number
    maxTrophies: number
  }
  wins: number
  losses: number
  winRate: number
  winStreak: number
  elo: number
  gamesPlayed: number
  recentMatches: Array<{
    id: string
    opponentName: string
    opponentTrophies: number
    won: boolean
    myGoals: number
    opponentGoals: number
    date: string
  }>
  memberSince: string
  isOwnProfile: boolean
}

interface PlayerProfileProps {
  userId?: string
  onClose?: () => void
}

export function PlayerProfile({ userId, onClose }: PlayerProfileProps) {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'stats' | 'history'>('stats')

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true)
        const url = userId ? `/api/profile?userId=${userId}` : '/api/profile'
        const response = await fetch(url)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load profile')
        }

        setProfile(data.profile)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated || userId) {
      fetchProfile()
    }
  }, [userId, isAuthenticated])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error || 'Profile not found'}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        )}
      </div>
    )
  }

  const league = getLeagueByTrophies(profile.trophies)
  const display = LEAGUE_DISPLAY[league.id as keyof typeof LEAGUE_DISPLAY]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden max-w-md mx-auto">
      {/* Header with league gradient */}
      <LeagueBadgeCard
        trophies={profile.trophies}
        name={profile.name}
        wins={profile.wins}
        losses={profile.losses}
      />

      {/* Trophy Progress */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <TrophyProgress trophies={profile.trophies} size="md" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'stats'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Stats
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Match History
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'stats' ? (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Games" value={profile.gamesPlayed} />
              <StatCard label="Wins" value={profile.wins} color="text-green-500" />
              <StatCard label="Losses" value={profile.losses} color="text-red-500" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Win Rate" value={`${profile.winRate}%`} />
              <StatCard
                label="Streak"
                value={profile.winStreak}
                suffix={profile.winStreak > 0 ? ' W' : ''}
                color={profile.winStreak >= 3 ? 'text-orange-500' : undefined}
              />
              <StatCard label="ELO" value={profile.elo} />
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <InfoRow label="Highest Trophies" value={profile.highestTrophies.toLocaleString()} />
              {profile.grade && <InfoRow label="Grade" value={`Grade ${profile.grade}`} />}
              {profile.school && <InfoRow label="School" value={profile.school} />}
              <InfoRow
                label="Playing Since"
                value={new Date(profile.memberSince).toLocaleDateString()}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.recentMatches.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No matches played yet
              </p>
            ) : (
              profile.recentMatches.map((match) => (
                <MatchHistoryItem key={match.id} match={match} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Close button */}
      {onClose && (
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  suffix = '',
  color,
}: {
  label: string
  value: string | number
  suffix?: string
  color?: string
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
      <div className={`text-xl font-bold ${color || 'text-gray-900 dark:text-white'}`}>
        {value}{suffix}
      </div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}

function MatchHistoryItem({
  match,
}: {
  match: ProfileData['recentMatches'][0]
}) {
  const opponentLeague = getLeagueByTrophies(match.opponentTrophies)
  const display = LEAGUE_DISPLAY[opponentLeague.id as keyof typeof LEAGUE_DISPLAY]

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-xl
        ${match.won ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}
      `}
    >
      {/* Result indicator */}
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
          ${match.won ? 'bg-green-500' : 'bg-red-500'}
        `}
      >
        {match.won ? 'W' : 'L'}
      </div>

      {/* Opponent info */}
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <span className="text-sm">{display?.emoji}</span>
          <span className="font-medium text-sm">{match.opponentName}</span>
        </div>
        <div className="text-xs text-gray-500">
          {new Date(match.date).toLocaleDateString()}
        </div>
      </div>

      {/* Score */}
      <div className="text-right">
        <div className="font-bold">
          {match.myGoals} - {match.opponentGoals}
        </div>
        <div className="text-xs text-gray-500">
          {match.opponentTrophies} trophies
        </div>
      </div>
    </div>
  )
}

// Mini profile card for leaderboards and mentions
export function PlayerProfileMini({
  name,
  trophies,
  wins,
  losses,
  onClick,
}: {
  name: string
  trophies: number
  wins: number
  losses: number
  onClick?: () => void
}) {
  const league = getLeagueByTrophies(trophies)
  const display = LEAGUE_DISPLAY[league.id as keyof typeof LEAGUE_DISPLAY]
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors w-full text-left"
    >
      <span className="text-2xl">{display?.emoji}</span>
      <div className="flex-1">
        <div className="font-medium">{name}</div>
        <div className="text-xs text-gray-500">
          {trophies} trophies | {winRate}% win rate
        </div>
      </div>
    </button>
  )
}
