/**
 * Elixir Service - Handles elixir calculation, earning, and spending
 * Elixir is earned from fast answers + streaks, spent on training players
 */

import { ELIXIR_CONFIG } from '@/constants/game'
import type { ElixirTransaction, ElixirTransactionReason, SubjectValue } from '@/types/team'

// ============================================================================
// Elixir Calculation
// ============================================================================

/**
 * Calculate elixir earned from a correct answer
 * Speed gives base elixir (1-5), streak multiplies it (up to 2x)
 */
export function calculateElixirFromAnswer(
  responseTimeMs: number,
  timeLimitMs: number,
  currentStreak: number,
  isCorrect: boolean
): number {
  if (!isCorrect) return 0

  // Speed rating (1-5 base elixir)
  const speedRatio = responseTimeMs / timeLimitMs
  let baseElixir: number

  if (speedRatio <= 0.25) baseElixir = 5      // Lightning fast: < 25% of time
  else if (speedRatio <= 0.50) baseElixir = 4 // Fast: 25-50% of time
  else if (speedRatio <= 0.75) baseElixir = 3 // Normal: 50-75% of time
  else if (speedRatio <= 0.90) baseElixir = 2 // Slow: 75-90% of time
  else baseElixir = 1                          // Last second: > 90% of time

  // Streak multiplier (max 2x at 10 streak)
  const streakMultiplier = 1 + (Math.min(currentStreak, 10) * 0.1)

  return Math.round(baseElixir * streakMultiplier)
}

/**
 * Get speed rating description
 */
export function getSpeedRating(responseTimeMs: number, timeLimitMs: number): {
  rating: 'lightning' | 'fast' | 'normal' | 'slow' | 'last-second'
  baseElixir: number
  emoji: string
} {
  const speedRatio = responseTimeMs / timeLimitMs

  if (speedRatio <= 0.25) return { rating: 'lightning', baseElixir: 5, emoji: '⚡' }
  if (speedRatio <= 0.50) return { rating: 'fast', baseElixir: 4, emoji: '🏃' }
  if (speedRatio <= 0.75) return { rating: 'normal', baseElixir: 3, emoji: '👍' }
  if (speedRatio <= 0.90) return { rating: 'slow', baseElixir: 2, emoji: '🐢' }
  return { rating: 'last-second', baseElixir: 1, emoji: '😅' }
}

/**
 * Get streak multiplier description
 */
export function getStreakMultiplier(streak: number): {
  multiplier: number
  description: string
  emoji: string
} {
  const cappedStreak = Math.min(streak, 10)
  const multiplier = 1 + (cappedStreak * 0.1)

  if (streak === 0) return { multiplier: 1, description: 'No streak', emoji: '' }
  if (streak < 3) return { multiplier, description: `${streak} streak`, emoji: '🔥' }
  if (streak < 5) return { multiplier, description: `${streak} streak!`, emoji: '🔥🔥' }
  if (streak < 10) return { multiplier, description: `${streak} STREAK!`, emoji: '🔥🔥🔥' }
  return { multiplier: 2, description: 'MAX STREAK!', emoji: '💥' }
}

// ============================================================================
// Elixir Limits
// ============================================================================

/**
 * Check if user can earn more elixir today
 */
export function canEarnElixir(elixirEarnedToday: number): boolean {
  return elixirEarnedToday < ELIXIR_CONFIG.DAILY_CAP
}

/**
 * Calculate how much elixir can actually be earned (respecting caps)
 */
export function calculateActualElixirGain(
  elixirToAdd: number,
  currentElixir: number,
  elixirEarnedToday: number
): {
  actualGain: number
  cappedByStorage: boolean
  cappedByDaily: boolean
} {
  let actualGain = elixirToAdd
  let cappedByStorage = false
  let cappedByDaily = false

  // Check daily cap
  const dailyRemaining = ELIXIR_CONFIG.DAILY_CAP - elixirEarnedToday
  if (actualGain > dailyRemaining) {
    actualGain = Math.max(0, dailyRemaining)
    cappedByDaily = true
  }

  // Check storage cap
  const storageRemaining = ELIXIR_CONFIG.MAX_STORAGE - currentElixir
  if (actualGain > storageRemaining) {
    actualGain = Math.max(0, storageRemaining)
    cappedByStorage = true
  }

  return { actualGain, cappedByStorage, cappedByDaily }
}

// ============================================================================
// Elixir Spending
// ============================================================================

/**
 * Check if user can afford an action
 */
export function canAfford(currentElixir: number, cost: number): boolean {
  return currentElixir >= cost
}

/**
 * Get training cost for a player card
 */
export function getTrainingCost(): number {
  return ELIXIR_CONFIG.TRAIN_COST
}

/**
 * Get XP gain from training
 */
export function getTrainingXPGain(): number {
  return ELIXIR_CONFIG.TRAIN_XP_GAIN
}

