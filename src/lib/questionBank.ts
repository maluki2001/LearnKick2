import { Question, QuestionFilter, Grade, Difficulty } from '@/types/questions'
// OpenAI disabled - using only Neon database questions
// import { openaiQuestionGenerator } from './openaiQuestionGenerator'
import { offlineStorage } from './offlineStorage'

// Helper to balance true/false questions so we get a mix of true and false answers
// The database has ~89% true and ~11% false, which makes gameplay predictable
function balanceTrueFalseQuestions(questions: Question[]): Question[] {
  const trueValues = ['true', 'wahr', 'richtig', 'vrai', 'correct', 'yes', 'ja', 'oui']

  // Separate true/false questions from others
  const trueFalseQuestions = questions.filter(q => q.type === 'true-false')
  const otherQuestions = questions.filter(q => q.type !== 'true-false')

  if (trueFalseQuestions.length === 0) {
    return questions
  }

  // Split by correct answer
  const trueCorrect = trueFalseQuestions.filter(q => {
    const correctValue = q.correct ?? q.correctAnswer
    if (typeof correctValue === 'boolean') return correctValue
    if (typeof correctValue === 'string') return trueValues.includes(correctValue.toLowerCase())
    return false
  })

  const falseCorrect = trueFalseQuestions.filter(q => {
    const correctValue = q.correct ?? q.correctAnswer
    if (typeof correctValue === 'boolean') return !correctValue
    if (typeof correctValue === 'string') return !trueValues.includes(correctValue.toLowerCase())
    return true
  })

  console.log(`🔀 True/False balance: ${trueCorrect.length} true, ${falseCorrect.length} false`)

  // Try to balance: aim for 50/50, use what we have of the minority
  const targetCount = Math.floor(trueFalseQuestions.length / 2)

  // Shuffle both arrays first
  const shuffledTrue = [...trueCorrect].sort(() => Math.random() - 0.5)
  const shuffledFalse = [...falseCorrect].sort(() => Math.random() - 0.5)

  // Take up to targetCount from each, or all of minority + some majority
  const balancedTrueFalse: Question[] = []
  const falseToTake = Math.min(targetCount, shuffledFalse.length)
  const trueToTake = Math.min(targetCount, shuffledTrue.length)

  // Always try to include all false (minority) first
  balancedTrueFalse.push(...shuffledFalse.slice(0, falseToTake))
  balancedTrueFalse.push(...shuffledTrue.slice(0, trueToTake))

  // If we still need more questions, add remaining from majority
  const remaining = trueFalseQuestions.length - balancedTrueFalse.length
  if (remaining > 0 && trueToTake < shuffledTrue.length) {
    balancedTrueFalse.push(...shuffledTrue.slice(trueToTake, trueToTake + remaining))
  }

  console.log(`🔀 Balanced result: ${balancedTrueFalse.filter(q => {
    const correctValue = q.correct ?? q.correctAnswer
    if (typeof correctValue === 'boolean') return correctValue
    if (typeof correctValue === 'string') return trueValues.includes(correctValue.toLowerCase())
    return false
  }).length} true, ${balancedTrueFalse.filter(q => {
    const correctValue = q.correct ?? q.correctAnswer
    if (typeof correctValue === 'boolean') return !correctValue
    if (typeof correctValue === 'string') return !trueValues.includes(correctValue.toLowerCase())
    return true
  }).length} false`)

  // Combine and shuffle the result
  const result = [...otherQuestions, ...balancedTrueFalse].sort(() => Math.random() - 0.5)
  return result
}

// Helper to shuffle answers while tracking the correct answer's new position
// This fixes the issue where database has correct answer always at index 0
function shuffleAnswersWithIndex(
  answers: string[],
  correctIndex: number
): { shuffledAnswers: string[]; newCorrectIndex: number } {
  if (!answers || answers.length === 0) {
    return { shuffledAnswers: [], newCorrectIndex: 0 }
  }

  // Create array of {answer, isCorrect} pairs
  const pairs = answers.map((answer, idx) => ({
    answer,
    isCorrect: idx === correctIndex
  }))

  // Fisher-Yates shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }

  // Extract shuffled answers and find new correct index
  const shuffledAnswers = pairs.map(p => p.answer)
  const newCorrectIndex = pairs.findIndex(p => p.isCorrect)

  return { shuffledAnswers, newCorrectIndex }
}

// All questions come from Neon database - no static fallback
export const SAMPLE_QUESTIONS: Question[] = []

export class QuestionBankService {
  private questions: Question[] = SAMPLE_QUESTIONS
  private isGenerating = false
  private offlineInitialized = false

  constructor() {
    console.log('🔄 QuestionBankService initialized (with offline support)')
  }

  // Initialize offline storage
  private async initializeOffline() {
    if (this.offlineInitialized) return

    try {
      await offlineStorage.initialize()
      this.offlineInitialized = true
      console.log('✅ Offline storage initialized')
    } catch (error) {
      console.warn('⚠️ Offline storage initialization failed:', error)
    }
  }

