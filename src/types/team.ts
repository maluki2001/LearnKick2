/**
 * Team Builder Types - FIFA Ultimate Team meets Clash Royale
 * Each student owns a virtual team with 11 subject-based player positions
 */

import { SUBJECTS, SOCCER_POSITIONS, HOCKEY_POSITIONS, CARD_RARITY, LEAGUE_TIERS } from '@/constants/game'

// ============================================================================
// Subject & Position Types
// ============================================================================

export type Subject = keyof typeof SUBJECTS
export type SubjectValue = typeof SUBJECTS[Subject]

export type SoccerPosition = keyof typeof SOCCER_POSITIONS
export type HockeyPosition = keyof typeof HOCKEY_POSITIONS

export type CardRarity = keyof typeof CARD_RARITY
export type LeagueTier = keyof typeof LEAGUE_TIERS

// ============================================================================
// Player Card Types
// ============================================================================

/**
 * Individual player card representing a subject
 * Each card has stats that improve as the player answers questions
 */
export interface PlayerCard {
  id: string
  teamId: string

  // Position & Subject
  position: SoccerPosition | HockeyPosition
  subject: SubjectValue

  // Primary stats (0-99)
  accuracy: number        // How often questions answered correctly
  speed: number           // Average response time rating
  consistency: number     // Streak maintenance ability
  difficultyMastery: number // Highest difficulty level mastered

  // Derived stats (calculated)
  overall: number         // Weighted average of stats
  rarity: CardRarity      // Based on overall rating

  // Progression
  level: number           // 1-14 (like Clash Royale)
  xp: number              // Experience points toward next level
  xpToNextLevel: number   // XP required for next level

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

/**
 * Calculate overall rating from individual stats
 */
export function calculateOverall(card: Pick<PlayerCard, 'accuracy' | 'speed' | 'consistency' | 'difficultyMastery'>): number {
  return Math.round(
    card.accuracy * 0.4 +
    card.speed * 0.3 +
    card.consistency * 0.2 +
    card.difficultyMastery * 0.1
  )
}

/**
 * Get card rarity based on overall rating
 */
export function getCardRarity(overall: number): CardRarity {
  if (overall >= 90) return 'CHAMPION'
  if (overall >= 80) return 'DIAMOND'
  if (overall >= 60) return 'GOLD'
  if (overall >= 40) return 'SILVER'
  return 'BRONZE'
}

// ============================================================================
// Team Types
// ============================================================================

export type Formation = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1'
export type Arena = 'soccer' | 'hockey'

/**
 * Player's team containing all player cards
 */
export interface Team {
  id: string
  userId: string

  // Team metadata
  teamName: string
  formation: Formation
  arena: Arena
  goalkeeperSubject: SubjectValue | null // Player's chosen GK subject

  // Resources
  elixir: number
  elixirEarnedToday: number
  lastElixirReset: Date

  // League info
  leagueTier: LeagueTier
  leaguePoints: number

  // Player cards (11 for soccer, 6 for hockey)
  cards: PlayerCard[]

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

/**
 * Default stats for a new player card
 */
export const DEFAULT_CARD_STATS: Pick<PlayerCard, 'accuracy' | 'speed' | 'consistency' | 'difficultyMastery' | 'level' | 'xp'> = {
  accuracy: 50,
  speed: 50,
  consistency: 50,
  difficultyMastery: 30,
  level: 1,
  xp: 0
}

// ============================================================================
// Elixir Types
// ============================================================================

export interface ElixirTransaction {
  id: string
  teamId: string
  amount: number          // Positive = earned, negative = spent
  reason: ElixirTransactionReason
  createdAt: Date
}

export type ElixirTransactionReason =
  | 'match_reward'
  | 'train_player'
  | 'daily_bonus'
  | 'weekly_streak_bonus'
  | 'boost_match'
  | 'quick_level'

/**
 * Calculate elixir earned from a correct answer
 * Speed gives base elixir, streak multiplies it
 */
export function calculateElixirEarned(
  responseTimeMs: number,
  timeLimitMs: number,
  streak: number
): number {
  // Speed rating (1-5 base elixir)
  const speedRatio = responseTimeMs / timeLimitMs
  let baseElixir: number

  if (speedRatio <= 0.25) baseElixir = 5      // Lightning fast: < 25% of time
  else if (speedRatio <= 0.50) baseElixir = 4 // Fast: 25-50% of time
  else if (speedRatio <= 0.75) baseElixir = 3 // Normal: 50-75% of time
  else if (speedRatio <= 0.90) baseElixir = 2 // Slow: 75-90% of time
  else baseElixir = 1                          // Last second: > 90% of time

  // Streak multiplier (max 2x at 10 streak)
  const streakMultiplier = 1 + (Math.min(streak, 10) * 0.1)

  return Math.round(baseElixir * streakMultiplier)
}

// ============================================================================
// League Types
// ============================================================================

export interface LeagueStanding {
  rank: number
  playerId: string
  playerName: string
  teamName: string

