'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectNative } from '@/components/ui/select-native'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { User } from '@/lib/useAuth'
import { UserPlus, Mail, Shield, Users, MoreVertical, Send, Copy, Check, Edit, Trash2, UserX } from 'lucide-react'
import { useAdminLanguage } from '@/contexts/AdminLanguageContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SchoolUser {
  id: string
  full_name?: string
  email: string
  role: string
  last_sign_in_at?: string
}

interface UserManagementProps {
  user: User
  adminData?: Record<string, unknown>
}

export function UserManagement({ user, adminData }: UserManagementProps) {
  const [isInviting, setIsInviting] = useState(false)
  const [inviteMethod, setInviteMethod] = useState<'email' | 'link'>('email')
  const [inviteRole, setInviteRole] = useState<'teacher' | 'parent'>('teacher')
  // const [inviteEmail, setInviteEmail] = useState('') // unused
  const [inviteEmails, setInviteEmails] = useState<string[]>([''])
  const [isLoading, setIsLoadingInvite] = useState(false)
  const [inviteResult, setInviteResult] = useState<{type: 'success' | 'error', message: string, codes?: string[]} | null>(null)
  const [copiedCode, setCopiedCode] = useState('')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<SchoolUser | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { t } = useAdminLanguage()
  
  // Get real data from adminData hook
  const { schoolUsers: rawSchoolUsers, usersByRole: rawUsersByRole, isLoading: dataLoading } = adminData || {}
  const schoolUsers = (rawSchoolUsers || []) as SchoolUser[]
  const usersByRole = (rawUsersByRole || {}) as Record<string, number>

  // Invite functionality - uses API route (Neon PostgreSQL)
  const handleSendInvites = async () => {
    if (!user.school_id) {
      setInviteResult({ type: 'error', message: 'School ID not found' })
      return
    }

    setIsLoadingInvite(true)
    setInviteResult(null)

    try {
      const inviteCodes: string[] = []

      if (inviteMethod === 'email') {
        // Send email invitations via API
        for (const email of inviteEmails.filter(e => e.trim())) {
          const response = await fetch('/api/invites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              school_id: user.school_id,
              invited_by: user.id,
              email: email.trim(),
              role: inviteRole
            })
          })
          const data = await response.json()
          if (data.success && data.invite?.code) {
            inviteCodes.push(data.invite.code)
          }
        }

        setInviteResult({
          type: 'success',
          message: `Successfully created ${inviteCodes.length} invitation(s)! Share the codes with users.`,
          codes: inviteCodes
        })
      } else {
        // Generate link invitations via API
        const response = await fetch('/api/invites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            school_id: user.school_id,
            invited_by: user.id,
            email: '',
            role: inviteRole
          })
        })
        const data = await response.json()
        if (data.success && data.invite?.code) {
          inviteCodes.push(data.invite.code)
        }

        setInviteResult({
          type: 'success',
          message: 'Invitation link generated! Share this code with users.',
          codes: inviteCodes
        })
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send invitations'
      setInviteResult({
        type: 'error',
        message
      })
    } finally {
      setIsLoadingInvite(false)
    }
  }

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(''), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(''), 2000)
    }
  }

  const addEmailField = () => {
    setInviteEmails([...inviteEmails, ''])
  }

  const removeEmailField = (index: number) => {
    setInviteEmails(inviteEmails.filter((_, i) => i !== index))
  }

  const updateEmailField = (index: number, value: string) => {
    const updated = [...inviteEmails]
    updated[index] = value
    setInviteEmails(updated)
  }

  const resetInviteDialog = () => {
    setIsInviting(false)
    setInviteMethod('email')
    setInviteRole('teacher')
    setInviteEmails([''])
    setInviteResult(null)
    setCopiedCode('')
  }

  // User management functions - uses API routes (Neon PostgreSQL)
  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
      console.log(`${newStatus === 'active' ? 'Activating' : 'Suspending'} user:`, userId)
      // Note: User status is handled at application level, not in database currently
      setOpenDropdown(null)
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const handleEditUser = (userData: SchoolUser) => {
    setSelectedUser(userData)
    setShowEditDialog(true)
    setOpenDropdown(null)
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/users?id=${selectedUser.id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        console.log('User deleted successfully')
      } else {
        console.error('Failed to delete user:', data.error)
      }

      setShowDeleteAlert(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">{t.userManagementTitle}</h2>
          <p className="text-muted-foreground">{t.manageUsers}</p>
        </div>
        
        <Button
          onClick={() => setIsInviting(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t.inviteUser}</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
              <p className="text-2xl font-bold text-foreground">{usersByRole.teacher || 0}</p>
              <p className="text-sm text-muted-foreground">{t.teachers}</p>
            </div>
          </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{usersByRole.parent || 0}</p>
              <p className="text-sm text-muted-foreground">{t.parents}</p>
            </div>
          </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{usersByRole.student || 0}</p>
              <p className="text-sm text-muted-foreground">{t.students}</p>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t.schoolUsers}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6 py-3">{t.user}</TableHead>
                <TableHead className="px-6 py-3">{t.role}</TableHead>
                <TableHead className="px-6 py-3">{t.status}</TableHead>
                <TableHead className="px-6 py-3">{t.lastActive}</TableHead>
                <TableHead className="px-6 py-3 text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schoolUsers.length > 0 ? (
                schoolUsers.map((schoolUser) => {
                  const initials = schoolUser.full_name 
                    ? schoolUser.full_name.split(' ').map(n => n[0]).join('')
                    : schoolUser.email.charAt(0).toUpperCase()
                  const timeAgo = schoolUser.last_sign_in_at
                    ? formatTimeAgo(schoolUser.last_sign_in_at)
                    : 'Never'
                    
                  return (
                    <TableRow key={schoolUser.id}>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-muted-foreground">
                              {initials}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-foreground">
                              {schoolUser.full_name || t.user}
                            </p>
                            <p className="text-sm text-muted-foreground">{schoolUser.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          schoolUser.role === 'teacher'
                            ? 'bg-primary/10 text-primary'
                            : schoolUser.role === 'parent'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : schoolUser.role === 'student'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {schoolUser.role}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                          {t.active}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                        {timeAgo}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="relative" ref={dropdownRef}>
                          <button
                            onClick={() => setOpenDropdown(openDropdown === schoolUser.id ? null : schoolUser.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {openDropdown === schoolUser.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-popover rounded-lg shadow-lg border border-border z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleEditUser(schoolUser)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
                                >
                                  <Edit className="w-4 h-4 mr-3" />
                                  {t.editUser}
                                </button>
                                <button
                                  onClick={() => toggleUserStatus(schoolUser.id, 'active')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
                                >
                                  <UserX className="w-4 h-4 mr-3" />
                                  {t.suspendUser}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(schoolUser)
                                    setShowDeleteAlert(true)
                                    setOpenDropdown(null)
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4 mr-3" />
                                  {t.deleteUser}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-muted-foreground">
                      <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                      <p>{t.noUsersFound}</p>
                      <p className="text-sm">{t.inviteTeachersParents}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite User Dialog */}
      <Dialog open={isInviting} onOpenChange={setIsInviting}>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.inviteUser}</DialogTitle>
            <DialogDescription>
              Invite new teachers or parents to join your school
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">

              {!inviteResult && (
                <>
                  {/* Invitation Method */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Invitation Method
                    </label>
                    <div className="flex bg-muted rounded-lg p-1">
                      <button
                        onClick={() => setInviteMethod('email')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                          inviteMethod === 'email'
                            ? 'bg-background text-primary shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Mail className="w-4 h-4 inline mr-2" />
                        Send Email
                      </button>
                      <button
                        onClick={() => setInviteMethod('link')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                          inviteMethod === 'link'
                            ? 'bg-background text-primary shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Copy className="w-4 h-4 inline mr-2" />
                        Generate Link
                      </button>
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="mb-6 space-y-2">
                    <Label htmlFor="invite-role">
                      {t.role}
                    </Label>
                    <SelectNative
                      id="invite-role"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as 'teacher' | 'parent')}
                    >
                      <option value="teacher">Teacher</option>
                      <option value="parent">Parent</option>
                    </SelectNative>
                  </div>

                  {/* Email Input (for email method) */}
                  {inviteMethod === 'email' && (
                    <div className="mb-6">
                      <Label>
                        Email Addresses
                      </Label>
                      <div className="space-y-3">
                        {inviteEmails.map((email, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              type="email"
                              value={email}
                              onChange={(e) => updateEmailField(index, e.target.value)}
                              placeholder="user@example.com"
                              className="flex-1"
                            />
                            {inviteEmails.length > 1 && (
                              <button
                                onClick={() => removeEmailField(index)}
                                className="text-destructive hover:text-destructive/80 px-2"
                              >
                                <UserX className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={addEmailField}
                          className="text-primary hover:text-primary/80 text-sm flex items-center"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Add another email
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-primary">
                      {inviteMethod === 'email'
                        ? 'Enter email addresses to send invitation emails directly to users.'
                        : 'Generate a shareable invitation code that you can distribute to users.'
                      }
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={handleSendInvites}
                      disabled={isLoading || (inviteMethod === 'email' && inviteEmails.every(e => !e.trim()))}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {inviteMethod === 'email' ? 'Sending...' : 'Generating...'}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {inviteMethod === 'email' ? 'Send Invitations' : 'Generate Link'}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={resetInviteDialog}
                      variant="secondary"
                    >
                      {t.cancel}
                    </Button>
                  </div>
                </>
              )}

              {/* Results */}
              {inviteResult && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    inviteResult.type === 'success'
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20'
                      : 'bg-destructive/10 text-destructive border border-destructive/20'
                  }`}>
                    <p>{inviteResult.message}</p>
                  </div>

                  {inviteResult.codes && inviteResult.codes.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Invitation Codes</h4>
                      {inviteResult.codes.map((code) => (
                        <div key={code} className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                          <code className="flex-1 text-sm font-mono bg-background text-foreground px-2 py-1 rounded border border-border">
                            {code}
                          </code>
                          <button
                            onClick={() => handleCopyCode(code)}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                              copiedCode === code
                                ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                                : 'bg-primary/10 text-primary hover:bg-primary/20'
                            }`}
                          >
                            {copiedCode === code ? (
                              <>
                                <Check className="w-4 h-4 inline mr-1" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 inline mr-1" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-3 pt-4">
                    <Button
                      onClick={() => setInviteResult(null)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Send More Invitations
                    </Button>
                    <Button
                      onClick={resetInviteDialog}
                      variant="secondary"
                    >
                      Done
                    </Button>
                  </div>
                </div>
            )}
          </div>
          {!inviteResult && (
            <DialogFooter>
              <Button
                onClick={() => {
                  setIsInviting(false)
                  resetInviteDialog()
                }}
                variant="secondary"
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handleSendInvites}
                disabled={isLoading || (inviteMethod === 'email' && !inviteEmails.some(email => email.trim()))}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{inviteMethod === 'email' ? 'Sending...' : 'Generating...'}</span>
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {inviteMethod === 'email' ? 'Send Invitations' : 'Generate Link'}
                  </>
                )}
              </Button>
            </DialogFooter>
          )}

          {inviteResult && (
            <DialogFooter>
              <Button
                onClick={() => setInviteResult(null)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Send More Invitations
              </Button>
              <Button
                onClick={() => {
                  setIsInviting(false)
                  resetInviteDialog()
                }}
                variant="secondary"
              >
                Done
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={showEditDialog} onOpenChange={(open) => {
          setShowEditDialog(open)
          if (!open) setSelectedUser(null)
        }}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>{t.editUser}</DialogTitle>
            <DialogDescription>
              Update user information and role
            </DialogDescription>
          </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-fullname">
                    Full Name
                  </Label>
                  <Input
                    id="edit-fullname"
                    type="text"
                    defaultValue={selectedUser?.full_name || ''}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email">
                    {t.email}
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    defaultValue={selectedUser?.email || ''}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-role">
                    {t.role}
                  </Label>
                  <SelectNative
                    id="edit-role"
                    defaultValue={selectedUser?.role || 'student'}
                  >
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="student">Student</option>
                  </SelectNative>
                </div>
              </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowEditDialog(false)
                setSelectedUser(null)
              }}
              variant="secondary"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={() => {
                console.log('Saving user changes for:', selectedUser?.id)
                setShowEditDialog(false)
                setSelectedUser(null)
                // TODO: Implement actual save functionality
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
      )}

      {/* Delete User Alert Dialog */}
      {selectedUser && (
        <AlertDialog open={showDeleteAlert} onOpenChange={(open) => {
          setShowDeleteAlert(open)
          if (!open) setSelectedUser(null)
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteUser}</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to delete ${selectedUser?.full_name || selectedUser?.email || ''}? This action cannot be undone and will permanently remove the user from your school.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedUser(null)
              }}
            >
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t.deleteUser}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

// Utility function for time formatting
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}