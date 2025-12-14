'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { socketClient, SocketEventHandlers } from '@/lib/socketClient'
import type {
  MultiplayerPlayer,
  AnswerResult,
  GameEndResult,
} from '@/types/socket'

export type MultiplayerStatus =
  | 'idle'
  | 'connecting'
  | 'waiting'      // Waiting for opponent
  | 'ready'        // Both players in room
  | 'countdown'    // 3-2-1 countdown
  | 'playing'      // Game active
  | 'finished'     // Game over
  | 'abandoned'    // Opponent left
  | 'error'

export interface CurrentQuestion {
  index: number
  question: string
  options: string[]
  difficulty: number
  timeLimit: number
  timeRemaining: number
  answered: boolean
  myAnswer?: number
  opponentAnswered: boolean
}

export interface MultiplayerGameHookState {
  status: MultiplayerStatus
  matchId: string | null
  myPlayer: MultiplayerPlayer | null
  opponent: MultiplayerPlayer | null
  isPlayer1: boolean
  countdown: number
  myScore: number
  opponentScore: number
  myGoals: number
  opponentGoals: number
  myCorrect: number
  opponentCorrect: number
  fieldPosition: number
  currentQuestion: CurrentQuestion | null
  timeRemaining: number
  lastAnswerResult: AnswerResult | null
  gameResult: GameEndResult | null
  error: string | null
  latency: number
}

const initialState: MultiplayerGameHookState = {
  status: 'idle',
  matchId: null,
  myPlayer: null,
  opponent: null,
  isPlayer1: true,
  countdown: 0,
  myScore: 0,
  opponentScore: 0,
  myGoals: 0,
  opponentGoals: 0,
  myCorrect: 0,
  opponentCorrect: 0,
  fieldPosition: 0,
  currentQuestion: null,
  timeRemaining: 60,
  lastAnswerResult: null,
  gameResult: null,
  error: null,
  latency: 0,
}

