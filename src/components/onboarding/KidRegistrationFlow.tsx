'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UsernameStep } from './UsernameStep'
import { AgeGradeStep } from './AgeGradeStep'
import { ConnectAccountStep } from './ConnectAccountStep'

type RegistrationStep = 'username' | 'age-grade' | 'connect'

interface KidRegistrationFlowProps {
  onComplete: (data: { name: string; grade: number; mode: 'school' | 'home' }) => void
}

export function KidRegistrationFlow({ onComplete }: KidRegistrationFlowProps) {
  const [step, setStep] = useState<RegistrationStep>('username')
  const [username, setUsername] = useState('')
  const [grade, setGrade] = useState<number>(3)

  // Handle username step completion
  const handleUsernameComplete = (name: string) => {
    console.log('Username step complete:', name)
    setUsername(name)
    setStep('age-grade')
  }

  // Handle age/grade step completion
  const handleAgeGradeComplete = (selectedGrade: number) => {
    console.log('Age/Grade step complete:', selectedGrade)
    setGrade(selectedGrade)
    setStep('connect')
  }

  // Handle connect step completion (skip or connect)
  const handleConnectComplete = (connected: boolean, _connectionType?: 'school' | 'parent' | 'google') => {
    console.log('Connect step complete:', connected ? 'Connected' : 'Skipped')
    // For now, we set mode based on whether they connected via school
    // If they skip or use parent/google, default to 'home' mode
    const mode = connected && _connectionType === 'school' ? 'school' : 'home'

    onComplete({
      name: username,
      grade: grade,
      mode: mode
    })
  }

  // Handle back navigation
  const handleBack = () => {
    if (step === 'age-grade') {
      setStep('username')
    } else if (step === 'connect') {
      setStep('age-grade')
    }
  }

  // Animation variants for step transitions
  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  }

  // Determine animation direction based on step changes
  const getDirection = () => {
    if (step === 'username') return 0
    if (step === 'age-grade') return 1
    return 1
  }

  return (
    <div className="w-full max-w-md mx-4">
      {/* Progress indicator */}
      <div className="flex justify-center gap-2 mb-6">
        <div className={`w-3 h-3 rounded-full transition-all ${step === 'username' ? 'bg-white scale-125' : 'bg-white/40'}`} />
        <div className={`w-3 h-3 rounded-full transition-all ${step === 'age-grade' ? 'bg-white scale-125' : 'bg-white/40'}`} />
        <div className={`w-3 h-3 rounded-full transition-all ${step === 'connect' ? 'bg-white scale-125' : 'bg-white/40'}`} />
      </div>

      <AnimatePresence mode="wait" custom={getDirection()}>
        {step === 'username' && (
          <motion.div
            key="username"
            custom={getDirection()}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <UsernameStep onNext={handleUsernameComplete} />
          </motion.div>
        )}

        {step === 'age-grade' && (
          <motion.div
            key="age-grade"
            custom={getDirection()}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <AgeGradeStep
              username={username}
              onNext={handleAgeGradeComplete}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {step === 'connect' && (
          <motion.div
            key="connect"
            custom={getDirection()}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <ConnectAccountStep
              username={username}
              grade={grade}
              onConnect={(method) => handleConnectComplete(true, method)}
              onSkip={() => handleConnectComplete(false)}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
