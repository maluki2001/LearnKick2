import { Question, Grade } from '@/types/questions'
import { Player, GameSession } from '@/types/game'
import { questionBank } from './questionBank'
import { GAME_CONFIG } from '@/constants/game'
import { AIOpponent } from './aiOpponent'
import { calculateElixirFromAnswer, getSpeedRating, getStreakMultiplier } from './elixirService'
import type { SubjectValue } from '@/types/team'
import { generateUUID } from './uuid'

export interface AnswerRecord {
  questionIndex: number
  subject: SubjectValue
  responseTimeMs: number
  timeLimitMs: number
  isCorrect: boolean
  elixirEarned: number
  speedRating: string
  streakMultiplier: number
}

export interface GameStats {
  correctAnswers: number
  incorrectAnswers: number
  streak: number
  maxStreak: number
  averageResponseTime: number
  accuracy: number
}

export interface ElixirSummary {
  totalElixir: number
  questionsAnswered: AnswerRecord[]
  speedBonuses: {
    lightning: number
    fast: number
    normal: number
    slow: number
    lastSecond: number
  }
  streakBonus: number
  maxStreak: number
}

export interface PlayerState {
  player: Player
  position: number // 0-100, represents field position
  goals: number
  stats: GameStats
  currentStreak: number
  lastAnswerTime?: number
  isReady: boolean
  // Elixir tracking
  elixirEarned: number
  answerHistory: AnswerRecord[]
}

export interface GameEngineState {
  session: GameSession | null
  player1: PlayerState | null
  player2: PlayerState | null
  currentQuestionIndex: number
  timeRemaining: number
  gameStatus: 'waiting' | 'countdown' | 'active' | 'paused' | 'finished'
  questionQueue: Question[]
  startTime?: number
  winner?: 'player1' | 'player2' | 'tie'
  // Elixir summary (populated at game end)
  elixirSummary?: ElixirSummary
  // Adaptive difficulty tracking
  lastAnswerWasWrong: boolean
  currentTargetDifficulty: number  // 1-5, adjusts based on performance
}

export class GameEngine {
  private state: GameEngineState = {
    session: null,
    player1: null,
    player2: null,
    currentQuestionIndex: 0,
    timeRemaining: GAME_CONFIG.MATCH_DURATION,
    gameStatus: 'waiting',
    questionQueue: [],
    lastAnswerWasWrong: false,
    currentTargetDifficulty: 3, // Start at medium difficulty
  }

  private timerId?: NodeJS.Timeout
  private aiOpponent?: AIOpponent
  private aiResponseTimer?: NodeJS.Timeout
  private callbacks: {
    onStateUpdate?: (state: GameEngineState) => void
    onGameEnd?: (winner: 'player1' | 'player2' | 'tie', finalState: GameEngineState) => void
    onGoal?: (player: 'player1' | 'player2', newScore: number) => void
    onElixirGain?: (player: 'player1' | 'player2', elixirGained: number, totalElixir: number, speedRating: string) => void
  } = {}

  constructor(callbacks?: typeof this.callbacks) {
    this.callbacks = callbacks || {}
  }

