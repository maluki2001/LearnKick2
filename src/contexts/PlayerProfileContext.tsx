'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { offlineStorage } from '@/lib/offlineStorage'
import { Player } from '@/types/game'

// Extended player profile with stats
export interface PlayerProfile extends Player {
  deviceId?: string
  totalGamesPlayed: number
  totalCorrectAnswers: number
  totalIncorrectAnswers: number
  bestStreak: number
  favoriteSubject: string
  lastPlayedAt: number
  totalWins: number
  accuracy: number
  email?: string
  emailVerified?: boolean
}

// Generate a unique device ID
function generateDeviceId(): string {
  // Create a unique ID based on crypto API
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(16)
    window.crypto.getRandomValues(array)
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
  }
  // Fallback for older browsers
  return 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
}

// Get or create device ID from localStorage
function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return ''

  const DEVICE_ID_KEY = 'learnkick_device_id'
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)

  if (!deviceId) {
    deviceId = generateDeviceId()
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
    console.log('🆔 Generated new device ID:', deviceId.substring(0, 8) + '...')
  } else {
    console.log('🆔 Using existing device ID:', deviceId.substring(0, 8) + '...')
  }

  return deviceId
}

// Game preferences for instant play
export interface GamePreferences {
  gameMode: 'school' | 'home' | null
  lastSubject: string
  lastArena: 'soccer' | 'hockey'
  lastQuestionLanguage: 'de' | 'en' | 'fr'
  grade: number
  uiLanguage: string
  playAgainstAI: boolean  // When true, BATTLE uses AI; when false, tries multiplayer first
}

interface PlayerProfileContextType {
  profile: PlayerProfile | null
  preferences: GamePreferences
  isLoading: boolean
  isReturningUser: boolean

  // Profile actions
  createProfile: (name: string, grade: number, mode: 'school' | 'home') => Promise<void>
  updateProfile: (updates: Partial<PlayerProfile>) => Promise<void>
  updatePreferences: (updates: Partial<GamePreferences>) => Promise<void>
  recordGameResult: (result: {
    won: boolean
    correctAnswers: number
    totalQuestions: number
    streak: number
    subject: string
    eloChange: number
  }) => Promise<void>
  clearProfile: () => Promise<void>

  // Email linking
  requestEmailVerification: (email: string) => Promise<{ success: boolean; error?: string }>
  verifyEmailCode: (email: string, code: string) => Promise<{ success: boolean; error?: string }>
  loginWithEmail: (email: string) => Promise<{ success: boolean; error?: string }>
  verifyLoginCode: (email: string, code: string) => Promise<{ success: boolean; error?: string }>
}

const PlayerProfileContext = createContext<PlayerProfileContextType | undefined>(undefined)

const DEFAULT_PREFERENCES: GamePreferences = {
  gameMode: null,
  lastSubject: 'math',
  lastArena: 'soccer',
  lastQuestionLanguage: 'de',
  grade: 3,
  uiLanguage: 'de',
  playAgainstAI: false  // Default to multiplayer, fallback to AI if no opponent
}

