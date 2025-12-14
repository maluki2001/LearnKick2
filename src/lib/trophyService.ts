// Trophy Service - Manages trophy calculations, league updates, and ELO adjustments
import {
  TROPHY_CONFIG,
  getLeagueByTrophies,
  formatLeagueName,
  League
} from '@/constants/leagues'

export interface TrophyResult {
  previousTrophies: number
  newTrophies: number
  change: number
  previousLeague: League
  newLeague: League
  leagueChanged: boolean
  promoted: boolean
  demoted: boolean
  winStreak: number
  breakdown: TrophyBreakdown
}

export interface TrophyBreakdown {
  base: number
  underdogBonus: number
  favoriteBonus: number
  streakBonus: number
  total: number
}

export interface MatchResult {
  winnerId: string
  loserId: string
  winnerTrophies: number
  loserTrophies: number
  winnerStreak: number  // Current streak before this match
  isDraw?: boolean
}

export interface PlayerStats {
  id: string
  trophies: number
  highestTrophies: number
  league: string
  wins: number
  losses: number
  winStreak: number
  elo: number
  gamesPlayed: number
}

/**
 * Calculate trophy change for a match result
 */
export function calculateTrophyChange(
  playerTrophies: number,
  opponentTrophies: number,
  won: boolean,
  currentStreak: number = 0
): TrophyBreakdown {
  const trophyDiff = opponentTrophies - playerTrophies

  if (won) {
    const base = TROPHY_CONFIG.WIN_BASE
    let underdogBonus = 0
    let streakBonus = 0

    // Underdog bonus: winning against higher-rated player
    if (trophyDiff >= TROPHY_CONFIG.UNDERDOG_THRESHOLD) {
      underdogBonus = TROPHY_CONFIG.UNDERDOG_BONUS
    }

    // Streak bonus: consecutive wins (applied after this win)
    const newStreak = currentStreak + 1
    if (newStreak > 1) {
      streakBonus = Math.min(
        (newStreak - 1) * TROPHY_CONFIG.STREAK_BONUS,
        TROPHY_CONFIG.MAX_STREAK_BONUS
      )
    }

    return {
      base,
      underdogBonus,
      favoriteBonus: 0,
      streakBonus,
      total: base + underdogBonus + streakBonus,
    }
  } else {
    const base = TROPHY_CONFIG.LOSS_BASE
    let favoriteBonus = 0

    // Favorite penalty: losing against lower-rated player
    if (trophyDiff <= -TROPHY_CONFIG.UNDERDOG_THRESHOLD) {
      favoriteBonus = TROPHY_CONFIG.FAVORITE_PENALTY
    }

    return {
      base: -base,
      underdogBonus: 0,
      favoriteBonus: -favoriteBonus,
      streakBonus: 0,
      total: -(base + favoriteBonus),
    }
  }
}

/**
 * Process a complete match and calculate trophy changes for both players
 */
export function processMatchResult(match: MatchResult): {
  winner: TrophyResult
  loser: TrophyResult
} {
  if (match.isDraw) {
    // Draws don't change trophies but reset streaks
    const winnerLeague = getLeagueByTrophies(match.winnerTrophies)
    const loserLeague = getLeagueByTrophies(match.loserTrophies)

    return {
      winner: {
        previousTrophies: match.winnerTrophies,
        newTrophies: match.winnerTrophies,
        change: 0,
        previousLeague: winnerLeague,
        newLeague: winnerLeague,
        leagueChanged: false,
        promoted: false,
        demoted: false,
        winStreak: 0,
        breakdown: { base: 0, underdogBonus: 0, favoriteBonus: 0, streakBonus: 0, total: 0 },
      },
      loser: {
        previousTrophies: match.loserTrophies,
        newTrophies: match.loserTrophies,
        change: 0,
        previousLeague: loserLeague,
        newLeague: loserLeague,
        leagueChanged: false,
        promoted: false,
        demoted: false,
        winStreak: 0,
        breakdown: { base: 0, underdogBonus: 0, favoriteBonus: 0, streakBonus: 0, total: 0 },
      },
    }
  }

  // Calculate winner's trophy change
  const winnerBreakdown = calculateTrophyChange(
    match.winnerTrophies,
    match.loserTrophies,
    true,
    match.winnerStreak
  )

  // Calculate loser's trophy change
  const loserBreakdown = calculateTrophyChange(
    match.loserTrophies,
    match.winnerTrophies,
    false,
    0 // Streak resets on loss
  )

  // Apply changes
  const winnerNewTrophies = Math.max(
    TROPHY_CONFIG.MIN_TROPHIES,
    match.winnerTrophies + winnerBreakdown.total
  )
  const loserNewTrophies = Math.max(
    TROPHY_CONFIG.MIN_TROPHIES,
    match.loserTrophies + loserBreakdown.total
  )

  // Get leagues
  const winnerPreviousLeague = getLeagueByTrophies(match.winnerTrophies)
  const winnerNewLeague = getLeagueByTrophies(winnerNewTrophies)
  const loserPreviousLeague = getLeagueByTrophies(match.loserTrophies)
  const loserNewLeague = getLeagueByTrophies(loserNewTrophies)

  // Check for league changes
  const winnerLeagueChanged = winnerPreviousLeague.id !== winnerNewLeague.id
  const loserLeagueChanged = loserPreviousLeague.id !== loserNewLeague.id

  return {
    winner: {
      previousTrophies: match.winnerTrophies,
      newTrophies: winnerNewTrophies,
      change: winnerBreakdown.total,
      previousLeague: winnerPreviousLeague,
      newLeague: winnerNewLeague,
      leagueChanged: winnerLeagueChanged,
      promoted: winnerLeagueChanged && winnerNewTrophies > match.winnerTrophies,
      demoted: false, // Winners can't demote
      winStreak: match.winnerStreak + 1,
      breakdown: winnerBreakdown,
    },
    loser: {
      previousTrophies: match.loserTrophies,
      newTrophies: loserNewTrophies,
      change: loserBreakdown.total,
      previousLeague: loserPreviousLeague,
      newLeague: loserNewLeague,
      leagueChanged: loserLeagueChanged,
      promoted: false, // Losers can't promote
      demoted: loserLeagueChanged && loserNewTrophies < match.loserTrophies,
      winStreak: 0, // Streak resets on loss
      breakdown: loserBreakdown,
    },
  }
}