  // Get questions based on filters
  getQuestions(filter: QuestionFilter = {}): Question[] {
    console.log('🔍 getQuestions called with filter:', filter)
    console.log('📚 Total questions in bank:', this.questions.length)
    
    const filtered = this.questions.filter(question => {
      const subjectMatch = !filter.subject || question.subject === filter.subject
      const gradeMatch = !filter.grade || question.grade === filter.grade  
      const difficultyMatch = !filter.difficulty || question.difficulty === filter.difficulty
      const languageMatch = !filter.language || question.language === filter.language
      const tagMatch = !filter.tags || filter.tags.some(tag => question.tags.includes(tag))
      
      const passes = subjectMatch && gradeMatch && difficultyMatch && languageMatch && tagMatch
      
      if (!passes && question.id.includes('math_3')) {
        console.log(`❌ Question ${question.id} failed:`, {
          subjectMatch, gradeMatch, difficultyMatch, languageMatch, tagMatch,
          question: { subject: question.subject, grade: question.grade, difficulty: question.difficulty, language: question.language }
        })
      }
      
      return passes
    })
    
    console.log(`✅ Filtered ${filtered.length} questions from ${this.questions.length} total`)
    return filtered
  }

  // Get adaptive questions based on player ELO and recent performance
  // CRITICAL: playerGrade and language are NEVER changed - user selected these!
  async getAdaptiveQuestions(
    playerGrade: Grade,
    playerElo: number,
    subject?: string,
    language: string = 'en',
    count: number = 50  // INCREASED: Fetch 50 questions for full game
  ): Promise<Question[]> {
    // Convert "all" to undefined to fetch questions from all subjects
    const effectiveSubject = subject === 'all' ? undefined : subject

    console.log('🔵 getAdaptiveQuestions: Starting (with offline support)...')
    console.log('🔵 Parameters:', { playerGrade, playerElo, subject, effectiveSubject, language, count })
    console.log('🔵 STRICT: Grade and Language will NEVER be changed!')

    // Initialize offline storage
    await this.initializeOffline()

    // Calculate target difficulty based on ELO with proper scaling
    let targetDifficulty: Difficulty = Math.min(5, Math.max(1, Math.round(playerElo / 300))) as Difficulty
    const maxDifficultyForGrade = Math.min(5, playerGrade + 1) as Difficulty
    targetDifficulty = Math.min(targetDifficulty, maxDifficultyForGrade) as Difficulty

    console.log(`🎯 ELO-based difficulty calculation: ELO=${playerElo} → difficulty=${targetDifficulty} (max for grade ${playerGrade}: ${maxDifficultyForGrade})`)

    // Check if we're offline
    const isOffline = offlineStorage.isOffline()
    console.log('🔵 Is offline:', isOffline)

    // If offline, use cached questions
    if (isOffline) {
      console.log('📦 OFFLINE MODE: Using cached questions from IndexedDB')
      const cachedQuestions = await this.getOfflineQuestions(playerGrade, effectiveSubject, language, count)
      if (cachedQuestions.length > 0) {
        console.log(`✅ Found ${cachedQuestions.length} cached questions for offline play`)
        return cachedQuestions
      }
      console.log('⚠️ No cached questions available for offline play')
      return []
    }

    if (!isOffline) {
      // Try database questions first (when online)
      try {
        console.log('🗄️ Attempting database question fetch...')
        const dbQuestions = await this.getDatabaseQuestions(
          playerGrade,
          targetDifficulty,
          effectiveSubject,
          language,
          count
        )

        console.log(`🔵 getDatabaseQuestions returned ${dbQuestions.length} questions`)

        if (dbQuestions.length > 0) {
          console.log(`✅ Found ${dbQuestions.length} database questions`)

          // Cache questions for offline use (additive - don't replace existing cache)
          this.cacheQuestionsForOffline(dbQuestions).catch(e =>
            console.warn('Failed to cache database questions:', e)
          )

          return dbQuestions
        } else {
          console.log('📭 No database questions found, trying other sources...')
        }
      } catch (dbError) {
        console.error('❌ Database questions failed:', dbError)
      }

      // DISABLED: OpenAI generation - use database questions only!
      // OpenAI is disabled - we only use questions from Neon database + static fallback
      console.log('ℹ️ OpenAI generation is disabled - using database/static questions only')
    }

    // Database-only mode - no static fallback
    console.log('⚠️ No questions found in database. Please add questions to Neon database.')

    // Return empty array - game should handle this gracefully
    return []
  }

  // Get questions from offline storage
  private async getOfflineQuestions(
    playerGrade: Grade,
    subject?: string, 
    language: string = 'en',
    count: number = 10
  ): Promise<Question[]> {
    try {
      const cachedQuestions = await offlineStorage.getCachedQuestions({
        subject,
        grade: playerGrade,
        language,
        limit: count * 2 // Get more to allow for better selection
      })

      if (cachedQuestions.length > 0) {
        console.log(`📦 Retrieved ${cachedQuestions.length} questions from offline storage`)
        return this.shuffleArray(cachedQuestions).slice(0, count)
      } else {
        console.log('📦 No cached questions found, using fallback static questions')
        return this.getAdaptiveStaticQuestions(playerGrade, 3, subject, language, count)
      }
    } catch (error) {
      console.error('Failed to get offline questions:', error)
      // Fallback to static questions
      return this.getAdaptiveStaticQuestions(playerGrade, 3, subject, language, count)
    }
  }

