'use client'

import { usePlayerStates, useGameStatus, useGameStore } from '@/stores/gameStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback, useRef, memo } from 'react'

interface LiveMatchArenaProps {
  arena: 'soccer' | 'hockey'
  player1Name?: string
  player2Name?: string
}

// Soccer positions - 4-3-3 formation (11 players)
const SOCCER_TEAM1_POSITIONS = [
  { x: 10, y: 50, role: 'GK' },
  { x: 25, y: 20, role: 'DEF' },
  { x: 25, y: 40, role: 'DEF' },
  { x: 25, y: 60, role: 'DEF' },
  { x: 25, y: 80, role: 'DEF' },
  { x: 45, y: 25, role: 'MID' },
  { x: 45, y: 50, role: 'MID' },
  { x: 45, y: 75, role: 'MID' },
  { x: 65, y: 20, role: 'FWD' },
  { x: 65, y: 50, role: 'FWD' },
  { x: 65, y: 80, role: 'FWD' },
]

const SOCCER_TEAM2_POSITIONS = [
  { x: 90, y: 50, role: 'GK' },
  { x: 75, y: 20, role: 'DEF' },
  { x: 75, y: 40, role: 'DEF' },
  { x: 75, y: 60, role: 'DEF' },
  { x: 75, y: 80, role: 'DEF' },
  { x: 55, y: 25, role: 'MID' },
  { x: 55, y: 50, role: 'MID' },
  { x: 55, y: 75, role: 'MID' },
  { x: 35, y: 20, role: 'FWD' },
  { x: 35, y: 50, role: 'FWD' },
  { x: 35, y: 80, role: 'FWD' },
]

// Hockey positions - 6 players (1 goalie, 2 defense, 3 forwards)
const HOCKEY_TEAM1_POSITIONS = [
  { x: 8, y: 50, role: 'G' },   // Goalie
  { x: 25, y: 30, role: 'LD' }, // Left Defense
  { x: 25, y: 70, role: 'RD' }, // Right Defense
  { x: 50, y: 25, role: 'LW' }, // Left Wing
  { x: 55, y: 50, role: 'C' },  // Center
  { x: 50, y: 75, role: 'RW' }, // Right Wing
]

const HOCKEY_TEAM2_POSITIONS = [
  { x: 92, y: 50, role: 'G' },  // Goalie
  { x: 75, y: 30, role: 'LD' }, // Left Defense
  { x: 75, y: 70, role: 'RD' }, // Right Defense
  { x: 50, y: 25, role: 'LW' }, // Left Wing (mirrored)
  { x: 45, y: 50, role: 'C' },  // Center
  { x: 50, y: 75, role: 'RW' }, // Right Wing
]

// Confetti colors
const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']

