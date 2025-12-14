'use client'

import { io, Socket } from 'socket.io-client'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  MultiplayerGameState,
  AnswerResult,
  GameEndResult,
} from '@/types/socket'

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

// Socket connection state
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

// Event handlers
export interface SocketEventHandlers {
  onConnect?: () => void
  onDisconnect?: (reason: string) => void
  onError?: (error: { message: string; code?: string }) => void
  onMatchFound?: (data: { matchId: string; opponent: { id: string; name: string; trophies: number; league: string; grade: number } }) => void
  onPlayerJoined?: (player: ServerToClientEvents['player_joined'] extends (data: infer T) => void ? T : never) => void
  onPlayerLeft?: (data: { playerId: string; reason: string }) => void
  onPlayerReady?: (data: { playerId: string }) => void
  onBothReady?: () => void
  onCountdown?: (countdown: number) => void
  onGameStart?: (gameState: MultiplayerGameState) => void
  onQuestionStart?: (data: {
    questionIndex: number
    question: { id: string; question: string; options: string[]; difficulty: number; timeLimit: number }
    timeLimit: number
  }) => void
  onAnswerResult?: (result: AnswerResult) => void
  onOpponentAnswered?: (data: { playerId: string; questionIndex: number; timeElapsed: number }) => void
  onScoreUpdate?: (data: {
    player1Score: number
    player2Score: number
    player1Goals: number
    player2Goals: number
    fieldPosition: number
  }) => void
  onGoalScored?: (data: {
    scoredBy: string
    scorerName: string
    player1Goals: number
    player2Goals: number
  }) => void
  onTimeUpdate?: (timeRemaining: number) => void
  onTimeWarning?: (secondsLeft: number) => void
  onGameEnd?: (result: GameEndResult) => void
  onOpponentDisconnected?: (data: { playerId: string; reconnectWindow: number }) => void
  onOpponentReconnected?: (data: { playerId: string }) => void
  onGameAbandoned?: (data: { reason: string; winnerId?: string }) => void
}

class SocketClient {
  private socket: TypedSocket | null = null
  private connectionState: ConnectionState = 'disconnected'
  private handlers: SocketEventHandlers = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private matchId: string | null = null
  private playerId: string | null = null

  // Get the socket server URL
  private getSocketUrl(): string {
    if (typeof window === 'undefined') return ''

    // If explicit socket URL is set in env, use it (production)
    if (process.env.NEXT_PUBLIC_SOCKET_URL) {
      return process.env.NEXT_PUBLIC_SOCKET_URL
    }

    // For development: use the same hostname but port 3001
    // This works for both localhost AND network IP access (e.g., 192.168.x.x)
    const hostname = window.location.hostname
    const socketPort = '3001'

    // Use same hostname with socket port for development
    return `http://${hostname}:${socketPort}`
  }

  // Connect to the socket server
  connect(handlers: SocketEventHandlers = {}): void {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected')
      return
    }

    this.handlers = handlers
    this.connectionState = 'connecting'

    const socketUrl = this.getSocketUrl()
    console.log('[Socket] Connecting to:', socketUrl)

    console.log('[Socket] Socket URL:', socketUrl)

    this.socket = io(socketUrl, {
      // No custom path - using standalone socket server
      transports: ['polling', 'websocket'], // Start with polling, upgrade to websocket
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      withCredentials: false, // Required when CORS origin is *
    })