  // New method: Get adaptive static questions with intelligent fallback
  private getAdaptiveStaticQuestions(
    playerGrade: Grade,
    targetDifficulty: Difficulty,
    subject?: string,
    language: string = 'en',
    count: number = 10
  ): Question[] {
    console.log(`🎯 Static question search: grade=${playerGrade}, difficulty=${targetDifficulty}, subject=${subject}, language=${language}`)

    // Filter static questions based on criteria
    let questions = this.questions.filter(question => {
      const gradeMatch = question.grade === playerGrade
      const subjectMatch = !subject || question.subject === subject
      const languageMatch = question.language === language
      const difficultyMatch = Math.abs(question.difficulty - targetDifficulty) <= 1 // Allow some flexibility
      
      return gradeMatch && subjectMatch && languageMatch && difficultyMatch
    })

    console.log(`📚 Found ${questions.length} matching static questions for grade ${playerGrade}`)

    // If we don't have enough questions, relax the difficulty requirement
    if (questions.length < count) {
      questions = this.questions.filter(question => {
        const gradeMatch = question.grade === playerGrade
        const subjectMatch = !subject || question.subject === subject
        const languageMatch = question.language === language
        
        return gradeMatch && subjectMatch && languageMatch
      })
      console.log(`📚 Relaxed search found ${questions.length} questions for grade ${playerGrade}`)
    }

    // If still not enough, include nearby grades
    if (questions.length < count) {
      const nearbyGrades = [playerGrade - 1, playerGrade, playerGrade + 1].filter(g => g >= 1 && g <= 6)
      questions = this.questions.filter(question => {
        const gradeMatch = nearbyGrades.includes(question.grade)
        const subjectMatch = !subject || question.subject === subject
        const languageMatch = question.language === language
        
        return gradeMatch && subjectMatch && languageMatch
      })
      console.log(`📚 Expanded grade search found ${questions.length} questions`)
    }

    // Shuffle and return requested count
    const shuffled = this.shuffleArray(questions)
    const result = shuffled.slice(0, count)
    console.log(`✅ Returning ${result.length} questions for grade ${playerGrade}`)
    
    return result
  }

  private getCacheKey(grade: Grade, difficulty: Difficulty, subject?: string, language?: string): string {
    return `${grade}-${difficulty}-${subject || 'any'}-${language || 'en'}`
  }

  private getRecentPerformanceData() {
    // This would track recent player performance
    // For now, return default data
    return {
      recentAccuracy: 0.75,
      recentStreak: 3,
      strugglingTopics: [],
      strongTopics: []
    }
  }

