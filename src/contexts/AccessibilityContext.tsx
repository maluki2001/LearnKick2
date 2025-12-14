'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AccessibilitySettings, DEFAULT_ACCESSIBILITY_SETTINGS, THEME_CONFIGS, FONT_SIZE_CLASSES, DYSLEXIA_FRIENDLY_FONTS } from '@/types/accessibility'
import { offlineStorage } from '@/lib/offlineStorage'

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => Promise<void>
  resetSettings: () => Promise<void>
  isLoading: boolean
  
  // Computed styles based on settings
  getThemeClasses: () => typeof THEME_CONFIGS.light
  getFontClass: () => string
  getSizeClass: () => string
  getButtonSizeClass: () => string
  getAnimationClass: () => string
  getSpacingClass: () => string
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const preferences = await offlineStorage.getPreferences()
      
      if (preferences) {
        // Map stored preferences to accessibility settings
        const loadedSettings: AccessibilitySettings = {
          ...DEFAULT_ACCESSIBILITY_SETTINGS,
          theme: preferences.theme === 'high-contrast' ? 'high-contrast' : 
                preferences.theme === 'dark' ? 'dark' : 'light',
          dyslexiaFriendlyFont: preferences.dyslexiaFont,
          soundEnabled: preferences.soundEnabled
        }
        setSettings(loadedSettings)
        applySettings(loadedSettings)
      }
    } catch (error) {
      console.warn('Failed to load accessibility settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = async (newSettings: Partial<AccessibilitySettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    applySettings(updatedSettings)
    
    try {
      await offlineStorage.savePreferences({
        theme: updatedSettings.theme,
        dyslexiaFont: updatedSettings.dyslexiaFriendlyFont,
        soundEnabled: updatedSettings.soundEnabled,
        language: 'en',
        preferredSubjects: ['math'],
        gameMode: null,
        lastSubject: 'math',
        lastArena: 'soccer',
        lastQuestionLanguage: 'de',
        grade: 3
      })
      console.log('✅ Accessibility settings saved')
    } catch (error) {
      console.warn('Failed to save accessibility settings:', error)
    }
  }

  const resetSettings = async () => {
    setSettings(DEFAULT_ACCESSIBILITY_SETTINGS)
    applySettings(DEFAULT_ACCESSIBILITY_SETTINGS)
    
    try {
      await offlineStorage.savePreferences({
        theme: 'light',
        dyslexiaFont: false,
        soundEnabled: true,
        language: 'en',
        preferredSubjects: ['math'],
        gameMode: null,
        lastSubject: 'math',
        lastArena: 'soccer',
        lastQuestionLanguage: 'de',
        grade: 3
      })
    } catch (error) {
      console.warn('Failed to reset accessibility settings:', error)
    }
  }

  // Apply settings to the document
  const applySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement
    
    // Apply font family
    if (settings.dyslexiaFriendlyFont) {
      root.style.fontFamily = DYSLEXIA_FRIENDLY_FONTS[0].family
    } else {
      root.style.fontFamily = '' // Reset to default
    }
    
    // Apply font size
    const baseFontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px'
    }
    root.style.fontSize = baseFontSizes[settings.fontSize]
    
    // Apply line spacing
    if (settings.increasedLineSpacing) {
      root.style.lineHeight = '1.8'
    } else {
      root.style.lineHeight = '1.6'
    }
    
    // Apply animations preference
    if (settings.reducedAnimations) {
      root.style.setProperty('--animation-duration', '0s')
    } else {
      root.style.setProperty('--animation-duration', '0.2s')
    }
    
    // Apply focus styles
    if (settings.highlightFocus) {
      const style = document.getElementById('accessibility-focus-styles') || document.createElement('style')
      style.id = 'accessibility-focus-styles'
      style.textContent = `
        *:focus {
          outline: 3px solid #3B82F6 !important;
          outline-offset: 2px !important;
        }
      `
      document.head.appendChild(style)
    } else {
      const existingStyle = document.getElementById('accessibility-focus-styles')
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }

  const getThemeClasses = () => {
    return THEME_CONFIGS[settings.theme]
  }

  const getFontClass = () => {
    if (settings.dyslexiaFriendlyFont) {
      return 'font-mono' // Fallback class for dyslexia-friendly font
    }
    return ''
  }

  const getSizeClass = () => {
    return FONT_SIZE_CLASSES[settings.fontSize]
  }

  const getButtonSizeClass = () => {
    if (settings.largerClickTargets) {
      return 'px-6 py-4 text-lg min-h-[56px]'
    }
    return ''
  }

  const getAnimationClass = () => {
    if (settings.reducedAnimations) {
      return 'motion-reduce:animate-none motion-reduce:transition-none'
    }
    return ''
  }

  const getSpacingClass = () => {
    if (settings.increasedLineSpacing) {
      return 'leading-loose'
    }
    return 'leading-relaxed'
  }

  const contextValue: AccessibilityContextType = {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
    getThemeClasses,
    getFontClass,
    getSizeClass,
    getButtonSizeClass,
    getAnimationClass,
    getSpacingClass
  }

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

// Hook for applying accessibility classes to components
export function useAccessibilityClasses() {
  const { settings, getThemeClasses, getFontClass, getSizeClass, getButtonSizeClass, getAnimationClass, getSpacingClass } = useAccessibility()
  
  return {
    theme: getThemeClasses(),
    font: getFontClass(),
    size: getSizeClass(),
    button: getButtonSizeClass(),
    animation: getAnimationClass(),
    spacing: getSpacingClass(),
    settings
  }
}