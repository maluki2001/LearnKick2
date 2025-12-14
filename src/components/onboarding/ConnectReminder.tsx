'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

interface ConnectReminderProps {
  isOpen: boolean
  gamesPlayed: number
  elo: number
  bestStreak: number
  onConnectNow: () => void
  onRemindLater: () => void
  onNeverAsk: () => void
}

export function ConnectReminder({
  isOpen,
  gamesPlayed,
  elo,
  bestStreak,
  onConnectNow,
  onRemindLater,
  onNeverAsk
}: ConnectReminderProps) {
  const { t } = useLanguage()

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        >
          {/* Header with icon */}
          <div className="text-center mb-4">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-6xl mb-3"
            >
              🔗
            </motion.div>
            <h2 className="text-xl font-bold text-gray-800">
              {t.kidRegistration?.connectReminder?.title || 'Speichere deinen Fortschritt!'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {(t.kidRegistration?.connectReminder?.subtitle || 'Du hast {games} Spiele gespielt. Verbinde dich, um nichts zu verlieren!')
                .replace('{games}', String(gamesPlayed))}
            </p>
          </div>

          {/* Stats preview */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-3">
              {t.kidRegistration?.connectReminder?.currentStats || 'Deine aktuellen Statistiken'}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{elo}</div>
                <div className="text-xs text-gray-500">
                  {t.kidRegistration?.connectReminder?.eloRating || 'ELO'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{gamesPlayed}</div>
                <div className="text-xs text-gray-500">
                  {t.kidRegistration?.connectReminder?.gamesPlayed || 'Spiele'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{bestStreak}</div>
                <div className="text-xs text-gray-500">
                  {t.kidRegistration?.connectReminder?.bestStreak || 'Serie'}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConnectNow}
              className="w-full py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {t.kidRegistration?.connectReminder?.connectNow || 'Jetzt verbinden'} 🔐
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRemindLater}
              className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
            >
              {t.kidRegistration?.connectReminder?.remindLater || 'Spater erinnern'}
            </motion.button>

            <button
              onClick={onNeverAsk}
              className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              {t.kidRegistration?.connectReminder?.neverAsk || 'Nie wieder fragen'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
