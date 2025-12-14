// Game End API - Record match results and update trophies
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { database } from '@/lib/database.server'
import { processMatchResult, calculateEloChange } from '@/lib/trophyService'

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
    const {
      matchId,
      winnerId,
      isDraw,
      player1Goals,
      player2Goals,
      player1Score,
      player2Score,
      player1Correct,
      player2Correct,
      // duration - reserved for future match duration tracking
    } = body

    if (!matchId) {
      return NextResponse.json(
        { error: 'Missing matchId' },
        { status: 400 }
      )
    }

    // Get match info
    const matchResult = await database.query(
      `SELECT m.*,
              p1.trophies as p1_trophies, p1.elo as p1_elo, p1.win_streak as p1_streak,
              p2.trophies as p2_trophies, p2.elo as p2_elo, p2.win_streak as p2_streak
       FROM multiplayer_matches m
       JOIN users p1 ON m.player1_id = p1.id
       JOIN users p2 ON m.player2_id = p2.id
       WHERE m.id = $1`,
      [matchId]
    )

    if (!matchResult.rows[0]) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    const match = matchResult.rows[0]

    // Check if match is already finished
    if (match.status === 'finished') {
      return NextResponse.json(
        { error: 'Match already finished', result: match },
        { status: 400 }
      )
    }

    // Calculate trophy changes
    const trophyResult = processMatchResult({
      winnerId: winnerId || match.player1_id,
      loserId: winnerId === match.player1_id ? match.player2_id : match.player1_id,
      winnerTrophies: winnerId === match.player1_id ? match.p1_trophies : match.p2_trophies,
      loserTrophies: winnerId === match.player1_id ? match.p2_trophies : match.p1_trophies,
      winnerStreak: winnerId === match.player1_id ? match.p1_streak : match.p2_streak,
      isDraw,
    })

    // Calculate ELO changes
    const p1EloChange = calculateEloChange(
      match.p1_elo || 1000,
      match.p2_elo || 1000,
      winnerId === match.player1_id
    )
    const p2EloChange = calculateEloChange(
      match.p2_elo || 1000,
      match.p1_elo || 1000,
      winnerId === match.player2_id
    )

    // Update match record
    await database.query(
      `UPDATE multiplayer_matches
       SET status = 'finished',
           winner_id = $2,
           player1_goals = $3,
           player2_goals = $4,
           player1_score = $5,
           player2_score = $6,
           finished_at = NOW()
       WHERE id = $1`,
      [matchId, winnerId, player1Goals, player2Goals, player1Score, player2Score]
    )

    // Update player 1 stats
    const p1TrophyChange = winnerId === match.player1_id
      ? trophyResult.winner.change
      : trophyResult.loser.change
    const p1League = winnerId === match.player1_id
      ? trophyResult.winner.newLeague.id
      : trophyResult.loser.newLeague.id
    const p1WinStreak = winnerId === match.player1_id
      ? trophyResult.winner.winStreak
      : 0

    await database.query(
      `UPDATE users SET
        trophies = GREATEST(0, trophies + $1),
        highest_trophies = GREATEST(highest_trophies, GREATEST(0, trophies + $1)),
        league = $2,
        wins = wins + $3,
        losses = losses + $4,
        win_streak = $5,
        elo = elo + $6,
        updated_at = NOW()
      WHERE id = $7`,
      [
        p1TrophyChange,
        p1League,
        winnerId === match.player1_id ? 1 : 0,
        winnerId === match.player1_id ? 0 : 1,
        p1WinStreak,
        p1EloChange,
        match.player1_id,
      ]
    )

    // Update player 2 stats
    const p2TrophyChange = winnerId === match.player2_id
      ? trophyResult.winner.change
      : trophyResult.loser.change
    const p2League = winnerId === match.player2_id
      ? trophyResult.winner.newLeague.id
      : trophyResult.loser.newLeague.id
    const p2WinStreak = winnerId === match.player2_id
      ? trophyResult.winner.winStreak
      : 0

    await database.query(
      `UPDATE users SET
        trophies = GREATEST(0, trophies + $1),
        highest_trophies = GREATEST(highest_trophies, GREATEST(0, trophies + $1)),
        league = $2,
        wins = wins + $3,
        losses = losses + $4,
        win_streak = $5,
        elo = elo + $6,
        updated_at = NOW()
      WHERE id = $7`,
      [
        p2TrophyChange,
        p2League,
        winnerId === match.player2_id ? 1 : 0,
        winnerId === match.player2_id ? 0 : 1,
        p2WinStreak,
        p2EloChange,
        match.player2_id,
      ]
    )

    // Record trophy history for both players
    await database.query(
      `INSERT INTO trophy_history (id, user_id, trophies_before, trophies_after, change_reason, match_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        crypto.randomUUID(),
        match.player1_id,
        match.p1_trophies,
        match.p1_trophies + p1TrophyChange,
        winnerId === match.player1_id ? 'match_win' : 'match_loss',
        matchId,
      ]
    )

    await database.query(
      `INSERT INTO trophy_history (id, user_id, trophies_before, trophies_after, change_reason, match_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        crypto.randomUUID(),
        match.player2_id,
        match.p2_trophies,
        match.p2_trophies + p2TrophyChange,
        winnerId === match.player2_id ? 'match_win' : 'match_loss',
        matchId,
      ]
    )

    return NextResponse.json({
      success: true,
      matchId,
      winnerId,
      isDraw,
      results: {
        player1: {
          id: match.player1_id,
          goals: player1Goals,
          score: player1Score,
          correct: player1Correct,
          trophyChange: p1TrophyChange,
          newTrophies: match.p1_trophies + p1TrophyChange,
          newLeague: p1League,
          eloChange: p1EloChange,
        },
        player2: {
          id: match.player2_id,
          goals: player2Goals,
          score: player2Score,
          correct: player2Correct,
          trophyChange: p2TrophyChange,
          newTrophies: match.p2_trophies + p2TrophyChange,
          newLeague: p2League,
          eloChange: p2EloChange,
        },
      },
    })
  } catch (error) {
    console.error('Game end error:', error)
    return NextResponse.json(
      { error: 'Failed to end game' },
      { status: 500 }
    )
  }
}
