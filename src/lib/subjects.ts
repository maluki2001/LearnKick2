// Subjects service - uses API routes for database operations
import { SubjectData } from '@/types/questions'

export interface CreateSubjectData {
  name: string
  slug: string
  icon?: string
  color?: string
  description?: string
  school_id?: string
}

export interface UpdateSubjectData {
  name?: string
  slug?: string
  icon?: string
  color?: string
  description?: string
  is_active?: boolean
}

export const subjectsService = {
  // Get all subjects from Neon PostgreSQL via API
  async getSubjects(schoolId?: string): Promise<SubjectData[]> {
    try {
      const url = schoolId
        ? `/api/subjects?school_id=${schoolId}`
        : '/api/subjects'

      const response = await fetch(url)
      const data = await response.json()

      if (data.success && data.subjects) {
        return data.subjects
      }

      // Fallback to default subjects if API fails
      console.warn('Falling back to default subjects')
      const now = new Date().toISOString()
      return this.getDefaultSubjects().map((s, i) => ({
        id: `subject-${i}`,
        ...s,
        school_id: null,
        is_active: true,
        created_at: now,
        updated_at: now
      })) as unknown as SubjectData[]
    } catch (error) {
      console.error('Error fetching subjects:', error)
      // Fallback to default subjects on error
      const now = new Date().toISOString()
      return this.getDefaultSubjects().map((s, i) => ({
        id: `subject-${i}`,
        ...s,
        school_id: null,
        is_active: true,
        created_at: now,
        updated_at: now
      })) as unknown as SubjectData[]
    }
  },

  // Get a single subject by ID
  async getSubject(id: string): Promise<SubjectData | null> {
    try {
      const subjects = await this.getSubjects()
      return subjects.find(s => s.id === id) || null
    } catch (error) {
      console.error('Error fetching subject:', error)
      return null
    }
  },

  // Get subject by slug
  async getSubjectBySlug(slug: string): Promise<SubjectData | null> {
    try {
      const subjects = await this.getSubjects()
      return subjects.find(s => s.slug === slug) || null
    } catch (error) {
      console.error('Error fetching subject by slug:', error)
      return null
    }
  },

  // Create a new subject via API
  async createSubject(subjectData: CreateSubjectData): Promise<SubjectData | null> {
    try {
      const slug = subjectData.slug || subjectData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...subjectData, slug })
      })

      const data = await response.json()

      if (data.success && data.subject) {
        return data.subject
      }

      console.error('Failed to create subject:', data.error)
      return null
    } catch (error) {
      console.error('Error creating subject:', error)
      return null
    }
  },

  // Update a subject via API
  async updateSubject(id: string, updates: UpdateSubjectData): Promise<SubjectData | null> {
    try {
      const response = await fetch('/api/subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })

      const data = await response.json()

      if (data.success && data.subject) {
        return data.subject
      }

      console.error('Failed to update subject:', data.error)
      return null
    } catch (error) {
      console.error('Error updating subject:', error)
      return null
    }
  },

  // Delete a subject via API
  async deleteSubject(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/subjects?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('Error deleting subject:', error)
      return false
    }
  },

  // Check if slug is available
  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const subjects = await this.getSubjects()
    return !subjects.some(s => s.slug === slug && s.id !== excludeId)
  },

  // Get default system subjects (used as fallback)
  getDefaultSubjects(): Omit<CreateSubjectData, 'school_id'>[] {
    return [
      {
        name: 'General Knowledge',
        slug: 'general-knowledge',
        icon: '🧠',
        color: '#6366f1',
        description: 'General knowledge and trivia questions'
      },
      {
        name: 'Mathematics',
        slug: 'math',
        icon: '🔢',
        color: '#10b981',
        description: 'Math, algebra, geometry, and arithmetic'
      },
      {
        name: 'Geography',
        slug: 'geography',
        icon: '🌍',
        color: '#f59e0b',
        description: 'World geography, countries, and landmarks'
      },
      {
        name: 'Language',
        slug: 'language',
        icon: '📖',
        color: '#ec4899',
        description: 'Language arts, grammar, and vocabulary'
      },
      {
        name: 'Science',
        slug: 'science',
        icon: '🔬',
        color: '#06b6d4',
        description: 'Biology, chemistry, physics, and general science'
      },
      {
        name: 'History',
        slug: 'history',
        icon: '📜',
        color: '#8b5cf6',
        description: 'World history, events, and civilizations'
      },
      {
        name: 'Art',
        slug: 'art',
        icon: '🎨',
        color: '#f97316',
        description: 'Visual arts, music, and creative subjects'
      }
    ]
  }
}

export default subjectsService
