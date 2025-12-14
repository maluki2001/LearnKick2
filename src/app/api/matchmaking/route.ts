// Matchmaking API - Join/leave queue and check status
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { database } from '@/lib/database.server'
import {
  findBestMatch,
  generateMatchId,
  formatQueueStatus,
  estimateWaitTime,
  getMatchQuality,
  QueuedPlayer,
  DEFAULT_CONFIG,
} from '@/lib/matchmaking'

// GET - Check queue status and find matches
export async function GET(_request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if player is in queue
    const queueResult = await database.query(
      `SELECT * FROM matchmaking_queue WHERE user_id = $1`,
      [session.user.id]
    )

    if (!queueResult.rows[0]) {
      return NextResponse.json({
        success: true,
        inQueue: false,
        status: 'not_in_queue',
      })
    }

    const playerRow = queueResult.rows[0]

    // Check if already matched
    if (playerRow.status === 'matched' && playerRow.match_id) {
      // Get match details
      const matchResult = await database.query(
        `SELECT m.*,
          p1.full_name as player1_name, p1.trophies as player1_trophies, p1.league as player1_league,
          p2.full_name as player2_name, p2.trophies as player2_trophies, p2.league as player2_league
        FROM multiplayer_matches m
        LEFT JOIN users p1 ON m.player1_id = p1.id
        LEFT JOIN users p2 ON m.player2_id = p2.id
        WHERE m.id = $1`,
        [playerRow.match_id]
      )

      if (matchResult.rows[0]) {
        const match = matchResult.rows[0]
        const isPlayer1 = match.player1_id === session.user.id
        const opponent = isPlayer1
          ? { id: match.player2_id, name: match.player2_name, trophies: match.player2_trophies, league: match.player2_league }
          : { id: match.player1_id, name: match.player1_name, trophies: match.player1_trophies, league: match.player1_league }

        return NextResponse.json({
          success: true,
          inQueue: true,
          status: 'matched',
          matchId: playerRow.match_id,
          opponent,
          matchStatus: match.status,
        })
      }
    }

    // Still waiting - check for potential matches
    const allQueueResult = await database.query(
      `SELECT q.*, u.full_name as name
       FROM matchmaking_queue q
       JOIN users u ON q.user_id = u.id
       WHERE q.status = 'waiting'`
    )

    // Convert to QueuedPlayer format
    const queue: QueuedPlayer[] = allQueueResult.rows.map(row => ({
      id: row.user_id,
      name: row.name,
      trophies: row.trophies,
      elo: row.elo,
      grade: row.player_grade,
      schoolId: row.school_id,
      language: row.language || 'en',
      joinedAt: new Date(row.joined_at),
      status: row.status,
    }))

    const currentPlayer: QueuedPlayer = {
      id: session.user.id,
      name: session.user.name || 'Player',
      trophies: playerRow.trophies,
      elo: playerRow.elo,
      grade: playerRow.player_grade,
      schoolId: playerRow.school_id,
      language: playerRow.language || 'en',
      joinedAt: new Date(playerRow.joined_at),
      status: 'waiting',
    }

    // Try to find a match
    const matchResult = findBestMatch(currentPlayer, queue, DEFAULT_CONFIG)

    if (matchResult.match) {
      // Create the match
      const matchId = generateMatchId()
      const quality = getMatchQuality(currentPlayer, matchResult.match)

      // Create match record
      await database.query(
        `INSERT INTO multiplayer_matches (id, player1_id, player2_id, status, match_quality)
         VALUES ($1, $2, $3, 'pending', $4)`,
        [matchId, session.user.id, matchResult.match.id, quality]
      )

      // Update both players' queue status
      await database.query(
        `UPDATE matchmaking_queue
         SET status = 'matched', match_id = $1
         WHERE user_id IN ($2, $3)`,
        [matchId, session.user.id, matchResult.match.id]
      )

      return NextResponse.json({
        success: true,
        inQueue: true,
        status: 'matched',
        matchId,
        opponent: {
          id: matchResult.match.id,
          name: matchResult.match.name,
          trophies: matchResult.match.trophies,
        },
        matchQuality: quality,
      })
    }

    // Still waiting
    const waitTimeSeconds = Math.floor((Date.now() - new Date(playerRow.joined_at).getTime()) / 1000)
    const estimate = estimateWaitTime(currentPlayer, queue.length)

    return NextResponse.json({
      success: true,
      inQueue: true,
      status: 'waiting',
      waitTime: waitTimeSeconds,
      queuePosition: queue.findIndex(p => p.id === session.user.id) + 1,
      playersInQueue: queue.length,
      statusMessage: formatQueueStatus(waitTimeSeconds),
      estimatedWait: estimate,
    })
  } catch (error) {
    console.error('Matchmaking GET error:', error)
    return NextResponse.json(
      { error: 'Failed to check matchmaking status' },
      { status: 500 }
    )
  }
}

