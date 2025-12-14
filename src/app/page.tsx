'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { KidRegistrationFlow } from '@/components/onboarding/KidRegistrationFlow'
import { SettingsModal } from '@/components/ui/SettingsModal'
import { GameLobby } from '@/components/game/GameLobby'
import { LiveMatchArena } from '@/components/game/LiveMatchArena'
import { QuestionCard } from '@/components/game/QuestionCard'
import { SoundControls } from '@/components/game/SoundControls'
import { unlockAudio } from '@/hooks/useSounds'
import { useSounds } from '@/hooks/useSounds'
import { MatchResults } from '@/components/match/MatchResults'
import { GameLoadingScreen, LoadingPhase } from '@/components/game/GameLoadingScreen'
import { useGameStore, usePlayerStates, useGameStatus } from '@/stores/gameStore'
import { usePlayerProfile, GamePreferences } from '@/contexts/PlayerProfileContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTeamStore } from '@/stores/teamStore'
import { ElixirBadge } from '@/components/elixir'
import { TrainingModal } from '@/components/team/TrainingModal'
import { AccessibilitySettings as AccessibilitySettingsType, DEFAULT_ACCESSIBILITY_SETTINGS } from '@/types/accessibility'
import { motion } from 'framer-motion'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import type { Question } from '@/types/questions'
import type { PlayerCard } from '@/types/team'
import type { Translations } from '@/lib/translations'

// Responsive Game Layout Component
// Adapts to screen size: Portrait = stacked, Landscape = side-by-side
interface ActiveGameLayoutProps {
  profile: { name: string; elo: number }
  team: { elixir: number } | null
  preferences: { lastArena: 'soccer' | 'hockey' }
  accessibilitySettings: AccessibilitySettingsType
  status: string
  currentQuestion: Question | null
  pauseGame: () => void
  resumeGame: () => void
  handleBackToMenu: () => void
  t: Translations
  showTrainingModal: boolean
  setShowTrainingModal: (v: boolean) => void
  selectedCard: PlayerCard | null
  handleTrainCard: (id: string) => Promise<boolean>
  handleQuickLevelCard: (id: string) => Promise<boolean>
}

