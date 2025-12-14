'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Question, QuestionType, Subject, Language, Grade, Difficulty } from '@/types/questions'
import { Save, X, Plus, Trash2, Upload } from 'lucide-react'

// Helper type for building questions (allows all possible properties from union types)
type QuestionFormData = Partial<{
  id: string
  type: QuestionType
  subject: Subject
  grade: Grade
  difficulty: Difficulty
  language: Language
  timeLimit: number
  tags: string[]
  question: string
  statement: string
  answers: string[]
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

interface QuestionFormProps {
  question?: Question | null
  onSave: (question: Question) => Promise<void>
  onCancel: () => void
  isOpen: boolean
}

export function QuestionForm({ question, onSave, onCancel, isOpen }: QuestionFormProps) {
  const [formData, setFormData] = useState<QuestionFormData>({
    type: 'multiple-choice',
    subject: 'math',
    grade: 3,
    difficulty: 3,
    language: 'en',
    question: '',
    answers: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
    tags: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (question) {
      setFormData({
        ...question,
        answers: ('answers' in question ? question.answers : null) || ['', '', '', ''],
        tags: question.tags || []
      })
    }
  }, [question])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (field: keyof QuestionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...(formData.answers || [])]
    newAnswers[index] = value
    handleInputChange('answers', newAnswers)
  }

  const addAnswer = () => {
    const newAnswers = [...(formData.answers || []), '']
    handleInputChange('answers', newAnswers)
  }

  const removeAnswer = (index: number) => {
    const newAnswers = (formData.answers || []).filter((_, i) => i !== index)
    handleInputChange('answers', newAnswers)
    
    // Adjust correct index if necessary
    if (formData.correctIndex !== undefined && formData.correctIndex >= newAnswers.length) {
      handleInputChange('correctIndex', Math.max(0, newAnswers.length - 1))
    }
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags?.includes(tag.trim())) {
      handleInputChange('tags', [...(formData.tags || []), tag.trim()])
    }
  }

  const removeTag = (index: number) => {
    const newTags = (formData.tags || []).filter((_, i) => i !== index)
    handleInputChange('tags', newTags)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.question && !formData.statement) {
      newErrors.question = 'Question or statement is required'
    }

    if (formData.type === 'multiple-choice' || formData.type === 'image-question') {
      if (!formData.answers || formData.answers.length < 2) {
        newErrors.answers = 'At least 2 answer options are required'
      } else if (formData.answers.some(a => !a.trim())) {
        newErrors.answers = 'All answer options must be filled'
      }
      
      if (formData.correctIndex === undefined || formData.correctIndex < 0 || formData.correctIndex >= (formData.answers?.length || 0)) {
        newErrors.correctIndex = 'Valid correct answer must be selected'
      }
    }

    if (formData.type === 'number-input' && !formData.correctAnswer) {
      newErrors.correctAnswer = 'Correct answer is required for number input questions'
    }

    if (formData.type === 'image-question' && !formData.imageUrl) {
      newErrors.imageUrl = 'Image URL is required for image questions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const questionData: Question = {
        ...formData,
        id: formData.id || `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: formData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Question

      await onSave(questionData)
      
      // Reset form if it's a new question
      if (!question) {
        setFormData({
          type: 'multiple-choice',
          subject: 'math',
          grade: 3,
          difficulty: 3,
          language: 'en',
          question: '',
          answers: ['', '', '', ''],
          correctIndex: 0,
          explanation: '',
          tags: []
        })
      }
    } catch (error) {
      console.error('Failed to save question:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real app, you would upload to a cloud service
    // For now, we'll create a data URL
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      handleInputChange('imageUrl', dataUrl)
    }
    reader.readAsDataURL(file)
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-card rounded-xl shadow-2xl w-[90vw] h-[90vh] overflow-hidden flex flex-col max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-green-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  {question ? '✏️ Edit Question' : '➕ Add New Question'}
                </h2>
                <p className="text-green-100 mt-1">
                  {question ? 'Modify existing question' : 'Create educational content'}
                </p>
              </div>
              <Button
                type="button"
                onClick={onCancel}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Question Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as QuestionType)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:outline-none bg-background text-foreground"
                  required
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                  <option value="number-input">Number Input</option>
                  <option value="image-question">Image Question</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value as Subject)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:outline-none bg-background text-foreground"
                  required
                >
                  <option value="math">Mathematics</option>
                  <option value="geography">Geography</option>
                  <option value="language">Language</option>
                  <option value="general-knowledge">General Knowledge</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Grade *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', parseInt(e.target.value) as 1|2|3|4|5|6)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:outline-none bg-background text-foreground"
                  required
                >
                  <option value="1">Grade 1 (Age 6-7)</option>
                  <option value="2">Grade 2 (Age 7-8)</option>
                  <option value="3">Grade 3 (Age 8-9)</option>
                  <option value="4">Grade 4 (Age 9-10)</option>
                  <option value="5">Grade 5 (Age 10-11)</option>
                  <option value="6">Grade 6 (Age 11-12)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Difficulty *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', parseInt(e.target.value) as 1|2|3|4|5)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:outline-none bg-background text-foreground"
                  required
                >
                  <option value="1">⭐ Very Easy</option>
                  <option value="2">⭐⭐ Easy</option>
                  <option value="3">⭐⭐⭐ Medium</option>
                  <option value="4">⭐⭐⭐⭐ Hard</option>
                  <option value="5">⭐⭐⭐⭐⭐ Very Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Language *
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value as Language)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:outline-none bg-background text-foreground"
                required
              >
                <option value="en">🇬🇧 English</option>
                <option value="de">🇩🇪 German</option>
                <option value="fr">🇫🇷 French</option>
              </select>
            </div>

            {/* Question Content */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {formData.type === 'true-false' ? 'Statement *' : 'Question *'}
              </label>
              <textarea
                value={formData.type === 'true-false' ? formData.statement || '' : formData.question || ''}
                onChange={(e) => handleInputChange(
                  formData.type === 'true-false' ? 'statement' : 'question',
                  e.target.value
                )}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:border-primary focus:outline-none bg-background text-foreground ${
                  errors.question ? 'border-destructive' : 'border-border'
                }`}
                placeholder={formData.type === 'true-false' ? 'Enter the statement to evaluate...' : 'Enter the question...'}
                required
              />
              {errors.question && (
                <p className="text-destructive text-sm mt-1">{errors.question}</p>
              )}
            </div>

            {/* Image Upload for Image Questions */}
            {formData.type === 'image-question' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Question Image *
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center justify-center px-4 py-2 border border-border rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </label>
                  
                  <input
                    type="url"
                    value={formData.imageUrl || ''}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:border-primary focus:outline-none bg-background text-foreground ${
                      errors.imageUrl ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="Or enter image URL..."
                  />
                  
                  {formData.imageUrl && (
                    <div className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.imageUrl}
                        alt="Question preview"
                        className="max-w-xs h-32 object-contain border border-border rounded"
                      />
                    </div>
                  )}
                  
                  {errors.imageUrl && (
                    <p className="text-destructive text-sm">{errors.imageUrl}</p>
                  )}
                </div>
              </div>
            )}

            {/* Answers Section */}
            {(formData.type === 'multiple-choice' || formData.type === 'image-question') && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-foreground">
                    Answer Options *
                  </label>
                  <Button
                    type="button"
                    onClick={addAnswer}
                    size="sm"
                    variant="secondary"
                    className="text-green-600 hover:text-green-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {(formData.answers || []).map((answer, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctIndex === index}
                        onChange={() => handleInputChange('correctIndex', index)}
                        className="text-green-600"
                      />
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-border rounded-lg focus:border-primary focus:outline-none bg-background text-foreground"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                      {(formData.answers?.length || 0) > 2 && (
                        <Button
                          type="button"
                          onClick={() => removeAnswer(index)}
                          size="sm"
                          variant="secondary"
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                {errors.answers && (
                  <p className="text-destructive text-sm mt-1">{errors.answers}</p>
                )}
                {errors.correctIndex && (
                  <p className="text-destructive text-sm mt-1">{errors.correctIndex}</p>
                )}
              </div>
            )}

            {/* True/False Answer */}
            {formData.type === 'true-false' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Correct Answer *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center text-foreground">
                    <input
                      type="radio"
                      name="trueFalse"
                      checked={formData.correct === true}
                      onChange={() => handleInputChange('correct', true)}
                      className="mr-2 text-green-600"
                    />
                    True
                  </label>
                  <label className="flex items-center text-foreground">
                    <input
                      type="radio"
                      name="trueFalse"
                      checked={formData.correct === false}
                      onChange={() => handleInputChange('correct', false)}
                      className="mr-2 text-green-600"
                    />
                    False
                  </label>
                </div>
              </div>
            )}

            {/* Number Input Answer */}
            {formData.type === 'number-input' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Correct Answer *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.correctAnswer || ''}
                    onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:border-primary focus:outline-none bg-background text-foreground ${
                      errors.correctAnswer ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="Enter the correct number..."
                    required
                  />
                  {errors.correctAnswer && (
                    <p className="text-destructive text-sm mt-1">{errors.correctAnswer}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Unit (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.unit || ''}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:outline-none bg-background text-foreground"
                    placeholder="e.g., cm, kg, seconds..."
                  />
                </div>
              </div>
            )}

            {/* Explanation */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Explanation (Optional)
              </label>
              <textarea
                value={formData.explanation || ''}
                onChange={(e) => handleInputChange('explanation', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:outline-none bg-background text-foreground"
                placeholder="Explain why this is the correct answer..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.tags || []).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-2 text-primary hover:text-primary/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add tags (press Enter)"
                className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:outline-none bg-background text-foreground"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-muted p-4 flex justify-between items-center border-t border-border flex-shrink-0">
            <div className="text-sm text-muted-foreground">
              * Required fields
            </div>
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                onClick={onCancel}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {question ? 'Update Question' : 'Save Question'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}