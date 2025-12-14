// Auth types and exports
// Main authentication logic is in auth-config.ts (server) and useAuth.ts (client)
import NextAuth from 'next-auth'
import { authConfig } from './auth-config'

// NextAuth v5 - export auth function for server-side session access
const { auth, signIn, signOut } = NextAuth(authConfig)

export { auth, signIn, signOut }

// Re-export types for convenience from shared types
export type { UserRole, LearnKickUser } from './auth-types'
export { ROLE_HIERARCHY, hasRole, isSuperAdmin } from './auth-types'

// Re-export User interface and client hooks from useAuth
export type { User } from './useAuth'
export { useAuth, authClient } from './useAuth'

// School interface
export interface School {
  id: string
  name: string
  code: string
  admin_user_id: string
  subscription_plan: 'free' | 'basic' | 'premium'
  max_students?: number
  max_teachers?: number
  created_at: string
  settings?: {
    allow_parent_signup: boolean
    require_approval: boolean
    game_time_limits: boolean
  }
}