/**
 * Get boost cost for a match
 */
export function getBoostCost(): number {
  return ELIXIR_CONFIG.BOOST_COST
}

/**
 * Get quick level cost and XP gain
 */
export function getQuickLevelDetails(): { cost: number; xpGain: number } {
  return {
    cost: ELIXIR_CONFIG.QUICK_LEVEL_COST,
    xpGain: ELIXIR_CONFIG.QUICK_LEVEL_XP
  }
}

// ============================================================================
// Match Elixir Summary
// ============================================================================

export interface MatchElixirSummary {
  totalElixir: number
  questionsAnswered: number
  correctAnswers: number
  speedBonuses: {
    lightning: number
    fast: number
    normal: number
    slow: number
    lastSecond: number
  }
  streakBonus: number
  maxStreak: number
  breakdown: Array<{
    questionIndex: number
    subject: SubjectValue
    baseElixir: number
    streakMultiplier: number
    totalElixir: number
    responseTime: number
    correct: boolean
  }>
}

/**
 * Calculate elixir summary for a completed match
 */
export function calculateMatchElixirSummary(
  answers: Array<{
    questionIndex: number
    subject: SubjectValue
    responseTimeMs: number
    timeLimitMs: number
    isCorrect: boolean
  }>
): MatchElixirSummary {
  let totalElixir = 0
  let currentStreak = 0
  let maxStreak = 0
  let streakBonus = 0

  const speedBonuses = {
    lightning: 0,
    fast: 0,
    normal: 0,
    slow: 0,
    lastSecond: 0
  }

  const breakdown = answers.map((answer) => {
    if (answer.isCorrect) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }

    const speedRating = getSpeedRating(answer.responseTimeMs, answer.timeLimitMs)
    const streakInfo = getStreakMultiplier(currentStreak)
    const baseElixir = answer.isCorrect ? speedRating.baseElixir : 0
    const elixirGained = calculateElixirFromAnswer(
      answer.responseTimeMs,
      answer.timeLimitMs,
      currentStreak,
      answer.isCorrect
    )

    // Track speed bonuses
    if (answer.isCorrect) {
      speedBonuses[speedRating.rating.replace('-', '') as keyof typeof speedBonuses]++
      streakBonus += Math.round(baseElixir * (streakInfo.multiplier - 1))
    }

    totalElixir += elixirGained

    return {
      questionIndex: answer.questionIndex,
      subject: answer.subject,
      baseElixir,
      streakMultiplier: streakInfo.multiplier,
      totalElixir: elixirGained,
      responseTime: answer.responseTimeMs,
      correct: answer.isCorrect
    }
  })

  return {
    totalElixir,
    questionsAnswered: answers.length,
    correctAnswers: answers.filter(a => a.isCorrect).length,
    speedBonuses,
    streakBonus,
    maxStreak,
    breakdown
  }
}

// ============================================================================
// Weekly Streak Bonus
// ============================================================================

/**
 * Check if user qualifies for weekly streak bonus (played 5+ days this week)
 */
export function checkWeeklyStreakBonus(daysPlayedThisWeek: number): {
  qualifies: boolean
  bonus: number
  daysNeeded: number
} {
  const requiredDays = 5
  const qualifies = daysPlayedThisWeek >= requiredDays

  return {
    qualifies,
    bonus: qualifies ? ELIXIR_CONFIG.WEEKLY_STREAK_BONUS : 0,
    daysNeeded: Math.max(0, requiredDays - daysPlayedThisWeek)
  }
}

// ============================================================================
// Transaction Helpers
// ============================================================================

/**
 * Create an elixir transaction object
 */
export function createElixirTransaction(
  teamId: string,
  amount: number,
  reason: ElixirTransactionReason,
  _matchId?: string,
  _playerCardId?: string
): Omit<ElixirTransaction, 'id' | 'createdAt'> {
  return {
    teamId,
    amount,
    reason
  }
}

/**
 * Get reason description for display
 */
export function getTransactionReasonLabel(reason: ElixirTransactionReason): string {
  const labels: Record<ElixirTransactionReason, string> = {
    match_reward: 'Match Reward',
    train_player: 'Train Player',
    daily_bonus: 'Daily Bonus',
    weekly_streak_bonus: 'Weekly Streak Bonus',
    boost_match: 'Match Boost',
    quick_level: 'Quick Level Up'
  }
  return labels[reason]
}

const elixirService = {
  calculateElixirFromAnswer,
  getSpeedRating,
  getStreakMultiplier,
  canEarnElixir,
  calculateActualElixirGain,
  canAfford,
  getTrainingCost,
  getTrainingXPGain,
  getBoostCost,
  getQuickLevelDetails,
  calculateMatchElixirSummary,
  checkWeeklyStreakBonus,
  createElixirTransaction,
  getTransactionReasonLabel
}

export default elixirService
