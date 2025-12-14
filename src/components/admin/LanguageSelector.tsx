'use client'

import { useState } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import { AdminLanguage, useAdminTranslation } from '@/lib/adminTranslations'

interface LanguageSelectorProps {
  currentLanguage: AdminLanguage
  onLanguageChange: (language: AdminLanguage) => void
  className?: string
}

export function LanguageSelector({ currentLanguage, onLanguageChange, className = '' }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  useAdminTranslation(currentLanguage) // Hook for potential future use

  const languages: { code: AdminLanguage; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'sq', name: 'Shqip', flag: '🇦🇱' }
  ]

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

  const handleLanguageSelect = (language: AdminLanguage) => {
    onLanguageChange(language)
    setIsOpen(false)
    // Store in localStorage for persistence
    localStorage.setItem('admin-language', language)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-background border border-border hover:border-muted-foreground transition-colors shadow-sm"
      >
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-sm font-medium text-foreground hidden md:inline">
          {currentLang.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-popover rounded-lg shadow-lg border border-border z-50">
          <div className="py-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left hover:bg-accent transition-colors ${
                  currentLanguage === language.code ? 'bg-primary/10 text-primary' : 'text-popover-foreground'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
                {currentLanguage === language.code && (
                  <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}