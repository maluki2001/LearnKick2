// Shared auth types and helpers - safe for client and server

export const ROLE_HIERARCHY = {
  superadmin: 5,
  admin: 4,
  teacher: 3,
  parent: 2,
  student: 1,
} as const

export type UserRole = keyof typeof ROLE_HIERARCHY

// Extended user type for LearnKick
export interface LearnKickUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  schoolId?: string | null
  schoolName?: string | null
  schoolCode?: string | null
  playerGrade?: number | null
  trophies?: number
  league?: string
  image?: string | null
}

// Helper functions
export function hasRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function isSuperAdmin(userRole: UserRole | undefined): boolean {
  return userRole === 'superadmin'
}
