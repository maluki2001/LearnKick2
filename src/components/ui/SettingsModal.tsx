'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GamePreferences } from '@/contexts/PlayerProfileContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Language } from '@/lib/translations'
import { AccessibilitySettings as AccessibilitySettingsType, DEFAULT_ACCESSIBILITY_SETTINGS } from '@/types/accessibility'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  preferences: GamePreferences
  onSave: (preferences: GamePreferences) => void
  playerName: string
  onClearProfile?: () => void
  accessibilitySettings?: AccessibilitySettingsType
  onAccessibilityChange?: (settings: AccessibilitySettingsType) => void
}

const GRADES = [1, 2, 3, 4, 5, 6]

export function SettingsModal({
  isOpen,
  onClose,
  preferences,
  onSave,
  playerName,
  onClearProfile,
  accessibilitySettings = DEFAULT_ACCESSIBILITY_SETTINGS,
  onAccessibilityChange
}: SettingsModalProps) {
  const { t, language, setLanguage, availableLanguages } = useLanguage()
  const [localPrefs, setLocalPrefs] = useState<GamePreferences>(preferences)
  const [localAccessibility, setLocalAccessibility] = useState<AccessibilitySettingsType>(accessibilitySettings)
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [activeTab, setActiveTab] = useState<'game' | 'accessibility'>('game')

  // Sync local state when preferences change
  useEffect(() => {
    setLocalPrefs(preferences)
  }, [preferences])

  useEffect(() => {
    setLocalAccessibility(accessibilitySettings)
  }, [accessibilitySettings])

  // Auto-save on any change
  const updateAndSave = (newPrefs: GamePreferences) => {
    setLocalPrefs(newPrefs)
    onSave(newPrefs)
  }

  const updateAccessibility = <K extends keyof AccessibilitySettingsType>(
    key: K,
    value: AccessibilitySettingsType[K]
  ) => {
    const newSettings = { ...localAccessibility, [key]: value }
    setLocalAccessibility(newSettings)
    if (onAccessibilityChange) {
      onAccessibilityChange(newSettings)
    }
  }

  const handleClearProfile = () => {
    if (onClearProfile) {
      onClearProfile()
      setShowConfirmClear(false)
      onClose()
    }
  }

  const languageLabels: Record<Language, { flag: string; name: string }> = {
    en: { flag: '🇬🇧', name: 'EN' },
    de: { flag: '🇩🇪', name: 'DE' },
    fr: { flag: '🇫🇷', name: 'FR' },
    sq: { flag: '🇦🇱', name: 'SQ' }
  }

  const subjects = [
    { value: 'all', emoji: '🎯', color: 'from-pink-500 via-purple-500 to-blue-500' },
    { value: 'math', emoji: '🔢', color: 'from-blue-500 to-blue-600' },
    { value: 'german', emoji: '🇩🇪', color: 'from-yellow-500 to-red-500' },
    { value: 'french', emoji: '🇫🇷', color: 'from-blue-500 to-red-500' },
    { value: 'english', emoji: '🇬🇧', color: 'from-red-500 to-blue-600' },
    { value: 'science', emoji: '🔬', color: 'from-teal-500 to-cyan-600' },
    { value: 'geography', emoji: '🌍', color: 'from-green-500 to-green-600' },
    { value: 'history', emoji: '🏛️', color: 'from-amber-600 to-yellow-600' },
    { value: 'music', emoji: '🎵', color: 'from-purple-500 to-pink-500' },
    { value: 'art', emoji: '🎨', color: 'from-rose-500 to-orange-500' },
    { value: 'sports', emoji: '⚽', color: 'from-emerald-500 to-green-600' },
    { value: 'digital', emoji: '💻', color: 'from-indigo-500 to-violet-600' }
  ]

  const arenas = [
    { value: 'soccer', emoji: '⚽', name: 'Soccer', color: 'from-green-400 to-green-600', bg: 'bg-green-500' },
    { value: 'hockey', emoji: '🏒', name: 'Hockey', color: 'from-blue-400 to-blue-600', bg: 'bg-blue-500' }
  ]

  const questionLanguages = [
    { value: 'de', emoji: '🇩🇪', name: 'Deutsch' },
    { value: 'en', emoji: '🇬🇧', name: 'English' },
    { value: 'fr', emoji: '🇫🇷', name: 'Français' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          />

          {/* Modal Wrapper - Flexbox Centering */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full h-full lg:w-[42rem] lg:h-auto lg:max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
          >
            {/* Outer glow border */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 via-orange-500 to-red-600 rounded-3xl opacity-80 blur-sm pointer-events-none" />

            {/* Main container */}
            <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl overflow-hidden flex flex-col border-4 border-yellow-500/50 shadow-2xl h-full">

              {/* Header - Royal Style */}
              <div className="relative bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 p-4 border-b-4 border-yellow-700">
                <div className="absolute inset-0 bg-[url('/patterns/gold-texture.png')] opacity-20 pointer-events-none" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚙️</span>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 drop-shadow-sm tracking-wide">
                        {t.settings.title.toUpperCase()}
                      </h2>
                      <p className="text-sm text-slate-700 font-medium">{playerName}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg border-2 border-red-700"
                  >
                    <span className="text-white text-2xl font-bold">×</span>
                  </motion.button>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mt-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('game')}
                    className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all ${
                      activeTab === 'game'
                        ? 'bg-slate-900 text-yellow-400 shadow-inner'
                        : 'bg-yellow-700/50 text-slate-900 hover:bg-yellow-700'
                    }`}
                  >
                    🎮 {t.settings.gameTab}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('accessibility')}
                    className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all ${
                      activeTab === 'accessibility'
                        ? 'bg-slate-900 text-yellow-400 shadow-inner'
                        : 'bg-yellow-700/50 text-slate-900 hover:bg-yellow-700'
                    }`}
                  >
                    ♿ {t.settings.accessibilityTab}
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {activeTab === 'game' ? (
                  <>
                    {/* Arena Selection - Big Cards */}
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                      <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        🏟️ {t.settings.selectArena}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {arenas.map((arena) => (
                          <motion.button
                            key={arena.value}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateAndSave({ ...localPrefs, lastArena: arena.value as 'soccer' | 'hockey' })}
                            className={`relative p-6 rounded-2xl font-bold transition-all overflow-hidden ${
                              localPrefs.lastArena === arena.value
                                ? `bg-gradient-to-br ${arena.color} shadow-lg shadow-${arena.value === 'soccer' ? 'green' : 'blue'}-500/30 ring-4 ring-yellow-400`
                                : 'bg-slate-700/50 hover:bg-slate-700'
                            }`}
                          >
                            {localPrefs.lastArena === arena.value && (
                              <div className="absolute top-2 right-2 bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
                                ✓
                              </div>
                            )}
                            <div className="text-5xl mb-2">{arena.emoji}</div>
                            <div className={`text-lg ${localPrefs.lastArena === arena.value ? 'text-white' : 'text-slate-300'}`}>
                              {t.gameSetup.arenas[arena.value as keyof typeof t.gameSetup.arenas]}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Subject Selection */}
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                      <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        📚 {t.settings.selectSubject}
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {subjects.map((subject) => (
                          <motion.button
                            key={subject.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateAndSave({ ...localPrefs, lastSubject: subject.value })}
                            className={`relative p-2 sm:p-3 rounded-xl font-semibold transition-all flex flex-col items-center gap-1 ${
                              localPrefs.lastSubject === subject.value
                                ? `bg-gradient-to-r ${subject.color} text-white shadow-lg ring-2 ring-yellow-400`
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <span className="text-2xl">{subject.emoji}</span>
                            <span className="text-xs text-center leading-tight">
                              {t.gameSetup.subjects[subject.value as keyof typeof t.gameSetup.subjects]}
                            </span>
                            {localPrefs.lastSubject === subject.value && (
                              <span className="absolute top-1 right-1 text-xs text-yellow-300">✓</span>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Grade Selection */}
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                      <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        🎓 {t.settings.gradeLevel}
                      </h3>
                      <div className="flex gap-2 justify-center">
                        {GRADES.map((grade) => (
                          <motion.button
                            key={grade}
                            whileHover={{ scale: 1.1, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateAndSave({ ...localPrefs, grade })}
                            className={`w-14 h-14 rounded-xl font-black text-xl transition-all ${
                              localPrefs.grade === grade
                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 shadow-lg shadow-yellow-500/30 ring-2 ring-white'
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                            }`}
                          >
                            {grade}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Question Language */}
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                      <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        🌐 {t.settings.questionLanguage}
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {questionLanguages.map((lang) => (
                          <motion.button
                            key={lang.value}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateAndSave({ ...localPrefs, lastQuestionLanguage: lang.value as 'de' | 'en' | 'fr' })}
                            className={`p-3 rounded-xl font-medium transition-all text-center ${
                              localPrefs.lastQuestionLanguage === lang.value
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-2 ring-yellow-400'
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <div className="text-2xl mb-1">{lang.emoji}</div>
                            <div className="text-xs font-bold">{lang.name}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* UI Language */}
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                      <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        🗣️ {t.settings.appLanguage}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {availableLanguages.map((lang) => (
                          <motion.button
                            key={lang}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setLanguage(lang)}
                            className={`px-4 py-2 rounded-xl font-bold transition-all ${
                              language === lang
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {languageLabels[lang].flag} {languageLabels[lang].name}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Game Mode */}
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                      <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        🎯 {t.settings.gameMode}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {(['school', 'home'] as const).map((mode) => (
                          <motion.button
                            key={mode}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateAndSave({ ...localPrefs, gameMode: mode })}
                            className={`p-4 rounded-xl font-bold transition-all ${
                              localPrefs.gameMode === mode
                                ? mode === 'school'
                                  ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg ring-2 ring-yellow-400'
                                  : 'bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg ring-2 ring-yellow-400'
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <div className="text-3xl mb-2">{mode === 'school' ? '🏫' : '🏠'}</div>
                            <div>{mode === 'school' ? t.gameModes.school.name : t.gameModes.family.name}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Multiplayer Settings */}
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                      <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        👥 {t.settings.multiplayer || 'Multiplayer'}
                      </h3>
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                        <div>
                          <span className="text-white font-medium">{t.settings.playAgainstAI || 'Play Against AI'}</span>
                          <p className="text-xs text-slate-400">{t.settings.playAgainstAIDesc || 'Always play against computer instead of real players'}</p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateAndSave({ ...localPrefs, playAgainstAI: !localPrefs.playAgainstAI })}
                          className={`w-16 h-8 rounded-full transition-colors relative ${
                            localPrefs.playAgainstAI ? 'bg-green-500' : 'bg-slate-600'
                          }`}
                        >
                          <motion.div
                            animate={{ x: localPrefs.playAgainstAI ? 32 : 4 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="w-6 h-6 bg-white rounded-full shadow-lg absolute top-1"
                          />
                        </motion.button>
                      </div>
                      {!localPrefs.playAgainstAI && (
                        <p className="text-xs text-blue-400 mt-2 px-1">
                          {t.settings.multiplayerNote || 'BATTLE will search for real opponents. If none found, you\'ll play against AI.'}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  /* Accessibility Tab */
                  <>
                    {/* Visual Settings */}
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                      <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        👁️ {t.settings.visual}
                      </h3>
                      <div className="space-y-3">
                        {/* Dyslexia-Friendly Font */}
                        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                          <div>
                            <span className="text-white font-medium">{t.settings.dyslexiaFont}</span>
                            <p className="text-xs text-slate-400">{t.settings.dyslexiaFontDesc}</p>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateAccessibility('dyslexiaFriendlyFont', !localAccessibility.dyslexiaFriendlyFont)}
                            className={`w-16 h-8 rounded-full transition-colors relative ${
                              localAccessibility.dyslexiaFriendlyFont ? 'bg-green-500' : 'bg-slate-600'
                            }`}
                          >
                            <motion.div
                              animate={{ x: localAccessibility.dyslexiaFriendlyFont ? 32 : 4 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="w-6 h-6 bg-white rounded-full shadow-lg absolute top-1"
                            />
                          </motion.button>
                        </div>

                        {/* Font Size */}
                        <div>
                          <label className="text-sm text-slate-400 mb-2 block">{t.settings.fontSize}</label>
                          <div className="grid grid-cols-4 gap-2">
                            {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                              <motion.button
                                key={size}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateAccessibility('fontSize', size)}
                                className={`p-2 rounded-lg font-medium text-xs transition-all ${
                                  localAccessibility.fontSize === size
                                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white ring-2 ring-yellow-400'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                              >
                                {size === 'small' ? 'S' : size === 'medium' ? 'M' : size === 'large' ? 'L' : 'XL'}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Motor Settings */}
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                      <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        🖱️ {t.settings.controls}
                      </h3>
                      <div className="space-y-3">
                        {/* Large Targets */}
                        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                          <div>
                            <span className="text-white font-medium">{t.settings.largerButtons}</span>
                            <p className="text-xs text-slate-400">{t.settings.largerButtonsDesc}</p>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateAccessibility('largerClickTargets', !localAccessibility.largerClickTargets)}
                            className={`w-16 h-8 rounded-full transition-colors relative ${
                              localAccessibility.largerClickTargets ? 'bg-green-500' : 'bg-slate-600'
                            }`}
                          >
                            <motion.div
                              animate={{ x: localAccessibility.largerClickTargets ? 32 : 4 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="w-6 h-6 bg-white rounded-full shadow-lg absolute top-1"
                            />
                          </motion.button>
                        </div>

                        {/* Extended Timeouts */}
                        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                          <div>
                            <span className="text-white font-medium">{t.settings.moreTime}</span>
                            <p className="text-xs text-slate-400">{t.settings.moreTimeDesc}</p>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateAccessibility('extendedTimeouts', !localAccessibility.extendedTimeouts)}
                            className={`w-16 h-8 rounded-full transition-colors relative ${
                              localAccessibility.extendedTimeouts ? 'bg-green-500' : 'bg-slate-600'
                            }`}
                          >
                            <motion.div
                              animate={{ x: localAccessibility.extendedTimeouts ? 32 : 4 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="w-6 h-6 bg-white rounded-full shadow-lg absolute top-1"
                            />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Audio Settings */}
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                      <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        🔊 {t.settings.audio}
                      </h3>
                      <div className="space-y-3">
                        {/* Sound Effects */}
                        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                          <div>
                            <span className="text-white font-medium">{t.settings.soundEffects}</span>
                            <p className="text-xs text-slate-400">{t.settings.soundEffectsDesc}</p>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateAccessibility('soundEnabled', !localAccessibility.soundEnabled)}
                            className={`w-16 h-8 rounded-full transition-colors relative ${
                              localAccessibility.soundEnabled ? 'bg-green-500' : 'bg-slate-600'
                            }`}
                          >
                            <motion.div
                              animate={{ x: localAccessibility.soundEnabled ? 32 : 4 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="w-6 h-6 bg-white rounded-full shadow-lg absolute top-1"
                            />
                          </motion.button>
                        </div>

                        {/* Simplified UI */}
                        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                          <div>
                            <span className="text-white font-medium">{t.settings.simpleMode}</span>
                            <p className="text-xs text-slate-400">{t.settings.simpleModeDesc}</p>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateAccessibility('simplifiedUI', !localAccessibility.simplifiedUI)}
                            className={`w-16 h-8 rounded-full transition-colors relative ${
                              localAccessibility.simplifiedUI ? 'bg-green-500' : 'bg-slate-600'
                            }`}
                          >
                            <motion.div
                              animate={{ x: localAccessibility.simplifiedUI ? 32 : 4 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="w-6 h-6 bg-white rounded-full shadow-lg absolute top-1"
                            />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Danger Zone - Always visible at bottom */}
                {onClearProfile && activeTab === 'game' && (
                  <div className="bg-red-900/30 rounded-2xl p-4 border border-red-700/50">
                    <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                      ⚠️ {t.settings.dangerZoneTitle}
                    </h3>
                    {!showConfirmClear ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowConfirmClear(true)}
                        className="w-full p-3 rounded-xl bg-red-600/50 text-red-200 font-bold hover:bg-red-600 transition-colors"
                      >
                        🗑️ {t.settings.resetAllProgress}
                      </motion.button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-red-300">
                          {t.settings.confirmResetModal}
                        </p>
                        <div className="flex gap-2">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowConfirmClear(false)}
                            className="flex-1 p-2 rounded-lg bg-slate-600 text-white font-medium"
                          >
                            {t.settings.cancel}
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleClearProfile}
                            className="flex-1 p-2 rounded-lg bg-red-600 text-white font-bold"
                          >
                            {t.settings.delete}
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer - Battle Button Style */}
              <div className="p-4 bg-slate-900/80 border-t-4 border-yellow-600">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-slate-900 font-black text-xl shadow-lg shadow-yellow-500/30 border-b-4 border-yellow-700"
                >
                  ✓ {t.settings.done}
                </motion.button>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
