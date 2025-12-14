/**
 * Training API Route - Handle player card training with elixir
 * Spend elixir to gain XP on player cards
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { database } from '@/lib/database.server'
import { ELIXIR_CONFIG } from '@/constants/game'
import { LEVEL_XP_REQUIREMENTS } from '@/types/team'

/**
 * POST /api/team/train - Train a player card
 * Body: { cardId: string }
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
    const { cardId } = body

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card ID is required' },
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
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    const team = teamResult.rows[0]

    // Check if user has enough elixir
    if (team.elixir < ELIXIR_CONFIG.TRAIN_COST) {
      return NextResponse.json(
        {
          error: 'Not enough elixir',
          currentElixir: team.elixir,
          required: ELIXIR_CONFIG.TRAIN_COST
        },
        { status: 400 }
      )
    }

    // Get the card to train
    const cardResult = await database.query(
      'SELECT * FROM player_cards WHERE id = $1 AND team_id = $2',
      [cardId, team.id]
    )

    if (!cardResult.rows[0]) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    const card = cardResult.rows[0]
    const xpGained = ELIXIR_CONFIG.TRAIN_XP_GAIN
    const newXP = card.xp + xpGained
    const oldLevel = card.level

    // Calculate new level
    let newLevel = oldLevel
    for (let level = 14; level >= 1; level--) {
      if (newXP >= (LEVEL_XP_REQUIREMENTS[level] || 0)) {
        newLevel = level
        break
      }
    }

    const leveledUp = newLevel > oldLevel

    // Calculate XP to next level
    const nextLevelXP = LEVEL_XP_REQUIREMENTS[newLevel + 1] || newXP
    const xpToNextLevel = Math.max(0, nextLevelXP - newXP)

    // Start transaction - spend elixir and update card
    await database.query('BEGIN')

    try {
      // Spend elixir
      await database.query(
        'UPDATE player_teams SET elixir = elixir - $1, updated_at = NOW() WHERE id = $2',
        [ELIXIR_CONFIG.TRAIN_COST, team.id]
      )

      // Record elixir transaction
      await database.query(
        'INSERT INTO elixir_transactions (id, team_id, amount, reason) VALUES ($1, $2, $3, $4)',
        [crypto.randomUUID(), team.id, -ELIXIR_CONFIG.TRAIN_COST, 'train_player']
      )

      // Update card
      await database.query(
        `UPDATE player_cards
         SET xp = $1, level = $2, xp_to_next_level = $3, updated_at = NOW()
         WHERE id = $4`,
        [newXP, newLevel, xpToNextLevel, cardId]
      )

      await database.query('COMMIT')

      return NextResponse.json({
        success: true,
        xpGained,
        newXP,
        oldLevel,
        newLevel,
        leveledUp,
        xpToNextLevel,
        elixirSpent: ELIXIR_CONFIG.TRAIN_COST,
        newElixir: team.elixir - ELIXIR_CONFIG.TRAIN_COST
      })
    } catch (err) {
      await database.query('ROLLBACK')
      throw err
    }
  } catch (error) {
    console.error('Team train error:', error)
    return NextResponse.json(
      { error: 'Failed to train player' },
      { status: 500 }
    )
  }
}
