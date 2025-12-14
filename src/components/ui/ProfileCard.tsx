'use client'

import { motion } from 'framer-motion'
import { PlayerProfile } from '@/contexts/PlayerProfileContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface ProfileCardProps {
  profile: PlayerProfile
  grade: number
  compact?: boolean
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ProfileCard({ profile, grade, compact = false }: ProfileCardProps) {
  const { t } = useLanguage()

  // Get rank tier based on ELO with translations
  const getRankTier = (elo: number): { name: string; emoji: string; color: string } => {
    if (elo >= 2000) return { name: t.profile.ranks.champion, emoji: '👑', color: 'from-yellow-400 to-amber-600' }
    if (elo >= 1800) return { name: t.profile.ranks.diamond, emoji: '💎', color: 'from-cyan-400 to-blue-600' }
    if (elo >= 1500) return { name: t.profile.ranks.gold, emoji: '🥇', color: 'from-yellow-300 to-yellow-600' }
    if (elo >= 1200) return { name: t.profile.ranks.silver, emoji: '🥈', color: 'from-gray-300 to-gray-500' }
    if (elo >= 900) return { name: t.profile.ranks.bronze, emoji: '🥉', color: 'from-orange-400 to-orange-700' }
    return { name: t.profile.ranks.rookie, emoji: '🌱', color: 'from-green-400 to-green-600' }
  }

  const rank = getRankTier(profile.elo)
  const initials = getInitials(profile.name)

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rank.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
          {initials}
        </div>

        {/* Info */}
        <div className="text-white">
          <div className="font-semibold text-sm">{profile.name}</div>
          <div className="text-xs opacity-80 flex items-center gap-1">
            <span>{rank.emoji}</span>
            <span>{profile.elo} ELO</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl w-full"
    >
      {/* Header with Avatar */}
      <div className="flex items-center gap-4 mb-4">
        {/* Avatar */}
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${rank.color} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
          {initials}
        </div>

        {/* Name and Rank */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">{profile.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-lg">{rank.emoji}</span>
            <span className={`text-sm font-semibold bg-gradient-to-r ${rank.color} bg-clip-text text-transparent`}>
              {rank.name}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">{t.game.grade} {grade}</span>
          </div>
        </div>
      </div>

      {/* ELO Display */}
      <div className="bg-gray-100 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-sm font-medium">{t.profile.rating}</span>
          <span className="text-2xl font-bold text-gray-800">{profile.elo}</span>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${rank.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (profile.elo / 25))}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{profile.totalWins}</div>
          <div className="text-xs text-blue-600/80">{t.profile.wins}</div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{profile.accuracy.toFixed(0)}%</div>
          <div className="text-xs text-green-600/80">{t.game.accuracy}</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">{profile.bestStreak}</div>
          <div className="text-xs text-orange-600/80">{t.profile.bestStreak}</div>
        </div>
      </div>

      {/* Games Played */}
      <div className="mt-4 text-center text-sm text-gray-500">
        {profile.totalGamesPlayed} {t.profile.gamesPlayed}
      </div>
    </motion.div>
  )
}
