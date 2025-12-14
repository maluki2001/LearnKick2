'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Language, translations } from '@/lib/translations'

interface PlayerData {
  name: string
  grade: number
  language: Language
}

interface PlayerSetupProps {
  onComplete: (data: PlayerData) => void
}

export function PlayerSetup({ onComplete }: PlayerSetupProps) {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState(3)
  const [language, setLanguage] = useState<Language>('en')

  // Get translations for current selected language
  const t = translations[language]

  const handleSubmit = () => {
    if (name.trim()) {
      onComplete({ name: name.trim(), grade, language })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-lg w-full card-hover"
    >
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🎮</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.playerSetup.title}</h2>
        <p className="text-gray-600">{t.playerSetup.subtitle}</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {t.playerSetup.nameLabel}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-medium placeholder-gray-400 text-black"
            style={{ color: '#000000 !important' }}
            placeholder={t.playerSetup.namePlaceholder}
            maxLength={20}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {t.playerSetup.gradeLabel}
          </label>
          <div className="relative">
            <select
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg font-medium bg-white appearance-none cursor-pointer hover:border-gray-300 hover:shadow-md"
              style={{ color: '#000000 !important' }}
            >
              {[2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                <option key={g} value={g} className="text-black py-2 px-4">
                  {t.playerSetup.gradeOption} {g}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {t.playerSetup.languageLabel}
          </label>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg font-medium bg-white appearance-none cursor-pointer hover:border-gray-300 hover:shadow-md text-black"
              style={{ color: '#000000 !important' }}
            >
              <option value="en" className="text-black py-2 px-4">🇬🇧 English</option>
              <option value="de" className="text-black py-2 px-4">🇩🇪 Deutsch</option>
              <option value="fr" className="text-black py-2 px-4">🇫🇷 Français</option>
              <option value="sq" className="text-black py-2 px-4">🇦🇱 Shqip</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className="w-full mt-8 py-4 text-lg"
        size="lg"
      >
        {t.playerSetup.startButton} 🚀
      </Button>
    </motion.div>
  )
}