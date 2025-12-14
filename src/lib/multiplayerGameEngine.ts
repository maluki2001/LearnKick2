// Multiplayer Game Engine - Server-authoritative game logic
import type {
  MultiplayerGameState,
  MultiplayerPlayer,
  AnswerResult,
  GameEndResult,
  TrophyUpdate,
  GameRoom,
} from '@/types/socket'
import type { Question } from '@/types/questions'
import { processMatchResult } from './trophyService'
import { getLeagueByTrophies } from '@/constants/leagues'

// Game configuration
export const GAME_CONFIG = {
  GAME_DURATION: 60,           // Total game time in seconds
  QUESTION_TIME: 10,           // Time per question in seconds
  COUNTDOWN_DURATION: 3,       // Pre-game countdown
  CORRECT_ANSWER_POINTS: 100,  // Points for correct answer
  TIME_BONUS_MAX: 50,          // Max bonus for fast answers
  FIELD_POSITIONS: 11,         // -5 to +5
  GOALS_TO_SCORE: 3,           // Correct answers needed for a goal
  RECONNECT_WINDOW: 30,        // Seconds to reconnect after disconnect
  MIN_QUESTIONS: 10,           // Minimum questions per game
  MAX_QUESTIONS: 20,           // Maximum questions per game
}

// In-memory storage for active games (would use Redis in production)
const activeGames = new Map<string, GameRoom>()

/**
 * Create a new multiplayer game
 */
export function createGame(
  matchId: string,
  player1: MultiplayerPlayer,
  player2: MultiplayerPlayer,
  questions: Question[]
): GameRoom {
  const gameState: MultiplayerGameState = {
    matchId,
    status: 'waiting',
    player1: { ...player1, isReady: false, isConnected: true },
    player2: { ...player2, isReady: false, isConnected: true },
    player1Score: 0,
    player2Score: 0,
    player1Goals: 0,
    player2Goals: 0,
    player1Correct: 0,
    player2Correct: 0,
    currentQuestionIndex: -1,
    totalQuestions: questions.length,
    timeRemaining: GAME_CONFIG.GAME_DURATION,
    fieldPosition: 0, // Center
    questions,
  }

  const gameRoom: GameRoom = {
    matchId,
    gameState,
    player1SocketId: null,
    player2SocketId: null,
    questionTimer: null,
    gameTimer: null,
    reconnectTimers: new Map(),
    answeredThisQuestion: new Set(),
    createdAt: new Date(),
  }

  activeGames.set(matchId, gameRoom)
  return gameRoom
}

/**
 * Get a game by match ID
 */
export function getGame(matchId: string): GameRoom | undefined {
  return activeGames.get(matchId)
}

/**
 * Remove a game
 */
export function removeGame(matchId: string): void {
  const game = activeGames.get(matchId)
  if (game) {
    // Clear timers
    if (game.questionTimer) clearTimeout(game.questionTimer)
    if (game.gameTimer) clearInterval(game.gameTimer)
    game.reconnectTimers.forEach(timer => clearTimeout(timer))
    activeGames.delete(matchId)
  }
}

/**
 * Set player ready status
 */
export function setPlayerReady(matchId: string, playerId: string): boolean {
  const game = activeGames.get(matchId)
  if (!game) return false

  if (game.gameState.player1.id === playerId) {
    game.gameState.player1.isReady = true
  } else if (game.gameState.player2.id === playerId) {
    game.gameState.player2.isReady = true
  } else {
    return false
  }

  return true
}

/**
 * Check if both players are ready
 */
export function areBothPlayersReady(matchId: string): boolean {
  const game = activeGames.get(matchId)
  if (!game) return false

  return game.gameState.player1.isReady && game.gameState.player2.isReady
}

/**
 * Start the game countdown
 */
export function startCountdown(matchId: string): void {
  const game = activeGames.get(matchId)
  if (!game) return

  game.gameState.status = 'countdown'
}

/**
 * Start the actual game
 */
export function startGame(matchId: string): MultiplayerGameState | null {
  const game = activeGames.get(matchId)
  if (!game) return null

  game.gameState.status = 'active'
  game.gameState.startedAt = new Date().toISOString()
  game.gameState.currentQuestionIndex = 0

  return game.gameState
}

/**
 * Get current question (without revealing correct answer to client)
 */
