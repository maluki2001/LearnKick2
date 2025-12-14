import { UserRole } from '@/lib/auth-types'
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    role: UserRole
    schoolId?: string | null
    schoolName?: string | null
    schoolCode?: string | null
    playerGrade?: number | null
    trophies?: number
    league?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
      schoolId?: string | null
      schoolName?: string | null
      schoolCode?: string | null
      playerGrade?: number | null
      trophies: number
      league: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    schoolId?: string | null
    schoolName?: string | null
    schoolCode?: string | null
    playerGrade?: number | null
    trophies: number
    league: string
  }
}
