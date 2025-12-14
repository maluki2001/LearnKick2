'use client'

import { useEffect, useState, useMemo } from 'react'
import { Progress } from '@/components/ui/progress'
import { useLanguage } from '@/contexts/LanguageContext'

export type LoadingPhase =
  | 'initializing'
  | 'downloading-questions'
  | 'syncing-data'
  | 'preparing-match'
  | 'ready'

interface LoadingPhaseConfig {
  icon: string
  progressMin: number
  progressMax: number
}

const LOADING_PHASES: Record<LoadingPhase, LoadingPhaseConfig> = {
  'initializing': {
    icon: '🏟️',
    progressMin: 0,
    progressMax: 20
  },
  'downloading-questions': {
    icon: '📚',
    progressMin: 20,
    progressMax: 60
  },
  'syncing-data': {
    icon: '🔄',
    progressMin: 60,
    progressMax: 80
  },
  'preparing-match': {
    icon: '⚽',
    progressMin: 80,
    progressMax: 95
  },
  'ready': {
    icon: '🎯',
    progressMin: 95,
    progressMax: 100
  }
}

interface GameLoadingScreenProps {
  phase: LoadingPhase
  progress?: number
  arena?: 'soccer' | 'hockey'
  customMessage?: string
  questionsLoaded?: number
  totalQuestions?: number
}

