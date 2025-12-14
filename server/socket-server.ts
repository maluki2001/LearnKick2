// Socket.io Server for Real-time Multiplayer
// Run with: npx ts-node server/socket-server.ts
// Or: npm run socket-server

import { createServer } from 'http'
import { Server } from 'socket.io'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  MultiplayerGameState,
  MultiplayerPlayer,
  GameRoom,
} from '../src/types/socket'
import type { Question } from '../src/types/questions'

// Helper function to get question text regardless of question type
function getQuestionText(question: Question): string {
  if (question.type === 'true-false') {
    return question.statement
  }
  return question.question
}

// Helper function to get question options regardless of question type
function getQuestionOptions(question: Question): string[] {
  if (question.type === 'true-false') {
    return ['True', 'False']
  }
  if (question.type === 'number-input') {
    return [] // Number input doesn't have options
  }
  return question.answers
}

const PORT = process.env.SOCKET_PORT || 3001
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Game configuration
const GAME_CONFIG = {
  GAME_DURATION: 60,
  QUESTION_TIME: 10,
  COUNTDOWN_DURATION: 3,
  RECONNECT_WINDOW: 30,
}

// In-memory game rooms (use Redis in production)
const gameRooms = new Map<string, GameRoom>()

// Matchmaking queue - players waiting for opponents
interface QueuedPlayer {
  socketId: string
  playerId: string
  playerName: string
  grade: number
  trophies: number
  league: string
  joinedAt: number
}
const matchmakingQueue: QueuedPlayer[] = []

// Fetch questions from the API
async function fetchQuestionsForGame(grade: number, count: number = 10): Promise<Question[]> {
  try {
    const url = `${API_URL}/api/questions?grade=${grade}&limit=${count}`
    console.log(`[Socket] Fetching questions from: ${url}`)

    const response = await fetch(url)
    if (!response.ok) {
      console.error(`[Socket] API error: ${response.status}`)
      return getFallbackQuestions(grade)
    }

    const data = await response.json()
    if (data.success && data.questions?.length > 0) {
      console.log(`[Socket] Loaded ${data.questions.length} questions from API`)
      return data.questions
    }

    console.log('[Socket] No questions from API, using fallback')
    return getFallbackQuestions(grade)
  } catch (error) {
    console.error('[Socket] Failed to fetch questions:', error)
    return getFallbackQuestions(grade)
  }
}

