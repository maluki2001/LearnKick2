'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  BookOpen,
  Users,
  Settings,
  LogOut,
  School,
  Trophy,
  TrendingUp,
  Activity,
  Download,
  Plus,
  HelpCircle,
  Menu,
  X,
  MoreVertical,
  UserPlus,
  FileDown,
  RefreshCw,
  Bell,
  Mail,
  Building2,
  Crown,
  Globe
} from 'lucide-react'
import { User } from '@/lib/useAuth'
import { isSuperAdmin } from '@/lib/auth-types'
import { authClient } from '@/lib/useAuth'
import { QuestionBankManager } from './QuestionBankManager'
import { SubjectManager } from './SubjectManager'
import { UserManagement } from './UserManagement'
import { SchoolSettings } from './SchoolSettings'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { OffersManager } from './OffersManager'
import { InviteTeacherModal } from './InviteTeacherModal'
import { DocumentationManager } from './DocumentationManager'
import { useAdminData } from '@/hooks/useAdminData'
import { LanguageSelector } from './LanguageSelector'
import { AdminLanguageProvider, useAdminLanguage } from '@/contexts/AdminLanguageContext'
import { DataExportService } from '@/lib/dataExport'
// Commented out unused imports
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AdminDashboardProps {
  user: User
}

type ActiveTab = 'overview' | 'questions' | 'subjects' | 'users' | 'analytics' | 'offers' | 'settings' | 'help' | 'schools' | 'global-questions'

