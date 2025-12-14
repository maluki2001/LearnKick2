'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AdminLanguage, useAdminTranslation } from '@/lib/adminTranslations'

interface AdminLanguageContextType {
  language: AdminLanguage
  setLanguage: (language: AdminLanguage) => void
  t: ReturnType<typeof useAdminTranslation>['t']
}

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined)

interface AdminLanguageProviderProps {
  children: ReactNode
  defaultLanguage?: AdminLanguage
}

export function AdminLanguageProvider({ children, defaultLanguage = 'en' }: AdminLanguageProviderProps) {
  const [language, setLanguageState] = useState<AdminLanguage>(defaultLanguage)
  const { t } = useAdminTranslation(language)

  // Load saved language on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('admin-language') as AdminLanguage
      if (savedLanguage && ['en', 'de', 'fr', 'sq'].includes(savedLanguage)) {
        setLanguageState(savedLanguage)
      }
    }
  }, [])

  const setLanguage = (newLanguage: AdminLanguage) => {
    setLanguageState(newLanguage)
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-language', newLanguage)
    }
  }

  return (
    <AdminLanguageContext.Provider 
      value={{
        language,
        setLanguage,
        t
      }}
    >
      {children}
    </AdminLanguageContext.Provider>
  )
}

export function useAdminLanguage() {
  const context = useContext(AdminLanguageContext)
  if (context === undefined) {
    throw new Error('useAdminLanguage must be used within an AdminLanguageProvider')
  }
  return context
}