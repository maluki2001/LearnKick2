import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database.server'

// Default subjects to return if table doesn't exist
const defaultSubjects = [
  { id: 'subject-0', name: 'General Knowledge', slug: 'general-knowledge', icon: '🧠', color: '#6366f1', description: 'General knowledge and trivia questions', school_id: null, is_active: true },
  { id: 'subject-1', name: 'Mathematics', slug: 'math', icon: '🔢', color: '#10b981', description: 'Math, algebra, geometry, and arithmetic', school_id: null, is_active: true },
  { id: 'subject-2', name: 'Geography', slug: 'geography', icon: '🌍', color: '#f59e0b', description: 'World geography, countries, and landmarks', school_id: null, is_active: true },
  { id: 'subject-3', name: 'Language', slug: 'language', icon: '📖', color: '#ec4899', description: 'Language arts, grammar, and vocabulary', school_id: null, is_active: true },
  { id: 'subject-4', name: 'Science', slug: 'science', icon: '🔬', color: '#06b6d4', description: 'Biology, chemistry, physics, and general science', school_id: null, is_active: true },
  { id: 'subject-5', name: 'History', slug: 'history', icon: '📜', color: '#8b5cf6', description: 'World history, events, and civilizations', school_id: null, is_active: true },
  { id: 'subject-6', name: 'Art', slug: 'art', icon: '🎨', color: '#f97316', description: 'Visual arts, music, and creative subjects', school_id: null, is_active: true }
]

// GET /api/subjects - Get all subjects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('school_id')

    const subjects = await database.getSubjects(schoolId)

    return NextResponse.json({
      success: true,
      subjects
    })
  } catch (error) {
    // If subjects table doesn't exist, return default subjects
    const isTableMissing = error instanceof Error && error.message.includes('does not exist')
    if (isTableMissing) {
      console.warn('Subjects table not found, returning default subjects')
      return NextResponse.json({
        success: true,
        subjects: defaultSubjects
      })
    }

    console.error('Error fetching subjects:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}

// POST /api/subjects - Create a new subject
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, icon, color, description, school_id } = body

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const subject = await database.createSubject({
      name,
      slug,
      icon,
      color,
      description,
      school_id
    })

    return NextResponse.json({
      success: true,
      subject
    })
  } catch (error) {
    console.error('Error creating subject:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create subject' },
      { status: 500 }
    )
  }
}

// PUT /api/subjects - Update a subject
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Subject ID is required' },
        { status: 400 }
      )
    }

    const subject = await database.updateSubject(id, updates)

    return NextResponse.json({
      success: true,
      subject
    })
  } catch (error) {
    console.error('Error updating subject:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update subject' },
      { status: 500 }
    )
  }
}

// DELETE /api/subjects - Delete a subject
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Subject ID is required' },
        { status: 400 }
      )
    }

    await database.deleteSubject(id)

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error deleting subject:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete subject' },
      { status: 500 }
    )
  }
}
