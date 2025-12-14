// Server-only file - database operations
// This file should only be imported in API routes or server components

import { Pool } from 'pg'

// PostgreSQL connection pool
let pool: Pool | null = null

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })

    pool.on('error', (err) => {
      console.error('Unexpected database error:', err)
    })
  }
  return pool
}

// Helper for queries
async function query(text: string, params?: unknown[]) {
  const client = await getPool().connect()
  try {
    const result = await client.query(text, params)
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  } finally {
    client.release()
  }
}

// Database helper for questions with school isolation
export const database = {
  // Generic query helper for custom queries
  async query(sql: string, params?: unknown[]) {
    return query(sql, params)
  },

  // =====================
  // SUBJECTS
  // =====================
  async getSubjects(schoolId?: string | null) {
    const sql = `
      SELECT * FROM subjects
      WHERE school_id IS NULL ${schoolId ? 'OR school_id = $1' : ''}
      ORDER BY name ASC
    `
    const result = await query(sql, schoolId ? [schoolId] : [])
    return result.rows
  },

  async createSubject(subject: {
    name: string
    slug: string
    icon?: string
    color?: string
    description?: string
    school_id?: string | null
  }) {
    const result = await query(
      `INSERT INTO subjects (name, slug, icon, color, description, school_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        subject.name,
        subject.slug,
        subject.icon || '📚',
        subject.color || '#3b82f6',
        subject.description || '',
        subject.school_id || null
      ]
    )
    return result.rows[0]
  },

  async updateSubject(id: string, updates: Partial<{
    name: string
    slug: string
    icon: string
    color: string
    description: string
    is_active: boolean
  }>) {
    const result = await query(
      `UPDATE subjects SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        icon = COALESCE($3, icon),
        color = COALESCE($4, color),
        description = COALESCE($5, description),
        is_active = COALESCE($6, is_active),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *`,
      [
        updates.name || null,
        updates.slug || null,
        updates.icon || null,
        updates.color || null,
        updates.description || null,
        updates.is_active ?? null,
        id
      ]
    )
    return result.rows[0]
  },

  async deleteSubject(id: string) {
    await query('DELETE FROM subjects WHERE id = $1', [id])
  },

  // =====================
  // SCHOOLS
  // =====================
  async getSchool(schoolId: string) {
    const result = await query('SELECT * FROM schools WHERE id = $1', [schoolId])
    return result.rows[0] || null
  },

  async getSchoolByCode(code: string) {
    const result = await query('SELECT * FROM schools WHERE code = $1', [code])
    return result.rows[0] || null
  },

  async updateSchool(schoolId: string, updates: Partial<{
    name: string
    settings: Record<string, unknown>
    code: string
  }>) {
    const result = await query(
      `UPDATE schools SET
        name = COALESCE($1, name),
        settings = COALESCE($2, settings),
        code = COALESCE($3, code),
        updated_at = NOW()
      WHERE id = $4
      RETURNING *`,
      [
        updates.name || null,
        updates.settings ? JSON.stringify(updates.settings) : null,
        updates.code || null,
        schoolId
      ]
    )
    return result.rows[0]
  },

  async createSchool(school: {
    name: string
    code: string
    admin_user_id?: string
    subscription_plan?: 'free' | 'basic' | 'premium'
  }) {
    const result = await query(
      `INSERT INTO schools (name, code, admin_user_id, subscription_plan)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        school.name,
        school.code,
        school.admin_user_id || null,
        school.subscription_plan || 'free'
      ]
    )
    return result.rows[0]
  },

  // =====================
  // USERS
  // =====================
  async getUsers(schoolId: string) {
    const result = await query(
      `SELECT id, email, full_name, role, created_at, updated_at
       FROM users
       WHERE school_id = $1
       ORDER BY created_at DESC`,
      [schoolId]
    )
    return result.rows
  },

  async getUserById(userId: string) {
    const result = await query(
      `SELECT u.*, s.name as school_name, s.code as school_code
       FROM users u
       LEFT JOIN schools s ON u.school_id = s.id
       WHERE u.id = $1`,
      [userId]
    )
    return result.rows[0] || null
  },

  async getUsersByRole(schoolId: string, role: string) {
    const result = await query(
      `SELECT id, email, full_name, role, created_at
       FROM users
       WHERE school_id = $1 AND role = $2
       ORDER BY created_at DESC`,
      [schoolId, role]
    )
    return result.rows
  },

  async createUser(user: {
    id: string
    email: string
    full_name?: string
    role: 'admin' | 'teacher' | 'parent' | 'student'
    school_id: string
  }) {
    const result = await query(
      `INSERT INTO users (id, email, full_name, role, school_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user.id, user.email, user.full_name || null, user.role, user.school_id]
    )
    return result.rows[0]
  },

  async updateUser(userId: string, updates: Partial<{
    email: string
    full_name: string
    role: string
    preferences: Record<string, unknown>
  }>) {
    const result = await query(
      `UPDATE users SET
        email = COALESCE($1, email),
        full_name = COALESCE($2, full_name),
        role = COALESCE($3, role),
        preferences = COALESCE($4, preferences),
        updated_at = NOW()
      WHERE id = $5
      RETURNING *`,
      [
        updates.email || null,
        updates.full_name || null,
        updates.role || null,
        updates.preferences ? JSON.stringify(updates.preferences) : null,
        userId
      ]
    )
    return result.rows[0]
  },

  async deleteUser(userId: string) {
    await query('DELETE FROM users WHERE id = $1', [userId])
  },

  // =====================
  // GAME SESSIONS
  // =====================
  async getGameSessions(schoolId: string, limit = 50) {
    const result = await query(
      `SELECT gs.*, u.full_name as student_name, u.email as student_email
       FROM game_sessions gs
       LEFT JOIN users u ON gs.student_id = u.id
       WHERE gs.school_id = $1
       ORDER BY gs.created_at DESC
       LIMIT $2`,
      [schoolId, limit]
    )
    return result.rows
  },

  async getGameSessionStats(schoolId: string) {
    const result = await query(
      `SELECT
        COUNT(*) as total_games,
        COALESCE(AVG(accuracy), 0) as average_accuracy,
        COALESCE(SUM(questions_answered), 0) as total_questions_answered,
        COALESCE(SUM(correct_answers), 0) as total_correct_answers
       FROM game_sessions
       WHERE school_id = $1`,
      [schoolId]
    )
    return result.rows[0]
  },

  async createGameSession(session: {
    school_id: string
    student_id: string
    subject: string
    grade: number
    language: string
    game_mode?: 'family' | 'school'
  }) {
    const result = await query(
      `INSERT INTO game_sessions (school_id, student_id, subject, grade, language, game_mode)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        session.school_id,
        session.student_id,
        session.subject,
        session.grade,
        session.language,
        session.game_mode || 'family'
      ]
    )
    return result.rows[0]
  },

  async updateGameSession(sessionId: string, updates: {
    questions_answered?: number
    correct_answers?: number
    total_score?: number
    accuracy?: number
    max_streak?: number
    duration_seconds?: number
    question_results?: unknown[]
    completed_at?: Date
  }) {
    const result = await query(
      `UPDATE game_sessions SET
        questions_answered = COALESCE($1, questions_answered),
        correct_answers = COALESCE($2, correct_answers),
        total_score = COALESCE($3, total_score),
        accuracy = COALESCE($4, accuracy),
        max_streak = COALESCE($5, max_streak),
        duration_seconds = COALESCE($6, duration_seconds),
        question_results = COALESCE($7, question_results),
        completed_at = COALESCE($8, completed_at)
      WHERE id = $9
      RETURNING *`,
      [
        updates.questions_answered ?? null,
        updates.correct_answers ?? null,
        updates.total_score ?? null,
        updates.accuracy ?? null,
        updates.max_streak ?? null,
        updates.duration_seconds ?? null,
        updates.question_results ? JSON.stringify(updates.question_results) : null,
        updates.completed_at || null,
        sessionId
      ]
    )
    return result.rows[0]
  },

  // =====================
  // SCHOOL INVITES
  // =====================
  async getSchoolInvites(schoolId: string) {
    const result = await query(
      `SELECT si.*, u.full_name as invited_by_name
       FROM school_invites si
       LEFT JOIN users u ON si.invited_by = u.id
       WHERE si.school_id = $1
       ORDER BY si.created_at DESC`,
      [schoolId]
    )
    return result.rows
  },

  async createInvite(invite: {
    school_id: string
    invited_by: string
    email: string
    role: 'teacher' | 'parent'
    code: string
    expires_at: Date
  }) {
    const result = await query(
      `INSERT INTO school_invites (school_id, invited_by, email, role, code, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        invite.school_id,
        invite.invited_by,
        invite.email,
        invite.role,
        invite.code,
        invite.expires_at
      ]
    )
    return result.rows[0]
  },

  async useInvite(code: string, userId: string) {
    const result = await query(
      `UPDATE school_invites SET
        used_at = NOW(),
        used_by = $1
      WHERE code = $2 AND used_at IS NULL AND expires_at > NOW()
      RETURNING *`,
      [userId, code]
    )
    return result.rows[0]
  },

  async getInviteByCode(code: string) {
    const result = await query(
      `SELECT * FROM school_invites
       WHERE code = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [code]
    )
    return result.rows[0] || null
  },

  // =====================
  // STATISTICS
  // =====================
  async getQuestionStats(schoolId?: string | null) {
    let sql = `
      SELECT
        COUNT(*) as total,
        subject,
        grade
      FROM questions
      WHERE validation_status = 'approved'
    `
    const params: unknown[] = []

    if (schoolId) {
      sql += ' AND school_id = $1'
      params.push(schoolId)
    }

    sql += ' GROUP BY subject, grade'

    const result = await query(sql, params)

    const bySubject: Record<string, number> = {}
    const byGrade: Record<number, number> = {}
    let total = 0

    for (const row of result.rows) {
      const count = parseInt(row.total)
      total += count
      bySubject[row.subject] = (bySubject[row.subject] || 0) + count
      byGrade[row.grade] = (byGrade[row.grade] || 0) + count
    }

    return { total, bySubject, byGrade }
  },

  async getUserStats(schoolId: string) {
    const result = await query(
      `SELECT role, COUNT(*) as count
       FROM users
       WHERE school_id = $1
       GROUP BY role`,
      [schoolId]
    )

    const byRole: Record<string, number> = {}
    let total = 0

    for (const row of result.rows) {
      byRole[row.role] = parseInt(row.count)
      total += parseInt(row.count)
    }

    return { total, byRole }
  },
  // Get questions for specific school or global questions
  async getQuestions(schoolId: string | null, filters?: {
    subject?: string
    grade?: number
    language?: string
    isGlobal?: boolean // If true, get only global questions (school_id IS NULL)
  }) {
    console.log('🔍 DATABASE: Starting query with:', { schoolId, filters })

    let sql = 'SELECT * FROM questions WHERE 1=1'
    const params: unknown[] = []
    let paramCount = 1

    // Handle global questions vs school-specific questions
    if (filters?.isGlobal) {
      // Get only global questions (school_id IS NULL)
      sql += ' AND school_id IS NULL'
    } else if (schoolId) {
      // Get questions for specific school
      sql += ` AND school_id = $${paramCount++}`
      params.push(schoolId)
    }
    // If neither isGlobal nor schoolId, return all questions (for gameplay)

    if (filters?.subject) {
      sql += ` AND subject = $${paramCount++}`
      params.push(filters.subject)
    }
    if (filters?.grade) {
      sql += ` AND grade = $${paramCount++}`
      params.push(filters.grade)
    }
    if (filters?.language) {
      sql += ` AND language = $${paramCount++}`
      params.push(filters.language)
    }

    sql += ' ORDER BY created_at DESC'

    const result = await query(sql, params)
    console.log(`🔍 DATABASE: Found ${result.rowCount} questions`)

    return result.rows
  },

  // Add question to school (or global if schoolId is null)
  // For global questions, userId can be null
  async addQuestion(question: Record<string, unknown>, schoolId: string | null, userId: string | null) {
    const result = await query(
      `INSERT INTO questions (
        id, school_id, created_by, type, subject, grade, difficulty, language,
        question, statement, answers, correct_index, correct_answer, explanation,
        unit, image_url, tags, time_limit, lehrplan21_topic, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW())
      RETURNING *`,
      [
        question.id || crypto.randomUUID(),
        schoolId || null, // NULL for global questions
        userId || null, // NULL for global questions without specific creator
        question.type,
        question.subject,
        question.grade,
        question.difficulty,
        question.language,
        question.question || null,
        question.statement || null,
        question.answers ? (question.answers as string[]) : null,
        question.correctIndex ?? null,
        question.correctAnswer || null,
        question.explanation || null,
        question.unit || null,
        question.imageUrl || null,
        question.tags ? (question.tags as string[]) : [],
        question.timeLimit || 15000,
        question.lehrplan21Topic || null
      ]
    )

    return result.rows[0]
  },

  // Update question (supports global questions with NULL school_id)
  async updateQuestion(questionId: string, updates: Record<string, unknown>, schoolId: string | null) {
    // Build WHERE clause based on whether it's a global question
    // If schoolId is null, we match questions by ID only (for admin updates)
    const whereClause = schoolId
      ? 'id = $11 AND school_id = $12'
      : 'id = $11'

    const params: (string | number | string[] | null)[] = [
      updates.question !== undefined ? (updates.question as string | null) : null,
      updates.statement !== undefined ? (updates.statement as string | null) : null,
      updates.answers ? (updates.answers as string[]) : null,
      updates.correctIndex !== undefined ? (updates.correctIndex as number | null) : null,
      updates.correctAnswer !== undefined ? (updates.correctAnswer as string | null) : null,
      updates.explanation !== undefined ? (updates.explanation as string | null) : null,
      updates.difficulty !== undefined ? (updates.difficulty as string | null) : null,
      updates.tags !== undefined ? (updates.tags as string | null) : null,
      updates.grade !== undefined ? (updates.grade as number | null) : null,
      updates.subject !== undefined ? (updates.subject as string | null) : null,
      questionId
    ]

    if (schoolId) {
      params.push(schoolId)
    }

    const result = await query(
      `UPDATE questions SET
        question = COALESCE($1, question),
        statement = COALESCE($2, statement),
        answers = COALESCE($3, answers),
        correct_index = COALESCE($4, correct_index),
        correct_answer = COALESCE($5, correct_answer),
        explanation = COALESCE($6, explanation),
        difficulty = COALESCE($7, difficulty),
        tags = COALESCE($8, tags),
        grade = COALESCE($9, grade),
        subject = COALESCE($10, subject),
        updated_at = NOW()
      WHERE ${whereClause}
      RETURNING *`,
      params
    )

    return result.rows[0]
  },

  // Delete question (supports global questions with NULL school_id)
  async deleteQuestion(questionId: string, schoolId: string | null) {
    if (schoolId) {
      await query(
        'DELETE FROM questions WHERE id = $1 AND school_id = $2',
        [questionId, schoolId]
      )
    } else {
      await query(
        'DELETE FROM questions WHERE id = $1 AND school_id IS NULL',
        [questionId]
      )
    }
  },

  // Bulk import questions
  async bulkImportQuestions(questions: Record<string, unknown>[], schoolId: string, userId: string) {
    const results = []

    for (const q of questions) {
      const result = await this.addQuestion(q, schoolId, userId)
      results.push(result)
    }

    return results
  }
}
