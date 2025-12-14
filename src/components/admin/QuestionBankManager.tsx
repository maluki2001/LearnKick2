'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Question, QuestionType, Subject, Language, SubjectData } from '@/types/questions'
import { subjectsService } from '@/lib/subjects'
import { questionBank } from '@/lib/questionBank'
import { Download, Upload, Search, Plus, Edit, Trash2, CheckSquare, Square, X, Save, ImageIcon } from 'lucide-react'
import { useAdminLanguage } from '@/contexts/AdminLanguageContext'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface QuestionBankManagerProps {
  // No props needed for full-page version
}

interface QuestionFilters {
  subject: Subject | 'all'
  grade: number | 'all'
  difficulty: number | 'all'
  type: QuestionType | 'all'
  language: Language | 'all'
  search: string
}

const DEFAULT_FILTERS: QuestionFilters = {
  subject: 'all',
  grade: 'all',
  difficulty: 'all',
  type: 'all',
  language: 'all',
  search: ''
}

// Helper type for building questions (allows all possible properties from union types)
type QuestionBuilder = Partial<{
  id: string
  type: QuestionType
  subject: Subject
  grade: 1|2|3|4|5|6
  difficulty: 1|2|3|4|5
  language: Language
  timeLimit: number
  tags: string[]
  question: string
  statement: string
  answers: string[] | undefined
  correct: boolean
  correctIndex: number
  correctAnswer: number | string
  explanation: string
  unit: string
  imageUrl: string
  lehrplan21Topic: string
  createdAt: string
  updatedAt: string
}>

interface QuestionBankManagerProps {
  schoolId?: string | null
  userId?: string
  isGlobal?: boolean
}

