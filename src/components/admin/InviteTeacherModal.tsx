'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Mail,
  Users,
  Send,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Copy,
  School
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAdminLanguage } from '@/contexts/AdminLanguageContext'

interface InviteTeacherModalProps {
  isOpen: boolean
  onClose: () => void
  schoolCode?: string
  schoolName?: string
}

interface TeacherInvite {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'teacher' | 'admin'
  status: 'pending' | 'sending' | 'sent' | 'error'
  errorMessage?: string
}

export function InviteTeacherModal({ 
  isOpen, 
  onClose, 
  schoolCode = 'ABC123',
  schoolName = 'Demo School'
}: InviteTeacherModalProps) {
  const { t } = useAdminLanguage()
  const [invites, setInvites] = useState<TeacherInvite[]>([
    { id: '1', email: '', firstName: '', lastName: '', role: 'teacher', status: 'pending' }
  ])
  const [inviteMethod, setInviteMethod] = useState<'email' | 'link'>('email')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const addInvite = () => {
    const newInvite: TeacherInvite = {
      id: Date.now().toString(),
      email: '',
      firstName: '',
      lastName: '',
      role: 'teacher',
      status: 'pending'
    }
    setInvites([...invites, newInvite])
  }

  const removeInvite = (id: string) => {
    if (invites.length > 1) {
      setInvites(invites.filter(invite => invite.id !== id))
    }
  }

  const updateInvite = (id: string, field: keyof TeacherInvite, value: string) => {
    setInvites(invites.map(invite => 
      invite.id === id ? { ...invite, [field]: value } : invite
    ))
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const sendInvitations = async () => {
    setIsSubmitting(true)
    
    // Update status to sending
    setInvites(invites.map(invite => ({ ...invite, status: 'sending' as const })))
    
    // Simulate API calls
    for (const invite of invites) {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Validate
        if (!invite.email || !validateEmail(invite.email)) {
          throw new Error('Invalid email address')
        }
        if (!invite.firstName || !invite.lastName) {
          throw new Error('First and last name are required')
        }
        
        // Simulate successful send
        setInvites(prev => prev.map(i => 
          i.id === invite.id 
            ? { ...i, status: 'sent' as const }
            : i
        ))
        
        console.log('Sending invitation to:', invite.email, {
          firstName: invite.firstName,
          lastName: invite.lastName,
          role: invite.role,
          schoolCode,
          schoolName
        })
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setInvites(prev => prev.map(i =>
          i.id === invite.id
            ? { ...i, status: 'error' as const, errorMessage }
            : i
        ))
      }
    }
    
    setIsSubmitting(false)
    
    // Check if all succeeded
    const hasErrors = invites.some(invite => invite.status === 'error')
    if (!hasErrors) {
      setShowSuccess(true)
      setTimeout(() => {
        onClose()
        setShowSuccess(false)
        // Reset form
        setInvites([{ id: '1', email: '', firstName: '', lastName: '', role: 'teacher', status: 'pending' }])
      }, 2000)
    }
  }

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join?code=${schoolCode}&role=teacher`
    navigator.clipboard.writeText(inviteLink)
    // Could show a toast notification here
    alert('Invite link copied to clipboard!')
  }

  const isFormValid = invites.every(invite => 
    invite.email && 
    validateEmail(invite.email) && 
    invite.firstName.trim() && 
    invite.lastName.trim()
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{t.inviteTeachers}</h2>
              <p className="text-sm text-muted-foreground">{t.inviteTeacherDesc || 'Add new team members to your school'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Success State */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-900">Invitations Sent Successfully!</h3>
                    <p className="text-sm text-green-700">All teacher invitations have been sent via email.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">Invitation Method</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setInviteMethod('email')}
                className={`flex-1 p-4 border rounded-lg transition-colors ${
                  inviteMethod === 'email'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground hover:bg-muted'
                }`}
              >
                <Mail className="w-5 h-5 mb-2 mx-auto" />
                <div className="text-sm font-medium">Send Email Invitations</div>
                <div className="text-xs text-muted-foreground mt-1">Send personalized email invites</div>
              </button>

              <button
                onClick={() => setInviteMethod('link')}
                className={`flex-1 p-4 border rounded-lg transition-colors ${
                  inviteMethod === 'link'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground hover:bg-muted'
                }`}
              >
                <School className="w-5 h-5 mb-2 mx-auto" />
                <div className="text-sm font-medium">Share Invite Link</div>
                <div className="text-xs text-muted-foreground mt-1">Generate shareable link</div>
              </button>
            </div>
          </div>

          {inviteMethod === 'email' ? (
            <>
              {/* Teacher Invitations Form */}
              <div className="space-y-4">
                {invites.map((invite, index) => (
                  <motion.div
                    key={invite.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-lg ${
                      invite.status === 'error' ? 'border-destructive bg-destructive/10' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-foreground">Teacher #{index + 1}</h4>
                      <div className="flex items-center space-x-2">
                        {invite.status === 'sending' && (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        )}
                        {invite.status === 'sent' && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {invite.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        {invites.length > 1 && (
                          <button
                            onClick={() => removeInvite(invite.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {invite.status === 'error' && invite.errorMessage && (
                      <div className="mb-3 text-sm text-destructive bg-card p-2 rounded border border-border">
                        {invite.errorMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={invite.firstName}
                          onChange={(e) => updateInvite(invite.id, 'firstName', e.target.value)}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-muted bg-background text-foreground text-sm"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={invite.lastName}
                          onChange={(e) => updateInvite(invite.id, 'lastName', e.target.value)}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-muted bg-background text-foreground text-sm"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={invite.email}
                          onChange={(e) => updateInvite(invite.id, 'email', e.target.value)}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-muted bg-background text-foreground text-sm"
                          placeholder="john.doe@school.edu"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          Role
                        </label>
                        <select
                          value={invite.role}
                          onChange={(e) => updateInvite(invite.id, 'role', e.target.value)}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-muted bg-background text-foreground text-sm"
                        >
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <button
                  onClick={addInvite}
                  disabled={isSubmitting}
                  className="w-full p-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-sm">Add Another Teacher</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Link Sharing Method */}
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Teacher Invite Link</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share this link with teachers to join your school. They&apos;ll be able to create their account and request access.
                  </p>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join?code=${schoolCode}&role=teacher`}
                      readOnly
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono text-foreground"
                    />
                    <Button onClick={copyInviteLink} variant="secondary" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">How it works:</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Teachers click the link and create their account</li>
                    <li>• They&apos;re automatically associated with your school</li>
                    <li>• You can approve or manage their access in User Management</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted">
          <Button onClick={onClose} variant="secondary" disabled={isSubmitting}>
            Cancel
          </Button>
          {inviteMethod === 'email' && (
            <Button 
              onClick={sendInvitations}
              disabled={!isFormValid || isSubmitting}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Invitations ({invites.length})</span>
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}