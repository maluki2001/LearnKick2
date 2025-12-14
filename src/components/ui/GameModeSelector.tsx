'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { GameMode } from '@/types/gameMode'
import { Language, useTranslation } from '@/lib/translations'

interface GameModeSelectorProps {
  selectedMode: GameMode | null
  onModeSelect: (mode: GameMode) => void
  onConfirm: () => void
  language: Language
}

export function GameModeSelector({ selectedMode, onModeSelect, onConfirm, language }: GameModeSelectorProps) {
  const { t } = useTranslation(language)

  const modes: { key: GameMode; icon: string }[] = [
    { key: 'family', icon: '👨‍👩‍👧‍👦' },
    { key: 'school', icon: '🏫' }
  ]

  const getModeData = (key: GameMode) => {
    return key === 'family' ? t.gameModes.family : t.gameModes.school
  }

  return (
    <div className="text-center text-white max-w-5xl w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
          {t.gameModes.title}
        </h1>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">
          {t.gameModes.subtitle}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {modes.map((mode, index) => {
          const modeData = getModeData(mode.key)
          return (
            <motion.div
              key={mode.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onModeSelect(mode.key)}
              className={`bg-white/95 backdrop-blur-sm rounded-2xl p-8 cursor-pointer transition-all duration-300 card-hover ${
                selectedMode === mode.key
                  ? 'ring-4 ring-blue-400 shadow-2xl transform scale-105 bg-gradient-to-br from-blue-50 to-white'
                  : 'hover:shadow-xl'
              }`}
            >
              <div className="text-center text-gray-800">
                <div className="text-7xl mb-6">{mode.icon}</div>
                <h3 className="text-3xl font-bold mb-3 text-gray-900">{modeData.name}</h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">{modeData.description}</p>

                <div className="text-left space-y-3">
                  {modeData.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-gray-700">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-green-600 text-sm font-bold">✓</span>
                      </div>
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {selectedMode === mode.key && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 bg-blue-100 rounded-xl border-2 border-blue-200"
                  >
                    <div className="text-blue-800 font-semibold text-lg">
                      ✨ {t.gameModes.selected}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-center"
          >
            <Button
              onClick={onConfirm}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl px-12 py-4 text-lg"
            >
              {t.gameModes.continue} {getModeData(selectedMode).name} →
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}