export function getCurrentQuestion(matchId: string): {
  questionIndex: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  question: Record<string, any>
  timeLimit: number
} | null {
  const game = activeGames.get(matchId)
  if (!game || game.gameState.status !== 'active') return null

  const questionIndex = game.gameState.currentQuestionIndex
  if (questionIndex < 0 || questionIndex >= game.gameState.questions.length) {
    return null
  }

  const fullQuestion = game.gameState.questions[questionIndex]

  // Strip sensitive data based on question type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeQuestion: Record<string, any> = { ...fullQuestion }

  // Remove answer-related fields depending on question type
  delete safeQuestion.correctIndex
  delete safeQuestion.correctAnswer
  delete safeQuestion.correct
  delete safeQuestion.explanation

  return {
    questionIndex,
    question: safeQuestion,
    timeLimit: GAME_CONFIG.QUESTION_TIME,
  }
}

/**
 * Process an answer submission
 */
export function processAnswer(
  matchId: string,
  playerId: string,
  questionIndex: number,
  answerIndex: number,
  timeElapsed: number
): AnswerResult | null {
  const game = activeGames.get(matchId)
  if (!game || game.gameState.status !== 'active') return null

  // Check if this is the current question
  if (questionIndex !== game.gameState.currentQuestionIndex) {
    return null
  }

  // Check if player already answered
  const answerKey = `${playerId}-${questionIndex}`
  if (game.answeredThisQuestion.has(answerKey)) {
    return null
  }
  game.answeredThisQuestion.add(answerKey)

  const question = game.gameState.questions[questionIndex]
  const isPlayer1 = game.gameState.player1.id === playerId

  // Determine if answer is correct based on question type
  let isCorrect = false
  let correctIndex = -1 // The correct answer index for display purposes
  if (question.type === 'multiple-choice' || question.type === 'image-question') {
    correctIndex = question.correctIndex
    isCorrect = answerIndex === question.correctIndex
  } else if (question.type === 'true-false') {
    // For true-false, answerIndex 0 = true, 1 = false
    correctIndex = question.correct ? 0 : 1
    isCorrect = (answerIndex === 0) === question.correct
  } else if (question.type === 'number-input') {
    // For number input, we compare the answer value directly
    // This is handled differently - the client sends the actual number as answerIndex
    const tolerance = question.tolerance ?? 0
    correctIndex = question.correctAnswer
    isCorrect = Math.abs(answerIndex - question.correctAnswer) <= tolerance
  }

  // Calculate points
  let pointsEarned = 0
  if (isCorrect) {
    pointsEarned = GAME_CONFIG.CORRECT_ANSWER_POINTS
    // Time bonus: faster answers get more points
    const timeBonus = Math.max(
      0,
      Math.round(
        GAME_CONFIG.TIME_BONUS_MAX * (1 - timeElapsed / (GAME_CONFIG.QUESTION_TIME * 1000))
      )
    )
    pointsEarned += timeBonus
  }

  // Update scores and correct counts
  if (isPlayer1) {
    game.gameState.player1Score += pointsEarned
    if (isCorrect) game.gameState.player1Correct++
  } else {
    game.gameState.player2Score += pointsEarned
    if (isCorrect) game.gameState.player2Correct++
  }

  // Update field position
  const positionChange = isCorrect ? (isPlayer1 ? 1 : -1) : (isPlayer1 ? -1 : 1)
  game.gameState.fieldPosition = Math.max(
    -5,
    Math.min(5, game.gameState.fieldPosition + positionChange)
  )

  // Check for goal
  let goalScored = false
  let scoredBy: string | undefined

  if (game.gameState.fieldPosition >= 5) {
    // Player 1 scores
    game.gameState.player1Goals++
    game.gameState.fieldPosition = 0
    goalScored = true
    scoredBy = game.gameState.player1.id
  } else if (game.gameState.fieldPosition <= -5) {
    // Player 2 scores
    game.gameState.player2Goals++
    game.gameState.fieldPosition = 0
    goalScored = true
    scoredBy = game.gameState.player2.id
  }

  return {
    playerId,
    questionIndex,
    answerIndex,
    isCorrect,
    correctIndex,
    timeElapsed,
    pointsEarned,
    newFieldPosition: game.gameState.fieldPosition,
    goalScored,
    scoredBy,
  }
}

/**
 * Move to next question
 */
