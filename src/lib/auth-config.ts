import { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { compare } from 'bcryptjs'
import { database } from './database.server'
import { UserRole, LearnKickUser, ROLE_HIERARCHY } from './auth-types'

// Re-export types
export type { UserRole, LearnKickUser }
export { ROLE_HIERARCHY }

// Predefined superadmin (platform owner) - credentials from environment
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'admin@learnkick'
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || ''
const SUPERADMIN_USER: LearnKickUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: SUPERADMIN_EMAIL,
  name: 'LearnKick Platform Owner',
  role: 'superadmin',
  schoolId: null,
  schoolName: null,
  trophies: 0,
  league: 'staff',
}

export const authConfig: NextAuthConfig = {
  providers: [
    // 1. Email + Password authentication
    Credentials({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // Check superadmin first
        if (email === SUPERADMIN_EMAIL) {
          if (password === SUPERADMIN_PASSWORD) {
            return {
              id: SUPERADMIN_USER.id,
              email: SUPERADMIN_USER.email,
              name: SUPERADMIN_USER.name,
              role: SUPERADMIN_USER.role,
              schoolId: null,
            }
          }
          return null
        }

        try {
          // Look up user in database
          const result = await database.query(
            `SELECT u.*, s.name as school_name, s.code as school_code
             FROM users u
             LEFT JOIN schools s ON u.school_id = s.id
             WHERE u.email = $1`,
            [email]
          )

          const user = result.rows[0]
          if (!user || !user.password_hash) {
            return null
          }

          // Verify password
          const isValid = await compare(password, user.password_hash)
          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            role: user.role,
            schoolId: user.school_id,
            schoolName: user.school_name,
            schoolCode: user.school_code,
            playerGrade: user.player_grade,
            trophies: user.trophies || 0,
            league: user.league || 'bronze-3',
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),

    // 2. School Code + Player Name (kid-friendly login)
    Credentials({
      id: 'school-code',
      name: 'School Code',
      credentials: {
        schoolCode: { label: 'School Code', type: 'text' },
        playerName: { label: 'Your Name', type: 'text' },
        grade: { label: 'Grade', type: 'number' },
      },
      async authorize(credentials) {
        if (!credentials?.schoolCode || !credentials?.playerName) {
          return null
        }

        const schoolCode = (credentials.schoolCode as string).toUpperCase()
        const playerName = credentials.playerName as string
        const grade = parseInt(credentials.grade as string) || 3

        try {
          // Find school by code
          const school = await database.getSchoolByCode(schoolCode)
          if (!school) {
            return null
          }

          // Check if student already exists
          const existingResult = await database.query(
            `SELECT u.*, s.name as school_name, s.code as school_code
             FROM users u
             JOIN schools s ON u.school_id = s.id
             WHERE u.full_name = $1 AND u.school_id = $2 AND u.role = 'student'`,
            [playerName, school.id]
          )

          if (existingResult.rows[0]) {
            const user = existingResult.rows[0]
            return {
              id: user.id,
              email: user.email,
              name: user.full_name,
              role: 'student',
              schoolId: school.id,
              schoolName: school.name,
              schoolCode: school.code,
              playerGrade: user.player_grade || grade,
              trophies: user.trophies || 0,
              league: user.league || 'bronze-3',
            }
          }

          // Create new student account
          const studentId = crypto.randomUUID()
          const studentEmail = `${playerName.toLowerCase().replace(/\s+/g, '.')}@${schoolCode.toLowerCase()}.student`

          await database.query(
            `INSERT INTO users (id, email, full_name, role, school_id, player_grade, trophies, league)
             VALUES ($1, $2, $3, 'student', $4, $5, 0, 'bronze-3')`,
            [studentId, studentEmail, playerName, school.id, grade]
          )

          return {
            id: studentId,
            email: studentEmail,
            name: playerName,
            role: 'student',
            schoolId: school.id,
            schoolName: school.name,
            schoolCode: school.code,
            playerGrade: grade,
            trophies: 0,
            league: 'bronze-3',
          }
        } catch (error) {
          console.error('School code auth error:', error)
          return null
        }
      },
    }),

    // 3. Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // For OAuth (Google), create or link user
      if (account?.provider === 'google' && user.email) {
        try {
          const result = await database.query(
            'SELECT * FROM users WHERE email = $1',
            [user.email]
          )

          if (!result.rows[0]) {
            // Create new user from Google auth
            await database.query(
              `INSERT INTO users (id, email, full_name, role, trophies, league)
               VALUES ($1, $2, $3, 'student', 0, 'bronze-3')`,
              [user.id || crypto.randomUUID(), user.email, user.name]
            )
          }
        } catch (error) {
          console.error('Google signIn callback error:', error)
        }
      }
      return true
    },

    async jwt({ token, user, trigger, session }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id
        token.role = (user as LearnKickUser).role || 'student'
        token.schoolId = (user as LearnKickUser).schoolId
        token.schoolName = (user as LearnKickUser).schoolName
        token.schoolCode = (user as LearnKickUser).schoolCode
        token.playerGrade = (user as LearnKickUser).playerGrade
        token.trophies = (user as LearnKickUser).trophies || 0
        token.league = (user as LearnKickUser).league || 'bronze-3'
      }

      // Handle session updates (e.g., trophy changes)
      if (trigger === 'update' && session) {
        if (session.trophies !== undefined) token.trophies = session.trophies
        if (session.league !== undefined) token.league = session.league
        if (session.playerGrade !== undefined) token.playerGrade = session.playerGrade
      }

      return token
    },

    async session({ session, token }) {
      // Add custom fields to session
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.schoolId = token.schoolId as string | null
        session.user.schoolName = token.schoolName as string | null
        session.user.schoolCode = token.schoolCode as string | null
        session.user.playerGrade = token.playerGrade as number | null
        session.user.trophies = token.trophies as number
        session.user.league = token.league as string
      }
      return session
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  debug: process.env.NODE_ENV === 'development',
}

// Re-export helper functions from auth-types
export { hasRole, isSuperAdmin } from './auth-types'