  // Shuffle array utility
  // Get questions from database (via API route on client-side)
  private async getDatabaseQuestions(
    playerGrade: Grade,
    targetDifficulty: Difficulty,
    subject?: string,
    language: string = 'en',
    count: number = 10,
    schoolId?: string
  ): Promise<Question[]> {
    try {
      console.log('🗄️ Attempting to fetch questions from database...')
      console.log('📋 Database query filters:', {
        playerGrade,
        targetDifficulty,
        subject,
        language,
        count,
        schoolId
      })

      // Check if we're on client-side
      const isClient = typeof window !== 'undefined'

      if (isClient) {
        // Client-side: use API route
        console.log('🌐 Client-side: Using API route to fetch questions')

        // Try fetching with progressively relaxed filters
        // CRITICAL: Grade and Language are ALWAYS STRICT - never remove them!
        // User selected these intentionally - we must respect their choice
        const filterAttempts = [
          // Attempt 1: All filters (grade + subject + language)
          { grade: playerGrade, subject, language, label: 'grade + subject + language' },
          // Attempt 2: Without subject filter (keep grade AND language strict)
          { grade: playerGrade, language, label: 'grade + language only' }
          // NO MORE FALLBACKS - grade and language MUST always match!
        ]

        let allQuestions: Record<string, unknown>[] = []

        for (const attempt of filterAttempts) {
          const params = new URLSearchParams()
          if (schoolId) params.append('schoolId', schoolId)
          if (attempt.subject) params.append('subject', attempt.subject)
          if (attempt.grade) params.append('grade', attempt.grade.toString())
          if (attempt.language) params.append('language', attempt.language)

          const url = `/api/questions?${params.toString()}`
          console.log(`🔵 Attempting fetch with ${attempt.label}:`, url)

          // Add timeout to fetch
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

          try {
            const response = await fetch(url, { signal: controller.signal })
            clearTimeout(timeoutId)

            console.log('🔵 Fetch response status:', response.status)

            if (!response.ok) {
              throw new Error(`API request failed: ${response.statusText}`)
            }

            const result = await response.json()
            console.log('🔵 API result:', { success: result.success, questionCount: result.questions?.length || 0 })

            if (!result.success) {
              throw new Error(result.error || 'Failed to fetch questions')
            }

            allQuestions = result.questions || []
            console.log(`📊 Questions from API (${attempt.label}):`, allQuestions.length)

            if (allQuestions.length > 0) {
              console.log(`✅ Found ${allQuestions.length} questions with ${attempt.label}`)
              break // Found questions, stop trying
            }
          } catch (fetchError) {
            clearTimeout(timeoutId)
            console.warn(`⚠️ Fetch attempt failed (${attempt.label}):`, fetchError)
          }
        }

        if (allQuestions.length === 0) {
          console.log('⚠️ No questions found with any filter combination')
          return []
        }

        // Convert and filter questions
        const convertedQuestions = allQuestions.map((dbQ: Record<string, unknown>) => {
          // For true-false questions, use statement if available, otherwise fall back to question
          const statementText = dbQ.statement as string | undefined
          const questionText = dbQ.question as string | undefined
          const effectiveStatement = dbQ.type === 'true-false'
            ? (statementText || questionText || '')
            : statementText

          // Calculate original correctIndex
          const originalAnswers = (dbQ.answers || []) as string[]
          const originalCorrectIndex = typeof dbQ.correct_index === 'number'
            ? dbQ.correct_index
            : Math.max(0, originalAnswers.findIndex(a => String(a) === String(dbQ.correct_answer)))

          // Shuffle answers for multiple-choice and image-question to randomize position
          // This fixes the issue where database has correct answer always at index 0
          const shouldShuffle = (dbQ.type === 'multiple-choice' || dbQ.type === 'image-question') && originalAnswers.length > 1
          const { shuffledAnswers, newCorrectIndex } = shouldShuffle
            ? shuffleAnswersWithIndex(originalAnswers, originalCorrectIndex)
            : { shuffledAnswers: originalAnswers, newCorrectIndex: originalCorrectIndex }

          return {
            id: dbQ.id as string,
            type: dbQ.type as Question['type'],
            subject: dbQ.subject as string,
            grade: dbQ.grade as number,
            difficulty: dbQ.difficulty as number,
            language: dbQ.language as string,
            question: questionText,
            statement: effectiveStatement,
            answers: shuffledAnswers,
            correctIndex: newCorrectIndex,
            correctAnswer: dbQ.correct_answer as string | number | undefined,
            // For true-false questions: use correct_answer field
            // Handles: "true", "false", "Wahr", "Falsch", "Richtig", "Vrai", "Faux"
            correct: dbQ.type === 'true-false'
              ? ['true', 'wahr', 'richtig', 'vrai', 'correct', 'yes', 'ja', 'oui'].includes(String(dbQ.correct_answer).toLowerCase())
              : undefined,
            explanation: dbQ.explanation as string | undefined,
            unit: dbQ.unit as string | undefined,
            imageUrl: dbQ.image_url as string | undefined,
            tags: (dbQ.tags || []) as string[],
            timeLimit: (dbQ.time_limit || 15000) as number,
            lehrplan21Topic: dbQ.lehrplan21_topic as string | undefined,
            createdAt: dbQ.created_at as string | undefined,
            updatedAt: dbQ.updated_at as string | undefined
          }
        }) as Question[]

        // Filter by difficulty - but be LENIENT
        // Try strict filter first (±1), then expand to ±2, then skip filter entirely
        let filteredByDifficulty = convertedQuestions.filter(q =>
          Math.abs(q.difficulty - targetDifficulty) <= 1
        )

        if (filteredByDifficulty.length === 0 && convertedQuestions.length > 0) {
          console.log(`⚠️ No questions within difficulty ±1 of ${targetDifficulty}, trying ±2...`)
          filteredByDifficulty = convertedQuestions.filter(q =>
            Math.abs(q.difficulty - targetDifficulty) <= 2
          )
        }

        if (filteredByDifficulty.length === 0 && convertedQuestions.length > 0) {
          console.log(`⚠️ No questions within difficulty ±2, using ALL ${convertedQuestions.length} questions`)
          filteredByDifficulty = convertedQuestions // Skip difficulty filter entirely
        }

        console.log(`🎯 After difficulty filtering: ${filteredByDifficulty.length} questions (target difficulty: ${targetDifficulty})`)

        // CACHING DISABLED - No caching to prevent bugs
        // offlineStorage.cacheQuestions([...this.questions, ...filteredByDifficulty])

        // =========================================================
        // FINAL ASSERTION (CLIENT-SIDE): NEVER return wrong grade/language questions!
        // This is the LAST LINE OF DEFENSE
        // =========================================================
        const finalQuestions = filteredByDifficulty.filter(q => {
          if (q.grade !== playerGrade) {
            console.error(`🚨 CLIENT ASSERTION FAILED: Question ${q.id} has grade ${q.grade} but should be ${playerGrade}`)
            return false
          }
          if (q.language !== language) {
            console.error(`🚨 CLIENT ASSERTION FAILED: Question ${q.id} has language ${q.language} but should be ${language}`)
            return false
          }
          return true
        })

        if (finalQuestions.length < filteredByDifficulty.length) {
          console.error(`🚨 CLIENT REMOVED ${filteredByDifficulty.length - finalQuestions.length} questions with wrong grade/language!`)
        }

        // Balance true/false questions to get a mix of true and false answers
        const balancedQuestions = balanceTrueFalseQuestions(finalQuestions)
        const shuffledQuestions = this.shuffleArray(balancedQuestions).slice(0, count)
        console.log(`🔵 Returning ${shuffledQuestions.length} questions from client API (ASSERTION PASSED)`)
        return shuffledQuestions
      }

      // Server-side: use database directly
      console.log('🖥️ Server-side: Using database directly')

      // Dynamic import of database (server-only module)
      const { database } = await import('./database.server')

      const filters: Record<string, unknown> = {
        subject,
        grade: playerGrade,
        language
      }

      console.log('🔍 Calling database.getQuestions with filters:', filters)

      // First get ALL questions to see what's in database
      console.log('🔍 First checking what questions exist in database...')
      const allQuestions = await database.getQuestions(null, {}) // No filters
      console.log('📊 Total questions in database:', allQuestions ? allQuestions.length : 0)
      
      if (allQuestions && allQuestions.length > 0) {
        console.log('🔍 Sample question data:', {
          subject: allQuestions[0].subject,
          grade: allQuestions[0].grade,  
          language: allQuestions[0].language,
          type: allQuestions[0].type
        })
        
        // Show all unique subjects in database
        const subjects = [...new Set(allQuestions.map(q => q.subject))]
        const grades = [...new Set(allQuestions.map(q => q.grade))]
        const languages = [...new Set(allQuestions.map(q => q.language))]
        console.log('🔍 Available subjects:', subjects)
        console.log('🔍 Available grades:', grades)  
        console.log('🔍 Available languages:', languages)
      }
      
      // SENIOR DEV FIX: If we have questions in database, use them - don't go to OpenAI!
      if (allQuestions && allQuestions.length > 0) {
        console.log('✅ Database has questions - using database instead of OpenAI!')
        
        // Try exact match first
        let dbQuestions = await database.getQuestions(null, filters)
        console.log('📊 Exact match results:', dbQuestions ? `${dbQuestions.length} questions` : 'null/undefined')
        
        // SENIOR DEV FIX: If no exact match, try flexible matching
        // CRITICAL: Grade and Language are ALWAYS STRICT - user selected these!
        if (!dbQuestions || dbQuestions.length === 0) {
          console.log('🔄 No exact match - trying without subject filter...')

          // Only remove subject filter - grade and language MUST stay!
          const flexibleFilters = {
            grade: playerGrade,
            language: language
          }
          dbQuestions = await database.getQuestions(null, flexibleFilters)
          console.log('📊 Without subject filter:', dbQuestions ? `${dbQuestions.length} questions` : 'null/undefined')

          // NO MORE FALLBACKS - grade and language must always match!
          // We have 8000+ questions - if nothing matches, there's a data issue
        }
        
        if (dbQuestions && dbQuestions.length > 0) {
          console.log(`✅ Found ${dbQuestions.length} questions in database`)

        // Convert database questions to our Question type format
        const convertedQuestions = dbQuestions.map(dbQ => {
          // For true-false questions, use statement if available, otherwise fall back to question
          const statementText = dbQ.statement as string | undefined
          const questionText = dbQ.question as string | undefined
          const effectiveStatement = dbQ.type === 'true-false'
            ? (statementText || questionText || '')
            : statementText

          // Calculate original correctIndex
          const originalAnswers = (dbQ.answers || []) as string[]
          const originalCorrectIndex = typeof dbQ.correct_index === 'number'
            ? dbQ.correct_index
            : Math.max(0, originalAnswers.findIndex(a => String(a) === String(dbQ.correct_answer)))

          // Shuffle answers for multiple-choice and image-question to randomize position
          // This fixes the issue where database has correct answer always at index 0
          const shouldShuffle = (dbQ.type === 'multiple-choice' || dbQ.type === 'image-question') && originalAnswers.length > 1
          const { shuffledAnswers, newCorrectIndex } = shouldShuffle
            ? shuffleAnswersWithIndex(originalAnswers, originalCorrectIndex)
            : { shuffledAnswers: originalAnswers, newCorrectIndex: originalCorrectIndex }

          return {
            id: dbQ.id as string,
            type: dbQ.type as Question['type'],
            subject: dbQ.subject as string,
            grade: dbQ.grade as number,
            difficulty: dbQ.difficulty as number,
            language: dbQ.language as string,
            question: questionText,
            statement: effectiveStatement,
            answers: shuffledAnswers,
            correctIndex: newCorrectIndex,
            correctAnswer: dbQ.correct_answer as string | number | undefined,
            // For true-false questions: use correct_answer field
            // Handles: "true", "false", "Wahr", "Falsch", "Richtig", "Vrai", "Faux"
            correct: dbQ.type === 'true-false'
              ? ['true', 'wahr', 'richtig', 'vrai', 'correct', 'yes', 'ja', 'oui'].includes(String(dbQ.correct_answer).toLowerCase())
              : undefined,
            explanation: dbQ.explanation as string | undefined,
            unit: dbQ.unit as string | undefined,
            imageUrl: dbQ.image_url as string | undefined,
            tags: (dbQ.tags || []) as string[],
            timeLimit: (dbQ.time_limit || 15000) as number,
            lehrplan21Topic: dbQ.lehrplan21_topic as string | undefined,
            createdAt: dbQ.created_at as string | undefined,
            updatedAt: dbQ.updated_at as string | undefined
          }
        }) as Question[]

        // Filter by difficulty - but be LENIENT (same as client-side)
        let filteredByDifficulty = convertedQuestions.filter(q =>
          Math.abs(q.difficulty - targetDifficulty) <= 1
        )

        if (filteredByDifficulty.length === 0 && convertedQuestions.length > 0) {
          console.log(`⚠️ Server: No questions within difficulty ±1 of ${targetDifficulty}, trying ±2...`)
          filteredByDifficulty = convertedQuestions.filter(q =>
            Math.abs(q.difficulty - targetDifficulty) <= 2
          )
        }

        if (filteredByDifficulty.length === 0 && convertedQuestions.length > 0) {
          console.log(`⚠️ Server: No questions within difficulty ±2, using ALL ${convertedQuestions.length} questions`)
          filteredByDifficulty = convertedQuestions
        }

        console.log(`🎯 After difficulty filtering: ${filteredByDifficulty.length} questions (target: ${targetDifficulty})`)

        // =========================================================
        // FINAL ASSERTION: NEVER return wrong grade/language questions!
        // This is the LAST LINE OF DEFENSE - log errors if any slip through
        // =========================================================
        const finalQuestions = filteredByDifficulty.filter(q => {
          if (q.grade !== playerGrade) {
            console.error(`🚨 ASSERTION FAILED: Question ${q.id} has grade ${q.grade} but should be ${playerGrade}`)
            return false
          }
          if (q.language !== language) {
            console.error(`🚨 ASSERTION FAILED: Question ${q.id} has language ${q.language} but should be ${language}`)
            return false
          }
          return true
        })

        if (finalQuestions.length < filteredByDifficulty.length) {
          console.error(`🚨 REMOVED ${filteredByDifficulty.length - finalQuestions.length} questions with wrong grade/language!`)
        }

        // CACHING DISABLED - No caching to prevent bugs
        // try {
        //   await offlineStorage.cacheQuestions([...this.questions, ...finalQuestions])
        //   console.log(`💾 Cached ${finalQuestions.length} database questions`)
        // } catch (cacheError) {
        //   console.warn('Failed to cache database questions:', cacheError)
        // }

        // Balance true/false questions to get a mix of true and false answers
        const balancedQuestions = balanceTrueFalseQuestions(finalQuestions)
        return this.shuffleArray(balancedQuestions).slice(0, count)
        }
      }
    } catch (error) {
      console.warn('⚠️ Database question fetch failed (falling back to static questions):', error instanceof Error ? error.message : String(error))
      console.error('❌ Full error details:', error)
    }

    console.log('🔄 No database questions found - will try other sources')
    return []
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Cache questions for offline play (additive - doesn't replace existing cache)
  private async cacheQuestionsForOffline(questions: Question[]): Promise<void> {
    if (questions.length === 0) return

    try {
      await this.initializeOffline()

      // Get existing cached questions
      const existingQuestions = await offlineStorage.getAllQuestions()
      const existingIds = new Set(existingQuestions.map(q => q.id))

      // Only add new questions that aren't already cached
      const newQuestions = questions.filter(q => !existingIds.has(q.id))

      if (newQuestions.length > 0) {
        // Merge existing and new questions
        const allQuestions = [...existingQuestions, ...newQuestions]
        await offlineStorage.cacheQuestions(allQuestions)
        console.log(`💾 Cached ${newQuestions.length} new questions for offline (total: ${allQuestions.length})`)
      } else {
        console.log('💾 All questions already cached')
      }
    } catch (error) {
      console.warn('Failed to cache questions for offline:', error)
    }
  }

  // Performance tracking methods
  recordAnswer(questionId: string, correct: boolean, timeTaken: number) {
    // This would record player performance for adaptive learning
    console.log(`📊 Recording answer: ${questionId}, correct: ${correct}, time: ${timeTaken}ms`)
  }

  async saveGameResult(gameResult: {
    playerId?: string,
    subject: string,
    grade: number,
    questionsAnswered: number,
    correctAnswers: number,
    totalScore: number,
    accuracy: number,
    averageTime: number,
    completedAt: Date
  }) {
    try {
      // Save game history to offline storage
      const gameData = {
        id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        playedAt: gameResult.completedAt.getTime(),
        score: gameResult.totalScore,
        accuracy: gameResult.accuracy,
        subject: gameResult.subject,
        grade: gameResult.grade,
        duration: Math.round(gameResult.averageTime * gameResult.questionsAnswered / 1000), // Convert to seconds
        questionsAnswered: gameResult.questionsAnswered
      }

      await offlineStorage.saveGameHistory(gameData)
      
      // Also save player profile if we have player data
      if (gameResult.playerId) {
        const playerProfile = {
          id: gameResult.playerId,
          name: 'Player', // This should come from actual player data
          grade: gameResult.grade,
          elo: 1500, // This should be calculated based on performance
          totalGamesPlayed: 1, // This should be incremented
          totalCorrectAnswers: gameResult.correctAnswers,
          totalIncorrectAnswers: gameResult.questionsAnswered - gameResult.correctAnswers,
          bestStreak: 0, // This should be tracked
          favoriteSubject: gameResult.subject,
          lastPlayedAt: gameResult.completedAt.getTime()
        }
        
        await offlineStorage.savePlayerProfile(playerProfile)
      }
    } catch (error) {
      console.warn('Failed to save game result:', error)
    }
  }

  // Get all available questions (for debugging/admin purposes)
  async getAllQuestions(): Promise<Question[]> {
    try {
      // Get static questions
      let allQuestions = [...this.questions]
      
      // Get stored questions from offline storage
      await this.initializeOffline()
      const storedQuestions = await offlineStorage.getAllQuestions()
      
      // Merge questions, avoiding duplicates by ID
      const existingIds = new Set(allQuestions.map(q => q.id))
      const newQuestions = storedQuestions.filter(q => !existingIds.has(q.id))
      allQuestions = [...allQuestions, ...newQuestions]
      
      console.log(`📚 Total questions available: ${allQuestions.length} (${this.questions.length} static + ${storedQuestions.length} stored)`)
      return allQuestions
    } catch (error) {
      console.error('Failed to get all questions:', error)
      return [...this.questions] // Fallback to static questions
    }
  }

  // Admin Methods - Question Management
  async addQuestion(question: Question, schoolId?: string, userId?: string): Promise<void> {
    try {
      const isClient = typeof window !== 'undefined'

      if (schoolId && userId) {
        if (isClient) {
          // Client-side: use API route
          console.log('🌐 Client-side: Using API to add question...', question.id)
          const response = await fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, schoolId, userId })
          })

          if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`)
          }

          const result = await response.json()
          if (!result.success) {
            throw new Error(result.error || 'Failed to add question')
          }

          console.log('✅ Question saved via API successfully:', question.id)
        } else {
          // Server-side: use database directly
          console.log('🖥️ Server-side: Saving question to database...', question.id)
          const { database } = await import('./database.server')
          await database.addQuestion(question as unknown as Record<string, unknown>, schoolId, userId)
          console.log('✅ Question saved to database successfully:', question.id)
        }
      } else {
        console.log('⚠️ No schoolId/userId provided, saving to offline storage only')
      }

      // Also save to offline storage for quick access
      await this.initializeOffline()
      await offlineStorage.saveQuestion(question)
      console.log('💾 Question also cached in offline storage:', question.id)
    } catch (error) {
      console.error('Failed to add question:', error)
      throw error
    }
  }

  async updateQuestion(question: Question, schoolId?: string): Promise<void> {
    try {
      const isClient = typeof window !== 'undefined'

      if (schoolId) {
        if (isClient) {
          // Client-side: use API route
          console.log('🌐 Client-side: Using API to update question...', question.id)
          const response = await fetch('/api/questions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionId: question.id,
              updates: question,
              schoolId
            })
          })

          if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`)
          }

