'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ELIXIR_CONFIG, SUBJECT_META, CARD_RARITY } from '@/constants/game'
import { PlayerCard } from './PlayerCard'
import { ElixirBadge } from '../elixir/ElixirBar'
import type { PlayerCard as PlayerCardType } from '@/types/team'
import { getLevelFromXP, getXPToNextLevel, LEVEL_XP_REQUIREMENTS } from '@/types/team'
import { useLanguage } from '@/contexts/LanguageContext'

interface TrainingModalProps {
  isOpen: boolean
  onClose: () => void
  card: PlayerCardType | null
  currentElixir: number
  onTrain: (cardId: string) => Promise<boolean>
  onQuickLevel?: (cardId: string) => Promise<boolean>
}

export function TrainingModal({
  isOpen,
  onClose,
  card,
  currentElixir,
  onTrain,
  onQuickLevel
}: TrainingModalProps) {
  const { t } = useLanguage()
  const [isTraining, setIsTraining] = useState(false)
  const [isQuickLeveling, setIsQuickLeveling] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [trainedXP, setTrainedXP] = useState(0)

  if (!card) return null

  const canAfford = currentElixir >= ELIXIR_CONFIG.TRAIN_COST
  const canAffordQuickLevel = currentElixir >= ELIXIR_CONFIG.QUICK_LEVEL_COST
  const subjectMeta = SUBJECT_META[card.subject as keyof typeof SUBJECT_META]
  const rarityInfo = CARD_RARITY[card.rarity]
  const xpToNext = getXPToNextLevel(card.xp)
  const currentLevelXP = LEVEL_XP_REQUIREMENTS[card.level] || 0
  const nextLevelXP = LEVEL_XP_REQUIREMENTS[card.level + 1] || card.xp
  const progressInLevel = card.xp - currentLevelXP
  const levelRange = nextLevelXP - currentLevelXP
  const levelProgress = levelRange > 0 ? (progressInLevel / levelRange) * 100 : 100

  const handleTrain = async () => {
    if (!canAfford || isTraining) return

    setIsTraining(true)
    try {
      const success = await onTrain(card.id)
      if (success) {
        setTrainedXP(ELIXIR_CONFIG.TRAIN_XP_GAIN)
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          setTrainedXP(0)
        }, 2000)
      }
    } finally {
      setIsTraining(false)
    }
  }

  const handleQuickLevel = async () => {
    if (!canAffordQuickLevel || isQuickLeveling || !onQuickLevel) return

    setIsQuickLeveling(true)
    try {
      const success = await onQuickLevel(card.id)
      if (success) {
        setTrainedXP(ELIXIR_CONFIG.QUICK_LEVEL_XP)
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          setTrainedXP(0)
        }, 2000)
      }
    } finally {
      setIsQuickLeveling(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[400px] bg-gray-900 rounded-2xl z-[60] overflow-hidden shadow-2xl border border-gray-700"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{t.team.trainPlayer}</h2>
                <button
                  onClick={onClose}
                  className="text-white/70 hover:text-white p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <ElixirBadge current={currentElixir} />
                <span className="text-white/70 text-sm">{t.team.available}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Card display */}
              <div className="flex items-center gap-4 mb-6">
                <PlayerCard card={card} size="lg" />
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className="text-2xl">{subjectMeta?.icon}</span>
                    {subjectMeta?.name || card.subject}
                  </h3>
                  <p className="text-gray-400 text-sm">{card.position}</p>

                  {/* Level and XP */}
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Level {card.level}</span>
                      <span className="text-yellow-400">{card.xp} / {nextLevelXP} XP</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${levelProgress}%` }}
                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400"
                      />
                    </div>
                    {card.level < 14 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {xpToNext} XP to level {card.level + 1}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <StatItem label={t.team.accuracy} value={card.accuracy} color="green" />
                <StatItem label={t.team.speed} value={card.speed} color="blue" />
                <StatItem label={t.team.consistency} value={card.consistency} color="yellow" />
                <StatItem label={t.team.difficulty} value={card.difficultyMastery} color="purple" />
              </div>

              {/* Training options */}
              <div className="space-y-3 mb-6">
                {/* Standard Training */}
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">{t.team.standardTraining}</p>
                      <p className="text-gray-400 text-sm">{t.team.standardTrainingDesc}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-400 font-bold">-{ELIXIR_CONFIG.TRAIN_COST} ⚡</div>
                      <div className="text-green-400 text-sm">+{ELIXIR_CONFIG.TRAIN_XP_GAIN} XP</div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={canAfford ? { scale: 1.02 } : {}}
                    whileTap={canAfford ? { scale: 0.98 } : {}}
                    onClick={handleTrain}
                    disabled={!canAfford || isTraining}
                    className={`
                      w-full py-3 rounded-lg font-bold
                      flex items-center justify-center gap-2
                      transition-all duration-200
                      ${canAfford && !isTraining
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {isTraining ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        {t.team.training}
                      </>
                    ) : (
                      <>
                        <span>⚡</span>
                        {canAfford ? t.team.train : t.team.needMore.replace('{amount}', String(ELIXIR_CONFIG.TRAIN_COST - currentElixir))}
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Quick Level - only show if handler provided */}
                {onQuickLevel && (
                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-yellow-400 font-medium flex items-center gap-2">
                          {t.team.quickLevel}
                        </p>
                        <p className="text-gray-400 text-sm">{t.team.quickLevelDesc}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold">-{ELIXIR_CONFIG.QUICK_LEVEL_COST} ⚡</div>
                        <div className="text-green-400 text-sm">+{ELIXIR_CONFIG.QUICK_LEVEL_XP} XP</div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={canAffordQuickLevel ? { scale: 1.02 } : {}}
                      whileTap={canAffordQuickLevel ? { scale: 0.98 } : {}}
                      onClick={handleQuickLevel}
                      disabled={!canAffordQuickLevel || isQuickLeveling}
                      className={`
                        w-full py-3 rounded-lg font-bold
                        flex items-center justify-center gap-2
                        transition-all duration-200
                        ${canAffordQuickLevel && !isQuickLeveling
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black shadow-lg shadow-yellow-500/30'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      {isQuickLeveling ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                          />
                          {t.team.leveling}
                        </>
                      ) : (
                        <>
                          <span>⚡</span>
                          {canAffordQuickLevel ? t.team.quickLevel : t.team.needMore.replace('{amount}', String(ELIXIR_CONFIG.QUICK_LEVEL_COST - currentElixir))}
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Success overlay */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 0.5 }}
                      className="text-6xl mb-4"
                    >
                      ✨
                    </motion.div>
                    <p className="text-white font-bold text-2xl mb-2">{t.team.trainingComplete}</p>
                    <p className="text-green-400 text-xl">+{trainedXP} XP</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function StatItem({
  label,
  value,
  color
}: {
  label: string
  value: number
  color: 'green' | 'blue' | 'yellow' | 'purple'
}) {
  const colors = {
    green: 'from-green-500 to-green-400',
    blue: 'from-blue-500 to-blue-400',
    yellow: 'from-yellow-500 to-yellow-400',
    purple: 'from-purple-500 to-purple-400'
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-white font-bold">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full bg-gradient-to-r ${colors[color]}`}
        />
      </div>
    </div>
  )
}

export default TrainingModal
