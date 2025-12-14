'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { Language } from '@/lib/translations'

interface UsernameStepProps {
  onNext: (username: string) => void
}

export function UsernameStep({ onNext }: UsernameStepProps) {
  const { t, language, setLanguage } = useLanguage()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [showLanguages, setShowLanguages] = useState(false)

  const MIN_LENGTH = 2
  const MAX_LENGTH = 15

  const isValid = username.trim().length >= MIN_LENGTH && username.trim().length <= MAX_LENGTH

  const handleSubmit = () => {
    const trimmedUsername = username.trim()

    if (trimmedUsername.length < MIN_LENGTH) {
      setError(t.kidRegistration?.nameTooShort || 'Name zu kurz (min. 2 Zeichen)')
      return
    }

    if (trimmedUsername.length > MAX_LENGTH) {
      setError(t.kidRegistration?.nameTooLong || 'Name zu lang (max. 15 Zeichen)')
      return
    }

    onNext(trimmedUsername)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleSubmit()
    }
  }

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
      className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl"
    >
      {/* Language selector - small, top right */}
      <div className="flex justify-end mb-4">
        <div className="relative">
          <button
            onClick={() => setShowLanguages(!showLanguages)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all"
          >
            {languageLabels[language].flag} {languageLabels[language].name}
            <span className="text-xs">▼</span>
          </button>

          {showLanguages && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10"
            >
              {Object.entries(languageLabels).map(([lang, { flag, name }]) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang as Language)
                    setShowLanguages(false)
                  }}
                  className={`flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 ${
                    language === lang ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {flag} {name}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Fun decorations */}
      <div className="text-center text-4xl mb-4">
        ⚽ 🎯 📚
      </div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-2">
        {t.kidRegistration?.whatsYourName || 'Wie heisst du?'}
      </h2>

      <p className="text-gray-500 text-center text-sm mb-6">
        {t.kidRegistration?.enterUsername || 'Gib deinen Spielernamen ein'}
      </p>

      {/* Username Input */}
      <div className="mb-6">
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            setError('')
          }}
          onKeyPress={handleKeyPress}
          placeholder={t.kidRegistration?.usernamePlaceholder || 'Dein Name...'}
          maxLength={MAX_LENGTH}
          className="w-full p-4 rounded-xl border-2 border-gray-300 text-gray-800 text-xl font-medium text-center
                     focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20
                     transition-all duration-200 placeholder:text-gray-400"
          autoFocus
        />

        {/* Character count */}
        <div className="flex justify-between mt-2 text-sm">
          <span className={`${error ? 'text-red-500' : 'text-gray-400'}`}>
            {error || `${MIN_LENGTH}-${MAX_LENGTH} ${t.kidRegistration?.characters || 'Zeichen'}`}
          </span>
          <span className={`${username.length > MAX_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
            {username.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={isValid ? { scale: 1.02 } : {}}
        whileTap={isValid ? { scale: 0.98 } : {}}
        onClick={handleSubmit}
        disabled={!isValid}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
          isValid
            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-xl hover:shadow-2xl'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {t.kidRegistration?.next || 'Weiter'} →
      </motion.button>
    </motion.div>
  )
}
