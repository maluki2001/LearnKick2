'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { AccessibilitySettings as AccessibilitySettingsType } from '@/types/accessibility'
import { useLanguage } from '@/contexts/LanguageContext'

interface AccessibilitySettingsProps {
  isOpen: boolean
  onClose: () => void
  currentSettings: AccessibilitySettingsType
  onSettingsChange: (settings: AccessibilitySettingsType) => void
}

export function AccessibilitySettings({ isOpen, onClose, currentSettings, onSettingsChange }: AccessibilitySettingsProps) {
  const { t } = useLanguage()
  const [localSettings, setLocalSettings] = useState(currentSettings)

  // Sync local state when currentSettings prop changes
  useEffect(() => {
    setLocalSettings(currentSettings)
  }, [currentSettings])

  const updateSetting = <K extends keyof AccessibilitySettingsType>(
    key: K,
    value: AccessibilitySettingsType[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    onSettingsChange(newSettings)
  }

  const themeLabels: Record<string, string> = {
    'light': t.accessibility.themes.light,
    'dark': t.accessibility.themes.dark,
    'high-contrast': t.accessibility.themes.highContrast
  }

  const fontSizeLabels: Record<string, string> = {
    'small': t.accessibility.fontSizes.small,
    'medium': t.accessibility.fontSizes.medium,
    'large': t.accessibility.fontSizes.large,
    'extra-large': t.accessibility.fontSizes.extraLarge
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-200">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.accessibility.title}</h2>
                    <p className="text-gray-600">{t.accessibility.subtitle}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Visual Settings */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="mr-2">👁️</span> {t.accessibility.sections.visual}
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">{t.accessibility.theme}</label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['light', 'dark', 'high-contrast'] as const).map((theme) => (
                            <motion.button
                              key={theme}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => updateSetting('theme', theme)}
                              className={`p-4 rounded-xl border-2 text-sm capitalize font-medium transition-all ${
                                localSettings.theme === theme
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg transform scale-105'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {themeLabels[theme]}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">{t.accessibility.fontSize}</label>
                        <div className="grid grid-cols-4 gap-3">
                          {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                            <motion.button
                              key={size}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => updateSetting('fontSize', size)}
                              className={`p-3 rounded-xl border-2 text-xs capitalize font-medium transition-all ${
                                localSettings.fontSize === size
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg transform scale-105'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {fontSizeLabels[size]}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div>
                          <span className="text-sm font-semibold text-gray-700">{t.accessibility.dyslexiaFont}</span>
                          <p className="text-xs text-gray-500 mt-1">{t.accessibility.dyslexiaFontDesc}</p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateSetting('dyslexiaFriendlyFont', !localSettings.dyslexiaFriendlyFont)}
                          className={`w-14 h-7 rounded-full transition-colors shadow-inner ${
                            localSettings.dyslexiaFriendlyFont ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <motion.div
                            animate={{
                              x: localSettings.dyslexiaFriendlyFont ? 28 : 2
                            }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="w-6 h-6 bg-white rounded-full shadow-lg"
                          />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Motor Settings */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="mr-2">🖱️</span> {t.accessibility.sections.motor}
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div>
                          <span className="text-sm font-semibold text-gray-700">{t.accessibility.largerTargets}</span>
                          <p className="text-xs text-gray-500 mt-1">{t.accessibility.largerTargetsDesc}</p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateSetting('largerClickTargets', !localSettings.largerClickTargets)}
                          className={`w-14 h-7 rounded-full transition-colors shadow-inner ${
                            localSettings.largerClickTargets ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <motion.div
                            animate={{
                              x: localSettings.largerClickTargets ? 28 : 2
                            }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="w-6 h-6 bg-white rounded-full shadow-lg"
                          />
                        </motion.button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div>
                          <span className="text-sm font-semibold text-gray-700">{t.accessibility.stickyButtons}</span>
                          <p className="text-xs text-gray-500 mt-1">{t.accessibility.stickyButtonsDesc}</p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateSetting('stickyButtons', !localSettings.stickyButtons)}
                          className={`w-14 h-7 rounded-full transition-colors shadow-inner ${
                            localSettings.stickyButtons ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <motion.div
                            animate={{
                              x: localSettings.stickyButtons ? 28 : 2
                            }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="w-6 h-6 bg-white rounded-full shadow-lg"
                          />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Cognitive Settings */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="mr-2">🧠</span> {t.accessibility.sections.cognitive}
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div>
                          <span className="text-sm font-semibold text-gray-700">{t.accessibility.simplifiedUI}</span>
                          <p className="text-xs text-gray-500 mt-1">{t.accessibility.simplifiedUIDesc}</p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateSetting('simplifiedUI', !localSettings.simplifiedUI)}
                          className={`w-14 h-7 rounded-full transition-colors shadow-inner ${
                            localSettings.simplifiedUI ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <motion.div
                            animate={{
                              x: localSettings.simplifiedUI ? 28 : 2
                            }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="w-6 h-6 bg-white rounded-full shadow-lg"
                          />
                        </motion.button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div>
                          <span className="text-sm font-semibold text-gray-700">{t.accessibility.extendedTimeouts}</span>
                          <p className="text-xs text-gray-500 mt-1">{t.accessibility.extendedTimeoutsDesc}</p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateSetting('extendedTimeouts', !localSettings.extendedTimeouts)}
                          className={`w-14 h-7 rounded-full transition-colors shadow-inner ${
                            localSettings.extendedTimeouts ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <motion.div
                            animate={{
                              x: localSettings.extendedTimeouts ? 28 : 2
                            }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="w-6 h-6 bg-white rounded-full shadow-lg"
                          />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Audio Settings */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="mr-2">🔊</span> {t.accessibility.sections.audio}
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Sound Effects</span>
                          <p className="text-xs text-gray-500 mt-1">Enable audio feedback and sound effects</p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateSetting('soundEnabled', !localSettings.soundEnabled)}
                          className={`w-14 h-7 rounded-full transition-colors shadow-inner ${
                            localSettings.soundEnabled ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <motion.div
                            animate={{
                              x: localSettings.soundEnabled ? 28 : 2
                            }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="w-6 h-6 bg-white rounded-full shadow-lg"
                          />
                        </motion.button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Screen Reader Support</span>
                          <p className="text-xs text-gray-500 mt-1">Enhanced compatibility with screen reading software</p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateSetting('screenReaderSupport', !localSettings.screenReaderSupport)}
                          className={`w-14 h-7 rounded-full transition-colors shadow-inner ${
                            localSettings.screenReaderSupport ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <motion.div
                            animate={{
                              x: localSettings.screenReaderSupport ? 28 : 2
                            }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="w-6 h-6 bg-white rounded-full shadow-lg"
                          />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <Button onClick={onClose} size="lg" className="px-12 shadow-xl">
                    ✅ {t.accessibility.done}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
