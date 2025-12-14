'use client'

import { usePlayerStates } from '@/stores/gameStore'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

interface GameArenaProps {
  arena: 'soccer' | 'hockey'
}

export function GameArena({ arena }: GameArenaProps) {
  const { t } = useLanguage()
  const { player1, player2 } = usePlayerStates()

  if (!player1 || !player2) return null

  const isSoccer = arena === 'soccer'

  return (
    <div className={cn(
      'relative h-24 w-full rounded-xl overflow-hidden border-3 shadow-lg',
      isSoccer
        ? 'bg-gradient-to-b from-green-400 via-green-500 to-green-600 border-green-700'
        : 'bg-gradient-to-b from-blue-200 via-blue-300 to-blue-400 border-blue-500'
    )}>
      {/* Field markings */}
      <div className="absolute inset-0">
        <div className="h-full w-full flex">
          {/* Left goal */}
          <div className={cn(
            'w-6 h-full flex items-center justify-center relative',
            isSoccer ? 'bg-white/20' : 'bg-red-300/50'
          )}>
            <div className={cn(
              'w-2 h-16 rounded-lg shadow-lg',
              isSoccer ? 'bg-white/60' : 'bg-red-500/60'
            )} />
            {/* Goal net effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Field */}
          <div className="flex-1 relative">
            {/* Center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/60 shadow-sm" />

            {/* Center circle */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-white/60 shadow-inner" />

            {/* Field lines */}
            <div className="absolute left-6 top-3 bottom-3 w-12 border-2 border-white/40 rounded-lg shadow-sm" />
            <div className="absolute right-6 top-3 bottom-3 w-12 border-2 border-white/40 rounded-lg shadow-sm" />

            {/* Corner arcs */}
            <div className="absolute top-0 left-0 w-4 h-4 border-b-2 border-r-2 border-white/30 rounded-br-full" />
            <div className="absolute top-0 right-0 w-4 h-4 border-b-2 border-l-2 border-white/30 rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-t-2 border-r-2 border-white/30 rounded-tr-full" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-t-2 border-l-2 border-white/30 rounded-tl-full" />
          </div>

          {/* Right goal */}
          <div className={cn(
            'w-6 h-full flex items-center justify-center relative',
            isSoccer ? 'bg-white/20' : 'bg-red-300/50'
          )}>
            <div className={cn(
              'w-2 h-16 rounded-lg shadow-lg',
              isSoccer ? 'bg-white/60' : 'bg-red-500/60'
            )} />
            {/* Goal net effect */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      </div>

      {/* Player 1 avatar (YOU) */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 z-10"
        animate={{
          left: `${10 + (player1.position * 0.8)}%`
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="relative">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">⚽</span>
          </div>
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-blue-600/90 px-2 py-1 rounded-full shadow-lg">
            {t.game.you}
          </div>
          {/* Streak indicator */}
          {player1.currentStreak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white"
            >
              {player1.currentStreak}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Player 2 avatar (RIVAL) */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 z-10"
        animate={{
          left: `${90 - (player2.position * 0.8)}%`
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="relative">
          <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">🤖</span>
          </div>
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-red-600/90 px-2 py-1 rounded-full shadow-lg">
            {t.game.rival}
          </div>
          {/* Streak indicator */}
          {player2.currentStreak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white"
            >
              {player2.currentStreak}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Score display */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-black/60 text-white px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-sm shadow-lg border border-white/20">
          <span className="text-blue-300">{player1.goals}</span>
          <span className="mx-1 text-xs">-</span>
          <span className="text-red-300">{player2.goals}</span>
        </div>
      </div>

      {/* Goal celebrations */}
      <AnimatePresence>
        {/* You could add goal celebration animations here */}
      </AnimatePresence>

      {/* Arena type indicator */}
      <div className="absolute bottom-1 right-2 text-xs text-white/80 font-semibold bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
        {isSoccer ? '⚽' : '🏒'}
      </div>

      {/* Field texture overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
    </div>
  )
}
