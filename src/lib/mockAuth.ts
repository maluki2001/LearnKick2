import { useState, useEffect } from 'react'

export interface User {
  id: string
  email: string
  role: 'admin' | 'teacher' | 'parent' | 'student'
  school_id?: string
  school_name?: string
  school_code?: string
  full_name?: string
  created_at: string
}

// Mock authentication for development
export function useMockAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate auth check
    const checkAuth = () => {
      const savedUser = localStorage.getItem('mockUser')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (error) {
          console.error('Invalid saved user data:', error)
          localStorage.removeItem('mockUser')
        }
      }
      setIsLoading(false)
    }

    // Small delay to simulate network request
    const timer = setTimeout(checkAuth, 500)
    return () => clearTimeout(timer)
  }, [])

  return { user, isLoading }
}

export const mockAuth = {
  async signIn(email: string, password: string) {
    // Mock login - accept any email/password
    const mockUser: User = {
      id: 'mock-admin-1',
      email: email,
      role: 'admin',
      school_id: 'mock-school-1',
      school_name: 'Demo Elementary School',
      school_code: 'DEMO123',
      full_name: 'Demo Administrator',
      created_at: new Date().toISOString()
    }

    localStorage.setItem('mockUser', JSON.stringify(mockUser))
    return { user: mockUser }
  },

  async signOut() {
    localStorage.removeItem('mockUser')
    window.location.reload()
  },

  async clearAllAuthData() {
    localStorage.removeItem('mockUser')
    console.log('✅ Mock auth data cleared')
  }
}

// Types for admin data
interface RecentGame {
  id: string
  student_name: string
  subject: string
  grade: number
  questions_answered: number
  accuracy: number
  completed_at: string
}

interface SchoolUser {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
  last_sign_in_at: string
}

interface AdminData {
  totalQuestions: number
  totalUsers: number
  totalGamesPlayed: number
  averageAccuracy: number
  recentGames: RecentGame[]
  schoolUsers: SchoolUser[]
  isLoading: boolean
}

// Mock admin data hook
export function useMockAdminData(user: User | null) {
  const [data, setData] = useState<AdminData>({
    totalQuestions: 0,
    totalUsers: 0,
    totalGamesPlayed: 0,
    averageAccuracy: 0,
    recentGames: [],
    schoolUsers: [],
    isLoading: true
  })

  useEffect(() => {
    if (!user) {
      setData(prev => ({ ...prev, isLoading: false }))
      return
    }

    // Simulate loading data
    const timer = setTimeout(() => {
      setData({
        totalQuestions: 150,
        totalUsers: 25,
        totalGamesPlayed: 342,
        averageAccuracy: 78,
        recentGames: [
          {
            id: 'game-1',
            student_name: 'Alice Johnson',
            subject: 'Math',
            grade: 3,
            questions_answered: 10,
            accuracy: 85,
            completed_at: new Date().toISOString()
          },
          {
            id: 'game-2',
            student_name: 'Bob Smith',
            subject: 'Science',
            grade: 4,
            questions_answered: 8,
            accuracy: 72,
            completed_at: new Date(Date.now() - 3600000).toISOString()
          }
        ],
        schoolUsers: [
          {
            id: 'user-1',
            full_name: 'Demo Administrator',
            email: user.email,
            role: 'admin',
            created_at: user.created_at,
            last_sign_in_at: new Date().toISOString()
          },
          {
            id: 'user-2',
            full_name: 'Teacher Demo',
            email: 'teacher@demo.edu',
            role: 'teacher',
            created_at: '2024-01-15T10:00:00Z',
            last_sign_in_at: '2024-08-15T14:30:00Z'
          }
        ],
        isLoading: false
      })
    }, 800)

    return () => clearTimeout(timer)
  }, [user])

  return data
}