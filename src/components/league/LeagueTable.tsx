'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LEAGUE_TIERS } from '@/constants/game'
import type { LeagueStanding, LeagueTier } from '@/types/team'
import { useLanguage } from '@/contexts/LanguageContext'

interface LeagueTableProps {
  standings?: LeagueStanding[]
  currentUserId?: string
  leagueType?: 'school' | 'global'
  userTier?: LeagueTier
  userPoints?: number
  compact?: boolean
}

// Mock data for demo - will be replaced with API data
const MOCK_STANDINGS: LeagueStanding[] = [
  { rank: 1, playerId: '1', playerName: 'MaxPower', teamName: 'FC Bayern Kids', played: 15, won: 12, drawn: 2, lost: 1, goalsFor: 45, goalsAgainst: 12, goalDifference: 33, points: 38, accuracy: 0.89, avgResponseTime: 2100 },
  { rank: 2, playerId: '2', playerName: 'SwissQueen', teamName: 'Zurich Stars', played: 14, won: 10, drawn: 3, lost: 1, goalsFor: 38, goalsAgainst: 15, goalDifference: 23, points: 33, accuracy: 0.85, avgResponseTime: 2300 },
  { rank: 3, playerId: '3', playerName: 'MathWizard', teamName: 'Basel Brains', played: 15, won: 9, drawn: 4, lost: 2, goalsFor: 35, goalsAgainst: 18, goalDifference: 17, points: 31, accuracy: 0.82, avgResponseTime: 2500 },
  { rank: 4, playerId: 'current', playerName: 'You', teamName: 'My Team', played: 12, won: 7, drawn: 3, lost: 2, goalsFor: 28, goalsAgainst: 14, goalDifference: 14, points: 24, accuracy: 0.78, avgResponseTime: 2800 },
  { rank: 5, playerId: '5', playerName: 'GeoKing', teamName: 'Geneva Geeks', played: 13, won: 6, drawn: 4, lost: 3, goalsFor: 25, goalsAgainst: 18, goalDifference: 7, points: 22, accuracy: 0.75, avgResponseTime: 3000 },
  { rank: 6, playerId: '6', playerName: 'ScienceGirl', teamName: 'Bern Bombers', played: 14, won: 5, drawn: 5, lost: 4, goalsFor: 22, goalsAgainst: 20, goalDifference: 2, points: 20, accuracy: 0.72, avgResponseTime: 3100 },
  { rank: 7, playerId: '7', playerName: 'HistoryBuff', teamName: 'Lausanne Legends', played: 12, won: 4, drawn: 4, lost: 4, goalsFor: 18, goalsAgainst: 18, goalDifference: 0, points: 16, accuracy: 0.70, avgResponseTime: 3200 },
  { rank: 8, playerId: '8', playerName: 'ArtMaster', teamName: 'Luzern Lions', played: 13, won: 3, drawn: 3, lost: 7, goalsFor: 15, goalsAgainst: 25, goalDifference: -10, points: 12, accuracy: 0.65, avgResponseTime: 3500 },
]

