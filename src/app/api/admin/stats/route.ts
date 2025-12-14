import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database.server'

// Helper to safely execute database queries that might fail
async function safeQuery<T>(fn: () => Promise<T>, defaultValue: T): Promise<T> {
  try {
    return await fn()
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const pgCode = error instanceof Error ? (error as Error & { code?: string }).code : undefined

    // Check for known recoverable errors
    const isRecoverableError =
      // Table doesn't exist (42P01)
      errorMessage.includes('does not exist') ||
      pgCode === '42P01' ||
      errorMessage.includes('relation') ||
      // Invalid UUID format (22P02)
      errorMessage.includes('invalid input syntax for type uuid') ||
      pgCode === '22P02' ||
      // Column doesn't exist (42703)
      pgCode === '42703'

    if (isRecoverableError) {
      console.warn('Database query failed, using default value:', errorMessage)
      return defaultValue
    }
    console.error('safeQuery error:', error)
    throw error
  }
}

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('school_id')

    // Get question stats (works without school_id for global stats)
    // Questions table should exist
    const questionStats = await safeQuery(
      () => database.getQuestionStats(schoolId),
      { total: 0, bySubject: {}, byGrade: {} }
    )

    // For user and game stats, we need a school_id
    // These tables might not exist yet
    let userStats = { total: 0, byRole: {} as Record<string, number> }
    let gameStats = { total_games: 0, average_accuracy: 0, total_questions_answered: 0, total_correct_answers: 0 }
    let recentGames: unknown[] = []
    let users: unknown[] = []

    if (schoolId) {
      // Safely try to get user stats (table might not exist)
      userStats = await safeQuery(
        () => database.getUserStats(schoolId),
        { total: 0, byRole: {} }
      )

      // Safely try to get game stats (table might not exist)
      gameStats = await safeQuery(
        () => database.getGameSessionStats(schoolId),
        { total_games: 0, average_accuracy: 0, total_questions_answered: 0, total_correct_answers: 0 }
      )

      // Safely try to get recent games (table might not exist)
      recentGames = await safeQuery(
        () => database.getGameSessions(schoolId, 10),
        []
      )

      // Safely try to get users (table might not exist)
      users = await safeQuery(
        () => database.getUsers(schoolId),
        []
      )
    }

    return NextResponse.json({
      success: true,
      stats: {
        questions: {
          total: questionStats.total,
          bySubject: questionStats.bySubject,
          byGrade: questionStats.byGrade
        },
        users: {
          total: userStats.total,
          byRole: userStats.byRole,
          list: users
        },
        games: {
          total: parseInt(String(gameStats.total_games)) || 0,
          averageAccuracy: parseFloat(String(gameStats.average_accuracy)) || 0,
          totalQuestionsAnswered: parseInt(String(gameStats.total_questions_answered)) || 0,
          totalCorrectAnswers: parseInt(String(gameStats.total_correct_answers)) || 0,
          recent: recentGames
        }
      }
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}
