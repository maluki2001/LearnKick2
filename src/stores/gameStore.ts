import { create } from 'zustand'
import { GameEngine, GameEngineState } from '@/lib/gameEngine'
import { Player } from '@/types/game'
import { Question } from '@/types/questions'
import { useTeamStore } from './teamStore'
import type { SubjectValue, LeagueTier } from '@/types/team'
import { playSound } from '@/hooks/useSounds'
import { keepScreenOn } from '@/hooks/useWakeLock'
import { offlineStorage } from '@/lib/offlineStorage'

// Match result data for displaying in MatchResults modal
interface MatchResultData {
  matchResult: 'win' | 'draw' | 'loss'
  goalsFor: number
  goalsAgainst: number
  elixirEarned: number
  xpDistributed: Record<SubjectValue, number>
  cardsLeveledUp: SubjectValue[]
  pointsChange: number
  newLeaguePoints: number
  newLeagueTier: LeagueTier
  maxStreak: number
  questionsAnswered: number
  correctAnswers: number
}

interface GameStore {
  // Game engine instance
  gameEngine: GameEngine | null

  // Game state (derived from engine)
  gameState: GameEngineState | null
  isGameActive: boolean
  currentQuestion: Question | null

  // UI state
  showAnswer: boolean
  selectedAnswer: number | null
  answerFeedback: { correct: boolean; explanation?: string } | null

  // Match result (for showing MatchResults modal after game ends)
  matchResultData: MatchResultData | null
  showMatchResults: boolean

  // Actions
  initializeGame: (
    player1: Player,
    player2: Player,
    arena: 'soccer' | 'hockey',
    subject?: string,
    language?: string,
    playerGrade?: number
  ) => Promise<void>
  quickStart: (config: {
    playerName: string
    playerElo: number
    grade: number
    subject: string
    language: string
    arena: 'soccer' | 'hockey'
  }) => Promise<void>
  startGame: () => void
  submitAnswer: (answerIndex: number) => void
  pauseGame: () => void
  resumeGame: () => void
  resetGame: () => void

  // Match results
  dismissMatchResults: () => void

  // Internal methods
  updateGameState: (state: GameEngineState) => void
  onGameEnd: (winner: 'player1' | 'player2' | 'tie', finalState: GameEngineState) => void
  onGoal: (player: 'player1' | 'player2', newScore: number) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameEngine: null,
  gameState: null,
  isGameActive: false,
  currentQuestion: null,
  showAnswer: false,
  selectedAnswer: null,
  answerFeedback: null,
  matchResultData: null,
  showMatchResults: false,

  initializeGame: async (player1, player2, arena, subject, language = 'en', playerGrade) => {
    console.log('🏗️ Creating game engine...')
    const engine = new GameEngine({
      onStateUpdate: (state) => get().updateGameState(state),
      onGameEnd: (winner, finalState) => get().onGameEnd(winner, finalState),
      onGoal: (player, newScore) => get().onGoal(player, newScore)
    })

    // Set loading state
    set({
      gameEngine: engine,
      gameState: null,
      isGameActive: false,
      currentQuestion: null,
      showAnswer: false,
      selectedAnswer: null,
      answerFeedback: null
    })

    try {
      console.log('🎯 Calling engine.initializeGame...')
      await engine.initializeGame(player1, player2, arena, subject, language, playerGrade)
      console.log('📊 Engine initialized, updating store state...')

      set({
        gameEngine: engine,
        gameState: engine.getState(),
        isGameActive: false,
        currentQuestion: engine.getCurrentQuestion(),
        showAnswer: false,
        selectedAnswer: null,
        answerFeedback: null
      })
      console.log('✅ Store state updated successfully')
    } catch (error) {
      console.error('❌ Failed to initialize game:', error)
      // You might want to show an error state here
    }
  },

  quickStart: async (config) => {
    console.log('⚡ Quick start initiated with config:', config)

    const player1: Player = {
      id: '1',
      name: config.playerName,
      elo: config.playerElo
    }

    const player2: Player = {
      id: '2',
      name: 'AI Rival',
      elo: Math.max(800, config.playerElo - 50) // AI slightly weaker
    }

    try {
      // Use existing initializeGame
      console.log('⚡ Calling initializeGame...')
      await get().initializeGame(
        player1,
        player2,
        config.arena,
        config.subject,
        config.language,
        config.grade
      )
      console.log('⚡ initializeGame completed successfully')

      // Auto-start after a brief delay
      setTimeout(() => {
        console.log('⚡ Quick start - starting game')
        get().startGame()
      }, 500)
    } catch (error) {
      console.error('❌ Quick start failed:', error)
      throw error
    }
  },

