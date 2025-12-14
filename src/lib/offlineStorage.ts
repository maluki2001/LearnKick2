import { Question } from '@/types/questions'
import { Player } from '@/types/game'

// Version tracking for cache invalidation
// Increment CACHE_VERSION when translations or content structure changes
export const CACHE_VERSION = '2.0.0'
export const MIN_SUPPORTED_VERSION = '2.0.0'

// Compare version strings (semver-like)
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0
    const p2 = parts2[i] || 0
    if (p1 > p2) return 1
    if (p1 < p2) return -1
  }
  return 0
}

// Check if cached version is still valid
export function isCacheVersionValid(cachedVersion: string | null | undefined): boolean {
  if (!cachedVersion) return false
  return compareVersions(cachedVersion, MIN_SUPPORTED_VERSION) >= 0
}

// IndexedDB database structure
interface OfflineData {
  questions: Question[]
  playerProfile: Player & {
    totalGamesPlayed: number
    totalCorrectAnswers: number
    totalIncorrectAnswers: number
    bestStreak: number
    favoriteSubject: string
    lastPlayedAt: number
  }
  gameHistory: Array<{
    id: string
    playedAt: number
    score: number
    accuracy: number
    subject: string
    grade: number
    duration: number
    questionsAnswered: number
  }>
  preferences: {
    theme: 'light' | 'dark' | 'high-contrast'
    dyslexiaFont: boolean
    soundEnabled: boolean
    language: string
    preferredSubjects: string[]
    // Game preferences for instant play
    gameMode: 'school' | 'home' | null
    lastSubject: string
    lastArena: 'soccer' | 'hockey'
    lastQuestionLanguage: 'de' | 'en' | 'fr'
    grade: number
    // Cache version tracking
    cacheVersion?: string
  }
}

// In-memory fallback storage when IndexedDB is unavailable
interface MemoryStorage {
  questions: Map<string, Question>
  playerProfile: Map<string, OfflineData['playerProfile']>
  gameHistory: OfflineData['gameHistory']
  preferences: OfflineData['preferences'] | null
}

export class OfflineStorageService {
  private db: IDBDatabase | null = null
  private readonly DB_NAME = 'LearnKickOffline'
  private readonly DB_VERSION = 1
  private initPromise: Promise<void> | null = null
  private initAttempted = false

  // In-memory fallback when IndexedDB fails
  private memoryStorage: MemoryStorage = {
    questions: new Map(),
    playerProfile: new Map(),
    gameHistory: [],
    preferences: null
  }
  private useMemoryFallback = false

  // Initialize IndexedDB with timeout and singleton pattern
  async initialize(): Promise<void> {
    // Skip initialization on server side
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      console.log('⚠️ IndexedDB not available (server-side or unsupported browser)')
      return Promise.resolve()
    }

    // Already initialized
    if (this.db) {
      return Promise.resolve()
    }

    // Already attempted and failed
    if (this.initAttempted && !this.db) {
      return Promise.resolve()
    }

    // If initialization is in progress, wait for it
    if (this.initPromise) {
      return this.initPromise
    }

    console.log('🔵 IndexedDB: Starting initialization...')
    this.initAttempted = true

    this.initPromise = this.doInitialize()

