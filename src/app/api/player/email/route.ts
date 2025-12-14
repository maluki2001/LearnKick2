// Email linking and verification API for player profiles
// Allows players to link their account to an email for backup/cross-device access
import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database.server'

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Simple email sending (for now, just log it - in production use a proper email service)
async function sendVerificationEmail(email: string, code: string, playerName: string, purpose: 'link' | 'login'): Promise<boolean> {
  // In production, integrate with SendGrid, Resend, or another email service
  // For now, we'll log the code for testing
  console.log(`
    ========================================
    EMAIL VERIFICATION CODE
    ========================================
    To: ${email}
    Player: ${playerName}
    Purpose: ${purpose === 'link' ? 'Link Account' : 'Login from New Device'}
    Code: ${code}
    ========================================

    This code will expire in 10 minutes.
  `)

  // TODO: Implement actual email sending
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'LearnKick <noreply@learnkick.com>',
  //   to: email,
  //   subject: purpose === 'link' ? 'Link Your LearnKick Account' : 'Login to LearnKick',
  //   html: `<p>Your verification code is: <strong>${code}</strong></p>`
  // })

  return true
}

// POST /api/player/email - Request email verification (link or login)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, deviceId, purpose = 'link' } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // For linking: need deviceId and existing profile
    if (purpose === 'link') {
      if (!deviceId) {
        return NextResponse.json(
          { error: 'Device ID is required for linking' },
          { status: 400 }
        )
      }

      // Check if player exists with this device
      const playerResult = await database.query(
        'SELECT id, name, email FROM player_profiles WHERE device_id = $1',
        [deviceId]
      )

      if (!playerResult.rows[0]) {
        return NextResponse.json(
          { error: 'Player not found' },
          { status: 404 }
        )
      }

      const player = playerResult.rows[0]

      // Check if email is already linked to another account
      const emailCheck = await database.query(
        'SELECT id FROM player_profiles WHERE email = $1 AND device_id != $2',
        [email, deviceId]
      )

      if (emailCheck.rows[0]) {
        return NextResponse.json(
          { error: 'This email is already linked to another account' },
          { status: 409 }
        )
      }

      // Generate and store verification code
      const code = generateVerificationCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Delete any existing codes for this player
      await database.query(
        'DELETE FROM email_verification_codes WHERE player_id = $1',
        [player.id]
      )

      // Insert new code
      await database.query(
        `INSERT INTO email_verification_codes (player_id, email, code, purpose, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [player.id, email, code, 'link', expiresAt]
      )

      // Send verification email
      await sendVerificationEmail(email, code, player.name, 'link')

      return NextResponse.json({
        success: true,
        message: 'Verification code sent to email'
      })
    }

    // For login: check if email exists in database
    if (purpose === 'login') {
      const playerResult = await database.query(
        'SELECT id, name, email_verified FROM player_profiles WHERE email = $1',
        [email]
      )

      if (!playerResult.rows[0]) {
        return NextResponse.json(
          { error: 'No account found with this email' },
          { status: 404 }
        )
      }

      const player = playerResult.rows[0]

      if (!player.email_verified) {
        return NextResponse.json(
          { error: 'Email not verified. Please verify from your original device first.' },
          { status: 400 }
        )
      }

      // Generate and store verification code
      const code = generateVerificationCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Delete any existing codes for this player
      await database.query(
        'DELETE FROM email_verification_codes WHERE player_id = $1',
        [player.id]
      )

      // Insert new code
      await database.query(
        `INSERT INTO email_verification_codes (player_id, email, code, purpose, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [player.id, email, code, 'login', expiresAt]
      )

      // Send verification email
      await sendVerificationEmail(email, code, player.name, 'login')

      return NextResponse.json({
        success: true,
        message: 'Verification code sent to email'
      })
    }

    return NextResponse.json(
      { error: 'Invalid purpose' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Email verification request error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}

// PUT /api/player/email - Verify code and complete action
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code, deviceId, purpose = 'link' } = body

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    // Find the verification code
    const codeResult = await database.query(
      `SELECT vc.*, pp.name, pp.device_id as original_device_id
       FROM email_verification_codes vc
       JOIN player_profiles pp ON pp.id = vc.player_id
       WHERE vc.email = $1 AND vc.code = $2 AND vc.purpose = $3
         AND vc.used_at IS NULL AND vc.expires_at > NOW()`,
      [email, code, purpose]
    )

    if (!codeResult.rows[0]) {
      // Check if code exists but is expired/used
      const expiredCheck = await database.query(
        `SELECT expires_at, used_at FROM email_verification_codes
         WHERE email = $1 AND code = $2`,
        [email, code]
      )

      if (expiredCheck.rows[0]) {
        if (expiredCheck.rows[0].used_at) {
          return NextResponse.json(
            { error: 'This code has already been used' },
            { status: 400 }
          )
        }
        if (new Date(expiredCheck.rows[0].expires_at) < new Date()) {
          return NextResponse.json(
            { error: 'This code has expired. Please request a new one.' },
            { status: 400 }
          )
        }
      }

      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    const verification = codeResult.rows[0]

    // Increment attempts
    await database.query(
      'UPDATE email_verification_codes SET attempts = attempts + 1 WHERE id = $1',
      [verification.id]
    )

    // Check max attempts
    if (verification.attempts >= verification.max_attempts) {
      return NextResponse.json(
        { error: 'Too many attempts. Please request a new code.' },
        { status: 429 }
      )
    }

    // Mark code as used
    await database.query(
      'UPDATE email_verification_codes SET used_at = NOW() WHERE id = $1',
      [verification.id]
    )

    if (purpose === 'link') {
      // Update player profile with verified email
      await database.query(
        `UPDATE player_profiles SET
          email = $1,
          email_verified = TRUE,
          email_verified_at = NOW(),
          updated_at = NOW()
         WHERE id = $2`,
        [email, verification.player_id]
      )

      console.log(`Email ${email} linked to player ${verification.name}`)

      return NextResponse.json({
        success: true,
        message: 'Email linked successfully'
      })
    }

    if (purpose === 'login') {
      if (!deviceId) {
        return NextResponse.json(
          { error: 'Device ID is required for login' },
          { status: 400 }
        )
      }

      // Get the full player profile
      const playerResult = await database.query(
        `SELECT * FROM player_profiles WHERE id = $1`,
        [verification.player_id]
      )

      const player = playerResult.rows[0]

      // Update the device_id to the new device (transfer account)
      await database.query(
        `UPDATE player_profiles SET
          device_id = $1,
          updated_at = NOW()
         WHERE id = $2`,
        [deviceId, verification.player_id]
      )

      console.log(`Account ${verification.name} transferred from device ${verification.original_device_id?.substring(0, 8)}... to ${deviceId.substring(0, 8)}...`)

      // Return the player profile
      const totalAnswers = (player.total_correct_answers || 0) + (player.total_incorrect_answers || 0)
      const accuracy = totalAnswers > 0
        ? Math.round((player.total_correct_answers / totalAnswers) * 100)
        : 0

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        player: {
          id: player.id,
          deviceId: deviceId, // New device ID
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
          email: player.email,
          emailVerified: player.email_verified,
          createdAt: player.created_at,
          updatedAt: player.updated_at
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid purpose' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}

// GET /api/player/email?email=xxx - Check if email exists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const result = await database.query(
      'SELECT id, name, email_verified FROM player_profiles WHERE email = $1',
      [email]
    )

    if (!result.rows[0]) {
      return NextResponse.json({
        exists: false
      })
    }

    return NextResponse.json({
      exists: true,
      emailVerified: result.rows[0].email_verified,
      playerName: result.rows[0].name
    })
  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json(
      { error: 'Failed to check email' },
      { status: 500 }
    )
  }
}
