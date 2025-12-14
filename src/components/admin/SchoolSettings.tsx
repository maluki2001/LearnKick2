'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { User } from '@/lib/useAuth'
import { School, Shield, Users, Clock, Mail, Key, Check, X, AlertCircle } from 'lucide-react'
import { useAdminLanguage } from '@/contexts/AdminLanguageContext'

interface SchoolSettingsProps {
  user: User
}

export function SchoolSettings({ user }: SchoolSettingsProps) {
  const { t } = useAdminLanguage()
  const [settings, setSettings] = useState({
    schoolName: user.school_name || 'My School',
    allowParentSignup: true,
    requireApproval: false,
    gameTimeLimit: 15,
    maxStudentsPerClass: 30,
    enableNotifications: true
  })

  // State for UI feedback
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [schoolCode, setSchoolCode] = useState(user.school_code || 'ABC123')
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const handleSave = async () => {
    if (!user.school_id) {
      setSaveStatus({type: 'error', message: 'School ID not found'})
      return
    }

    setIsSaving(true)
    setSaveStatus(null)

    try {
      // Save school settings via API (uses Neon PostgreSQL)
      const response = await fetch('/api/schools', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.school_id,
          name: settings.schoolName,
          settings: {
            allow_parent_signup: settings.allowParentSignup,
            require_approval: settings.requireApproval,
            game_time_limits: settings.gameTimeLimit,
            max_students_per_class: settings.maxStudentsPerClass,
            enable_notifications: settings.enableNotifications
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        setSaveStatus({type: 'success', message: 'Settings saved successfully!'})
      } else {
        throw new Error(data.error || 'Failed to save settings')
      }

      setTimeout(() => setSaveStatus(null), 3000)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save settings'
      setSaveStatus({type: 'error', message})
      setTimeout(() => setSaveStatus(null), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateCode = async () => {
    if (!user.school_id) return

    setIsGeneratingCode(true)

    try {
      // Generate new 6-character code
      const newCode = Array.from({length: 6}, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
      ).join('')

      // Update school code via API (uses Neon PostgreSQL)
      const response = await fetch('/api/schools', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.school_id,
          code: newCode
        })
      })

      const data = await response.json()

      if (data.success) {
        setSchoolCode(newCode)
        setSaveStatus({type: 'success', message: `New school code generated: ${newCode}`})
      } else {
        throw new Error(data.error || 'Failed to generate new code')
      }

      setTimeout(() => setSaveStatus(null), 5000)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to generate new code'
      setSaveStatus({type: 'error', message})
      setTimeout(() => setSaveStatus(null), 5000)
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const handleInviteTeachers = () => {
    setShowInviteModal(true)
  }

  const handleEmailParents = () => {
    setShowEmailModal(true)
  }

  const handleUpgradePlan = () => {
    setShowUpgradeModal(true)
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(schoolCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = schoolCode
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">{t.schoolSettingsTitle}</h2>
        <p className="text-muted-foreground">{t.configureSettings}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* School Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <School className="w-5 h-5 text-primary" />
                <span>{t.schoolInformation}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="school-name">{t.schoolName}</Label>
                  <Input
                    id="school-name"
                    type="text"
                    value={settings.schoolName}
                    onChange={(e) => setSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                  />
                </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="school-code">{t.schoolCode}</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="school-code"
                        type="text"
                        value={schoolCode}
                        readOnly
                        className="flex-1 bg-muted text-muted-foreground"
                      />
                      <Button 
                        onClick={handleCopyCode} 
                        variant="secondary" 
                        size="sm"
                        className={copiedCode ? 'bg-green-100 text-green-700' : ''}
                      >
                        {copiedCode ? <Check className="w-4 h-4" /> : t.copy}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t.shareCode}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t.subscriptionPlan}</Label>
                    <div className="px-3 py-2 border rounded-lg bg-muted">
                      <span className="text-sm font-medium text-green-600">{t.freePlan}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-600" />
                <span>{t.accessControl}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{t.allowParentRegistration}</h4>
                    <p className="text-sm text-muted-foreground">{t.parentsCanJoin}</p>
                  </div>
                  <Switch
                    checked={settings.allowParentSignup}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowParentSignup: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{t.requireAdminApproval}</h4>
                    <p className="text-sm text-muted-foreground">{t.newUsersApproval}</p>
                  </div>
                  <Switch
                    checked={settings.requireApproval}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireApproval: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <span>{t.gameSettings}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="time-limit">
                    {t.defaultTimeLimit}
                  </Label>
                  <Input
                    id="time-limit"
                    type="number"
                    min="5"
                    max="60"
                    value={settings.gameTimeLimit}
                    onChange={(e) => setSettings(prev => ({ ...prev, gameTimeLimit: parseInt(e.target.value) }))}
                    className="w-32"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-students">
                    {t.maxStudentsPerClass}
                  </Label>
                  <Input
                    id="max-students"
                    type="number"
                    min="10"
                    max="50"
                    value={settings.maxStudentsPerClass}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxStudentsPerClass: parseInt(e.target.value) }))}
                    className="w-32"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.quickActions}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={handleGenerateCode}
                  variant="secondary"
                  className="w-full justify-start"
                  disabled={isGeneratingCode}
                >
                  {isGeneratingCode ? (
                    <div className="w-4 h-4 mr-2 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Key className="w-4 h-4 mr-2" />
                  )}
                  {isGeneratingCode ? 'Generating...' : t.generateNewCode}
                </Button>
                <Button onClick={handleInviteTeachers} variant="secondary" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  {t.inviteTeachers}
                </Button>
                <Button onClick={handleEmailParents} variant="secondary" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  {t.emailAllParents}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Plan */}
          <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
            <CardHeader>
              <CardTitle>{t.currentPlan}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{t.youreOnFreePlan}</p>
              <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                <li>{t.upTo50Students}</li>
                <li>{t.threeTeachers}</li>
                <li>{t.basicAnalytics}</li>
                <li>{t.communitySupport}</li>
              </ul>
              <Button onClick={handleUpgradePlan} className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700">
                {t.upgradePlan}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Messages */}
      {saveStatus && (
        <div className={`p-4 rounded-lg ${
          saveStatus.type === 'success'
            ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20'
            : 'bg-destructive/10 text-destructive border border-destructive/20'
        }`}>
          <div className="flex items-center">
            {saveStatus.type === 'success' ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {saveStatus.message}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            t.saveSettings
          )}
        </Button>
      </div>

      {/* Invite Teachers Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t.inviteTeachers}</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-muted-foreground mb-4">
                Use the User Management section to invite teachers to your school.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setShowInviteModal(false)
                    // This would navigate to user management tab
                    // Since we can't access the parent state, we'll show a message
                    alert('Please go to the User Management section to invite teachers.')
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Go to User Management
                </Button>
                <Button
                  onClick={() => setShowInviteModal(false)}
                  variant="secondary"
                >
                  {t.cancel}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Email Parents Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t.emailAllParents}</h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-subject">
                    Subject
                  </Label>
                  <Input
                    id="email-subject"
                    type="text"
                    placeholder="Enter email subject..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-message">
                    Message
                  </Label>
                  <textarea
                    id="email-message"
                    rows={4}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Write your message here..."
                  />
                </div>

                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-sm text-primary">
                    This email will be sent to all parents in your school.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={() => {
                    // Here you would implement the email sending logic
                    setShowEmailModal(false)
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  onClick={() => setShowEmailModal(false)}
                  variant="secondary"
                >
                  {t.cancel}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Upgrade Your Plan</h3>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Plan */}
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-semibold">Basic Plan</h4>
                      <div className="text-3xl font-bold mt-2">$29<span className="text-lg text-muted-foreground">/month</span></div>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>✓ Up to 100 students</li>
                      <li>✓ 5 teachers</li>
                      <li>✓ Basic analytics</li>
                      <li>✓ Email support</li>
                      <li>✓ Custom questions</li>
                    </ul>
                    <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                      Choose Basic
                    </Button>
                  </CardContent>
                </Card>

                {/* Premium Plan */}
                <Card className="border-primary/20 bg-primary/10">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-semibold">Premium Plan</h4>
                      <div className="text-3xl font-bold mt-2">$79<span className="text-lg text-muted-foreground">/month</span></div>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>✓ Unlimited students</li>
                      <li>✓ Unlimited teachers</li>
                      <li>✓ Advanced analytics</li>
                      <li>✓ Priority support</li>
                      <li>✓ Custom branding</li>
                      <li>✓ API access</li>
                      <li>✓ Data export</li>
                    </ul>
                    <Button className="w-full mt-4 bg-gradient-to-r from-primary to-purple-600 text-white">
                      Choose Premium
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  All plans include a 14-day free trial
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}