export function nextQuestion(matchId: string): boolean {
  const game = activeGames.get(matchId)
  if (!game) return false

  game.gameState.currentQuestionIndex++
  game.answeredThisQuestion.clear()

  // Check if game should end
  if (game.gameState.currentQuestionIndex >= game.gameState.questions.length) {
    return false
  }

  return true
}

/**
 * Update game time
 */
export function updateGameTime(matchId: string): number {
  const game = activeGames.get(matchId)
  if (!game) return 0

  game.gameState.timeRemaining--
  return game.gameState.timeRemaining
}

/**
 * End the game and calculate results
 */
export function endGame(matchId: string): GameEndResult | null {
  const game = activeGames.get(matchId)
  if (!game) return null

  const { gameState } = game
  gameState.status = 'finished'
  gameState.finishedAt = new Date().toISOString()

  // Determine winner
  let winnerId: string | null = null
  let isDraw = false

  if (gameState.player1Goals > gameState.player2Goals) {
    winnerId = gameState.player1.id
  } else if (gameState.player2Goals > gameState.player1Goals) {
    winnerId = gameState.player2.id
  } else if (gameState.player1Score > gameState.player2Score) {
    winnerId = gameState.player1.id
  } else if (gameState.player2Score > gameState.player1Score) {
    winnerId = gameState.player2.id
  } else {
    isDraw = true
  }

  gameState.winnerId = winnerId

  // Calculate trophy changes
  const matchResult = {
    winnerId: winnerId || gameState.player1.id,
    loserId: winnerId === gameState.player1.id ? gameState.player2.id : gameState.player1.id,
    winnerTrophies: winnerId === gameState.player1.id ? gameState.player1.trophies : gameState.player2.trophies,
    loserTrophies: winnerId === gameState.player1.id ? gameState.player2.trophies : gameState.player1.trophies,
    winnerStreak: 0, // Would need to track this
    isDraw,
  }

  const trophyResults = processMatchResult(matchResult)

  const player1TrophyChange: TrophyUpdate = winnerId === gameState.player1.id
    ? {
        playerId: gameState.player1.id,
        previousTrophies: trophyResults.winner.previousTrophies,
        newTrophies: trophyResults.winner.newTrophies,
        change: trophyResults.winner.change,
        previousLeague: trophyResults.winner.previousLeague.id,
        newLeague: trophyResults.winner.newLeague.id,
        promoted: trophyResults.winner.promoted,
        demoted: false,
      }
    : {
        playerId: gameState.player1.id,
        previousTrophies: trophyResults.loser.previousTrophies,
        newTrophies: trophyResults.loser.newTrophies,
        change: trophyResults.loser.change,
        previousLeague: trophyResults.loser.previousLeague.id,
        newLeague: trophyResults.loser.newLeague.id,
        promoted: false,
        demoted: trophyResults.loser.demoted,
      }

  const player2TrophyChange: TrophyUpdate = winnerId === gameState.player2.id
    ? {
        playerId: gameState.player2.id,
        previousTrophies: trophyResults.winner.previousTrophies,
        newTrophies: trophyResults.winner.newTrophies,
        change: trophyResults.winner.change,
        previousLeague: trophyResults.winner.previousLeague.id,
        newLeague: trophyResults.winner.newLeague.id,
        promoted: trophyResults.winner.promoted,
        demoted: false,
      }
    : {
        playerId: gameState.player2.id,
        previousTrophies: trophyResults.loser.previousTrophies,
        newTrophies: trophyResults.loser.newTrophies,
        change: trophyResults.loser.change,
        previousLeague: trophyResults.loser.previousLeague.id,
        newLeague: trophyResults.loser.newLeague.id,
        promoted: false,
        demoted: trophyResults.loser.demoted,
      }

  const duration = gameState.startedAt
    ? Math.round((new Date(gameState.finishedAt).getTime() - new Date(gameState.startedAt).getTime()) / 1000)
    : GAME_CONFIG.GAME_DURATION

  return {
    matchId,
    winnerId,
    isDraw,
    player1Goals: gameState.player1Goals,
    player2Goals: gameState.player2Goals,
    player1Correct: gameState.player1Correct,
    player2Correct: gameState.player2Correct,
    player1TrophyChange,
    player2TrophyChange,
    duration,
  }
}

/**
 * Handle player disconnect
 */
