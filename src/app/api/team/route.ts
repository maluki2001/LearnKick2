/**
 * Team API Routes - CRUD operations for player teams
 * Handles team creation, retrieval, updates, and player card management
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { database } from '@/lib/database.server'
import { SOCCER_POSITIONS, HOCKEY_POSITIONS, ELIXIR_CONFIG } from '@/constants/game'
import type { Team, PlayerCard } from '@/types/team'

/**
 * GET /api/team - Get user's team with all player cards
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get team
    const teamResult = await database.query(
      `SELECT * FROM player_teams WHERE user_id = $1`,
      [session.user.id]
    )

    if (!teamResult.rows[0]) {
      return NextResponse.json({
        success: true,
        team: null,
        message: 'No team found. Create one first.'
      })
    }

    const teamRow = teamResult.rows[0]

    // Get player cards
    const cardsResult = await database.query(
      `SELECT * FROM player_cards WHERE team_id = $1 ORDER BY position`,
      [teamRow.id]
    )

    // Calculate overall for each card
    const cards: PlayerCard[] = cardsResult.rows.map(card => {
      const overall = Math.round(
        card.accuracy * 0.4 +
        card.speed * 0.3 +
        card.consistency * 0.2 +
        card.difficulty_mastery * 0.1
      )

      let rarity: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND' | 'CHAMPION' = 'BRONZE'
      if (overall >= 90) rarity = 'CHAMPION'
      else if (overall >= 80) rarity = 'DIAMOND'
      else if (overall >= 60) rarity = 'GOLD'
      else if (overall >= 40) rarity = 'SILVER'

      return {
        id: card.id,
        teamId: card.team_id,
        position: card.position,
        subject: card.subject,
        accuracy: card.accuracy,
        speed: card.speed,
        consistency: card.consistency,
        difficultyMastery: card.difficulty_mastery,
        overall,
        level: card.level,
        xp: card.xp,
        xpToNextLevel: card.xp_to_next_level,
        rarity,
        createdAt: new Date(card.created_at),
        updatedAt: new Date(card.updated_at)
      }
    })

    const team: Team = {
      id: teamRow.id,
      userId: teamRow.user_id,
      teamName: teamRow.team_name,
      arena: teamRow.arena || 'soccer',
      formation: teamRow.formation || '4-3-3',
      goalkeeperSubject: teamRow.goalkeeper_subject,
      cards,
      elixir: teamRow.elixir || 0,
      elixirEarnedToday: teamRow.elixir_earned_today || 0,
      lastElixirReset: teamRow.last_elixir_reset ? new Date(teamRow.last_elixir_reset) : new Date(),
      leaguePoints: teamRow.league_points || 0,
      leagueTier: teamRow.league_tier || 'BRONZE',
      createdAt: new Date(teamRow.created_at),
      updatedAt: new Date(teamRow.updated_at)
    }

    return NextResponse.json({ success: true, team })
  } catch (error) {
    console.error('Team GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/team - Create a new team
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

    const body = await request.json()
    const { teamName, arena = 'soccer', goalkeeperSubject } = body

    if (!teamName) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      )
    }

    // Check if user already has a team
    const existingTeam = await database.query(
      'SELECT id FROM player_teams WHERE user_id = $1',
      [session.user.id]
    )

    if (existingTeam.rows[0]) {
      return NextResponse.json(
        { error: 'User already has a team' },
        { status: 400 }
      )
    }

    // Create team
    const teamId = crypto.randomUUID()
    await database.query(
      `INSERT INTO player_teams (id, user_id, team_name, arena, formation, goalkeeper_subject, elixir, elixir_earned_today, last_elixir_reset, league_points, league_tier)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10)`,
      [
        teamId,
        session.user.id,
        teamName,
        arena,
        arena === 'soccer' ? '4-3-3' : '1-2-2',
        goalkeeperSubject || null,
        0, // Starting elixir
        0, // Elixir earned today
        0, // League points
        'BRONZE' // Starting tier
      ]
    )

    // Create player cards based on arena
    const positions = arena === 'soccer' ? SOCCER_POSITIONS : HOCKEY_POSITIONS

    for (const [posId, posData] of Object.entries(positions)) {
      const cardId = crypto.randomUUID()
      // Use subject from position data, or default to 'math'
      let subject = (posData as { subject: string | null }).subject || 'math'

      // Override goalkeeper subject if provided
      if ((posId === 'GK' || posId === 'G') && goalkeeperSubject) {
        subject = goalkeeperSubject
      }

      await database.query(
        `INSERT INTO player_cards (id, team_id, position, subject, accuracy, speed, consistency, difficulty_mastery, level, xp, xp_to_next_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          cardId,
          teamId,
          posId,
          subject,
          50, // Starting accuracy
          50, // Starting speed
          50, // Starting consistency
          30, // Starting difficulty mastery
          1,  // Starting level
          0,  // Starting XP
          100 // XP to level 2
        ]
      )
    }

    // Fetch the created team
    const teamResult = await database.query(
      `SELECT * FROM player_teams WHERE id = $1`,
      [teamId]
    )
    const cardsResult = await database.query(
      `SELECT * FROM player_cards WHERE team_id = $1`,
      [teamId]
    )

    const teamRow = teamResult.rows[0]
    const cards: PlayerCard[] = cardsResult.rows.map(card => {
      const overall = Math.round(
        card.accuracy * 0.4 +
        card.speed * 0.3 +
        card.consistency * 0.2 +
        card.difficulty_mastery * 0.1
      )

      let rarity: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND' | 'CHAMPION' = 'BRONZE'
      if (overall >= 90) rarity = 'CHAMPION'
      else if (overall >= 80) rarity = 'DIAMOND'
      else if (overall >= 60) rarity = 'GOLD'
      else if (overall >= 40) rarity = 'SILVER'

      return {
        id: card.id,
        teamId: card.team_id,
        position: card.position,
        subject: card.subject,
        accuracy: card.accuracy,
        speed: card.speed,
        consistency: card.consistency,
        difficultyMastery: card.difficulty_mastery,
        overall,
        level: card.level,
        xp: card.xp,
        xpToNextLevel: card.xp_to_next_level,
        rarity,
        createdAt: new Date(card.created_at),
        updatedAt: new Date(card.updated_at)
      }
    })

    const team: Team = {
      id: teamRow.id,
      userId: teamRow.user_id,
      teamName: teamRow.team_name,
      arena: teamRow.arena,
      formation: teamRow.formation,
      goalkeeperSubject: teamRow.goalkeeper_subject,
      cards,
      elixir: teamRow.elixir,
      elixirEarnedToday: teamRow.elixir_earned_today,
      lastElixirReset: new Date(teamRow.last_elixir_reset),
      leaguePoints: teamRow.league_points,
      leagueTier: teamRow.league_tier,
      createdAt: new Date(teamRow.created_at),
      updatedAt: new Date(teamRow.updated_at)
    }

    return NextResponse.json({ success: true, team })
  } catch (error) {
    console.error('Team POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/team - Update team settings or goalkeeper subject
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { teamName, formation, goalkeeperSubject } = body

    // Get user's team
    const teamResult = await database.query(
      'SELECT * FROM player_teams WHERE user_id = $1',
      [session.user.id]
    )

    if (!teamResult.rows[0]) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    const team = teamResult.rows[0]
    const updates: string[] = []
    const values: (string | number)[] = []
    let paramIndex = 1

    if (teamName) {
      updates.push(`team_name = $${paramIndex++}`)
      values.push(teamName)
    }

    if (formation) {
      updates.push(`formation = $${paramIndex++}`)
      values.push(formation)
    }

    if (goalkeeperSubject) {
      updates.push(`goalkeeper_subject = $${paramIndex++}`)
      values.push(goalkeeperSubject)

      // Also update the goalkeeper card's subject
      const gkPosition = team.arena === 'soccer' ? 'GK' : 'G'
      await database.query(
        `UPDATE player_cards SET subject = $1, updated_at = NOW() WHERE team_id = $2 AND position = $3`,
        [goalkeeperSubject, team.id, gkPosition]
      )
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`)
      values.push(team.id)

      await database.query(
        `UPDATE player_teams SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        values
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Team PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/team - Handle elixir operations (add/spend)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, amount, reason } = body

    // Get user's team
    const teamResult = await database.query(
      'SELECT * FROM player_teams WHERE user_id = $1',
      [session.user.id]
    )

    if (!teamResult.rows[0]) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    const team = teamResult.rows[0]

    // Check if daily elixir needs reset
    const lastReset = new Date(team.last_elixir_reset)
    const now = new Date()
    let elixirEarnedToday = team.elixir_earned_today

    if (lastReset.toDateString() !== now.toDateString()) {
      // Reset daily elixir
      await database.query(
        `UPDATE player_teams SET elixir_earned_today = 0, last_elixir_reset = NOW() WHERE id = $1`,
        [team.id]
      )
      elixirEarnedToday = 0
    }

    if (action === 'add') {
      // Calculate actual gain respecting caps
      let actualGain = amount
      let cappedByDaily = false
      let cappedByStorage = false

      // Daily cap check
      const dailyRemaining = ELIXIR_CONFIG.DAILY_CAP - elixirEarnedToday
      if (actualGain > dailyRemaining) {
        actualGain = Math.max(0, dailyRemaining)
        cappedByDaily = true
      }

      // Storage cap check
      const storageRemaining = ELIXIR_CONFIG.MAX_STORAGE - team.elixir
      if (actualGain > storageRemaining) {
        actualGain = Math.max(0, storageRemaining)
        cappedByStorage = true
      }

      if (actualGain > 0) {
        await database.query(
          `UPDATE player_teams SET elixir = elixir + $1, elixir_earned_today = elixir_earned_today + $1, updated_at = NOW() WHERE id = $2`,
          [actualGain, team.id]
        )

        // Record transaction
        await database.query(
          `INSERT INTO elixir_transactions (id, team_id, amount, reason) VALUES ($1, $2, $3, $4)`,
          [crypto.randomUUID(), team.id, actualGain, reason || 'match_reward']
        )
      }

      return NextResponse.json({
        success: true,
        actualGain,
        cappedByDaily,
        cappedByStorage,
        newElixir: team.elixir + actualGain
      })

    } else if (action === 'spend') {
      if (team.elixir < amount) {
        return NextResponse.json(
          { error: 'Not enough elixir', currentElixir: team.elixir },
          { status: 400 }
        )
      }

      await database.query(
        `UPDATE player_teams SET elixir = elixir - $1, updated_at = NOW() WHERE id = $2`,
        [amount, team.id]
      )

      // Record transaction
      await database.query(
        `INSERT INTO elixir_transactions (id, team_id, amount, reason) VALUES ($1, $2, $3, $4)`,
        [crypto.randomUUID(), team.id, -amount, reason || 'spend']
      )

      return NextResponse.json({
        success: true,
        spent: amount,
        newElixir: team.elixir - amount
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "add" or "spend"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Team PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update elixir' },
      { status: 500 }
    )
  }
}
