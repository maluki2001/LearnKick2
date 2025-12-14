'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame'
import { useMatchmaking } from '@/hooks/useMatchmaking'
import { useSounds } from '@/hooks/useSounds'
import { MatchmakingQueue } from '@/components/matchmaking/MatchmakingQueue'
import { VsScreen } from '@/components/multiplayer/VsScreen'
import { CountdownOverlay } from '@/components/multiplayer/CountdownOverlay'
import { VictoryScreen } from '@/components/multiplayer/VictoryScreen'
import { GoalAnimation } from '@/components/multiplayer/GoalAnimation'
import { StreakBadge } from '@/components/multiplayer/StreakIndicator'
import { SoundToggleCompact } from '@/components/ui/SoundToggle'
import { getLeagueByTrophies } from '@/constants/leagues'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { usePlayerProfile } from '@/contexts/PlayerProfileContext'
import { generateUUID } from '@/lib/uuid'

type GamePhase = 'quick-register' | 'menu' | 'test-lobby' | 'matchmaking' | 'vs-screen' | 'connecting' | 'waiting' | 'countdown' | 'playing' | 'finished'

// Guest player info stored in state
interface GuestPlayer {
  id: string
  name: string
  grade: number
  trophies: number
  league: string
}

export default function MultiplayerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  // Get existing profile from main app context
  const { profile, preferences, isLoading: profileLoading } = usePlayerProfile()
  // Start with quick-register if no session AND no profile
  const [gamePhase, setGamePhase] = useState<GamePhase>('quick-register')
  const [language, setLanguage] = useState('en')
  // Guest player state for quick play without auth
  const [guestPlayer, setGuestPlayer] = useState<GuestPlayer | null>(null)
  // Test match state for direct socket testing
  const [testMatchId, setTestMatchId] = useState<string | null>(null)
  const [showGoalAnimation, setShowGoalAnimation] = useState(false)
  const [isPlayerGoal, setIsPlayerGoal] = useState(true)
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null)
  const [streak, setStreak] = useState(0)

  const prevMyGoalsRef = useRef(0)
  const prevOpponentGoalsRef = useRef(0)

  const game = useMultiplayerGame()
  const matchmaking = useMatchmaking()
  const { play, playCountdown } = useSounds()

  // Guard to prevent multiple findMatch calls
  const hasStartedMatchmakingRef = useRef(false)

  // Clash Royale style: If we have a profile, go STRAIGHT to matchmaking!
  useEffect(() => {
    if (profileLoading) return // Wait for profile to load
    if (hasStartedMatchmakingRef.current) return // Already started

    // If we have a profile from main app context, use proper matchmaking
    if (profile && !guestPlayer && gamePhase === 'quick-register') {
      hasStartedMatchmakingRef.current = true // Mark as started
      console.log('👤 Using existing profile:', profile.name)
      console.log('🎮 Starting matchmaking with find_match!')
      const league = getLeagueByTrophies(profile.elo)
      const player: GuestPlayer = {
        id: profile.id,
        name: profile.name,
        grade: preferences.grade,
        trophies: profile.elo,
        league: league.id,
      }
      setGuestPlayer(player)

      // Go to waiting phase and use proper matchmaking
      setGamePhase('waiting')

      // Use the proper matchmaking system via findMatch
      game.findMatch({
        playerId: player.id,
        playerName: player.name,
        trophies: player.trophies,
        league: player.league,
        grade: player.grade,
      })
      return
    }

    // Or if authenticated via NextAuth, also go straight to matchmaking
    if (status === 'authenticated' && session?.user && gamePhase === 'quick-register') {
      hasStartedMatchmakingRef.current = true
      setGamePhase('waiting')
      // Would need to call findMatch here too with session user data
    }
  }, [status, session, gamePhase, profile, profileLoading, guestPlayer, game, preferences.grade])

  // Update game phase based on game status
  useEffect(() => {
    if (game.status === 'connecting') {
      setGamePhase('connecting')
    } else if (game.status === 'waiting') {
      setGamePhase('waiting')
    } else if (game.status === 'countdown') {
      setGamePhase('countdown')
    } else if (game.status === 'playing') {
      setGamePhase('playing')
    } else if (game.status === 'finished' || game.status === 'abandoned') {
      setGamePhase('finished')
    }
  }, [game.status])

  // Play sound when game phase changes
  useEffect(() => {
    if (gamePhase === 'finished') {
      const isWinner = game.gameResult?.winnerId === game.myPlayer?.id
      const isDraw = game.gameResult?.isDraw
      if (isDraw) {
        play('trophy')
      } else if (isWinner) {
        play('victory')
      } else {
        play('defeat')
      }
    }
  }, [gamePhase, game.gameResult, game.myPlayer, play])

  // Play countdown sounds
  useEffect(() => {
    if (gamePhase === 'countdown' && game.countdown > 0) {
      playCountdown(game.countdown)
    }
  }, [gamePhase, game.countdown, playCountdown])

  // Track goal animations
  useEffect(() => {
    if (gamePhase === 'playing') {
      // Check for my goal
      if (game.myGoals > prevMyGoalsRef.current) {
        setIsPlayerGoal(true)
        setShowGoalAnimation(true)
        play('goal')
      }
      // Check for opponent goal
      if (game.opponentGoals > prevOpponentGoalsRef.current) {
        setIsPlayerGoal(false)
        setShowGoalAnimation(true)
        play('goal')
      }
      prevMyGoalsRef.current = game.myGoals
      prevOpponentGoalsRef.current = game.opponentGoals
    }
  }, [game.myGoals, game.opponentGoals, gamePhase, play])

  // Handle match found from matchmaking
  const handleMatchFound = useCallback(async (foundMatchId: string) => {
    play('match-found')
    setGamePhase('vs-screen')

    // After VS screen animation, join the game
    setTimeout(async () => {
      // Use session user or guest player
      const playerInfo = session?.user ? {
        playerId: session.user.id!,
        playerName: session.user.name || 'Player',
        trophies: (session.user as { trophies?: number }).trophies || 0,
        league: (session.user as { league?: string }).league || 'bronze-3',
        grade: (session.user as { grade?: number }).grade || 3,
      } : guestPlayer ? {
        playerId: guestPlayer.id,
        playerName: guestPlayer.name,
        trophies: guestPlayer.trophies,
        league: guestPlayer.league,
        grade: guestPlayer.grade,
      } : null

      if (playerInfo) {
        await game.joinGame(foundMatchId, playerInfo)
      }
    }, 3000) // Wait for VS screen animation
  }, [session, guestPlayer, game, play])

  // Handle starting matchmaking (only for authenticated users)
  const handlePlayMultiplayer = () => {
    if (session?.user) {
      play('click')
      setGamePhase('matchmaking')
    } else {
      // For guests, use test match mode
      handleCreateTestMatch()
    }
  }

  // Create a test match with shareable ID
  const handleCreateTestMatch = () => {
    play('click')
    const newMatchId = `test_${generateUUID().slice(0, 8)}`
    setTestMatchId(newMatchId)
    setGamePhase('test-lobby')
  }

  // Join an existing test match
  const handleJoinTestMatch = async (matchId: string) => {
    play('click')
    setTestMatchId(matchId)

    // Skip VS screen for test matches and go straight to connecting
    if (guestPlayer) {
      await game.joinGame(matchId, {
        playerId: guestPlayer.id,
        playerName: guestPlayer.name,
        trophies: guestPlayer.trophies,
        league: guestPlayer.league,
        grade: guestPlayer.grade,
      })
    }
  }

  // Start test match (creator joins after sharing link)
  const handleStartTestMatch = async () => {
    play('click')
    if (testMatchId && guestPlayer) {
      await game.joinGame(testMatchId, {
        playerId: guestPlayer.id,
        playerName: guestPlayer.name,
        trophies: guestPlayer.trophies,
        league: guestPlayer.league,
        grade: guestPlayer.grade,
      })
    }
  }

  // Check for match ID in URL on mount (for joining via link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const matchIdFromUrl = params.get('match')
    if (matchIdFromUrl && guestPlayer) {
      setTestMatchId(matchIdFromUrl)
      handleJoinTestMatch(matchIdFromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestPlayer])


  // Handle cancel matchmaking
  const handleCancel = () => {
    play('click')
    matchmaking.leaveQueue()
    game.cancelMatchmaking()
    game.reset()
    setTestMatchId(null)
    setGuestPlayer(null) // Reset so we can re-init on next visit
    hasStartedMatchmakingRef.current = false // Reset guard
    // Go back to home instead of menu (since we came from BATTLE)
    router.push('/')
    prevMyGoalsRef.current = 0
    prevOpponentGoalsRef.current = 0
    setStreak(0)
  }

  // Handle play vs AI fallback
  const handlePlayAI = () => {
    play('click')
    matchmaking.leaveQueue()
    game.cancelMatchmaking()
    game.reset()
    setTestMatchId(null)
    setGuestPlayer(null)
    hasStartedMatchmakingRef.current = false // Reset guard
    // Navigate to home with AI flag - will trigger AI game
    router.push('/?playAI=true')
  }

  // Handle ready button
  const handleReady = () => {
    play('click')
    game.setReady()
  }

  // Track correct answers to detect changes
  const prevMyCorrectRef = useRef(0)

  // Detect correct/incorrect answers based on myCorrect changing
  useEffect(() => {
    if (gamePhase === 'playing' && game.myCorrect > prevMyCorrectRef.current) {
      // Answer was correct
      play('correct')
      setLastAnswerCorrect(true)
      setStreak(prev => prev + 1)
      if (streak >= 2) {
        play('streak')
      }
      setTimeout(() => setLastAnswerCorrect(null), 500)
    }
    prevMyCorrectRef.current = game.myCorrect
  }, [game.myCorrect, gamePhase, play, streak])

  // Handle answer selection
  const handleAnswerSelect = async (answerIndex: number) => {
    const prevCorrect = game.myCorrect
    await game.submitAnswer(answerIndex)

    // If myCorrect didn't increase after a short delay, it was incorrect
    setTimeout(() => {
      if (game.myCorrect === prevCorrect) {
        play('incorrect')
        setLastAnswerCorrect(false)
        setStreak(0)
        setTimeout(() => setLastAnswerCorrect(null), 500)
      }
    }, 300)
  }

  // Handle play again
  const handlePlayAgain = () => {
    play('click')
    game.reset()
    setGamePhase('matchmaking')
    prevMyGoalsRef.current = 0
    prevOpponentGoalsRef.current = 0
    setStreak(0)
  }

  // Handle return to menu
  const handleBackToMenu = () => {
    play('click')
    game.reset()
    setGamePhase('menu')
    router.push('/')
  }

  const { t } = useLanguage()

  // Handle quick registration submit
  const handleQuickRegister = (name: string, grade: number) => {
    const newGuest: GuestPlayer = {
      id: generateUUID(),
      name,
      grade,
      trophies: 0,
      league: 'bronze-3',
    }
    setGuestPlayer(newGuest)
    // Save to localStorage for persistence
    localStorage.setItem('multiplayerGuest', JSON.stringify(newGuest))
    setGamePhase('menu')
  }

  // Load guest from localStorage on mount
  useEffect(() => {
    const savedGuest = localStorage.getItem('multiplayerGuest')
    if (savedGuest) {
      try {
        const guest = JSON.parse(savedGuest)
        setGuestPlayer(guest)
        if (gamePhase === 'quick-register') {
          setGamePhase('menu')
        }
      } catch {
        // Invalid saved data
      }
    }
  }, [])

  // Build player objects for VS screen
  const player1 = session?.user ? {
    id: session.user.id || 'player1',
    name: session.user.name || 'You',
    trophies: (session.user as { trophies?: number })?.trophies || 0,
    grade: (session.user as { grade?: number })?.grade || 3,
  } : guestPlayer ? {
    id: guestPlayer.id,
    name: guestPlayer.name,
    trophies: guestPlayer.trophies,
    grade: guestPlayer.grade,
  } : {
    id: 'player1',
    name: 'You',
    trophies: 0,
    grade: 3,
  }

  const player2 = matchmaking.opponent || {
    id: 'opponent',
    name: 'Opponent',
    trophies: 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Sound toggle in corner */}
      <div className="fixed top-4 right-4 z-50">
        <SoundToggleCompact />
      </div>

      {/* Quick Register Screen - Simple name + grade */}
      {gamePhase === 'quick-register' && (
        <QuickRegisterScreen onSubmit={handleQuickRegister} t={t} />
      )}

      {gamePhase === 'menu' && (
        <MenuScreen
          onPlay={handlePlayMultiplayer}
          onBack={handleBackToMenu}
          language={language}
          setLanguage={setLanguage}
          playerName={guestPlayer?.name || session?.user?.name || 'Player'}
          t={t}
        />
      )}

      {/* Test Lobby - Share link with opponent */}
      {gamePhase === 'test-lobby' && testMatchId && (
        <TestLobbyScreen
          matchId={testMatchId}
          playerName={guestPlayer?.name || 'Player'}
          onStart={handleStartTestMatch}
          onCancel={handleCancel}
        />
      )}

      {gamePhase === 'matchmaking' && (
        <MatchmakingQueue
          language={language}
          onMatchFound={handleMatchFound}
          onCancel={handleCancel}
        />
      )}

      {/* VS Screen Animation */}
      <AnimatePresence>
        {gamePhase === 'vs-screen' && (
          <VsScreen
            player1={player1}
            player2={player2}
            duration={3000}
            onComplete={() => setGamePhase('connecting')}
          />
        )}
      </AnimatePresence>

      {(gamePhase === 'connecting' || gamePhase === 'waiting') && (
        <WaitingScreen
          game={game}
          matchId={testMatchId}
          onReady={handleReady}
          onCancel={handleCancel}
          onPlayAI={handlePlayAI}
          t={t}
        />
      )}

      {/* Countdown Overlay */}
      <AnimatePresence>
        {gamePhase === 'countdown' && (
          <CountdownOverlay
            startFrom={game.countdown > 0 ? game.countdown : 3}
            onComplete={() => setGamePhase('playing')}
          />
        )}
      </AnimatePresence>

      {gamePhase === 'playing' && (
        <GameScreen
          game={game}
          onAnswerSelect={handleAnswerSelect}
          streak={streak}
          lastAnswerCorrect={lastAnswerCorrect}
          t={t}
        />
      )}

      {/* Goal Animation Overlay */}
      <AnimatePresence>
        <GoalAnimation
          show={showGoalAnimation}
          isPlayerGoal={isPlayerGoal}
          onComplete={() => setShowGoalAnimation(false)}
        />
      </AnimatePresence>

      {gamePhase === 'finished' && game.gameResult && (
        <VictoryScreen
          isWinner={game.gameResult.winnerId === game.myPlayer?.id && !game.gameResult.isDraw}
          playerScore={game.myGoals}
          opponentScore={game.opponentGoals}
          trophyChange={
            game.isPlayer1
              ? game.gameResult.player1TrophyChange?.change || 0
              : game.gameResult.player2TrophyChange?.change || 0
          }
          newTrophies={
            (game.isPlayer1
              ? game.gameResult.player1TrophyChange?.newTrophies
              : game.gameResult.player2TrophyChange?.newTrophies) || player1.trophies
          }
          playerName={game.myPlayer?.name || 'You'}
          opponentName={game.opponent?.name || 'Opponent'}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleBackToMenu}
        />
      )}
    </div>
  )
}