// Fallback questions for testing when API is unavailable
function getFallbackQuestions(grade: number): Question[] {
  console.log(`[Socket] Using fallback questions for grade ${grade}`)

  // Simple math questions appropriate for grades 1-6
  const questions: Question[] = [
    {
      id: 'fb-1',
      type: 'multiple-choice',
      subject: 'math',
      grade: grade,
      language: 'de',
      question: 'Was ist 5 + 3?',
      answers: ['8', '7', '9', '6'],
      correctIndex: 0,
      difficulty: 1,
    },
    {
      id: 'fb-2',
      type: 'multiple-choice',
      subject: 'math',
      grade: grade,
      language: 'de',
      question: 'Was ist 10 - 4?',
      answers: ['6', '5', '7', '8'],
      correctIndex: 0,
      difficulty: 1,
    },
    {
      id: 'fb-3',
      type: 'multiple-choice',
      subject: 'math',
      grade: grade,
      language: 'de',
      question: 'Was ist 2 × 5?',
      answers: ['10', '8', '12', '7'],
      correctIndex: 0,
      difficulty: 2,
    },
    {
      id: 'fb-4',
      type: 'multiple-choice',
      subject: 'math',
      grade: grade,
      language: 'de',
      question: 'Was ist 15 + 5?',
      answers: ['20', '18', '22', '19'],
      correctIndex: 0,
      difficulty: 2,
    },
    {
      id: 'fb-5',
      type: 'multiple-choice',
      subject: 'math',
      grade: grade,
      language: 'de',
      question: 'Was ist 20 - 8?',
      answers: ['12', '10', '14', '11'],
      correctIndex: 0,
      difficulty: 2,
    },
    {
      id: 'fb-6',
      type: 'multiple-choice',
      subject: 'math',
      grade: grade,
      language: 'de',
      question: 'Was ist 6 + 7?',
      answers: ['13', '12', '14', '11'],
      correctIndex: 0,
      difficulty: 2,
    },
    {
      id: 'fb-7',
      type: 'multiple-choice',
      subject: 'math',
      grade: grade,
      language: 'de',
      question: 'Was ist 18 - 9?',
      answers: ['9', '8', '10', '7'],
      correctIndex: 0,
      difficulty: 2,
    },
    {
      id: 'fb-8',
      type: 'multiple-choice',
      subject: 'math',
      grade: grade,
      language: 'de',
      question: 'Was ist 5 × 2?',
      answers: ['10', '8', '12', '7'],
      correctIndex: 0,
      difficulty: 2,
    },
    {
      id: 'fb-9',
      type: 'multiple-choice',
      subject: 'math',
      grade: grade,
      language: 'de',
      question: 'Was ist 25 + 5?',
      answers: ['30', '28', '32', '29'],
      correctIndex: 0,
      difficulty: 2,
    },
    {
      id: 'fb-10',
      type: 'multiple-choice',
      subject: 'math',
      grade: grade,
      language: 'de',
      question: 'Was ist 16 - 7?',
      answers: ['9', '8', '10', '11'],
      correctIndex: 0,
      difficulty: 2,
    },
  ] as Question[]

  return questions
}

// Create HTTP server
const httpServer = createServer()

// Create Socket.io server
console.log(`[Socket.io Server] Allowing all origins for development`)

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
  cors: {
    origin: '*', // Allow all origins (localhost AND network IPs)
    methods: ['GET', 'POST'],
    credentials: false,
  },
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true, // Allow Engine.IO v3 clients
})

