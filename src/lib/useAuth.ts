'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { UserRole, ROLE_HIERARCHY, hasRole as checkRole, isSuperAdmin as checkSuperAdmin } from './auth-types'

// Re-export types and helpers
export type { UserRole }
export { ROLE_HIERARCHY }

// User interface matching our app's needs
export interface User {
  id: string
  email: string
  role: UserRole
  school_id?: string | null
  school_name?: string | null
  school_code?: string | null
  full_name?: string | null
  trophies?: number
  league?: string
  playerGrade?: number | null
  created_at?: string
}

// Main auth hook - uses NextAuth's useSession
export function useAuth() {
  const { data: session, status } = useSession()

  const user: User | null = session?.user ? {
    id: session.user.id,
    email: session.user.email || '',
    role: session.user.role || 'student',
    school_id: session.user.schoolId,
    school_name: session.user.schoolName,
    school_code: session.user.schoolCode,
    full_name: session.user.name,
    trophies: session.user.trophies || 0,
    league: session.user.league || 'bronze-3',
    playerGrade: session.user.playerGrade,
  } : null

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  }
}

// Role permission helpers
export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false
  return checkRole(user.role, requiredRole)
}

export function isSuperAdmin(user: User | null): boolean {
  return checkSuperAdmin(user?.role)
}

// Auth client for sign in/out operations
export const authClient = {
  // Email + Password sign in
  async signIn(email: string, password: string) {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        return { data: null, error: { message: result.error } }
      }

      // Reload to update session
      if (typeof window !== 'undefined') {
        window.location.reload()
      }

      return { data: { user: null }, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error: { message: 'Failed to sign in' } }
    }
  },

  // School code + Name sign in (kid-friendly)
  async signInWithSchoolCode(schoolCode: string, playerName: string, grade: number = 3) {
    try {
      const result = await signIn('school-code', {
        schoolCode,
        playerName,
        grade: String(grade),
        redirect: false,
      })

      if (result?.error) {
        return { data: null, error: { message: result.error } }
      }

      if (typeof window !== 'undefined') {
        window.location.reload()
      }

      return { data: { user: null }, error: null }
    } catch (error) {
      console.error('School code sign in error:', error)
      return { data: null, error: { message: 'Failed to sign in with school code' } }
    }
  },

  // Google sign in
  async signInWithGoogle() {
    try {
      await signIn('google', { callbackUrl: '/' })
      return { data: null, error: null }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { data: null, error: { message: 'Failed to sign in with Google' } }
    }
  },

  // Sign out
  async signOut() {
    try {
      await signOut({ callbackUrl: '/' })
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: { message: 'Failed to sign out' } }
    }
  },

  // Register new account (email + password)
  async register(data: {
    email: string
    password: string
    fullName: string
    role?: UserRole
    schoolCode?: string
    schoolName?: string
  }) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        return { data: null, error: { message: result.error } }
      }

      // Auto sign in after registration
      if (data.email && data.password) {
        return authClient.signIn(data.email, data.password)
      }

      return { data: result, error: null }
    } catch (error) {
      console.error('Registration error:', error)
      return { data: null, error: { message: 'Failed to register' } }
    }
  },

  // Legacy methods for backward compatibility
  async signUpSchoolAdmin(data: {
    email: string
    password: string
    fullName: string
    schoolName: string
    schoolCode?: string
  }) {
    return authClient.register({
      ...data,
      role: 'admin',
    })
  },

  async signUpParent(data: {
    email: string
    password: string
    fullName: string
    schoolCode: string
  }) {
    return authClient.register({
      ...data,
      role: 'parent',
    })
  },

  // Invite user (called from admin panel)
  async inviteUser(email: string, role: 'teacher' | 'parent', schoolId: string, invitedBy: string) {
    try {
      const response = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, schoolId, invitedBy }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error)
      }

      return result
    } catch (error) {
      console.error('Invite error:', error)
      throw error
    }
  },

  // Clear auth data (for debugging)
  async clearAllAuthData() {
    await signOut({ callbackUrl: '/' })
  },

  // Get current user (from session, not localStorage)
  getUser(): User | null {
    // This is a synchronous call, so we return null
    // Use useAuth() hook instead for reactive user data
    return null
  },
}

// Global auth debugging helper (available in browser console)
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).authDebug = {
    clearAuth: () => authClient.clearAllAuthData(),
    signOut: () => authClient.signOut(),
    testLogin: () => authClient.signIn('dev@test.com', 'password'),
    superadminLogin: () => authClient.signIn('admin@learnkick', 'LearnKick123!'),
    schoolCodeLogin: (code: string, name: string) => authClient.signInWithSchoolCode(code, name),
    googleLogin: () => authClient.signInWithGoogle(),
    help: () => {
      console.log(`
Auth Debug Commands (NextAuth.js):
- authDebug.superadminLogin() - Login as platform owner (admin@learnkick)
- authDebug.testLogin() - Login as dev@test.com
- authDebug.schoolCodeLogin('CODE', 'Name') - Login with school code
- authDebug.googleLogin() - Login with Google
- authDebug.signOut() - Sign out
- authDebug.clearAuth() - Clear auth and reload
- authDebug.help() - Show this help

Role Hierarchy:
  superadmin - Platform owner, manages ALL schools & global questions
  admin      - School admin, manages their school & school questions
  teacher    - Can view analytics, manage classes
  parent     - Can view child's progress
  student    - Can play games

Superadmin Credentials:
  Email: admin@learnkick
  Password: LearnKick123!
      `)
    }
  }
}
