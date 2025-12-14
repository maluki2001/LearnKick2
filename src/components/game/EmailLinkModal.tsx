'use client'

import React, { useState, useEffect } from 'react'
import { usePlayerProfile } from '@/contexts/PlayerProfileContext'
import { TermsModal } from './TermsModal'

// Inline translations for email linking
const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Link Your Account',
    titleLinked: 'Account Linked',
    description: 'Link your account to an email so you never lose your progress. You can use this email to login on any device.',
    emailPlaceholder: 'Enter your email',
    sendCode: 'Send Verification Code',
    sending: 'Sending...',
    codeSent: 'Code sent! Check your email',
    codeDescription: 'Enter the 6-digit code we sent to your email',
    codePlaceholder: '000000',
    verify: 'Verify',
    verifying: 'Verifying...',
    success: 'Email linked successfully!',
    close: 'Close',
    cancel: 'Cancel',
    emailLinked: 'Your account is linked to:',
    changeEmail: 'Change Email',
    resendCode: 'Resend Code',
    // Login flow
    loginTitle: 'Login with Email',
    loginDescription: 'Enter your email to access your existing account from a new device',
    loginCodeDescription: 'Enter the 6-digit code we sent to your email to login',
    login: 'Login',
    switchToLogin: 'Already have an account? Login',
    switchToLink: 'Want to link current account?',
    noAccount: 'No account found with this email',
    // Terms
    termsLink: 'Privacy & Terms',
    termsNotice: 'By continuing, you agree to our',
    // Errors
    invalidEmail: 'Please enter a valid email',
    invalidCode: 'Please enter a 6-digit code',
    error: 'Something went wrong. Please try again.',
  },
  de: {
    title: 'Konto verknüpfen',
    titleLinked: 'Konto verknüpft',
    description: 'Verknüpfe dein Konto mit einer E-Mail, damit du deinen Fortschritt nie verlierst. Du kannst diese E-Mail verwenden, um dich auf jedem Gerät anzumelden.',
    emailPlaceholder: 'E-Mail eingeben',
    sendCode: 'Bestätigungscode senden',
    sending: 'Wird gesendet...',
    codeSent: 'Code gesendet! Überprüfe deine E-Mail',
    codeDescription: 'Gib den 6-stelligen Code ein, den wir an deine E-Mail gesendet haben',
    codePlaceholder: '000000',
    verify: 'Bestätigen',
    verifying: 'Wird überprüft...',
    success: 'E-Mail erfolgreich verknüpft!',
    close: 'Schliessen',
    cancel: 'Abbrechen',
    emailLinked: 'Dein Konto ist verknüpft mit:',
    changeEmail: 'E-Mail ändern',
    resendCode: 'Code erneut senden',
    // Login flow
    loginTitle: 'Mit E-Mail anmelden',
    loginDescription: 'Gib deine E-Mail ein, um auf dein bestehendes Konto von einem neuen Gerät zuzugreifen',
    loginCodeDescription: 'Gib den 6-stelligen Code ein, den wir an deine E-Mail gesendet haben, um dich anzumelden',
    login: 'Anmelden',
    switchToLogin: 'Hast du bereits ein Konto? Anmelden',
    switchToLink: 'Aktuelles Konto verknüpfen?',
    noAccount: 'Kein Konto mit dieser E-Mail gefunden',
    // Terms
    termsLink: 'Datenschutz & Bedingungen',
    termsNotice: 'Mit dem Fortfahren stimmst du unseren zu',
    // Errors
    invalidEmail: 'Bitte gib eine gültige E-Mail ein',
    invalidCode: 'Bitte gib einen 6-stelligen Code ein',
    error: 'Etwas ist schief gelaufen. Bitte versuche es erneut.',
  },
  fr: {
    title: 'Lier votre compte',
    titleLinked: 'Compte lié',
    description: 'Liez votre compte à un email pour ne jamais perdre votre progression. Vous pouvez utiliser cet email pour vous connecter sur n\'importe quel appareil.',
    emailPlaceholder: 'Entrez votre email',
    sendCode: 'Envoyer le code',
    sending: 'Envoi...',
    codeSent: 'Code envoyé! Vérifiez votre email',
    codeDescription: 'Entrez le code à 6 chiffres que nous avons envoyé à votre email',
    codePlaceholder: '000000',
    verify: 'Vérifier',
    verifying: 'Vérification...',
    success: 'Email lié avec succès!',
    close: 'Fermer',
    cancel: 'Annuler',
    emailLinked: 'Votre compte est lié à:',
    changeEmail: 'Changer d\'email',
    resendCode: 'Renvoyer le code',
    // Login flow
    loginTitle: 'Connexion avec email',
    loginDescription: 'Entrez votre email pour accéder à votre compte existant depuis un nouvel appareil',
    loginCodeDescription: 'Entrez le code à 6 chiffres que nous avons envoyé à votre email pour vous connecter',
    login: 'Se connecter',
    switchToLogin: 'Vous avez déjà un compte? Connectez-vous',
    switchToLink: 'Lier le compte actuel?',
    noAccount: 'Aucun compte trouvé avec cet email',
    // Terms
    termsLink: 'Confidentialité & Conditions',
    termsNotice: 'En continuant, vous acceptez nos',
    // Errors
    invalidEmail: 'Veuillez entrer un email valide',
    invalidCode: 'Veuillez entrer un code à 6 chiffres',
    error: 'Une erreur s\'est produite. Veuillez réessayer.',
  },
  sq: {
    title: 'Lidh llogarinë',
    titleLinked: 'Llogaria e lidhur',
    description: 'Lidhe llogarinë tënde me një email që të mos humbasësh kurrë përparimin. Mund ta përdorësh këtë email për t\'u kyçur në çdo pajisje.',
    emailPlaceholder: 'Shkruaj emailin',
    sendCode: 'Dërgo kodin e verifikimit',
    sending: 'Duke dërguar...',
    codeSent: 'Kodi u dërgua! Kontrollo emailin',
    codeDescription: 'Shkruaj kodin 6-shifror që të dërguam në email',
    codePlaceholder: '000000',
    verify: 'Verifiko',
    verifying: 'Duke verifikuar...',
    success: 'Emaili u lidh me sukses!',
    close: 'Mbyll',
    cancel: 'Anulo',
    emailLinked: 'Llogaria jote është e lidhur me:',
    changeEmail: 'Ndrysho emailin',
    resendCode: 'Ridërgo kodin',
    // Login flow
    loginTitle: 'Kyçu me email',
    loginDescription: 'Shkruaj emailin për të aksesuar llogarinë ekzistuese nga një pajisje e re',
    loginCodeDescription: 'Shkruaj kodin 6-shifror që të dërguam në email për t\'u kyçur',
    login: 'Kyçu',
    switchToLogin: 'Ke tashmë një llogari? Kyçu',
    switchToLink: 'Dëshiron të lidhësh llogarinë aktuale?',
    noAccount: 'Nuk u gjet llogari me këtë email',
    // Terms
    termsLink: 'Privatësia & Kushtet',
    termsNotice: 'Duke vazhduar, pranon',
    // Errors
    invalidEmail: 'Ju lutem shkruani një email të vlefshëm',
    invalidCode: 'Ju lutem shkruani një kod 6-shifror',
    error: 'Diçka shkoi keq. Ju lutem provoni përsëri.',
  }
}