// Socket connection handler
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`)

  socket.emit('connected', { socketId: socket.id })

  // Find match - matchmaking system
  socket.on('find_match', async (data, callback) => {
    try {
      const { playerId, playerName, trophies, league, grade } = data
      console.log(`[Matchmaking] ${playerName} looking for match...`)

      // Check if already in queue
      const existingIndex = matchmakingQueue.findIndex(p => p.playerId === playerId)
      if (existingIndex >= 0) {
        matchmakingQueue.splice(existingIndex, 1)
      }

      // Check if there's someone waiting in queue
      if (matchmakingQueue.length > 0) {
        // Found opponent! Match them
        const opponent = matchmakingQueue.shift()!
        const matchId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

        console.log(`[Matchmaking] Match found! ${playerName} vs ${opponent.playerName} -> ${matchId}`)

        // Notify the waiting player (opponent) that match was found
        const opponentSocket = io.sockets.sockets.get(opponent.socketId)
        if (opponentSocket) {
          console.log(`[Matchmaking] Sending match_found to waiting player ${opponent.playerName} (socket: ${opponent.socketId})`)
          opponentSocket.emit('match_found', {
            matchId,
            opponent: { id: playerId, name: playerName, trophies, league, grade }
          })
        } else {
          console.log(`[Matchmaking] WARNING: Could not find socket for waiting player ${opponent.playerName}`)
        }

        // Notify the new player (who triggered the match)
        console.log(`[Matchmaking] Sending match_found to new player ${playerName} (socket: ${socket.id})`)
        socket.emit('match_found', {
          matchId,
          opponent: { id: opponent.playerId, name: opponent.playerName, trophies: opponent.trophies, league: opponent.league, grade: opponent.grade }
        })

        callback({ success: true, matchId, matched: true })
      } else {
        // No one waiting, add to queue
        console.log(`[Matchmaking] No opponents, ${playerName} added to queue`)
        matchmakingQueue.push({
          socketId: socket.id,
          playerId,
          playerName,
          grade,
          trophies,
          league,
          joinedAt: Date.now()
        })

        callback({ success: true, matched: false, queuePosition: 1 })
      }
    } catch (error) {
      console.error('[Matchmaking] Error:', error)
      callback({ success: false, error: 'Matchmaking failed' })
    }
  })

  // Cancel matchmaking
  socket.on('cancel_matchmaking', (data, callback) => {
    const { playerId } = data
    const index = matchmakingQueue.findIndex(p => p.playerId === playerId)
    if (index >= 0) {
      matchmakingQueue.splice(index, 1)
      console.log(`[Matchmaking] ${playerId} left queue`)
    }
    callback?.({ success: true })
  })

  // Join game room
  socket.on('join_game', async (data, callback) => {
    try {
      const { matchId, playerId, playerName, trophies, league, grade } = data
      console.log(`[Socket] join_game received: ${playerName} joining ${matchId}`)

      // Store player data on socket
      socket.data = {
        playerId,
        playerName,
        matchId,
        trophies,
        league,
        grade,
        joinedAt: new Date(),
      }

      // Join the room
      socket.join(matchId)

      // Get or create game room
      let room = gameRooms.get(matchId)

      if (!room) {
        // Create new room (first player)
        const player: MultiplayerPlayer = {
          id: playerId,
          name: playerName,
          trophies,
          league,
          grade,
          isReady: false,
          isConnected: true,
        }

        const gameState: MultiplayerGameState = {
          matchId,
          status: 'waiting',
          player1: player,
          player2: {
            id: '',
            name: 'Waiting...',
            trophies: 0,
            league: 'bronze-3',
            grade: 3,
            isReady: false,
            isConnected: false,
          },
          player1Score: 0,
          player2Score: 0,
          player1Goals: 0,
          player2Goals: 0,
          player1Correct: 0,
          player2Correct: 0,
          currentQuestionIndex: -1,
          totalQuestions: 0,
          timeRemaining: GAME_CONFIG.GAME_DURATION,
          fieldPosition: 0,
          questions: [],
        }

        room = {
          matchId,
          gameState,
          player1SocketId: socket.id,
          player2SocketId: null,
          questionTimer: null,
          gameTimer: null,
          reconnectTimers: new Map(),
          answeredThisQuestion: new Set(),
          createdAt: new Date(),
        }

        gameRooms.set(matchId, room)

        socket.emit('player_joined', { player, isPlayer1: true })
        callback({ success: true })
      } else {
        // Second player joining
        if (room.gameState.player1.id === playerId) {
          // Player 1 reconnecting
          room.player1SocketId = socket.id
          room.gameState.player1.isConnected = true

          // Clear reconnect timer if exists
          const timer = room.reconnectTimers.get(playerId)
          if (timer) {
            clearTimeout(timer)
            room.reconnectTimers.delete(playerId)
          }

          socket.to(matchId).emit('opponent_reconnected', { playerId })
          socket.emit('player_joined', { player: room.gameState.player1, isPlayer1: true })

          callback({ success: true })
        } else if (!room.gameState.player2.id || room.gameState.player2.id === playerId) {
          // Player 2 joining or reconnecting
          const isReconnect = room.gameState.player2.id === playerId

          if (!isReconnect) {
            room.gameState.player2 = {
              id: playerId,
              name: playerName,
              trophies,
              league,
              grade,
              isReady: false,
              isConnected: true,
            }
          } else {
            room.gameState.player2.isConnected = true
            const timer = room.reconnectTimers.get(playerId)
            if (timer) {
              clearTimeout(timer)
              room.reconnectTimers.delete(playerId)
            }
            socket.to(matchId).emit('opponent_reconnected', { playerId })
          }

          room.player2SocketId = socket.id

          socket.emit('player_joined', { player: room.gameState.player2, isPlayer1: false })

          if (!isReconnect) {
            // Notify player 1 that player 2 joined
            io.to(room.player1SocketId!).emit('player_joined', {
              player: room.gameState.player2,
              isPlayer1: false,
            })
          }

          callback({ success: true })
        } else {
          callback({ success: false, error: 'Room is full' })
        }
      }
    } catch (error) {
      console.error('[Socket] Join game error:', error)
      callback({ success: false, error: 'Failed to join game' })
    }
  })

  // Player ready
  socket.on('player_ready', (data) => {
    const { matchId } = data
    const room = gameRooms.get(matchId)

    if (!room || !socket.data.playerId) return

    const playerId = socket.data.playerId
    const isPlayer1 = room.gameState.player1.id === playerId

    if (isPlayer1) {
      room.gameState.player1.isReady = true
    } else {
      room.gameState.player2.isReady = true
    }

    // Notify all in room
    io.to(matchId).emit('player_ready', { playerId })

    // Check if both ready
    if (room.gameState.player1.isReady && room.gameState.player2.isReady) {
      io.to(matchId).emit('both_ready')
      startCountdown(matchId)
    }
  })

  // Submit answer
  socket.on('submit_answer', (data, callback) => {
    const { matchId, questionIndex, answerIndex: _answerIndex, timeElapsed } = data
    const room = gameRooms.get(matchId)

    if (!room || room.gameState.status !== 'active') {
      callback({ success: false, error: 'Game not active' })
      return
    }

    const playerId = socket.data.playerId
    if (!playerId) {
      callback({ success: false, error: 'Not authenticated' })
      return
    }

    // Check if already answered
    const answerKey = `${playerId}-${questionIndex}`
    if (room.answeredThisQuestion.has(answerKey)) {
      callback({ success: false, error: 'Already answered' })
      return
    }
    room.answeredThisQuestion.add(answerKey)

    // Notify opponent that this player answered (without revealing correctness)
    socket.to(matchId).emit('opponent_answered', {
      playerId,
      questionIndex,
      timeElapsed,
    })

    // In a real implementation, you would:
    // 1. Validate the answer against the stored question
    // 2. Calculate points
    // 3. Update scores
    // 4. Emit answer_result to both players

    // For now, just acknowledge
    callback({ success: true })
  })

  // Leave game
  socket.on('leave_game', (data) => {
    const { matchId } = data
    const room = gameRooms.get(matchId)

    if (room && socket.data.playerId) {
      handlePlayerDisconnect(matchId, socket.data.playerId, 'left')
    }

    socket.leave(matchId)
  })

  // Ping for latency
  socket.on('ping', (callback) => {
    callback({ timestamp: Date.now() })
  })

  // Reconnect to game
  socket.on('reconnect_game', (data, callback) => {
    const { matchId, playerId } = data
    const room = gameRooms.get(matchId)

    if (!room) {
      callback({ success: false, error: 'Game not found' })
      return
    }

    // Verify player is part of this game
    const isPlayer1 = room.gameState.player1.id === playerId
    const isPlayer2 = room.gameState.player2.id === playerId

    if (!isPlayer1 && !isPlayer2) {
      callback({ success: false, error: 'Not part of this game' })
      return
    }

    // Update socket data and join room
    socket.data = {
      playerId,
      playerName: isPlayer1 ? room.gameState.player1.name : room.gameState.player2.name,
      matchId,
      trophies: isPlayer1 ? room.gameState.player1.trophies : room.gameState.player2.trophies,
      league: isPlayer1 ? room.gameState.player1.league : room.gameState.player2.league,
      grade: isPlayer1 ? room.gameState.player1.grade : room.gameState.player2.grade,
      joinedAt: new Date(),
    }

    socket.join(matchId)

    if (isPlayer1) {
      room.player1SocketId = socket.id
      room.gameState.player1.isConnected = true
    } else {
      room.player2SocketId = socket.id
      room.gameState.player2.isConnected = true
    }

    // Clear reconnect timer
    const timer = room.reconnectTimers.get(playerId)
    if (timer) {
      clearTimeout(timer)
      room.reconnectTimers.delete(playerId)
    }

    // Notify opponent
    socket.to(matchId).emit('opponent_reconnected', { playerId })

    callback({ success: true, gameState: room.gameState })
  })

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`)

    // Remove from matchmaking queue if present
    const queueIndex = matchmakingQueue.findIndex(p => p.socketId === socket.id)
    if (queueIndex >= 0) {
      console.log(`[Matchmaking] Removed disconnected player from queue`)
      matchmakingQueue.splice(queueIndex, 1)
    }

    if (socket.data.matchId && socket.data.playerId) {
      handlePlayerDisconnect(socket.data.matchId, socket.data.playerId, 'disconnected')
    }
  })
})

