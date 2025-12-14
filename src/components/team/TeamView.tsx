'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { SOCCER_POSITIONS, HOCKEY_POSITIONS, SUBJECT_META, ELIXIR_CONFIG, LEAGUE_TIERS } from '@/constants/game'
import type { Team, PlayerCard as PlayerCardType } from '@/types/team'
import { useLanguage } from '@/contexts/LanguageContext'

interface TeamViewProps {
  team: Team
  onCardClick?: (card: PlayerCardType) => void
  compact?: boolean
}

// Rarity colors
const RARITY_COLORS: Record<string, string> = {
  bronze: 'text-orange-400 bg-orange-900/30',
  silver: 'text-gray-300 bg-gray-700/30',
  gold: 'text-yellow-400 bg-yellow-900/30',
  diamond: 'text-cyan-400 bg-cyan-900/30',
  champion: 'text-purple-400 bg-purple-900/30'
}

export function TeamView({ team, onCardClick, compact = false }: TeamViewProps) {
  const { t } = useLanguage()
  const positions = team.arena === 'soccer' ? SOCCER_POSITIONS : HOCKEY_POSITIONS
  const leagueTier = LEAGUE_TIERS[team.leagueTier]

  // Calculate team stats
  const stats = useMemo(() => {
    if (team.cards.length === 0) return { overall: 0, avgLevel: 0, totalXP: 0 }
    const overall = Math.round(team.cards.reduce((acc, card) => acc + card.overall, 0) / team.cards.length)
    const avgLevel = Math.round(team.cards.reduce((acc, card) => acc + card.level, 0) / team.cards.length * 10) / 10
    const totalXP = team.cards.reduce((acc, card) => acc + card.xp, 0)
    return { overall, avgLevel, totalXP }
  }, [team.cards])

  // Sort cards by position for table
  const sortedCards = useMemo(() => {
    const positionOrder = ['GK', 'LB', 'CB1', 'CB2', 'RB', 'CM1', 'CAM', 'CM2', 'LW', 'ST', 'RW', 'G', 'LD', 'RD', 'C']
    return [...team.cards].sort((a, b) => {
      const aIdx = positionOrder.indexOf(a.position)
      const bIdx = positionOrder.indexOf(b.position)
      return aIdx - bIdx
    })
  }, [team.cards])

  return (
    <div className="w-full">
      {/* Team Stats Summary - Horizontal Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
        {/* Team Overall */}
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 rounded-xl p-3 border border-yellow-500/30">
          <div className="text-yellow-400 text-xs font-medium mb-1">{t.team.teamRating}</div>
          <div className="text-3xl font-black text-yellow-400">{stats.overall}</div>
        </div>

        {/* League */}
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl p-3 border border-blue-500/30">
          <div className="text-blue-400 text-xs font-medium mb-1">{t.team.leagueTable}</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{leagueTier.icon}</span>
            <span className="text-lg font-bold text-white">{t.team.leagueTiers[team.leagueTier.toLowerCase() as keyof typeof t.team.leagueTiers] || leagueTier.name}</span>
          </div>
          <div className="text-blue-400/70 text-xs">{team.leaguePoints} {t.team.pts}</div>
        </div>

        {/* Elixir */}
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-3 border border-purple-500/30">
          <div className="text-purple-400 text-xs font-medium mb-1">{t.team.elixirNeeded.split(' ')[0]}</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-2xl font-black text-purple-400">{team.elixir}</span>
            <span className="text-purple-400/50 text-sm">/ {ELIXIR_CONFIG.MAX_STORAGE}</span>
          </div>
          <div className="w-full bg-purple-900/30 rounded-full h-1.5 mt-1">
            <div
              className="bg-purple-500 h-full rounded-full transition-all"
              style={{ width: `${(team.elixir / ELIXIR_CONFIG.MAX_STORAGE) * 100}%` }}
            />
          </div>
        </div>

        {/* Avg Level */}
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-xl p-3 border border-green-500/30">
          <div className="text-green-400 text-xs font-medium mb-1">{t.team.avgLevel}</div>
          <div className="text-3xl font-black text-green-400">{stats.avgLevel}</div>
          <div className="text-green-400/70 text-xs">{team.cards.length} {t.team.playersCount}</div>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="bg-slate-700/50 px-4 py-2 border-b border-slate-600">
          <h3 className="font-bold text-white text-sm">{t.team.squad} ({team.formation})</h3>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-1 px-4 py-2 bg-slate-700/30 text-xs font-medium text-slate-400 border-b border-slate-700">
          <div className="col-span-1">{t.team.posAbbrev}</div>
          <div className="col-span-4">{t.team.subjectCol}</div>
          <div className="col-span-2 text-center">{t.team.lvlAbbrev}</div>
          <div className="col-span-2 text-center">{t.team.ovrAbbrev}</div>
          <div className="col-span-3 text-center">{t.team.rarityCol}</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-700/50">
          {sortedCards.map((card, index) => {
            const posData = positions[card.position as keyof typeof positions]
            const subjectMeta = SUBJECT_META[card.subject as keyof typeof SUBJECT_META]

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onCardClick?.(card)}
                className="grid grid-cols-12 gap-1 px-4 py-2.5 hover:bg-slate-700/30 cursor-pointer transition-colors items-center"
              >
                {/* Position */}
                <div className="col-span-1">
                  <span className="text-xs font-bold text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">
                    {card.position.replace(/\d/g, '')}
                  </span>
                </div>

                {/* Subject */}
                <div className="col-span-4 flex items-center gap-2">
                  <span className="text-lg">{subjectMeta?.icon || '📚'}</span>
                  <span className="text-white font-medium text-sm truncate">
                    {subjectMeta?.name || card.subject}
                  </span>
                </div>

                {/* Level */}
                <div className="col-span-2 text-center">
                  <span className="text-white font-bold">{card.level}</span>
                  <span className="text-slate-500 text-xs">/14</span>
                </div>

                {/* Overall */}
                <div className="col-span-2 text-center">
                  <span className={`font-black text-lg ${
                    card.overall >= 80 ? 'text-purple-400' :
                    card.overall >= 60 ? 'text-yellow-400' :
                    card.overall >= 40 ? 'text-gray-300' :
                    'text-orange-400'
                  }`}>
                    {card.overall}
                  </span>
                </div>

                {/* Rarity */}
                <div className="col-span-3 text-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${RARITY_COLORS[card.rarity]}`}>
                    {t.team.cardRarity[card.rarity as keyof typeof t.team.cardRarity] || card.rarity}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Quick Legend */}
      <div className="mt-3 flex flex-wrap gap-2 justify-center text-xs">
        <span className="text-slate-500">{t.team.ratingsLabel}</span>
        <span className="text-orange-400">0-39 {t.team.cardRarity.bronze}</span>
        <span className="text-slate-400">|</span>
        <span className="text-gray-300">40-59 {t.team.cardRarity.silver}</span>
        <span className="text-slate-400">|</span>
        <span className="text-yellow-400">60-79 {t.team.cardRarity.gold}</span>
        <span className="text-slate-400">|</span>
        <span className="text-cyan-400">80-89 {t.team.cardRarity.diamond}</span>
        <span className="text-slate-400">|</span>
        <span className="text-purple-400">90+ {t.team.cardRarity.champion}</span>
      </div>

      {/* Tip */}
      <div className="mt-3 text-center text-xs text-slate-500">
        {t.team.tapToTrain} ({ELIXIR_CONFIG.TRAIN_COST} ⚡ = +{ELIXIR_CONFIG.TRAIN_XP_GAIN} XP)
      </div>
    </div>
  )
}

export default TeamView
