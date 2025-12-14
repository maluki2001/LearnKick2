// Socket.io Event Types for Real-time Multiplayer
import { Question } from './questions'

// Player information for multiplayer
export interface MultiplayerPlayer {
  id: string
  name: string
  trophies: number
  league: string
  grade: number
  schoolId?: string | null
  isReady: boolean
  isConnected: boolean
}

// Game state shared between players
export interface MultiplayerGameState {
  matchId: string
  status: 'waiting' | 'countdown' | 'active' | 'paused' | 'finished' | 'abandoned'
  player1: MultiplayerPlayer
  player2: MultiplayerPlayer
  player1Score: number
  player2Score: number
  player1Goals: number
  player2Goals: number
  player1Correct: number
  player2Correct: number
  currentQuestionIndex: number
  totalQuestions: number
  timeRemaining: number  // seconds
  fieldPosition: number  // -5 to +5, 0 is center
  questions: Question[]
  winnerId?: string | null
  startedAt?: string
  finishedAt?: string
}

// Question with answer tracking
export interface GameQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  difficulty: number
  timeLimit: number  // seconds per question
}

// Answer submission
export interface AnswerSubmission {
  matchId: string
  questionIndex: number
  answerIndex: number
  timeElapsed: number  // ms taken to answer
}

// Answer result from server
export interface AnswerResult {
  playerId: string
  questionIndex: number
  answerIndex: number
  isCorrect: boolean
  correctIndex: number
  timeElapsed: number
  pointsEarned: number
  newFieldPosition: number
  goalScored: boolean
  scoredBy?: string
}

// Trophy change result
export interface TrophyUpdate {
  playerId: string
  previousTrophies: number
  newTrophies: number
  change: number
  previousLeague: string
  newLeague: string
  promoted: boolean
  demoted: boolean
}

// Game end result
export interface GameEndResult {
  matchId: string
  winnerId: string | null
  isDraw: boolean
  player1Goals: number
  player2Goals: number
  player1Correct: number
  player2Correct: number
  player1TrophyChange: TrophyUpdate
  player2TrophyChange: TrophyUpdate
  duration: number  // seconds
}

// ============================================
// Socket Events - Server to Client
// ============================================
export interface ServerToClientEvents {
  // Connection events
  connected: (data: { socketId: string }) => void
  error: (data: { message: string; code?: string }) => void

  // Matchmaking events
  match_found: (data: {
    matchId: string
    opponent: {
      id: string
      name: string
      trophies: number
      league: string
      grade: number
    }
  }) => void

  // Match events
  player_joined: (data: { player: MultiplayerPlayer; isPlayer1: boolean }) => void
  player_left: (data: { playerId: string; reason: string }) => void
  player_ready: (data: { playerId: string }) => void
  both_ready: () => void

  // Game flow events
  game_countdown: (data: { countdown: number }) => void
  game_start: (data: { gameState: MultiplayerGameState }) => void
  question_start: (data: {
    questionIndex: number
    question: Omit<GameQuestion, 'correctIndex'>
    timeLimit: number
  }) => void

  // Answer events
  answer_result: (data: AnswerResult) => void
  opponent_answered: (data: {
    playerId: string
    questionIndex: number
    timeElapsed: number
    // Don't reveal if correct until both answered or time up
  }) => void

  // Score updates
  score_update: (data: {
    player1Score: number
    player2Score: number
    player1Goals: number
    player2Goals: number
    fieldPosition: number
  }) => void
  goal_scored: (data: {
    scoredBy: string
    scorerName: string
    player1Goals: number
    player2Goals: number
  }) => void

  // Time events
  time_update: (data: { timeRemaining: number }) => void
  time_warning: (data: { secondsLeft: number }) => void

  // Game end events
  game_end: (data: GameEndResult) => void
  opponent_disconnected: (data: {
    playerId: string
    reconnectWindow: number  // seconds to reconnect
  }) => void
  opponent_reconnected: (data: { playerId: string }) => void
  game_abandoned: (data: {
    reason: string
    winnerId?: string
  }) => void
}

// ============================================
// Socket Events - Client to Server
// ============================================
export interface ClientToServerEvents {
  // Matchmaking
  find_match: (data: {
    playerId: string
    playerName: string
    trophies: number
    league: string
    grade: number
  }, callback: (response: {
    success: boolean
    matched?: boolean
    matchId?: string
    queuePosition?: number
    error?: string
  }) => void) => void

  cancel_matchmaking: (data: { playerId: string }, callback?: (response: { success: boolean }) => void) => void

  // Join/leave match
  join_game: (data: {
    matchId: string
    playerId: string
    playerName: string
    trophies: number
    league: string
    grade: number
  }, callback: (response: { success: boolean; error?: string }) => void) => void

  leave_game: (data: { matchId: string }) => void

  // Ready up
  player_ready: (data: { matchId: string }) => void

  // Answer submission
  submit_answer: (
    data: AnswerSubmission,
    callback: (response: { success: boolean; error?: string }) => void
  ) => void

  // Connection management
  ping: (callback: (response: { timestamp: number }) => void) => void
  reconnect_game: (data: {
    matchId: string
    playerId: string
  }, callback: (response: {
    success: boolean
    gameState?: MultiplayerGameState
    error?: string
  }) => void) => void
}

// ============================================
// Inter-Server Events (for scaling)
// ============================================
export interface InterServerEvents {
  ping: () => void
}

// ============================================
// Socket Data (attached to socket)
// ============================================
export interface SocketData {
  playerId: string
  playerName: string
  matchId: string
  trophies: number
  league: string
  grade: number
  joinedAt: Date
}

// ============================================
// Game Room (server-side state)
// ============================================
export interface GameRoom {
  matchId: string
  gameState: MultiplayerGameState
  player1SocketId: string | null
  player2SocketId: string | null
  questionTimer: NodeJS.Timeout | null
  gameTimer: NodeJS.Timeout | null
  reconnectTimers: Map<string, NodeJS.Timeout>
  answeredThisQuestion: Set<string>
  createdAt: Date
}

// Helper type for socket with data
export type TypedSocket = {
  id: string
  data: SocketData
  join: (room: string) => void
  leave: (room: string) => void
  to: (room: string) => { emit: <T extends keyof ServerToClientEvents>(event: T, ...args: Parameters<ServerToClientEvents[T]>) => void }
  emit: <T extends keyof ServerToClientEvents>(event: T, ...args: Parameters<ServerToClientEvents[T]>) => void
  on: <T extends keyof ClientToServerEvents>(event: T, handler: ClientToServerEvents[T]) => void
  disconnect: () => void
}