// Helper: Start countdown
async function startCountdown(matchId: string) {
  const room = gameRooms.get(matchId)
  if (!room) return

  room.gameState.status = 'countdown'

  // Fetch questions for the game before starting
  // Use the average grade of both players
  const avgGrade = Math.round(
    (room.gameState.player1.grade + room.gameState.player2.grade) / 2
  )
  console.log(`[Socket] Loading questions for grade ${avgGrade}...`)

  const questions = await fetchQuestionsForGame(avgGrade, 15)
  room.gameState.questions = questions
  room.gameState.totalQuestions = questions.length
  console.log(`[Socket] Loaded ${questions.length} questions for match ${matchId}`)

  let countdown = GAME_CONFIG.COUNTDOWN_DURATION

  const countdownInterval = setInterval(() => {
    io.to(matchId).emit('game_countdown', { countdown })
    countdown--

    if (countdown < 0) {
      clearInterval(countdownInterval)
      startGame(matchId)
    }
  }, 1000)
}

// Helper: Start game
function startGame(matchId: string) {
  const room = gameRooms.get(matchId)
  if (!room) return

  room.gameState.status = 'active'
  room.gameState.startedAt = new Date().toISOString()
  room.gameState.currentQuestionIndex = 0

  io.to(matchId).emit('game_start', { gameState: room.gameState })

  // Start game timer
  room.gameTimer = setInterval(() => {
    room.gameState.timeRemaining--
    io.to(matchId).emit('time_update', { timeRemaining: room.gameState.timeRemaining })

    if (room.gameState.timeRemaining <= 10) {
      io.to(matchId).emit('time_warning', { secondsLeft: room.gameState.timeRemaining })
    }

    if (room.gameState.timeRemaining <= 0) {
      endGame(matchId)
    }
  }, 1000)

  // Start first question
  sendQuestion(matchId)
}

