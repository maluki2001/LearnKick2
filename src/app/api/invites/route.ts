import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database.server'

// Generate a random invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// GET /api/invites - Get invites for a school
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('school_id')
    const code = searchParams.get('code')

    if (code) {
      // Get specific invite by code
      const invite = await database.getInviteByCode(code)
      if (!invite) {
        return NextResponse.json(
          { success: false, error: 'Invite not found or expired' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, invite })
    }

    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: 'School ID is required' },
        { status: 400 }
      )
    }

    const invites = await database.getSchoolInvites(schoolId)

    return NextResponse.json({
      success: true,
      invites
    })
  } catch (error) {
    console.error('Error fetching invites:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invites' },
      { status: 500 }
    )
  }
}

// POST /api/invites - Create a new invite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { school_id, invited_by, email, role, expires_in_days = 7 } = body

    if (!school_id || !invited_by || !email || !role) {
      return NextResponse.json(
        { success: false, error: 'school_id, invited_by, email, and role are required' },
        { status: 400 }
      )
    }

    if (!['teacher', 'parent'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Role must be teacher or parent' },
        { status: 400 }
      )
    }

    const code = generateInviteCode()
    const expires_at = new Date()
    expires_at.setDate(expires_at.getDate() + expires_in_days)

    const invite = await database.createInvite({
      school_id,
      invited_by,
      email,
      role,
      code,
      expires_at
    })

    return NextResponse.json({
      success: true,
      invite
    })
  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create invite' },
      { status: 500 }
    )
  }
}

// PUT /api/invites - Use an invite
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, user_id } = body

    if (!code || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Code and user_id are required' },
        { status: 400 }
      )
    }

    const invite = await database.useInvite(code, user_id)

    if (!invite) {
      return NextResponse.json(
        { success: false, error: 'Invalid, expired, or already used invite code' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      invite
    })
  } catch (error) {
    console.error('Error using invite:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to use invite' },
      { status: 500 }
    )
  }
}
