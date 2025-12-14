// Matchmaking Service - Queue management and player matching algorithm
// Priority Order: Same grade + same school → Same grade + any school → Adjacent grade

export interface QueuedPlayer {
  id: string
  name: string
  trophies: number
  elo: number
  grade: number
  schoolId: string | null
  language: string
  joinedAt: Date
  status: 'waiting' | 'matched' | 'ready' | 'cancelled'
}

export interface MatchResult {
  player1: QueuedPlayer
  player2: QueuedPlayer
  matchId: string
  matchQuality: 'perfect' | 'good' | 'fair' | 'any'
}

export interface MatchmakingConfig {
  // Time thresholds (ms) before relaxing match criteria
  sameSchoolTimeout: number      // 10s - try same school first
  sameGradeTimeout: number       // 20s - then same grade any school
  adjacentGradeTimeout: number   // 30s - then adjacent grade
  anyMatchTimeout: number        // 45s - accept any opponent

  // Trophy/ELO tolerances
  idealTrophyDiff: number        // 100 - perfect match
  goodTrophyDiff: number         // 200 - good match
  fairTrophyDiff: number         // 400 - fair match
  maxTrophyDiff: number          // 1000 - max allowed difference

  // Queue limits
  maxQueueTime: number           // 60s - kick from queue after this
  minQueueTime: number           // 3s - minimum wait before matching
}

export const DEFAULT_CONFIG: MatchmakingConfig = {
  sameSchoolTimeout: 10000,
  sameGradeTimeout: 20000,
  adjacentGradeTimeout: 30000,
  anyMatchTimeout: 45000,
  idealTrophyDiff: 100,
  goodTrophyDiff: 200,
  fairTrophyDiff: 400,
  maxTrophyDiff: 1000,
  maxQueueTime: 60000,
  minQueueTime: 3000,
}

/**
 * Calculate match quality score between two players
 * Higher score = better match
 */
export function calculateMatchScore(
  player1: QueuedPlayer,
  player2: QueuedPlayer,
  config: MatchmakingConfig = DEFAULT_CONFIG
): number {
  let score = 100

  // Same grade is most important for educational matching
  const gradeDiff = Math.abs(player1.grade - player2.grade)
  if (gradeDiff === 0) {
    score += 50
  } else if (gradeDiff === 1) {
    score += 20
  } else if (gradeDiff === 2) {
    score += 0
  } else {
    score -= 30
  }

  // Same school bonus
  if (player1.schoolId && player1.schoolId === player2.schoolId) {
    score += 30
  }

  // Trophy/skill matching
  const trophyDiff = Math.abs(player1.trophies - player2.trophies)
  if (trophyDiff <= config.idealTrophyDiff) {
    score += 40
  } else if (trophyDiff <= config.goodTrophyDiff) {
    score += 25
  } else if (trophyDiff <= config.fairTrophyDiff) {
    score += 10
  } else if (trophyDiff <= config.maxTrophyDiff) {
    score += 0
  } else {
    score -= 20
  }

  // Same language
  if (player1.language === player2.language) {
    score += 15
  }

  return Math.max(0, score)
}

/**
 * Determine match quality category
 */
export function getMatchQuality(
  player1: QueuedPlayer,
  player2: QueuedPlayer
): 'perfect' | 'good' | 'fair' | 'any' {
  const gradeDiff = Math.abs(player1.grade - player2.grade)
  const trophyDiff = Math.abs(player1.trophies - player2.trophies)
  const sameSchool = player1.schoolId === player2.schoolId

  if (gradeDiff === 0 && trophyDiff <= 100 && sameSchool) {
    return 'perfect'
  }
  if (gradeDiff === 0 && trophyDiff <= 200) {
    return 'good'
  }
  if (gradeDiff <= 1 && trophyDiff <= 400) {
    return 'fair'
  }
  return 'any'
}

/**
 * Find best match for a player in the queue
 */