export function handlePlayerDisconnect(matchId: string, playerId: string): void {
  const game = activeGames.get(matchId)
  if (!game) return

  if (game.gameState.player1.id === playerId) {
    game.gameState.player1.isConnected = false
  } else if (game.gameState.player2.id === playerId) {
    game.gameState.player2.isConnected = false
  }
}

/**
 * Handle player reconnect
 */
export function handlePlayerReconnect(matchId: string, playerId: string): boolean {
  const game = activeGames.get(matchId)
  if (!game) return false

  if (game.gameState.player1.id === playerId) {
    game.gameState.player1.isConnected = true
    return true
  } else if (game.gameState.player2.id === playerId) {
    game.gameState.player2.isConnected = true
    return true
  }

  return false
}

/**
 * Abandon game (when player doesn't reconnect in time)
 */
export function abandonGame(matchId: string, disconnectedPlayerId: string): GameEndResult | null {
  const game = activeGames.get(matchId)
  if (!game) return null

  const { gameState } = game
  gameState.status = 'abandoned'

  // Winner is the player who stayed
  const winnerId = gameState.player1.id === disconnectedPlayerId
    ? gameState.player2.id
    : gameState.player1.id

  gameState.winnerId = winnerId

  // Give full win to remaining player
  const winnerTrophyChange: TrophyUpdate = {
    playerId: winnerId,
    previousTrophies: winnerId === gameState.player1.id
      ? gameState.player1.trophies
      : gameState.player2.trophies,
    newTrophies: (winnerId === gameState.player1.id
      ? gameState.player1.trophies
      : gameState.player2.trophies) + 30,
    change: 30,
    previousLeague: getLeagueByTrophies(
      winnerId === gameState.player1.id
        ? gameState.player1.trophies
        : gameState.player2.trophies
    ).id,
    newLeague: getLeagueByTrophies(
      (winnerId === gameState.player1.id
        ? gameState.player1.trophies
        : gameState.player2.trophies) + 30
    ).id,
    promoted: false,
    demoted: false,
  }

  const loserTrophyChange: TrophyUpdate = {
    playerId: disconnectedPlayerId,
    previousTrophies: disconnectedPlayerId === gameState.player1.id
      ? gameState.player1.trophies
      : gameState.player2.trophies,
    newTrophies: Math.max(0, (disconnectedPlayerId === gameState.player1.id
      ? gameState.player1.trophies
      : gameState.player2.trophies) - 30),
    change: -30,
    previousLeague: getLeagueByTrophies(
      disconnectedPlayerId === gameState.player1.id
        ? gameState.player1.trophies
        : gameState.player2.trophies
    ).id,
    newLeague: getLeagueByTrophies(
      Math.max(0, (disconnectedPlayerId === gameState.player1.id
        ? gameState.player1.trophies
        : gameState.player2.trophies) - 30)
    ).id,
    promoted: false,
    demoted: false,
  }

  return {
    matchId,
    winnerId,
    isDraw: false,
    player1Goals: gameState.player1Goals,
    player2Goals: gameState.player2Goals,
    player1Correct: gameState.player1Correct,
    player2Correct: gameState.player2Correct,
    player1TrophyChange: gameState.player1.id === winnerId
      ? winnerTrophyChange
      : loserTrophyChange,
    player2TrophyChange: gameState.player2.id === winnerId
      ? winnerTrophyChange
      : loserTrophyChange,
    duration: 0,
  }
}

/**
 * Get all active games (for admin/debugging)
 */
export function getActiveGames(): Map<string, GameRoom> {
  return activeGames
}

/**
 * Get game state for a player (filtered view)
 */
export function getGameStateForPlayer(
  matchId: string,
  playerId: string
): MultiplayerGameState | null {
  const game = activeGames.get(matchId)
  if (!game) return null

  // Return game state without revealing correct answers for future questions
  const state = { ...game.gameState }

  // Strip correct answers from questions not yet answered
   
  state.questions = state.questions.map((q, index) => {
    if (index > state.currentQuestionIndex) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const safeQuestion: Record<string, any> = { ...q }
      // Remove all answer-related properties
      delete safeQuestion.correctIndex
      delete safeQuestion.correctAnswer
      delete safeQuestion.correct
      delete safeQuestion.explanation
      return safeQuestion as Question
    }
    return q
  })

  return state
}