function AdminDashboardContent({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const adminData = useAdminData(user)
  const { language, setLanguage, t } = useAdminLanguage()
  const isSuperadmin = isSuperAdmin(user.role)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await authClient.signOut()
      window.location.reload()
    } catch (error) {
      console.error('Sign out failed:', error)
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      await DataExportService.exportComprehensive(adminData)
    } catch (error) {
      console.error('Export failed:', error)
      alert(t.exportFailed || 'Export failed. Please try again.')
    }
  }

  // Superadmin sees platform-wide management, admin sees school-specific
  const navigation = isSuperadmin ? [
    // Superadmin navigation - Platform owner
    { id: 'overview', label: t.platformOverview, icon: Crown, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { id: 'schools', label: t.manageSchools, icon: Building2, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'global-questions', label: t.globalQuestions, icon: Globe, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'subjects', label: t.subjects, icon: School, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { id: 'analytics', label: t.platformAnalytics, icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { id: 'settings', label: t.platformSettings, icon: Settings, color: 'text-muted-foreground', bgColor: 'bg-muted' },
    { id: 'help', label: t.help, icon: HelpCircle, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  ] : [
    // School admin / teacher navigation
    { id: 'overview', label: t.overview, icon: BarChart3, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'questions', label: t.questionBank, icon: BookOpen, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'subjects', label: t.subjects, icon: School, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { id: 'users', label: t.userManagement, icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'analytics', label: t.analytics, icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { id: 'offers', label: t.offersManagement, icon: Trophy, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { id: 'settings', label: t.schoolSettings, icon: Settings, color: 'text-muted-foreground', bgColor: 'bg-muted' },
    { id: 'help', label: t.help, icon: HelpCircle, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r border-border bg-background overflow-visible">
        {/* Sidebar Header */}
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${
                isSuperadmin
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                  : 'bg-gradient-to-br from-blue-600 to-purple-600'
              }`}>
                {isSuperadmin ? <Crown className="h-6 w-6" /> : <School className="h-6 w-6" />}
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-foreground">
                  {isSuperadmin ? t.learnKickPlatform : t.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isSuperadmin ? t.platformOwner : (user.school_name || t.educationalManagement)}
                </p>
              </div>
            </div>
            {/* Admin Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 hover:bg-accent rounded-md transition-colors">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{t.adminActions}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowInviteModal(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t.inviteUser}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportData}>
                  <FileDown className="h-4 w-4 mr-2" />
                  {t.exportDataLabel}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t.refresh}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 mr-2" />
                  {t.notifications}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="h-4 w-4 mr-2" />
                  {t.messages}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {user.school_id && !isSuperadmin && (
            <div className="mt-4">
              <span className="text-xs px-2 py-1 border border-border rounded-md bg-muted">
                {t.schoolCodeLabel}: {user.school_code || 'N/A'}
              </span>
            </div>
          )}
        </div>
        
        {/* Sidebar Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-4 space-y-4 overflow-visible">
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
              <div className="h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-foreground truncate">{user.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                <Settings className="h-4 w-4 mr-2" />
                {t.profileSettings}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                {t.preferences}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t.signOut}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex items-center gap-2 justify-center">
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
            <ThemeToggle variant="icon" size="sm" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 border border-border rounded-md hover:bg-accent"
            >
              <Menu className="h-4 w-4" />
            </button>
            
            <div>
              <h1 className="text-lg font-semibold text-foreground">{t.title}</h1>
              <p className="text-sm text-muted-foreground">{user.school_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Admin Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 border border-border rounded-md hover:bg-accent">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{t.adminActions}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowInviteModal(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t.inviteUser}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportData}>
                  <FileDown className="h-4 w-4 mr-2" />
                  {t.exportDataLabel}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t.refresh}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
              {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileMenu(false)}>
            <div className="w-80 h-full bg-background shadow-xl">
              <div className="flex flex-col h-full">
                <div className="border-b border-border p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                        <School className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col">
                        <h1 className="text-lg font-semibold text-foreground">{t.title}</h1>
                        <p className="text-sm text-muted-foreground">{user.school_name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowMobileMenu(false)}
                      className="p-2 hover:bg-accent rounded-md text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 p-4">
                  <div className="space-y-2">
                    {navigation.map((item) => {
                      const Icon = item.icon
                      const isActive = activeTab === item.id
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as ActiveTab)
                            setShowMobileMenu(false)
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-accent text-muted-foreground'
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                
                <div className="border-t border-border p-4 space-y-3 overflow-visible">
                  <div className="flex items-center gap-2 justify-center">
                    <LanguageSelector
                      currentLanguage={language}
                      onLanguageChange={setLanguage}
                    />
                    <ThemeToggle variant="icon" size="sm" />
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {t.signOut}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-muted">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {activeTab === 'overview' && <OverviewTab user={user} adminData={adminData} onExportData={handleExportData} onSetActiveTab={setActiveTab} onInviteTeacher={() => setShowInviteModal(true)} isSuperadmin={isSuperadmin} />}
              {activeTab === 'questions' && <QuestionBankManager schoolId={user.school_id} userId={user.id} />}
              {activeTab === 'global-questions' && <QuestionBankManager schoolId={null} userId={user.id} isGlobal={true} />}
              {activeTab === 'schools' && <SchoolsManager />}
              {activeTab === 'subjects' && <SubjectManager schoolId={user.school_id ?? undefined} />}
              {activeTab === 'users' && <UserManagement user={user} adminData={adminData} />}
              {activeTab === 'analytics' && <AnalyticsDashboard user={user} adminData={adminData} />}
              {activeTab === 'offers' && <OffersManager />}
              {activeTab === 'settings' && <SchoolSettings user={user} />}
              {activeTab === 'help' && <DocumentationManager />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Invite Teacher Modal */}
      <InviteTeacherModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        schoolCode={user.school_code ?? undefined}
        schoolName={user.school_name ?? undefined}
      />
    </div>
  )
}

// Schools Manager Component - For superadmin to manage all schools
function SchoolsManager() {
  const { t } = useAdminLanguage()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t.manageSchools}</h2>
          <p className="text-muted-foreground">{t.viewAndManageSchools}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Building2 className="h-4 w-4" />
          {t.addSchool}
        </button>
      </div>

      {/* Placeholder for schools list */}
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">{t.schoolsManagement}</h3>
        <p className="text-muted-foreground mb-4">
          {t.schoolsManagementDesc}
        </p>
        <p className="text-sm text-muted-foreground">
          {t.comingSoon}
        </p>
      </div>
    </div>
  )
}

// Overview Tab Component - Simple HTML elements
interface AdminData {
  totalQuestions: number;
  totalUsers: number;
  totalGamesPlayed: number;
  averageAccuracy: number;
  recentGames: Array<{ id: string; student_name?: string; subject: string; accuracy: number; completed_at: string; grade?: number; questions_answered?: number }>;
  isLoading: boolean;
}

function OverviewTab({ user, adminData, onExportData, onSetActiveTab, onInviteTeacher, isSuperadmin: _isSuperadmin = false }: {
  user: User;
  adminData: AdminData;
  onExportData: () => Promise<void>;
  onSetActiveTab: (tab: ActiveTab) => void;
  onInviteTeacher: () => void;
  isSuperadmin?: boolean;
}) {
  const { totalQuestions, totalUsers, totalGamesPlayed, averageAccuracy, recentGames, isLoading } = adminData
  const { t } = useAdminLanguage()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: t.totalQuestions,
      value: totalQuestions.toLocaleString(),
      change: totalQuestions > 0 ? t.active : t.setupNeeded,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: t.schoolUsers,
      value: totalUsers.toString(),
      change: totalUsers > 1 ? t.active : t.setupNeeded,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: t.gamesPlayed,
      value: totalGamesPlayed.toLocaleString(),
      change: totalGamesPlayed > 0 ? t.active : t.noGames,
      icon: Trophy,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      title: t.avgAccuracy,
      value: averageAccuracy > 0 ? `${averageAccuracy}%` : t.noData,
      change: averageAccuracy > 75 ? t.good : averageAccuracy > 0 ? t.fair : t.noData,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    }
  ]

  const quickActions = [
    {
      icon: Plus,
      label: t.addQuestionsLabel,
      description: t.addQuestionsDesc,
      onClick: () => onSetActiveTab('questions'),
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900",
      dropdownItems: [
        { label: t.uploadCSV, onClick: () => onSetActiveTab('questions') },
        { label: t.createManually, onClick: () => onSetActiveTab('questions') },
        { label: t.importFromTemplate, onClick: () => onSetActiveTab('questions') },
      ]
    },
    {
      icon: Users,
      label: t.inviteTeacherLabel,
      description: t.inviteTeacherDesc,
      onClick: onInviteTeacher,
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900",
      dropdownItems: [
        { label: t.inviteTeachers, onClick: onInviteTeacher },
        { label: t.inviteParents, onClick: onInviteTeacher },
        { label: t.manageUsersAction, onClick: () => onSetActiveTab('users') },
      ]
    },
    {
      icon: Download,
      label: t.exportDataLabel,
      description: t.exportDataDesc,
      onClick: onExportData,
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900",
      dropdownItems: [
        { label: t.exportAllData, onClick: onExportData },
        { label: t.exportUsers, onClick: onExportData },
        { label: t.exportQuestions, onClick: onExportData },
        { label: t.exportAnalytics, onClick: onExportData },
      ]
    },
    {
      icon: Activity,
      label: t.viewAnalyticsLabel,
      description: t.viewAnalyticsDesc,
      onClick: () => onSetActiveTab('analytics'),
      color: "text-orange-600",
      bgColor: "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950 dark:hover:bg-orange-900",
      dropdownItems: [
        { label: t.performanceAnalytics, onClick: () => onSetActiveTab('analytics') },
        { label: t.userActivity, onClick: () => onSetActiveTab('analytics') },
        { label: t.questionStats, onClick: () => onSetActiveTab('analytics') },
      ]
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">{t.dashboardOverview}</h2>
        <p className="text-muted-foreground">{t.welcomeBack}, {user.full_name}. {t.welcomeMessage}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="relative overflow-hidden bg-card border border-border rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                    {stat.change}
                  </span>
                </div>
                <div className="mt-4 space-y-1">
                  <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5" />
            {t.quickActions}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t.commonAdminTasks}
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <div key={index} className="relative group">
                <div className={`h-auto p-4 flex flex-col items-start text-left border border-border rounded-lg ${action.bgColor} cursor-pointer hover:scale-105 transition-all duration-200`}>
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background">
                        <Icon className={`h-4 w-4 ${action.color}`} />
                      </div>
                      <span className="font-medium text-foreground">{action.label}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent/50 rounded transition-all">
                        <MoreVertical className="h-3 w-3 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>{action.label}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {action.dropdownItems?.map((item, itemIndex) => (
                          <DropdownMenuItem key={itemIndex} onClick={item.onClick}>
                            {item.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">{action.description}</p>
                  <button
                    onClick={action.onClick}
                    className="absolute inset-0 w-full h-full opacity-0"
                    aria-label={action.label}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5" />
            {t.recentGameSessions}
          </h3>
        </div>
        <div className="p-6">
          {recentGames.length > 0 ? (
            <div className="space-y-4">
              {recentGames.slice(0, 4).map((game) => (
                <div key={game.id} className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    game.accuracy >= 80 ? 'bg-green-500' : 
                    game.accuracy >= 60 ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground">
                      {game.student_name || t.student} {t.completed} {game.subject}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t.gradeLabel} {game.grade} • {game.questions_answered} {t.questionsLabel} • {Math.round(game.accuracy)}% {t.accuracyLabel}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(game.completed_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t.noGameSessionsYet}</p>
              <p className="text-sm text-muted-foreground">{t.studentsWillAppearHere}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Utility Functions - Note: These return English strings, components should use t.justNow, t.hAgo, t.dAgo when possible
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

export function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <AdminLanguageProvider>
      <AdminDashboardContent user={user} />
    </AdminLanguageProvider>
  )
}