// Quick Register Screen - Simple name + grade for quick play
function QuickRegisterScreen({
  onSubmit,
}: {
  onSubmit: (name: string, grade: number) => void
  t: ReturnType<typeof useLanguage>['t']
}) {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState(3)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim(), grade)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">LearnKick</h1>
          <p className="text-xl text-white/70">Quick Play</p>
        </div>

        {/* Simple Form */}
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30
                text-white placeholder-white/50 focus:outline-none focus:ring-2
                focus:ring-green-500 focus:border-transparent text-lg"
              autoFocus
              maxLength={20}
            />
          </div>

          {/* Grade Selector */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Grade / Age
            </label>
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={cn(
                    'py-3 rounded-xl font-bold text-lg transition-all',
                    grade === g
                      ? 'bg-green-500 text-white scale-105'
                      : 'bg-white/20 text-white/70 hover:bg-white/30'
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
            <p className="text-white/50 text-xs mt-2 text-center">
              Select your school grade (1-6)
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name.trim()}
            className={cn(
              'w-full py-4 rounded-xl font-bold text-xl transition-all',
              name.trim()
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transform hover:scale-[1.02]'
                : 'bg-white/20 text-white/50 cursor-not-allowed'
            )}
          >
            Start Playing!
          </button>
        </form>

        {/* Info text */}
        <p className="text-center text-white/40 text-sm mt-6">
          No account needed - just enter your name to play
        </p>
      </motion.div>
    </div>
  )
}

