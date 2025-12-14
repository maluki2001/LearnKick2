'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
// Removed Sheet import - using custom modals like SettingsModal for full-screen support
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PlayerProfile, GamePreferences } from '@/contexts/PlayerProfileContext'
import { AccessibilitySettings as AccessibilitySettingsType } from '@/types/accessibility'
import { useLanguage } from '@/contexts/LanguageContext'
import { SettingsModal } from '@/components/ui/SettingsModal'
import { SUBJECTS, SUBJECT_META } from '@/constants/game'
// Team Builder imports
import { TeamView } from '@/components/team/TeamView'
import { TrainingModal } from '@/components/team/TrainingModal'
import { ElixirBadge } from '@/components/elixir/ElixirBar'
import { useTeamStore } from '@/stores/teamStore'
import type { PlayerCard } from '@/types/team'
// League imports
import { LeagueTable } from '@/components/league/LeagueTable'
// Offline mode
import { OfflineIndicator } from '@/components/ui/OfflineIndicator'
// Email linking
import { EmailLinkModal } from '@/components/game/EmailLinkModal'

export type GameMode = 'battle' | 'practice'

interface GameLobbyProps {
  profile: PlayerProfile
  preferences: GamePreferences
  accessibilitySettings: AccessibilitySettingsType
  onBattle: () => void
  onPractice: () => void
  onInviteFriend?: () => void  // Optional - for multiplayer invite
  onSaveSettings: (prefs: GamePreferences) => void
  onAccessibilityChange: (settings: AccessibilitySettingsType) => void
  onClearProfile: () => void
  isStartingGame: boolean
  gameError: string | null
}

