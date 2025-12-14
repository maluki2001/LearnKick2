'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { QuestionBankManager } from './QuestionBankManager'
import { QuestionForm } from './QuestionForm'
import { Question } from '@/types/questions'
import { Settings, Database, BarChart3, FileText, Lock, Unlock } from 'lucide-react'

interface AdminAccessProps {
  isOpen: boolean
  onClose: () => void
}

// Simple admin authentication - in production, use proper authentication
const ADMIN_PASSWORD = 'learnkick2025' // This should be environment variable

export function AdminAccess({ isOpen, onClose }: AdminAccessProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [activePanel, setActivePanel] = useState<'dashboard' | 'questions' | 'form' | 'stats'>('dashboard')
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showQuestionForm, setShowQuestionForm] = useState(false)

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setAuthError('')
      setPassword('')
    } else {
      setAuthError('Invalid password')
      setPassword('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setActivePanel('dashboard')
    setEditingQuestion(null)
    setShowQuestionForm(false)
  }

  const handleSaveQuestion = async (question: Question) => {
    try {
      const method = editingQuestion ? 'PUT' : 'POST'
      const response = await fetch('/api/questions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question),
      })

      if (!response.ok) {
        throw new Error('Failed to save question')
      }

      setShowQuestionForm(false)
      setEditingQuestion(null)
    } catch (error) {
      console.error('Failed to save question:', error)
      alert('Failed to save question. Please try again.')
    }
  }

  if (!isOpen) return null

  // Authentication Screen
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
            <p className="text-gray-600">Enter administrator password to access management tools</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                placeholder="Enter admin password..."
                required
              />
              {authError && (
                <p className="text-red-500 text-sm mt-1">{authError}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Access Admin
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>For Demo:</strong> Password is &quot;learnkick2025&quot;
            </p>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Main Admin Panel
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-xl shadow-2xl w-[95vw] h-[90vh] overflow-hidden flex flex-col max-w-6xl"
      >
        {/* Header */}
        <div className="bg-red-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🛠️ LearnKick Admin Panel</h2>
              <p className="text-red-100 mt-1">Educational Content Management System</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleLogout}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                <Lock className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <Button
                onClick={onClose}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar Navigation */}
          <div className="bg-gray-50 p-4 w-64 border-r border-gray-200 flex-shrink-0 overflow-y-auto">
            <nav className="space-y-2">
              <button
                onClick={() => setActivePanel('dashboard')}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activePanel === 'dashboard'
                    ? 'bg-red-100 text-red-900 font-bold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5 inline mr-3" />
                Dashboard
              </button>
              
              <button
                onClick={() => setActivePanel('questions')}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activePanel === 'questions'
                    ? 'bg-red-100 text-red-900 font-bold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Database className="w-5 h-5 inline mr-3" />
                Question Bank
              </button>

              <button
                onClick={() => setActivePanel('stats')}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activePanel === 'stats'
                    ? 'bg-red-100 text-red-900 font-bold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 inline mr-3" />
                Statistics
              </button>
            </nav>

            {/* Quick Actions */}
            <div className="mt-8">
              <h4 className="font-bold text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setEditingQuestion(null)
                    setShowQuestionForm(true)
                  }}
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white justify-start"
                >
                  ➕ Add Question
                </Button>
                
                <a
                  href="/templates/questions-template.csv"
                  download="learnkick-questions-template.csv"
                  className="block"
                >
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full justify-start"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download CSV Template
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto min-w-0">
            {activePanel === 'dashboard' && (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-center">
                        <Database className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-blue-600">Question Bank</p>
                          <p className="text-2xl font-bold text-blue-900">8,000+</p>
                          <p className="text-xs text-blue-700">Total Questions</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center">
                        <BarChart3 className="w-8 h-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-green-600">Content Quality</p>
                          <p className="text-2xl font-bold text-green-900">A+</p>
                          <p className="text-xs text-green-700">Quality Score</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <div className="flex items-center">
                        <Settings className="w-8 h-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-purple-600">System Status</p>
                          <p className="text-2xl font-bold text-purple-900">Online</p>
                          <p className="text-xs text-purple-700">All Systems Operational</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">System initialized with {8000} questions</span>
                      <span className="text-xs text-gray-500 ml-auto">Now</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Admin panel accessed</span>
                      <span className="text-xs text-gray-500 ml-auto">Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePanel === 'questions' && (
              <div className="h-full">
                <QuestionBankManager />
              </div>
            )}

            {activePanel === 'stats' && (
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Statistics & Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Questions by Subject</h4>
                    <div className="space-y-3">
                      {[
                        { subject: 'math', count: 2000 },
                        { subject: 'german', count: 1500 },
                        { subject: 'french', count: 1500 },
                        { subject: 'english', count: 1500 },
                        { subject: 'science', count: 1500 },
                      ].map(({ subject, count }) => (
                        <div key={subject} className="flex justify-between items-center">
                          <span className="capitalize text-gray-700">{subject}</span>
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(count / 8000) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-900">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Questions by Grade</h4>
                    <div className="space-y-3">
                      {[
                        { grade: 1, count: 1200 },
                        { grade: 2, count: 1400 },
                        { grade: 3, count: 1500 },
                        { grade: 4, count: 1400 },
                        { grade: 5, count: 1300 },
                        { grade: 6, count: 1200 },
                      ].map(({ grade, count }) => (
                        <div key={grade} className="flex justify-between items-center">
                          <span className="text-gray-700">Grade {grade}</span>
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${(count / 8000) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-900">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <QuestionForm
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => {
            setShowQuestionForm(false)
            setEditingQuestion(null)
          }}
          isOpen={showQuestionForm}
        />
      )}
    </motion.div>
  )
}