// Player API - Device-based player profiles for anonymous/guest users
// This allows players to be identified by device ID without requiring login
import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database.server'

// GET /api/player?deviceId=xxx - Get player by device ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      )
    }

    // Check if player exists with this device ID
    const result = await database.query(
      `SELECT
        id,
        device_id,
        name,
        grade,
        elo,
        game_mode,
        total_games_played,
        total_correct_answers,
        total_incorrect_answers,
        best_streak,
        favorite_subject,
        last_played_at,
        total_wins,
        ui_language,
        question_language,
        preferred_arena,
        created_at,
        updated_at
      FROM player_profiles
      WHERE device_id = $1`,
      [deviceId]
    )

    if (!result.rows[0]) {
      return NextResponse.json({
        success: true,
        exists: false,
        player: null
      })
    }

    const player = result.rows[0]

    // Calculate accuracy
    const totalAnswers = (player.total_correct_answers || 0) + (player.total_incorrect_answers || 0)
    const accuracy = totalAnswers > 0
      ? Math.round((player.total_correct_answers / totalAnswers) * 100)
      : 0

    return NextResponse.json({
      success: true,
      exists: true,
      player: {
        id: player.id,
        deviceId: player.device_id,
        name: player.name,
        grade: player.grade,
        elo: player.elo,
        gameMode: player.game_mode,
        totalGamesPlayed: player.total_games_played,
        totalCorrectAnswers: player.total_correct_answers,
        totalIncorrectAnswers: player.total_incorrect_answers,
        bestStreak: player.best_streak,
        favoriteSubject: player.favorite_subject,
        lastPlayedAt: player.last_played_at,
        totalWins: player.total_wins,
        accuracy,
        uiLanguage: player.ui_language,
        questionLanguage: player.question_language,
        preferredArena: player.preferred_arena,
        createdAt: player.created_at,
        updatedAt: player.updated_at
      }
    })
  } catch (error) {
    console.error('Player GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    )
  }
}

// POST /api/player - Create a new player profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      deviceId,
      name,
      grade,
      gameMode,
      uiLanguage = 'de',
      questionLanguage = 'de',
      preferredArena = 'soccer'
    } = body

    if (!deviceId || !name || !grade) {
      return NextResponse.json(
        { error: 'Device ID, name, and grade are required' },
        { status: 400 }
      )
    }

    // Check if player already exists with this device ID
    const existing = await database.query(
      'SELECT id FROM player_profiles WHERE device_id = $1',
      [deviceId]
    )

    if (existing.rows[0]) {
      // Update existing player
      const result = await database.query(
        `UPDATE player_profiles SET
          name = $1,
          grade = $2,
          game_mode = $3,
          ui_language = $4,
          question_language = $5,
          preferred_arena = $6,
          updated_at = NOW()
        WHERE device_id = $7
        RETURNING *`,
        [name, grade, gameMode, uiLanguage, questionLanguage, preferredArena, deviceId]
      )

      const player = result.rows[0]
      return NextResponse.json({
        success: true,
        created: false,
        player: formatPlayer(player)
      })
    }

    // Calculate starting ELO based on grade
    const baseElo = 800 + (grade * 200)

    // Create new player
    const result = await database.query(
      `INSERT INTO player_profiles (
        id,
        device_id,
        name,
        grade,
        elo,
        game_mode,
        ui_language,
        question_language,
        preferred_arena,
        total_games_played,
        total_correct_answers,
        total_incorrect_answers,
        best_streak,
        favorite_subject,
        total_wins,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        $1, $2, $3, $4, $5, $6, $7, $8,
        0, 0, 0, 0, 'math', 0, NOW(), NOW()
      )
      RETURNING *`,
      [deviceId, name, grade, baseElo, gameMode, uiLanguage, questionLanguage, preferredArena]
    )

    const player = result.rows[0]
    console.log('✅ Created new player profile:', player.name, 'deviceId:', deviceId.substring(0, 8) + '...')

    return NextResponse.json({
      success: true,
      created: true,
      player: formatPlayer(player)
    })
  } catch (error) {
    console.error('Player POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    )
  }
}

// PATCH /api/player - Update player profile or record game result
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, action, ...updates } = body

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      )
    }

    // Handle game result recording
    if (action === 'recordGame') {
      const { won, correctAnswers, totalQuestions, streak, subject, eloChange } = updates

      await database.query(
        `UPDATE player_profiles SET
          total_games_played = total_games_played + 1,
          total_correct_answers = total_correct_answers + $1,
          total_incorrect_answers = total_incorrect_answers + $2,
          best_streak = GREATEST(best_streak, $3),
          elo = GREATEST(100, elo + $4),
          total_wins = total_wins + $5,
          favorite_subject = COALESCE($6, favorite_subject),
          last_played_at = NOW(),
          updated_at = NOW()
        WHERE device_id = $7`,
        [
          correctAnswers,
          totalQuestions - correctAnswers,
          streak,
          eloChange || 0,
          won ? 1 : 0,
          subject,
          deviceId
        ]
      )

      return NextResponse.json({ success: true })
    }

    // Handle preference updates
    const { name, grade, uiLanguage, questionLanguage, preferredArena, gameMode } = updates

    const setClauses: string[] = []
    const values: (string | number)[] = []
    let paramIndex = 1

    if (name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`)
      values.push(name)
    }
    if (grade !== undefined) {
      setClauses.push(`grade = $${paramIndex++}`)
      values.push(grade)
    }
    if (uiLanguage !== undefined) {
      setClauses.push(`ui_language = $${paramIndex++}`)
      values.push(uiLanguage)
    }
    if (questionLanguage !== undefined) {
      setClauses.push(`question_language = $${paramIndex++}`)
      values.push(questionLanguage)
    }
    if (preferredArena !== undefined) {
      setClauses.push(`preferred_arena = $${paramIndex++}`)
      values.push(preferredArena)
    }
    if (gameMode !== undefined) {
      setClauses.push(`game_mode = $${paramIndex++}`)
      values.push(gameMode)
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ success: true, message: 'No updates provided' })
    }

    setClauses.push(`updated_at = NOW()`)
    values.push(deviceId)

    await database.query(
      `UPDATE player_profiles SET ${setClauses.join(', ')} WHERE device_id = $${paramIndex}`,
      values
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Player PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update player' },
      { status: 500 }
    )
  }
}

// Helper to format player response
function formatPlayer(player: Record<string, unknown>) {
  const totalAnswers = ((player.total_correct_answers as number) || 0) + ((player.total_incorrect_answers as number) || 0)
  const accuracy = totalAnswers > 0
    ? Math.round(((player.total_correct_answers as number) / totalAnswers) * 100)
    : 0

  return {
    id: player.id,
    deviceId: player.device_id,
    name: player.name,
    grade: player.grade,
    elo: player.elo,
    gameMode: player.game_mode,
    totalGamesPlayed: player.total_games_played,
    totalCorrectAnswers: player.total_correct_answers,
    totalIncorrectAnswers: player.total_incorrect_answers,
    bestStreak: player.best_streak,
    favoriteSubject: player.favorite_subject,
    lastPlayedAt: player.last_played_at,
    totalWins: player.total_wins,
    accuracy,
    uiLanguage: player.ui_language,
    questionLanguage: player.question_language,
    preferredArena: player.preferred_arena,
    createdAt: player.created_at,
    updatedAt: player.updated_at
  }
}
