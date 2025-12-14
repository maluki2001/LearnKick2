'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export type MatchmakingStatus =
  | 'idle'
  | 'joining'
  | 'waiting'
  | 'matched'
  | 'countdown'
  | 'ready'
  | 'error'
  | 'cancelled'

export interface Opponent {
  id: string
  name: string
  trophies: number
  league?: string
}

export interface MatchmakingState {
  status: MatchmakingStatus
  matchId: string | null
  opponent: Opponent | null
  waitTime: number
  queuePosition: number
  playersInQueue: number
  statusMessage: string
  matchQuality: 'perfect' | 'good' | 'fair' | 'any' | null
  error: string | null
}

const initialState: MatchmakingState = {
  status: 'idle',
  matchId: null,
  opponent: null,
  waitTime: 0,
  queuePosition: 0,
  playersInQueue: 0,
  statusMessage: '',
  matchQuality: null,
  error: null,
}

export function useMatchmaking() {
  const [state, setState] = useState<MatchmakingState>(initialState)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const waitTimeIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      if (waitTimeIntervalRef.current) {
        clearInterval(waitTimeIntervalRef.current)
      }
    }
  }, [])

  // Poll for match status
  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/matchmaking')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check status')
      }

      if (!data.inQueue) {
        setState(initialState)
        return
      }

      if (data.status === 'matched') {
        // Stop polling when matched
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        if (waitTimeIntervalRef.current) {
          clearInterval(waitTimeIntervalRef.current)
          waitTimeIntervalRef.current = null
        }

        setState(prev => ({
          ...prev,
          status: 'matched',
          matchId: data.matchId,
          opponent: data.opponent,
          matchQuality: data.matchQuality,
          statusMessage: 'Match found!',
        }))
      } else if (data.status === 'waiting') {
        setState(prev => ({
          ...prev,
          status: 'waiting',
          waitTime: data.waitTime,
          queuePosition: data.queuePosition,
          playersInQueue: data.playersInQueue,
          statusMessage: data.statusMessage,
        }))
      }
    } catch (error) {
      console.error('Matchmaking status check error:', error)
    }
  }, [])

  // Join the queue
  const joinQueue = useCallback(async (language: string = 'en') => {
    try {
      setState(prev => ({ ...prev, status: 'joining', error: null }))

      const response = await fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join queue')
      }

      setState(prev => ({
        ...prev,
        status: 'waiting',
        playersInQueue: data.playersInQueue,
        statusMessage: 'Searching for opponent...',
      }))

      // Start polling for match status
      pollingIntervalRef.current = setInterval(checkStatus, 2000)

      // Start wait time counter
      waitTimeIntervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          waitTime: prev.waitTime + 1,
        }))
      }, 1000)

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join queue'
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }))
      return { success: false, error: errorMessage }
    }
  }, [checkStatus])

  // Leave the queue
  const leaveQueue = useCallback(async () => {
    try {
      // Stop polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      if (waitTimeIntervalRef.current) {
        clearInterval(waitTimeIntervalRef.current)
        waitTimeIntervalRef.current = null
      }

      const response = await fetch('/api/matchmaking', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to leave queue')
      }

      setState({
        ...initialState,
        status: 'cancelled',
      })

      // Reset to idle after a moment
      setTimeout(() => {
        setState(initialState)
      }, 1000)

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to leave queue'
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }))
      return { success: false, error: errorMessage }
    }
  }, [])

  // Mark player as ready (after match found)
  const setReady = useCallback(async () => {
    if (!state.matchId) return { success: false, error: 'No match' }

    try {
      setState(prev => ({ ...prev, status: 'ready' }))

      const response = await fetch(`/api/game/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: state.matchId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to mark ready')
      }

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark ready'
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }))
      return { success: false, error: errorMessage }
    }
  }, [state.matchId])

  // Reset to initial state
  const reset = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    if (waitTimeIntervalRef.current) {
      clearInterval(waitTimeIntervalRef.current)
      waitTimeIntervalRef.current = null
    }
    setState(initialState)
  }, [])

  return {
    ...state,
    isSearching: state.status === 'waiting' || state.status === 'joining',
    isMatched: state.status === 'matched' || state.status === 'countdown' || state.status === 'ready',
    joinQueue,
    leaveQueue,
    setReady,
    reset,
  }
}