export function GameLoadingScreen({
  phase,
  progress: externalProgress,
  arena = 'soccer',
  customMessage,
  questionsLoaded = 0,
  totalQuestions = 0
}: GameLoadingScreenProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [ballPosition, setBallPosition] = useState(0)
  const { t } = useLanguage()

  const phaseConfig = LOADING_PHASES[phase]

  // Get translated phase title and description based on phase
  const getPhaseTitle = (phase: LoadingPhase): string => {
    // Defensive check for translations not loaded - use German as fallback
    if (!t?.game?.loadingScreen) {
      const fallbacks: Record<LoadingPhase, string> = {
        'initializing': 'Stadion vorbereiten',
        'downloading-questions': 'Fragen laden',
        'syncing-data': 'Daten synchronisieren',
        'preparing-match': 'Spiel vorbereiten',
        'ready': 'Bereit!'
      }
      return fallbacks[phase]
    }
    switch (phase) {
      case 'initializing': return t.game.loadingScreen.preparingStadium
      case 'downloading-questions': return t.game.loadingScreen.loadingQuestions
      case 'syncing-data': return t.game.loadingScreen.syncingData
      case 'preparing-match': return t.game.loadingScreen.preparingMatch
      case 'ready': return t.game.loadingScreen.ready
    }
  }

  const getPhaseDescription = (phase: LoadingPhase): string => {
    // Defensive check for translations not loaded - use German as fallback
    if (!t?.game?.loadingScreen) {
      const fallbacks: Record<LoadingPhase, string> = {
        'initializing': 'Das Spielfeld wird vorbereitet...',
        'downloading-questions': 'Für Offline-Spiel herunterladen...',
        'syncing-data': 'Fortschritt wird gespeichert...',
        'preparing-match': 'Dein Team wird vorbereitet...',
        'ready': 'Los geht\'s!'
      }
      return fallbacks[phase]
    }
    switch (phase) {
      case 'initializing': return t.game.loadingScreen.settingUpField
      case 'downloading-questions': return t.game.loadingScreen.downloadingOffline
      case 'syncing-data': return t.game.loadingScreen.savingProgress
      case 'preparing-match': return t.game.loadingScreen.gettingTeamReady
      case 'ready': return t.game.loadingScreen.letsPlay
    }
  }

  // Get random tip in current language
  const tip = useMemo(() => {
    // Defensive check - fallback if translations not loaded yet
    if (!t?.game?.loadingScreen?.tips) {
      return 'Answer quickly for bonus points!'
    }
    const tips = [
      t.game.loadingScreen.tips.answerQuickly,
      t.game.loadingScreen.tips.streakBonus,
      t.game.loadingScreen.tips.practicePerfect,
      t.game.loadingScreen.tips.checkStats,
      arena === 'soccer'
        ? t.game.loadingScreen.tips.threeCorrectGoal
        : t.game.loadingScreen.tips.slidePuck,
      t.game.loadingScreen.tips.questionsAdapt,
      t.game.loadingScreen.tips.offlinePlay,
      t.game.loadingScreen.tips.improveCards
    ]
    return tips[Math.floor(Math.random() * tips.length)]
  }, [arena, t])

  // Calculate actual progress based on phase
  const calculatedProgress = externalProgress !== undefined
    ? externalProgress
    : phaseConfig.progressMin + ((phaseConfig.progressMax - phaseConfig.progressMin) / 2)

  // Animate progress smoothly
  useEffect(() => {
    const targetProgress = calculatedProgress
    const step = (targetProgress - animatedProgress) / 10

    if (Math.abs(targetProgress - animatedProgress) > 0.5) {
      const timer = setTimeout(() => {
        setAnimatedProgress(prev => prev + step)
      }, 30)
      return () => clearTimeout(timer)
    } else {
      setAnimatedProgress(targetProgress)
    }
  }, [calculatedProgress, animatedProgress])

  // Animate ball bouncing
  useEffect(() => {
    const interval = setInterval(() => {
      setBallPosition(prev => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Get arena-specific styling
  const arenaColors = arena === 'soccer'
    ? {
        primary: 'from-green-600 to-green-800',
        accent: 'bg-green-500',
        ball: '⚽',
        fieldPattern: 'bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.1)_49%,rgba(255,255,255,0.1)_51%,transparent_51%)]'
      }
    : {
        primary: 'from-blue-600 to-blue-900',
        accent: 'bg-blue-500',
        ball: '🏒',
        fieldPattern: 'bg-[linear-gradient(0deg,transparent_49%,rgba(255,255,255,0.1)_49%,rgba(255,255,255,0.1)_51%,transparent_51%)]'
      }

  // Ball bounce animation
  const bounceY = Math.sin(ballPosition * 0.1) * 20
  const bounceX = (ballPosition / 100) * 80 + 10

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b ${arenaColors.primary}`}>
      {/* Stadium lights effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-yellow-300/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Field pattern */}
      <div className={`absolute inset-0 ${arenaColors.fieldPattern} bg-[size:100px_100px] opacity-30`} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 max-w-md w-full">

        {/* Animated ball */}
        <div
          className="relative w-full h-24 mb-4"
          aria-hidden="true"
        >
          <div
            className="absolute text-5xl transition-transform"
            style={{
              left: `${bounceX}%`,
              top: `${50 + bounceY}%`,
              transform: `translate(-50%, -50%) rotate(${ballPosition * 10}deg)`
            }}
          >
            {arenaColors.ball}
          </div>

          {/* Ball shadow */}
          <div
            className="absolute w-12 h-3 bg-black/30 rounded-full blur-sm"
            style={{
              left: `${bounceX}%`,
              top: '80%',
              transform: `translateX(-50%) scaleX(${1 - Math.abs(bounceY) / 40})`
            }}
          />
        </div>

        {/* Phase icon */}
        <div className="text-6xl animate-bounce">
          {phaseConfig.icon}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center">
          {getPhaseTitle(phase)}
        </h2>

        {/* Description */}
        <p className="text-white/80 text-center">
          {customMessage || getPhaseDescription(phase)}
        </p>

        {/* Questions counter (when downloading) */}
        {phase === 'downloading-questions' && totalQuestions > 0 && (
          <div className="text-white/60 text-sm">
            {questionsLoaded} / {totalQuestions} {t?.game?.loadingScreen?.questions || 'questions'}
          </div>
        )}

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <Progress
            value={animatedProgress}
            className="h-3 bg-white/20"
          />
          <div className="flex justify-between mt-2 text-xs text-white/60">
            <span>{Math.round(animatedProgress)}%</span>
            <span>{phase === 'ready' ? (t?.game?.loadingScreen?.complete || 'Complete!') : (t?.game?.loading || 'Loading...')}</span>
          </div>
        </div>

        {/* Loading dots animation */}
        {phase !== 'ready' && (
          <div className="flex gap-2 mt-4">
            <div className="w-3 h-3 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {/* Tips section */}
        <div className="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur-sm max-w-xs">
          <p className="text-sm text-white/70 text-center">
            <span className="font-semibold text-white">💡 {t?.game?.loadingScreen?.tip || 'Tip'}:</span>{' '}
            {tip}
          </p>
        </div>
      </div>

      {/* Bottom decoration - field lines */}
      <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
        <div className={`absolute inset-0 ${arenaColors.accent} opacity-20`} />
        <svg
          className="absolute bottom-0 w-full h-full text-white/10"
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
        >
          {arena === 'soccer' ? (
            <>
              {/* Soccer field pattern */}
              <rect x="0" y="0" width="400" height="80" fill="none" stroke="currentColor" strokeWidth="2" />
              <line x1="200" y1="0" x2="200" y2="80" stroke="currentColor" strokeWidth="2" />
              <circle cx="200" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
            </>
          ) : (
            <>
              {/* Hockey rink pattern */}
              <rect x="0" y="0" width="400" height="80" rx="40" fill="none" stroke="currentColor" strokeWidth="2" />
              <line x1="133" y1="0" x2="133" y2="80" stroke="currentColor" strokeWidth="2" />
              <line x1="267" y1="0" x2="267" y2="80" stroke="currentColor" strokeWidth="2" />
              <circle cx="200" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
            </>
          )}
        </svg>
      </div>
    </div>
  )
}

// Hook for managing loading phases
export function useLoadingPhases() {
  const [phase, setPhase] = useState<LoadingPhase>('initializing')
  const [progress, setProgress] = useState(0)
  const [questionsLoaded, setQuestionsLoaded] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)

  const updatePhase = (newPhase: LoadingPhase) => {
    const config = LOADING_PHASES[newPhase]
    setPhase(newPhase)
    setProgress(config.progressMin)
  }

  const updateProgress = (newProgress: number) => {
    setProgress(Math.min(100, Math.max(0, newProgress)))
  }

  const updateQuestionsProgress = (loaded: number, total: number) => {
    setQuestionsLoaded(loaded)
    setTotalQuestions(total)

    // Calculate progress within the downloading-questions phase
    const phaseConfig = LOADING_PHASES['downloading-questions']
    const phaseProgress = total > 0
      ? phaseConfig.progressMin + ((loaded / total) * (phaseConfig.progressMax - phaseConfig.progressMin))
      : phaseConfig.progressMin
    setProgress(phaseProgress)
  }

  const completeLoading = () => {
    setPhase('ready')
    setProgress(100)
  }

  return {
    phase,
    progress,
    questionsLoaded,
    totalQuestions,
    updatePhase,
    updateProgress,
    updateQuestionsProgress,
    completeLoading
  }
}

export default GameLoadingScreen