  // Initialize a new game
  async initializeGame(
    player1: Player,
    player2: Player,
    arena: 'soccer' | 'hockey',
    subject?: string,
    language: string = 'en',
    playerGrade?: number
  ): Promise<void> {
    // Use actual player grade if provided, otherwise derive from ELO
    const grade = (playerGrade || Math.min(6, Math.max(1, Math.round((player1.elo + player2.elo) / 600)))) as Grade
    
    console.log(`🎯 Requesting questions: grade=${grade}, subject=${subject}, language=${language}`)
    console.log(`🔒 STRICT MODE: Grade ${grade} and Language ${language} will NEVER be changed!`)
    let questions = await questionBank.getAdaptiveQuestions(
      grade,
      Math.max(player1.elo, player2.elo),
      subject,
      language,
      50 // Request 50 questions for full game (no mid-game fetching!)
    )

    // SAFETY: If no questions loaded, try with relaxed filters
    // IMPORTANT: NEVER change the grade or language - user selected these!
    if (questions.length === 0) {
      console.log('⚠️ No questions found with initial filters, trying without subject filter...')
      // Try without subject filter BUT KEEP grade and language STRICT
      questions = await questionBank.getAdaptiveQuestions(grade, Math.max(player1.elo, player2.elo), undefined, language, 30)
    }

    // REMOVED: English fallback - NEVER change language from what user selected
    // If user selected German, they must get German questions

    if (questions.length === 0) {
      console.error('❌ CRITICAL: No questions available in database! Game cannot start.')
      throw new Error('No questions available. Please check the database connection and ensure questions are loaded.')
    }

    console.log(`📚 Generated ${questions.length} questions:`, questions.map(q => `${q.id}: ${q.type === 'true-false' ? (q as { statement: string }).statement : (q as { question: string }).question}`).slice(0, 3))

    this.state = {
      session: {
        id: generateUUID(),
        players: [player1, player2],
        arena,
        duration: GAME_CONFIG.MATCH_DURATION,
        questions,
        scores: [0, 0],
        status: 'waiting',
        startTime: Date.now()
      },
      player1: {
        player: player1,
        position: 50, // Start at midfield
        goals: 0,
        stats: this.initializeStats(),
        currentStreak: 0,
        isReady: false,
        elixirEarned: 0,
        answerHistory: []
      },
      player2: {
        player: player2,
        position: 50, // Start at midfield
        goals: 0,
        stats: this.initializeStats(),
        currentStreak: 0,
        isReady: false,
        elixirEarned: 0,
        answerHistory: []
      },
      currentQuestionIndex: 0,
      timeRemaining: GAME_CONFIG.MATCH_DURATION,
      gameStatus: 'waiting',
      questionQueue: questions,
      // ADAPTIVE DIFFICULTY: Start at medium, adjust based on performance
      lastAnswerWasWrong: false,
      currentTargetDifficulty: 3,
    }

    // Initialize AI opponent for player 2
    this.aiOpponent = new AIOpponent(player2)

    this.notifyStateUpdate()
  }

  // Start the game countdown
  startGame(): void {
    if (this.state.gameStatus !== 'waiting') return

    console.log('🎮 Starting game countdown...')
    this.state.gameStatus = 'countdown'
    this.state.startTime = Date.now()
    
    // 3-second countdown
    let countdown = 3
    const countdownInterval = setInterval(() => {
      countdown--
      console.log(`⏰ Countdown: ${countdown}`)
      if (countdown <= 0) {
        clearInterval(countdownInterval)
        console.log('🏁 Countdown complete, beginning active game!')
        this.beginActiveGame()
      }
    }, 1000)

    this.notifyStateUpdate()
  }

  // Begin the active game phase
  private beginActiveGame(): void {
    console.log('🏟️ Beginning active game phase...')
    this.state.gameStatus = 'active'
    this.state.startTime = Date.now()
    
    // Start the game timer
    this.timerId = setInterval(() => {
      this.state.timeRemaining--
      
      if (this.state.timeRemaining <= 0) {
        this.endGame()
      } else {
        this.notifyStateUpdate()
      }
    }, 1000)

    // Start AI opponent for first question
    this.scheduleAIResponse()
    
    const currentQ = this.getCurrentQuestion()
    console.log('📚 Current question:', currentQ?.id || 'NULL')
    console.log('📊 Question queue length:', this.state.questionQueue.length)
    console.log('📍 Current question index:', this.state.currentQuestionIndex)
    this.notifyStateUpdate()
  }