export function PlayerProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [preferences, setPreferences] = useState<GamePreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(true)
  const [isReturningUser, setIsReturningUser] = useState(false)

  // Load profile and preferences on mount with timeout fallback
  useEffect(() => {
    // Safety timeout - if loading takes more than 3 seconds, stop loading
    const timeoutId = setTimeout(() => {
      console.log('⏱️ Loading timeout reached, stopping loading state')
      setIsLoading(false)
    }, 3000)

    loadProfileAndPreferences().finally(() => {
      clearTimeout(timeoutId)
    })

    return () => clearTimeout(timeoutId)
  }, [])

  const loadProfileAndPreferences = async () => {
    console.log('🔄 Starting to load profile and preferences...')
    try {
      setIsLoading(true)

      // Get device ID
      const deviceId = getOrCreateDeviceId()
      if (!deviceId) {
        console.log('⚠️ No device ID available (SSR?)')
        setIsLoading(false)
        return
      }

      // Try to load from server first (if online)
      let serverProfile: PlayerProfile | null = null
      if (navigator.onLine) {
        console.log('🌐 Trying to fetch profile from server...')
        try {
          const response = await fetch(`/api/player?deviceId=${encodeURIComponent(deviceId)}`)
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.exists && result.player) {
              console.log('✅ Found profile on server:', result.player.name)
              serverProfile = {
                id: result.player.id,
                deviceId: result.player.deviceId,
                name: result.player.name,
                elo: result.player.elo,
                totalGamesPlayed: result.player.totalGamesPlayed,
                totalCorrectAnswers: result.player.totalCorrectAnswers,
                totalIncorrectAnswers: result.player.totalIncorrectAnswers,
                bestStreak: result.player.bestStreak,
                favoriteSubject: result.player.favoriteSubject,
                lastPlayedAt: result.player.lastPlayedAt ? new Date(result.player.lastPlayedAt).getTime() : Date.now(),
                totalWins: result.player.totalWins,
                accuracy: result.player.accuracy
              }

              // Update preferences from server
              setPreferences({
                gameMode: result.player.gameMode || null,
                lastSubject: result.player.favoriteSubject || 'math',
                lastArena: result.player.preferredArena || 'soccer',
                lastQuestionLanguage: result.player.questionLanguage || 'de',
                grade: result.player.grade || 3,
                uiLanguage: result.player.uiLanguage || 'de'
              })

              // Sync to IndexedDB for offline access
              console.log('💾 Syncing server profile to IndexedDB...')
              await offlineStorage.savePlayerProfile({
                id: serverProfile.id,
                name: serverProfile.name,
                elo: serverProfile.elo,
                totalGamesPlayed: serverProfile.totalGamesPlayed,
                totalCorrectAnswers: serverProfile.totalCorrectAnswers,
                totalIncorrectAnswers: serverProfile.totalIncorrectAnswers,
                bestStreak: serverProfile.bestStreak,
                favoriteSubject: serverProfile.favoriteSubject,
                lastPlayedAt: serverProfile.lastPlayedAt
              })
            } else {
              console.log('📭 No profile found on server for this device')
            }
          }
        } catch (error) {
          console.log('⚠️ Could not reach server, will try local storage:', error)
        }
      }

      // If we got profile from server, use it
      if (serverProfile) {
        setProfile(serverProfile)
        setIsReturningUser(true)
        console.log('✅ Loaded returning player from server:', serverProfile.name)
        return
      }

      // Fall back to IndexedDB (offline or server unavailable)
      console.log('👤 Loading player profile from IndexedDB...')
      const storedProfile = await Promise.race([
        offlineStorage.getPlayerProfile('main-player'),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
      ])
      console.log('👤 Profile loaded:', storedProfile ? storedProfile.name : 'none')

      if (storedProfile) {
        // Calculate accuracy
        const totalAnswers = storedProfile.totalCorrectAnswers + storedProfile.totalIncorrectAnswers
        const accuracy = totalAnswers > 0
          ? (storedProfile.totalCorrectAnswers / totalAnswers) * 100
          : 0

        // Get wins from game history with timeout
        console.log('📊 Loading game history...')
        const gameHistory = await Promise.race([
          offlineStorage.getGameHistory({ limit: 100 }),
          new Promise<[]>((resolve) => setTimeout(() => resolve([]), 2000))
        ])
        const totalWins = gameHistory.filter(g => g.score > 0).length

        setProfile({
          ...storedProfile,
          deviceId,
          accuracy,
          totalWins
        })
        setIsReturningUser(true)
        console.log('✅ Loaded returning player from IndexedDB:', storedProfile.name)
      }

      // Load preferences with timeout
      console.log('⚙️ Loading preferences...')
      const storedPrefs = await Promise.race([
        offlineStorage.getPreferences(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
      ])
      console.log('⚙️ Preferences loaded:', storedPrefs ? 'yes' : 'using defaults')

      if (storedPrefs) {
        setPreferences({
          gameMode: storedPrefs.gameMode || null,
          lastSubject: storedPrefs.lastSubject || 'math',
          lastArena: storedPrefs.lastArena || 'soccer',
          lastQuestionLanguage: storedPrefs.lastQuestionLanguage || 'de',
          grade: storedPrefs.grade || 3,
          uiLanguage: storedPrefs.language || 'de'
        })
      }
      console.log('✅ Profile loading complete')
    } catch (error) {
      console.error('❌ Failed to load profile:', error)
    } finally {
      console.log('🏁 Setting isLoading to false')
      setIsLoading(false)
    }
  }

  const createProfile = useCallback(async (name: string, grade: number, mode: 'school' | 'home') => {
    console.log('📝 createProfile called:', { name, grade, mode })

    // Get device ID
    const deviceId = getOrCreateDeviceId()
    if (!deviceId) {
      console.error('❌ Could not get device ID')
      throw new Error('Could not generate device ID')
    }

    const baseElo = 800 + (grade * 200)

    const newProfile: PlayerProfile = {
      id: 'main-player',
      deviceId,
      name,
      elo: baseElo,
      totalGamesPlayed: 0,
      totalCorrectAnswers: 0,
      totalIncorrectAnswers: 0,
      bestStreak: 0,
      favoriteSubject: 'math',
      lastPlayedAt: Date.now(),
      totalWins: 0,
      accuracy: 0
    }

    const newPreferences: GamePreferences = {
      ...preferences,
      gameMode: mode,
      grade
    }

    try {
      // Save to server FIRST (if online)
      if (navigator.onLine) {
        console.log('🌐 Saving profile to server...')
        try {
          const response = await fetch('/api/player', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deviceId,
              name,
              grade,
              gameMode: mode,
              uiLanguage: preferences.uiLanguage || 'de',
              questionLanguage: preferences.lastQuestionLanguage || 'de',
              preferredArena: preferences.lastArena || 'soccer'
            })
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success && result.player) {
              console.log('✅ Profile saved to server:', result.player.name)
              // Update newProfile with server-generated ID
              newProfile.id = result.player.id
              newProfile.elo = result.player.elo
            }
          } else {
            console.log('⚠️ Server returned error, will use local storage')
          }
        } catch (error) {
          console.log('⚠️ Could not save to server, will use local storage:', error)
        }
      } else {
        console.log('📴 Offline - saving to local storage only')
      }

      // Save to IndexedDB as backup
      console.log('💾 Saving player profile to IndexedDB...')
      await offlineStorage.savePlayerProfile({
        id: newProfile.id,
        name: newProfile.name,
        elo: newProfile.elo,
        totalGamesPlayed: 0,
        totalCorrectAnswers: 0,
        totalIncorrectAnswers: 0,
        bestStreak: 0,
        favoriteSubject: 'math',
        lastPlayedAt: Date.now()
      })
      console.log('✅ Player profile saved to IndexedDB')

      // Save preferences
      console.log('💾 Saving preferences...')
      const currentPrefs = await offlineStorage.getPreferences()
      console.log('📋 Current prefs:', currentPrefs)

      // Default values for all required fields
      const defaultStoragePrefs = {
        theme: 'light' as const,
        dyslexiaFont: false,
        soundEnabled: true,
        language: 'de',
        preferredSubjects: ['math'],
        gameMode: null as 'school' | 'home' | null,
        lastSubject: 'math',
        lastArena: 'soccer' as const,
        lastQuestionLanguage: 'de' as const,
        grade: 3
      }

      await offlineStorage.savePreferences({
        ...defaultStoragePrefs,
        ...(currentPrefs || {}),
        gameMode: mode,
        grade,
        lastSubject: 'math',
        lastArena: 'soccer',
        lastQuestionLanguage: 'de'
      })
      console.log('✅ Preferences saved')

      console.log('🔄 Updating React state...')
      setProfile(newProfile)
      setPreferences(newPreferences)
      setIsReturningUser(true)

      console.log('✅ Created new player profile:', name)
    } catch (error) {
      console.error('❌ Failed to create profile:', error)
      throw error
    }
  }, [preferences])

  const updateProfile = useCallback(async (updates: Partial<PlayerProfile>) => {
    if (!profile) return

    const updatedProfile = { ...profile, ...updates }
    setProfile(updatedProfile)

    try {
      await offlineStorage.savePlayerProfile({
        id: updatedProfile.id,
        name: updatedProfile.name,
        elo: updatedProfile.elo,
        totalGamesPlayed: updatedProfile.totalGamesPlayed,
        totalCorrectAnswers: updatedProfile.totalCorrectAnswers,
        totalIncorrectAnswers: updatedProfile.totalIncorrectAnswers,
        bestStreak: updatedProfile.bestStreak,
        favoriteSubject: updatedProfile.favoriteSubject,
        lastPlayedAt: Date.now()
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }, [profile])

  const updatePreferences = useCallback(async (updates: Partial<GamePreferences>) => {
    console.log('🔄 updatePreferences called with:', updates)
    const updatedPrefs = { ...preferences, ...updates }
    console.log('🔄 Setting preferences to:', updatedPrefs)
    setPreferences(updatedPrefs)

    try {
      const currentPrefs = await offlineStorage.getPreferences()

      // Default values for all required fields
      const defaultStoragePrefs = {
        theme: 'light' as const,
        dyslexiaFont: false,
        soundEnabled: true,
        language: 'de',
        preferredSubjects: ['math'],
        gameMode: null as 'school' | 'home' | null,
        lastSubject: 'math',
        lastArena: 'soccer' as const,
        lastQuestionLanguage: 'de' as const,
        grade: 3
      }

      // Build the preferences object: defaults → existing prefs → updated values
      const prefsToSave = {
        ...defaultStoragePrefs,
        ...(currentPrefs || {}),
        // Apply the updated game preferences
        gameMode: updatedPrefs.gameMode,
        lastSubject: updatedPrefs.lastSubject,
        lastArena: updatedPrefs.lastArena,
        lastQuestionLanguage: updatedPrefs.lastQuestionLanguage,
        grade: updatedPrefs.grade,
        language: updatedPrefs.uiLanguage
      }

      await offlineStorage.savePreferences(prefsToSave)
      console.log('✅ Preferences saved to IndexedDB')
    } catch (error) {
      console.error('Failed to update preferences:', error)
    }
  }, [preferences])

  const recordGameResult = useCallback(async (result: {
    won: boolean
    correctAnswers: number
    totalQuestions: number
    streak: number
    subject: string
    eloChange: number
  }) => {
    if (!profile) return

    const updatedProfile: PlayerProfile = {
      ...profile,
      totalGamesPlayed: profile.totalGamesPlayed + 1,
      totalCorrectAnswers: profile.totalCorrectAnswers + result.correctAnswers,
      totalIncorrectAnswers: profile.totalIncorrectAnswers + (result.totalQuestions - result.correctAnswers),
      bestStreak: Math.max(profile.bestStreak, result.streak),
      elo: profile.elo + result.eloChange,
      totalWins: result.won ? profile.totalWins + 1 : profile.totalWins,
      lastPlayedAt: Date.now()
    }

    // Recalculate accuracy
    const totalAnswers = updatedProfile.totalCorrectAnswers + updatedProfile.totalIncorrectAnswers
    updatedProfile.accuracy = totalAnswers > 0
      ? (updatedProfile.totalCorrectAnswers / totalAnswers) * 100
      : 0

    // Sync game result to server (if online)
    const deviceId = profile.deviceId || getOrCreateDeviceId()
    if (navigator.onLine && deviceId) {
      console.log('🌐 Syncing game result to server...')
      try {
        await fetch('/api/player', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId,
            action: 'recordGame',
            won: result.won,
            correctAnswers: result.correctAnswers,
            totalQuestions: result.totalQuestions,
            streak: result.streak,
            subject: result.subject,
            eloChange: result.eloChange
          })
        })
        console.log('✅ Game result synced to server')
      } catch (error) {
        console.log('⚠️ Could not sync game result to server:', error)
      }
    }

    await updateProfile(updatedProfile)

    // Also save to game history
    try {
      await offlineStorage.saveGameHistory({
        id: `game-${Date.now()}`,
        playedAt: Date.now(),
        score: result.won ? 1 : 0,
        accuracy: (result.correctAnswers / result.totalQuestions) * 100,
        subject: result.subject,
        grade: preferences.grade,
        duration: 60,
        questionsAnswered: result.totalQuestions
      })
    } catch (error) {
      console.error('Failed to save game history:', error)
    }
  }, [profile, preferences.grade, updateProfile])

  // Email linking functions
  const requestEmailVerification = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    const deviceId = profile?.deviceId || getOrCreateDeviceId()
    if (!deviceId) {
      return { success: false, error: 'No device ID available' }
    }

    try {
      const response = await fetch('/api/player/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, deviceId, purpose: 'link' })
      })

      const result = await response.json()
      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to send verification code' }
      }

      console.log('Verification code sent to:', email)
      return { success: true }
    } catch (error) {
      console.error('Failed to request email verification:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }, [profile?.deviceId])

  const verifyEmailCode = useCallback(async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    const deviceId = profile?.deviceId || getOrCreateDeviceId()

    try {
      const response = await fetch('/api/player/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, deviceId, purpose: 'link' })
      })

      const result = await response.json()
      if (!response.ok) {
        return { success: false, error: result.error || 'Invalid verification code' }
      }

      // Update local profile with email
      if (profile) {
        setProfile({ ...profile, email, emailVerified: true })
      }

      console.log('Email verified successfully:', email)
      return { success: true }
    } catch (error) {
      console.error('Failed to verify email code:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }, [profile])

  const loginWithEmail = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/player/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'login' })
      })

      const result = await response.json()
      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to send login code' }
      }

      console.log('Login code sent to:', email)
      return { success: true }
    } catch (error) {
      console.error('Failed to request login code:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }, [])

  const verifyLoginCode = useCallback(async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    const deviceId = getOrCreateDeviceId()
    if (!deviceId) {
      return { success: false, error: 'No device ID available' }
    }

    try {
      const response = await fetch('/api/player/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, deviceId, purpose: 'login' })
      })

      const result = await response.json()
      if (!response.ok) {
        return { success: false, error: result.error || 'Invalid login code' }
      }

      // Load the player profile from response
      if (result.player) {
        const loadedProfile: PlayerProfile = {
          id: result.player.id,
          deviceId: result.player.deviceId,
          name: result.player.name,
          elo: result.player.elo,
          totalGamesPlayed: result.player.totalGamesPlayed,
          totalCorrectAnswers: result.player.totalCorrectAnswers,
          totalIncorrectAnswers: result.player.totalIncorrectAnswers,
          bestStreak: result.player.bestStreak,
          favoriteSubject: result.player.favoriteSubject,
          lastPlayedAt: result.player.lastPlayedAt ? new Date(result.player.lastPlayedAt).getTime() : Date.now(),
          totalWins: result.player.totalWins,
          accuracy: result.player.accuracy,
          email: result.player.email,
          emailVerified: result.player.emailVerified
        }

        setProfile(loadedProfile)
        setIsReturningUser(true)

        // Update preferences from player data
        setPreferences(prev => ({
          ...prev,
          gameMode: result.player.gameMode || null,
          grade: result.player.grade || 3,
          uiLanguage: result.player.uiLanguage || 'de',
          lastQuestionLanguage: result.player.questionLanguage || 'de',
          lastArena: result.player.preferredArena || 'soccer'
        }))

        // Also save to IndexedDB for offline
        await offlineStorage.savePlayerProfile({
          id: loadedProfile.id,
          name: loadedProfile.name,
          elo: loadedProfile.elo,
          totalGamesPlayed: loadedProfile.totalGamesPlayed,
          totalCorrectAnswers: loadedProfile.totalCorrectAnswers,
          totalIncorrectAnswers: loadedProfile.totalIncorrectAnswers,
          bestStreak: loadedProfile.bestStreak,
          favoriteSubject: loadedProfile.favoriteSubject,
          lastPlayedAt: loadedProfile.lastPlayedAt
        })

        console.log('Logged in as:', loadedProfile.name)
      }

      return { success: true }
    } catch (error) {
      console.error('Failed to verify login code:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }, [])

  const clearProfile = useCallback(async () => {
    try {
      await offlineStorage.clearAllData()
      setProfile(null)
      setPreferences(DEFAULT_PREFERENCES)
      setIsReturningUser(false)
    } catch (error) {
      console.error('Failed to clear profile:', error)
    }
  }, [])

  const contextValue: PlayerProfileContextType = {
    profile,
    preferences,
    isLoading,
    isReturningUser,
    createProfile,
    updateProfile,
    updatePreferences,
    recordGameResult,
    clearProfile,
    requestEmailVerification,
    verifyEmailCode,
    loginWithEmail,
    verifyLoginCode
  }

  return (
    <PlayerProfileContext.Provider value={contextValue}>
      {children}
    </PlayerProfileContext.Provider>
  )
}

export function usePlayerProfile() {
  const context = useContext(PlayerProfileContext)
  if (context === undefined) {
    throw new Error('usePlayerProfile must be used within a PlayerProfileProvider')
  }
  return context
}