// POST - Join the matchmaking queue
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
    const { language = 'en' } = body

    // Get user details
    const userResult = await database.query(
      `SELECT id, full_name, trophies, elo, player_grade, school_id
       FROM users WHERE id = $1`,
      [session.user.id]
    )

    if (!userResult.rows[0]) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = userResult.rows[0]

    // Check if already in queue
    const existingQueue = await database.query(
      `SELECT * FROM matchmaking_queue WHERE user_id = $1`,
      [session.user.id]
    )

    if (existingQueue.rows[0]) {
      // Already in queue - return current status
      return NextResponse.json({
        success: true,
        message: 'Already in queue',
        joinedAt: existingQueue.rows[0].joined_at,
      })
    }

    // Check for active matches
    const activeMatch = await database.query(
      `SELECT * FROM multiplayer_matches
       WHERE (player1_id = $1 OR player2_id = $1)
       AND status IN ('pending', 'countdown', 'active')`,
      [session.user.id]
    )

    if (activeMatch.rows[0]) {
      return NextResponse.json(
        { error: 'You have an active match', matchId: activeMatch.rows[0].id },
        { status: 400 }
      )
    }

    // Add to queue
    await database.query(
      `INSERT INTO matchmaking_queue (id, user_id, player_grade, school_id, trophies, elo, language, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'waiting')`,
      [
        crypto.randomUUID(),
        session.user.id,
        user.player_grade || 3,
        user.school_id,
        user.trophies || 0,
        user.elo || 1000,
        language,
      ]
    )

    // Get queue stats
    const queueStats = await database.query(
      `SELECT COUNT(*) as count FROM matchmaking_queue WHERE status = 'waiting'`
    )

    return NextResponse.json({
      success: true,
      message: 'Joined matchmaking queue',
      joinedAt: new Date().toISOString(),
      playersInQueue: parseInt(queueStats.rows[0].count),
    })
  } catch (error) {
    console.error('Matchmaking POST error:', error)
    return NextResponse.json(
      { error: 'Failed to join matchmaking queue' },
      { status: 500 }
    )
  }
}

// DELETE - Leave the matchmaking queue
export async function DELETE(_request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Remove from queue
    const result = await database.query(
      `DELETE FROM matchmaking_queue WHERE user_id = $1 RETURNING *`,
      [session.user.id]
    )

    if (!result.rows[0]) {
      return NextResponse.json({
        success: true,
        message: 'Not in queue',
      })
    }

    // If matched, also need to handle the match
    if (result.rows[0].status === 'matched' && result.rows[0].match_id) {
      // Update match status to cancelled
      await database.query(
        `UPDATE multiplayer_matches
         SET status = 'cancelled', finished_at = NOW()
         WHERE id = $1 AND status IN ('pending', 'countdown')`,
        [result.rows[0].match_id]
      )

      // Remove other player from queue too
      await database.query(
        `DELETE FROM matchmaking_queue WHERE match_id = $1`,
        [result.rows[0].match_id]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Left matchmaking queue',
    })
  } catch (error) {
    console.error('Matchmaking DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to leave matchmaking queue' },
      { status: 500 }
    )
  }
}