// Memoized to prevent re-renders from parent state changes (like timer ticks)
export const LiveMatchArena = memo(function LiveMatchArenaInner({ arena, player1Name = 'You', player2Name = 'AI Rival' }: LiveMatchArenaProps) {
  const { player1, player2 } = usePlayerStates()
  const { timeRemaining } = useGameStatus()
  useGameStore() // Store access for potential future answer feedback display

  const [lastGoals, setLastGoals] = useState({ p1: 0, p2: 0 })
  const [showGoalCelebration, setShowGoalCelebration] = useState<'player1' | 'player2' | null>(null)
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([])

  // Ball state - position tracked but rendered via ballTarget for smooth animation
  const [, setBallPos] = useState({ x: 50, y: 50 })
  const [ballTarget, setBallTarget] = useState({ x: 50, y: 50 })

  // Team shifts based on who's attacking - use refs to avoid recreating simulatePass
  const [team1Shift, setTeam1Shift] = useState(0)
  const [team2Shift, setTeam2Shift] = useState(0)
  const team1ShiftRef = useRef(0)
  const team2ShiftRef = useRef(0)

  // Active player with ball
  const [activePlayer, setActivePlayer] = useState<{ team: 1 | 2; index: number }>({ team: 1, index: 9 })

  // Momentum indicator
  const [momentum, setMomentum] = useState<'you' | 'ai' | 'neutral'>('neutral')

  const passIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Keep refs in sync with state
  useEffect(() => {
    team1ShiftRef.current = team1Shift
    team2ShiftRef.current = team2Shift
  }, [team1Shift, team2Shift])

  // Refs for player data to use in stable callbacks
  const player1Ref = useRef(player1)
  const player2Ref = useRef(player2)
  useEffect(() => {
    player1Ref.current = player1
    player2Ref.current = player2
  }, [player1, player2])

  // Match minute (90 min match in 60 seconds)
  const matchMinute = Math.floor((60 - timeRemaining) * 1.5)

  // Generate confetti for goals
  const triggerConfetti = useCallback(() => {
    const newConfetti = Array.from({ length: 30 }, (_, i) => ({
      id: Date.now() + i,
      x: 20 + Math.random() * 60,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 0.3
    }))
    setConfetti(newConfetti)
    setTimeout(() => setConfetti([]), 2500)
  }, [])

  // Get positions based on arena type
  const TEAM1_POSITIONS = arena === 'hockey' ? HOCKEY_TEAM1_POSITIONS : SOCCER_TEAM1_POSITIONS
  const TEAM2_POSITIONS = arena === 'hockey' ? HOCKEY_TEAM2_POSITIONS : SOCCER_TEAM2_POSITIONS

  // Simulate ball passing - uses refs for stable callback
  const simulatePass = useCallback(() => {
    const p1 = player1Ref.current
    const p2 = player2Ref.current
    if (!p1 || !p2) return

    const p1Attack = p1.position - 50
    const p2Attack = p2.position - 50
    const possessionBias = (p1Attack - p2Attack) / 100
    const p1HasBall = Math.random() < (0.5 + possessionBias)

    const possessionTeam = p1HasBall ? 1 : 2
    const positions = possessionTeam === 1 ?
      (arena === 'hockey' ? HOCKEY_TEAM1_POSITIONS : SOCCER_TEAM1_POSITIONS) :
      (arena === 'hockey' ? HOCKEY_TEAM2_POSITIONS : SOCCER_TEAM2_POSITIONS)
    const attackLevel = possessionTeam === 1 ? p1Attack : p2Attack

    let targetIndex: number
    if (arena === 'hockey') {
      // Hockey: 6 players (0=G, 1-2=D, 3-5=F)
      if (attackLevel > 20) {
        targetIndex = 3 + Math.floor(Math.random() * 3) // Forwards
      } else if (attackLevel > 0) {
        targetIndex = Math.random() > 0.5 ? (3 + Math.floor(Math.random() * 3)) : (1 + Math.floor(Math.random() * 2))
      } else {
        targetIndex = 1 + Math.floor(Math.random() * 2) // Defense
      }
    } else {
      // Soccer: 11 players
      if (attackLevel > 20) {
        targetIndex = Math.random() > 0.3 ? (8 + Math.floor(Math.random() * 3)) : (5 + Math.floor(Math.random() * 3))
      } else if (attackLevel > 0) {
        targetIndex = 5 + Math.floor(Math.random() * 3)
      } else {
        targetIndex = 1 + Math.floor(Math.random() * 4)
      }
    }

    const targetPlayer = positions[targetIndex]
    const shift = possessionTeam === 1 ? team1ShiftRef.current : -team2ShiftRef.current
    const newX = targetPlayer.x + shift + (Math.random() * 8 - 4)
    const newY = targetPlayer.y + (Math.random() * 12 - 6)

    setBallTarget({
      x: Math.max(8, Math.min(92, newX)),
      y: Math.max(15, Math.min(85, newY))
    })
    setActivePlayer({ team: possessionTeam as 1 | 2, index: targetIndex })

    setTimeout(() => {
      setBallPos({
        x: Math.max(8, Math.min(92, newX)),
        y: Math.max(15, Math.min(85, newY))
      })
    }, 250)
  }, [arena]) // Depends on arena

  // Ball passing interval - runs once on mount
  useEffect(() => {
    passIntervalRef.current = setInterval(() => {
      simulatePass()
    }, 1200) // Fixed interval to prevent jitter

    return () => {
      if (passIntervalRef.current) clearInterval(passIntervalRef.current)
    }
  }, [simulatePass])

  // Update momentum and team shifts
  useEffect(() => {
    if (!player1 || !player2) return

    const p1Dominance = player1.position - 50
    const p2Dominance = player2.position - 50
    const netDominance = p1Dominance - p2Dominance

    setTeam1Shift(Math.max(0, netDominance * 0.25))
    setTeam2Shift(Math.max(0, -netDominance * 0.25))

    if (netDominance > 15) setMomentum('you')
    else if (netDominance < -15) setMomentum('ai')
    else setMomentum('neutral')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player1?.position, player2?.position])

  // Track goals
  useEffect(() => {
    if (player1 && player2) {
      if (player1.goals > lastGoals.p1) {
        setShowGoalCelebration('player1')
        triggerConfetti()
        setBallPos({ x: 50, y: 50 })
        setTimeout(() => setShowGoalCelebration(null), 2500)
      }
      if (player2.goals > lastGoals.p2) {
        setShowGoalCelebration('player2')
        setBallPos({ x: 50, y: 50 })
        setTimeout(() => setShowGoalCelebration(null), 2500)
      }
      setLastGoals({ p1: player1.goals, p2: player2.goals })
    }
  }, [player1?.goals, player2?.goals, lastGoals.p1, lastGoals.p2, player1, player2, triggerConfetti])

  if (!player1 || !player2) return null

  // Calculate shifted positions
  const getTeam1Positions = () => TEAM1_POSITIONS.map(p => ({
    ...p,
    x: Math.min(85, p.x + team1Shift)
  }))

  const getTeam2Positions = () => TEAM2_POSITIONS.map(p => ({
    ...p,
    x: Math.max(15, p.x - team2Shift)
  }))

  // Soccer pitch - fills container which handles aspect ratio
  // Parent container should set aspectRatio: 16/10 for proper proportions
  return (
    <div className="w-full h-full select-none overflow-hidden rounded-xl shadow-xl border-2 border-emerald-700 flex flex-col">
      {/* Scoreboard Header - FIXED HEIGHT ~56px */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 px-2 py-1.5">
        {/* Grid layout: 3 equal columns to ensure center is truly centered */}
        <div className="grid grid-cols-3 items-center">
          {/* Your Team - LEFT */}
          <div className="flex items-center gap-2 justify-self-start">
            <motion.div
              className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg border border-blue-300"
              animate={momentum === 'you' ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <span className="text-sm">{arena === 'hockey' ? '🏒' : '⚽'}</span>
            </motion.div>
            <div className="text-left">
              <div className="text-white font-black text-xs truncate max-w-[60px]">{player1Name}</div>
              {player1.currentStreak > 0 && <div className="text-yellow-300 text-[10px] font-bold">🔥{player1.currentStreak}</div>}
            </div>
          </div>

          {/* Score + Minutes - TRUE CENTER */}
          <div className="flex items-center justify-center gap-1">
            <motion.span
              className="text-white text-3xl font-black drop-shadow-lg"
              key={`p1-score-${player1.goals}`}
              initial={{ scale: 1.3, color: '#FFD700' }}
              animate={{ scale: 1, color: '#FFFFFF' }}
            >
              {player1.goals}
            </motion.span>
            <div className="text-yellow-300 text-sm font-black">-</div>
            <motion.span
              className="text-white text-3xl font-black drop-shadow-lg"
              key={`p2-score-${player2.goals}`}
              initial={{ scale: 1.3, color: '#FFD700' }}
              animate={{ scale: 1, color: '#FFFFFF' }}
            >
              {player2.goals}
            </motion.span>
            <div className="bg-black/30 px-1.5 py-0.5 rounded ml-1">
              <span className="text-green-400 text-[10px] font-mono font-bold">{matchMinute}&apos;</span>
            </div>
          </div>

          {/* AI Team - RIGHT */}
          <div className="flex items-center gap-2 justify-self-end">
            <div className="text-right">
              <div className="text-white font-black text-xs truncate max-w-[60px]">{player2Name}</div>
              {player2.currentStreak > 0 && <div className="text-yellow-300 text-[10px] font-bold">{player2.currentStreak}🔥</div>}
            </div>
            <motion.div
              className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center shadow-lg border border-red-300"
              animate={momentum === 'ai' ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <span className="text-sm">🤖</span>
            </motion.div>
          </div>
        </div>

        {/* Momentum Bar - THIN */}
        <div className="mt-1 h-1.5 bg-gray-800/50 rounded-full overflow-hidden flex">
          <motion.div
            className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full"
            animate={{ width: `${player1.position}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>

      {/* The Pitch/Rink - FIXED ASPECT RATIO for proper field proportions */}
      <div
        className="relative overflow-hidden w-full"
        style={{
          aspectRatio: '16 / 9', // Wide rectangle like a real field/rink
          maxHeight: '300px', // Cap height on mobile to prevent square shape
          background: arena === 'hockey'
            ? `linear-gradient(180deg, #e8f4fc 0%, #d0e8f5 50%, #c5e0f0 100%)`
            : `repeating-linear-gradient(90deg, #2d8a2d 0px, #2d8a2d 10%, #32a032 10%, #32a032 20%)`,
        }}
      >
        {/* Surface Pattern Overlay */}
        <div
          className="absolute inset-0"
          style={{
            opacity: arena === 'hockey' ? 0.1 : 0.3,
            backgroundImage: arena === 'hockey'
              ? `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px)`
              : `radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.1) 100%)`
          }}
        />

        {/* Field/Rink Markings */}
        {arena === 'hockey' ? (
          /* HOCKEY RINK MARKINGS */
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
            {/* Rink boundary with rounded corners */}
            <rect x="2" y="2" width="96" height="56" rx="10" ry="10" fill="none" stroke="#333" strokeWidth="1" opacity="0.8" />

            {/* Center red line */}
            <line x1="50" y1="2" x2="50" y2="58" stroke="#cc0000" strokeWidth="1.5" opacity="0.9" />

            {/* Blue lines */}
            <line x1="30" y1="2" x2="30" y2="58" stroke="#0066cc" strokeWidth="1.2" opacity="0.9" />
            <line x1="70" y1="2" x2="70" y2="58" stroke="#0066cc" strokeWidth="1.2" opacity="0.9" />

            {/* Center ice circle */}
            <circle cx="50" cy="30" r="8" fill="none" stroke="#0066cc" strokeWidth="0.8" opacity="0.9" />
            <circle cx="50" cy="30" r="1" fill="#0066cc" opacity="0.9" />

            {/* Faceoff circles - left zone */}
            <circle cx="15" cy="20" r="6" fill="none" stroke="#cc0000" strokeWidth="0.6" opacity="0.8" />
            <circle cx="15" cy="40" r="6" fill="none" stroke="#cc0000" strokeWidth="0.6" opacity="0.8" />

            {/* Faceoff circles - right zone */}
            <circle cx="85" cy="20" r="6" fill="none" stroke="#cc0000" strokeWidth="0.6" opacity="0.8" />
            <circle cx="85" cy="40" r="6" fill="none" stroke="#cc0000" strokeWidth="0.6" opacity="0.8" />

            {/* Goal creases */}
            <path d="M 2 25 Q 8 30 2 35" fill="rgba(100,150,255,0.3)" stroke="#0066cc" strokeWidth="0.5" />
            <path d="M 98 25 Q 92 30 98 35" fill="rgba(100,150,255,0.3)" stroke="#0066cc" strokeWidth="0.5" />

            {/* Goals */}
            <rect x="0" y="26" width="2" height="8" fill="#cc0000" opacity="0.9" />
            <rect x="98" y="26" width="2" height="8" fill="#cc0000" opacity="0.9" />
          </svg>
        ) : (
          /* SOCCER FIELD MARKINGS */
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
            {/* Outer boundary */}
            <rect x="2" y="2" width="96" height="56" fill="none" stroke="white" strokeWidth="0.8" opacity="0.9" />

            {/* Center line */}
            <line x1="50" y1="2" x2="50" y2="58" stroke="white" strokeWidth="0.6" opacity="0.9" />

            {/* Center circle */}
            <circle cx="50" cy="30" r="10" fill="none" stroke="white" strokeWidth="0.6" opacity="0.9" />
            <circle cx="50" cy="30" r="1.5" fill="white" opacity="0.9" />

            {/* Left penalty area */}
            <rect x="2" y="15" width="14" height="30" fill="none" stroke="white" strokeWidth="0.5" opacity="0.8" />
            <rect x="2" y="22" width="6" height="16" fill="none" stroke="white" strokeWidth="0.4" opacity="0.7" />

            {/* Right penalty area */}
            <rect x="84" y="15" width="14" height="30" fill="none" stroke="white" strokeWidth="0.5" opacity="0.8" />
            <rect x="92" y="22" width="6" height="16" fill="none" stroke="white" strokeWidth="0.4" opacity="0.7" />

            {/* Goals */}
            <rect x="0" y="24" width="2" height="12" fill="#FFD700" opacity="0.9" />
            <rect x="98" y="24" width="2" height="12" fill="#FFD700" opacity="0.9" />
          </svg>
        )}

        {/* Team 1 Players (Blue) - Bigger and Colorful */}
        {getTeam1Positions().map((pos, i) => (
          <motion.div
            key={`t1-${i}`}
            className="absolute"
            animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <motion.div
              className={`relative ${
                activePlayer.team === 1 && activePlayer.index === i ? 'z-10' : ''
              }`}
              animate={activePlayer.team === 1 && activePlayer.index === i ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              {/* Player glow when active */}
              {activePlayer.team === 1 && activePlayer.index === i && (
                <div className="absolute -inset-2 bg-blue-400 rounded-full blur-md opacity-60" />
              )}

              {/* Player body */}
              <div className={`
                w-6 h-6 rounded-full shadow-lg border-2 flex items-center justify-center
                ${i === 0
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300' // Goalkeeper/Goalie
                  : 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300'
                }
              `}>
                <span className="text-white text-[8px] font-black">
                  {arena === 'hockey' ? HOCKEY_TEAM1_POSITIONS[i]?.role : (i === 0 ? 'GK' : i)}
                </span>
              </div>

              {/* Shadow under player */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/30 rounded-full blur-sm" />
            </motion.div>
          </motion.div>
        ))}

        {/* Team 2 Players (Red) */}
        {getTeam2Positions().map((pos, i) => (
          <motion.div
            key={`t2-${i}`}
            className="absolute"
            animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <motion.div
              className={`relative ${
                activePlayer.team === 2 && activePlayer.index === i ? 'z-10' : ''
              }`}
              animate={activePlayer.team === 2 && activePlayer.index === i ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              {/* Player glow when active */}
              {activePlayer.team === 2 && activePlayer.index === i && (
                <div className="absolute -inset-2 bg-red-400 rounded-full blur-md opacity-60" />
              )}

              {/* Player body */}
              <div className={`
                w-6 h-6 rounded-full shadow-lg border-2 flex items-center justify-center
                ${i === 0
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300' // Goalkeeper/Goalie
                  : 'bg-gradient-to-br from-red-400 to-red-600 border-red-300'
                }
              `}>
                <span className="text-white text-[8px] font-black">
                  {arena === 'hockey' ? HOCKEY_TEAM2_POSITIONS[i]?.role : (i === 0 ? 'GK' : i)}
                </span>
              </div>

              {/* Shadow */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/30 rounded-full blur-sm" />
            </motion.div>
          </motion.div>
        ))}

        {/* The Ball/Puck */}
        <motion.div
          className="absolute z-20"
          animate={{ left: `${ballTarget.x}%`, top: `${ballTarget.y}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          {arena === 'hockey' ? (
            /* HOCKEY PUCK */
            <>
              {/* Puck glow */}
              <div className="absolute -inset-1 bg-black rounded-full blur-sm opacity-40" />
              {/* Puck */}
              <div
                className="w-5 h-5 rounded-full relative"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #3a3a3a 0%, #1a1a1a 50%, #000000 100%)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.1)',
                }}
              />
              {/* Puck shadow */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/50 rounded-full blur-sm" />
            </>
          ) : (
            /* SOCCER BALL */
            <>
              {/* Ball glow */}
              <div className="absolute -inset-2 bg-white rounded-full blur-md opacity-50" />
              {/* Ball */}
              <motion.div
                className="w-5 h-5 rounded-full relative"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #f0f0f0 40%, #d0d0d0 70%, #a0a0a0 100%)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.2)',
                }}
              >
                {/* Ball pattern */}
                <div className="absolute inset-0 rounded-full overflow-hidden opacity-30">
                  <div className="absolute w-2 h-2 bg-black rounded-sm top-1 left-1 rotate-12" />
                  <div className="absolute w-1.5 h-1.5 bg-black rounded-sm bottom-1 right-1 -rotate-12" />
                </div>
              </motion.div>
              {/* Ball shadow */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/40 rounded-full blur-sm" />
            </>
          )}
        </motion.div>

        {/* Momentum Indicator */}
        <AnimatePresence>
          {momentum !== 'neutral' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`absolute top-2 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full font-black text-sm shadow-lg ${
                momentum === 'you'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
              }`}
            >
              {momentum === 'you' ? (
                <span className="flex items-center gap-1">
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                    ⚡
                  </motion.span>
                  ATTACKING!
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                    →
                  </motion.span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <motion.span animate={{ x: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                    ←
                  </motion.span>
                  AI ATTACK!
                  <motion.span animate={{ x: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                    ⚠️
                  </motion.span>
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confetti for Goals */}
        <AnimatePresence>
          {confetti.map((c) => (
            <motion.div
              key={c.id}
              className="absolute w-3 h-3 z-40"
              initial={{
                left: `${c.x}%`,
                top: '0%',
                rotate: 0,
                opacity: 1
              }}
              animate={{
                top: '120%',
                rotate: 720,
                opacity: 0
              }}
              transition={{
                duration: 2,
                delay: c.delay,
                ease: 'easeOut'
              }}
              style={{ background: c.color, borderRadius: '2px' }}
            />
          ))}
        </AnimatePresence>

        {/* Goal Celebration */}
        <AnimatePresence>
          {showGoalCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-50 bg-black/40"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className={`text-5xl font-black ${
                    showGoalCelebration === 'player1' ? 'text-blue-400' : 'text-red-400'
                  }`}
                  style={{ textShadow: '0 0 30px currentColor, 0 0 60px currentColor' }}
                >
                  {arena === 'hockey' ? '🏒 GOAL! 🏒' : '⚽ GOAL! ⚽'}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white text-lg font-bold mt-2"
                >
                  {showGoalCelebration === 'player1' ? player1Name : player2Name}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timer Footer - MINIMAL */}
      <div className="bg-gray-900 px-2 py-1">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-xs">⏱️ {timeRemaining}s</span>
          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${timeRemaining > 20 ? 'bg-green-500' : timeRemaining > 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
              animate={{ width: `${(timeRemaining / 60) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
})
