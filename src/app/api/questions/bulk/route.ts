import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database.server'

// POST /api/questions/bulk - Bulk import questions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questions, schoolId, userId } = body

    if (!questions || !Array.isArray(questions) || !schoolId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: questions (array), schoolId, userId'
        },
        { status: 400 }
      )
    }

    console.log(`📡 API: Bulk importing ${questions.length} questions`)

    const importedQuestions = await database.bulkImportQuestions(questions, schoolId, userId)

    console.log(`✅ API: Bulk import completed - ${importedQuestions.length} questions added`)

    return NextResponse.json({
      success: true,
      questions: importedQuestions,
      count: importedQuestions.length
    })
  } catch (error) {
    console.error('❌ API Error bulk importing questions:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bulk import questions'
      },
      { status: 500 }
    )
  }
}
