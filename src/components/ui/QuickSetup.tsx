'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { Language } from '@/lib/translations'

interface QuickSetupProps {
  onComplete: (data: { name: string; grade: number; mode: 'school' | 'home' }) => void
}

export function QuickSetup({ onComplete }: QuickSetupProps) {
  const { t, language, setLanguage, availableLanguages } = useLanguage()
  const [name, setName] = useState('')
  const [selectedMode, setSelectedMode] = useState<'school' | 'home' | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = () => {
    console.log('🎯 QuickSetup handleSubmit called')
    console.log('📝 Name:', name, 'Length:', name.trim().length)
    console.log('🏠 Selected mode:', selectedMode)

    if (!name.trim()) {
      setError(t.playerSetup.errors.nameRequired)
      return
    }
    if (name.trim().length < 2) {
      setError(t.playerSetup.errors.nameTooShort)
      return
    }
    if (!selectedMode) {
      setError(t.playerSetup.errors.modeRequired)
      return
    }

    console.log('✅ Validation passed, calling onComplete')
    onComplete({
      name: name.trim(),
      grade: 3, // Default grade, can be changed in settings later
      mode: selectedMode
    })
  }

  const isValid = name.trim().length >= 2 && selectedMode !== null

  const languageLabels: Record<Language, { flag: string; name: string }> = {
    en: { flag: '🇬🇧', name: 'EN' },
    de: { flag: '🇩🇪', name: 'DE' },
    fr: { flag: '🇫🇷', name: 'FR' },
    sq: { flag: '🇦🇱', name: 'SQ' }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-md mx-4"
    >
      {/* Language Selector */}
      <div className="flex justify-center gap-2 mb-6">
        {availableLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-3 py-2 rounded-lg font-medium transition-all ${
              language === lang
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {languageLabels[lang].flag} {languageLabels[lang].name}
          </button>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
        {t.playerSetup.title}
      </h2>

      {/* Name Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t.playerSetup.nameLabel}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          placeholder={t.playerSetup.namePlaceholder}
          maxLength={20}
          className="w-full p-4 rounded-xl border-2 border-gray-300 text-gray-800 text-lg font-medium
                     focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20
                     transition-all duration-200 placeholder:text-gray-400"
          autoFocus
        />
      </div>

      {/* Mode Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          {t.playerSetup.wherePlayingLabel}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedMode('school')
              setError('')
            }}
            className={`p-5 rounded-xl font-semibold transition-all duration-200 text-center ${
              selectedMode === 'school'
                ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 shadow-xl border-2 border-blue-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent hover:shadow-lg'
            }`}
          >
            <div className="text-3xl mb-2">🏫</div>
            <div className="text-lg">{t.gameModes.school.name}</div>
            <div className="text-xs opacity-75 mt-1">{t.gameModes.school.subtitle}</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedMode('home')
              setError('')
            }}
            className={`p-5 rounded-xl font-semibold transition-all duration-200 text-center ${
              selectedMode === 'home'
                ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-800 shadow-xl border-2 border-green-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent hover:shadow-lg'
            }`}
          >
            <div className="text-3xl mb-2">🏠</div>
            <div className="text-lg">{t.gameModes.family.name}</div>
            <div className="text-xs opacity-75 mt-1">{t.gameModes.family.subtitle}</div>
          </motion.button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        whileHover={isValid ? { scale: 1.02 } : {}}
        whileTap={isValid ? { scale: 0.98 } : {}}
        onClick={handleSubmit}
        disabled={!isValid}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
          isValid
            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl hover:shadow-2xl'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {t.start}
      </motion.button>

      <p className="text-xs text-gray-500 text-center mt-4">
        {t.playerSetup.settingsSaved}
      </p>
    </motion.div>
  )
}
