'use client'

import { useState, useEffect } from 'react'

interface AdminStats {
  totalQuestions: number
  totalUsers: number
  totalGamesPlayed: number
  averageAccuracy: number
  questionsBySubject: Record<string, number>
  questionsByGrade: Record<number, number>
  usersByRole: Record<string, number>
  isLoading: boolean
  error: string | null
}

interface GameSession {
  id: string
  student_id: string
  subject: string
  grade: number
  questions_answered: number
  correct_answers: number
  total_score: number
  accuracy: number
  duration_seconds: number
  completed_at: string
  student_name?: string
}

interface SchoolUser {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  last_sign_in_at?: string
}

export function useAdminData(user: { school_id?: string | null }) {
  const [stats, setStats] = useState<AdminStats>({
    totalQuestions: 0,
    totalUsers: 0,
    totalGamesPlayed: 0,
    averageAccuracy: 0,
    questionsBySubject: {},
    questionsByGrade: {},
    usersByRole: {},
    isLoading: true,
    error: null
  })

  const [recentGames, setRecentGames] = useState<GameSession[]>([])
  const [schoolUsers, setSchoolUsers] = useState<SchoolUser[]>([])

  useEffect(() => {
    fetchAdminData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.school_id])

  const fetchAdminData = async () => {
    try {
      setStats(prev => ({ ...prev, isLoading: true, error: null }))

      // Fetch all stats from the admin stats API (uses Neon PostgreSQL)
      const url = user.school_id
        ? `/api/admin/stats?school_id=${user.school_id}`
        : '/api/admin/stats'

      const response = await fetch(url)
      const data = await response.json()

      if (data.success && data.stats) {
        const { questions, users, games } = data.stats

        setStats({
          totalQuestions: questions.total || 0,
          totalUsers: users.total || 0,
          totalGamesPlayed: games.total || 0,
          averageAccuracy: games.averageAccuracy || 0,
          questionsBySubject: questions.bySubject || {},
          questionsByGrade: questions.byGrade || {},
          usersByRole: users.byRole || {},
          isLoading: false,
          error: null
        })

        setRecentGames(games.recent || [])
        setSchoolUsers(users.list || [])
      } else {
        throw new Error(data.error || 'Failed to fetch admin stats')
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      setStats(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load dashboard data. Please check your database connection.'
      }))
    }
  }

  const refreshData = () => {
    fetchAdminData()
  }

  return {
    ...stats,
    recentGames,
    schoolUsers,
    refreshData
  }
}
