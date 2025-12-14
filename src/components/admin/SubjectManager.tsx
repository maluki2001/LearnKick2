'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { SubjectData, CreateSubjectData } from '@/types/questions'
import { subjectsService } from '@/lib/subjects'
import { Plus, Edit, Trash2, X, Save, Hash } from 'lucide-react'
import { useAdminLanguage } from '@/contexts/AdminLanguageContext'

interface SubjectManagerProps {
  schoolId?: string
}

export function SubjectManager({ schoolId }: SubjectManagerProps) {
  const { t } = useAdminLanguage()
  const [subjects, setSubjects] = useState<SubjectData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState<SubjectData | null>(null)

  useEffect(() => {
    loadSubjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId])

  const loadSubjects = async () => {
    setIsLoading(true)
    try {
      const data = await subjectsService.getSubjects(schoolId)
      setSubjects(data)
    } catch (error) {
      console.error('Error loading subjects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSubject = async (subjectData: CreateSubjectData) => {
    try {
      await subjectsService.createSubject({
        ...subjectData,
        school_id: schoolId
      })
      await loadSubjects()
      setShowAddModal(false)
    } catch (error) {
      console.error('Error creating subject:', error)
    }
  }

  const handleUpdateSubject = async (id: string, updates: Partial<CreateSubjectData>) => {
    try {
      await subjectsService.updateSubject(id, updates)
      await loadSubjects()
      setEditingSubject(null)
    } catch (error) {
      console.error('Error updating subject:', error)
    }
  }

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) {
      return
    }
    
    try {
      await subjectsService.deleteSubject(id)
      await loadSubjects()
    } catch (error) {
      console.error('Error deleting subject:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">{t.subjectManagement}</h2>
          <p className="text-muted-foreground">Manage subjects and categories for your school</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.addSubject}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-muted-foreground">{t.loading}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((subject) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                    >
                      {subject.icon}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingSubject(subject)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {subject.school_id && ( // Only allow deleting school-specific subjects
                        <button
                          onClick={() => handleDeleteSubject(subject.id)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-2 text-foreground">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{subject.description}</p>
              
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Hash className="w-3 h-3" />
                    <span>{subject.slug}</span>
                    {!subject.school_id && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded">System</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      <AnimatePresence>
        {showAddModal && (
          <SubjectModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={handleCreateSubject}
            title={t.addSubject}
          />
        )}
      </AnimatePresence>

      {/* Edit Subject Modal */}
      <AnimatePresence>
        {editingSubject && (
          <SubjectModal
            isOpen={!!editingSubject}
            onClose={() => setEditingSubject(null)}
            onSave={(data) => handleUpdateSubject(editingSubject.id, data)}
            title={t.editSubject}
            initialData={editingSubject}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Subject Modal Component
interface SubjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateSubjectData) => void
  title: string
  initialData?: SubjectData | null
}

function SubjectModal({ isOpen, onClose, onSave, title, initialData }: SubjectModalProps) {
  const { t } = useAdminLanguage()
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '📚',
    color: '#3b82f6',
    description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        slug: initialData.slug,
        icon: initialData.icon,
        color: initialData.color,
        description: initialData.description || ''
      })
    } else {
      resetForm()
    }
  }, [initialData])

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      icon: '📚',
      color: '#3b82f6',
      description: ''
    })
    setErrors({})
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Subject name is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must be lowercase letters, numbers, and hyphens only'
    }

    if (!formData.color.match(/^#[0-9A-F]{6}$/i)) {
      newErrors.color = 'Color must be a valid hex code (e.g., #3b82f6)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    onSave({
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      icon: formData.icon,
      color: formData.color,
      description: formData.description.trim() || undefined
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const commonIcons = ['📚', '🔢', '🌍', '📖', '🔬', '📜', '🎨', '🎵', '⚽', '💻', '🏛️', '🎭', '🧪', '🌱', '⭐']
  const commonColors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#f97316', '#ef4444', '#84cc16', '#6366f1']

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Subject Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring ${
                errors.name ? 'border-destructive' : 'border-input'
              }`}
              placeholder="e.g., Mathematics"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring ${
                errors.slug ? 'border-destructive' : 'border-input'
              }`}
              placeholder="e.g., mathematics"
            />
            {errors.slug && (
              <p className="text-sm text-destructive mt-1">{errors.slug}</p>
            )}
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Icon
            </label>
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-20 px-3 py-2 border border-input bg-background rounded-lg text-center text-2xl"
                placeholder="📚"
              />
              <span className="text-muted-foreground">or choose:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {commonIcons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`w-10 h-10 border-2 rounded-lg text-xl flex items-center justify-center transition-all ${
                    formData.icon === icon
                      ? 'border-primary bg-primary/10'
                      : 'border-input hover:border-muted-foreground'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Color
            </label>
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-10 border border-input rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className={`px-3 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring font-mono ${
                  errors.color ? 'border-destructive' : 'border-input'
                }`}
                placeholder="#3b82f6"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {commonColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 border-2 rounded-lg transition-all ${
                    formData.color === color
                      ? 'border-foreground'
                      : 'border-input hover:border-muted-foreground'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            {errors.color && (
              <p className="text-sm text-destructive mt-1">{errors.color}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
              placeholder="Brief description of this subject..."
            />
          </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>
                Preview
              </Label>
              <div className="p-4 border rounded-lg bg-muted">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${formData.color}20`, color: formData.color }}
                  >
                    {formData.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{formData.name || 'Subject Name'}</h4>
                    <p className="text-sm text-muted-foreground">{formData.description || 'No description'}</p>
                    <span className="text-xs text-muted-foreground">#{formData.slug || 'subject-slug'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted">
          <Button onClick={handleClose} variant="secondary">
            {t.cancel}
          </Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            {initialData ? 'Update Subject' : 'Create Subject'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}