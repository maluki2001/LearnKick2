'use client'

import { useGameStatus } from '@/stores/gameStore'
import { Timer, Play, Pause, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

export function GameTimer() {
  const { t } = useLanguage()
  const { timeRemaining, status, isActive, currentQuestionIndex, totalQuestions } = useGameStatus()

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  const isLowTime = timeRemaining <= 10
  const progressPercentage = (timeRemaining / 60) * 100

  const getStatusIcon = () => {
    switch (status) {
      case 'countdown':
        return <RotateCcw className="w-5 h-5 animate-spin" />
      case 'active':
        return <Play className="w-5 h-5 text-green-600" />
      case 'paused':
        return <Pause className="w-5 h-5 text-yellow-600" />
      case 'finished':
        return <Timer className="w-5 h-5 text-red-600" />
      default:
        return <Timer className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'countdown':
        return t.game.getReady
      case 'active':
        return t.game.gameActive
      case 'paused':
        return t.game.pause
      case 'finished':
        return t.game.gameOver
      default:
        return t.game.waiting
    }
  }

  return (
    <div className="flex items-center justify-center space-x-4">
      {/* Timer display */}
      <div className="flex items-center space-x-2 bg-white rounded-lg shadow-md px-4 py-2">
        {getStatusIcon()}
        <div className="flex flex-col items-center">
          <motion.div
            className={`font-mono text-lg font-bold ${
              isLowTime ? 'text-red-500' : status === 'active' ? 'text-green-600' : 'text-gray-800'
            }`}
            animate={{
              scale: isLowTime && isActive ? [1, 1.1, 1] : 1
            }}
            transition={{
              duration: 1,
              repeat: isLowTime && isActive ? Infinity : 0
            }}
          >
            {minutes}:{seconds.toString().padStart(2, '0')}
          </motion.div>
          <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full transition-all duration-1000 ${
                isLowTime ? 'bg-red-500' : 'bg-green-500'
              }`}
              initial={{ width: '100%' }}
              animate={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="bg-white rounded-lg shadow-md px-3 py-2">
        <div className="text-xs text-gray-600 text-center">
          {getStatusText()}
        </div>
      </div>

      {/* Question counter */}
      {totalQuestions > 0 && (
        <div className="bg-white rounded-lg shadow-md px-3 py-2">
          <div className="text-xs text-gray-600 text-center">
            {t.game.question}
          </div>
          <div className="font-bold text-sm text-center">
            {currentQuestionIndex + 1}/{totalQuestions}
          </div>
        </div>
      )}
    </div>
  )
}
