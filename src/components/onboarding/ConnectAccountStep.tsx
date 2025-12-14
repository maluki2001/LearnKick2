'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

interface ConnectAccountStepProps {
  username: string
  grade: number
  onConnect: (method: 'school' | 'parent' | 'google') => void
  onSkip: () => void
  onBack: () => void
}

type ConnectionMethod = 'school' | 'parent' | 'google' | null

interface ConnectionOption {
  id: ConnectionMethod
  emoji: string
  title: string
  description: string
  color: string
  hoverColor: string
}

export function ConnectAccountStep({ username, grade, onConnect, onSkip, onBack }: ConnectAccountStepProps) {
  const { t } = useLanguage()
  const [selectedMethod, setSelectedMethod] = useState<ConnectionMethod>(null)
  const [showSchoolCodeInput, setShowSchoolCodeInput] = useState(false)
  const [showParentEmailInput, setShowParentEmailInput] = useState(false)
  const [schoolCode, setSchoolCode] = useState('')
  const [parentEmail, setParentEmail] = useState('')

  const connectionOptions: ConnectionOption[] = [
    {
      id: 'school',
      emoji: '🏫',
      title: t.kidRegistration?.schoolCode || 'Schulcode eingeben',
      description: t.kidRegistration?.schoolCodeDesc || 'Mit deiner Schule spielen',
      color: 'from-blue-100 to-blue-200',
      hoverColor: 'hover:from-blue-200 hover:to-blue-300'
    },
    {
      id: 'parent',
      emoji: '👨‍👩‍👧',
      title: t.kidRegistration?.parentEmail || 'Eltern-Email',
      description: t.kidRegistration?.parentEmailDesc || 'Eltern konnen zusehen',
      color: 'from-purple-100 to-purple-200',
      hoverColor: 'hover:from-purple-200 hover:to-purple-300'
    },
    {
      id: 'google',
      emoji: '🔵',
      title: t.kidRegistration?.googleSignIn || 'Mit Google anmelden',
      description: t.kidRegistration?.googleDesc || 'Schnell & einfach',
      color: 'from-red-100 to-orange-100',
      hoverColor: 'hover:from-red-200 hover:to-orange-200'
    }
  ]

  const benefits = [
    { emoji: '💾', text: t.kidRegistration?.benefitSave || 'Fortschritt speichern' },
    { emoji: '📱', text: t.kidRegistration?.benefitDevices || 'Auf anderen Geraten spielen' },
    { emoji: '👥', text: t.kidRegistration?.benefitFriends || 'Freunde hinzufugen' }
  ]

  const handleMethodClick = (method: ConnectionMethod) => {
    if (method === 'school') {
      setShowSchoolCodeInput(true)
      setShowParentEmailInput(false)
      setSelectedMethod('school')
    } else if (method === 'parent') {
      setShowParentEmailInput(true)
      setShowSchoolCodeInput(false)
      setSelectedMethod('parent')
    } else if (method === 'google') {
      // TODO: Trigger Google OAuth
      onConnect('google')
    }
  }

  const handleSchoolCodeSubmit = () => {
    if (schoolCode.trim().length >= 4) {
      // TODO: Validate school code via API
      onConnect('school')
    }
  }

  const handleParentEmailSubmit = () => {
    if (parentEmail.includes('@') && parentEmail.includes('.')) {
      // TODO: Send verification email to parent
      onConnect('parent')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl"
    >
      {/* Header with back and skip */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← {t.kidRegistration?.back || 'Zuruck'}
        </button>
        <button
          onClick={onSkip}
          className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
        >
          {t.kidRegistration?.skip || 'Uberspringen'}
        </button>
      </div>

      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-2">
        🔗 {t.kidRegistration?.saveProgress || 'Speichere deinen Fortschritt!'}
      </h2>

      <p className="text-gray-500 text-center text-sm mb-6">
        {t.kidRegistration?.connectOptional || 'Optional - du kannst auch spater verbinden'}
      </p>

      {/* Connection options */}
      {!showSchoolCodeInput && !showParentEmailInput && (
        <div className="space-y-3 mb-6">
          {connectionOptions.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleMethodClick(option.id)}
              className={`w-full p-4 rounded-xl bg-gradient-to-r ${option.color} ${option.hoverColor}
                         text-left transition-all border-2 border-transparent hover:border-gray-200 hover:shadow-md`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{option.emoji}</span>
                <div>
                  <div className="font-semibold text-gray-800">{option.title}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* School code input */}
      {showSchoolCodeInput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => setShowSchoolCodeInput(false)}
            className="text-gray-500 text-sm mb-3 hover:text-gray-700"
          >
            ← {t.kidRegistration?.backToOptions || 'Zuruck zu Optionen'}
          </button>

          <div className="text-center mb-4">
            <span className="text-4xl">🏫</span>
            <h3 className="font-semibold text-gray-800 mt-2">
              {t.kidRegistration?.enterSchoolCode || 'Schulcode eingeben'}
            </h3>
          </div>

          <input
            type="text"
            value={schoolCode}
            onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={10}
            className="w-full p-4 rounded-xl border-2 border-gray-300 text-gray-800 text-xl font-mono text-center
                       focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 uppercase
                       transition-all duration-200 placeholder:text-gray-400"
            autoFocus
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSchoolCodeSubmit}
            disabled={schoolCode.trim().length < 4}
            className={`w-full py-3 rounded-xl font-bold text-lg mt-4 transition-all ${
              schoolCode.trim().length >= 4
                ? 'bg-blue-500 text-white shadow-lg hover:bg-blue-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {t.kidRegistration?.connect || 'Verbinden'}
          </motion.button>
        </motion.div>
      )}

      {/* Parent email input */}
      {showParentEmailInput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => setShowParentEmailInput(false)}
            className="text-gray-500 text-sm mb-3 hover:text-gray-700"
          >
            ← {t.kidRegistration?.backToOptions || 'Zuruck zu Optionen'}
          </button>

          <div className="text-center mb-4">
            <span className="text-4xl">👨‍👩‍👧</span>
            <h3 className="font-semibold text-gray-800 mt-2">
              {t.kidRegistration?.enterParentEmail || 'Eltern-Email eingeben'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {t.kidRegistration?.parentEmailNote || 'Deine Eltern bekommen eine Bestatigung'}
            </p>
          </div>

          <input
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            placeholder="eltern@email.de"
            className="w-full p-4 rounded-xl border-2 border-gray-300 text-gray-800 text-lg text-center
                       focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20
                       transition-all duration-200 placeholder:text-gray-400"
            autoFocus
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleParentEmailSubmit}
            disabled={!parentEmail.includes('@') || !parentEmail.includes('.')}
            className={`w-full py-3 rounded-xl font-bold text-lg mt-4 transition-all ${
              parentEmail.includes('@') && parentEmail.includes('.')
                ? 'bg-purple-500 text-white shadow-lg hover:bg-purple-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {t.kidRegistration?.sendToParents || 'An Eltern senden'}
          </motion.button>
        </motion.div>
      )}

      {/* Benefits */}
      {!showSchoolCodeInput && !showParentEmailInput && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">
            {t.kidRegistration?.whyConnect || 'Warum verbinden?'}
          </div>
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                <span>{benefit.emoji}</span>
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skip button (prominent) */}
      {!showSchoolCodeInput && !showParentEmailInput && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSkip}
          className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-xl hover:shadow-2xl transition-all"
        >
          {t.kidRegistration?.playNow || 'Jetzt spielen!'} 🎮
        </motion.button>
      )}
    </motion.div>
  )
}
