export interface ExportData {
  type: 'users' | 'analytics' | 'questions' | 'comprehensive'
  data: Record<string, unknown>[]
  filename: string
  headers: string[]
}

export class DataExportService {
  static generateCSV(data: Record<string, unknown>[], headers: string[]): string {
    const csvHeaders = headers.join(',')
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header] || ''
        // Escape quotes and wrap in quotes if contains comma or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    })
    
    return [csvHeaders, ...csvRows].join('\n')
  }

  static downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  static async exportUsers(adminData: Record<string, unknown>): Promise<void> {
    const users = (Array.isArray(adminData.schoolUsers) ? adminData.schoolUsers : []) as Record<string, unknown>[]
    const headers = [
      'id',
      'full_name', 
      'email',
      'role',
      'created_at',
      'last_sign_in_at',
      'status'
    ]

    const exportData = users.map((user: Record<string, unknown>) => ({
      id: user.id || '',
      full_name: user.full_name || '',
      email: user.email || '',
      role: user.role || '',
      created_at: user.created_at || '',
      last_sign_in_at: user.last_sign_in_at || '',
      status: 'Active' // Default for now
    }))

    const csv = this.generateCSV(exportData, headers)
    const filename = `users-export-${new Date().toISOString().split('T')[0]}.csv`
    this.downloadCSV(csv, filename)
  }

  static async exportAnalytics(adminData: Record<string, unknown>): Promise<void> {
    const games = (Array.isArray(adminData.recentGames) ? adminData.recentGames : []) as Record<string, unknown>[]
    const headers = [
      'game_id',
      'student_name',
      'subject',
      'grade',
      'questions_answered',
      'accuracy',
      'duration_seconds',
      'completed_at'
    ]

    const exportData = games.map((game: Record<string, unknown>) => ({
      game_id: game.id || '',
      student_name: game.student_name || '',
      subject: game.subject || '',
      grade: game.grade || '',
      questions_answered: game.questions_answered || 0,
      accuracy: Math.round(Number(game.accuracy) || 0),
      duration_seconds: game.duration_seconds || 0,
      completed_at: game.completed_at || ''
    }))

    const csv = this.generateCSV(exportData, headers)
    const filename = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`
    this.downloadCSV(csv, filename)
  }

  static async exportQuestions(): Promise<void> {
    // This would integrate with the question bank service
    // For now, we'll create sample data
    const headers = [
      'id',
      'type',
      'subject',
      'grade',
      'difficulty',
      'language',
      'question',
      'correct_answer',
      'created_at'
    ]

    const exportData = [
      {
        id: 'q1',
        type: 'multiple-choice',
        subject: 'math',
        grade: 3,
        difficulty: 2,
        language: 'en',
        question: 'What is 5 + 3?',
        correct_answer: '8',
        created_at: new Date().toISOString()
      }
    ]

    const csv = this.generateCSV(exportData, headers)
    const filename = `questions-export-${new Date().toISOString().split('T')[0]}.csv`
    this.downloadCSV(csv, filename)
  }

  static async exportComprehensive(adminData: Record<string, unknown>): Promise<void> {
    // Create a comprehensive report with multiple sheets/sections
    const timestamp = new Date().toISOString().split('T')[0]
    
    // Summary metrics
    const summaryHeaders = ['metric', 'value', 'description']
    const summaryData = [
      {
        metric: 'Total Users',
        value: adminData.totalUsers || 0,
        description: 'Total registered users in the school'
      },
      {
        metric: 'Total Questions',
        value: adminData.totalQuestions || 0,
        description: 'Total questions in the question bank'
      },
      {
        metric: 'Games Played',
        value: adminData.totalGamesPlayed || 0,
        description: 'Total games completed by students'
      },
      {
        metric: 'Average Accuracy',
        value: `${adminData.averageAccuracy || 0}%`,
        description: 'Average accuracy across all games'
      }
    ]

    const summaryCSV = this.generateCSV(summaryData, summaryHeaders)
    this.downloadCSV(summaryCSV, `comprehensive-report-${timestamp}.csv`)

    // Also trigger individual exports
    await this.exportUsers(adminData)
    await this.exportAnalytics(adminData)
  }

  static async exportWithOptions(adminData: Record<string, unknown>, options: {
    includeUsers?: boolean
    includeAnalytics?: boolean
    includeQuestions?: boolean
    includeSummary?: boolean
  }): Promise<void> {
    const { includeUsers, includeAnalytics, includeQuestions, includeSummary } = options

    if (includeSummary) {
      await this.exportComprehensive(adminData)
    } else {
      if (includeUsers) await this.exportUsers(adminData)
      if (includeAnalytics) await this.exportAnalytics(adminData)
      if (includeQuestions) await this.exportQuestions()
    }
  }
}