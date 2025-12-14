import { Question } from './questions'

export interface Player {
  id: string
  name: string
  avatar?: string
  elo: number
}

// This interface is now replaced by the one in types/questions.ts
// Keeping for backward compatibility, but should use Question from types/questions.ts

export interface GameSession {
  id: string
  players: [Player, Player]
  arena: 'soccer' | 'hockey'
  duration: 60
  questions: Question[]
  scores: [number, number]
  status: 'waiting' | 'active' | 'finished'
  currentQuestion?: Question
  startTime?: number
}

export interface GameState {
  currentSession: GameSession | null
  playerProgress: {
    position: number
    score: number
    streak: number
  }
  opponentProgress: {
    position: number
    score: number
    streak: number
  }
  timeLeft: number
  isAnswering: boolean
}