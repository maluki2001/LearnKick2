import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth-config'

// NextAuth v5 initialization exports handlers, auth, signIn, signOut
const { handlers } = NextAuth(authConfig)

export const { GET, POST } = handlers