export function GameLobby({
  profile,
  preferences,
  accessibilitySettings,
  onBattle,
  onPractice,
  onInviteFriend,
  onSaveSettings,
  onAccessibilityChange,
  onClearProfile,
  isStartingGame,
  gameError
}: GameLobbyProps) {
  const { t } = useLanguage()
  const [showSettings, setShowSettings] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showTeam, setShowTeam] = useState(false)
  const [showLeague, setShowLeague] = useState(false)
  const [showTrainingModal, setShowTrainingModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<PlayerCard | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [showEmailLink, setShowEmailLink] = useState(false)

  // Team Builder store
  const { team, initializeTeam, trainCard, quickLevelCard, resetDailyElixir } = useTeamStore()

  // Initialize team if not exists or has no player cards
  useEffect(() => {
    if (profile && (!team || (team.cards && team.cards.length === 0))) {
      initializeTeam(profile.id, `${profile.name}'s Team`, 'soccer')
    }
    if (team && team.cards && team.cards.length > 0) {
      resetDailyElixir()
    }
  }, [profile, team, initializeTeam, resetDailyElixir])

  // Handle training a card
  const handleTrainCard = async (cardId: string): Promise<boolean> => {
    if (!team) return false
    const result = trainCard(cardId)
    return result.success
  }

  // Handle quick level a card (50 elixir = +25 XP)
  const handleQuickLevelCard = async (cardId: string): Promise<boolean> => {
    if (!team) return false
    const result = quickLevelCard(cardId)
    return result.success
  }

  // Handle card click in TeamView
  const handleCardClick = (card: PlayerCard) => {
    setSelectedCard(card)
    setShowTrainingModal(true)
  }

  // Detect online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)

    // Initial check
    setIsOnline(navigator.onLine)

    // Listen for changes
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Calculate level from ELO
  const level = Math.floor(profile.elo / 200) + 1
  const levelProgress = ((profile.elo % 200) / 200) * 100

  // Get league based on ELO
  const getLeague = (elo: number) => {
    if (elo >= 2000) return { name: 'Champion', color: 'from-yellow-400 to-yellow-600', icon: '👑', bg: 'bg-yellow-500/20' }
    if (elo >= 1600) return { name: 'Diamond', color: 'from-cyan-400 to-blue-500', icon: '💎', bg: 'bg-cyan-500/20' }
    if (elo >= 1200) return { name: 'Gold', color: 'from-yellow-500 to-orange-500', icon: '🥇', bg: 'bg-yellow-500/20' }
    if (elo >= 800) return { name: 'Silver', color: 'from-gray-300 to-gray-500', icon: '🥈', bg: 'bg-gray-500/20' }
    return { name: 'Bronze', color: 'from-orange-600 to-orange-800', icon: '🥉', bg: 'bg-orange-500/20' }
  }

  const league = getLeague(profile.elo)

  // Arena config
  const arenaConfig = {
    soccer: { bg: 'from-green-600 via-green-500 to-emerald-600', icon: '⚽', name: 'Soccer Arena' },
    hockey: { bg: 'from-blue-600 via-blue-500 to-cyan-600', icon: '🏒', name: 'Hockey Rink' }
  }

  // Get icons from SUBJECT_META constants
  const subjectIcons: Record<string, string> = Object.fromEntries(
    Object.entries(SUBJECT_META).map(([key, meta]) => [key, meta.icon])
  )

  const arena = arenaConfig[preferences.lastArena]

  // Stats for desktop sidebar
  const stats = [
    { label: t.lobby.games, value: profile.totalGamesPlayed, icon: '🎮' },
    { label: t.lobby.wins, value: profile.totalWins, icon: '🏆' },
    { label: t.lobby.accuracy, value: `${Math.round(profile.accuracy)}%`, icon: '🎯' },
    { label: t.lobby.bestStreak, value: profile.bestStreak, icon: '🔥' },
  ]

  // Available options for quick selectors
  const arenas: ('soccer' | 'hockey')[] = ['soccer', 'hockey']
  // Use all 11 subjects from constants
  const subjects = Object.values(SUBJECTS) as string[]
  const grades = [1, 2, 3, 4, 5, 6]
  const languages: ('de' | 'en' | 'fr')[] = ['de', 'en', 'fr']

  const languageFlags: Record<string, string> = { de: '🇩🇪', en: '🇬🇧', fr: '🇫🇷' }
  const languageNames: Record<string, string> = { de: 'Deutsch', en: 'English', fr: 'Français' }

  // Quick change handlers - instantly update preferences
  const cycleArena = (direction: 'next' | 'prev') => {
    const currentIndex = arenas.indexOf(preferences.lastArena as 'soccer' | 'hockey')
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % arenas.length
      : (currentIndex - 1 + arenas.length) % arenas.length
    onSaveSettings({ ...preferences, lastArena: arenas[newIndex] })
  }

  const cycleSubject = () => {
    const currentIndex = subjects.indexOf(preferences.lastSubject)
    const newIndex = (currentIndex + 1) % subjects.length
    onSaveSettings({ ...preferences, lastSubject: subjects[newIndex] })
  }

  const cycleGrade = () => {
    const currentIndex = grades.indexOf(preferences.grade)
    const newIndex = (currentIndex + 1) % grades.length
    onSaveSettings({ ...preferences, grade: grades[newIndex] })
  }

  const cycleLanguage = () => {
    const currentIndex = languages.indexOf(preferences.lastQuestionLanguage as 'de' | 'en' | 'fr')
    const newIndex = (currentIndex + 1) % languages.length
    onSaveSettings({ ...preferences, lastQuestionLanguage: languages[newIndex] })
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">

      {/* ============================================ */}
      {/* MOBILE LAYOUT (default, < 768px)            */}
      {/* ============================================ */}
      <div className="md:hidden h-full flex flex-col">

        {/* Mobile Header */}
        <header className="flex-shrink-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b-2 border-yellow-500/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-yellow-500">
                  <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white font-black">
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Badge className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-xs px-1 py-0 border-0">
                  {level}
                </Badge>
              </div>
              <div>
                <h2 className="text-white font-bold text-sm leading-tight">{profile.name}</h2>
                <span className={`text-xs font-semibold bg-gradient-to-r ${league.color} bg-clip-text text-transparent`}>
                  {league.icon} {league.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <OfflineIndicator compact grade={profile.grade} language={preferences.language} />
              {team && <ElixirBadge current={team.elixir} />}
              <motion.div className="flex items-center gap-1 bg-yellow-600/20 px-2 py-1 rounded-xl border border-yellow-500/30">
                <span className="text-lg">🏆</span>
                <span className="text-yellow-400 font-black text-base">{profile.elo}</span>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Mobile Arena Display - Swipeable */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-2 relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${arena.bg} opacity-10`} />

          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-xs">
            <Card className="bg-slate-800/90 border-2 border-slate-600/50 backdrop-blur-sm overflow-hidden">
              {/* Arena Header - Tap to cycle */}
              <motion.button
                onClick={() => cycleArena('next')}
                whileTap={{ scale: 0.98 }}
                className={`w-full bg-gradient-to-r ${arena.bg} p-3 text-center border-b border-white/10 cursor-pointer`}
              >
                <motion.div className="text-5xl mb-1"
                  key={preferences.lastArena}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}>
                  {arena.icon}
                </motion.div>
                <h3 className="text-white font-black text-lg uppercase tracking-wider">
                  {t.gameSetup.arenas[preferences.lastArena as keyof typeof t.gameSetup.arenas]}
                </h3>
                <span className="text-white/70 text-[10px]">{t.lobby.tapToChange}</span>
              </motion.button>

              {/* Clickable Settings */}
              <div className="p-3 space-y-2">
                {/* Subject - Clickable */}
                <motion.button
                  onClick={cycleSubject}
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center justify-between bg-slate-700/50 active:bg-slate-600/50 rounded-lg p-2 border border-transparent active:border-yellow-500/30"
                >
                  <span className="text-slate-400 text-xs">{t.gameSetup.subject}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{subjectIcons[preferences.lastSubject] || '📚'}</span>
                    <span className="text-white font-bold text-sm">
                      {t.gameSetup.subjects[preferences.lastSubject as keyof typeof t.gameSetup.subjects]}
                    </span>
                    <span className="text-yellow-400 text-[10px]">{t.lobby.tap}</span>
                  </div>
                </motion.button>

                {/* Grade - Clickable */}
                <motion.button
                  onClick={cycleGrade}
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center justify-between bg-slate-700/50 active:bg-slate-600/50 rounded-lg p-2 border border-transparent active:border-yellow-500/30"
                >
                  <span className="text-slate-400 text-xs">{t.gameSetup.grade}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-bold text-sm">🎓 {t.lobby.level} {preferences.grade}</span>
                    <span className="text-yellow-400 text-[10px]">{t.lobby.tap}</span>
                  </div>
                </motion.button>

                {/* Language - Clickable */}
                <motion.button
                  onClick={cycleLanguage}
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center justify-between bg-slate-700/50 active:bg-slate-600/50 rounded-lg p-2 border border-transparent active:border-yellow-500/30"
                >
                  <span className="text-slate-400 text-xs">{t.gameSetup.questionLanguage}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{languageFlags[preferences.lastQuestionLanguage]}</span>
                    <span className="text-white font-bold text-sm">{languageNames[preferences.lastQuestionLanguage]}</span>
                    <span className="text-yellow-400 text-[10px]">{t.lobby.tap}</span>
                  </div>
                </motion.button>
              </div>
            </Card>
          </motion.div>

          {gameError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-2 left-4 right-4 bg-red-500/90 rounded-xl p-2 text-center">
              <p className="text-white text-sm">{gameError}</p>
            </motion.div>
          )}
        </main>

        {/* Mobile Connection Status + Battle/Practice Buttons */}
        <div className="flex-shrink-0 px-4 pb-2 space-y-2">
          {/* Connection Status */}
          <div className={`flex items-center justify-center gap-2 py-1 rounded-lg text-xs font-medium ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {isOnline ? t.lobby.onlineBattleAvailable : t.lobby.offlinePracticeOnly}
          </div>

          {/* Two Button Row */}
          <div className="flex gap-2">
            {/* PRACTICE Button (Works Offline) */}
            <motion.button onClick={onPractice} disabled={isStartingGame} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative flex-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-xl blur-md opacity-40" />
              <div className={`relative bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-xl py-3 border-b-4 border-blue-700 ${isStartingGame ? 'opacity-75' : ''}`}>
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-xl" />
                <div className="relative flex flex-col items-center">
                  <span className="text-xl">📚</span>
                  <span className="text-white font-black text-sm tracking-wider">{t.lobby.practice.toUpperCase()}</span>
                  <span className="text-blue-200 text-[10px]">{t.lobby.noTrophies}</span>
                </div>
              </div>
            </motion.button>

            {/* BATTLE Button (Requires Online) */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={isOnline ? onBattle : undefined}
                    disabled={isStartingGame || !isOnline}
                    whileHover={isOnline ? { scale: 1.02 } : {}}
                    whileTap={isOnline ? { scale: 0.98 } : {}}
                    className={`relative flex-1 ${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-xl blur-md opacity-40" />
                    <div className={`relative bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-xl py-3 border-b-4 border-red-700 ${isStartingGame ? 'opacity-75' : ''}`}>
                      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-xl" />
                      <div className="relative flex flex-col items-center">
                        {isStartingGame ? (
                          <span className="text-white font-black text-sm">{t.lobby.finding}</span>
                        ) : (
                          <>
                            <span className="text-xl">⚔️</span>
                            <span className="text-white font-black text-sm tracking-wider">{t.lobby.battle.toUpperCase()}</span>
                            <span className="text-orange-200 text-[10px]">{isOnline ? t.lobby.earnTrophies : t.lobby.requiresWifi}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.button>
                </TooltipTrigger>
                {!isOnline && (
                  <TooltipContent>
                    <p>{t.lobby.connectToInternet}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Invite Friend Button */}
          {onInviteFriend && isOnline && (
            <motion.button
              onClick={onInviteFriend}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl py-2 border-b-2 border-purple-700"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">👥</span>
                <span className="text-white font-bold text-sm">{t.lobby.inviteFriend || 'Invite Friend'}</span>
              </div>
            </motion.button>
          )}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="flex-shrink-0 bg-slate-900 border-t-2 border-slate-700 px-2 py-2">
          <div className="flex items-center justify-around">
            {[
              { icon: '⚽', label: t.lobby.teamNav, onClick: () => setShowTeam(true), highlight: true },
              { icon: '📊', label: t.lobby.leagueNav, onClick: () => setShowLeague(true), highlight: true },
              { icon: '⚙️', label: t.lobby.settingsNav, onClick: () => setShowSettings(true) },
              { icon: '👤', label: t.lobby.profileNav, onClick: () => setShowProfile(true) },
            ].map((item) => (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.95 }}
                onClick={item.onClick}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl ${item.highlight ? 'bg-indigo-500/20 border border-indigo-500/30' : ''}`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className={`text-xs font-medium ${item.highlight ? 'text-indigo-400' : 'text-slate-400'}`}>{item.label}</span>
              </motion.button>
            ))}
          </div>
        </nav>
      </div>

      {/* ============================================ */}
      {/* TABLET LAYOUT (768px - 1279px)              */}
      {/* ============================================ */}
      <div className="hidden md:flex lg:hidden h-full flex-col">

        {/* Tablet Header */}
        <header className="flex-shrink-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b-2 border-yellow-500/30 px-6 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-14 w-14 border-2 border-yellow-500 shadow-lg shadow-yellow-500/20">
                  <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white font-black text-xl">
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Badge className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-sm px-2 py-0.5 border-0">
                  {level}
                </Badge>
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">{profile.name}</h2>
                <div className={`inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full ${league.bg}`}>
                  <span>{league.icon}</span>
                  <span className={`font-bold bg-gradient-to-r ${league.color} bg-clip-text text-transparent`}>{league.name}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <OfflineIndicator compact grade={profile.grade} language={preferences.language} />
              {stats.slice(0, 2).map((stat) => (
                <div key={stat.label} className="text-center bg-slate-700/50 px-4 py-2 rounded-xl">
                  <div className="text-lg">{stat.icon}</div>
                  <div className="text-white font-bold">{stat.value}</div>
                  <div className="text-slate-400 text-xs">{stat.label}</div>
                </div>
              ))}
              <motion.div className="flex items-center gap-2 bg-yellow-600/20 px-4 py-2 rounded-xl border border-yellow-500/30">
                <span className="text-2xl">🏆</span>
                <div className="text-right">
                  <div className="text-yellow-400 font-black text-2xl">{profile.elo}</div>
                  <div className="text-yellow-500/70 text-xs">ELO</div>
                </div>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Tablet Main Content */}
        <main className="flex-1 flex items-center justify-center gap-8 px-6 py-4 relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${arena.bg} opacity-10`} />

          {/* Arena Card - Swipeable */}
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-80">
            <Card className="bg-slate-800/90 border-2 border-slate-600/50 backdrop-blur-sm overflow-hidden">
              {/* Arena Header - Tap to cycle */}
              <motion.button
                onClick={() => cycleArena('next')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full bg-gradient-to-r ${arena.bg} p-6 text-center border-b border-white/10 cursor-pointer`}
              >
                <motion.div className="text-7xl mb-2"
                  key={preferences.lastArena}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}>
                  {arena.icon}
                </motion.div>
                <h3 className="text-white font-black text-2xl uppercase tracking-wider">
                  {t.gameSetup.arenas[preferences.lastArena as keyof typeof t.gameSetup.arenas]}
                </h3>
                <span className="text-white/70 text-xs">{t.lobby.tapToChange}</span>
              </motion.button>

              {/* Clickable Settings */}
              <div className="p-4 space-y-3">
                {/* Subject - Clickable */}
                <motion.button
                  onClick={cycleSubject}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-between bg-slate-700/50 hover:bg-slate-600/50 rounded-xl p-3 cursor-pointer transition-colors border border-transparent hover:border-yellow-500/30"
                >
                  <span className="text-slate-400 text-sm">{t.gameSetup.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{subjectIcons[preferences.lastSubject] || '📚'}</span>
                    <span className="text-white font-bold">{t.gameSetup.subjects[preferences.lastSubject as keyof typeof t.gameSetup.subjects]}</span>
                    <span className="text-yellow-400 text-xs">{t.lobby.tap}</span>
                  </div>
                </motion.button>

                {/* Grade - Clickable */}
                <motion.button
                  onClick={cycleGrade}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-between bg-slate-700/50 hover:bg-slate-600/50 rounded-xl p-3 cursor-pointer transition-colors border border-transparent hover:border-yellow-500/30"
                >
                  <span className="text-slate-400 text-sm">{t.gameSetup.grade}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎓</span>
                    <span className="text-white font-bold">{t.lobby.level} {preferences.grade}</span>
                    <span className="text-yellow-400 text-xs">{t.lobby.tap}</span>
                  </div>
                </motion.button>

                {/* Language - Clickable */}
                <motion.button
                  onClick={cycleLanguage}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-between bg-slate-700/50 hover:bg-slate-600/50 rounded-xl p-3 cursor-pointer transition-colors border border-transparent hover:border-yellow-500/30"
                >
                  <span className="text-slate-400 text-sm">{t.gameSetup.language}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{languageFlags[preferences.lastQuestionLanguage]}</span>
                    <span className="text-white font-bold">{languageNames[preferences.lastQuestionLanguage]}</span>
                    <span className="text-yellow-400 text-xs">{t.lobby.tap}</span>
                  </div>
                </motion.button>
              </div>
            </Card>
          </motion.div>

          {/* Battle & Actions */}
          <div className="relative z-10 flex flex-col gap-3 w-64">
            {/* Connection Status */}
            <div className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              {isOnline ? t.lobby.online : t.lobby.offline}
            </div>

            {/* BATTLE Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={isOnline ? onBattle : undefined}
                    disabled={isStartingGame || !isOnline}
                    whileHover={isOnline ? { scale: 1.05, y: -4 } : {}}
                    whileTap={isOnline ? { scale: 0.98 } : {}}
                    className={`relative w-full ${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-2xl blur-xl opacity-60" />
                    <div className={`relative bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-2xl py-5 border-b-4 border-red-700 ${isStartingGame ? 'opacity-75' : ''}`}>
                      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl" />
                      <div className="relative flex flex-col items-center gap-1">
                        {isStartingGame ? (
                          <span className="text-white font-black text-xl">{t.lobby.finding.toUpperCase()}</span>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-3xl">⚔️</span>
                              <span className="text-white font-black text-2xl tracking-wider">{t.lobby.battle.toUpperCase()}!</span>
                              <span className="text-3xl">⚔️</span>
                            </div>
                            <span className="text-orange-200 text-xs">{isOnline ? t.lobby.earnTrophies : t.lobby.requiresWifi}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.button>
                </TooltipTrigger>
                {!isOnline && (
                  <TooltipContent>
                    <p>{t.lobby.connectToInternet}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {/* PRACTICE Button */}
            <motion.button onClick={onPractice} disabled={isStartingGame} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }} className="relative w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-xl blur-lg opacity-50" />
              <div className={`relative bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-xl py-4 border-b-4 border-blue-700 ${isStartingGame ? 'opacity-75' : ''}`}>
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-xl" />
                <div className="relative flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📚</span>
                    <span className="text-white font-black text-xl tracking-wider">{t.lobby.practice.toUpperCase()}</span>
                  </div>
                  <span className="text-blue-200 text-xs">{t.lobby.noTrophies}</span>
                </div>
              </div>
            </motion.button>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowSettings(true)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-3 rounded-xl font-bold text-slate-900 flex items-center justify-center gap-2 border-b-4 border-yellow-700">
              <span className="text-xl">⚙️</span>
              <span>{t.lobby.settingsNav.toUpperCase()}</span>
            </motion.button>

            {/* Team Button */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowTeam(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 border-b-4 border-green-700">
              <span className="text-xl">⚽</span>
              <span>{t.lobby.myTeam.toUpperCase()}</span>
              {team && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">⚡{team.elixir}</span>}
            </motion.button>

            {/* League Button */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowLeague(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 border-b-4 border-indigo-700">
              <span className="text-xl">📊</span>
              <span>{t.lobby.leagueNav.toUpperCase()}</span>
            </motion.button>
          </div>
        </main>

        {gameError && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-500/90 rounded-xl px-6 py-3">
            <p className="text-white font-medium">{gameError}</p>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* DESKTOP LAYOUT (1280px+)                    */}
      {/* ============================================ */}
      <div className="hidden lg:flex h-full">

        {/* Left Sidebar - Profile & Stats */}
        <aside className="w-72 xl:w-80 bg-slate-800/50 border-r border-slate-700 flex flex-col p-4 overflow-hidden">
          {/* Profile Section */}
          <div className="text-center mb-4">
            <div className="relative inline-block">
              <Avatar className="h-16 w-16 xl:h-20 xl:w-20 border-3 border-yellow-500 shadow-lg shadow-yellow-500/30">
                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white font-black text-2xl xl:text-3xl">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Badge className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-sm px-2 py-0.5 border-0">
                {t.lobby.lvl} {level}
              </Badge>
            </div>
            <h2 className="text-white font-black text-xl mt-2">{profile.name}</h2>
            <div className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-gradient-to-r ${league.color}`}>
              <span className="text-sm">{league.icon}</span>
              <span className="text-white font-bold text-sm">{league.name}</span>
            </div>
          </div>

          {/* Offline Indicator */}
          <div className="mb-4 flex justify-center">
            <OfflineIndicator grade={profile.grade} language={preferences.language} />
          </div>

          {/* ELO & Level Progress */}
          <div className="bg-slate-700/50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🏆</span>
              <span className="text-yellow-400 font-black text-3xl">{profile.elo}</span>
              <span className="text-yellow-500/70 text-xs">ELO</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{t.lobby.lvl} {level}</span>
                <span>{t.lobby.lvl} {level + 1}</span>
              </div>
              <Progress value={levelProgress} className="h-1.5" />
            </div>
          </div>

          {/* Stats Grid - Compact */}
          <div className="grid grid-cols-2 gap-2">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-slate-700/30 border-slate-600 p-3 text-center">
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-white font-black text-lg">{stat.value}</div>
                <div className="text-slate-400 text-xs">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Profile Button */}
          <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowProfile(true)}
            className="mt-3 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors text-sm">
            <span>👤</span>
            <span>{t.lobby.fullProfile}</span>
          </motion.button>
        </aside>

        {/* Main Center - Arena */}
        <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden p-4">
          <div className={`absolute inset-0 bg-gradient-to-br ${arena.bg} opacity-15`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.7)_70%)]" />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div key={i} className="absolute w-2 h-2 bg-yellow-400/20 rounded-full"
                initial={{ x: `${Math.random() * 100}%`, y: '100%', opacity: 0 }}
                animate={{ y: '-100%', opacity: [0, 0.5, 0] }}
                transition={{ duration: 5 + Math.random() * 3, repeat: Infinity, delay: i * 0.5, ease: 'linear' }}
              />
            ))}
          </div>

          {/* Arena Card - Swipeable */}
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-md">
            <Card className="bg-slate-800/90 border-2 border-slate-600/50 backdrop-blur-sm overflow-hidden shadow-2xl">
              {/* Arena Header - Tap to cycle */}
              <motion.button
                onClick={() => cycleArena('next')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full bg-gradient-to-r ${arena.bg} p-5 text-center border-b border-white/10 cursor-pointer`}
              >
                <motion.div className="text-6xl mb-2"
                  key={preferences.lastArena}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}>
                  {arena.icon}
                </motion.div>
                <h3 className="text-white font-black text-2xl uppercase tracking-wider drop-shadow-lg">
                  {t.gameSetup.arenas[preferences.lastArena as keyof typeof t.gameSetup.arenas]}
                </h3>
                <span className="text-white/70 text-xs">{t.lobby.clickToChange}</span>
              </motion.button>

              {/* Clickable Settings Cards */}
              <div className="p-4 grid grid-cols-3 gap-3">
                {/* Subject - Clickable */}
                <motion.button
                  onClick={cycleSubject}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-slate-700/50 hover:bg-slate-600/50 rounded-lg p-3 text-center cursor-pointer transition-colors border border-transparent hover:border-yellow-500/30"
                >
                  <span className="text-2xl block mb-1">{subjectIcons[preferences.lastSubject] || '📚'}</span>
                  <div className="text-white font-bold text-sm">{t.gameSetup.subjects[preferences.lastSubject as keyof typeof t.gameSetup.subjects]}</div>
                  <div className="text-yellow-400 text-xs">{t.lobby.tapToChange}</div>
                </motion.button>

                {/* Grade - Clickable */}
                <motion.button
                  onClick={cycleGrade}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-slate-700/50 hover:bg-slate-600/50 rounded-lg p-3 text-center cursor-pointer transition-colors border border-transparent hover:border-yellow-500/30"
                >
                  <span className="text-2xl block mb-1">🎓</span>
                  <div className="text-white font-bold text-sm">{t.lobby.level} {preferences.grade}</div>
                  <div className="text-yellow-400 text-xs">{t.lobby.tapToChange}</div>
                </motion.button>

                {/* Language - Clickable */}
                <motion.button
                  onClick={cycleLanguage}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-slate-700/50 hover:bg-slate-600/50 rounded-lg p-3 text-center cursor-pointer transition-colors border border-transparent hover:border-yellow-500/30"
                >
                  <span className="text-2xl block mb-1">{languageFlags[preferences.lastQuestionLanguage]}</span>
                  <div className="text-white font-bold text-sm">{languageNames[preferences.lastQuestionLanguage]}</div>
                  <div className="text-yellow-400 text-xs">{t.lobby.tapToChange}</div>
                </motion.button>
              </div>
            </Card>
          </motion.div>

          {/* Connection Status */}
          <div className={`relative z-10 mt-4 flex items-center justify-center gap-2 py-2 px-6 rounded-full text-sm font-medium ${isOnline ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {isOnline ? t.lobby.onlineBattleAvailable : t.lobby.offlinePracticeOnly}
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 mt-4 flex gap-4">
            {/* PRACTICE Button */}
            <motion.button onClick={onPractice} disabled={isStartingGame}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className={`relative bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-2xl px-8 py-4 border-b-4 border-blue-700 shadow-2xl ${isStartingGame ? 'opacity-75' : ''}`}>
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-2xl" />
                <div className="relative flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📚</span>
                    <span className="text-white font-black text-xl tracking-wider">{t.lobby.practice.toUpperCase()}</span>
                  </div>
                  <span className="text-blue-200 text-xs">{t.lobby.trainingNoTrophies}</span>
                </div>
              </div>
            </motion.button>

            {/* BATTLE Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={isOnline ? onBattle : undefined}
                    disabled={isStartingGame || !isOnline}
                    whileHover={isOnline ? { scale: 1.05, y: -4 } : {}}
                    whileTap={isOnline ? { scale: 0.98 } : {}}
                    className={`relative group ${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className={`relative bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-2xl px-10 py-4 border-b-4 border-red-700 shadow-2xl ${isStartingGame ? 'opacity-75' : ''}`}>
                      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-2xl" />
                      <div className="relative flex flex-col items-center gap-1">
                        {isStartingGame ? (
                          <>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full" />
                            <span className="text-white font-black text-lg tracking-wider">{t.lobby.finding.toUpperCase()}</span>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <motion.span className="text-3xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>⚔️</motion.span>
                              <span className="text-white font-black text-2xl tracking-widest drop-shadow-lg">{t.lobby.battle.toUpperCase()}!</span>
                              <motion.span className="text-3xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}>⚔️</motion.span>
                            </div>
                            <span className="text-orange-200 text-xs">{isOnline ? t.lobby.rankedEarnTrophies : t.lobby.requiresInternet}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.button>
                </TooltipTrigger>
                {!isOnline && (
                  <TooltipContent>
                    <p>{t.lobby.connectToInternet}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          {gameError && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 bg-red-500/90 backdrop-blur-sm rounded-xl px-6 py-3 z-20">
              <p className="text-white font-medium text-sm">{gameError}</p>
            </motion.div>
          )}
        </main>

        {/* Right Sidebar - Actions & Leaderboard */}
        <aside className="w-72 xl:w-80 bg-slate-800/50 border-l border-slate-700 flex flex-col p-4 overflow-hidden">

          {/* Quick Actions */}
          <div className="space-y-2 mb-4">
            {/* MY TEAM Button - Primary action */}
            <motion.button whileHover={{ scale: 1.02, x: 2 }} whileTap={{ scale: 0.98 }} onClick={() => setShowTeam(true)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 rounded-xl font-bold text-white flex items-center gap-2 border-b-3 border-green-700 shadow-lg shadow-green-500/20">
              <span className="text-xl">⚽</span>
              <span>{t.lobby.myTeam.toUpperCase()}</span>
              {team && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-auto">⚡{team.elixir}</span>}
            </motion.button>

            {/* LEAGUE Button */}
            <motion.button whileHover={{ scale: 1.02, x: 2 }} whileTap={{ scale: 0.98 }} onClick={() => setShowLeague(true)}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 rounded-xl font-bold text-white flex items-center gap-2 border-b-3 border-indigo-700 shadow-lg shadow-indigo-500/20">
              <span className="text-xl">📊</span>
              <span>{t.lobby.leagueTable.toUpperCase()}</span>
            </motion.button>

            <motion.button whileHover={{ scale: 1.02, x: 2 }} whileTap={{ scale: 0.98 }} onClick={() => setShowSettings(true)}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-3 rounded-xl font-bold text-slate-900 flex items-center gap-2 border-b-3 border-yellow-700 shadow-lg shadow-yellow-500/20">
              <span className="text-xl">⚙️</span>
              <span>{t.lobby.gameSettings.toUpperCase()}</span>
            </motion.button>

            <motion.button whileHover={{ scale: 1.02, x: 2 }} whileTap={{ scale: 0.98 }} onClick={() => setShowLeaderboard(true)}
              className="w-full bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-colors">
              <span className="text-xl">🏆</span>
              <span>{t.lobby.leaderboard.toUpperCase()}</span>
            </motion.button>
          </div>

          {/* Mini Leaderboard Preview */}
          <div className="flex-1 bg-slate-700/30 rounded-xl p-3 min-h-0 overflow-hidden">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <span>🏆</span> {t.lobby.topPlayers}
            </h3>
            <div className="space-y-2">
              {[
                { rank: 1, name: 'You', elo: profile.elo, isPlayer: true },
                { rank: 2, name: 'AI Master', elo: 1850, isPlayer: false },
                { rank: 3, name: 'Quiz King', elo: 1720, isPlayer: false },
                { rank: 4, name: 'Brain Storm', elo: 1650, isPlayer: false },
              ].map((player) => (
                <div key={player.rank}
                  className={`flex items-center gap-2 p-2 rounded-lg ${player.isPlayer ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-slate-700/50'}`}>
                  <span className={`text-sm font-black ${player.rank === 1 ? 'text-yellow-400' : player.rank === 2 ? 'text-gray-400' : player.rank === 3 ? 'text-orange-400' : 'text-slate-500'}`}>
                    #{player.rank}
                  </span>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className={`text-xs ${player.isPlayer ? 'bg-yellow-500' : 'bg-slate-600'}`}>
                      {player.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-xs truncate ${player.isPlayer ? 'text-yellow-400' : 'text-white'}`}>{player.name}</div>
                  </div>
                  <div className="text-yellow-400 font-bold text-xs">{player.elo}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Soon */}
          <div className="mt-3 bg-slate-700/30 rounded-lg p-3 text-center border border-dashed border-slate-600">
            <span className="text-2xl">🛒</span>
            <p className="text-slate-400 text-xs mt-1">{t.lobby.shopComingSoon}</p>
          </div>
        </aside>
      </div>

      {/* ============ MODALS (All Sizes) ============ */}

      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          preferences={preferences}
          onSave={onSaveSettings}
          playerName={profile.name}
          onClearProfile={onClearProfile}
          accessibilitySettings={accessibilitySettings}
          onAccessibilityChange={onAccessibilityChange}
        />
      )}

      {/* Profile Modal - Custom Full-Screen Modal */}
      <AnimatePresence>
        {showProfile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfile(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            />
            {/* Modal Wrapper - Flexbox Centering */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full h-full lg:w-[42rem] lg:h-auto lg:max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
            >
              {/* Outer glow border */}
              <div className="absolute inset-0 bg-gradient-to-b from-purple-400 via-blue-500 to-cyan-600 rounded-3xl opacity-80 blur-sm" />

              {/* Main container */}
              <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl overflow-hidden flex flex-col border-4 border-purple-500/50 shadow-2xl h-full">

                {/* Header */}
                <div className="relative bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 p-4 border-b-4 border-purple-700">
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">👤</span>
                      <h2 className="text-2xl font-black text-white drop-shadow-sm tracking-wide">
                        {t.lobby.playerProfile.toUpperCase()}
                      </h2>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowProfile(false)}
                      className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg border-2 border-red-700"
                    >
                      <span className="text-white text-2xl font-bold">×</span>
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="text-center">
                    <Avatar className="h-20 w-20 mx-auto border-4 border-yellow-500 shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white font-black text-3xl">
                        {profile.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-white font-black text-2xl mt-4">{profile.name}</h2>
                    <div className={`inline-flex items-center gap-2 mt-2 px-4 py-1 rounded-full bg-gradient-to-r ${league.color}`}>
                      <span>{league.icon}</span>
                      <span className="text-white font-bold">{league.name}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                      <Card key={stat.label} className="bg-slate-800/50 border-slate-700 p-4 text-center">
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className="text-white font-black text-xl">{stat.value}</div>
                        <div className="text-slate-400 text-xs">{stat.label}</div>
                      </Card>
                    ))}
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">{t.lobby.level} {level}</span>
                      <span className="text-slate-400 text-sm">{t.lobby.level} {level + 1}</span>
                    </div>
                    <Progress value={levelProgress} className="h-3" />
                    <div className="text-center mt-2 text-yellow-400 font-bold">{profile.elo} ELO</div>
                  </div>

                  {/* Email Link Section */}
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📧</span>
                        <div>
                          <h4 className="text-white font-bold text-sm">
                            {profile.emailVerified ? t.lobby.accountLinked : t.lobby.linkAccount}
                          </h4>
                          {profile.emailVerified && profile.email ? (
                            <p className="text-green-400 text-xs">{profile.email}</p>
                          ) : (
                            <p className="text-slate-400 text-xs">{t.lobby.linkAccountDescription}</p>
                          )}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowEmailLink(true)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm ${
                          profile.emailVerified
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                        }`}
                      >
                        {profile.emailVerified ? t.lobby.change : t.lobby.link}
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-900/80 border-t-4 border-purple-600">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowProfile(false)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-400 to-purple-500 text-white font-black text-xl shadow-lg shadow-purple-500/30 border-b-4 border-purple-700"
                  >
                    ✓ {t.lobby.close.toUpperCase()}
                  </motion.button>
                </div>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Leaderboard Modal - Custom Full-Screen Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeaderboard(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            />
            {/* Modal Wrapper - Flexbox Centering */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full h-full lg:w-[42rem] lg:h-auto lg:max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
            >
              {/* Outer glow border */}
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 via-orange-500 to-red-600 rounded-3xl opacity-80 blur-sm" />

              {/* Main container */}
              <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl overflow-hidden flex flex-col border-4 border-yellow-500/50 shadow-2xl h-full">

                {/* Header */}
                <div className="relative bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-600 p-4 border-b-4 border-yellow-700">
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🏆</span>
                      <h2 className="text-2xl font-black text-slate-900 drop-shadow-sm tracking-wide">
                        {t.lobby.leaderboard.toUpperCase()}
                      </h2>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowLeaderboard(false)}
                      className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg border-2 border-red-700"
                    >
                      <span className="text-white text-2xl font-bold">×</span>
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  <p className="text-slate-400 text-center">{t.lobby.comingSoonMultiplayer}</p>
                  <div className="space-y-3 mt-2">
                    {[
                      { rank: 1, name: 'You', elo: profile.elo, isPlayer: true },
                      { rank: 2, name: 'AI Champion', elo: 1800, isPlayer: false },
                      { rank: 3, name: 'Math Master', elo: 1650, isPlayer: false },
                      { rank: 4, name: 'Quiz King', elo: 1500, isPlayer: false },
                      { rank: 5, name: 'Brain Storm', elo: 1350, isPlayer: false },
                    ].map((player) => (
                      <motion.div
                        key={player.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: player.rank * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-xl ${player.isPlayer ? 'bg-yellow-500/20 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20' : 'bg-slate-800/50 border border-slate-700'}`}
                      >
                        <div className={`text-2xl font-black w-10 ${
                          player.rank === 1 ? 'text-yellow-400' :
                          player.rank === 2 ? 'text-gray-400' :
                          player.rank === 3 ? 'text-orange-400' : 'text-slate-500'
                        }`}>
                          {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                        </div>
                        <Avatar className="h-12 w-12 border-2 border-slate-600">
                          <AvatarFallback className={player.isPlayer ? 'bg-yellow-500 text-slate-900 font-bold' : 'bg-slate-600 text-white'}>{player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className={`font-bold text-lg ${player.isPlayer ? 'text-yellow-400' : 'text-white'}`}>{player.name}</div>
                        </div>
                        <div className="text-yellow-400 font-bold text-lg">{player.elo} 🏆</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-900/80 border-t-4 border-yellow-600">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLeaderboard(false)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-slate-900 font-black text-xl shadow-lg shadow-yellow-500/30 border-b-4 border-yellow-700"
                  >
                    ✓ {t.lobby.close.toUpperCase()}
                  </motion.button>
                </div>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Team Modal - FIFA-style Team View */}
      <AnimatePresence>
        {showTeam && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTeam(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            />
            {/* Modal Wrapper */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full h-full lg:w-[56rem] lg:h-auto lg:max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
              >
                {/* Outer glow border */}
                <div className="absolute inset-0 bg-gradient-to-b from-green-400 via-emerald-500 to-green-600 rounded-3xl opacity-80 blur-sm" />

                {/* Main container */}
                <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl overflow-hidden flex flex-col border-4 border-green-500/50 shadow-2xl h-full">

                  {/* Header */}
                  <div className="relative bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 p-4 border-b-4 border-green-700">
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">⚽</span>
                        <h2 className="text-2xl font-black text-white drop-shadow-sm tracking-wide">
                          {t.lobby.myTeam.toUpperCase()}
                        </h2>
                        {team && (
                          <div className="flex items-center gap-2 ml-4">
                            <ElixirBadge current={team.elixir} />
                          </div>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowTeam(false)}
                        className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg border-2 border-red-700"
                      >
                        <span className="text-white text-2xl font-bold">×</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Content - Team View */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {team ? (
                      <TeamView
                        team={team}
                        onCardClick={handleCardClick}
                        compact={false}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <span className="text-6xl mb-4 block">⚽</span>
                          <p className="text-slate-400 text-lg">{t.lobby.creatingTeam}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-slate-900/80 border-t-4 border-green-600">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowTeam(false)}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 text-white font-black text-xl shadow-lg shadow-green-500/30 border-b-4 border-green-700"
                    >
                      ✓ {t.lobby.close.toUpperCase()}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Training Modal */}
      {showTrainingModal && selectedCard && team && (
        <TrainingModal
          isOpen={showTrainingModal}
          onClose={() => {
            setShowTrainingModal(false)
            setSelectedCard(null)
          }}
          card={selectedCard}
          currentElixir={team.elixir}
          onTrain={handleTrainCard}
          onQuickLevel={handleQuickLevelCard}
        />
      )}

      {/* League Modal */}
      <AnimatePresence>
        {showLeague && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeague(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            />
            {/* Modal Wrapper */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full h-full lg:w-[56rem] lg:h-auto lg:max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
              >
                {/* Outer glow border */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-400 via-purple-500 to-indigo-600 rounded-3xl opacity-80 blur-sm" />

                {/* Main container */}
                <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl overflow-hidden flex flex-col border-4 border-indigo-500/50 shadow-2xl h-full">

                  {/* Header */}
                  <div className="relative bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 p-4 border-b-4 border-indigo-700">
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">📊</span>
                        <h2 className="text-2xl font-black text-white drop-shadow-sm tracking-wide">
                          {t.lobby.leagueTable.toUpperCase()}
                        </h2>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowLeague(false)}
                        className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg border-2 border-red-700"
                      >
                        <span className="text-white text-2xl font-bold">×</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Content - League Table */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <LeagueTable
                      userTier={team?.leagueTier || 'BRONZE'}
                      userPoints={team?.leaguePoints || 0}
                      compact={false}
                    />
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-slate-900/80 border-t-4 border-indigo-600">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowLeague(false)}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-400 to-indigo-500 text-white font-black text-xl shadow-lg shadow-indigo-500/30 border-b-4 border-indigo-700"
                    >
                      ✓ {t.lobby.close.toUpperCase()}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Email Link Modal */}
      <EmailLinkModal
        isOpen={showEmailLink}
        onClose={() => setShowEmailLink(false)}
        language={preferences.uiLanguage}
      />
    </div>
  )
}