  // Handle player answer
  submitAnswer(
    playerId: string,
    answerIndex?: number,
    _answerValue?: number | boolean
  ): { correct: boolean; explanation?: string } {
    if (this.state.gameStatus !== 'active') {
      return { correct: false }
    }

    const currentQuestion = this.getCurrentQuestion()
    if (!currentQuestion) {
      return { correct: false }
    }

    const player = this.getPlayerById(playerId)
    if (!player) {
      return { correct: false }
    }

    // Check if answer is correct based on question type
    let isCorrect = false

    // DEBUG: Log everything about this question and answer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = currentQuestion as any
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📝 ANSWER CHECK DEBUG`)
    console.log(`   Question type: ${currentQuestion.type}`)
    console.log(`   Question: ${currentQuestion.type === 'true-false' ? q.statement : q.question}`)
    console.log(`   User selected index: ${answerIndex}`)
    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'image-question') {
      console.log(`   Answers: ${JSON.stringify(q.answers)}`)
      console.log(`   Correct index from question: ${q.correctIndex}`)
    }
    if (currentQuestion.type === 'true-false') {
      console.log(`   Correct value from question: ${q.correct}`)
    }
    console.log(`${'='.repeat(60)}`)

    switch (currentQuestion.type) {
      case 'multiple-choice':
      case 'image-question':
        isCorrect = answerIndex === currentQuestion.correctIndex
        console.log(`✅ MULTIPLE-CHOICE: answerIndex(${answerIndex}) === correctIndex(${currentQuestion.correctIndex}) = ${isCorrect}`)
        break
      case 'true-false':
        // UI sends answerIndex: 0 = True (A), 1 = False (B) - standard order
        // Convert index to boolean: 0 means True was selected, 1 means False was selected
        const selectedTrueFalse = answerIndex === 0  // Index 0 = True button

        // Handle both boolean and string "true"/"false" from database
        // Use 'q' (any-typed) to avoid TypeScript narrowing issues
        const rawCorrect = q.correct
        let questionCorrect: boolean
        if (typeof rawCorrect === 'string') {
          questionCorrect = rawCorrect.toLowerCase() === 'true'
        } else {
          questionCorrect = !!rawCorrect
        }

        isCorrect = selectedTrueFalse === questionCorrect
        console.log(`✅ TRUE/FALSE: Selected index ${answerIndex} means "${selectedTrueFalse ? 'True' : 'False'}", question.correct is "${questionCorrect}" (original: ${rawCorrect}), isCorrect: ${isCorrect}`)
        break
      case 'number-input':
        // QuestionCard converts number-input to multiple choice with generated options
        // Replicate the same option generation logic to check the answer
        const correctAnswer = currentQuestion.correctAnswer
        const options = [
          correctAnswer,
          correctAnswer + Math.max(1, Math.floor(correctAnswer * 0.2)),
          correctAnswer - Math.max(1, Math.floor(correctAnswer * 0.15)),
          correctAnswer + Math.max(2, Math.floor(correctAnswer * 0.3))
        ].filter(opt => opt > 0)

        // Ensure we have 4 options
        while (options.length < 4) {
          const newOption = correctAnswer + options.length
          if (!options.includes(newOption)) {
            options.push(newOption)
          }
        }

        const sortedOptions = [...new Set(options)].slice(0, 4).sort((a, b) => a - b)
        const correctIndex = sortedOptions.indexOf(correctAnswer)

        isCorrect = answerIndex === correctIndex
        console.log(`🔍 NUMBER-INPUT: Options ${JSON.stringify(sortedOptions)}, correctIndex=${correctIndex}, selected=${answerIndex}, isCorrect=${isCorrect}`)
        break
    }

    // Calculate response time
    const responseTime = Date.now() - (player.lastAnswerTime || Date.now())
    
    // Update player stats
    this.updatePlayerStats(player, isCorrect, responseTime)

    // ADAPTIVE DIFFICULTY: Track performance and adjust
    // Only track player 1 (human player) for adaptive difficulty
    if (player === this.state.player1) {
      this.state.lastAnswerWasWrong = !isCorrect

      if (isCorrect) {
        // Correct: increase target difficulty (max 5)
        this.state.currentTargetDifficulty = Math.min(5, this.state.currentTargetDifficulty + 0.5)
        console.log(`📈 ADAPTIVE: Correct! Target difficulty increased to ${this.state.currentTargetDifficulty.toFixed(1)}`)
      } else {
        // Wrong: DECREASE target difficulty (min 1)
        this.state.currentTargetDifficulty = Math.max(1, this.state.currentTargetDifficulty - 1)
        console.log(`📉 ADAPTIVE: Wrong! Target difficulty decreased to ${this.state.currentTargetDifficulty.toFixed(1)}`)
      }
    }

    // Update field position and check for goals
    if (isCorrect) {
      this.movePlayerForward(player)
    } else {
      // Reset streak
      player.currentStreak = 0
    }

    // Move to next question (with adaptive reordering)
    this.nextQuestion()

    this.notifyStateUpdate()

    return {
      correct: isCorrect,
      explanation: currentQuestion.explanation
    }
  }

  // Update player statistics and adapt ELO dynamically
  private updatePlayerStats(player: PlayerState, correct: boolean, responseTime: number): void {
    const stats = player.stats
    const currentQuestion = this.getCurrentQuestion()

    if (correct) {
      stats.correctAnswers++
      player.currentStreak++
      stats.maxStreak = Math.max(stats.maxStreak, player.currentStreak)
    } else {
      stats.incorrectAnswers++
      player.currentStreak = 0
    }

    // Update average response time
    const totalAnswers = stats.correctAnswers + stats.incorrectAnswers
    stats.averageResponseTime = (stats.averageResponseTime * (totalAnswers - 1) + responseTime) / totalAnswers

    // Update accuracy
    stats.accuracy = (stats.correctAnswers / totalAnswers) * 100

    // Calculate and track elixir for this answer
    const timeLimitMs = currentQuestion?.timeLimit || 10000
    const elixirEarned = calculateElixirFromAnswer(
      responseTime,
      timeLimitMs,
      player.currentStreak,
      correct
    )

    const speedRatingInfo = getSpeedRating(responseTime, timeLimitMs)
    const streakMultiplierInfo = getStreakMultiplier(player.currentStreak)

    // Record this answer
    const answerRecord: AnswerRecord = {
      questionIndex: this.state.currentQuestionIndex,
      subject: (currentQuestion?.subject || 'math') as SubjectValue,
      responseTimeMs: responseTime,
      timeLimitMs,
      isCorrect: correct,
      elixirEarned,
      speedRating: speedRatingInfo.rating,
      streakMultiplier: streakMultiplierInfo.multiplier
    }

    player.answerHistory.push(answerRecord)
    player.elixirEarned += elixirEarned

    // Notify elixir gain callback (only for player 1, the human player)
    if (elixirEarned > 0 && player === this.state.player1) {
      const playerNumber = 'player1'
      this.callbacks.onElixirGain?.(playerNumber, elixirEarned, player.elixirEarned, speedRatingInfo.rating)
      console.log(`⚡ Elixir +${elixirEarned} (${speedRatingInfo.emoji} ${speedRatingInfo.rating}, streak: ${player.currentStreak}x${streakMultiplierInfo.multiplier.toFixed(1)})`)
    }

    // Dynamic ELO adjustment based on performance
    this.updatePlayerELO(player, correct, responseTime, currentQuestion)
  }

  // Dynamic ELO adjustment system
  private updatePlayerELO(player: PlayerState, correct: boolean, responseTime: number, question: Question | null): void {
    if (!question) return

    const currentElo = player.player.elo
    const questionDifficulty = question.difficulty
    const expectedTimeMs = question.timeLimit || 10000
    
    // Base ELO change factors
    let eloChange = 0
    
    if (correct) {
      // Reward correct answers, especially if answered quickly
      const speedBonus = Math.max(0.5, Math.min(2.0, expectedTimeMs / responseTime))
      
      // Higher reward for answering difficult questions correctly
      const difficultyMultiplier = questionDifficulty / 3.0
      
      // Streak bonus (diminishing returns)
      const streakMultiplier = 1 + (Math.min(player.currentStreak, 10) * 0.1)
      
      eloChange = 15 * difficultyMultiplier * speedBonus * streakMultiplier
      
      console.log(`📈 ELO +${Math.round(eloChange)}: difficulty=${questionDifficulty}, speed=${speedBonus.toFixed(2)}, streak=${streakMultiplier.toFixed(2)}`)
    } else {
      // Penalty for wrong answers, smaller for difficult questions
      const difficultyReduction = Math.max(0.3, 1 - (questionDifficulty - 1) * 0.2)
      
      // Bigger penalty if took a long time and still wrong
      const timePenalty = Math.min(2.0, responseTime / expectedTimeMs)
      
      eloChange = -10 * difficultyReduction * timePenalty
      
      console.log(`📉 ELO ${Math.round(eloChange)}: difficulty=${questionDifficulty}, time_penalty=${timePenalty.toFixed(2)}`)
    }
    
    // Apply ELO change with bounds
    const newElo = Math.max(400, Math.min(2000, currentElo + eloChange))
    player.player.elo = Math.round(newElo)
    
    if (Math.abs(eloChange) >= 1) {
      console.log(`🎯 Player ELO: ${currentElo} → ${player.player.elo} (${eloChange >= 0 ? '+' : ''}${Math.round(eloChange)})`)
    }

    // Trigger difficulty adaptation if significant ELO change
    if (Math.abs(eloChange) >= 20) {
      console.log(`🔄 Significant ELO change detected, adapting difficulty...`)
      this.adaptQuestionDifficulty()
    }
  }

  // Mid-game difficulty adaptation disabled - user's selected grade is respected throughout the game
  private async adaptQuestionDifficulty(): Promise<void> {
    // No-op: Grade is fixed at game start to prevent inappropriate difficulty changes
    return
  }

  // Move player forward on field
  private movePlayerForward(player: PlayerState): void {
    const moveAmount = 10 + (player.currentStreak * 2) // Bonus for streaks
    player.position = Math.min(100, player.position + moveAmount)

    // Check for goal
    if (player.position >= 90) {
      player.goals++
      player.position = 50 // Reset to midfield
      
      // Notify goal callback
      const playerNumber = player === this.state.player1 ? 'player1' : 'player2'
      this.callbacks.onGoal?.(playerNumber, player.goals)
    }
  }

  // Move to next question with ADAPTIVE DIFFICULTY
  private nextQuestion(): void {
    const remainingQuestions = this.state.questionQueue.slice(this.state.currentQuestionIndex + 1)

    // ADAPTIVE DIFFICULTY: Reorder remaining questions based on last answer
    if (this.state.lastAnswerWasWrong && remainingQuestions.length > 1) {
      // Find the easiest available question (lowest difficulty)
      const targetDifficulty = Math.floor(this.state.currentTargetDifficulty)

      // Sort remaining questions by how close they are to target difficulty
      // Prefer lower difficulty when player got it wrong
      const sortedRemaining = [...remainingQuestions].sort((a, b) => {
        const aDiff = Math.abs(a.difficulty - targetDifficulty)
        const bDiff = Math.abs(b.difficulty - targetDifficulty)
        // Prefer easier questions (lower difficulty) when target is low
        if (aDiff === bDiff) {
          return a.difficulty - b.difficulty // Prefer easier
        }
        return aDiff - bDiff
      })

      // Replace remaining queue with sorted questions
      this.state.questionQueue = [
        ...this.state.questionQueue.slice(0, this.state.currentQuestionIndex + 1),
        ...sortedRemaining
      ]

      const nextQ = sortedRemaining[0]
      console.log(`🎯 ADAPTIVE: After wrong answer, next question difficulty: ${nextQ?.difficulty || 'N/A'} (target: ${targetDifficulty})`)
    }

    this.state.currentQuestionIndex++

    // Reset answer times for both players
    if (this.state.player1) this.state.player1.lastAnswerTime = Date.now()
    if (this.state.player2) this.state.player2.lastAnswerTime = Date.now()

    // Start AI opponent for next question
    this.scheduleAIResponse()
  }

  // Schedule AI response for current question
  private scheduleAIResponse(): void {
    if (!this.aiOpponent || this.state.gameStatus !== 'active') return

    const currentQuestion = this.getCurrentQuestion()
    if (!currentQuestion) return

    // Clear any existing AI timer
    if (this.aiResponseTimer) {
      clearTimeout(this.aiResponseTimer)
    }

    // Get AI's answer and response time
    const aiAnswer = this.aiOpponent.getAnswer(currentQuestion)
    
    // Schedule AI response
    this.aiResponseTimer = setTimeout(() => {
      if (this.state.player2 && this.state.gameStatus === 'active') {
        this.handleAIResponse(aiAnswer.isCorrect)
      }
    }, aiAnswer.responseTime)
  }

  // Handle AI opponent's response
  private handleAIResponse(
    isCorrect: boolean 
    // aiAnswer: { answerIndex?: number; answerValue?: number | boolean; isCorrect: boolean } // unused parameter
  ): void {
    if (!this.state.player2) return

    // Calculate response time for stats
    const responseTime = Date.now() - (this.state.player2.lastAnswerTime || Date.now())
    
    // Update AI player stats
    this.updatePlayerStats(this.state.player2, isCorrect, responseTime)

    // Move AI player forward if correct
    if (isCorrect) {
      this.movePlayerForward(this.state.player2)
    } else {
      this.state.player2.currentStreak = 0
    }

    this.notifyStateUpdate()
  }

  // Get current question
  getCurrentQuestion(): Question | null {
    if (this.state.currentQuestionIndex >= this.state.questionQueue.length) {
      return null
    }
    return this.state.questionQueue[this.state.currentQuestionIndex]
  }

  // End the game
  private endGame(): void {
    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = undefined
    }

    this.state.gameStatus = 'finished'

    // Determine winner
    const p1Goals = this.state.player1?.goals || 0
    const p2Goals = this.state.player2?.goals || 0

    if (p1Goals > p2Goals) {
      this.state.winner = 'player1'
    } else if (p2Goals > p1Goals) {
      this.state.winner = 'player2'
    } else {
      this.state.winner = 'tie'
    }

    // Calculate elixir summary for player 1 (human player)
    if (this.state.player1) {
      const answerHistory = this.state.player1.answerHistory
      const speedBonuses = {
        lightning: answerHistory.filter(a => a.speedRating === 'lightning').length,
        fast: answerHistory.filter(a => a.speedRating === 'fast').length,
        normal: answerHistory.filter(a => a.speedRating === 'normal').length,
        slow: answerHistory.filter(a => a.speedRating === 'slow').length,
        lastSecond: answerHistory.filter(a => a.speedRating === 'last-second').length
      }

      // Calculate streak bonus (sum of bonus elixir from streak multipliers)
      let streakBonus = 0
      answerHistory.forEach(answer => {
        if (answer.isCorrect && answer.streakMultiplier > 1) {
          // Calculate what the base would have been without streak
          const baseElixir = Math.round(answer.elixirEarned / answer.streakMultiplier)
          streakBonus += answer.elixirEarned - baseElixir
        }
      })

      this.state.elixirSummary = {
        totalElixir: this.state.player1.elixirEarned,
        questionsAnswered: answerHistory,
        speedBonuses,
        streakBonus,
        maxStreak: this.state.player1.stats.maxStreak
      }

      console.log(`🏆 Game ended! Total elixir earned: ${this.state.player1.elixirEarned}`)
      console.log(`   Speed bonuses: ⚡${speedBonuses.lightning} 🏃${speedBonuses.fast} 👍${speedBonuses.normal} 🐢${speedBonuses.slow} 😅${speedBonuses.lastSecond}`)
      console.log(`   Max streak: ${this.state.player1.stats.maxStreak}, Streak bonus: +${streakBonus}`)
    }

    this.callbacks.onGameEnd?.(this.state.winner, this.state)
    this.notifyStateUpdate()
  }

  // Pause/Resume game
  pauseGame(): void {
    if (this.state.gameStatus === 'active') {
      this.state.gameStatus = 'paused'
      if (this.timerId) {
        clearInterval(this.timerId)
        this.timerId = undefined
      }
      if (this.aiResponseTimer) {
        clearTimeout(this.aiResponseTimer)
        this.aiResponseTimer = undefined
      }
      this.notifyStateUpdate()
    }
  }

  resumeGame(): void {
    if (this.state.gameStatus === 'paused') {
      this.beginActiveGame()
    }
  }

  // Get player by ID
  private getPlayerById(playerId: string): PlayerState | null {
    if (this.state.player1?.player.id === playerId) return this.state.player1
    if (this.state.player2?.player.id === playerId) return this.state.player2
    return null
  }

  // Initialize empty stats
  private initializeStats(): GameStats {
    return {
      correctAnswers: 0,
      incorrectAnswers: 0,
      streak: 0,
      maxStreak: 0,
      averageResponseTime: 0,
      accuracy: 0
    }
  }

  // Notify state update
  private notifyStateUpdate(): void {
    this.callbacks.onStateUpdate?.(this.state)
  }

  // Get current state (read-only)
  getState(): Readonly<GameEngineState> {
    return { ...this.state }
  }

  // Clean up resources
  destroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId)
    }
    if (this.aiResponseTimer) {
      clearTimeout(this.aiResponseTimer)
    }
    if (this.aiOpponent) {
      this.aiOpponent.reset()
    }
  }
}