export function useMultiplayerGame() {
  const [state, setState] = useState<MultiplayerGameHookState>(initialState)
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const answerStartTimeRef = useRef<number>(0)

  // Setup socket event handlers
  const setupHandlers = useCallback((playerId: string): SocketEventHandlers => ({
    onConnect: () => {
      console.log('[MultiplayerGame] Connected')
      // Start latency monitoring
      pingIntervalRef.current = setInterval(async () => {
        const latency = await socketClient.ping()
        if (latency >= 0) {
          setState(prev => ({ ...prev, latency }))
        }
      }, 5000)
    },

    onDisconnect: (reason) => {
      console.log('[MultiplayerGame] Disconnected:', reason)
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
    },

    onError: (error) => {
      console.error('[MultiplayerGame] Error:', error)
      setState(prev => ({ ...prev, status: 'error', error: error.message }))
    },

    onMatchFound: (data) => {
      console.log('[MultiplayerGame] Match found!', data)
      setState(prev => ({
        ...prev,
        matchId: data.matchId,
        status: 'waiting', // Will change to 'ready' when we join and see opponent
      }))
      // Auto-join the match room
      socketClient.joinGame(data.matchId, {
        playerId,
        playerName: '', // Will be set from the original find_match call
        trophies: 0,
        league: 'bronze-3',
        grade: 3,
      })
    },

    onPlayerJoined: (data) => {
      const isMe = data.player.id === playerId
      if (isMe) {
        setState(prev => ({
          ...prev,
          myPlayer: data.player,
          isPlayer1: data.isPlayer1,
          status: 'waiting',
        }))
      } else {
        setState(prev => ({
          ...prev,
          opponent: data.player,
          status: 'ready',
        }))
      }
    },

    onPlayerLeft: (data) => {
      if (data.playerId !== playerId) {
        setState(prev => ({
          ...prev,
          opponent: prev.opponent ? { ...prev.opponent, isConnected: false } : null,
        }))
      }
    },

    onPlayerReady: (data) => {
      if (data.playerId === playerId) {
        setState(prev => ({
          ...prev,
          myPlayer: prev.myPlayer ? { ...prev.myPlayer, isReady: true } : null,
        }))
      } else {
        setState(prev => ({
          ...prev,
          opponent: prev.opponent ? { ...prev.opponent, isReady: true } : null,
        }))
      }
    },

    onBothReady: () => {
      console.log('[MultiplayerGame] Both ready, starting countdown')
    },

    onCountdown: (countdown) => {
      setState(prev => ({
        ...prev,
        status: 'countdown',
        countdown,
      }))
    },

    onGameStart: (gameState) => {
      setState(prev => ({
        ...prev,
        status: 'playing',
        timeRemaining: gameState.timeRemaining,
        fieldPosition: gameState.fieldPosition,
      }))
    },

    onQuestionStart: (data) => {
      // Reset answer timer
      answerStartTimeRef.current = Date.now()

      // Clear previous question timer
      if (questionTimerRef.current) {
        clearTimeout(questionTimerRef.current)
      }

      setState(prev => ({
        ...prev,
        currentQuestion: {
          index: data.questionIndex,
          question: data.question.question,
          options: data.question.options,
          difficulty: data.question.difficulty,
          timeLimit: data.timeLimit,
          timeRemaining: data.timeLimit,
          answered: false,
          opponentAnswered: false,
        },
        lastAnswerResult: null,
      }))

      // Start question countdown
      const tickQuestion = () => {
        setState(prev => {
          if (!prev.currentQuestion || prev.currentQuestion.answered) {
            return prev
          }
          const newTime = prev.currentQuestion.timeRemaining - 1
          if (newTime <= 0) {
            return {
              ...prev,
              currentQuestion: { ...prev.currentQuestion, timeRemaining: 0 },
            }
          }
          return {
            ...prev,
            currentQuestion: { ...prev.currentQuestion, timeRemaining: newTime },
          }
        })
      }

      questionTimerRef.current = setInterval(tickQuestion, 1000)
    },

    onAnswerResult: (result) => {
      const isMyAnswer = result.playerId === playerId

      setState(prev => {
        const updates: Partial<MultiplayerGameHookState> = {
          lastAnswerResult: result,
          fieldPosition: result.newFieldPosition,
        }

        if (isMyAnswer) {
          updates.myScore = prev.isPlayer1
            ? prev.myScore + result.pointsEarned
            : prev.myScore + result.pointsEarned
          if (result.isCorrect) {
            updates.myCorrect = prev.myCorrect + 1
          }
          if (prev.currentQuestion) {
            updates.currentQuestion = {
              ...prev.currentQuestion,
              answered: true,
              myAnswer: result.answerIndex,
            }
          }
        } else {
          updates.opponentScore = prev.opponentScore + result.pointsEarned
          if (result.isCorrect) {
            updates.opponentCorrect = prev.opponentCorrect + 1
          }
        }

        return { ...prev, ...updates }
      })
    },

    onOpponentAnswered: (data) => {
      if (data.playerId !== playerId) {
        setState(prev => ({
          ...prev,
          currentQuestion: prev.currentQuestion
            ? { ...prev.currentQuestion, opponentAnswered: true }
            : null,
        }))
      }
    },

    onScoreUpdate: (data) => {
      setState(prev => ({
        ...prev,
        myScore: prev.isPlayer1 ? data.player1Score : data.player2Score,
        opponentScore: prev.isPlayer1 ? data.player2Score : data.player1Score,
        myGoals: prev.isPlayer1 ? data.player1Goals : data.player2Goals,
        opponentGoals: prev.isPlayer1 ? data.player2Goals : data.player1Goals,
        fieldPosition: data.fieldPosition,
      }))
    },

    onGoalScored: (data) => {
      const iScored = data.scoredBy === playerId
      console.log(`[MultiplayerGame] Goal! ${iScored ? 'I' : 'Opponent'} scored!`)

      setState(prev => ({
        ...prev,
        myGoals: prev.isPlayer1 ? data.player1Goals : data.player2Goals,
        opponentGoals: prev.isPlayer1 ? data.player2Goals : data.player1Goals,
        fieldPosition: 0, // Reset to center after goal
      }))
    },

    onTimeUpdate: (timeRemaining) => {
      setState(prev => ({ ...prev, timeRemaining }))
    },

    onTimeWarning: (secondsLeft) => {
      console.log(`[MultiplayerGame] Time warning: ${secondsLeft}s left!`)
    },

    onGameEnd: (result) => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current)
      }

      // Winner determination available via: result.winnerId === playerId

      setState(prev => ({
        ...prev,
        status: 'finished',
        gameResult: result,
        currentQuestion: null,
      }))
    },

    onOpponentDisconnected: (data) => {
      console.log(`[MultiplayerGame] Opponent disconnected, ${data.reconnectWindow}s to reconnect`)
      setState(prev => ({
        ...prev,
        opponent: prev.opponent ? { ...prev.opponent, isConnected: false } : null,
      }))
    },

    onOpponentReconnected: (_data) => {
      console.log('[MultiplayerGame] Opponent reconnected')
      setState(prev => ({
        ...prev,
        opponent: prev.opponent ? { ...prev.opponent, isConnected: true } : null,
      }))
    },

    onGameAbandoned: (data) => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current)
      }

      setState(prev => ({
        ...prev,
        status: 'abandoned',
        error: data.reason,
      }))
    },
  }), [])

  // Join a game
  const joinGame = useCallback(async (
    matchId: string,
    player: {
      playerId: string
      playerName: string
      trophies: number
      league: string
      grade: number
    }
  ) => {
    setState(prev => ({ ...prev, status: 'connecting', matchId, error: null }))

    // Connect socket with handlers
    socketClient.connect(setupHandlers(player.playerId))

    // Wait for connection
    let attempts = 0
    while (!socketClient.isConnected() && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 250))
      attempts++
    }

    if (!socketClient.isConnected()) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to connect to game server',
      }))
      return { success: false, error: 'Connection failed' }
    }

    // Join the game room
    const result = await socketClient.joinGame(matchId, player)

    if (!result.success) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: result.error || 'Failed to join game',
      }))
    }

    return result
  }, [setupHandlers])

  // Store player info for matchmaking
  const playerInfoRef = useRef<{
    playerId: string
    playerName: string
    trophies: number
    league: string
    grade: number
  } | null>(null)

  // Find a match (matchmaking)
  const findMatch = useCallback(async (
    player: {
      playerId: string
      playerName: string
      trophies: number
      league: string
      grade: number
    }
  ) => {
    // Store player info for later use when match is found
    playerInfoRef.current = player
    setState(prev => ({ ...prev, status: 'connecting', error: null }))

    // Connect socket with handlers
    socketClient.connect({
      ...setupHandlers(player.playerId),
      onMatchFound: async (data) => {
        console.log('[MultiplayerGame] Match found via event!', data)
        // Join the match room with stored player info
        if (playerInfoRef.current) {
          await socketClient.joinGame(data.matchId, playerInfoRef.current)
        }
      },
    })

    // Wait for connection
    let attempts = 0
    while (!socketClient.isConnected() && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 250))
      attempts++
    }

    if (!socketClient.isConnected()) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to connect to game server',
      }))
      return { success: false, error: 'Connection failed' }
    }

    // Request matchmaking
    const result = await socketClient.findMatch(player)

    if (result.success && result.matched && result.matchId) {
      // Immediately matched! Join the game room
      console.log('[MultiplayerGame] Immediately matched:', result.matchId)
      await socketClient.joinGame(result.matchId, player)
    } else if (result.success && !result.matched) {
      // Added to queue, waiting for opponent
      console.log('[MultiplayerGame] In queue, waiting for opponent')
      setState(prev => ({ ...prev, status: 'waiting' }))
    } else {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: result.error || 'Matchmaking failed',
      }))
    }

    return result
  }, [setupHandlers])

  // Cancel matchmaking
  const cancelMatchmaking = useCallback(() => {
    socketClient.cancelMatchmaking()
    playerInfoRef.current = null
    setState(initialState)
  }, [])

  // Set ready status
  const setReady = useCallback(() => {
    socketClient.setReady()
  }, [])

  // Submit an answer
  const submitAnswer = useCallback(async (answerIndex: number) => {
    const timeElapsed = Date.now() - answerStartTimeRef.current

    // Optimistically update UI
    setState(prev => ({
      ...prev,
      currentQuestion: prev.currentQuestion
        ? { ...prev.currentQuestion, answered: true, myAnswer: answerIndex }
        : null,
    }))

    const result = await socketClient.submitAnswer(
      state.currentQuestion?.index || 0,
      answerIndex,
      timeElapsed
    )

    return result
  }, [state.currentQuestion?.index])

  // Leave the game
  const leaveGame = useCallback(() => {
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current)
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
    }

    socketClient.leaveGame()
    setState(initialState)
  }, [])

  // Reconnect to a game
  const reconnect = useCallback(async (matchId: string, playerId: string) => {
    setState(prev => ({ ...prev, status: 'connecting' }))

    if (!socketClient.isConnected()) {
      socketClient.connect(setupHandlers(playerId))

      let attempts = 0
      while (!socketClient.isConnected() && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 250))
        attempts++
      }
    }

    const result = await socketClient.reconnectGame(matchId, playerId)

    if (result.success && result.gameState) {
      const isPlayer1 = result.gameState.player1.id === playerId

      setState(prev => ({
        ...prev,
        status: result.gameState?.status === 'active' ? 'playing' : 'waiting',
        matchId,
        myPlayer: isPlayer1 ? result.gameState!.player1 : result.gameState!.player2,
        opponent: isPlayer1 ? result.gameState!.player2 : result.gameState!.player1,
        isPlayer1,
        myScore: isPlayer1 ? result.gameState!.player1Score : result.gameState!.player2Score,
        opponentScore: isPlayer1 ? result.gameState!.player2Score : result.gameState!.player1Score,
        myGoals: isPlayer1 ? result.gameState!.player1Goals : result.gameState!.player2Goals,
        opponentGoals: isPlayer1 ? result.gameState!.player2Goals : result.gameState!.player1Goals,
        fieldPosition: result.gameState!.fieldPosition,
        timeRemaining: result.gameState!.timeRemaining,
      }))
    } else {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: result.error || 'Failed to reconnect',
      }))
    }

    return result
  }, [setupHandlers])

  // Reset state
  const reset = useCallback(() => {
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current)
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
    }

    socketClient.disconnect()
    setState(initialState)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current)
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
    }
  }, [])

  return {
    ...state,
    isConnected: socketClient.isConnected(),
    joinGame,
    findMatch,
    cancelMatchmaking,
    setReady,
    submitAnswer,
    leaveGame,
    reconnect,
    reset,
  }
}
