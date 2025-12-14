'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SUBJECT_META, LEAGUE_TIERS } from '@/constants/game'
import type { SubjectValue, LeagueTier } from '@/types/team'
import { useLanguage } from '@/contexts/LanguageContext'

interface MatchResultsProps {
  isOpen: boolean
  onClose: () => void
  matchResult: 'win' | 'draw' | 'loss'
  goalsFor: number
  goalsAgainst: number
  elixirEarned: number
  xpDistributed: Record<SubjectValue, number>
  cardsLeveledUp: SubjectValue[]
  pointsChange: number
  newLeaguePoints: number
  newLeagueTier: LeagueTier
  maxStreak: number
  questionsAnswered: number
  correctAnswers: number
}

export function MatchResults({
  isOpen,
  onClose,
  matchResult,
  goalsFor,
  goalsAgainst,
  elixirEarned,
  xpDistributed,
  cardsLeveledUp,
  pointsChange,
  newLeaguePoints,
  newLeagueTier,
  maxStreak,
  questionsAnswered,
  correctAnswers
}: MatchResultsProps) {
  const { t } = useLanguage()
  const [showElixir, setShowElixir] = useState(false)
  const [showXP, setShowXP] = useState(false)
  const [showPoints, setShowPoints] = useState(false)
  const [displayedElixir, setDisplayedElixir] = useState(0)

  // Animate the results appearing
  useEffect(() => {
    if (isOpen) {
      const timers = [
        setTimeout(() => setShowElixir(true), 500),
        setTimeout(() => setShowXP(true), 1000),
        setTimeout(() => setShowPoints(true), 1500)
      ]
      return () => timers.forEach(clearTimeout)
    } else {
      setShowElixir(false)
      setShowXP(false)
      setShowPoints(false)
      setDisplayedElixir(0)
    }
  }, [isOpen])

  // Animate elixir counter
  useEffect(() => {
    if (showElixir && displayedElixir < elixirEarned) {
      const timer = setTimeout(() => {
        setDisplayedElixir(prev => Math.min(prev + Math.ceil(elixirEarned / 20), elixirEarned))
      }, 30)
      return () => clearTimeout(timer)
    }
  }, [showElixir, displayedElixir, elixirEarned])

  const resultConfig = {
    win: {
      bg: 'from-green-600/90 to-emerald-700/90',
      text: t.matchResults.victory,
      textColor: 'text-green-400',
      icon: '🏆'
    },
    draw: {
      bg: 'from-yellow-600/90 to-amber-700/90',
      text: t.matchResults.draw,
      textColor: 'text-yellow-400',
      icon: '🤝'
    },
    loss: {
      bg: 'from-red-600/90 to-rose-700/90',
      text: t.matchResults.defeat,
      textColor: 'text-red-400',
      icon: '😤'
    }
  }

  const config = resultConfig[matchResult]
  const tierInfo = LEAGUE_TIERS[newLeagueTier]
  const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          onClick={e => e.stopPropagation()}
          className={`w-full max-w-md bg-gradient-to-b ${config.bg} rounded-2xl shadow-2xl overflow-hidden`}
        >
          {/* Result Header */}
          <div className="text-center py-6 px-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-6xl mb-2"
            >
              {config.icon}
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-4xl font-black ${config.textColor}`}
            >
              {config.text}
            </motion.h1>
          </div>

          {/* Score */}
          <div className="bg-black/30 py-4 px-6">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-5xl font-black text-white">{goalsFor}</div>
                <div className="text-white/60 text-sm">{t.matchResults.you}</div>
              </div>
              <div className="text-2xl text-white/50">-</div>
              <div className="text-center">
                <div className="text-5xl font-black text-white/70">{goalsAgainst}</div>
                <div className="text-white/60 text-sm">{t.matchResults.opponent}</div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-4 space-y-3">
            {/* Elixir Earned */}
            <AnimatePresence>
              {showElixir && (
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-purple-600/30 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <span className="text-white font-medium">{t.matchResults.elixirEarned}</span>
                  </div>
                  <div className="text-2xl font-black text-purple-300">
                    +{displayedElixir}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* League Points */}
            <AnimatePresence>
              {showPoints && (
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-indigo-600/30 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tierInfo.icon}</span>
                    <div>
                      <span className="text-white font-medium">{t.matchResults.leaguePoints}</span>
                      <div className="text-white/60 text-xs">{tierInfo.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black ${
                      pointsChange > 0 ? 'text-green-400' : pointsChange === 0 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {pointsChange > 0 ? '+' : ''}{pointsChange}
                    </div>
                    <div className="text-white/60 text-xs">{newLeaguePoints} {t.matchResults.total}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* XP Distribution */}
            <AnimatePresence>
              {showXP && Object.keys(xpDistributed).length > 0 && (
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-green-600/30 rounded-xl p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📈</span>
                    <span className="text-white font-medium">{t.matchResults.xpGained}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(xpDistributed).map(([subject, xp]) => {
                      const meta = SUBJECT_META[subject as keyof typeof SUBJECT_META]
                      const leveledUp = cardsLeveledUp.includes(subject as SubjectValue)
                      return (
                        <motion.div
                          key={subject}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`flex items-center gap-2 px-2 py-1 rounded-lg ${
                            leveledUp ? 'bg-yellow-500/30' : 'bg-white/10'
                          }`}
                        >
                          <span className="text-lg">{meta?.icon || '📚'}</span>
                          <span className="text-white text-sm truncate flex-1">
                            {meta?.name || subject}
                          </span>
                          <span className="text-green-300 font-bold">+{xp}</span>
                          {leveledUp && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ repeat: Infinity, duration: 1 }}
                              className="text-yellow-400"
                            >
                              ⬆️
                            </motion.span>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Level Up Notification */}
            <AnimatePresence>
              {showXP && cardsLeveledUp.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-gradient-to-r from-yellow-500/30 to-amber-500/30 rounded-xl p-3 text-center"
                >
                  <div className="text-2xl mb-1">🎉</div>
                  <div className="text-yellow-300 font-bold">
                    {cardsLeveledUp.length} {cardsLeveledUp.length > 1 ? t.matchResults.playersLeveledUp : t.matchResults.playerLeveledUp}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Match Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <div className="text-white/60 text-xs">{t.matchResults.questions}</div>
                <div className="text-white font-bold">{questionsAnswered}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <div className="text-white/60 text-xs">{t.matchResults.accuracy}</div>
                <div className="text-white font-bold">{accuracy}%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <div className="text-white/60 text-xs">{t.matchResults.bestStreak}</div>
                <div className="text-white font-bold">{maxStreak}</div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="p-4 bg-black/20">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl"
            >
              {t.matchResults.continueButton}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default MatchResults