// Helper: Send question
function sendQuestion(matchId: string) {
  const room = gameRooms.get(matchId)
  if (!room || room.gameState.status !== 'active') return

  const questionIndex = room.gameState.currentQuestionIndex
  if (questionIndex >= room.gameState.questions.length) {
    endGame(matchId)
    return
  }

  const question = room.gameState.questions[questionIndex] as Question
  room.answeredThisQuestion.clear()

  io.to(matchId).emit('question_start', {
    questionIndex,
    question: {
      id: question.id,
      question: getQuestionText(question),
      options: getQuestionOptions(question),
      difficulty: question.difficulty || 2,
      timeLimit: GAME_CONFIG.QUESTION_TIME,
    },
    timeLimit: GAME_CONFIG.QUESTION_TIME,
  })

  // Question timer
  room.questionTimer = setTimeout(() => {
    // Move to next question
    room.gameState.currentQuestionIndex++
    sendQuestion(matchId)
  }, GAME_CONFIG.QUESTION_TIME * 1000)
}

// Helper: End game
function endGame(matchId: string) {
  const room = gameRooms.get(matchId)
  if (!room) return

  // Clear timers
  if (room.gameTimer) clearInterval(room.gameTimer)
  if (room.questionTimer) clearTimeout(room.questionTimer)

  room.gameState.status = 'finished'
  room.gameState.finishedAt = new Date().toISOString()

  // Determine winner
  let winnerId: string | null = null
  if (room.gameState.player1Goals > room.gameState.player2Goals) {
    winnerId = room.gameState.player1.id
  } else if (room.gameState.player2Goals > room.gameState.player1Goals) {
    winnerId = room.gameState.player2.id
  } else if (room.gameState.player1Score > room.gameState.player2Score) {
    winnerId = room.gameState.player1.id
  } else if (room.gameState.player2Score > room.gameState.player1Score) {
    winnerId = room.gameState.player2.id
  }

  room.gameState.winnerId = winnerId

  // Emit game end (trophy changes would be calculated via API)
  io.to(matchId).emit('game_end', {
    matchId,
    winnerId,
    isDraw: winnerId === null,
    player1Goals: room.gameState.player1Goals,
    player2Goals: room.gameState.player2Goals,
    player1Correct: room.gameState.player1Correct,
    player2Correct: room.gameState.player2Correct,
    player1TrophyChange: { playerId: room.gameState.player1.id, previousTrophies: room.gameState.player1.trophies, newTrophies: room.gameState.player1.trophies, change: 0, previousLeague: room.gameState.player1.league, newLeague: room.gameState.player1.league, promoted: false, demoted: false },
    player2TrophyChange: { playerId: room.gameState.player2.id, previousTrophies: room.gameState.player2.trophies, newTrophies: room.gameState.player2.trophies, change: 0, previousLeague: room.gameState.player2.league, newLeague: room.gameState.player2.league, promoted: false, demoted: false },
    duration: GAME_CONFIG.GAME_DURATION - room.gameState.timeRemaining,
  })

  // Clean up room after a delay
  setTimeout(() => {
    gameRooms.delete(matchId)
  }, 60000)
}

