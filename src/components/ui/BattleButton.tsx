'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

interface BattleButtonProps {
  onClick: () => void
  isLoading?: boolean
  subject: string
  language: string
  arena: 'soccer' | 'hockey'
  disabled?: boolean
}

const LANGUAGE_FLAGS: Record<string, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
  fr: '🇫🇷',
  sq: '🇦🇱'
}

export function BattleButton({
  onClick,
  isLoading = false,
  subject,
  language,
  arena,
  disabled = false
}: BattleButtonProps) {
  const { t } = useLanguage()

  const arenaEmoji = arena === 'soccer' ? '⚽' : '🏒'
  const subjectLabel = t.gameSetup.subjects[subject as keyof typeof t.gameSetup.subjects] || subject
  const languageFlag = LANGUAGE_FLAGS[language] || '🌍'

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative overflow-hidden
        w-full
        py-5 sm:py-6 px-6 sm:px-8
        rounded-2xl
        font-bold text-lg sm:text-xl
        shadow-2xl
        transition-all duration-300
        touch-manipulation
        ${disabled || isLoading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white hover:shadow-3xl active:scale-95'
        }
      `}
      whileHover={!disabled && !isLoading ? { scale: 1.05, y: -4 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      animate={!disabled && !isLoading ? {
        boxShadow: [
          '0 10px 40px rgba(251, 146, 60, 0.4)',
          '0 15px 50px rgba(251, 146, 60, 0.6)',
          '0 10px 40px rgba(251, 146, 60, 0.4)'
        ]
      } : {}}
      transition={{
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }}
    >
      {/* Animated background shine */}
      {!disabled && !isLoading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'easeInOut'
          }}
        />
      )}

      {/* Button content */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        {isLoading ? (
          <>
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-lg">{t.loading}</span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{arenaEmoji}</span>
              <span className="text-2xl tracking-wide">{t.game.battle}</span>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <span>{subjectLabel}</span>
              <span>•</span>
              <span>{languageFlag}</span>
            </div>
          </>
        )}
      </div>

      {/* Pulse ring effect */}
      {!disabled && !isLoading && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-yellow-300"
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0, scale: 1.1 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />
      )}
    </motion.button>
  )
}
