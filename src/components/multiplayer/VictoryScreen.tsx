'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, TrendingUp, TrendingDown, Home, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatLeagueName, getLeagueByTrophies } from '@/constants/leagues'
import { useTranslation, type Language } from '@/lib/translations'

interface VictoryScreenProps {
  isWinner: boolean
  playerScore: number
  opponentScore: number
  trophyChange: number
  newTrophies: number
  playerName: string
  opponentName: string
  onPlayAgain?: () => void
  onGoHome?: () => void
  language?: Language
}

export function VictoryScreen({
  isWinner,
  playerScore,
  opponentScore,
  trophyChange,
  newTrophies,
  playerName,
  opponentName,
  onPlayAgain,
  onGoHome,
  language = 'en',
}: VictoryScreenProps) {
  const { t } = useTranslation(language)
  const [showTrophies, setShowTrophies] = useState(false)
  const [displayedTrophies, setDisplayedTrophies] = useState(newTrophies - trophyChange)

  const league = getLeagueByTrophies(newTrophies)
  const previousLeague = getLeagueByTrophies(newTrophies - trophyChange)
  const leagueChanged = league.id !== previousLeague.id

  useEffect(() => {
    // Show trophies after a delay
    const timer = setTimeout(() => setShowTrophies(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showTrophies) {
      // Animate trophy count
      const startTrophies = newTrophies - trophyChange
      const endTrophies = newTrophies
      const duration = 1500
      const steps = 30
      const stepDuration = duration / steps
      const stepValue = (endTrophies - startTrophies) / steps

      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        if (currentStep >= steps) {
          setDisplayedTrophies(endTrophies)
          clearInterval(interval)
        } else {
          setDisplayedTrophies(Math.round(startTrophies + stepValue * currentStep))
        }
      }, stepDuration)

      return () => clearInterval(interval)
    }
  }, [showTrophies, newTrophies, trophyChange])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 ${
        isWinner
          ? 'bg-gradient-to-br from-yellow-600 via-amber-600 to-orange-700'
          : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900'
      }`}
    >
      {/* Confetti for winner */}
      {isWinner && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3"
              style={{
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1'][i % 5],
                borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                left: `${Math.random() * 100}%`,
              }}
              initial={{ y: -20, rotate: 0, opacity: 1 }}
              animate={{
                y: window.innerHeight + 20,
                rotate: Math.random() * 720 - 360,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                delay: Math.random() * 1,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      )}

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="text-center"
      >
        {/* Result icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          {isWinner ? (
            <div className="relative inline-block">
              <Trophy className="w-24 h-24 sm:w-32 sm:h-32 text-yellow-300 drop-shadow-lg" />
              <motion.div
                className="absolute inset-0"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Trophy className="w-24 h-24 sm:w-32 sm:h-32 text-yellow-300 blur-lg" />
              </motion.div>
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-600 flex items-center justify-center">
              <span className="text-6xl sm:text-7xl">😔</span>
            </div>
          )}
        </motion.div>

        {/* Result text */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`text-4xl sm:text-6xl font-black mb-2 ${
            isWinner ? 'text-white' : 'text-slate-300'
          }`}
        >
          {isWinner ? t.matchResults.victory : t.matchResults.defeat}
        </motion.h1>

        {/* Score */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4 sm:gap-8 my-6"
        >
          <div className="text-center">
            <p className="text-sm sm:text-base text-white/70">{playerName}</p>
            <p className={`text-5xl sm:text-7xl font-black ${isWinner ? 'text-white' : 'text-slate-400'}`}>
              {playerScore}
            </p>
          </div>
          <span className="text-2xl sm:text-4xl text-white/50">-</span>
          <div className="text-center">
            <p className="text-sm sm:text-base text-white/70">{opponentName}</p>
            <p className={`text-5xl sm:text-7xl font-black ${!isWinner ? 'text-white' : 'text-slate-400'}`}>
              {opponentScore}
            </p>
          </div>
        </motion.div>

        {/* Trophy change */}
        {showTrophies && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-black/20 rounded-2xl p-4 sm:p-6 backdrop-blur-sm mb-6"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <motion.span
                className="text-3xl sm:text-4xl font-bold text-white"
                key={displayedTrophies}
              >
                {displayedTrophies}
              </motion.span>
              <motion.span
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`flex items-center gap-1 text-lg sm:text-xl font-bold ${
                  trophyChange >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {trophyChange >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                {trophyChange >= 0 ? '+' : ''}{trophyChange}
              </motion.span>
            </div>

            {/* League */}
            <div className="flex items-center justify-center gap-2">
              <Star className="w-4 h-4" style={{ color: league.color }} />
              <span className="text-sm sm:text-base text-white/80">
                {formatLeagueName(league)}
              </span>
            </div>

            {/* League promotion/demotion */}
            {leagueChanged && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className={`mt-2 text-sm font-semibold ${
                  trophyChange >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {trophyChange >= 0 ? `🎉 ${t.matchResults.leaguePromoted}` : `📉 ${t.matchResults.leagueDemoted}`}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            onClick={onPlayAgain}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl"
          >
            <RotateCcw className="w-5 h-5" />
            {t.game.playAgain}
          </Button>
          <Button
            onClick={onGoHome}
            variant="outline"
            className="flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white hover:bg-white/10 font-bold rounded-xl"
          >
            <Home className="w-5 h-5" />
            {t.settings.home}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