          const result = await response.json()
          if (!result.success) {
            throw new Error(result.error || 'Failed to update question')
          }

          console.log('✅ Question updated via API successfully:', question.id)
        } else {
          // Server-side: use database directly
          console.log('🖥️ Server-side: Updating question in database...', question.id)
          const { database } = await import('./database.server')
          await database.updateQuestion(question.id, question as unknown as Record<string, unknown>, schoolId)
          console.log('✅ Question updated in database successfully:', question.id)
        }
      }

      // Also update in offline storage
      await this.initializeOffline()
      await offlineStorage.saveQuestion({
        ...question,
        updatedAt: new Date().toISOString()
      } as unknown as Question)
      console.log('💾 Question updated in offline storage:', question.id)
    } catch (error) {
      console.error('Failed to update question:', error)
      throw error
    }
  }

  async deleteQuestion(questionId: string, schoolId?: string): Promise<void> {
    try {
      const isClient = typeof window !== 'undefined'

      if (schoolId) {
        if (isClient) {
          // Client-side: use API route
          console.log('🌐 Client-side: Using API to delete question...', questionId)
          const response = await fetch(`/api/questions?questionId=${questionId}&schoolId=${schoolId}`, {
            method: 'DELETE'
          })

          if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`)
          }

          const result = await response.json()
          if (!result.success) {
            throw new Error(result.error || 'Failed to delete question')
          }

          console.log('✅ Question deleted via API successfully:', questionId)
        } else {
          // Server-side: use database directly
          console.log('🖥️ Server-side: Deleting question from database...', questionId)
          const { database } = await import('./database.server')
          await database.deleteQuestion(questionId, schoolId)
          console.log('✅ Question deleted from database successfully:', questionId)
        }
      }

      // Also delete from offline storage
      await this.initializeOffline()
      await offlineStorage.deleteQuestion(questionId)
      console.log('💾 Question deleted from offline storage:', questionId)
    } catch (error) {
      console.error('Failed to delete question:', error)
      throw error
    }
  }

  // Get a specific question by ID
  async getQuestionByIdAsync(questionId: string): Promise<Question | null> {
    try {
      // First check static questions
      const staticQuestion = this.questions.find(q => q.id === questionId)
      if (staticQuestion) return staticQuestion
      
      // Then check offline storage
      await this.initializeOffline()
      const question = await offlineStorage.getQuestion(questionId)
      return question
    } catch (error) {
      console.error('Failed to get question:', error)
      return null
    }
  }

  // Get questions with advanced filtering for admin interface
  async getQuestionsWithFilters(filters: {
    subject?: string | 'all'
    grade?: number | 'all'
    difficulty?: number | 'all'
    type?: string | 'all'
    language?: string | 'all'
    search?: string
    includeCustom?: boolean
  }): Promise<Question[]> {
    try {
      let allQuestions: Question[] = []
      
      // Get static questions
      allQuestions = [...this.questions]
      
      // Get custom questions from database if requested
      if (filters.includeCustom) {
        await this.initializeOffline()
        const customQuestions = await offlineStorage.getAllQuestions()
        allQuestions = [...allQuestions, ...customQuestions]
      }
      
      // Apply filters
      let filtered = allQuestions
      
      if (filters.subject && filters.subject !== 'all') {
        filtered = filtered.filter(q => q.subject === filters.subject)
      }
      
      if (filters.grade && filters.grade !== 'all') {
        filtered = filtered.filter(q => q.grade === filters.grade)
      }
      
      if (filters.difficulty && filters.difficulty !== 'all') {
        filtered = filtered.filter(q => q.difficulty === filters.difficulty)
      }
      
      if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter(q => q.type === filters.type)
      }
      
      if (filters.language && filters.language !== 'all') {
        filtered = filtered.filter(q => q.language === filters.language)
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(q => {
          // Cast to access optional properties from different question types
          const questionText = 'question' in q ? (q as { question?: string }).question : undefined
          const statement = 'statement' in q ? (q as { statement?: string }).statement : undefined
          const answers = 'answers' in q ? (q as { answers?: string[] }).answers : undefined
          const explanation = 'explanation' in q ? (q as { explanation?: string }).explanation : undefined

          return (
            questionText?.toLowerCase().includes(searchLower) ||
            statement?.toLowerCase().includes(searchLower) ||
            answers?.some(a => a.toLowerCase().includes(searchLower)) ||
            explanation?.toLowerCase().includes(searchLower)
          )
        })
      }
      
      return filtered
    } catch (error) {
      console.error('Failed to get questions with filters:', error)
      return []
    }
  }

  // Bulk import questions
  async bulkAddQuestions(questions: Question[]): Promise<{
    successCount: number
    errorCount: number
    errors: string[]
  }> {
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const question of questions) {
      try {
        await this.addQuestion(question)
        successCount++
      } catch (error) {
        errorCount++
        errors.push(`${question.id}: ${error}`)
      }
    }

    return { successCount, errorCount, errors }
  }

  // Get question bank statistics
  async getStatistics(): Promise<{
    totalQuestions: number
    questionsByGrade: Record<number, number>
    questionsBySubject: Record<string, number>
    questionsByLanguage: Record<string, number>
    questionsByType: Record<string, number>
    isOnline: boolean
  }> {
    try {
      const allQuestions = await this.getAllQuestions()
      
      const stats = {
        totalQuestions: allQuestions.length,
        questionsByGrade: {} as Record<number, number>,
        questionsBySubject: {} as Record<string, number>,
        questionsByLanguage: {} as Record<string, number>,
        questionsByType: {} as Record<string, number>,
        isOnline: !offlineStorage.isOffline()
      }

      // Count by categories
      for (const question of allQuestions) {
        stats.questionsByGrade[question.grade] = (stats.questionsByGrade[question.grade] || 0) + 1
        stats.questionsBySubject[question.subject] = (stats.questionsBySubject[question.subject] || 0) + 1
        stats.questionsByLanguage[question.language] = (stats.questionsByLanguage[question.language] || 0) + 1
        stats.questionsByType[question.type] = (stats.questionsByType[question.type] || 0) + 1
      }

      return stats
    } catch (error) {
      console.error('Failed to get statistics:', error)
      return {
        totalQuestions: 0,
        questionsByGrade: {},
        questionsBySubject: {},
        questionsByLanguage: {},
        questionsByType: {},
        isOnline: !offlineStorage.isOffline()
      }
    }
  }
}

// Create singleton instance
export const questionBank = new QuestionBankService()