interface EmailLinkModalProps {
  isOpen: boolean
  onClose: () => void
  language?: string
  mode?: 'link' | 'login' // 'link' = link current account, 'login' = login with existing email
}

export function EmailLinkModal({ isOpen, onClose, language = 'de', mode: initialMode = 'link' }: EmailLinkModalProps) {
  const { profile, preferences, requestEmailVerification, verifyEmailCode, loginWithEmail, verifyLoginCode } = usePlayerProfile()

  const [mode, setMode] = useState<'link' | 'login'>(initialMode)
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTerms, setShowTerms] = useState(false)

  const uiLanguage = preferences.uiLanguage || language
  const texts = translations[uiLanguage] || translations.de

  // Reset state when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setStep('email')
      setEmail('')
      setCode('')
      setError('')
      setMode(initialMode)
    }
  }, [isOpen, initialMode])

  // Check if email is already linked
  const isAlreadyLinked = profile?.emailVerified && profile?.email

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      setError(texts.invalidEmail)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      let result
      if (mode === 'link') {
        result = await requestEmailVerification(email)
      } else {
        result = await loginWithEmail(email)
      }

      if (result.success) {
        setStep('code')
      } else {
        setError(result.error || texts.error)
      }
    } catch {
      setError(texts.error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError(texts.invalidCode)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      let result
      if (mode === 'link') {
        result = await verifyEmailCode(email, code)
      } else {
        result = await verifyLoginCode(email, code)
      }

      if (result.success) {
        setStep('success')
      } else {
        setError(result.error || texts.error)
      }
    } catch {
      setError(texts.error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setCode('')
    setError('')
    await handleSendCode()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-white/10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            {step === 'success' ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {step === 'success'
              ? (mode === 'link' ? texts.titleLinked : texts.success)
              : (mode === 'link' ? texts.title : texts.loginTitle)
            }
          </h2>
          {step === 'email' && (
            <p className="text-gray-400 mt-2 text-sm">
              {mode === 'link' ? texts.description : texts.loginDescription}
            </p>
          )}
          {step === 'code' && (
            <p className="text-gray-400 mt-2 text-sm">
              {mode === 'link' ? texts.codeDescription : texts.loginCodeDescription}
            </p>
          )}
        </div>

        {/* Already linked state */}
        {isAlreadyLinked && mode === 'link' && step === 'email' && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <p className="text-green-400 text-sm text-center">
              {texts.emailLinked}
            </p>
            <p className="text-white font-medium text-center mt-1">
              {profile.email}
            </p>
          </div>
        )}

        {/* Email input step */}
        {step === 'email' && (
          <div className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={texts.emailPlaceholder}
                className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            {/* Terms notice */}
            <p className="text-xs text-gray-400 text-center">
              {texts.termsNotice}{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-green-400 hover:text-green-300 underline transition-colors"
              >
                {texts.termsLink}
              </button>
            </p>

            <button
              onClick={handleSendCode}
              disabled={isLoading || !email}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? texts.sending : texts.sendCode}
            </button>

            {/* Mode toggle */}
            {profile && (
              <button
                onClick={() => setMode(mode === 'link' ? 'login' : 'link')}
                className="w-full text-sm text-gray-400 hover:text-white transition-colors"
              >
                {mode === 'link' ? texts.switchToLogin : texts.switchToLink}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2 text-gray-400 hover:text-white transition-colors"
            >
              {texts.cancel}
            </button>
          </div>
        )}

        {/* Code verification step */}
        {step === 'code' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <p className="text-green-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {texts.codeSent}
              </p>
            </div>

            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={texts.codePlaceholder}
                className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white text-center text-2xl tracking-[0.5em] font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                maxLength={6}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleVerifyCode}
              disabled={isLoading || code.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? texts.verifying : (mode === 'link' ? texts.verify : texts.login)}
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleResendCode}
                disabled={isLoading}
                className="flex-1 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                {texts.resendCode}
              </button>
              <button
                onClick={() => {
                  setStep('email')
                  setCode('')
                  setError('')
                }}
                className="flex-1 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                {texts.cancel}
              </button>
            </div>
          </div>
        )}

        {/* Success step */}
        {step === 'success' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-green-400 font-medium">{texts.success}</p>
              {email && (
                <p className="text-white mt-2">{email}</p>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              {texts.close}
            </button>
          </div>
        )}
      </div>

      {/* Terms & Privacy Modal */}
      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        language={uiLanguage}
      />
    </div>
  )
}

export default EmailLinkModal
