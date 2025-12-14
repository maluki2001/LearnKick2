'use client'

import { motion } from 'framer-motion'
import { SUBJECT_META, CARD_RARITY } from '@/constants/game'
import type { PlayerCard as PlayerCardType, CardRarity } from '@/types/team'
import { useLanguage } from '@/contexts/LanguageContext'

interface PlayerCardProps {
  card: PlayerCardType
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  showStats?: boolean
  isSelected?: boolean
}

const sizeClasses = {
  sm: 'w-16 h-24',
  md: 'w-24 h-36',
  lg: 'w-32 h-48'
}

const rarityGradients: Record<CardRarity, string> = {
  BRONZE: 'from-amber-700 via-amber-600 to-amber-800',
  SILVER: 'from-gray-400 via-gray-300 to-gray-500',
  GOLD: 'from-yellow-500 via-yellow-400 to-yellow-600',
  DIAMOND: 'from-cyan-400 via-blue-400 to-cyan-500',
  CHAMPION: 'from-purple-500 via-pink-500 to-red-500'
}

const rarityBorders: Record<CardRarity, string> = {
  BRONZE: 'border-amber-600',
  SILVER: 'border-gray-400',
  GOLD: 'border-yellow-500',
  DIAMOND: 'border-cyan-400',
  CHAMPION: 'border-purple-500'
}

const rarityShadows: Record<CardRarity, string> = {
  BRONZE: 'shadow-amber-500/30',
  SILVER: 'shadow-gray-400/30',
  GOLD: 'shadow-yellow-500/50',
  DIAMOND: 'shadow-cyan-400/50',
  CHAMPION: 'shadow-purple-500/50'
}

export function PlayerCard({
  card,
  size = 'md',
  onClick,
  showStats = false,
  isSelected = false
}: PlayerCardProps) {
  const { t } = useLanguage()
  const subjectMeta = SUBJECT_META[card.subject as keyof typeof SUBJECT_META]
  const rarityInfo = CARD_RARITY[card.rarity]

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        relative cursor-pointer select-none
        rounded-xl overflow-hidden
        border-2 ${rarityBorders[card.rarity]}
        shadow-lg ${rarityShadows[card.rarity]}
        ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : ''}
        transition-shadow duration-200
      `}
    >
      {/* Background gradient based on rarity */}
      <div className={`absolute inset-0 bg-gradient-to-br ${rarityGradients[card.rarity]}`} />

      {/* Card content */}
      <div className="relative h-full flex flex-col p-1.5">
        {/* Overall rating */}
        <div className="absolute top-1 left-1 bg-black/60 rounded px-1.5 py-0.5">
          <span className="text-white font-bold text-xs">{card.overall}</span>
        </div>

        {/* Level */}
        <div className="absolute top-1 right-1 bg-black/60 rounded px-1.5 py-0.5">
          <span className="text-yellow-400 font-bold text-xs">{t.team.lvPrefix}{card.level}</span>
        </div>

        {/* Subject icon */}
        <div className="flex-1 flex items-center justify-center">
          <span className={`${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-3xl' : 'text-2xl'}`}>
            {subjectMeta?.icon || '?'}
          </span>
        </div>

        {/* Position & Subject name */}
        <div className="mt-auto">
          <div className="bg-black/60 rounded px-1.5 py-1 text-center">
            <div className="text-white font-bold text-xs">{card.position}</div>
            <div className="text-gray-300 text-xs truncate capitalize">
              {card.subject.replace('-', ' ')}
            </div>
          </div>
        </div>

        {/* Rarity shine effect for higher rarities */}
        {(card.rarity === 'GOLD' || card.rarity === 'DIAMOND' || card.rarity === 'CHAMPION') && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          />
        )}
      </div>

      {/* Stats overlay (when showStats is true) */}
      {showStats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/80 flex flex-col justify-center p-2 text-xs"
        >
          <div className="space-y-1">
            <StatBar label={t.team.accAbbrev} value={card.accuracy} color="bg-green-500" />
            <StatBar label={t.team.spdAbbrev} value={card.speed} color="bg-blue-500" />
            <StatBar label={t.team.conAbbrev} value={card.consistency} color="bg-yellow-500" />
            <StatBar label={t.team.difAbbrev} value={card.difficultyMastery} color="bg-purple-500" />
          </div>
          <div className="mt-2 text-center">
            <div className="text-gray-400 text-xs">{t.team.xpLabel} {card.xp}/{card.xpToNextLevel}</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-400 w-8">{label}</span>
      <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full ${color}`}
        />
      </div>
      <span className="text-white w-6 text-right">{value}</span>
    </div>
  )
}

// Preview card for goalkeeper selection
interface GoalkeeperOptionProps {
  subject: string
  isSelected: boolean
  onClick: () => void
}

export function GoalkeeperOption({ subject, isSelected, onClick }: GoalkeeperOptionProps) {
  const { t } = useLanguage()
  const subjectMeta = SUBJECT_META[subject as keyof typeof SUBJECT_META]

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        w-20 h-28 rounded-xl overflow-hidden
        border-2 transition-all
        ${isSelected
          ? 'border-yellow-500 bg-yellow-500/20 shadow-lg shadow-yellow-500/30'
          : 'border-gray-600 bg-gray-800 hover:border-gray-500'
        }
      `}
    >
      <div className="h-full flex flex-col items-center justify-center p-2">
        <span className="text-3xl mb-2">{subjectMeta?.icon || '?'}</span>
        <span className="text-white text-xs font-medium text-center capitalize">
          {subjectMeta?.name || subject}
        </span>
        {isSelected && (
          <span className="text-yellow-400 text-xs mt-1">{t.team.gkLabel}</span>
        )}
      </div>
    </motion.button>
  )
}

export default PlayerCard
