/**
 * Match Results API Route - Process elixir and XP after match completion
 * Calculates elixir from answer speed/streaks and distributes XP to player cards
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { database } from '@/lib/database.server'
import { ELIXIR_CONFIG } from '@/constants/game'
import { calculateElixirFromAnswer, calculateActualElixirGain } from '@/lib/elixirService'
import { getLevelFromXP, getXPToNextLevel } from '@/types/team'
import type { SubjectValue } from '@/types/team'

interface QuestionResult {
  subject: SubjectValue
  responseTimeMs: number
  timeLimitMs: number
  isCorrect: boolean
}

interface MatchResultBody {
  questionsAnswered: QuestionResult[]
  matchResult: 'win' | 'draw' | 'loss'
  goalsFor: number
  goalsAgainst: number
  matchId?: string
}

/**
 * POST /api/team/match - Process match results
 * Calculate and award elixir, distribute XP to player cards
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body: MatchResultBody = await request.json()
    const { questionsAnswered, matchResult, goalsFor, goalsAgainst } = body

    if (!questionsAnswered || !Array.isArray(questionsAnswered)) {
      return NextResponse.json(
        { error: 'questionsAnswered array is required' },
        { status: 400 }
      )
    }

    // Get user's team
    const teamResult = await database.query(
      'SELECT * FROM player_teams WHERE user_id = $1',
      [session.user.id]
    )

    if (!teamResult.rows[0]) {
      return NextResponse.json(
        { error: 'Team not found. Please create a team first.' },
        { status: 404 }
      )
    }

    const team = teamResult.rows[0]

    // Get player cards
    const cardsResult = await database.query(
      'SELECT * FROM player_cards WHERE team_id = $1',
      [team.id]
    )

    const cardsBySubject: Record<string, typeof cardsResult.rows[0]> = {}
    cardsResult.rows.forEach(card => {
      cardsBySubject[card.subject] = card
    })

    // Check if daily elixir needs reset
    const lastReset = new Date(team.last_elixir_reset)
    const now = new Date()
    let elixirEarnedToday = team.elixir_earned_today

    if (lastReset.toDateString() !== now.toDateString()) {
      await database.query(
        'UPDATE player_teams SET elixir_earned_today = 0, last_elixir_reset = NOW() WHERE id = $1',
        [team.id]
      )
      elixirEarnedToday = 0
    }

    // Calculate elixir earned
    let totalElixir = 0
    let currentStreak = 0
    let maxStreak = 0
    const xpDistributed: Record<SubjectValue, number> = {} as Record<SubjectValue, number>
    const cardsLeveledUp: SubjectValue[] = []

    // Process each question answered
    questionsAnswered.forEach(q => {
      if (q.isCorrect) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }

      // Calculate elixir for this answer
      const elixir = calculateElixirFromAnswer(
        q.responseTimeMs,
        q.timeLimitMs,
        currentStreak,
        q.isCorrect
      )
      totalElixir += elixir

      // Calculate XP for correct answers
      if (q.isCorrect) {
        const baseXP = 2
        const speedBonus = q.responseTimeMs / q.timeLimitMs < 0.5 ? 2 : 1
        const xpGain = baseXP * speedBonus

        if (!xpDistributed[q.subject]) {
          xpDistributed[q.subject] = 0
        }
        xpDistributed[q.subject] += xpGain
      }
    })

    // Calculate actual elixir gain respecting caps
    const { actualGain, cappedByDaily, cappedByStorage } = calculateActualElixirGain(
      totalElixir,
      team.elixir,
      elixirEarnedToday
    )

    // Calculate league points change
    const pointsChange = matchResult === 'win' ? 3 : matchResult === 'draw' ? 1 : 0

    // Start transaction
    await database.query('BEGIN')

    try {
      // Update team elixir and league points
      await database.query(
        `UPDATE player_teams SET
          elixir = LEAST(elixir + $1, $2),
          elixir_earned_today = elixir_earned_today + $1,
          league_points = GREATEST(0, league_points + $3),
          updated_at = NOW()
        WHERE id = $4`,
        [actualGain, ELIXIR_CONFIG.MAX_STORAGE, pointsChange, team.id]
      )

      // Record elixir transaction
      if (actualGain > 0) {
        await database.query(
          'INSERT INTO elixir_transactions (id, team_id, amount, reason) VALUES ($1, $2, $3, $4)',
          [crypto.randomUUID(), team.id, actualGain, 'match_reward']
        )
      }

      // Distribute XP to cards and update stats
      for (const [subject, xp] of Object.entries(xpDistributed)) {
        const card = cardsBySubject[subject]
        if (!card) continue

        const oldLevel = card.level
        const newXP = card.xp + xp
        const newLevel = getLevelFromXP(newXP)
        const xpToNextLevel = getXPToNextLevel(newXP)

        // Update accuracy and speed stats based on questions
        const subjectQuestions = questionsAnswered.filter(q => q.subject === subject)
        const correctCount = subjectQuestions.filter(q => q.isCorrect).length
        const avgResponseTime = subjectQuestions.reduce((sum, q) => sum + q.responseTimeMs, 0) / subjectQuestions.length

        // Calculate new stats
        let newAccuracy = card.accuracy
        let newSpeed = card.speed

        if (subjectQuestions.length > 0) {
          const accuracyChange = (correctCount / subjectQuestions.length) * 2 - 1 // -1 to +1
          newAccuracy = Math.max(0, Math.min(99, card.accuracy + accuracyChange))

          const avgSpeedRatio = avgResponseTime / (subjectQuestions[0]?.timeLimitMs || 10000)
          const speedChange = avgSpeedRatio < 0.5 ? 0.5 : avgSpeedRatio < 0.75 ? 0.2 : 0
          newSpeed = Math.max(0, Math.min(99, card.speed + speedChange))
        }

        await database.query(
          `UPDATE player_cards SET
            xp = $1,
            level = $2,
            xp_to_next_level = $3,
            accuracy = $4,
            speed = $5,
            updated_at = NOW()
          WHERE id = $6`,
          [newXP, newLevel, xpToNextLevel, Math.round(newAccuracy), Math.round(newSpeed), card.id]
        )

        if (newLevel > oldLevel) {
          cardsLeveledUp.push(subject as SubjectValue)
        }
      }

      // Update league tier based on new points
      const newPoints = team.league_points + pointsChange
      let newTier = 'BRONZE'
      if (newPoints >= 3001) newTier = 'LEGEND'
      else if (newPoints >= 2501) newTier = 'CHAMPION'
      else if (newPoints >= 2001) newTier = 'DIAMOND'
      else if (newPoints >= 1501) newTier = 'PLATINUM'
      else if (newPoints >= 1001) newTier = 'GOLD'
      else if (newPoints >= 501) newTier = 'SILVER'

      await database.query(
        'UPDATE player_teams SET league_tier = $1 WHERE id = $2',
        [newTier, team.id]
      )

      await database.query('COMMIT')

      return NextResponse.json({
        success: true,
        elixirEarned: actualGain,
        elixirCapped: cappedByDaily || cappedByStorage,
        cappedByDaily,
        cappedByStorage,
        xpDistributed,
        cardsLeveledUp,
        pointsChange,
        newLeaguePoints: newPoints,
        newLeagueTier: newTier,
        maxStreak,
        matchStats: {
          questionsAnswered: questionsAnswered.length,
          correctAnswers: questionsAnswered.filter(q => q.isCorrect).length,
          goalsFor,
          goalsAgainst,
          result: matchResult
        }
      })
    } catch (err) {
      await database.query('ROLLBACK')
      throw err
    }
  } catch (error) {
    console.error('Match results error:', error)
    return NextResponse.json(
      { error: 'Failed to process match results' },
      { status: 500 }
    )
  }
}
