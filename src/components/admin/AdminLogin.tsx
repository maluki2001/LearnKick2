'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { authClient } from '@/lib/useAuth'
import { Shield } from 'lucide-react'
import { AuthDebugPanel } from './AuthDebugPanel'
import { useAdminTranslation } from '@/lib/adminTranslations'

type LoginMode = 'signin' | 'signup-admin' | 'signup-parent'

export function AdminLogin() {
  const { t } = useAdminTranslation('en') // Default to English for login page
  const [mode, setMode] = useState<LoginMode>('signin')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [schoolCode, setSchoolCode] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await authClient.signIn(email, password)
      console.log('✅ Sign in successful - auth state will update automatically')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUpAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError(t.passwordMismatch)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await authClient.signUpSchoolAdmin({
        email,
        password,
        fullName,
        schoolName,
        schoolCode
      })
      console.log('✅ School admin signup successful')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create admin account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUpParent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError(t.passwordMismatch)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await authClient.signUpParent({
        email,
        password,
        fullName,
        schoolCode
      })
      console.log('✅ Parent signup successful')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create parent account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Corporate background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-slate-700/50 relative z-10"
      >
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-white">{t.title}</h1>
                <p className="text-slate-300 text-sm">{t.educationalManagementSystem}</p>
              </div>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
          </div>

          {/* Mode selection tabs */}
          <div className="flex bg-slate-700/50 rounded-xl p-1.5 mb-8 border border-slate-600/30">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'signin'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              {t.signIn}
            </button>
            <button
              onClick={() => setMode('signup-admin')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'signup-admin'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              {t.schoolAdmin}
            </button>
            <button
              onClick={() => setMode('signup-parent')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'signup-parent'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              {t.parent}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-900/50 border border-red-700/50 rounded-lg backdrop-blur-sm"
            >
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <motion.form
              key="signin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSignIn}
              className="space-y-4"
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-2">{t.welcomeBack}</h2>
                <p className="text-slate-300 text-sm">{t.signInToDashboard}</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm"
                    placeholder={t.emailPlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    {t.password}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm"
                    placeholder={t.passwordPlaceholder}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-xl font-medium shadow-lg shadow-emerald-500/25 mt-6 transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t.signingIn}</span>
                  </div>
                ) : (
                  t.signInToDashboard
                )}
              </Button>
            </motion.form>
          )}

          {/* School Admin Signup Form */}
          {mode === 'signup-admin' && (
            <motion.form
              key="signup-admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSignUpAdmin}
              className="space-y-4"
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-2">{t.createSchoolAdmin}</h2>
                <p className="text-slate-300 text-sm">{t.createSchoolAccount}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">{t.fullName}</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm"
                    placeholder={t.fullNamePlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">{t.schoolName}</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm"
                    placeholder={t.schoolNamePlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">{t.email}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm"
                    placeholder={t.emailPlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">{t.password}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm"
                    placeholder={t.createPasswordPlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">{t.confirmPassword}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm"
                    placeholder={t.confirmPasswordPlaceholder}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-medium shadow-lg"
              >
                {isLoading ? t.creating : t.createAdminAccount}
              </Button>
            </motion.form>
          )}

          {/* Parent Signup Form */}
          {mode === 'signup-parent' && (
            <motion.form
              key="signup-parent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSignUpParent}
              className="space-y-4"
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-2">{t.createParentAccount}</h2>
                <p className="text-slate-300 text-sm">{t.joinChildLearningJourney}</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">{t.fullName}</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm"
                    placeholder={t.fullNamePlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">{t.email}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm"
                    placeholder={t.parentEmailPlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">{t.schoolCode}</label>
                  <input
                    type="text"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm"
                    placeholder={t.schoolCodePlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">{t.password}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm"
                    placeholder={t.createPasswordPlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">{t.confirmPassword}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm"
                    placeholder={t.confirmPasswordPlaceholder}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-medium shadow-lg"
              >
                {isLoading ? t.creating : t.createParentAccount}
              </Button>
            </motion.form>
          )}

          {/* Debug panel in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6">
              <AuthDebugPanel />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}