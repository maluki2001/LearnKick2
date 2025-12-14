import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { database } from '@/lib/database.server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, role = 'student', schoolCode, schoolName } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await database.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows[0]) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hash(password, 12)

    let schoolId: string | null = null

    // Handle school-based registration
    if (role === 'admin' && schoolName) {
      // Create new school for admin
      const code = schoolCode || generateSchoolCode()
      const school = await database.createSchool({
        name: schoolName,
        code: code,
        subscription_plan: 'free',
      })
      schoolId = school.id

      // Create admin user
      const userId = crypto.randomUUID()
      await database.query(
        `INSERT INTO users (id, email, full_name, role, school_id, password_hash, trophies, league)
         VALUES ($1, $2, $3, 'admin', $4, $5, 0, 'bronze-3')`,
        [userId, email, fullName, schoolId, passwordHash]
      )

      // Update school with admin user
      await database.query(
        'UPDATE schools SET admin_user_id = $1 WHERE id = $2',
        [userId, schoolId]
      )

      return NextResponse.json({
        success: true,
        message: 'School admin account created successfully',
        schoolCode: code,
      })
    } else if (schoolCode) {
      // Join existing school
      const school = await database.getSchoolByCode(schoolCode.toUpperCase())
      if (!school) {
        return NextResponse.json(
          { error: 'Invalid school code' },
          { status: 400 }
        )
      }
      schoolId = school.id
    }

    // Create user
    const userId = crypto.randomUUID()
    await database.query(
      `INSERT INTO users (id, email, full_name, role, school_id, password_hash, trophies, league)
       VALUES ($1, $2, $3, $4, $5, $6, 0, 'bronze-3')`,
      [userId, email, fullName, role, schoolId, passwordHash]
    )

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}

function generateSchoolCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