function ActiveGameLayout({
  profile,
  team,
  preferences,
  accessibilitySettings,
  status,
  currentQuestion,
  pauseGame,
  resumeGame,
  handleBackToMenu,
  t,
  showTrainingModal,
  setShowTrainingModal,
  selectedCard,
  handleTrainCard,
  handleQuickLevelCard,
}: ActiveGameLayoutProps) {
  const layout = useResponsiveLayout()

  // Background based on theme and arena
  const bgClass = accessibilitySettings.theme === 'high-contrast'
    ? 'bg-black text-white'
    : accessibilitySettings.theme === 'dark'
    ? 'bg-gradient-to-br from-gray-900 to-gray-700'
    : preferences.lastArena === 'soccer'
    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
    : 'bg-gradient-to-br from-blue-400 to-purple-500'

  // Shared question area content
  const questionContent = (
    <div className="h-full w-full max-w-lg mx-auto">
      {status === 'countdown' && (
        <div className="h-full flex flex-col items-center justify-center text-center text-white">
          <div className="text-3xl font-bold mb-2">{t.game.getReady}</div>
          <div className="text-sm">{t.game.gameStartsSoon}</div>
        </div>
      )}
      {status === 'active' && (
        <div className="h-full w-full flex flex-col">
          <div className="flex-1 min-h-0">
            {currentQuestion ? (
              <QuestionCard question={currentQuestion} />
            ) : (
              <div className="h-full bg-white rounded-xl shadow-lg flex items-center justify-center">
                <div className="text-lg font-bold text-gray-800">{t.game.loadingQuestion}</div>
              </div>
            )}
          </div>
          {/* Elixir tip below the card */}
          <div className="flex items-center justify-center gap-1 text-[10px] py-1 text-white/50">
            <span>⚡ {t.game.loadingScreen.elixirTip}</span>
          </div>
        </div>
      )}
      {status === 'paused' && (
        <div className="h-full flex flex-col items-center justify-center text-center text-white bg-black/50 rounded-xl">
          <div className="text-xl font-bold mb-2">{t.game.gamePaused}</div>
          <div className="text-xs opacity-80">{t.game.clickResume}</div>
        </div>
      )}
    </div>
  )

  // Header component (shared between both layouts)
  const header = (
    <div className="h-10 px-3 flex justify-between items-center flex-shrink-0">
      <div className="flex items-center space-x-2">
        <span className="text-white font-bold text-xs bg-white/20 px-2 py-0.5 rounded-lg truncate max-w-[80px]">
          {profile.name}
        </span>
        {team && <ElixirBadge current={team.elixir} />}
      </div>
      <div className="flex items-center space-x-1">
        {/* Sound controls */}
        <SoundControls compact />
        {status === 'active' && (
          <Button onClick={pauseGame} size="sm" variant="secondary" className="text-xs px-2 py-1 h-7">⏸️</Button>
        )}
        {status === 'paused' && (
          <Button onClick={resumeGame} size="sm" className="text-xs px-2 py-1 h-7">▶️</Button>
        )}
        <Button onClick={handleBackToMenu} size="sm" variant="outline" className="text-xs px-2 py-1 h-7 bg-white/10 border-white/30 text-white">✕</Button>
      </div>
    </div>
  )

  // SINGLE RETURN with conditional styling to prevent remounting
  // The key="live-arena" ensures React doesn't remount the component when layout changes
  return (
    <div className={`h-screen overflow-hidden flex flex-col ${bgClass}`}>
      {header}

      {/* Main content - responsive grid */}
      <div
        className={`flex-1 min-h-0 px-2 pb-2 grid gap-1`}
        style={{
          gridTemplateColumns: layout.isStacked ? '1fr' : '1fr 1fr',
          gridTemplateRows: layout.isStacked ? 'auto 1fr' : '1fr' // Arena takes only what it needs, questions fill the rest
        }}
      >
        {/* Arena container */}
        <div
          key="arena-container"
          className="min-h-0 overflow-hidden rounded-xl"
        >
          <LiveMatchArena
            key="live-arena"
            arena={preferences.lastArena}
            player1Name={profile.name}
            player2Name={t.game.aiRival}
          />
        </div>

        {/* Questions container */}
        <div
          key="questions-container"
          className="min-h-0 overflow-hidden"
        >
          {questionContent}
        </div>
      </div>

      <TrainingModal
        isOpen={showTrainingModal}
        onClose={() => setShowTrainingModal(false)}
        card={selectedCard}
        currentElixir={team?.elixir || 0}
        onTrain={handleTrainCard}
        onQuickLevel={handleQuickLevelCard}
      />
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const { t } = useLanguage()
  const {
    quickStart,
    resetGame,
    currentQuestion,
    pauseGame,
    resumeGame,
    matchResultData,
    showMatchResults,
    dismissMatchResults
  } = useGameStore()

  const { player1: p1, player2: p2 } = usePlayerStates()
  const { status, winner } = useGameStatus()

  const {
    profile,
    preferences,
    isLoading: profileLoading,
    isReturningUser,
    createProfile,
    updatePreferences,
    recordGameResult,
    clearProfile
  } = usePlayerProfile()

  // Team/Elixir state
  const { team, initializeTeam, resetDailyElixir, trainCard, quickLevelCard } = useTeamStore()
  const [showTrainingModal, setShowTrainingModal] = useState(false)

  // Sound and music controls
  const { startMusic, stopMusic, musicEnabled } = useSounds()
  const [selectedCardSubject] = useState<string | null>(null)

  // Handle training a player card
  const handleTrainCard = async (cardId: string): Promise<boolean> => {
    if (!team) return false
    const result = trainCard(cardId)
    return result.success
  }

  // Handle quick level training (50 elixir = +25 XP)
  const handleQuickLevelCard = async (cardId: string): Promise<boolean> => {
    if (!team) return false
    const result = quickLevelCard(cardId)
    return result.success
  }

  // Get selected card for training
  const selectedCard = (selectedCardSubject
    ? team?.cards.find(c => c.subject === selectedCardSubject)
    : team?.cards[0]) ?? null

  // Initialize team if user has profile but no team
  // Use a ref to track if we've already reset daily elixir to prevent re-runs
  const dailyElixirResetRef = useRef(false)
  useEffect(() => {
    if (profile && !team) {
      initializeTeam(profile.id, `${profile.name}'s Team`, 'soccer')
    }
    // Reset daily elixir cap check - only once per session
    if (team && !dailyElixirResetRef.current) {
      dailyElixirResetRef.current = true
      resetDailyElixir()
    }
  }, [profile, team, initializeTeam, resetDailyElixir])

  const [gameStarted, setGameStarted] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  const [gameError, setGameError] = useState<string | null>(null)
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('initializing')
  const [showSettings, setShowSettings] = useState(false)
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettingsType>(DEFAULT_ACCESSIBILITY_SETTINGS)
  const gameResultRecordedRef = useRef(false)

  // Load accessibility settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('learnkick_accessibility')
      if (saved) {
        const parsed = JSON.parse(saved)
        setAccessibilitySettings(parsed)
        applyAccessibilitySettings(parsed)
        console.log('✅ Loaded accessibility settings from localStorage')
      }
    } catch (error) {
      console.error('Failed to load accessibility settings:', error)
    }
  }, [])

  // Handle new user setup completion
  const handleQuickSetupComplete = async (data: { name: string; grade: number; mode: 'school' | 'home' }) => {
    console.log('🎉 handleQuickSetupComplete called with:', data)
    try {
      await createProfile(data.name, data.grade, data.mode)
      console.log('✅ Profile created successfully!')
    } catch (error) {
      console.error('❌ Failed to create profile:', error)
    }
  }

  // Track if current game is practice mode (no trophies)
  const [isPracticeMode, setIsPracticeMode] = useState(false)

  // Check for ?playAI=true to auto-start AI game (coming from multiplayer fallback)
  const [shouldStartAI, setShouldStartAI] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('playAI') === 'true') {
      console.log('🤖 Detected playAI=true, will start AI game')
      window.history.replaceState({}, '', '/')
      setShouldStartAI(true)
    }
  }, [])

  // Actually start AI game when flag is set and profile is ready
  useEffect(() => {
    if (shouldStartAI && profile && !profileLoading && !gameStarted && !isStartingGame) {
      console.log('🤖 Starting AI game from multiplayer fallback')
      setShouldStartAI(false)
      // Trigger AI battle directly
      startAIBattle()
    }
  }, [shouldStartAI, profile, profileLoading, gameStarted, isStartingGame])

  // Start AI battle function (used by fallback)
  const startAIBattle = async () => {
    unlockAudio()
    if (musicEnabled) startMusic()

    if (!profile) return

    console.log('🤖 Starting AI game...')
    setIsStartingGame(true)
    setIsPracticeMode(false)
    setGameError(null)
    setLoadingPhase('initializing')

    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      setLoadingPhase('downloading-questions')

      await quickStart({
        playerName: profile.name,
        playerElo: profile.elo,
        grade: preferences.grade,
        subject: preferences.lastSubject,
        language: preferences.lastQuestionLanguage,
        arena: preferences.lastArena
      })

      setLoadingPhase('syncing-data')
      await new Promise(resolve => setTimeout(resolve, 300))
      setLoadingPhase('preparing-match')
      await new Promise(resolve => setTimeout(resolve, 400))
      setLoadingPhase('ready')
      await new Promise(resolve => setTimeout(resolve, 500))

      setGameStarted(true)
    } catch (error) {
      console.error('❌ Failed to start AI game:', error)
      setGameError(error instanceof Error ? error.message : 'Failed to start game')
    } finally {
      setIsStartingGame(false)
    }
  }

  // Handle Invite Friend - navigate to multiplayer with new match
  const handleInviteFriend = () => {
    console.log('👥 Invite Friend clicked!')
    router.push('/multiplayer')
  }

  // Handle BATTLE button click - multiplayer first, AI fallback
  const handleBattle = async () => {
    // Unlock audio immediately on user tap (required for iOS/mobile PWA)
    unlockAudio()

    // Start background music if enabled
    if (musicEnabled) {
      startMusic()
    }

    console.log('🔥 BATTLE CLICKED!')
    console.log('📋 Profile:', profile)
    console.log('⚙️ Preferences:', preferences)

    if (!profile) {
      console.error('❌ No profile found!')
      return
    }

    // Check if user prefers AI opponent or wants multiplayer
    if (!preferences.playAgainstAI) {
      // Multiplayer mode - redirect to multiplayer page
      console.log('👥 Multiplayer mode - redirecting to /multiplayer')
      router.push('/multiplayer')
      return
    }

    // AI mode - start game against AI
    console.log('🤖 AI mode - Starting game against AI...')
    setIsStartingGame(true)
    setIsPracticeMode(false) // This is a ranked game
    setGameError(null)
    setLoadingPhase('initializing')

    try {
      // Phase 1: Initializing
      console.log('⚡ Phase 1: Initializing...')
      await new Promise(resolve => setTimeout(resolve, 300))

      // Phase 2: Downloading questions
      setLoadingPhase('downloading-questions')
      console.log('⚡ Phase 2: Downloading questions...')

      console.log('⚡ Calling quickStart with:', {
        playerName: profile.name,
        playerElo: profile.elo,
        grade: preferences.grade,
        subject: preferences.lastSubject,
        language: preferences.lastQuestionLanguage,
        arena: preferences.lastArena
      })

      await quickStart({
        playerName: profile.name,
        playerElo: profile.elo,
        grade: preferences.grade,
        subject: preferences.lastSubject,
        language: preferences.lastQuestionLanguage,
        arena: preferences.lastArena
      })

      // Phase 3: Syncing data
      setLoadingPhase('syncing-data')
      console.log('⚡ Phase 3: Syncing data...')
      await new Promise(resolve => setTimeout(resolve, 300))

      // Phase 4: Preparing match
      setLoadingPhase('preparing-match')
      console.log('⚡ Phase 4: Preparing match...')
      await new Promise(resolve => setTimeout(resolve, 400))

      // Phase 5: Ready
      setLoadingPhase('ready')
      console.log('✅ Phase 5: Ready!')
      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('✅ quickStart completed, setting gameStarted to true')
      setGameStarted(true)
    } catch (error) {
      console.error('❌ Failed to start game:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start game'
      setGameError(errorMessage)
    } finally {
      console.log('🏁 Setting isStartingGame to false')
      setIsStartingGame(false)
    }
  }

  // Handle PRACTICE button click - play without trophies (works offline)
  const handlePractice = async () => {
    // Unlock audio immediately on user tap (required for iOS/mobile PWA)
    unlockAudio()

    // Start background music if enabled
    if (musicEnabled) {
      startMusic()
    }

    console.log('📚 PRACTICE CLICKED!')
    console.log('📋 Profile:', profile)

    if (!profile) {
      console.error('❌ No profile found!')
      return
    }

    console.log('🎯 Starting PRACTICE game (no trophies)...')
    setIsStartingGame(true)
    setIsPracticeMode(true) // This is practice mode - no trophy changes
    setGameError(null)
    setLoadingPhase('initializing')

    try {
      // Phase 1: Initializing
      console.log('⚡ Phase 1: Initializing...')
      await new Promise(resolve => setTimeout(resolve, 300))

      // Phase 2: Downloading questions
      setLoadingPhase('downloading-questions')
      console.log('⚡ Phase 2: Downloading questions...')

      await quickStart({
        playerName: profile.name,
        playerElo: profile.elo,
        grade: preferences.grade,
        subject: preferences.lastSubject,
        language: preferences.lastQuestionLanguage,
        arena: preferences.lastArena
      })

      // Phase 3: Syncing data
      setLoadingPhase('syncing-data')
      console.log('⚡ Phase 3: Syncing data...')
      await new Promise(resolve => setTimeout(resolve, 300))

      // Phase 4: Preparing match
      setLoadingPhase('preparing-match')
      console.log('⚡ Phase 4: Preparing match...')
      await new Promise(resolve => setTimeout(resolve, 400))

      // Phase 5: Ready
      setLoadingPhase('ready')
      console.log('✅ Phase 5: Ready!')
      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('✅ Practice game started')
      setGameStarted(true)
    } catch (error) {
      console.error('❌ Failed to start practice game:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start practice game'
      setGameError(errorMessage)
    } finally {
      setIsStartingGame(false)
    }
  }

  // Handle game end - record results (only once per game)
  useEffect(() => {
    if (status === 'finished' && p1 && gameStarted && !gameResultRecordedRef.current) {
      gameResultRecordedRef.current = true
      const won = winner === 'player1'

      // In practice mode: No ELO changes (no trophies gained/lost)
      // In battle mode: Normal ELO changes
      const eloChange = isPracticeMode ? 0 : (won ? 25 : -15)

      console.log(`🎮 Game finished - Mode: ${isPracticeMode ? 'PRACTICE' : 'BATTLE'}, ELO Change: ${eloChange}`)

      recordGameResult({
        won,
        correctAnswers: p1.stats.correctAnswers,
        totalQuestions: p1.stats.correctAnswers + p1.stats.incorrectAnswers,
        streak: p1.stats.maxStreak,
        subject: preferences.lastSubject,
        eloChange // 0 for practice, ±25/15 for battle
      })
    }
  }, [status, winner, p1, gameStarted, recordGameResult, preferences.lastSubject, isPracticeMode])

  // Reset the ref when a new game starts
  useEffect(() => {
    if (status === 'active') {
      gameResultRecordedRef.current = false
    }
  }, [status])

  const handleBackToMenu = () => {
    // Stop background music when leaving game
    stopMusic()
    dismissMatchResults()
    resetGame()
    setGameStarted(false)
  }

  const handleSaveSettings = (newPrefs: GamePreferences) => {
    console.log('💾 Saving settings:', newPrefs)
    updatePreferences(newPrefs)
  }

  // Debug: Log when preferences change
  useEffect(() => {
    console.log('📋 Preferences updated:', preferences)
  }, [preferences])

  const handleAccessibilitySettingsChange = (newSettings: AccessibilitySettingsType) => {
    setAccessibilitySettings(newSettings)
    applyAccessibilitySettings(newSettings)
    // Save to localStorage for persistence
    try {
      localStorage.setItem('learnkick_accessibility', JSON.stringify(newSettings))
      console.log('✅ Saved accessibility settings to localStorage')
    } catch (error) {
      console.error('Failed to save accessibility settings:', error)
    }
  }

  const applyAccessibilitySettings = (settings: AccessibilitySettingsType) => {
    const root = document.documentElement
    const body = document.body
    console.log('🎨 Applying accessibility settings:', settings)

    if (settings.dyslexiaFriendlyFont) {
      // OpenDyslexic first (loaded from /public/fonts/), then iOS/Android friendly fallbacks
      // AVOID 'cursive' - on iOS it becomes a fancy script font!
      // Good dyslexia-friendly fallbacks: Verdana (wide letters), Trebuchet MS, Arial
      const fontStyle = 'OpenDyslexic, Verdana, "Trebuchet MS", "Helvetica Neue", Arial, sans-serif'
      root.style.fontFamily = fontStyle
      body.style.fontFamily = fontStyle
      // Also apply to all elements to override Tailwind defaults
      document.querySelectorAll('*').forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.fontFamily = fontStyle
        }
      })
      console.log('✅ Dyslexia font ENABLED:', fontStyle)
    } else {
      root.style.fontFamily = ''
      body.style.fontFamily = ''
      document.querySelectorAll('*').forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.fontFamily = ''
        }
      })
      console.log('⭕ Dyslexia font DISABLED')
    }
    const fontSizes = { small: '14px', medium: '16px', large: '18px', 'extra-large': '22px' }
    root.style.fontSize = fontSizes[settings.fontSize]
  }

  const getBackgroundClass = () => {
    if (accessibilitySettings.theme === 'high-contrast') return 'bg-black text-white'
    if (accessibilitySettings.theme === 'dark') return 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
    return 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500'
  }

  // Loading state
  if (profileLoading) {
    return (
      <div className={`min-h-screen ${getBackgroundClass()} flex items-center justify-center`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-center"
        >
          <div className="text-4xl mb-4">⚽</div>
          <div className="text-xl">{t.loading}</div>
        </motion.div>
      </div>
    )
  }

  // NEW USER: Quick setup screen (name + school/home)
  if (!isReturningUser || !profile) {
    return (
      <div className={`min-h-screen ${getBackgroundClass()} flex items-center justify-center p-4`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white w-full flex flex-col items-center"
        >
          <h1 className="text-5xl font-bold mb-2 tracking-tight">
            {t.welcome}
          </h1>
          <p className="text-lg mb-8 opacity-90">
            {t.welcomeSubtitle}
          </p>

          <KidRegistrationFlow onComplete={handleQuickSetupComplete} />
        </motion.div>

        {/* Accessibility Button - Opens Settings */}
        <motion.button
          onClick={() => setShowSettings(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 rounded-full shadow-xl flex items-center justify-center z-50 border-2 border-yellow-700"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-2xl">⚙️</span>
        </motion.button>

        {showSettings && (
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            preferences={preferences}
            onSave={handleSaveSettings}
            playerName="New Player"
            accessibilitySettings={accessibilitySettings}
            onAccessibilityChange={handleAccessibilitySettingsChange}
          />
        )}
      </div>
    )
  }

  // GAME OVER: Show MatchResults modal with team rewards
  if (status === 'finished' && gameStarted) {
    // If we have match result data from team store, show the full MatchResults modal
    if (showMatchResults && matchResultData) {
      return (
        <MatchResults
          isOpen={showMatchResults}
          onClose={handleBackToMenu}
          matchResult={matchResultData.matchResult}
          goalsFor={matchResultData.goalsFor}
          goalsAgainst={matchResultData.goalsAgainst}
          elixirEarned={matchResultData.elixirEarned}
          xpDistributed={matchResultData.xpDistributed}
          cardsLeveledUp={matchResultData.cardsLeveledUp}
          pointsChange={matchResultData.pointsChange}
          newLeaguePoints={matchResultData.newLeaguePoints}
          newLeagueTier={matchResultData.newLeagueTier}
          maxStreak={matchResultData.maxStreak}
          questionsAnswered={matchResultData.questionsAnswered}
          correctAnswers={matchResultData.correctAnswers}
        />
      )
    }

    // Fallback to simple results (when team is not initialized)
    return (
      <div className={`min-h-screen ${
        accessibilitySettings.theme === 'high-contrast' ? 'bg-black' :
        accessibilitySettings.theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900' :
        'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900'
      } flex items-center justify-center p-4`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white max-w-lg w-full"
        >
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-5xl font-bold mb-6"
          >
            {t.game.gameOver}
          </motion.h1>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="mb-8"
          >
            {winner === 'player1' && <div className="text-8xl">🎉</div>}
            {winner === 'player2' && <div className="text-8xl">😔</div>}
            {winner === 'tie' && <div className="text-8xl">🤝</div>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8"
          >
            <h3 className="text-2xl font-bold mb-6">{t.game.finalScore}</h3>
            <div className="flex justify-between items-center text-3xl font-bold mb-6">
              <div className="text-blue-400 bg-blue-500/20 px-4 py-2 rounded-xl">
                {t.game.you}: {p1?.goals || 0}
              </div>
              <div className="text-red-400 bg-red-500/20 px-4 py-2 rounded-xl">
                AI: {p2?.goals || 0}
              </div>
            </div>

            {p1 && (
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-300">
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="font-semibold">{t.game.accuracy}</div>
                  <div className="text-lg">{p1.stats.accuracy.toFixed(1)}%</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="font-semibold">{t.game.correctAnswers}</div>
                  <div className="text-lg">{p1.stats.correctAnswers}</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="font-semibold">{t.game.maxStreak}</div>
                  <div className="text-lg">{p1.stats.maxStreak}</div>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button onClick={handleBackToMenu} size="lg" className="bg-white text-gray-800 hover:bg-gray-100 w-full shadow-xl py-4 text-lg">
              {t.game.playAgain}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // ACTIVE GAME: Game in progress
  // Uses responsive layout that adapts to screen size and orientation
  if (gameStarted) {
    return (
      <ActiveGameLayout
        profile={profile}
        team={team}
        preferences={preferences}
        accessibilitySettings={accessibilitySettings}
        status={status}
        currentQuestion={currentQuestion}
        pauseGame={pauseGame}
        resumeGame={resumeGame}
        handleBackToMenu={handleBackToMenu}
        t={t}
        showTrainingModal={showTrainingModal}
        setShowTrainingModal={setShowTrainingModal}
        selectedCard={selectedCard}
        handleTrainCard={handleTrainCard}
        handleQuickLevelCard={handleQuickLevelCard}
      />
    )
  }

  // LOADING SCREEN: Show sports-themed loading animation when starting game
  if (isStartingGame) {
    return (
      <GameLoadingScreen
        phase={loadingPhase}
        arena={preferences.lastArena}
      />
    )
  }

  // RETURNING USER: Game Lobby (Clash Royale style - NO SCROLL!)
  return (
    <GameLobby
      profile={profile}
      preferences={preferences}
      accessibilitySettings={accessibilitySettings}
      onBattle={handleBattle}
      onPractice={handlePractice}
      onInviteFriend={handleInviteFriend}
      onSaveSettings={handleSaveSettings}
      onAccessibilityChange={handleAccessibilitySettingsChange}
      onClearProfile={clearProfile}
      isStartingGame={isStartingGame}
      gameError={gameError}
    />
  )
}