/**
 * Calculate ELO change for a match (for matchmaking accuracy)
 */
export function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  won: boolean,
  kFactor: number = 32
): number {
  // Expected score based on ELO difference
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400))

  // Actual score (1 for win, 0 for loss, 0.5 for draw)
  const actualScore = won ? 1 : 0

  // ELO change
  return Math.round(kFactor * (actualScore - expectedScore))
}

/**
 * Get display text for trophy change
 */
export function getTrophyChangeDisplay(change: number): string {
  if (change > 0) {
    return `+${change}`
  }
  return change.toString()
}

/**
 * Get color class for trophy change
 */
export function getTrophyChangeColor(change: number): string {
  if (change > 0) return 'text-green-500'
  if (change < 0) return 'text-red-500'
  return 'text-gray-500'
}

/**
 * Format streak display
 */
export function getStreakDisplay(streak: number): string {
  if (streak <= 0) return ''
  if (streak >= 5) return `${streak} Win Streak!`
  return `${streak} Wins`
}

/**
 * Check if player is close to promotion
 */
export function isCloseToPromotion(trophies: number, threshold: number = 50): boolean {
  const currentLeague = getLeagueByTrophies(trophies)
  if (currentLeague.id === 'legend') return false

  const toNextLeague = currentLeague.maxTrophies + 1 - trophies
  return toNextLeague <= threshold
}

/**
 * Check if player is close to demotion
 */
export function isCloseToDemotion(trophies: number, threshold: number = 30): boolean {
  const currentLeague = getLeagueByTrophies(trophies)
  if (currentLeague.id === 'bronze-3') return false

  const aboveMin = trophies - currentLeague.minTrophies
  return aboveMin <= threshold
}

/**
 * Get motivational message based on result
 */
export function getMatchResultMessage(result: TrophyResult, isWinner: boolean): string {
  if (isWinner) {
    if (result.promoted) {
      return `Congratulations! You've been promoted to ${formatLeagueName(result.newLeague)}!`
    }
    if (result.winStreak >= 5) {
      return `Amazing! ${result.winStreak} wins in a row! Keep it up!`
    }
    if (result.winStreak >= 3) {
      return `Great job! You're on fire with ${result.winStreak} consecutive wins!`
    }
    if (result.breakdown.underdogBonus > 0) {
      return 'Victory against a tough opponent! Extra trophies earned!'
    }
    return 'Great match! Keep playing to climb the ranks!'
  } else {
    if (result.demoted) {
      return `You've dropped to ${formatLeagueName(result.newLeague)}. Keep practicing to climb back!`
    }
    if (result.breakdown.favoriteBonus < 0) {
      return 'Tough loss against an underdog. Learn from it and come back stronger!'
    }
    return 'Good effort! Every match is a chance to learn and improve!'
  }
}

/**
 * Estimate matchmaking wait based on trophy range
 */
export function estimateMatchmakingTime(trophies: number): string {
  // Higher/lower trophy ranges have fewer players = longer wait
  if (trophies < 200 || trophies > 4000) {
    return 'May take up to 60 seconds'
  }
  if (trophies > 3000) {
    return 'Usually 20-40 seconds'
  }
  return 'Usually under 20 seconds'
}

// Export types
export type { League }