export function QuestionBankManager({ schoolId, userId, isGlobal = false }: QuestionBankManagerProps) {
  const { t } = useAdminLanguage()
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [filters, setFilters] = useState<QuestionFilters>(DEFAULT_FILTERS)
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [availableSubjects, setAvailableSubjects] = useState<SubjectData[]>([])
  const [importStatus, setImportStatus] = useState<{
    isImporting: boolean
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

  const questionsPerPage = 20

  useEffect(() => {
    loadQuestions()
    loadSubjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId, isGlobal])

  const loadSubjects = async () => {
    try {
      // For global questions mode, load all global subjects
      // For school-specific mode, load school + global subjects
      const subjects = await subjectsService.getSubjects(isGlobal ? undefined : (schoolId ?? undefined))
      setAvailableSubjects(subjects)
    } catch (error) {
      console.error('Error loading subjects:', error)
    }
  }

  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, filters])

  const loadQuestions = async () => {
    setIsLoading(true)
    try {
      // Use API to fetch questions directly from database
      // For global questions (isGlobal=true), fetch questions with school_id IS NULL
      // For school-specific questions, fetch questions for the specific school
      const params = new URLSearchParams()

      if (isGlobal) {
        params.append('isGlobal', 'true')
      } else if (schoolId) {
        params.append('schoolId', schoolId)
      }

      console.log(`📡 Loading questions: ${isGlobal ? 'GLOBAL' : `school=${schoolId}`}`)

      const response = await fetch(`/api/questions?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        // Convert API response to Question type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbQuestions: Question[] = (result.questions || []).map((dbQ: any) => ({
          id: dbQ.id,
          type: dbQ.type as QuestionType,
          subject: dbQ.subject as Subject,
          grade: dbQ.grade,
          difficulty: dbQ.difficulty,
          language: dbQ.language as Language,
          question: dbQ.question,
          statement: dbQ.statement,
          answers: dbQ.answers || [],
          correctIndex: dbQ.correct_index || 0,
          correctAnswer: dbQ.correct_answer,
          explanation: dbQ.explanation,
          unit: dbQ.unit,
          imageUrl: dbQ.image_url,
          tags: dbQ.tags || [],
          timeLimit: dbQ.time_limit || 15000,
          lehrplan21Topic: dbQ.lehrplan21_topic,
          createdAt: dbQ.created_at,
          updatedAt: dbQ.updated_at
        }))

        console.log(`✅ Loaded ${dbQuestions.length} questions from database`)
        setQuestions(dbQuestions)
      } else {
        console.error('Failed to load questions:', result.error)
        // Fall back to offline storage
        const allQuestions = await questionBank.getAllQuestions()
        setQuestions(allQuestions)
      }
    } catch (error) {
      console.error('Failed to load questions:', error)
      // Fall back to offline storage
      const allQuestions = await questionBank.getAllQuestions()
      setQuestions(allQuestions)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...questions]

    // Apply filters
    if (filters.subject !== 'all') {
      filtered = filtered.filter(q => q.subject === filters.subject)
    }
    if (filters.grade !== 'all') {
      filtered = filtered.filter(q => q.grade === filters.grade)
    }
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === filters.difficulty)
    }
    if (filters.type !== 'all') {
      filtered = filtered.filter(q => q.type === filters.type)
    }
    if (filters.language !== 'all') {
      filtered = filtered.filter(q => q.language === filters.language)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(q =>
        ('question' in q && q.question?.toLowerCase().includes(searchLower)) ||
        ('statement' in q && q.statement?.toLowerCase().includes(searchLower)) ||
        ('answers' in q && q.answers?.some(a => a.toLowerCase().includes(searchLower)))
      )
    }

    setFilteredQuestions(filtered)
    setCurrentPage(1)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (key: keyof QuestionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSelectQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestions)
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId)
    } else {
      newSelected.add(questionId)
    }
    setSelectedQuestions(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedQuestions.size === filteredQuestions.length) {
      setSelectedQuestions(new Set())
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map(q => q.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedQuestions.size === 0) return

    if (confirm(`Are you sure you want to delete ${selectedQuestions.size} selected questions? This cannot be undone.`)) {
      setIsLoading(true)
      try {
        for (const questionId of selectedQuestions) {
          // Use API for deletion with global support
          const params = new URLSearchParams()
          params.append('questionId', questionId)
          if (isGlobal) {
            params.append('isGlobal', 'true')
          } else if (schoolId) {
            params.append('schoolId', schoolId)
          }

          const response = await fetch(`/api/questions?${params.toString()}`, {
            method: 'DELETE'
          })

          const result = await response.json()
          if (!result.success) {
            console.error(`Failed to delete question ${questionId}:`, result.error)
          }
        }
        await loadQuestions()
        setSelectedQuestions(new Set())
      } catch (error) {
        console.error('Failed to delete questions:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleExportCSV = () => {
    const questionsToExport = selectedQuestions.size > 0
      ? questions.filter(q => selectedQuestions.has(q.id))
      : filteredQuestions

    const csvContent = generateCSV(questionsToExport)
    downloadCSV(csvContent, `questions-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const generateCSV = (questionsToExport: Question[]): string => {
    const headers = [
      'ID',
      'Type',
      'Subject',
      'Grade',
      'Difficulty',
      'Language',
      'Question',
      'Statement',
      'Answer A',
      'Answer B', 
      'Answer C',
      'Answer D',
      'Correct Index',
      'Correct Answer',
      'Explanation',
      'Unit',
      'Image URL',
      'Tags',
      'Created At',
      'Updated At'
    ]

    const rows = questionsToExport.map(q => [
      q.id,
      q.type,
      q.subject,
      q.grade,
      q.difficulty,
      q.language,
      ('question' in q ? q.question : '') || '',
      ('statement' in q ? q.statement : '') || '',
      ('answers' in q ? q.answers?.[0] : '') || '',
      ('answers' in q ? q.answers?.[1] : '') || '',
      ('answers' in q ? q.answers?.[2] : '') || '',
      ('answers' in q ? q.answers?.[3] : '') || '',
      ('correctIndex' in q ? q.correctIndex : '') ?? '',
      ('correctAnswer' in q ? q.correctAnswer : '') ?? '',
      q.explanation || '',
      ('unit' in q ? q.unit : '') || '',
      ('imageUrl' in q ? q.imageUrl : '') || '',
      q.tags?.join(';') || '',
      ('createdAt' in q ? q.createdAt : '') || '',
      ('updatedAt' in q ? q.updatedAt : '') || ''
    ])

    return [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n')
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setImportStatus({
        isImporting: false,
        message: 'No file selected. Please choose a CSV file to import.',
        type: 'error'
      })
      setTimeout(() => setImportStatus(null), 3000)
      return
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportStatus({
        isImporting: false,
        message: 'Please select a valid CSV file (.csv extension required).',
        type: 'error'
      })
      setTimeout(() => setImportStatus(null), 3000)
      return
    }

    setImportStatus({
      isImporting: true,
      message: `Processing ${file.name}...`,
      type: 'info'
    })

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const csv = e.target?.result as string
        const importedQuestions = parseCSV(csv)
        
        setImportStatus({
          isImporting: true,
          message: `Importing ${importedQuestions.length} questions...`,
          type: 'info'
        })

        setIsLoading(true)
        let successCount = 0
        let errorCount = 0
        const errors: string[] = []

        for (const question of importedQuestions) {
          try {
            // Use API directly for importing questions with global support
            const response = await fetch('/api/questions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                question,
                schoolId: isGlobal ? null : schoolId,
                userId,
                isGlobal
              })
            })

            const result = await response.json()

            if (result.success) {
              successCount++
            } else {
              errorCount++
              const questionText = 'statement' in question ? question.statement : question.question
              errors.push(`Question "${questionText}": ${result.error}`)
            }

            // Update progress
            setImportStatus({
              isImporting: true,
              message: `Importing... ${successCount + errorCount}/${importedQuestions.length} processed`,
              type: 'info'
            })
          } catch (error) {
            errorCount++
            const errorQuestionText = 'statement' in question ? question.statement : question.question
            errors.push(`Question "${errorQuestionText}": ${error}`)
            console.error('Failed to import question:', question.id, error)
          }
        }

        const message = `Import completed!\n✅ ${successCount} questions imported successfully\n${errorCount > 0 ? `❌ ${errorCount} questions failed` : ''}`
        
        setImportStatus({
          isImporting: false,
          message,
          type: successCount > 0 ? 'success' : 'error'
        })

        if (errorCount > 0 && errorCount < 5) {
          console.log('Import errors:', errors)
        }

        await loadQuestions()
        
        // Clear status after 5 seconds
        setTimeout(() => setImportStatus(null), 5000)
      } catch (error) {
        console.error('CSV parsing error:', error)
        setImportStatus({
          isImporting: false,
          message: 'Failed to parse CSV file. Please check the format and try again.',
          type: 'error'
        })
        setTimeout(() => setImportStatus(null), 5000)
      } finally {
        setIsLoading(false)
      }
    }
    reader.readAsText(file)
    
    // Reset input
    event.target.value = ''
  }

  const parseCSV = (csv: string): Question[] => {
    const lines = csv.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())

    return lines.slice(1).map((line, index) => {
      const values = parseCSVLine(line)
      const question: QuestionBuilder = {}

      headers.forEach((header, i) => {
        const value = values[i]?.replace(/"/g, '').trim()
        if (!value) return

        const lowerHeader = header.toLowerCase().trim()
        
        switch (lowerHeader) {
          case 'id':
            question.id = value || `imported-${Date.now()}-${index}`
            break
          case 'type':
            question.type = value as QuestionType
            break
          case 'subject':
            question.subject = value as Subject
            break
          case 'grade':
            question.grade = parseInt(value) as 1|2|3|4|5|6
            break
          case 'difficulty':
            question.difficulty = parseInt(value) as 1|2|3|4|5
            break
          case 'language':
            question.language = value as Language
            break
          case 'question':
            question.question = value
            break
          case 'statement':
            question.statement = value
            break
          case 'answer a':
          case 'answer b':
          case 'answer c':
          case 'answer d':
            if (!question.answers) question.answers = []
            const answerIndex = lowerHeader.charCodeAt(7) - 97 // 'a' = 0, 'b' = 1, etc.
            question.answers[answerIndex] = value
            break
          case 'correct index':
            // Handle both integer and decimal values
            const correctIdx = parseFloat(value)
            if (!isNaN(correctIdx)) {
              question.correctIndex = Math.floor(correctIdx)
            }
            break
          case 'correct answer':
            question.correctAnswer = value
            break
          case 'explanation':
            question.explanation = value
            break
          case 'unit':
            question.unit = value
            break
          case 'image url':
            question.imageUrl = value
            break
          case 'tags':
            question.tags = value.split(';').filter(Boolean)
            break
          case 'created at':
            question.createdAt = value
            break
          case 'updated at':
            question.updatedAt = value
            break
        }
      })

      // Ensure required fields and handle special cases
      question.id = question.id || `imported-${Date.now()}-${index}`
      
      // Set default timestamps if not provided
      if (!question.createdAt) {
        question.createdAt = new Date().toISOString()
      }
      if (!question.updatedAt) {
        question.updatedAt = new Date().toISOString()
      }
      
      // Set default time limit
      question.timeLimit = question.timeLimit || 15000
      
      // Handle true-false questions - clean up answers array
      if (question.type === 'true-false') {
        question.answers = undefined
        // For true-false, correct answer should be "True" or "False"
        if (!question.correctAnswer) {
          question.correctAnswer = "True" // default fallback
        }
      }
      
      // Handle number-input questions
      if (question.type === 'number-input') {
        question.answers = undefined
        // correctAnswer should contain the numeric answer
      }
      
      // Handle multiple-choice questions
      if (question.type === 'multiple-choice' && question.answers) {
        // Filter out empty answers
        question.answers = question.answers.filter(answer => answer && answer.trim())
        
        // Ensure we have a valid correctIndex
        if (question.correctIndex !== undefined && question.correctIndex < question.answers.length) {
          question.correctAnswer = question.answers[question.correctIndex]
        }
      }

      return question as Question
    })
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    result.push(current)
    return result
  }

  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  )

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage)

  // Handle question creation
  const handleCreateQuestion = async (questionData: QuestionBuilder) => {
    try {
      setIsLoading(true)
      // Don't include ID - let the server generate a UUID
      const newQuestion: Omit<Question, 'id'> = {
        type: questionData.type || 'multiple-choice',
        subject: questionData.subject || 'general-knowledge',
        grade: questionData.grade || 1,
        difficulty: questionData.difficulty || 1,
        timeLimit: questionData.timeLimit || 15000,
        language: questionData.language || 'de',
        tags: questionData.tags || [],
        question: questionData.question,
        statement: questionData.statement,
        answers: questionData.answers,
        correctIndex: questionData.correctIndex,
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        unit: questionData.unit,
        imageUrl: questionData.imageUrl
      } as Omit<Question, 'id'>

      // Use API directly for creating questions
      // For global questions (isGlobal=true), set schoolId to null
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newQuestion,
          schoolId: isGlobal ? null : schoolId,
          userId,
          isGlobal
        })
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Question created successfully:', result.question?.id)
        await loadQuestions()
        setShowAddForm(false)
      } else {
        console.error('❌ Failed to create question:', result.error)
        alert(`Failed to create question: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Error creating question:', error)
      alert(`Error creating question: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">{t.questionBankManager}</h2>
        <p className="text-muted-foreground">{t.manageContent}</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col min-h-[800px]">

        <div className="flex flex-1 min-h-0">
          {/* Filters Sidebar */}
          <div className="bg-muted p-4 w-80 border-r border-border overflow-y-auto flex-shrink-0">
            <h3 className="text-lg font-bold mb-4 text-foreground">{t.filtersAndSearch}</h3>

            {/* Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                {t.searchQuestions}
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder={t.searchPlaceholder || 'Search questions...'}
                className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:border-primary focus:outline-none"
              />
            </div>

            {/* Subject Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">{t.subject}</label>
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:border-primary focus:outline-none"
              >
                <option value="all">{t.allSubjects}</option>
                {availableSubjects.map((subject) => (
                  <option key={subject.id} value={subject.slug}>
                    {subject.icon} {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">{t.grade}</label>
              <select
                value={filters.grade}
                onChange={(e) => handleFilterChange('grade', e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:border-primary focus:outline-none"
              >
                <option value="all">{t.allGrades}</option>
                <option value="1">{t.gradeLabel} 1</option>
                <option value="2">{t.gradeLabel} 2</option>
                <option value="3">{t.gradeLabel} 3</option>
                <option value="4">{t.gradeLabel} 4</option>
                <option value="5">{t.gradeLabel} 5</option>
                <option value="6">{t.gradeLabel} 6</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">{t.difficulty}</label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:border-primary focus:outline-none"
              >
                <option value="all">{t.allDifficulties}</option>
                <option value="1">{t.veryEasy}</option>
                <option value="2">{t.easy}</option>
                <option value="3">{t.medium}</option>
                <option value="4">{t.hard}</option>
                <option value="5">{t.veryHard}</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">{t.questionType}</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:border-primary focus:outline-none"
              >
                <option value="all">{t.allTypes}</option>
                <option value="multiple-choice">{t.multipleChoice}</option>
                <option value="true-false">{t.trueFalse}</option>
                <option value="number-input">{t.numberInput}</option>
                <option value="image-question">{t.imageQuestion}</option>
              </select>
            </div>

            {/* Language Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">{t.language}</label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:border-primary focus:outline-none"
              >
                <option value="all">{t.allLanguages}</option>
                <option value="en">{t.languages?.en}</option>
                <option value="de">{t.languages?.de}</option>
                <option value="fr">{t.languages?.fr}</option>
              </select>
            </div>

            {/* Bulk Actions */}
            <div className="border-t border-border pt-4">
              <h4 className="font-bold mb-3 text-foreground">{t.bulkActions}</h4>
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                  id="csv-import"
                />
                <button
                  onClick={() => document.getElementById('csv-import')?.click()}
                  disabled={importStatus?.isImporting}
                  className={`w-full px-3 py-2 text-sm font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center ${
                    importStatus?.isImporting
                      ? 'bg-primary/20 text-primary cursor-not-allowed'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {importStatus?.isImporting ? (
                    <div className="w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {importStatus?.isImporting ? t.importing : t.importCSV}
                </button>

                {importStatus && (
                  <div className={`p-3 rounded-lg border text-sm ${
                    importStatus.type === 'success'
                      ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400'
                      : importStatus.type === 'error'
                      ? 'bg-destructive/10 border-destructive/20 text-destructive'
                      : 'bg-primary/10 border-primary/20 text-primary'
                  }`}>
                    <div className="whitespace-pre-line">{importStatus.message}</div>
                    {!importStatus.isImporting && (
                      <button
                        onClick={() => setImportStatus(null)}
                        className="mt-2 text-xs underline hover:no-underline"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleExportCSV}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.exportCSV}
                </Button>

                {selectedQuestions.size > 0 && (
                  <Button
                    onClick={handleBulkDelete}
                    variant="secondary"
                    size="sm"
                    className="w-full bg-red-100 text-red-800 hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t.deleteSelected} ({selectedQuestions.size})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Toolbar */}
            <div className="bg-card p-4 border-b border-border flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-muted-foreground">
                    {t.showingQuestions} {filteredQuestions.length} {t.of} {questions.length} {t.questions}
                  </div>
                  {filteredQuestions.length > 0 && (
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center text-sm text-primary hover:text-primary/80"
                    >
                      {selectedQuestions.size === filteredQuestions.length ? (
                        <CheckSquare className="w-4 h-4 mr-1" />
                      ) : (
                        <Square className="w-4 h-4 mr-1" />
                      )}
                      {t.selectAll}
                    </button>
                  )}
                </div>

                <Button
                  onClick={() => setShowAddForm(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t.addQuestion}
                </Button>
              </div>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-muted-foreground">{t.loadingQuestions}</span>
                </div>
              ) : paginatedQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{t.noQuestionsFound}</h3>
                  <p className="text-muted-foreground">{t.adjustFilters}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedQuestions.map((question) => (
                    <div
                      key={question.id}
                      className={`bg-card border-2 rounded-lg p-4 hover:shadow-md transition-all ${
                        selectedQuestions.has(question.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <button
                          onClick={() => handleSelectQuestion(question.id)}
                          className="mt-1"
                        >
                          {selectedQuestions.has(question.id) ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                              {question.subject}
                            </span>
                            <span className="inline-block bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-medium">
                              Grade {question.grade}
                            </span>
                            <span className="inline-block bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded text-xs font-medium">
                              {'⭐'.repeat(question.difficulty)}
                            </span>
                            <span className="inline-block bg-purple-500/10 text-purple-700 dark:text-purple-400 px-2 py-1 rounded text-xs font-medium">
                              {question.type}
                            </span>
                            <span className="inline-block bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs font-medium">
                              {question.language.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="text-foreground font-medium mb-2 line-clamp-2">
                            {'statement' in question ? question.statement : question.question}
                          </div>
                          
                          {'answers' in question && question.answers && (
                            <div className="text-sm text-muted-foreground mb-2">
                              <strong>Answers:</strong> {question.answers.join(' | ')}
                              {'correctIndex' in question && question.correctIndex !== undefined && (
                                <span className="text-green-600 dark:text-green-400 ml-2">
                                  (Correct: {String.fromCharCode(65 + question.correctIndex)})
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground">
                            ID: {question.id} | Created: {'createdAt' in question && question.createdAt ? new Date(question.createdAt as string).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => setEditingQuestion(question)}
                            size="sm"
                            variant="secondary"
                            className="p-2"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-card border-t border-border p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {t.page} {currentPage} {t.of} {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      size="sm"
                      variant="secondary"
                    >
                      {t.previous}
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      size="sm"
                      variant="secondary"
                    >
                      {t.next}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Question Modal */}
      <AnimatePresence>
        {showAddForm && (
          <AddQuestionModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onSave={handleCreateQuestion}
            availableSubjects={availableSubjects}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Add Question Modal Component
interface AddQuestionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (questionData: QuestionBuilder) => void
  availableSubjects: SubjectData[]
}

function AddQuestionModal({ isOpen, onClose, onSave, availableSubjects }: AddQuestionModalProps) {
  const { t } = useAdminLanguage()
  const [questionType, setQuestionType] = useState<QuestionType>('multiple-choice')
  const [formData, setFormData] = useState({
    subject: availableSubjects.length > 0 ? availableSubjects[0].slug : 'general-knowledge' as Subject,
    grade: 1 as number,
    difficulty: 1 as number,
    timeLimit: 30,
    language: 'en' as Language,
    tags: '',
    
    // Multiple Choice / Image Question
    question: '',
    answers: ['', '', '', ''],
    correctIndex: 0,
    
    // True/False
    statement: '',
    correct: true,
    
    // Number Input
    correctAnswer: 0,
    tolerance: 0,
    unit: '',
    
    // Image Question
    imageUrl: '',
    
    // Common
    explanation: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Common validations
    if (formData.timeLimit < 5 || formData.timeLimit > 300) {
      newErrors.timeLimit = 'Time limit must be between 5 and 300 seconds'
    }

    // Type-specific validations
    switch (questionType) {
      case 'multiple-choice':
        if (!formData.question.trim()) {
          newErrors.question = 'Question is required'
        }
        if (formData.answers.some(answer => !answer.trim())) {
          newErrors.answers = 'All answer options are required'
        }
        if (formData.answers.filter(answer => answer.trim()).length < 2) {
          newErrors.answers = 'At least two answers are required'
        }
        break

      case 'true-false':
        if (!formData.statement.trim()) {
          newErrors.statement = 'Statement is required'
        }
        break

      case 'number-input':
        if (!formData.question.trim()) {
          newErrors.question = 'Question is required'
        }
        if (isNaN(formData.correctAnswer)) {
          newErrors.correctAnswer = 'Valid number is required'
        }
        break

      case 'image-question':
        if (!formData.question.trim()) {
          newErrors.question = 'Question is required'
        }
        if (!formData.imageUrl.trim()) {
          newErrors.imageUrl = 'Image URL is required'
        }
        if (formData.answers.some(answer => !answer.trim())) {
          newErrors.answers = 'All answer options are required'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const questionData: QuestionBuilder = {
      type: questionType,
      subject: formData.subject,
      grade: formData.grade as 1|2|3|4|5|6,
      difficulty: formData.difficulty as 1|2|3|4|5,
      timeLimit: formData.timeLimit,
      language: formData.language,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      explanation: formData.explanation || undefined
    }

    // Add type-specific data
    switch (questionType) {
      case 'multiple-choice':
        Object.assign(questionData, {
          question: formData.question,
          answers: formData.answers.filter(answer => answer.trim()),
          correctIndex: formData.correctIndex
        })
        break

      case 'true-false':
        Object.assign(questionData, {
          statement: formData.statement,
          correct: formData.correct
        })
        break

      case 'number-input':
        Object.assign(questionData, {
          question: formData.question,
          correctAnswer: formData.correctAnswer,
          tolerance: formData.tolerance || undefined,
          unit: formData.unit || undefined
        })
        break

      case 'image-question':
        Object.assign(questionData, {
          question: formData.question,
          imageUrl: formData.imageUrl,
          answers: formData.answers.filter(answer => answer.trim()),
          correctIndex: formData.correctIndex
        })
        break
    }

    onSave(questionData)
  }

  const resetForm = () => {
    setFormData({
      subject: 'general-knowledge',
      grade: 1,
      difficulty: 1,
      timeLimit: 30,
      language: 'en',
      tags: '',
      question: '',
      answers: ['', '', '', ''],
      correctIndex: 0,
      statement: '',
      correct: true,
      correctAnswer: 0,
      tolerance: 0,
      unit: '',
      imageUrl: '',
      explanation: ''
    })
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Add New Question</h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Question Type Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Question Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { type: 'multiple-choice', label: 'Multiple Choice', icon: '📝' },
                  { type: 'true-false', label: 'True/False', icon: '✅' },
                  { type: 'number-input', label: 'Number Input', icon: '🔢' },
                  { type: 'image-question', label: 'Image Question', icon: '🖼️' }
                ].map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => setQuestionType(type as QuestionType)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      questionType === type
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div className="text-2xl mb-2">{icon}</div>
                    <div className="text-sm font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value as Subject })}
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {availableSubjects.map((subject) => (
                    <option key={subject.id} value={subject.slug}>
                      {subject.icon} {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Grade *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {[1, 2, 3, 4, 5, 6].map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Difficulty *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {[1, 2, 3, 4, 5].map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      Level {difficulty} {difficulty <= 2 ? '(Easy)' : difficulty <= 3 ? '(Medium)' : '(Hard)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Time Limit (seconds) *
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.timeLimit ? 'border-destructive' : 'border-border'
                  }`}
                />
                {errors.timeLimit && (
                  <p className="text-sm text-destructive mt-1">{errors.timeLimit}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Language *
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value as Language })}
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="en">English</option>
                  <option value="de">German</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="math, algebra, equations"
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Question Type Specific Fields */}
            {questionType === 'multiple-choice' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Question *
                  </label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.question ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="Enter your question here..."
                  />
                  {errors.question && (
                    <p className="text-sm text-destructive mt-1">{errors.question}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Answer Options *
                  </label>
                  <div className="space-y-3">
                    {formData.answers.map((answer, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={formData.correctIndex === index}
                          onChange={() => setFormData({ ...formData, correctIndex: index })}
                          className="text-blue-600"
                        />
                        <input
                          type="text"
                          value={answer}
                          onChange={(e) => {
                            const newAnswers = [...formData.answers]
                            newAnswers[index] = e.target.value
                            setFormData({ ...formData, answers: newAnswers })
                          }}
                          placeholder={`Answer ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <span className="text-sm text-muted-foreground min-w-[80px]">
                          {formData.correctIndex === index ? '✓ Correct' : 'Option'}
                        </span>
                      </div>
                    ))}
                  </div>
                  {errors.answers && (
                    <p className="text-sm text-destructive mt-1">{errors.answers}</p>
                  )}
                </div>
              </div>
            )}

            {questionType === 'true-false' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Statement *
                  </label>
                  <textarea
                    value={formData.statement}
                    onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.statement ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="Enter a statement that can be true or false..."
                  />
                  {errors.statement && (
                    <p className="text-sm text-destructive mt-1">{errors.statement}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Correct Answer *
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="truefalse"
                        checked={formData.correct === true}
                        onChange={() => setFormData({ ...formData, correct: true })}
                        className="text-green-600 mr-2"
                      />
                      <span className="text-green-600 dark:text-green-400 font-medium">True</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="truefalse"
                        checked={formData.correct === false}
                        onChange={() => setFormData({ ...formData, correct: false })}
                        className="text-red-600 mr-2"
                      />
                      <span className="text-destructive font-medium">False</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {questionType === 'number-input' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Question *
                  </label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.question ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="Enter your question here..."
                  />
                  {errors.question && (
                    <p className="text-sm text-destructive mt-1">{errors.question}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Correct Answer *
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.correctAnswer}
                      onChange={(e) => setFormData({ ...formData, correctAnswer: Number(e.target.value) })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.correctAnswer ? 'border-destructive' : 'border-border'
                      }`}
                    />
                    {errors.correctAnswer && (
                      <p className="text-sm text-destructive mt-1">{errors.correctAnswer}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tolerance (optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.tolerance}
                      onChange={(e) => setFormData({ ...formData, tolerance: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="±0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Unit (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="cm, kg, °C"
                    />
                  </div>
                </div>
              </div>
            )}

            {questionType === 'image-question' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Image URL *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.imageUrl ? 'border-destructive' : 'border-border'
                      }`}
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      className="px-3 py-2 border border-border rounded-lg hover:bg-muted"
                      title="Upload image"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  </div>
                  {errors.imageUrl && (
                    <p className="text-sm text-destructive mt-1">{errors.imageUrl}</p>
                  )}
                  {formData.imageUrl && (
                    <div className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="max-w-xs max-h-32 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Question *
                  </label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.question ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="What do you see in this image?"
                  />
                  {errors.question && (
                    <p className="text-sm text-destructive mt-1">{errors.question}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Answer Options *
                  </label>
                  <div className="space-y-3">
                    {formData.answers.map((answer, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={formData.correctIndex === index}
                          onChange={() => setFormData({ ...formData, correctIndex: index })}
                          className="text-blue-600"
                        />
                        <input
                          type="text"
                          value={answer}
                          onChange={(e) => {
                            const newAnswers = [...formData.answers]
                            newAnswers[index] = e.target.value
                            setFormData({ ...formData, answers: newAnswers })
                          }}
                          placeholder={`Answer ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <span className="text-sm text-muted-foreground min-w-[80px]">
                          {formData.correctIndex === index ? '✓ Correct' : 'Option'}
                        </span>
                      </div>
                    ))}
                  </div>
                  {errors.answers && (
                    <p className="text-sm text-destructive mt-1">{errors.answers}</p>
                  )}
                </div>
              </div>
            )}

            {/* Explanation (Common for all types) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Explanation
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Provide an explanation for the correct answer..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted">
          <Button onClick={handleClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            Create Question
          </Button>
        </div>
      </motion.div>
    </div>
  )
}