// Helper: Handle player disconnect
function handlePlayerDisconnect(matchId: string, playerId: string, _reason: string) {
  const room = gameRooms.get(matchId)
  if (!room) return

  const isPlayer1 = room.gameState.player1.id === playerId

  if (isPlayer1) {
    room.gameState.player1.isConnected = false
    room.player1SocketId = null
  } else {
    room.gameState.player2.isConnected = false
    room.player2SocketId = null
  }

  // Notify opponent
  io.to(matchId).emit('opponent_disconnected', {
    playerId,
    reconnectWindow: GAME_CONFIG.RECONNECT_WINDOW,
  })

  // Set reconnect timer
  const timer = setTimeout(() => {
    // If still disconnected, abandon game
    const currentRoom = gameRooms.get(matchId)
    if (!currentRoom) return

    const stillDisconnected = isPlayer1
      ? !currentRoom.gameState.player1.isConnected
      : !currentRoom.gameState.player2.isConnected

    if (stillDisconnected && currentRoom.gameState.status === 'active') {
      const winnerId = isPlayer1
        ? currentRoom.gameState.player2.id
        : currentRoom.gameState.player1.id

      io.to(matchId).emit('game_abandoned', {
        reason: 'Opponent disconnected',
        winnerId,
      })

      // End game
      if (currentRoom.gameTimer) clearInterval(currentRoom.gameTimer)
      if (currentRoom.questionTimer) clearTimeout(currentRoom.questionTimer)
      currentRoom.gameState.status = 'abandoned'
      currentRoom.gameState.winnerId = winnerId
    }
  }, GAME_CONFIG.RECONNECT_WINDOW * 1000)

  room.reconnectTimers.set(playerId, timer)
}

// Start server
httpServer.listen(PORT, () => {
  console.log(`[Socket.io Server] Running on port ${PORT}`)
  console.log(`[Socket.io Server] CORS origin: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`)
})

export { io, gameRooms }
