import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database.server'

// GET /api/users - Get users for a school
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('school_id')
    const role = searchParams.get('role')
    const userId = searchParams.get('id')

    if (userId) {
      // Get specific user
      const user = await database.getUserById(userId)
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, user })
    }

    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: 'School ID is required' },
        { status: 400 }
      )
    }

    let users
    if (role) {
      users = await database.getUsersByRole(schoolId, role)
    } else {
      users = await database.getUsers(schoolId)
    }

    return NextResponse.json({
      success: true,
      users
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, email, full_name, role, school_id } = body

    if (!id || !email || !role || !school_id) {
      return NextResponse.json(
        { success: false, error: 'ID, email, role, and school_id are required' },
        { status: 400 }
      )
    }

    const user = await database.createUser({
      id,
      email,
      full_name,
      role,
      school_id
    })

    return NextResponse.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// PUT /api/users - Update a user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const user = await database.updateUser(id, updates)

    return NextResponse.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/users - Delete a user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    await database.deleteUser(id)

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
