'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Swords } from 'lucide-react'
import { formatLeagueName, getLeagueByTrophies } from '@/constants/leagues'

interface Player {
  id: string
  name: string
  trophies: number
  grade?: number
}

interface VsScreenProps {
  player1: Player
  player2: Player
  onComplete?: () => void
  duration?: number // Duration in ms before auto-completing
}

export function VsScreen({ player1, player2, onComplete, duration = 3000 }: VsScreenProps) {
  const [showVs, setShowVs] = useState(false)
  const [showPlayers, setShowPlayers] = useState(false)

  useEffect(() => {
    // Stagger animations
    const playersTimer = setTimeout(() => setShowPlayers(true), 200)
    const vsTimer = setTimeout(() => setShowVs(true), 600)
    const completeTimer = setTimeout(() => onComplete?.(), duration)

    return () => {
      clearTimeout(playersTimer)
      clearTimeout(vsTimer)
      clearTimeout(completeTimer)
    }
  }, [duration, onComplete])

  const player1League = getLeagueByTrophies(player1.trophies)
  const player2League = getLeagueByTrophies(player2.trophies)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 overflow-hidden"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 20,
            }}
            animate={{
              y: -20,
              transition: {
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              },
            }}
          />
        ))}
      </div>

      {/* Lightning effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-yellow-400/50 via-yellow-400/0 to-transparent"
          animate={{
            opacity: [0, 1, 0],
            scaleX: [1, 2, 1],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatDelay: 1.5,
          }}
        />
        <motion.div
          className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-yellow-400/50 via-yellow-400/0 to-transparent"
          animate={{
            opacity: [0, 1, 0],
            scaleX: [1, 2, 1],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatDelay: 2,
            delay: 0.5,
          }}
        />
      </div>

      <div className="relative flex items-center justify-center w-full max-w-4xl px-4">
        {/* Player 1 (Left) */}
        <AnimatePresence>
          {showPlayers && (
            <motion.div
              initial={{ x: -200, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100 }}
              className="flex-1 flex flex-col items-center"
            >
              <motion.div
                className="relative"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* Player avatar/badge */}
                <div
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-2xl"
                  style={{ background: player1League.bgGradient }}
                >
                  {player1.name.charAt(0).toUpperCase()}
                </div>
                {/* Glow effect */}
                <div
                  className="absolute inset-0 rounded-full blur-xl opacity-50"
                  style={{ background: player1League.bgGradient }}
                />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-xl sm:text-2xl font-bold text-white truncate max-w-[150px]"
              >
                {player1.name}
              </motion.h3>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 mt-2"
              >
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-semibold text-yellow-400">
                  {player1.trophies}
                </span>
              </motion.div>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-white/70 mt-1"
              >
                {formatLeagueName(player1League)}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VS Badge */}
        <AnimatePresence>
          {showVs && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100 }}
              className="relative z-10 mx-4 sm:mx-8"
            >
              <motion.div
                className="relative"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                {/* VS circle */}
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center shadow-2xl">
                  <Swords className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
                </div>

                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 blur-xl opacity-50" />

                {/* Pulsing ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-white/30"
                  animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>

              {/* VS text */}
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl font-black text-white drop-shadow-lg"
              >
                VS
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player 2 (Right) */}
        <AnimatePresence>
          {showPlayers && (
            <motion.div
              initial={{ x: 200, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100 }}
              className="flex-1 flex flex-col items-center"
            >
              <motion.div
                className="relative"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                {/* Player avatar/badge */}
                <div
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-2xl"
                  style={{ background: player2League.bgGradient }}
                >
                  {player2.name.charAt(0).toUpperCase()}
                </div>
                {/* Glow effect */}
                <div
                  className="absolute inset-0 rounded-full blur-xl opacity-50"
                  style={{ background: player2League.bgGradient }}
                />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-xl sm:text-2xl font-bold text-white truncate max-w-[150px]"
              >
                {player2.name}
              </motion.h3>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 mt-2"
              >
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-semibold text-yellow-400">
                  {player2.trophies}
                </span>
              </motion.div>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-white/70 mt-1"
              >
                {formatLeagueName(player2League)}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-0 right-0 text-center"
      >
        <motion.p
          className="text-lg sm:text-xl text-white/80 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Get ready to battle!
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