    this.setupEventListeners()
  }

  // Setup all event listeners
  private setupEventListeners(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id)
      this.connectionState = 'connected'
      this.reconnectAttempts = 0
      this.handlers.onConnect?.()
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
      this.connectionState = 'disconnected'
      this.handlers.onDisconnect?.(reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error)
      this.connectionState = 'error'
      this.handlers.onError?.({ message: error.message })
    })

    // Custom events
    this.socket.on('error', (data) => {
      console.error('[Socket] Error:', data)
      this.handlers.onError?.(data)
    })

    // Matchmaking - match found
    this.socket.on('match_found', (data: { matchId: string; opponent: { id: string; name: string; trophies: number; league: string; grade: number } }) => {
      console.log('[Socket] Match found:', data)
      this.matchId = data.matchId
      this.handlers.onMatchFound?.(data)
    })

    this.socket.on('player_joined', (data) => {
      console.log('[Socket] Player joined:', data)
      this.handlers.onPlayerJoined?.(data)
    })

    this.socket.on('player_left', (data) => {
      console.log('[Socket] Player left:', data)
      this.handlers.onPlayerLeft?.(data)
    })

    this.socket.on('player_ready', (data) => {
      console.log('[Socket] Player ready:', data)
      this.handlers.onPlayerReady?.(data)
    })

    this.socket.on('both_ready', () => {
      console.log('[Socket] Both players ready')
      this.handlers.onBothReady?.()
    })

    this.socket.on('game_countdown', (data) => {
      console.log('[Socket] Countdown:', data.countdown)
      this.handlers.onCountdown?.(data.countdown)
    })

    this.socket.on('game_start', (data) => {
      console.log('[Socket] Game started')
      this.handlers.onGameStart?.(data.gameState)
    })

    this.socket.on('question_start', (data) => {
      console.log('[Socket] Question:', data.questionIndex)
      this.handlers.onQuestionStart?.(data)
    })

    this.socket.on('answer_result', (data) => {
      console.log('[Socket] Answer result:', data)
      this.handlers.onAnswerResult?.(data)
    })

    this.socket.on('opponent_answered', (data) => {
      console.log('[Socket] Opponent answered')
      this.handlers.onOpponentAnswered?.(data)
    })

    this.socket.on('score_update', (data) => {
      console.log('[Socket] Score update:', data)
      this.handlers.onScoreUpdate?.(data)
    })

    this.socket.on('goal_scored', (data) => {
      console.log('[Socket] Goal scored by:', data.scorerName)
      this.handlers.onGoalScored?.(data)
    })

    this.socket.on('time_update', (data) => {
      this.handlers.onTimeUpdate?.(data.timeRemaining)
    })

    this.socket.on('time_warning', (data) => {
      console.log('[Socket] Time warning:', data.secondsLeft)
      this.handlers.onTimeWarning?.(data.secondsLeft)
    })

    this.socket.on('game_end', (data) => {
      console.log('[Socket] Game ended:', data)
      this.handlers.onGameEnd?.(data)
    })

    this.socket.on('opponent_disconnected', (data) => {
      console.log('[Socket] Opponent disconnected:', data)
      this.handlers.onOpponentDisconnected?.(data)
    })

    this.socket.on('opponent_reconnected', (data) => {
      console.log('[Socket] Opponent reconnected')
      this.handlers.onOpponentReconnected?.(data)
    })

    this.socket.on('game_abandoned', (data) => {
      console.log('[Socket] Game abandoned:', data)
      this.handlers.onGameAbandoned?.(data)
    })
  }

  // Find a match - matchmaking system
  findMatch(
    player: {
      playerId: string
      playerName: string
      trophies: number
      league: string
      grade: number
    }
  ): Promise<{ success: boolean; matched?: boolean; matchId?: string; queuePosition?: number; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ success: false, error: 'Not connected' })
        return
      }

      this.playerId = player.playerId

      this.socket.emit('find_match', player, (response: { success: boolean; matched?: boolean; matchId?: string; queuePosition?: number; error?: string }) => {
        if (response.success && response.matchId) {
          this.matchId = response.matchId
        }
        resolve(response)
      })
    })
  }

  // Cancel matchmaking
  cancelMatchmaking(): void {
    if (!this.socket || !this.playerId) return
    this.socket.emit('cancel_matchmaking', { playerId: this.playerId })
  }

  // Join a game room
  joinGame(
    matchId: string,
    player: {
      playerId: string
      playerName: string
      trophies: number
      league: string
      grade: number
    }
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ success: false, error: 'Not connected' })
        return
      }

      this.matchId = matchId
      this.playerId = player.playerId

      this.socket.emit('join_game', {
        matchId,
        ...player,
      }, (response) => {
        resolve(response)
      })
    })
  }

  // Leave current game
  leaveGame(): void {
    if (!this.socket || !this.matchId) return

    this.socket.emit('leave_game', { matchId: this.matchId })
    this.matchId = null
    this.playerId = null
  }

  // Signal ready to play
  setReady(): void {
    if (!this.socket || !this.matchId) return

    this.socket.emit('player_ready', { matchId: this.matchId })
  }

  // Submit an answer
  submitAnswer(
    questionIndex: number,
    answerIndex: number,
    timeElapsed: number
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected || !this.matchId) {
        resolve({ success: false, error: 'Not connected' })
        return
      }

      this.socket.emit('submit_answer', {
        matchId: this.matchId,
        questionIndex,
        answerIndex,
        timeElapsed,
      }, (response) => {
        resolve(response)
      })
    })
  }

  // Ping for latency check
  ping(): Promise<number> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve(-1)
        return
      }

      const start = Date.now()
      this.socket.emit('ping', (response) => {
        const latency = Date.now() - start
        resolve(latency)
      })
    })
  }

  // Attempt to reconnect to a game
  reconnectGame(
    matchId: string,
    playerId: string
  ): Promise<{ success: boolean; gameState?: MultiplayerGameState; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ success: false, error: 'Not connected' })
        return
      }

      this.socket.emit('reconnect_game', { matchId, playerId }, (response) => {
        if (response.success && response.gameState) {
          this.matchId = matchId
          this.playerId = playerId
        }
        resolve(response)
      })
    })
  }

  // Update event handlers
  updateHandlers(handlers: Partial<SocketEventHandlers>): void {
    this.handlers = { ...this.handlers, ...handlers }
  }

  // Disconnect from server
  disconnect(): void {
    if (this.socket) {
      this.leaveGame()
      this.socket.disconnect()
      this.socket = null
    }
    this.connectionState = 'disconnected'
    this.matchId = null
    this.playerId = null
  }

  // Getters
  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getSocketId(): string | null {
    return this.socket?.id || null
  }

  getCurrentMatchId(): string | null {
    return this.matchId
  }

  getCurrentPlayerId(): string | null {
    return this.playerId
  }
}

// Singleton instance
export const socketClient = new SocketClient()