  // Match stats
  played: number
  won: number
  drawn: number
  lost: number

  // Goals
  goalsFor: number
  goalsAgainst: number
  goalDifference: number

  // Points (W*3 + D*1)
  points: number

  // Tiebreakers
  accuracy: number
  avgResponseTime: number
}

export interface SchoolLeague {
  id: string
  schoolId: string
  seasonId: string
  seasonStart: Date
  seasonEnd: Date
  standings: LeagueStanding[]
  createdAt: Date
  updatedAt: Date
}

export interface GlobalLeague {
  id: string
  tier: LeagueTier
  division: number
  seasonId: string
  standings: LeagueStanding[]
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Match Result Types
// ============================================================================

export interface MatchResult {
  matchId: string

  // Players
  player1Id: string
  player2Id: string

  // Scores
  player1Goals: number
  player2Goals: number

  // Points awarded
  player1Points: number  // 3 for win, 1 for draw, 0 for loss
  player2Points: number

  // Elixir earned
  player1ElixirEarned: number
  player2ElixirEarned: number

  // XP distributed to cards
  player1XPDistributed: Record<SubjectValue, number>
  player2XPDistributed: Record<SubjectValue, number>

  // Match metadata
  arena: Arena
  matchType: 'ranked' | 'practice' | 'tournament'
  duration: number // in seconds

  createdAt: Date
}

/**
 * Calculate points from match result
 */
export function calculateMatchPoints(
  playerGoals: number,
  opponentGoals: number
): { points: number; result: 'win' | 'draw' | 'loss' } {
  if (playerGoals > opponentGoals) {
    return { points: 3, result: 'win' }
  } else if (playerGoals === opponentGoals) {
    return { points: 1, result: 'draw' }
  } else {
    return { points: 0, result: 'loss' }
  }
}

// ============================================================================
// XP & Level Types
// ============================================================================

/**
 * XP required for each level (1-14)
 */
export const LEVEL_XP_REQUIREMENTS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  6: 1750,
  7: 2750,
  8: 4000,
  9: 5500,
  10: 7500,
  11: 10000,
  12: 13000,
  13: 17000,
  14: 22000
}

/**
 * Get level from XP amount
 */
export function getLevelFromXP(xp: number): number {
  let level = 1
  for (let i = 14; i >= 1; i--) {
    if (xp >= LEVEL_XP_REQUIREMENTS[i]) {
      level = i
      break
    }
  }
  return level
}

/**
 * Get XP needed for next level
 */
export function getXPToNextLevel(currentXP: number): number {
  const currentLevel = getLevelFromXP(currentXP)
  if (currentLevel >= 14) return 0 // Max level
  return LEVEL_XP_REQUIREMENTS[currentLevel + 1] - currentXP
}

/**
 * Calculate XP gain from answering a question
 */
export function calculateXPGain(
  difficulty: number,
  responseTimeMs: number,
  timeLimitMs: number,
  isCorrect: boolean
): number {
  if (!isCorrect) return 0

  // Base XP from difficulty (1-10)
  const baseXP = difficulty * 2

  // Speed bonus (faster = more XP)
  const speedRatio = responseTimeMs / timeLimitMs
  let speedBonus = 0
  if (speedRatio <= 0.25) speedBonus = 5
  else if (speedRatio <= 0.50) speedBonus = 3
  else if (speedRatio <= 0.75) speedBonus = 1

  return baseXP + speedBonus
}

// ============================================================================
// Create Team Helpers
// ============================================================================

/**
 * Create initial player cards for a new team
 */
export function createInitialCards(
  teamId: string,
  arena: Arena,
  goalkeeperSubject: SubjectValue
): Omit<PlayerCard, 'id' | 'createdAt' | 'updatedAt'>[] {
  const positions = arena === 'soccer' ? SOCCER_POSITIONS : HOCKEY_POSITIONS
  const cards: Omit<PlayerCard, 'id' | 'createdAt' | 'updatedAt'>[] = []

  for (const [posKey, posData] of Object.entries(positions)) {
    const subject = posData.subject === null ? goalkeeperSubject : posData.subject

    const overall = calculateOverall(DEFAULT_CARD_STATS)

    cards.push({
      teamId,
      position: posKey as SoccerPosition | HockeyPosition,
      subject: subject as SubjectValue,
      ...DEFAULT_CARD_STATS,
      overall,
      rarity: getCardRarity(overall),
      xpToNextLevel: LEVEL_XP_REQUIREMENTS[2]
    })
  }

  return cards
}

/**
 * Create a new team with default values
 */
export function createNewTeam(
  userId: string,
  teamName: string,
  arena: Arena = 'soccer'
): Omit<Team, 'id' | 'cards' | 'createdAt' | 'updatedAt'> {
  return {
    userId,
    teamName,
    formation: '4-3-3',
    arena,
    goalkeeperSubject: null,
    elixir: 0,
    elixirEarnedToday: 0,
    lastElixirReset: new Date(),
    leagueTier: 'BRONZE',
    leaguePoints: 0
  }
}