  startGame: () => {
    console.log('🚀 Store startGame called')
    const { gameEngine } = get()
    if (gameEngine) {
      console.log('🎮 Calling engine.startGame()')
      gameEngine.startGame()
      set({ isGameActive: true })
      console.log('✅ Game marked as active')

      // Play game start sound
      playSound('game-start')

      // Request wake lock to keep screen on during gameplay
      keepScreenOn().catch(() => {
        console.log('Could not acquire wake lock')
      })
    } else {
      console.error('❌ No game engine found!')
    }
  },

  submitAnswer: (answerIndex) => {
    const { gameEngine, gameState } = get()
    if (!gameEngine || !gameState?.player1) return

    // Prevent multiple submissions
    if (get().showAnswer) return

    set({ selectedAnswer: answerIndex, showAnswer: true })

    // Submit answer for player1 (human player)
    // NOTE: This will advance to the next question in the engine
    const result = gameEngine.submitAnswer(gameState.player1.player.id, answerIndex)

    set({ answerFeedback: result })

    // Auto-advance UI after showing feedback
    // The engine already advanced, but we delay the UI update
    setTimeout(() => {
      // Reset UI state and sync with engine's current question
      set({
        showAnswer: false,
        selectedAnswer: null,
        answerFeedback: null,
        currentQuestion: get().gameEngine?.getCurrentQuestion() || null
      })
    }, 2000)
  },

  pauseGame: () => {
    const { gameEngine } = get()
    if (gameEngine) {
      gameEngine.pauseGame()
      set({ isGameActive: false })
    }
  },

  resumeGame: () => {
    const { gameEngine } = get()
    if (gameEngine) {
      gameEngine.resumeGame()
      set({ isGameActive: true })
    }
  },

  resetGame: () => {
    const { gameEngine } = get()
    if (gameEngine) {
      gameEngine.destroy()
    }

    set({
      gameEngine: null,
      gameState: null,
      isGameActive: false,
      currentQuestion: null,
      showAnswer: false,
      selectedAnswer: null,
      answerFeedback: null
    })
  },

  updateGameState: (state) => {
    const { gameEngine, showAnswer } = get()
    const engineQuestion = gameEngine?.getCurrentQuestion() || null

    console.log('🔄 Updating game state:', {
      status: state.gameStatus,
      questionIndex: state.currentQuestionIndex,
      queueLength: state.questionQueue.length,
      hasQuestion: !!engineQuestion,
      showingAnswer: showAnswer,
      questionText: engineQuestion ? ('question' in engineQuestion ? engineQuestion.question : engineQuestion.statement) : undefined
    })

    // CRITICAL: Do NOT update currentQuestion while showing answer feedback
    // This prevents the new question from appearing with old answer indicators
    if (showAnswer) {
      console.log('⏸️ Skipping question update - showing answer feedback')
      set({
        gameState: state,
        isGameActive: state.gameStatus === 'active'
        // Keep existing currentQuestion while showing feedback
      })
    } else {
      set({
        gameState: state,
        currentQuestion: engineQuestion,
        isGameActive: state.gameStatus === 'active'
      })
    }
  },

  dismissMatchResults: () => {
    set({
      showMatchResults: false,
      matchResultData: null
    })
  },