export function LeagueTable({
  standings = MOCK_STANDINGS,
  currentUserId = 'current',
  leagueType = 'school',
  userTier = 'GOLD',
  userPoints = 1250,
  compact = false
}: LeagueTableProps) {
  const { t } = useLanguage()
  const [selectedTab, setSelectedTab] = useState<'school' | 'global'>(leagueType)

  const tierInfo = LEAGUE_TIERS[userTier]

  // Get promotion/relegation zones
  const promotionZone = 3  // Top 3 get promoted
  const relegationZone = standings.length - 2  // Bottom 3 get relegated

  return (
    <div className="w-full">
      {/* League Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{tierInfo.icon}</span>
            <div>
              <h2 className="text-white font-bold text-lg">{t.team.leagueTiers[userTier.toLowerCase() as keyof typeof t.team.leagueTiers] || tierInfo.name} {t.team.leagueTable}</h2>
              <p className="text-white/70 text-sm">{userPoints} {t.team.pts}</p>
            </div>
          </div>

          {/* League Type Tabs */}
          <div className="flex gap-1 bg-white/20 rounded-lg p-1">
            <button
              onClick={() => setSelectedTab('school')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedTab === 'school'
                  ? 'bg-white text-indigo-600'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {t.team.school}
            </button>
            <button
              onClick={() => setSelectedTab('global')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedTab === 'global'
                  ? 'bg-white text-indigo-600'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {t.team.global}
            </button>
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-slate-800/50 rounded-b-xl border border-slate-700 overflow-hidden">
        {/* Table Header */}
        <div className={`grid ${compact ? 'grid-cols-8' : 'grid-cols-10'} gap-1 px-4 py-2 bg-slate-700/50 text-xs font-medium text-slate-400 border-b border-slate-700`}>
          <div className="col-span-1 text-center">#</div>
          <div className={compact ? 'col-span-3' : 'col-span-4'}>{t.team.teamCol}</div>
          <div className="col-span-1 text-center">{t.team.pAbbrev}</div>
          <div className="col-span-1 text-center">{t.team.wAbbrev}</div>
          {!compact && <div className="col-span-1 text-center">{t.team.dAbbrev}</div>}
          {!compact && <div className="col-span-1 text-center">{t.team.lAbbrev}</div>}
          <div className="col-span-1 text-center">{t.team.gdAbbrev}</div>
          <div className="col-span-1 text-center font-bold">{t.team.ptsAbbrev}</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-700/50 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {standings.map((standing, index) => {
              const isCurrentUser = standing.playerId === currentUserId
              const isPromotion = standing.rank <= promotionZone
              const isRelegation = standing.rank >= relegationZone

              return (
                <motion.div
                  key={standing.playerId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`grid ${compact ? 'grid-cols-8' : 'grid-cols-10'} gap-1 px-4 py-2.5 items-center transition-colors ${
                    isCurrentUser
                      ? 'bg-indigo-600/20 border-l-4 border-indigo-500'
                      : 'hover:bg-slate-700/30'
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      isPromotion
                        ? 'bg-green-500/20 text-green-400'
                        : isRelegation
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-slate-700 text-slate-300'
                    }`}>
                      {standing.rank}
                    </span>
                  </div>

                  {/* Team */}
                  <div className={compact ? 'col-span-3' : 'col-span-4'}>
                    <div className="flex flex-col">
                      <span className={`font-medium text-sm truncate ${
                        isCurrentUser ? 'text-indigo-300' : 'text-white'
                      }`}>
                        {standing.teamName}
                        {isCurrentUser && <span className="ml-1 text-indigo-400">({t.team.youLabel})</span>}
                      </span>
                      <span className="text-xs text-slate-500 truncate">{standing.playerName}</span>
                    </div>
                  </div>

                  {/* Played */}
                  <div className="col-span-1 text-center text-slate-400 text-sm">
                    {standing.played}
                  </div>

                  {/* Won */}
                  <div className="col-span-1 text-center text-green-400 text-sm font-medium">
                    {standing.won}
                  </div>

                  {/* Draw */}
                  {!compact && (
                    <div className="col-span-1 text-center text-slate-400 text-sm">
                      {standing.drawn}
                    </div>
                  )}

                  {/* Lost */}
                  {!compact && (
                    <div className="col-span-1 text-center text-red-400 text-sm">
                      {standing.lost}
                    </div>
                  )}

                  {/* Goal Difference */}
                  <div className={`col-span-1 text-center text-sm font-medium ${
                    standing.goalDifference > 0
                      ? 'text-green-400'
                      : standing.goalDifference < 0
                        ? 'text-red-400'
                        : 'text-slate-400'
                  }`}>
                    {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                  </div>

                  {/* Points */}
                  <div className="col-span-1 text-center">
                    <span className={`font-black text-lg ${
                      isCurrentUser ? 'text-indigo-300' : 'text-white'
                    }`}>
                      {standing.points}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500/40"></span>
          <span className="text-slate-400">{t.team.promotionZone}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/40"></span>
          <span className="text-slate-400">{t.team.relegationZone}</span>
        </div>
      </div>

      {/* Next Tier Progress */}
      <div className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm">{t.team.nextTier} {t.team.leagueTiers[getNextTier(userTier).toLowerCase() as keyof typeof t.team.leagueTiers] || LEAGUE_TIERS[getNextTier(userTier)]?.name || t.team.maxTier}</span>
          <span className="text-white text-sm font-medium">
            {getPointsToNextTier(userTier, userPoints)} {t.team.ptsNeeded}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all"
            style={{ width: `${getTierProgress(userTier, userPoints)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getNextTier(currentTier: LeagueTier): LeagueTier {
  const tiers: LeagueTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'CHAMPION', 'LEGEND']
  const currentIndex = tiers.indexOf(currentTier)
  return tiers[Math.min(currentIndex + 1, tiers.length - 1)]
}

function getPointsToNextTier(currentTier: LeagueTier, currentPoints: number): number {
  const thresholds: Record<LeagueTier, number> = {
    BRONZE: 0,
    SILVER: 501,
    GOLD: 1001,
    PLATINUM: 1501,
    DIAMOND: 2001,
    CHAMPION: 2501,
    LEGEND: 3001
  }
  const nextTier = getNextTier(currentTier)
  return Math.max(0, thresholds[nextTier] - currentPoints)
}

function getTierProgress(currentTier: LeagueTier, currentPoints: number): number {
  const thresholds: Record<LeagueTier, number> = {
    BRONZE: 0,
    SILVER: 501,
    GOLD: 1001,
    PLATINUM: 1501,
    DIAMOND: 2001,
    CHAMPION: 2501,
    LEGEND: 3001
  }
  const currentThreshold = thresholds[currentTier]
  const nextThreshold = thresholds[getNextTier(currentTier)]
  const range = nextThreshold - currentThreshold
  const progress = currentPoints - currentThreshold
  return Math.min(100, Math.max(0, (progress / range) * 100))
}

export default LeagueTable
