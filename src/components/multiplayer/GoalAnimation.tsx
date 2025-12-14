'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

interface GoalAnimationProps {
  show: boolean
  isPlayerGoal: boolean // true = you scored, false = opponent scored
  onComplete?: () => void
}

export function GoalAnimation({ show, isPlayerGoal, onComplete }: GoalAnimationProps) {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(show)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
        >
          {/* Background flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 ${
              isPlayerGoal ? 'bg-green-500' : 'bg-red-500'
            }`}
          />

          {/* Goal text */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{
              scale: [0, 1.3, 1],
              rotate: [-20, 10, 0],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 300 }}
            className="relative"
          >
            {/* Main text */}
            <motion.h1
              className={`text-6xl sm:text-8xl font-black ${
                isPlayerGoal
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-500 to-pink-400'
              } drop-shadow-2xl`}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 0.3,
                repeat: 3,
              }}
            >
              {t.game.goal}
            </motion.h1>

            {/* Soccer ball emoji burst */}
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-4xl"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((i * Math.PI * 2) / 6) * 200,
                  y: Math.sin((i * Math.PI * 2) / 6) * 200,
                  opacity: 0,
                  scale: 0.5,
                  rotate: 360,
                }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                ⚽
              </motion.span>
            ))}

            {/* Star burst */}
            {isPlayerGoal && [...Array(12)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((i * Math.PI * 2) / 12) * 150,
                  y: Math.sin((i * Math.PI * 2) / 12) * 150,
                  opacity: 0,
                }}
                transition={{ duration: 0.8, delay: 0.1 }}
              />
            ))}

            {/* Glow effect */}
            <div
              className={`absolute inset-0 blur-3xl opacity-50 ${
                isPlayerGoal ? 'bg-green-400' : 'bg-red-400'
              }`}
            />
          </motion.div>

          {/* Sub text */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`absolute bottom-1/3 text-xl sm:text-2xl font-bold ${
              isPlayerGoal ? 'text-green-300' : 'text-red-300'
            }`}
          >
            {isPlayerGoal ? t.game.youScored : t.game.opponentScored}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