export function findBestMatch(
  player: QueuedPlayer,
  queue: QueuedPlayer[],
  config: MatchmakingConfig = DEFAULT_CONFIG
): { match: QueuedPlayer | null; quality: 'perfect' | 'good' | 'fair' | 'any' | null } {
  const waitTime = Date.now() - player.joinedAt.getTime()
  const waitingPlayers = queue.filter(
    p => p.id !== player.id && p.status === 'waiting'
  )

  if (waitingPlayers.length === 0) {
    return { match: null, quality: null }
  }

  // Score and sort all potential matches
  const scoredMatches = waitingPlayers
    .map(opponent => ({
      opponent,
      score: calculateMatchScore(player, opponent, config),
      quality: getMatchQuality(player, opponent),
      opponentWaitTime: Date.now() - opponent.joinedAt.getTime(),
    }))
    .sort((a, b) => {
      // Prioritize match quality first
      const qualityOrder = { perfect: 4, good: 3, fair: 2, any: 1 }
      const qualityDiff = qualityOrder[b.quality] - qualityOrder[a.quality]
      if (qualityDiff !== 0) return qualityDiff

      // Then by score
      const scoreDiff = b.score - a.score
      if (scoreDiff !== 0) return scoreDiff

      // Finally, prioritize players who have waited longer
      return b.opponentWaitTime - a.opponentWaitTime
    })

  // Apply time-based relaxation of match criteria
  for (const { opponent, quality, score } of scoredMatches) {
    // Phase 1: Same school + same grade (first 10 seconds)
    if (waitTime < config.sameSchoolTimeout) {
      if (quality === 'perfect') {
        return { match: opponent, quality }
      }
      continue
    }

    // Phase 2: Same grade, any school (10-20 seconds)
    if (waitTime < config.sameGradeTimeout) {
      if (quality === 'perfect' || quality === 'good') {
        return { match: opponent, quality }
      }
      continue
    }

    // Phase 3: Adjacent grade (20-30 seconds)
    if (waitTime < config.adjacentGradeTimeout) {
      if (quality !== 'any') {
        return { match: opponent, quality }
      }
      continue
    }

    // Phase 4: Accept any valid match (30+ seconds)
    if (score >= 50) {  // Minimum acceptable score
      return { match: opponent, quality }
    }
  }

  // After max queue time, accept anyone
  if (waitTime >= config.anyMatchTimeout && scoredMatches.length > 0) {
    const best = scoredMatches[0]
    return { match: best.opponent, quality: best.quality }
  }

  return { match: null, quality: null }
}

/**
 * Generate a unique match ID
 */
export function generateMatchId(): string {
  return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Estimate wait time based on queue size and player attributes
 */
export function estimateWaitTime(
  player: QueuedPlayer,
  queueSize: number,
  _config: MatchmakingConfig = DEFAULT_CONFIG
): { min: number; max: number; message: string } {
  // Base estimate on queue size
  const baseWait = queueSize > 10 ? 5 : queueSize > 5 ? 15 : 30

  // Adjust for trophy range (extreme trophies = longer wait)
  let trophyModifier = 1
  if (player.trophies < 100 || player.trophies > 4000) {
    trophyModifier = 1.5
  } else if (player.trophies < 300 || player.trophies > 3000) {
    trophyModifier = 1.2
  }

  const minWait = Math.round(baseWait * 0.5)
  const maxWait = Math.round(baseWait * trophyModifier * 2)

  let message = 'Finding opponent...'
  if (queueSize > 10) {
    message = 'Many players online - should be quick!'
  } else if (queueSize < 3) {
    message = 'Searching for players...'
  }

  return { min: minWait, max: maxWait, message }
}

/**
 * Format queue status for display
 */
export function formatQueueStatus(
  waitTimeSeconds: number,
  config: MatchmakingConfig = DEFAULT_CONFIG
): string {
  if (waitTimeSeconds < 5) {
    return 'Finding opponent...'
  }
  if (waitTimeSeconds < config.sameSchoolTimeout / 1000) {
    return 'Looking for players in your school...'
  }
  if (waitTimeSeconds < config.sameGradeTimeout / 1000) {
    return 'Searching your grade level...'
  }
  if (waitTimeSeconds < config.adjacentGradeTimeout / 1000) {
    return 'Expanding search...'
  }
  if (waitTimeSeconds < config.anyMatchTimeout / 1000) {
    return 'Almost there...'
  }
  return 'Finding any available opponent...'
}

/**
 * Check if player should be kicked from queue (timeout)
 */
export function shouldKickFromQueue(
  player: QueuedPlayer,
  config: MatchmakingConfig = DEFAULT_CONFIG
): boolean {
  const waitTime = Date.now() - player.joinedAt.getTime()
  return waitTime >= config.maxQueueTime
}

/**
 * Create initial player for queue
 */
export function createQueuedPlayer(data: {
  id: string
  name: string
  trophies: number
  elo: number
  grade: number
  schoolId: string | null
  language: string
}): QueuedPlayer {
  return {
    ...data,
    joinedAt: new Date(),
    status: 'waiting',
  }
}
