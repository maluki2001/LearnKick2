'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ELIXIR_CONFIG } from '@/constants/game'
import { useLanguage } from '@/contexts/LanguageContext'

interface ElixirBarProps {
  current: number
  earnedToday: number
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
  onElixirGain?: number // Trigger animation when this changes
}

export function ElixirBar({
  current,
  earnedToday,
  showDetails = false,
  size = 'md',
  animate = true,
  onElixirGain
}: ElixirBarProps) {
  const { t } = useLanguage()
  const [displayValue, setDisplayValue] = useState(current)
  const [isGaining, setIsGaining] = useState(false)
  const [gainAmount, setGainAmount] = useState(0)

  // Animate elixir gain
  useEffect(() => {
    if (onElixirGain && onElixirGain > 0) {
      setIsGaining(true)
      setGainAmount(onElixirGain)

      // Animate the counter
      const startValue = displayValue
      const endValue = Math.min(current, ELIXIR_CONFIG.MAX_STORAGE)
      const duration = 500
      const steps = 20
      const increment = (endValue - startValue) / steps

      let step = 0
      const interval = setInterval(() => {
        step++
        setDisplayValue(Math.round(startValue + increment * step))
        if (step >= steps) {
          clearInterval(interval)
          setDisplayValue(endValue)
          setTimeout(() => setIsGaining(false), 500)
        }
      }, duration / steps)

      return () => clearInterval(interval)
    } else {
      setDisplayValue(current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, onElixirGain])

  const percentage = (displayValue / ELIXIR_CONFIG.MAX_STORAGE) * 100
  const dailyPercentage = (earnedToday / ELIXIR_CONFIG.DAILY_CAP) * 100

  const sizeStyles = {
    sm: { bar: 'h-2', text: 'text-xs', icon: 'text-sm' },
    md: { bar: 'h-3', text: 'text-sm', icon: 'text-lg' },
    lg: { bar: 'h-4', text: 'text-base', icon: 'text-xl' }
  }

  const styles = sizeStyles[size]

  return (
    <div className="relative">
      {/* Main bar */}
      <div className="flex items-center gap-2">
        <motion.span
          className={styles.icon}
          animate={isGaining ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          ⚡
        </motion.span>

        <div className="flex-1">
          <div className={`${styles.bar} bg-gray-700 rounded-full overflow-hidden relative`}>
            <motion.div
              initial={animate ? { width: 0 } : { width: `${percentage}%` }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 relative"
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
            </motion.div>

            {/* Glow when gaining */}
            {isGaining && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-purple-400/50 blur-sm"
              />
            )}
          </div>

          {/* Labels */}
          <div className={`flex justify-between mt-1 ${styles.text}`}>
            <span className="text-gray-400">{t.team.elixir}</span>
            <span className="text-purple-400 font-medium">
              {displayValue} / {ELIXIR_CONFIG.MAX_STORAGE}
            </span>
          </div>
        </div>
      </div>

      {/* Gain popup */}
      <AnimatePresence>
        {isGaining && gainAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            className="absolute -top-2 right-0 text-green-400 font-bold text-lg"
          >
            +{gainAmount} ⚡
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details section */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 space-y-2"
        >
          {/* Daily cap progress */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{t.team.dailyEarned}</span>
              <span>{earnedToday} / {ELIXIR_CONFIG.DAILY_CAP}</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dailyPercentage}%` }}
                className={`h-full ${dailyPercentage >= 100 ? 'bg-yellow-500' : 'bg-blue-500'}`}
              />
            </div>
            {dailyPercentage >= 100 && (
              <p className="text-xs text-yellow-500 mt-1">{t.team.dailyCapReached}</p>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-gray-800/50 rounded-lg p-2">
              <div className="text-purple-400 font-bold">{ELIXIR_CONFIG.TRAIN_COST}</div>
              <div className="text-gray-500">{t.team.trainCost}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-2">
              <div className="text-green-400 font-bold">+{ELIXIR_CONFIG.TRAIN_XP_GAIN}</div>
              <div className="text-gray-500">{t.team.xpGain}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-2">
              <div className="text-yellow-400 font-bold">{ELIXIR_CONFIG.WEEKLY_STREAK_BONUS}</div>
              <div className="text-gray-500">{t.team.weekBonus}</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Mini version for inline display
export function ElixirBadge({ current }: { current: number }) {
  return (
    <div className="inline-flex items-center gap-1 bg-purple-900/50 px-2 py-1 rounded-full">
      <span className="text-sm">⚡</span>
      <span className="text-purple-300 font-medium text-sm">{current}</span>
    </div>
  )
}

// Animated elixir gain display (for match results)
interface ElixirGainDisplayProps {
  amount: number
  breakdown?: {
    speedBonus: number
    streakBonus: number
  }
  onComplete?: () => void
}

export function ElixirGainDisplay({ amount, breakdown, onComplete }: ElixirGainDisplayProps) {
  const { t } = useLanguage()
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.()
    }, 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="text-center"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ duration: 0.5 }}
        className="text-5xl mb-2"
      >
        ⚡
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-purple-400"
      >
        +{amount} {t.team.elixirGain}
      </motion.div>

      {breakdown && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-2 text-sm text-gray-400 space-y-1"
        >
          <div>{t.team.speedBonus}: +{breakdown.speedBonus}</div>
          <div>{t.team.streakBonus}: +{breakdown.streakBonus}</div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default ElixirBar
