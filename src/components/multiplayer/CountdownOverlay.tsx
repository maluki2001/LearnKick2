'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CountdownOverlayProps {
  onComplete?: () => void
  startFrom?: number
}

export function CountdownOverlay({ onComplete, startFrom = 3 }: CountdownOverlayProps) {
  const [count, setCount] = useState(startFrom)
  const [showGo, setShowGo] = useState(false)

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000)
      return () => clearTimeout(timer)
    } else if (count === 0 && !showGo) {
      setShowGo(true)
      const goTimer = setTimeout(() => onComplete?.(), 800)
      return () => clearTimeout(goTimer)
    }
  }, [count, showGo, onComplete])

  const getCountColor = (num: number) => {
    switch (num) {
      case 3: return 'from-red-500 to-red-600'
      case 2: return 'from-yellow-500 to-orange-500'
      case 1: return 'from-green-500 to-emerald-500'
      default: return 'from-blue-500 to-purple-500'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <AnimatePresence mode="wait">
        {count > 0 && (
          <motion.div
            key={count}
            initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 2, opacity: 0, rotate: 180 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="relative"
          >
            {/* Number */}
            <div
              className={`w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br ${getCountColor(count)} flex items-center justify-center shadow-2xl`}
            >
              <span className="text-8xl sm:text-9xl font-black text-white drop-shadow-lg">
                {count}
              </span>
            </div>

            {/* Pulsing ring */}
            <motion.div
              className={`absolute inset-0 rounded-full border-4 border-white/50`}
              animate={{ scale: [1, 1.3], opacity: [1, 0] }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />

            {/* Outer glow */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${getCountColor(count)} blur-2xl opacity-40`}
            />
          </motion.div>
        )}

        {showGo && (
          <motion.div
            key="go"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* GO! text */}
            <div className="relative">
              <motion.span
                className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 drop-shadow-2xl"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.3,
                  repeat: 2,
                }}
              >
                GO!
              </motion.span>

              {/* Sparkles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                  }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos((i * Math.PI * 2) / 8) * 150,
                    y: Math.sin((i * Math.PI * 2) / 8) * 150,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />
              ))}
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 blur-3xl opacity-30" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
