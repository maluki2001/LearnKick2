// Legacy type for backward compatibility
export type Subject = 'math' | 'geography' | 'language' | 'general-knowledge' | 'science' | 'history' | 'art' | string

// New dynamic subject interface
export interface SubjectData {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  description?: string
  school_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Type for creating new subjects (omits auto-generated fields, makes some optional)
export type CreateSubjectData = Omit<SubjectData, 'id' | 'created_at' | 'updated_at' | 'is_active'> & { is_active?: boolean }
export type Language = 'de' | 'en' | 'fr'
export type Grade = 1 | 2 | 3 | 4 | 5 | 6
export type Difficulty = 1 | 2 | 3 | 4 | 5
export type QuestionType = 'multiple-choice' | 'true-false' | 'number-input' | 'image-question'

export interface QuestionBase {
  id: string
  subject: Subject
  grade: Grade
  difficulty: Difficulty
  timeLimit: number
  language: Language
  tags: string[]
  lehrplan21Topic?: string
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple-choice'
  question: string
  answers: string[]
  correctIndex: number
  explanation?: string
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'true-false'
  statement: string
  correct: boolean
  explanation?: string
}

export interface NumberInputQuestion extends QuestionBase {
  type: 'number-input'
  question: string
  correctAnswer: number
  tolerance?: number
  unit?: string
  explanation?: string
}

export interface ImageQuestion extends QuestionBase {
  type: 'image-question'
  question: string
  imageUrl: string
  answers: string[]
  correctIndex: number
  explanation?: string
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | NumberInputQuestion | ImageQuestion

export interface QuestionPack {
  id: string
  name: string
  description: string
  subject: Subject
  grade: Grade
  language: Language
  questions: Question[]
  version: string
  createdAt: string
  updatedAt: string
}

export interface QuestionFilter {
  subject?: Subject
  grade?: Grade
  difficulty?: Difficulty
  language?: Language
  tags?: string[]
}