// Test Lobby Screen - Share link with opponent
function TestLobbyScreen({
  matchId,
  playerName,
  onStart,
  onCancel,
}: {
  matchId: string
  playerName: string
  onStart: () => void
  onCancel: () => void
}) {
  const [copied, setCopied] = useState(false)
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/multiplayer?match=${matchId}`
    : ''

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Test Match</h1>
        <p className="text-white/70 mb-8">Share this link with your opponent</p>

        {/* Player info */}
        <div className="bg-white/10 rounded-xl p-4 mb-6">
          <p className="text-white/60 text-sm">Playing as</p>
          <p className="text-white text-xl font-bold">{playerName}</p>
        </div>

        {/* Match ID */}
        <div className="bg-white/10 rounded-xl p-4 mb-4">
          <p className="text-white/60 text-sm mb-2">Match ID</p>
          <p className="text-green-400 font-mono text-lg">{matchId}</p>
        </div>

        {/* Share Link */}
        <div className="bg-white/5 border border-white/20 rounded-xl p-3 mb-6">
          <p className="text-white/80 text-sm break-all">{shareUrl}</p>
        </div>

        {/* Copy Button */}
        <button
          onClick={copyLink}
          className={cn(
            'w-full py-3 rounded-xl font-bold mb-4 transition-all',
            copied
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          )}
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>

        {/* Instructions */}
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6 text-left">
          <p className="text-yellow-200 text-sm mb-2 font-bold">Instructions:</p>
          <ol className="text-yellow-200/80 text-sm space-y-1">
            <li>1. Copy the link above</li>
            <li>2. Send it to your opponent</li>
            <li>3. Both click &quot;Join Match&quot; when ready</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <button
          onClick={onStart}
          className="w-full py-4 rounded-xl font-bold text-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 mb-4"
        >
          Join Match
        </button>

        <button
          onClick={onCancel}
          className="w-full py-3 text-white/60 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  )
}

// Menu Screen
function MenuScreen({
  onPlay,
  onBack,
  language,
  setLanguage,
  playerName,
  t,
}: {
  onPlay: () => void
  onBack: () => void
  language: string
  setLanguage: (lang: string) => void
  playerName: string
  t: ReturnType<typeof useLanguage>['t']
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Player name badge */}
      <div className="absolute top-4 left-4 bg-white/10 rounded-xl px-4 py-2">
        <span className="text-white/60 text-sm">Playing as </span>
        <span className="text-white font-bold">{playerName}</span>
      </div>

      <div className="text-center text-white mb-12">
        <h1 className="text-5xl font-bold mb-4">{t.multiplayer?.title || 'Multiplayer'}</h1>
        <p className="text-xl opacity-80">{t.multiplayer?.subtitle || 'Challenge another player!'}</p>
      </div>

      {/* Language selector */}
      <div className="flex gap-2 mb-8">
        {['en', 'de', 'fr', 'sq'].map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all',
              language === lang
                ? 'bg-white text-gray-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            )}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Play button */}
      <button
        onClick={onPlay}
        className="relative overflow-hidden px-12 py-6 rounded-2xl font-bold text-2xl
          bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
          text-white shadow-2xl transition-all duration-200 transform hover:scale-105"
      >
        {t.multiplayer?.findMatch || 'Find Match'}
      </button>

      {/* Back button */}
      <button
        onClick={onBack}
        className="mt-8 px-6 py-3 text-white/70 hover:text-white transition-colors"
      >
        {t.multiplayer?.backToHome || 'Back'}
      </button>

      {/* Info */}
      <div className="mt-12 max-w-md text-center text-white/60 text-sm">
        <p className="mb-2">{t.multiplayer?.skillLevelMatch || 'Play against opponents of similar skill'}</p>
        <p>{t.multiplayer?.winTrophies || 'Win matches to earn trophies!'}</p>
      </div>
    </div>
  )
}

// Waiting Screen
function WaitingScreen({
  game,
  matchId,
  onReady,
  onCancel,
  onPlayAI,
  t,
}: {
  game: ReturnType<typeof useMultiplayerGame>
  matchId: string | null
  onReady: () => void
  onCancel: () => void
  onPlayAI: () => void
  t: ReturnType<typeof useLanguage>['t']
}) {
  const [copied, setCopied] = useState(false)
  const [searchTime, setSearchTime] = useState(0)
  const [showAIOption, setShowAIOption] = useState(false)
  const myLeague = game.myPlayer ? getLeagueByTrophies(game.myPlayer.trophies) : null
  const opponentLeague = game.opponent ? getLeagueByTrophies(game.opponent.trophies) : null

  // Timer for searching - show AI option after 5 seconds
  useEffect(() => {
    if (game.opponent) return // Stop if opponent found

    const timer = setInterval(() => {
      setSearchTime(prev => {
        const newTime = prev + 1
        if (newTime >= 5 && !showAIOption) {
          setShowAIOption(true)
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [game.opponent, showAIOption])

  const shareUrl = typeof window !== 'undefined' && matchId
    ? `${window.location.origin}/multiplayer?match=${matchId}`
    : ''

  const copyLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-600 to-blue-800">
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold mb-2">
          {game.opponent ? t.multiplayer.matchReady : (t.multiplayer.searchingOpponent || 'Searching for opponent...')}
        </h1>

        {/* Search timer */}
        {!game.opponent && (
          <p className="text-white/60 text-sm mb-4">{searchTime}s</p>
        )}

        {/* AI Fallback - show after 5 seconds */}
        {showAIOption && !game.opponent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <p className="text-yellow-300 mb-3">No opponents online right now</p>
            <button
              onClick={onPlayAI}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
            >
              Play vs AI Instead
            </button>
          </motion.div>
        )}

        {/* Share link - only show for private matches */}
        {!game.opponent && matchId && matchId.startsWith('test_') && !showAIOption && (
          <div className="mb-6">
            <p className="text-white/70 text-sm mb-2">{t.multiplayer.orInviteFriend || 'Or invite a friend:'}</p>
            <button
              onClick={copyLink}
              className="bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-sm transition-colors"
            >
              {copied ? (t.multiplayer.copied || 'Copied!') : (t.multiplayer.copyLink || 'Copy invite link')}
            </button>
          </div>
        )}

        {/* VS Display */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {/* You */}
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-2 border-4 border-green-400">
              <span className="text-3xl font-bold">
                {game.myPlayer?.name?.[0] || 'Y'}
              </span>
            </div>
            <p className="font-bold">{game.myPlayer?.name || 'You'}</p>
            {myLeague && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-sm">{game.myPlayer?.trophies}</span>
              </div>
            )}
            <div className={cn(
              'mt-2 px-3 py-1 rounded-full text-sm',
              game.myPlayer?.isReady
                ? 'bg-green-500 text-white'
                : 'bg-white/20'
            )}>
              {game.myPlayer?.isReady ? t.multiplayer.ready : t.multiplayer.notReady}
            </div>
          </div>

          {/* VS */}
          <div className="text-4xl font-bold text-yellow-300">{t.multiplayer.vs}</div>

          {/* Opponent */}
          <div className="text-center">
            <div className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center mb-2 border-4',
              game.opponent?.isConnected
                ? 'bg-white/20 border-red-400'
                : 'bg-white/10 border-gray-500'
            )}>
              {game.opponent?.isConnected ? (
                <span className="text-3xl font-bold">
                  {game.opponent?.name?.[0] || '?'}
                </span>
              ) : (
                <span className="text-2xl animate-pulse">...</span>
              )}
            </div>
            <p className="font-bold">
              {game.opponent?.name || t.multiplayer.waiting}
            </p>
            {opponentLeague && game.opponent && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-sm">{game.opponent.trophies}</span>
              </div>
            )}
            {game.opponent && (
              <div className={cn(
                'mt-2 px-3 py-1 rounded-full text-sm',
                game.opponent.isReady
                  ? 'bg-green-500 text-white'
                  : 'bg-white/20'
              )}>
                {game.opponent.isReady ? t.multiplayer.ready : t.multiplayer.notReady}
              </div>
            )}
          </div>
        </div>

        {/* Ready button */}
        {game.opponent && !game.myPlayer?.isReady && (
          <button
            onClick={onReady}
            className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-xl
              transition-all transform hover:scale-105 mb-4"
          >
            {t.multiplayer.ready}
          </button>
        )}

        {game.myPlayer?.isReady && !game.opponent?.isReady && (
          <p className="text-lg opacity-80 mb-4">{t.multiplayer.waitingForOpponent}</p>
        )}

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="px-6 py-2 text-white/70 hover:text-white transition-colors"
        >
          {t.multiplayer.cancel}
        </button>
      </div>
    </div>
  )
}

// Game Screen
function GameScreen({
  game,
  onAnswerSelect,
  streak,
  lastAnswerCorrect,
  t,
}: {
  game: ReturnType<typeof useMultiplayerGame>
  onAnswerSelect: (index: number) => void
  streak: number
  lastAnswerCorrect: boolean | null
  t: ReturnType<typeof useLanguage>['t']
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-600 to-green-800">
      {/* Header */}
      <div className="p-4 flex justify-between items-center text-white">
        {/* My info */}
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold transition-all',
            lastAnswerCorrect === true && 'ring-4 ring-green-400',
            lastAnswerCorrect === false && 'ring-4 ring-red-400'
          )}>
            {game.myPlayer?.name?.[0] || 'Y'}
          </div>
          <div>
            <p className="font-bold">{game.myGoals} {t.multiplayer.goals}</p>
            <p className="text-sm opacity-80">{game.myCorrect} {t.multiplayer.correct}</p>
          </div>
        </div>

        {/* Timer + Streak */}
        <div className="text-center">
          <div className={cn(
            'text-4xl font-bold',
            game.timeRemaining <= 10 && 'text-red-400 animate-pulse'
          )}>
            {game.timeRemaining}
          </div>
          <p className="text-sm opacity-80">{t.game.seconds}</p>
          {/* Streak badge */}
          <AnimatePresence>
            {streak >= 2 && <StreakBadge streak={streak} />}
          </AnimatePresence>
        </div>

        {/* Opponent info */}
        <div className="flex items-center gap-3">
          <div>
            <p className="font-bold text-right">{game.opponentGoals} {t.multiplayer.goals}</p>
            <p className="text-sm opacity-80 text-right">{game.opponentCorrect} {t.multiplayer.correct}</p>
          </div>
          <div className={cn(
            'w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold',
            !game.opponent?.isConnected && 'opacity-50'
          )}>
            {game.opponent?.name?.[0] || '?'}
          </div>
        </div>
      </div>

      {/* Field position indicator */}
      <div className="px-4 py-2">
        <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-4 bg-green-400 rounded-l-full" />
          <div className="absolute inset-y-0 right-0 w-4 bg-red-400 rounded-r-full" />
          <div
            className="absolute inset-y-0 w-4 bg-white rounded-full transition-all duration-300"
            style={{
              left: `${((game.fieldPosition + 5) / 10) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/60 mt-1">
          <span>{t.multiplayer.yourGoal}</span>
          <span>{t.multiplayer.theirGoal}</span>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 p-4 flex flex-col">
        {game.currentQuestion ? (
          <>
            {/* Question */}
            <div className="bg-white rounded-2xl p-6 mb-4 flex-shrink-0">
              <p className="text-lg font-medium text-gray-900 text-center">
                {game.currentQuestion.question}
              </p>
            </div>

            {/* Timer bar for question */}
            <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-yellow-400 transition-all duration-1000"
                style={{
                  width: `${(game.currentQuestion.timeRemaining / game.currentQuestion.timeLimit) * 100}%`,
                }}
              />
            </div>

            {/* Answer options */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              {game.currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !game.currentQuestion?.answered && onAnswerSelect(index)}
                  disabled={game.currentQuestion?.answered}
                  className={cn(
                    'p-4 rounded-xl font-medium text-left transition-all',
                    game.currentQuestion?.answered && game.currentQuestion?.myAnswer === index
                      ? 'bg-blue-500 text-white scale-95'
                      : game.currentQuestion?.answered
                      ? 'bg-white/50 text-gray-600'
                      : 'bg-white hover:bg-white/90 text-gray-900 hover:scale-105'
                  )}
                >
                  <span className="text-sm opacity-60 mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>

            {/* Opponent status */}
            {game.currentQuestion.opponentAnswered && !game.currentQuestion.answered && (
              <div className="mt-4 text-center text-white/80">
                <p className="animate-pulse">{t.multiplayer.opponentAnswered}</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white">
            <p className="text-xl animate-pulse">{t.multiplayer.loadingQuestion}</p>
          </div>
        )}
      </div>

      {/* Connection status */}
      {!game.opponent?.isConnected && (
        <div className="p-4 bg-yellow-500/80 text-center text-white">
          <p>{t.multiplayer.opponentDisconnected}</p>
        </div>
      )}
    </div>
  )
}
