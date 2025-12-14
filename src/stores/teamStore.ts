/**
 * Team Store - Zustand state management for Team Builder
 * Handles team data, elixir, training, and league info
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Team, PlayerCard, Arena, SubjectValue, LeagueTier } from '@/types/team'
import { createInitialCards, createNewTeam, calculateOverall, getCardRarity, getLevelFromXP, getXPToNextLevel } from '@/types/team'
import { ELIXIR_CONFIG } from '@/constants/game'
import { calculateElixirFromAnswer, calculateActualElixirGain } from '@/lib/elixirService'
import { generateUUID } from '@/lib/uuid'

interface TeamState {
  // Team data
  team: Team | null
  isLoading: boolean
  error: string | null

  // Actions
  initializeTeam: (userId: string, teamName: string, arena?: Arena) => void
  setGoalkeeperSubject: (subject: SubjectValue) => void
  loadTeam: (team: Team) => void

  // Elixir actions
  addElixir: (amount: number, reason: string) => { actualGain: number; cappedByDaily: boolean; cappedByStorage: boolean }
  spendElixir: (amount: number) => boolean
  resetDailyElixir: () => void

  // Training actions
  trainCard: (cardId: string) => { success: boolean; xpGained: number; leveledUp: boolean; newLevel?: number }
  quickLevelCard: (cardId: string) => { success: boolean; xpGained: number; leveledUp: boolean; newLevel?: number }

  // Card stats update (from gameplay)
  updateCardStats: (subject: SubjectValue, correct: boolean, responseTimeMs: number, timeLimitMs: number) => void

  // League actions
  updateLeaguePoints: (pointsChange: number) => void

  // Match completion
  processMatchResults: (
    questionsAnswered: Array<{
      subject: SubjectValue
      responseTimeMs: number
      timeLimitMs: number
      isCorrect: boolean
    }>,
    matchResult: 'win' | 'draw' | 'loss',
    goalsFor: number,
    goalsAgainst: number
  ) => {
    elixirEarned: number
    xpDistributed: Record<SubjectValue, number>
    pointsChange: number
    cardsLeveledUp: SubjectValue[]
  }

  // Utility
  getCard: (subject: SubjectValue) => PlayerCard | undefined
  getCardById: (cardId: string) => PlayerCard | undefined
  clearTeam: () => void
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      team: null,
      isLoading: false,
      error: null,

      initializeTeam: (userId: string, teamName: string, arena: Arena = 'soccer') => {
        const newTeam = createNewTeam(userId, teamName, arena)

        // Generate team ID first
        const teamId = generateUUID()

        // Create all 11 cards with default goalkeeper subject (German - important subject)
        // User can change goalkeeper subject later via settings
        const defaultGkSubject: SubjectValue = 'german'
        const cardData = createInitialCards(teamId, arena, defaultGkSubject)
        const cards: PlayerCard[] = cardData.map(card => ({
          ...card,
          id: generateUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        }))

        const team: Team = {
          id: teamId,
          ...newTeam,
          goalkeeperSubject: defaultGkSubject,
          cards,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        set({ team, error: null })
      },

      setGoalkeeperSubject: (subject: SubjectValue) => {
        const { team } = get()
        if (!team) return

        // Create all cards now that we have GK choice
        const cardData = createInitialCards(team.id, team.arena, subject)
        const cards: PlayerCard[] = cardData.map(card => ({
          ...card,
          id: generateUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        }))

        set({
          team: {
            ...team,
            goalkeeperSubject: subject,
            cards,
            updatedAt: new Date()
          }
        })
      },

      loadTeam: (team: Team) => {
        set({ team, isLoading: false, error: null })
      },

      addElixir: (amount: number, _reason?: string) => {
        const { team } = get()
        if (!team) return { actualGain: 0, cappedByDaily: false, cappedByStorage: false }

        const { actualGain, cappedByDaily, cappedByStorage } = calculateActualElixirGain(
          amount,
          team.elixir,
          team.elixirEarnedToday
        )

        if (actualGain > 0) {
          set({
            team: {
              ...team,
              elixir: Math.min(team.elixir + actualGain, ELIXIR_CONFIG.MAX_STORAGE),
              elixirEarnedToday: team.elixirEarnedToday + actualGain,
              updatedAt: new Date()
            }
          })
        }

        return { actualGain, cappedByDaily, cappedByStorage }
      },

      spendElixir: (amount: number) => {
        const { team } = get()
        if (!team || team.elixir < amount) return false

        set({
          team: {
            ...team,
            elixir: team.elixir - amount,
            updatedAt: new Date()
          }
        })

        return true
      },

      resetDailyElixir: () => {
        const { team } = get()
        if (!team) return

        const now = new Date()
        const lastReset = new Date(team.lastElixirReset)

        // Only reset if it's a new day
        if (now.toDateString() !== lastReset.toDateString()) {
          set({
            team: {
              ...team,
              elixirEarnedToday: 0,
              lastElixirReset: now,
              updatedAt: now
            }
          })
        }
      },

      trainCard: (cardId: string) => {
        const { team, spendElixir } = get()
        if (!team) return { success: false, xpGained: 0, leveledUp: false }

        const cardIndex = team.cards.findIndex(c => c.id === cardId)
        if (cardIndex === -1) return { success: false, xpGained: 0, leveledUp: false }

        // Try to spend elixir
        if (!spendElixir(ELIXIR_CONFIG.TRAIN_COST)) {
          return { success: false, xpGained: 0, leveledUp: false }
        }

        // IMPORTANT: Get fresh team state after spendElixir modified it
        const currentTeam = get().team!

        const card = currentTeam.cards[cardIndex]
        const xpGained = ELIXIR_CONFIG.TRAIN_XP_GAIN
        const newXP = card.xp + xpGained
        const oldLevel = card.level
        const newLevel = getLevelFromXP(newXP)
        const leveledUp = newLevel > oldLevel

        // Update card
        const updatedCards = [...currentTeam.cards]
        updatedCards[cardIndex] = {
          ...card,
          xp: newXP,
          level: newLevel,
          xpToNextLevel: getXPToNextLevel(newXP),
          updatedAt: new Date()
        }

        set({
          team: {
            ...currentTeam,
            cards: updatedCards,
            updatedAt: new Date()
          }
        })

        return {
          success: true,
          xpGained,
          leveledUp,
          newLevel: leveledUp ? newLevel : undefined
        }
      },

      quickLevelCard: (cardId: string) => {
        const { team, spendElixir } = get()
        if (!team) return { success: false, xpGained: 0, leveledUp: false }

        const cardIndex = team.cards.findIndex(c => c.id === cardId)
        if (cardIndex === -1) return { success: false, xpGained: 0, leveledUp: false }

        // Try to spend elixir (50 for quick level)
        if (!spendElixir(ELIXIR_CONFIG.QUICK_LEVEL_COST)) {
          return { success: false, xpGained: 0, leveledUp: false }
        }

        // IMPORTANT: Get fresh team state after spendElixir modified it
        const currentTeam = get().team!

        const card = currentTeam.cards[cardIndex]
        const xpGained = ELIXIR_CONFIG.QUICK_LEVEL_XP
        const newXP = card.xp + xpGained
        const oldLevel = card.level
        const newLevel = getLevelFromXP(newXP)
        const leveledUp = newLevel > oldLevel

        // Update card
        const updatedCards = [...currentTeam.cards]
        updatedCards[cardIndex] = {
          ...card,
          xp: newXP,
          level: newLevel,
          xpToNextLevel: getXPToNextLevel(newXP),
          updatedAt: new Date()
        }

        set({
          team: {
            ...currentTeam,
            cards: updatedCards,
            updatedAt: new Date()
          }
        })

        return {
          success: true,
          xpGained,
          leveledUp,
          newLevel: leveledUp ? newLevel : undefined
        }
      },

      updateCardStats: (subject: SubjectValue, correct: boolean, responseTimeMs: number, timeLimitMs: number) => {
        const { team } = get()
        if (!team) return

        const cardIndex = team.cards.findIndex(c => c.subject === subject)
        if (cardIndex === -1) return

        const card = team.cards[cardIndex]

        // Calculate new stats based on performance
        // This is a simplified version - in production, use ELO-like system
        const speedRatio = responseTimeMs / timeLimitMs
        const accuracyChange = correct ? 1 : -0.5
        const speedChange = speedRatio < 0.5 ? 0.5 : speedRatio < 0.75 ? 0.2 : 0

        const newAccuracy = Math.max(0, Math.min(99, card.accuracy + accuracyChange))
        const newSpeed = Math.max(0, Math.min(99, card.speed + speedChange))

        // Consistency improves with streaks (handled separately)
        // Difficulty mastery improves when answering harder questions correctly

        const updatedCards = [...team.cards]
        const newStats = {
          accuracy: Math.round(newAccuracy),
          speed: Math.round(newSpeed),
          consistency: card.consistency,
          difficultyMastery: card.difficultyMastery
        }

        updatedCards[cardIndex] = {
          ...card,
          ...newStats,
          overall: calculateOverall(newStats),
          rarity: getCardRarity(calculateOverall(newStats)),
          updatedAt: new Date()
        }

        set({
          team: {
            ...team,
            cards: updatedCards,
            updatedAt: new Date()
          }
        })
      },

      updateLeaguePoints: (pointsChange: number) => {
        const { team } = get()
        if (!team) return

        const newPoints = Math.max(0, team.leaguePoints + pointsChange)

        // Determine new tier based on points
        let newTier: LeagueTier = 'BRONZE'
        if (newPoints >= 3001) newTier = 'LEGEND'
        else if (newPoints >= 2501) newTier = 'CHAMPION'
        else if (newPoints >= 2001) newTier = 'DIAMOND'
        else if (newPoints >= 1501) newTier = 'PLATINUM'
        else if (newPoints >= 1001) newTier = 'GOLD'
        else if (newPoints >= 501) newTier = 'SILVER'

        set({
          team: {
            ...team,
            leaguePoints: newPoints,
            leagueTier: newTier,
            updatedAt: new Date()
          }
        })
      },

      processMatchResults: (questionsAnswered, matchResult, _goalsFor?: number, _goalsAgainst?: number) => {
        const { team, addElixir, updateCardStats, updateLeaguePoints } = get()

        if (!team) {
          return {
            elixirEarned: 0,
            xpDistributed: {} as Record<SubjectValue, number>,
            pointsChange: 0,
            cardsLeveledUp: []
          }
        }

        // Calculate elixir earned
        let totalElixir = 0
        let currentStreak = 0
        const xpDistributed: Record<SubjectValue, number> = {} as Record<SubjectValue, number>
        const cardsLeveledUp: SubjectValue[] = []

        questionsAnswered.forEach((q) => {
          if (q.isCorrect) {
            currentStreak++
          } else {
            currentStreak = 0
          }

          // Calculate elixir for this answer
          const elixir = calculateElixirFromAnswer(
            q.responseTimeMs,
            q.timeLimitMs,
            currentStreak,
            q.isCorrect
          )
          totalElixir += elixir

          // Calculate XP for the subject card
          if (q.isCorrect) {
            const baseXP = 2 // Base XP per correct answer
            const speedBonus = q.responseTimeMs / q.timeLimitMs < 0.5 ? 2 : 1
            const xpGain = baseXP * speedBonus

            if (!xpDistributed[q.subject]) {
              xpDistributed[q.subject] = 0
            }
            xpDistributed[q.subject] += xpGain
          }

          // Update card stats
          updateCardStats(q.subject, q.isCorrect, q.responseTimeMs, q.timeLimitMs)
        })

        // Add elixir
        const { actualGain } = addElixir(totalElixir, 'match_reward')

        // Distribute XP to cards and check for level ups
        const updatedCards = [...team.cards]
        Object.entries(xpDistributed).forEach(([subject, xp]) => {
          const cardIndex = updatedCards.findIndex(c => c.subject === subject)
          if (cardIndex !== -1) {
            const card = updatedCards[cardIndex]
            const oldLevel = card.level
            const newXP = card.xp + xp
            const newLevel = getLevelFromXP(newXP)

            updatedCards[cardIndex] = {
              ...card,
              xp: newXP,
              level: newLevel,
              xpToNextLevel: getXPToNextLevel(newXP),
              updatedAt: new Date()
            }

            if (newLevel > oldLevel) {
              cardsLeveledUp.push(subject as SubjectValue)
            }
          }
        })

        // Calculate league points
        const pointsChange = matchResult === 'win' ? 3 : matchResult === 'draw' ? 1 : 0
        updateLeaguePoints(pointsChange)

        // Update team with new cards
        set({
          team: {
            ...get().team!,
            cards: updatedCards,
            updatedAt: new Date()
          }
        })

        return {
          elixirEarned: actualGain,
          xpDistributed,
          pointsChange,
          cardsLeveledUp
        }
      },

      getCard: (subject: SubjectValue) => {
        const { team } = get()
        return team?.cards.find(c => c.subject === subject)
      },

      getCardById: (cardId: string) => {
        const { team } = get()
        return team?.cards.find(c => c.id === cardId)
      },

      clearTeam: () => {
        set({ team: null, error: null })
      }
    }),
    {
      name: 'learnkick-team',
      partialize: (state) => ({ team: state.team })
    }
  )
)

export default useTeamStore
