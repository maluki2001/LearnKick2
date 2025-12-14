import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database.server'

// GET /api/schools - Get school by ID or code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const code = searchParams.get('code')

    let school = null

    if (id) {
      school = await database.getSchool(id)
    } else if (code) {
      school = await database.getSchoolByCode(code)
    } else {
      return NextResponse.json(
        { success: false, error: 'School ID or code is required' },
        { status: 400 }
      )
    }

    if (!school) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      school
    })
  } catch (error) {
    console.error('Error fetching school:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch school' },
      { status: 500 }
    )
  }
}

// POST /api/schools - Create a new school
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, code, admin_user_id, subscription_plan } = body

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'Name and code are required' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existing = await database.getSchoolByCode(code)
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'School code already exists' },
        { status: 409 }
      )
    }

    const school = await database.createSchool({
      name,
      code,
      admin_user_id,
      subscription_plan
    })

    return NextResponse.json({
      success: true,
      school
    })
  } catch (error) {
    console.error('Error creating school:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create school' },
      { status: 500 }
    )
  }
}

// PUT /api/schools - Update a school
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'School ID is required' },
        { status: 400 }
      )
    }

    // If updating code, check it doesn't conflict
    if (updates.code) {
      const existing = await database.getSchoolByCode(updates.code)
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { success: false, error: 'School code already exists' },
          { status: 409 }
        )
      }
    }

    const school = await database.updateSchool(id, updates)

    return NextResponse.json({
      success: true,
      school
    })
  } catch (error) {
    console.error('Error updating school:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update school' },
      { status: 500 }
    )
  }
}
