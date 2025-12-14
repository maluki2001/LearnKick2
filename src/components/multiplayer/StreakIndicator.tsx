'use client'

import { motion } from 'framer-motion'
import { Flame, Zap } from 'lucide-react'

interface StreakIndicatorProps {
  streak: number
  maxStreak?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function StreakIndicator({
  streak,
  maxStreak = 5,
  showLabel = true,
  size = 'md'
}: StreakIndicatorProps) {
  if (streak < 2) return null

  const isHotStreak = streak >= 3
  const isOnFire = streak >= 5

  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-2',
    lg: 'text-lg gap-3',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const getStreakColor = () => {
    if (isOnFire) return 'from-red-500 via-orange-500 to-yellow-500'
    if (isHotStreak) return 'from-orange-500 to-yellow-500'
    return 'from-yellow-500 to-amber-500'
  }

  const getStreakText = () => {
    if (isOnFire) return 'ON FIRE!'
    if (isHotStreak) return 'Hot Streak!'
    return 'Streak!'
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`inline-flex items-center ${sizeClasses[size]}`}
    >
      {/* Fire icon with animation */}
      <motion.div
        className="relative"
        animate={isOnFire ? {
          scale: [1, 1.2, 1],
          rotate: [0, -5, 5, 0],
        } : isHotStreak ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        {isOnFire ? (
          <Flame className={`${iconSizes[size]} text-red-500`} />
        ) : (
          <Zap className={`${iconSizes[size]} text-yellow-500`} />
        )}

        {/* Glow effect */}
        {isHotStreak && (
          <motion.div
            className={`absolute inset-0 ${iconSizes[size]} rounded-full blur-md ${
              isOnFire ? 'bg-red-500/50' : 'bg-yellow-500/50'
            }`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Streak counter */}
      <motion.div
        key={streak}
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`font-bold bg-gradient-to-r ${getStreakColor()} bg-clip-text text-transparent`}
      >
        x{streak}
      </motion.div>

      {/* Label */}
      {showLabel && (
        <motion.span
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`font-semibold bg-gradient-to-r ${getStreakColor()} bg-clip-text text-transparent`}
        >
          {getStreakText()}
        </motion.span>
      )}

      {/* Bonus indicator for max streak */}
      {streak >= maxStreak && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full font-bold"
        >
          MAX!
        </motion.span>
      )}
    </motion.div>
  )
}

// Compact version for in-game display
export function StreakBadge({ streak }: { streak: number }) {
  if (streak < 2) return null

  const isOnFire = streak >= 5
  const isHotStreak = streak >= 3

  return (
    <motion.div
      initial={{ scale: 0, y: -20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0, y: -20 }}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
        isOnFire
          ? 'bg-gradient-to-r from-red-500 to-orange-500'
          : isHotStreak
          ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
          : 'bg-gradient-to-r from-yellow-500 to-amber-500'
      } text-white font-bold text-sm shadow-lg`}
    >
      <motion.span
        animate={{ rotate: isOnFire ? [0, -10, 10, 0] : [0, -5, 5, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        {isOnFire ? '🔥' : isHotStreak ? '⚡' : '✨'}
      </motion.span>
      <span>x{streak}</span>
    </motion.div>
  )
}
