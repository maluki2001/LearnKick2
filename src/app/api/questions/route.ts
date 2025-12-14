import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database.server'

// GET /api/questions - Fetch questions with filters
// Supports both school-specific questions and global questions (isGlobal=true)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const schoolId = searchParams.get('schoolId')
    const isGlobal = searchParams.get('isGlobal') === 'true'
    const subject = searchParams.get('subject')
    const grade = searchParams.get('grade')
    const language = searchParams.get('language')

    console.log('📡 API: Fetching questions with filters:', {
      schoolId,
      isGlobal,
      subject,
      grade,
      language
    })

    const filters: {
      subject?: string
      grade?: number
      language?: string
      isGlobal?: boolean
    } = {}

    if (subject && subject !== 'all') filters.subject = subject
    if (grade && grade !== 'all') filters.grade = parseInt(grade)
    if (language && language !== 'all') filters.language = language
    if (isGlobal) filters.isGlobal = true

    const questions = await database.getQuestions(schoolId, filters)

    console.log(`✅ API: Found ${questions.length} questions`)

    return NextResponse.json({
      success: true,
      questions,
      count: questions.length
    })
  } catch (error) {
    console.error('❌ API Error fetching questions:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch questions'
      },
      { status: 500 }
    )
  }
}

// POST /api/questions - Add a new question
// Supports global questions when isGlobal=true (schoolId and userId can be null)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, schoolId, userId, isGlobal } = body

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: question' },
        { status: 400 }
      )
    }

    // For non-global questions, require userId and schoolId
    if (!isGlobal) {
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'Missing required field: userId' },
          { status: 400 }
        )
      }
      if (!schoolId) {
        return NextResponse.json(
          { success: false, error: 'Missing required field: schoolId (or set isGlobal=true)' },
          { status: 400 }
        )
      }
    }

    // For global questions, both schoolId and userId can be null
    const effectiveSchoolId = isGlobal ? null : schoolId
    const effectiveUserId = isGlobal ? (userId || null) : userId

    console.log('📡 API: Adding question:', question.id || '(new)', isGlobal ? '(GLOBAL)' : `(school: ${schoolId})`)

    const newQuestion = await database.addQuestion(question, effectiveSchoolId, effectiveUserId)

    console.log('✅ API: Question added successfully')

    return NextResponse.json({
      success: true,
      question: newQuestion
    })
  } catch (error) {
    console.error('❌ API Error adding question:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add question'
      },
      { status: 500 }
    )
  }
}

// PUT /api/questions - Update a question
// Supports global questions when isGlobal=true
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionId, updates, schoolId, isGlobal } = body

    if (!questionId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: questionId, updates' },
        { status: 400 }
      )
    }

    // For global questions, schoolId can be null
    if (!isGlobal && !schoolId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: schoolId (or set isGlobal=true)' },
        { status: 400 }
      )
    }

    const effectiveSchoolId = isGlobal ? null : schoolId

    console.log('📡 API: Updating question:', questionId, isGlobal ? '(GLOBAL)' : `(school: ${schoolId})`)

    const updatedQuestion = await database.updateQuestion(questionId, updates, effectiveSchoolId)

    console.log('✅ API: Question updated successfully')

    return NextResponse.json({
      success: true,
      question: updatedQuestion
    })
  } catch (error) {
    console.error('❌ API Error updating question:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update question'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/questions - Delete a question
// Supports global questions when isGlobal=true
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')
    const schoolId = searchParams.get('schoolId')
    const isGlobal = searchParams.get('isGlobal') === 'true'

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: questionId' },
        { status: 400 }
      )
    }

    // For global questions, schoolId can be null
    if (!isGlobal && !schoolId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: schoolId (or set isGlobal=true)' },
        { status: 400 }
      )
    }

    const effectiveSchoolId = isGlobal ? null : schoolId

    console.log('📡 API: Deleting question:', questionId, isGlobal ? '(GLOBAL)' : `(school: ${schoolId})`)

    await database.deleteQuestion(questionId, effectiveSchoolId)

    console.log('✅ API: Question deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully'
    })
  } catch (error) {
    console.error('❌ API Error deleting question:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete question'
      },
      { status: 500 }
    )
  }
}