    try {
      await this.initPromise
    } finally {
      this.initPromise = null
    }
  }

  private async doInitialize(): Promise<void> {
    // First, try to delete any corrupted database
    try {
      // Try opening with a short timeout first
      const quickOpen = await this.tryQuickOpen()
      if (quickOpen) {
        this.db = quickOpen
        console.log('✅ IndexedDB initialized successfully (quick open)')
        return
      }
    } catch {
      console.log('🔵 Quick open failed, trying full initialization...')
    }

    // Try deleting and recreating
    try {
      console.log('🔵 Attempting to delete and recreate database...')
      await this.deleteDatabase()
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch {
      console.log('⚠️ Could not delete database, continuing...')
    }

    // Now try full initialization
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        console.log('⚠️ IndexedDB: Initialization timed out after 5 seconds')
        reject(new Error('IndexedDB initialization timed out'))
      }, 5000)
    })

    const initPromise = new Promise<void>((resolve, reject) => {
      try {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)

        request.onerror = () => {
          console.error('❌ Failed to open IndexedDB:', request.error)
          reject(request.error)
        }

        request.onsuccess = () => {
          this.db = request.result
          console.log('✅ IndexedDB initialized successfully')
          resolve()
        }

        request.onblocked = () => {
          console.warn('⚠️ IndexedDB: Database blocked, close other tabs')
        }

        request.onupgradeneeded = (event) => {
          console.log('🔵 IndexedDB: Upgrading schema...')
          const db = (event.target as IDBOpenDBRequest).result

          // Create object stores
          if (!db.objectStoreNames.contains('questions')) {
            const questionStore = db.createObjectStore('questions', { keyPath: 'id' })
            questionStore.createIndex('subject', 'subject', { unique: false })
            questionStore.createIndex('grade', 'grade', { unique: false })
            questionStore.createIndex('language', 'language', { unique: false })
            console.log('📚 Created questions store')
          }

          if (!db.objectStoreNames.contains('playerProfile')) {
            db.createObjectStore('playerProfile', { keyPath: 'id' })
            console.log('👤 Created player profile store')
          }

          if (!db.objectStoreNames.contains('gameHistory')) {
            const historyStore = db.createObjectStore('gameHistory', { keyPath: 'id' })
            historyStore.createIndex('playedAt', 'playedAt', { unique: false })
            historyStore.createIndex('subject', 'subject', { unique: false })
            console.log('📊 Created game history store')
          }

          if (!db.objectStoreNames.contains('preferences')) {
            db.createObjectStore('preferences', { keyPath: 'id' })
            console.log('⚙️ Created preferences store')
          }

          console.log('🔧 IndexedDB schema created/upgraded')
        }
      } catch (error) {
        console.error('❌ IndexedDB initialization exception:', error)
        reject(error)
      }
    })

    try {
      await Promise.race([initPromise, timeoutPromise])
    } catch (error) {
      console.error('❌ IndexedDB initialization failed:', error)
      // Enable memory fallback
      this.useMemoryFallback = true
      console.log('📦 Using in-memory storage fallback (data will not persist)')
    }
  }

  private tryQuickOpen(): Promise<IDBDatabase | null> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 2000)

      try {
        const request = indexedDB.open(this.DB_NAME)

        request.onerror = () => {
          clearTimeout(timeout)
          resolve(null)
        }

        request.onsuccess = () => {
          clearTimeout(timeout)
          // Check if all stores exist
          const db = request.result
          const stores = ['questions', 'playerProfile', 'gameHistory', 'preferences']
          const hasAllStores = stores.every(s => db.objectStoreNames.contains(s))
          if (hasAllStores) {
            resolve(db)
          } else {
            db.close()
            resolve(null)
          }
        }

        request.onupgradeneeded = () => {
          // Need schema upgrade, abort quick open
          clearTimeout(timeout)
          resolve(null)
        }
      } catch {
        clearTimeout(timeout)
        resolve(null)
      }
    })
  }

  private deleteDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => resolve(), 2000)

      try {
        const request = indexedDB.deleteDatabase(this.DB_NAME)
        request.onsuccess = () => {
          clearTimeout(timeout)
          console.log('🗑️ Old database deleted')
          resolve()
        }
        request.onerror = () => {
          clearTimeout(timeout)
          reject(request.error)
        }
        request.onblocked = () => {
          clearTimeout(timeout)
          console.warn('⚠️ Database deletion blocked')
          resolve()
        }
      } catch {
        clearTimeout(timeout)
        resolve()
      }
    })
  }

  // Check cache version and invalidate if outdated
  async checkAndInvalidateCache(): Promise<boolean> {
    if (!this.db) await this.initialize()
    if (!this.db) return false

    try {
      const prefs = await this.getPreferences()
      const cachedVersion = prefs?.cacheVersion

      if (!isCacheVersionValid(cachedVersion)) {
        console.log(`🔄 Cache version outdated (${cachedVersion || 'none'} < ${MIN_SUPPORTED_VERSION}), clearing cache...`)

        // Clear questions cache (translations/content may have changed)
        await this.clearQuestionsCache()

        // Update the cache version
        if (prefs) {
          await this.savePreferences({
            ...prefs,
            cacheVersion: CACHE_VERSION
          })
        }

        console.log(`✅ Cache invalidated and version updated to ${CACHE_VERSION}`)
        return true // Cache was invalidated
      }

      console.log(`✅ Cache version valid: ${cachedVersion}`)
      return false // Cache is still valid
    } catch (error) {
      console.error('Error checking cache version:', error)
      return false
    }
  }

  // Clear only questions cache (preserve user data)
  async clearQuestionsCache(): Promise<void> {
    if (!this.db) await this.initialize()
    if (!this.db) {
      console.log('⚠️ IndexedDB not available, skipping cache clear')
      return
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['questions'], 'readwrite')
      const store = transaction.objectStore('questions')
      const request = store.clear()

      request.onsuccess = () => {
        console.log('🗑️ Questions cache cleared')
        resolve()
      }

      request.onerror = () => {
        console.error('Failed to clear questions cache:', request.error)
        reject(request.error)
      }
    })
  }

  // Save/update a single question
  async saveQuestion(question: Question): Promise<void> {
    if (!this.db) await this.initialize()
    if (!this.db) {
      console.log('⚠️ IndexedDB not available, question not saved:', question.id)
      return
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['questions'], 'readwrite')
      const store = transaction.objectStore('questions')

      const request = store.put(question) // Use put to allow updates

      request.onsuccess = () => {
        console.log(`✅ Question saved: ${question.id}`)
        resolve()
      }

      request.onerror = () => {
        console.error('Failed to save question:', question.id, request.error)
        reject(request.error)
      }
    })
  }

  // Delete a single question
  async deleteQuestion(questionId: string): Promise<void> {
    if (!this.db) await this.initialize()
    if (!this.db) {
      console.log('⚠️ IndexedDB not available, question not deleted:', questionId)
      return
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['questions'], 'readwrite')
      const store = transaction.objectStore('questions')

      const request = store.delete(questionId)

      request.onsuccess = () => {
        console.log(`🗑️ Question deleted: ${questionId}`)
        resolve()
      }

      request.onerror = () => {
        console.error('Failed to delete question:', questionId, request.error)
        reject(request.error)
      }
    })
  }

  // Get a single question by ID
  async getQuestion(questionId: string): Promise<Question | null> {
    if (!this.db) await this.initialize()
    if (!this.db) {
      console.log('⚠️ IndexedDB not available, returning null for question:', questionId)
      return null
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['questions'], 'readonly')
      const store = transaction.objectStore('questions')

      const request = store.get(questionId)

      request.onsuccess = () => {
        const question = request.result || null
        if (question) {
          console.log(`📚 Retrieved question: ${question.id}`)
        }
        resolve(question)
      }

      request.onerror = () => {
        console.error('Failed to get question:', questionId, request.error)
        reject(request.error)
      }
    })
  }

  // Get all questions
  async getAllQuestions(): Promise<Question[]> {
    if (!this.db) await this.initialize()
    if (!this.db) {
      console.log('⚠️ IndexedDB not available, returning empty questions array')
      return []
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['questions'], 'readonly')
      const store = transaction.objectStore('questions')

      const request = store.getAll()

      request.onsuccess = () => {
        const questions = request.result || []
        console.log(`📚 Retrieved ${questions.length} questions`)
        resolve(questions)
      }

      request.onerror = () => {
        console.error('Failed to get all questions:', request.error)
        reject(request.error)
      }
    })
  }

  // Cache questions for offline use
  async cacheQuestions(questions: Question[]): Promise<void> {
    if (!this.db) await this.initialize()
    if (!this.db) {
      console.log('⚠️ IndexedDB not available, questions not cached')
      return
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['questions'], 'readwrite')
      const store = transaction.objectStore('questions')

      // Clear existing questions and add new ones
      const clearRequest = store.clear()
      
      clearRequest.onsuccess = () => {
        let completed = 0
        const total = questions.length

        if (total === 0) {
          resolve()
          return
        }

        questions.forEach(question => {
          const addRequest = store.add(question)
          
          addRequest.onsuccess = () => {
            completed++
            if (completed === total) {
              console.log(`✅ Cached ${total} questions offline`)
              resolve()
            }
          }
          
          addRequest.onerror = () => {
            console.error('Failed to cache question:', question.id, addRequest.error)
            reject(addRequest.error)
          }
        })
      }

      clearRequest.onerror = () => {
        reject(clearRequest.error)
      }
    })
  }

  // Get cached questions for offline play
  async getCachedQuestions(filter?: {
    subject?: string
    grade?: number
    language?: string
    limit?: number
  }): Promise<Question[]> {
    if (!this.db) await this.initialize()
    if (!this.db) {
      console.log('⚠️ IndexedDB not available, returning empty cached questions')
      return []
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['questions'], 'readonly')
      const store = transaction.objectStore('questions')

      let request: IDBRequest
      let questions: Question[] = []

      if (filter?.subject) {
        const index = store.index('subject')
        request = index.getAll(filter.subject)
      } else if (filter?.grade) {
        const index = store.index('grade')
        request = index.getAll(filter.grade)
      } else {
        request = store.getAll()
      }

      request.onsuccess = () => {
        questions = request.result || []

        // Apply additional filters
        if (filter) {
          questions = questions.filter(q => {
            return (!filter.grade || q.grade === filter.grade) &&
                   (!filter.language || q.language === filter.language) &&
                   (!filter.subject || q.subject === filter.subject)
          })
        }

        // Shuffle and limit results
        if (filter?.limit) {
          questions = this.shuffleArray(questions).slice(0, filter.limit)
        }

        console.log(`📚 Retrieved ${questions.length} cached questions`)
        resolve(questions)
      }

      request.onerror = () => {
        console.error('Failed to get cached questions:', request.error)
        reject(request.error)
      }
    })
  }

  // Save player profile with timeout and memory fallback
  async savePlayerProfile(player: OfflineData['playerProfile']): Promise<void> {
    console.log('🔵 savePlayerProfile: Starting...')

    if (!this.db && !this.useMemoryFallback) {
      console.log('🔵 savePlayerProfile: DB not ready, initializing...')
      await this.initialize()
    }

    // Use memory fallback if IndexedDB failed
    if (this.useMemoryFallback || !this.db) {
      console.log('📦 savePlayerProfile: Using memory storage')
      this.memoryStorage.playerProfile.set(player.id, player)
      console.log(`✅ Player profile saved to memory: ${player.name}`)
      return
    }

    console.log('🔵 savePlayerProfile: DB ready, creating transaction...')

    // Wrap in a timeout to prevent hanging
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        console.log('⚠️ savePlayerProfile: Operation timed out after 5 seconds')
        reject(new Error('IndexedDB operation timed out'))
      }, 5000)
    })

    const savePromise = new Promise<void>((resolve, reject) => {
      try {
        console.log('🔵 savePlayerProfile: Creating transaction...')
        const transaction = this.db!.transaction(['playerProfile'], 'readwrite')

        transaction.onerror = () => {
          console.error('❌ savePlayerProfile: Transaction error:', transaction.error)
          reject(transaction.error)
        }

        transaction.oncomplete = () => {
          console.log('🔵 savePlayerProfile: Transaction completed')
        }

        console.log('🔵 savePlayerProfile: Getting object store...')
        const store = transaction.objectStore('playerProfile')

        console.log('🔵 savePlayerProfile: Putting data...')
        const request = store.put(player)

        request.onsuccess = () => {
          console.log(`✅ Player profile saved: ${player.name} (ELO: ${player.elo})`)
          resolve()
        }

        request.onerror = () => {
          console.error('❌ savePlayerProfile: Request error:', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.error('❌ savePlayerProfile: Exception:', error)
        reject(error)
      }
    })

    try {
      await Promise.race([savePromise, timeoutPromise])
      console.log('🔵 savePlayerProfile: Done')
    } catch (error) {
      console.error('❌ savePlayerProfile: Failed with:', error)
      // Don't throw - just log and continue (profile won't persist but app will work)
    }
  }

  // Get player profile with memory fallback
  async getPlayerProfile(playerId: string): Promise<OfflineData['playerProfile'] | null> {
    if (!this.db && !this.useMemoryFallback) await this.initialize()

    // Use memory fallback if IndexedDB failed
    if (this.useMemoryFallback || !this.db) {
      const profile = this.memoryStorage.playerProfile.get(playerId) || null
      console.log(`📦 getPlayerProfile from memory: ${profile ? profile.name : 'none'}`)
      return profile
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['playerProfile'], 'readonly')
      const store = transaction.objectStore('playerProfile')

      const request = store.get(playerId)

      request.onsuccess = () => {
        const profile = request.result || null
        if (profile) {
          console.log(`👤 Retrieved player profile: ${profile.name}`)
        }
        resolve(profile)
      }

      request.onerror = () => {
        console.error('Failed to get player profile:', request.error)
        reject(request.error)
      }
    })
  }

  // Save game history with memory fallback
  async saveGameHistory(gameData: OfflineData['gameHistory'][0]): Promise<void> {
    if (!this.db && !this.useMemoryFallback) await this.initialize()

    // Use memory fallback if IndexedDB failed
    if (this.useMemoryFallback || !this.db) {
      console.log('📦 saveGameHistory: Using memory storage')
      this.memoryStorage.gameHistory.push(gameData)
      return
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameHistory'], 'readwrite')
      const store = transaction.objectStore('gameHistory')

      const request = store.add(gameData)

      request.onsuccess = () => {
        console.log(`📊 Game history saved: ${gameData.subject} (${gameData.accuracy}% accuracy)`)
        resolve()
      }

      request.onerror = () => {
        console.error('Failed to save game history:', request.error)
        reject(request.error)
      }
    })
  }

  // Get game history with optional filtering and memory fallback
  async getGameHistory(filter?: {
    subject?: string
    limit?: number
    fromDate?: number
  }): Promise<OfflineData['gameHistory']> {
    if (!this.db && !this.useMemoryFallback) await this.initialize()

    // Use memory fallback if IndexedDB failed
    if (this.useMemoryFallback || !this.db) {
      console.log('📦 getGameHistory: Using memory storage')
      let history = [...this.memoryStorage.gameHistory]

      // Apply filters
      if (filter?.subject) {
        history = history.filter(g => g.subject === filter.subject)
      }
      if (filter?.fromDate) {
        history = history.filter(g => g.playedAt >= filter.fromDate!)
      }

      // Sort by date (newest first)
      history.sort((a, b) => b.playedAt - a.playedAt)

      // Apply limit
      if (filter?.limit) {
        history = history.slice(0, filter.limit)
      }

      return history
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameHistory'], 'readonly')
      const store = transaction.objectStore('gameHistory')
      
      let request: IDBRequest
      
      if (filter?.subject) {
        const index = store.index('subject')
        request = index.getAll(filter.subject)
      } else {
        request = store.getAll()
      }

      request.onsuccess = () => {
        let history: OfflineData['gameHistory'] = request.result || []

        // Apply date filter
        if (filter?.fromDate) {
          history = history.filter((game: OfflineData['gameHistory'][0]) => game.playedAt >= filter.fromDate!)
        }

        // Sort by date (newest first)
        history.sort((a: OfflineData['gameHistory'][0], b: OfflineData['gameHistory'][0]) => b.playedAt - a.playedAt)

        // Apply limit
        if (filter?.limit) {
          history = history.slice(0, filter.limit)
        }

        console.log(`📊 Retrieved ${history.length} game history entries`)
        resolve(history)
      }

      request.onerror = () => {
        console.error('Failed to get game history:', request.error)
        reject(request.error)
      }
    })
  }

  // Save user preferences with timeout and memory fallback
  async savePreferences(preferences: OfflineData['preferences']): Promise<void> {
    console.log('🔵 savePreferences: Starting...')

    if (!this.db && !this.useMemoryFallback) {
      console.log('🔵 savePreferences: DB not ready, initializing...')
      await this.initialize()
    }

    // Use memory fallback if IndexedDB failed
    if (this.useMemoryFallback || !this.db) {
      console.log('📦 savePreferences: Using memory storage')
      this.memoryStorage.preferences = preferences
      console.log('✅ Preferences saved to memory')
      return
    }

    console.log('🔵 savePreferences: DB ready')

    // Wrap in a timeout to prevent hanging
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        console.log('⚠️ savePreferences: Operation timed out after 5 seconds')
        reject(new Error('IndexedDB operation timed out'))
      }, 5000)
    })

    const savePromise = new Promise<void>((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['preferences'], 'readwrite')
        const store = transaction.objectStore('preferences')

        const prefData = { id: 'user-preferences', ...preferences }
        const request = store.put(prefData)

        request.onsuccess = () => {
          console.log(`⚙️ Preferences saved: theme=${preferences.theme}, dyslexiaFont=${preferences.dyslexiaFont}`)
          resolve()
        }

        request.onerror = () => {
          console.error('❌ savePreferences: Request error:', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.error('❌ savePreferences: Exception:', error)
        reject(error)
      }
    })

    try {
      await Promise.race([savePromise, timeoutPromise])
      console.log('🔵 savePreferences: Done')
    } catch (error) {
      console.error('❌ savePreferences: Failed with:', error)
      // Don't throw - just log and continue
    }
  }

  // Get user preferences with timeout and memory fallback
  async getPreferences(): Promise<OfflineData['preferences'] | null> {
    console.log('🔵 getPreferences: Starting...')

    const defaultPrefs: OfflineData['preferences'] = {
      theme: 'light',
      dyslexiaFont: false,
      soundEnabled: true,
      language: 'de',
      preferredSubjects: ['math'],
      gameMode: null,
      lastSubject: 'math',
      lastArena: 'soccer',
      lastQuestionLanguage: 'de',
      grade: 3,
      cacheVersion: CACHE_VERSION
    }

    if (!this.db && !this.useMemoryFallback) await this.initialize()

    // Use memory fallback if IndexedDB failed
    if (this.useMemoryFallback || !this.db) {
      console.log('📦 getPreferences: Using memory storage')
      return this.memoryStorage.preferences || defaultPrefs
    }

    // Timeout after 3 seconds
    const timeoutPromise = new Promise<OfflineData['preferences']>((resolve) => {
      setTimeout(() => {
        console.log('⚠️ getPreferences: Operation timed out, returning defaults')
        resolve(defaultPrefs)
      }, 3000)
    })

    const getPromise = new Promise<OfflineData['preferences']>((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['preferences'], 'readonly')
        const store = transaction.objectStore('preferences')

        const request = store.get('user-preferences')

        request.onsuccess = () => {
          const prefs = request.result
          if (prefs) {
            const { id: _id, ...preferences } = prefs
            console.log(`⚙️ Retrieved preferences: theme=${preferences.theme}`)
            resolve(preferences as OfflineData['preferences'])
          } else {
            console.log('🔵 getPreferences: No prefs found, returning defaults')
            resolve(defaultPrefs)
          }
        }

        request.onerror = () => {
          console.error('❌ getPreferences: Request error:', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.error('❌ getPreferences: Exception:', error)
        reject(error)
      }
    })

    try {
      const result = await Promise.race([getPromise, timeoutPromise])
      console.log('🔵 getPreferences: Done')
      return result
    } catch (error) {
      console.error('❌ getPreferences: Failed, returning defaults:', error)
      return defaultPrefs
    }
  }

  // Check if we're offline
  isOffline(): boolean {
    // Safe check for server-side rendering
    if (typeof navigator === 'undefined') return false
    return !navigator.onLine
  }

  // Get storage stats
  async getStorageStats(): Promise<{
    questionsCount: number
    gameHistoryCount: number
    hasPlayerProfile: boolean
    storageUsed: number
  }> {
    if (!this.db) await this.initialize()

    const stats = {
      questionsCount: 0,
      gameHistoryCount: 0,
      hasPlayerProfile: false,
      storageUsed: 0
    }

    // Return early if db is still null after initialization
    if (!this.db) {
      console.warn('IndexedDB not available, returning default stats')
      return stats
    }

    try {
      // Count questions
      const questionsTx = this.db.transaction(['questions'], 'readonly')
      const questionsStore = questionsTx.objectStore('questions')
      const questionsCount = await new Promise<number>((resolve) => {
        const request = questionsStore.count()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => resolve(0)
      })

      // Count game history
      const historyTx = this.db!.transaction(['gameHistory'], 'readonly')
      const historyStore = historyTx.objectStore('gameHistory')
      const historyCount = await new Promise<number>((resolve) => {
        const request = historyStore.count()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => resolve(0)
      })

      // Check player profile
      const profileTx = this.db!.transaction(['playerProfile'], 'readonly')
      const profileStore = profileTx.objectStore('playerProfile')
      const hasProfile = await new Promise<boolean>((resolve) => {
        const request = profileStore.count()
        request.onsuccess = () => resolve(request.result > 0)
        request.onerror = () => resolve(false)
      })

      // Estimate storage usage
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate()
        stats.storageUsed = estimate.usage || 0
      }

      stats.questionsCount = questionsCount
      stats.gameHistoryCount = historyCount
      stats.hasPlayerProfile = hasProfile

      console.log('📊 Storage stats:', stats)
    } catch (error) {
      console.error('Failed to get storage stats:', error)
    }

    return stats
  }

  // Clear all offline data
  async clearAllData(): Promise<void> {
    if (!this.db) await this.initialize()
    if (!this.db) {
      console.log('⚠️ IndexedDB not available, skipping data clear')
      return
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['questions', 'playerProfile', 'gameHistory', 'preferences'], 'readwrite')

      let completed = 0
      const total = 4

      const checkCompletion = () => {
        completed++
        if (completed === total) {
          console.log('🗑️ All offline data cleared')
          resolve()
        }
      }

      transaction.objectStore('questions').clear().onsuccess = checkCompletion
      transaction.objectStore('playerProfile').clear().onsuccess = checkCompletion
      transaction.objectStore('gameHistory').clear().onsuccess = checkCompletion
      transaction.objectStore('preferences').clear().onsuccess = checkCompletion

      transaction.onerror = () => {
        console.error('Failed to clear offline data:', transaction.error)
        reject(transaction.error)
      }
    })
  }

  // Utility function to shuffle array
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Close database connection
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      console.log('📦 IndexedDB connection closed')
    }
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorageService()

// Initialize only on client side
if (typeof window !== 'undefined') {
  offlineStorage.initialize()
    .then(() => offlineStorage.checkAndInvalidateCache())
    .catch(console.error)
}