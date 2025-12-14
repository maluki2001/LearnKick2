// Leaderboard API - Global, school, and grade-based rankings
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { database } from '@/lib/database.server'
import { getLeagueByTrophies, formatLeagueName, LEAGUE_DISPLAY } from '@/constants/leagues'

export interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  trophies: number
  league: string
  leagueName: string
  leagueEmoji: string
  wins: number
  losses: number
  winRate: number
  winStreak: number
  school?: string
  grade?: number
  isCurrentUser: boolean
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const currentUserId = session?.user?.id

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'global' // global, school, grade
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const grade = searchParams.get('grade')
    const schoolId = searchParams.get('schoolId')

    let query = ''
    let params: (string | number)[] = []
    let paramIndex = 1

    // Base query
    const baseSelect = `
      SELECT
        u.id,
        u.full_name,
        u.trophies,
        u.league,
        u.wins,
        u.losses,
        u.win_streak,
        u.player_grade,
        s.name as school_name,
        ROW_NUMBER() OVER (ORDER BY u.trophies DESC, u.wins DESC) as rank
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      WHERE u.role = 'student'
        AND (u.wins > 0 OR u.losses > 0)
    `

    switch (type) {
      case 'school':
        // School leaderboard - only users from the specified school
        const targetSchoolId = schoolId || session?.user?.schoolId
        if (!targetSchoolId) {
          return NextResponse.json(
            { error: 'School ID required for school leaderboard' },
            { status: 400 }
          )
        }
        query = `
          ${baseSelect}
          AND u.school_id = $${paramIndex++}
          ORDER BY u.trophies DESC, u.wins DESC
          LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `
        params = [targetSchoolId, limit, offset]
        break

      case 'grade':
        // Grade leaderboard - only users in the specified grade
        const targetGrade = grade || session?.user?.playerGrade
        if (!targetGrade) {
          return NextResponse.json(
            { error: 'Grade required for grade leaderboard' },
            { status: 400 }
          )
        }
        query = `
          ${baseSelect}
          AND u.player_grade = $${paramIndex++}
          ORDER BY u.trophies DESC, u.wins DESC
          LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `
        params = [parseInt(targetGrade.toString()), limit, offset]
        break

      case 'global':
      default:
        // Global leaderboard - all students
        query = `
          ${baseSelect}
          ORDER BY u.trophies DESC, u.wins DESC
          LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `
        params = [limit, offset]
        break
    }

    const result = await database.query(query, params)

    // Get current user's rank if authenticated
    let currentUserRank: LeaderboardEntry | null = null
    if (currentUserId) {
      let userRankQuery = ''
      let userRankParams: (string | number)[] = [currentUserId]

      switch (type) {
        case 'school':
          userRankQuery = `
            WITH ranked AS (
              SELECT
                u.id,
                u.full_name,
                u.trophies,
                u.league,
                u.wins,
                u.losses,
                u.win_streak,
                u.player_grade,
                s.name as school_name,
                ROW_NUMBER() OVER (ORDER BY u.trophies DESC, u.wins DESC) as rank
              FROM users u
              LEFT JOIN schools s ON u.school_id = s.id
              WHERE u.role = 'student'
                AND u.school_id = $2
                AND (u.wins > 0 OR u.losses > 0)
            )
            SELECT * FROM ranked WHERE id = $1
          `
          userRankParams = [currentUserId, schoolId || session?.user?.schoolId || '']
          break

        case 'grade':
          userRankQuery = `
            WITH ranked AS (
              SELECT
                u.id,
                u.full_name,
                u.trophies,
                u.league,
                u.wins,
                u.losses,
                u.win_streak,
                u.player_grade,
                s.name as school_name,
                ROW_NUMBER() OVER (ORDER BY u.trophies DESC, u.wins DESC) as rank
              FROM users u
              LEFT JOIN schools s ON u.school_id = s.id
              WHERE u.role = 'student'
                AND u.player_grade = $2
                AND (u.wins > 0 OR u.losses > 0)
            )
            SELECT * FROM ranked WHERE id = $1
          `
          userRankParams = [currentUserId, parseInt((grade || session?.user?.playerGrade || 3).toString())]
          break

        default:
          userRankQuery = `
            WITH ranked AS (
              SELECT
                u.id,
                u.full_name,
                u.trophies,
                u.league,
                u.wins,
                u.losses,
                u.win_streak,
                u.player_grade,
                s.name as school_name,
                ROW_NUMBER() OVER (ORDER BY u.trophies DESC, u.wins DESC) as rank
              FROM users u
              LEFT JOIN schools s ON u.school_id = s.id
              WHERE u.role = 'student'
                AND (u.wins > 0 OR u.losses > 0)
            )
            SELECT * FROM ranked WHERE id = $1
          `
          break
      }

      const userRankResult = await database.query(userRankQuery, userRankParams)
      if (userRankResult.rows[0]) {
        const user = userRankResult.rows[0]
        const league = getLeagueByTrophies(user.trophies || 0)
        const leagueDisplay = LEAGUE_DISPLAY[league.id as keyof typeof LEAGUE_DISPLAY] || { emoji: '', label: '' }
        const totalGames = (user.wins || 0) + (user.losses || 0)

        currentUserRank = {
          rank: parseInt(user.rank),
          id: user.id,
          name: user.full_name,
          trophies: user.trophies || 0,
          league: league.id,
          leagueName: formatLeagueName(league),
          leagueEmoji: leagueDisplay.emoji,
          wins: user.wins || 0,
          losses: user.losses || 0,
          winRate: totalGames > 0 ? Math.round(((user.wins || 0) / totalGames) * 100) : 0,
          winStreak: user.win_streak || 0,
          school: user.school_name,
          grade: user.player_grade,
          isCurrentUser: true,
        }
      }
    }

    // Format leaderboard entries
    const leaderboard: LeaderboardEntry[] = result.rows.map(row => {
      const league = getLeagueByTrophies(row.trophies || 0)
      const leagueDisplay = LEAGUE_DISPLAY[league.id as keyof typeof LEAGUE_DISPLAY] || { emoji: '', label: '' }
      const totalGames = (row.wins || 0) + (row.losses || 0)

      return {
        rank: parseInt(row.rank),
        id: row.id,
        name: row.full_name,
        trophies: row.trophies || 0,
        league: league.id,
        leagueName: formatLeagueName(league),
        leagueEmoji: leagueDisplay.emoji,
        wins: row.wins || 0,
        losses: row.losses || 0,
        winRate: totalGames > 0 ? Math.round(((row.wins || 0) / totalGames) * 100) : 0,
        winStreak: row.win_streak || 0,
        school: row.school_name,
        grade: row.player_grade,
        isCurrentUser: row.id === currentUserId,
      }
    })

    // Get total count for pagination
    let countQuery = ''
    let countParams: (string | number)[] = []

    switch (type) {
      case 'school':
        countQuery = `
          SELECT COUNT(*) as total
          FROM users
          WHERE role = 'student'
            AND school_id = $1
            AND (wins > 0 OR losses > 0)
        `
        countParams = [schoolId || session?.user?.schoolId || '']
        break
      case 'grade':
        countQuery = `
          SELECT COUNT(*) as total
          FROM users
          WHERE role = 'student'
            AND player_grade = $1
            AND (wins > 0 OR losses > 0)
        `
        countParams = [parseInt((grade || session?.user?.playerGrade || 3).toString())]
        break
      default:
        countQuery = `
          SELECT COUNT(*) as total
          FROM users
          WHERE role = 'student'
            AND (wins > 0 OR losses > 0)
        `
        break
    }

    const countResult = await database.query(countQuery, countParams)
    const totalPlayers = parseInt(countResult.rows[0]?.total || '0')

    return NextResponse.json({
      success: true,
      type,
      leaderboard,
      currentUserRank,
      pagination: {
        total: totalPlayers,
        limit,
        offset,
        hasMore: offset + limit < totalPlayers,
      },
    })
  } catch (error) {
    console.error('Leaderboard GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
