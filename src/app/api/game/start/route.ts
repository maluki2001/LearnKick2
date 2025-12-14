// Game Start API - Initialize a multiplayer match with questions
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { database } from '@/lib/database.server'
import { GAME_CONFIG } from '@/lib/multiplayerGameEngine'

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
    const { matchId, player1Id, player2Id, language = 'en', grade = 3 } = body

    if (!matchId || !player1Id || !player2Id) {
      return NextResponse.json(
        { error: 'Missing required fields: matchId, player1Id, player2Id' },
        { status: 400 }
      )
    }

    // Verify the match exists and is in pending status
    const matchResult = await database.query(
      `SELECT * FROM multiplayer_matches WHERE id = $1 AND status IN ('pending', 'countdown')`,
      [matchId]
    )

    if (!matchResult.rows[0]) {
      return NextResponse.json(
        { error: 'Match not found or already started' },
        { status: 404 }
      )
    }

    // Get player info
    const playersResult = await database.query(
      `SELECT id, full_name, trophies, league, player_grade, school_id
       FROM users WHERE id IN ($1, $2)`,
      [player1Id, player2Id]
    )

    if (playersResult.rows.length !== 2) {
      return NextResponse.json(
        { error: 'One or both players not found' },
        { status: 404 }
      )
    }

    const player1 = playersResult.rows.find(p => p.id === player1Id)
    const player2 = playersResult.rows.find(p => p.id === player2Id)

    // Get questions for the game
    // Average grade between players, prioritize common ground
    const avgGrade = Math.round(((player1?.player_grade || grade) + (player2?.player_grade || grade)) / 2)

    const questionsResult = await database.query(
      `SELECT id, question, options, correct_answer as "correctAnswer",
              explanation, difficulty, subject, grade, language
       FROM questions
       WHERE grade <= $1 + 1 AND grade >= $1 - 1
         AND language = $2
         AND is_active = true
       ORDER BY RANDOM()
       LIMIT $3`,
      [avgGrade, language, GAME_CONFIG.MAX_QUESTIONS]
    )

    if (questionsResult.rows.length < GAME_CONFIG.MIN_QUESTIONS) {
      // Fallback: get any questions for this language
      const fallbackResult = await database.query(
        `SELECT id, question, options, correct_answer as "correctAnswer",
                explanation, difficulty, subject, grade, language
         FROM questions
         WHERE language = $1
           AND is_active = true
         ORDER BY RANDOM()
         LIMIT $2`,
        [language, GAME_CONFIG.MAX_QUESTIONS]
      )

      if (fallbackResult.rows.length < GAME_CONFIG.MIN_QUESTIONS) {
        return NextResponse.json(
          { error: 'Not enough questions available' },
          { status: 500 }
        )
      }

      questionsResult.rows = fallbackResult.rows
    }

    // Format questions
    const questions = questionsResult.rows.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty || 2,
      subject: q.subject,
      grade: q.grade,
      language: q.language,
      type: 'multiple-choice' as const,
    }))

    // Update match status to active
    await database.query(
      `UPDATE multiplayer_matches
       SET status = 'active',
           started_at = NOW(),
           questions = $2
       WHERE id = $1`,
      [matchId, JSON.stringify(questions)]
    )

    // Clean up matchmaking queue entries
    await database.query(
      `DELETE FROM matchmaking_queue WHERE user_id IN ($1, $2)`,
      [player1Id, player2Id]
    )

    // Return game initialization data
    return NextResponse.json({
      success: true,
      matchId,
      players: {
        player1: {
          id: player1.id,
          name: player1.full_name,
          trophies: player1.trophies || 0,
          league: player1.league || 'bronze-3',
          grade: player1.player_grade || grade,
          schoolId: player1.school_id,
        },
        player2: {
          id: player2.id,
          name: player2.full_name,
          trophies: player2.trophies || 0,
          league: player2.league || 'bronze-3',
          grade: player2.player_grade || grade,
          schoolId: player2.school_id,
        },
      },
      questions: questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        subject: q.subject,
      })), // Don't send correct answers to client
      config: {
        gameDuration: GAME_CONFIG.GAME_DURATION,
        questionTime: GAME_CONFIG.QUESTION_TIME,
        goalsToScore: GAME_CONFIG.GOALS_TO_SCORE,
      },
    })
  } catch (error) {
    console.error('Game start error:', error)
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    )
  }
}
