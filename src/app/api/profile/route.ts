// Profile API - Get and update user profile with trophy/league info
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { database } from '@/lib/database.server'
import { getLeagueByTrophies, formatLeagueName } from '@/constants/leagues'
import { processMatchResult, calculateEloChange, MatchResult } from '@/lib/trophyService'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Check for userId query param (for viewing other profiles)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // If no userId provided, get current user's profile
    const targetUserId = userId || session?.user?.id

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user profile with stats
    const result = await database.query(
      `SELECT
        u.id,
        u.email,
        u.full_name,
        u.role,
        u.school_id,
        u.player_grade,
        u.trophies,
        u.highest_trophies,
        u.league,
        u.wins,
        u.losses,
        u.win_streak,
        u.elo,
        u.created_at,
        s.name as school_name,
        s.code as school_code
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      WHERE u.id = $1`,
      [targetUserId]
    )

    if (!result.rows[0]) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = result.rows[0]
    const league = getLeagueByTrophies(user.trophies || 0)

    // Get recent match history (last 10 matches)
    const matchHistory = await database.query(
      `SELECT
        m.id,
        m.player1_id,
        m.player2_id,
        m.winner_id,
        m.player1_goals,
        m.player2_goals,
        m.finished_at,
        CASE WHEN m.player1_id = $1 THEN p2.full_name ELSE p1.full_name END as opponent_name,
        CASE WHEN m.player1_id = $1 THEN p2.trophies ELSE p1.trophies END as opponent_trophies
      FROM multiplayer_matches m
      LEFT JOIN users p1 ON m.player1_id = p1.id
      LEFT JOIN users p2 ON m.player2_id = p2.id
      WHERE (m.player1_id = $1 OR m.player2_id = $1)
        AND m.status = 'finished'
      ORDER BY m.finished_at DESC
      LIMIT 10`,
      [targetUserId]
    )

    // Calculate win rate
    const totalGames = (user.wins || 0) + (user.losses || 0)
    const winRate = totalGames > 0 ? Math.round(((user.wins || 0) / totalGames) * 100) : 0

    // Determine if viewing own profile
    const isOwnProfile = session?.user?.id === targetUserId

    const profile = {
      id: user.id,
      name: user.full_name,
      email: isOwnProfile ? user.email : undefined, // Only show email for own profile
      role: user.role,
      grade: user.player_grade,
      school: user.school_name,
      schoolCode: user.school_code,

      // Trophy & League
      trophies: user.trophies || 0,
      highestTrophies: user.highest_trophies || 0,
      league: user.league || 'bronze-3',
      leagueInfo: {
        id: league.id,
        name: formatLeagueName(league),
        color: league.color,
        bgGradient: league.bgGradient,
        minTrophies: league.minTrophies,
        maxTrophies: league.maxTrophies,
      },

      // Stats
      wins: user.wins || 0,
      losses: user.losses || 0,
      winRate,
      winStreak: user.win_streak || 0,
      elo: user.elo || 1000,
      gamesPlayed: totalGames,

      // Match history
      recentMatches: matchHistory.rows.map(match => ({
        id: match.id,
        opponentName: match.opponent_name,
        opponentTrophies: match.opponent_trophies,
        won: match.winner_id === targetUserId,
        myGoals: match.player1_id === targetUserId ? match.player1_goals : match.player2_goals,
        opponentGoals: match.player1_id === targetUserId ? match.player2_goals : match.player1_goals,
        date: match.finished_at,
      })),

      // Metadata
      memberSince: user.created_at,
      isOwnProfile,
    }

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// Update profile (trophies after match, display name, etc.)
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
    const { action, matchResult, displayName, playerGrade } = body

    // Handle match result (trophy update)
    if (action === 'matchResult' && matchResult) {
      const { opponentId, won, opponentTrophies, myTrophies, myStreak } = matchResult

      // Calculate trophy changes
      const result: MatchResult = {
        winnerId: won ? session.user.id : opponentId,
        loserId: won ? opponentId : session.user.id,
        winnerTrophies: won ? myTrophies : opponentTrophies,
        loserTrophies: won ? opponentTrophies : myTrophies,
        winnerStreak: won ? myStreak : 0,
      }

      const trophyResults = processMatchResult(result)
      const myResult = won ? trophyResults.winner : trophyResults.loser

      // Get current user's elo from database
      const userResult = await database.query(
        `SELECT elo FROM users WHERE id = $1`,
        [session.user.id]
      )
      const currentElo = userResult.rows[0]?.elo || 1000

      // Calculate ELO change
      const eloChange = calculateEloChange(
        currentElo,
        opponentTrophies, // Use opponent's trophies as proxy for ELO
        won
      )

      // Update user's trophies, league, and stats
      await database.query(
        `UPDATE users SET
          trophies = GREATEST(0, trophies + $1),
          highest_trophies = GREATEST(highest_trophies, trophies + $1),
          league = $2,
          wins = wins + $3,
          losses = losses + $4,
          win_streak = $5,
          elo = elo + $6,
          updated_at = NOW()
        WHERE id = $7`,
        [
          myResult.change,
          myResult.newLeague.id,
          won ? 1 : 0,
          won ? 0 : 1,
          myResult.winStreak,
          eloChange,
          session.user.id
        ]
      )

      // Record trophy history
      await database.query(
        `INSERT INTO trophy_history (id, user_id, trophies_before, trophies_after, change_reason)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          crypto.randomUUID(),
          session.user.id,
          myResult.previousTrophies,
          myResult.newTrophies,
          won ? 'match_win' : 'match_loss'
        ]
      )

      return NextResponse.json({
        success: true,
        trophyResult: myResult,
        eloChange,
      })
    }

    // Handle display name update
    if (displayName !== undefined) {
      await database.query(
        'UPDATE users SET full_name = $1, updated_at = NOW() WHERE id = $2',
        [displayName, session.user.id]
      )
    }

    // Handle grade update
    if (playerGrade !== undefined) {
      await database.query(
        'UPDATE users SET player_grade = $1, updated_at = NOW() WHERE id = $2',
        [playerGrade, session.user.id]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