  onGameEnd: (winner, finalState) => {
    console.log('🏁 Game ended!', { winner, finalState })

    // Get team store to process results
    const teamStore = useTeamStore.getState()
    const team = teamStore.team

    // Extract answer history from player 1 (human player)
    const answerHistory = finalState.player1?.answerHistory || []

    // Map answer history to the format expected by teamStore
    const questionsAnswered = answerHistory.map(answer => ({
      subject: answer.subject,
      responseTimeMs: answer.responseTimeMs,
      timeLimitMs: answer.timeLimitMs,
      isCorrect: answer.isCorrect
    }))

    // Determine match result
    const goalsFor = finalState.player1?.goals || 0
    const goalsAgainst = finalState.player2?.goals || 0
    const matchResult: 'win' | 'draw' | 'loss' =
      winner === 'player1' ? 'win' :
      winner === 'player2' ? 'loss' : 'draw'

    // Process match results through team store
    let matchResultData: MatchResultData | null = null

    if (team) {
      const results = teamStore.processMatchResults(
        questionsAnswered,
        matchResult,
        goalsFor,
        goalsAgainst
      )

      // Get updated team state after processing
      const updatedTeam = useTeamStore.getState().team

      // Count correct answers
      const correctAnswers = answerHistory.filter(a => a.isCorrect).length

      matchResultData = {
        matchResult,
        goalsFor,
        goalsAgainst,
        elixirEarned: results.elixirEarned,
        xpDistributed: results.xpDistributed,
        cardsLeveledUp: results.cardsLeveledUp,
        pointsChange: results.pointsChange,
        newLeaguePoints: updatedTeam?.leaguePoints || 0,
        newLeagueTier: updatedTeam?.leagueTier || 'BRONZE',
        maxStreak: finalState.elixirSummary?.maxStreak || 0,
        questionsAnswered: answerHistory.length,
        correctAnswers
      }

      console.log('📊 Match results processed:', matchResultData)
    }

    // Play game end sound
    playSound('game-end')

    // Play victory or defeat sound after a short delay
    setTimeout(() => {
      if (winner === 'player1') {
        playSound('victory')
      } else if (winner === 'player2') {
        playSound('defeat')
      }
    }, 1000)

    set({
      isGameActive: false,
      gameState: finalState,
      matchResultData,
      showMatchResults: matchResultData !== null
    })

    // Auto-cache questions for offline play after first game
    // This runs in the background and doesn't block the UI
    if (typeof window !== 'undefined' && navigator.onLine) {
      const cacheQuestionsInBackground = async () => {
        try {
          // Check if we already have cached questions
          const stats = await offlineStorage.getStorageStats()

          // Only auto-download if we have less than 50 cached questions
          if (stats.questionsCount < 50) {
            console.log('📥 Auto-caching questions for offline play...')

            // Get player's grade and language from the game state
            const grade = finalState.questionQueue[0]?.grade || 3
            const language = finalState.questionQueue[0]?.language || 'de'

            // Fetch questions from API
            const params = new URLSearchParams()
            params.append('grade', grade.toString())
            params.append('language', language)

            const response = await fetch(`/api/questions?${params.toString()}`)
            if (response.ok) {
              const result = await response.json()
              if (result.success && result.questions?.length > 0) {
                // Format and cache questions
                const questions = result.questions.map((q: Record<string, unknown>) => ({
                  id: q.id as string,
                  type: q.type as string,
                  subject: q.subject as string,
                  grade: q.grade as number,
                  difficulty: q.difficulty as number,
                  language: q.language as string,
                  question: q.question as string | undefined,
                  statement: q.statement as string | undefined,
                  answers: (q.answers || []) as string[],
                  correctIndex: typeof q.correct_index === 'number' ? q.correct_index : 0,
                  correctAnswer: q.correct_answer,
                  correct: q.type === 'true-false'
                    ? ['true', 'wahr', 'richtig', 'vrai'].includes(String(q.correct_answer).toLowerCase())
                    : undefined,
                  explanation: q.explanation as string | undefined,
                  tags: (q.tags || []) as string[],
                  timeLimit: (q.time_limit || 15000) as number
                }))

                await offlineStorage.cacheQuestions(questions)
                console.log(`✅ Auto-cached ${questions.length} questions for offline play`)
              }
            }
          } else {
            console.log('📦 Already have cached questions:', stats.questionsCount)
          }
        } catch (error) {
          console.error('Failed to auto-cache questions:', error)
        }
      }

      // Run in background after a short delay (don't block match results)
      setTimeout(cacheQuestionsInBackground, 2000)
    }
  },

  onGoal: (player, newScore) => {
    console.log('⚽ Goal scored!', { player, newScore })
    // Play goal celebration sound
    playSound('goal')
  }
}))

// Helper hook for easy access to player states
export const usePlayerStates = () => {
  const gameState = useGameStore(state => state.gameState)
  
  return {
    player1: gameState?.player1 || null,
    player2: gameState?.player2 || null,
    currentPlayerTurn: gameState?.player1 // For now, always player1 (human)
  }
}

// Helper hook for game status
export const useGameStatus = () => {
  const { gameState, isGameActive } = useGameStore()
  
  return {
    status: gameState?.gameStatus || 'waiting',
    timeRemaining: gameState?.timeRemaining || 60,
    isActive: isGameActive,
    winner: gameState?.winner,
    currentQuestionIndex: gameState?.currentQuestionIndex || 0,
    totalQuestions: gameState?.questionQueue.length || 0
  }
}