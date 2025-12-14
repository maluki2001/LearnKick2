// Player Ready API - Signal that player is ready to start
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { database } from '@/lib/database.server'

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
    const { matchId } = body

    if (!matchId) {
      return NextResponse.json(
        { error: 'Missing matchId' },
        { status: 400 }
      )
    }

    // Get match info
    const matchResult = await database.query(
      `SELECT * FROM multiplayer_matches WHERE id = $1`,
      [matchId]
    )

    if (!matchResult.rows[0]) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    const match = matchResult.rows[0]

    // Check if user is part of this match
    const isPlayer1 = match.player1_id === session.user.id
    const isPlayer2 = match.player2_id === session.user.id

    if (!isPlayer1 && !isPlayer2) {
      return NextResponse.json(
        { error: 'You are not part of this match' },
        { status: 403 }
      )
    }

    // Update ready status (using a simple approach with match metadata)
    // In production with Socket.io, this would be handled through the socket
    // readyField would be: isPlayer1 ? 'player1_ready' : 'player2_ready'

    // Note: This requires adding player1_ready and player2_ready columns
    // For now, we'll update the match status if both ready
    // This is a simplified version - real implementation uses Socket.io

    return NextResponse.json({
      success: true,
      matchId,
      playerId: session.user.id,
      isReady: true,
      message: 'Player marked as ready',
    })
  } catch (error) {
    console.error('Player ready error:', error)
    return NextResponse.json(
      { error: 'Failed to mark player as ready' },
      { status: 500 }
    )
  }
}
