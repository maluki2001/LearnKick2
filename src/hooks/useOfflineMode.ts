'use client'

import { useState, useEffect, useCallback } from 'react'
import { offlineStorage } from '@/lib/offlineStorage'
import { Question } from '@/types/questions'

interface OfflineStatus {
  isOnline: boolean
  isServiceWorkerActive: boolean
  cachedQuestionsCount: number
  lastSyncTime: Date | null
  storageUsed: number
}

interface UseOfflineModeReturn {
  status: OfflineStatus
  isReady: boolean
  downloadQuestionsForOffline: (
    grade: number,
    language: string,
    subject?: string
  ) => Promise<{ success: boolean; count: number; error?: string }>
  getCachedQuestions: (filter?: {
    grade?: number
    language?: string
    subject?: string
    limit?: number
  }) => Promise<Question[]>
  clearOfflineData: () => Promise<void>
  refreshStatus: () => Promise<void>
}

export function useOfflineMode(): UseOfflineModeReturn {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: true,
    isServiceWorkerActive: false,
    cachedQuestionsCount: 0,
    lastSyncTime: null,
    storageUsed: 0
  })
  const [isReady, setIsReady] = useState(false)

  // Refresh offline status
  const refreshStatus = useCallback(async () => {
    if (typeof window === 'undefined') return

    try {
      // Check online status
      const isOnline = navigator.onLine

      // Check service worker status
      let isServiceWorkerActive = false
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        isServiceWorkerActive = !!registration?.active
      }

      // Get storage stats
      const stats = await offlineStorage.getStorageStats()

      // Get preferences for last sync time
      const prefs = await offlineStorage.getPreferences()

      setStatus({
        isOnline,
        isServiceWorkerActive,
        cachedQuestionsCount: stats.questionsCount,
        lastSyncTime: prefs?.cacheVersion ? new Date() : null,
        storageUsed: stats.storageUsed
      })
    } catch (error) {
      console.error('Failed to refresh offline status:', error)
    }
  }, [])

  // Initialize and register service worker
  useEffect(() => {
    if (typeof window === 'undefined') return

    const init = async () => {
      // Register service worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          })
          console.log('Service Worker registered:', registration.scope)
        } catch (error) {
          console.error('Service Worker registration failed:', error)
        }
      }

      // Initialize offline storage
      await offlineStorage.initialize()

      // Refresh status
      await refreshStatus()

      setIsReady(true)
    }

    init()

    // Listen for online/offline events
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }))
    }
    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [refreshStatus])

  // Download questions for offline use
  const downloadQuestionsForOffline = useCallback(async (
    grade: number,
    language: string,
    subject?: string
  ): Promise<{ success: boolean; count: number; error?: string }> => {
    if (!status.isOnline) {
      return { success: false, count: 0, error: 'No internet connection' }
    }

    try {
      console.log('Downloading questions for offline...', { grade, language, subject })

      // Build query params
      const params = new URLSearchParams()
      params.append('grade', grade.toString())
      params.append('language', language)
      if (subject && subject !== 'all') {
        params.append('subject', subject)
      }

      // Fetch questions from API
      const response = await fetch(`/api/questions?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch questions from server')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch questions')
      }

      const questions: Question[] = result.questions || []

      if (questions.length === 0) {
        return { success: true, count: 0, error: 'No questions available for this selection' }
      }

      // Convert API response to Question format and cache
      const formattedQuestions: Question[] = questions.map((q: Record<string, unknown>) => ({
        id: q.id as string,
        type: q.type as Question['type'],
        subject: q.subject as string,
        grade: q.grade as number,
        difficulty: q.difficulty as number,
        language: q.language as string,
        question: q.question as string | undefined,
        statement: q.statement as string | undefined,
        answers: (q.answers || []) as string[],
        correctIndex: typeof q.correct_index === 'number' ? q.correct_index : 0,
        correctAnswer: q.correct_answer as string | number | undefined,
        correct: q.type === 'true-false'
          ? ['true', 'wahr', 'richtig', 'vrai'].includes(String(q.correct_answer).toLowerCase())
          : undefined,
        explanation: q.explanation as string | undefined,
        tags: (q.tags || []) as string[],
        timeLimit: (q.time_limit || 15000) as number
      }))

      // Get existing cached questions and merge
      const existingQuestions = await offlineStorage.getAllQuestions()
      const existingIds = new Set(existingQuestions.map(q => q.id))

      // Add only new questions
      const newQuestions = formattedQuestions.filter(q => !existingIds.has(q.id))
      const allQuestions = [...existingQuestions, ...newQuestions]

      // Cache all questions
      await offlineStorage.cacheQuestions(allQuestions)

      console.log(`Downloaded ${newQuestions.length} new questions (total: ${allQuestions.length})`)

      // Refresh status
      await refreshStatus()

      return { success: true, count: newQuestions.length }
    } catch (error) {
      console.error('Failed to download questions:', error)
      return {
        success: false,
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }, [status.isOnline, refreshStatus])

  // Get cached questions
  const getCachedQuestions = useCallback(async (filter?: {
    grade?: number
    language?: string
    subject?: string
    limit?: number
  }): Promise<Question[]> => {
    try {
      return await offlineStorage.getCachedQuestions(filter)
    } catch (error) {
      console.error('Failed to get cached questions:', error)
      return []
    }
  }, [])

  // Clear offline data
  const clearOfflineData = useCallback(async () => {
    try {
      await offlineStorage.clearAllData()
      await refreshStatus()
    } catch (error) {
      console.error('Failed to clear offline data:', error)
    }
  }, [refreshStatus])

  return {
    status,
    isReady,
    downloadQuestionsForOffline,
    getCachedQuestions,
    clearOfflineData,
    refreshStatus
  }
}
