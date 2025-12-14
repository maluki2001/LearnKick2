// League System Constants - Clash Royale-style progression
// Each league has 3 tiers (III, II, I) with increasing trophy requirements

export interface League {
  id: string
  name: string
  tier: 1 | 2 | 3  // 3 = lowest (III), 1 = highest (I)
  minTrophies: number
  maxTrophies: number
  color: string
  iconColor: string
  bgGradient: string
}

export const LEAGUES: League[] = [
  // Bronze League (0-599)
  { id: 'bronze-3', name: 'Bronze', tier: 3, minTrophies: 0, maxTrophies: 199, color: '#CD7F32', iconColor: '#8B4513', bgGradient: 'from-amber-700 to-amber-900' },
  { id: 'bronze-2', name: 'Bronze', tier: 2, minTrophies: 200, maxTrophies: 399, color: '#CD7F32', iconColor: '#8B4513', bgGradient: 'from-amber-700 to-amber-900' },
  { id: 'bronze-1', name: 'Bronze', tier: 1, minTrophies: 400, maxTrophies: 599, color: '#CD7F32', iconColor: '#8B4513', bgGradient: 'from-amber-700 to-amber-900' },

  // Silver League (600-1199)
  { id: 'silver-3', name: 'Silver', tier: 3, minTrophies: 600, maxTrophies: 799, color: '#C0C0C0', iconColor: '#708090', bgGradient: 'from-gray-400 to-gray-600' },
  { id: 'silver-2', name: 'Silver', tier: 2, minTrophies: 800, maxTrophies: 999, color: '#C0C0C0', iconColor: '#708090', bgGradient: 'from-gray-400 to-gray-600' },
  { id: 'silver-1', name: 'Silver', tier: 1, minTrophies: 1000, maxTrophies: 1199, color: '#C0C0C0', iconColor: '#708090', bgGradient: 'from-gray-400 to-gray-600' },

  // Gold League (1200-1999)
  { id: 'gold-3', name: 'Gold', tier: 3, minTrophies: 1200, maxTrophies: 1399, color: '#FFD700', iconColor: '#DAA520', bgGradient: 'from-yellow-400 to-yellow-600' },
  { id: 'gold-2', name: 'Gold', tier: 2, minTrophies: 1400, maxTrophies: 1699, color: '#FFD700', iconColor: '#DAA520', bgGradient: 'from-yellow-400 to-yellow-600' },
  { id: 'gold-1', name: 'Gold', tier: 1, minTrophies: 1700, maxTrophies: 1999, color: '#FFD700', iconColor: '#DAA520', bgGradient: 'from-yellow-400 to-yellow-600' },

  // Platinum League (2000-2999)
  { id: 'platinum-3', name: 'Platinum', tier: 3, minTrophies: 2000, maxTrophies: 2299, color: '#00CED1', iconColor: '#008B8B', bgGradient: 'from-cyan-400 to-cyan-600' },
  { id: 'platinum-2', name: 'Platinum', tier: 2, minTrophies: 2300, maxTrophies: 2599, color: '#00CED1', iconColor: '#008B8B', bgGradient: 'from-cyan-400 to-cyan-600' },
  { id: 'platinum-1', name: 'Platinum', tier: 1, minTrophies: 2600, maxTrophies: 2999, color: '#00CED1', iconColor: '#008B8B', bgGradient: 'from-cyan-400 to-cyan-600' },

  // Diamond League (3000-3999)
  { id: 'diamond-3', name: 'Diamond', tier: 3, minTrophies: 3000, maxTrophies: 3299, color: '#B9F2FF', iconColor: '#4169E1', bgGradient: 'from-blue-300 to-blue-500' },
  { id: 'diamond-2', name: 'Diamond', tier: 2, minTrophies: 3300, maxTrophies: 3599, color: '#B9F2FF', iconColor: '#4169E1', bgGradient: 'from-blue-300 to-blue-500' },
  { id: 'diamond-1', name: 'Diamond', tier: 1, minTrophies: 3600, maxTrophies: 3999, color: '#B9F2FF', iconColor: '#4169E1', bgGradient: 'from-blue-300 to-blue-500' },

  // Master League (4000-4999)
  { id: 'master-3', name: 'Master', tier: 3, minTrophies: 4000, maxTrophies: 4299, color: '#9932CC', iconColor: '#4B0082', bgGradient: 'from-purple-500 to-purple-700' },
  { id: 'master-2', name: 'Master', tier: 2, minTrophies: 4300, maxTrophies: 4599, color: '#9932CC', iconColor: '#4B0082', bgGradient: 'from-purple-500 to-purple-700' },
  { id: 'master-1', name: 'Master', tier: 1, minTrophies: 4600, maxTrophies: 4999, color: '#9932CC', iconColor: '#4B0082', bgGradient: 'from-purple-500 to-purple-700' },

  // Champion League (5000-5999)
  { id: 'champion-3', name: 'Champion', tier: 3, minTrophies: 5000, maxTrophies: 5299, color: '#FF4500', iconColor: '#8B0000', bgGradient: 'from-orange-500 to-red-600' },
  { id: 'champion-2', name: 'Champion', tier: 2, minTrophies: 5300, maxTrophies: 5599, color: '#FF4500', iconColor: '#8B0000', bgGradient: 'from-orange-500 to-red-600' },
  { id: 'champion-1', name: 'Champion', tier: 1, minTrophies: 5600, maxTrophies: 5999, color: '#FF4500', iconColor: '#8B0000', bgGradient: 'from-orange-500 to-red-600' },

  // Legend League (6000+)
  { id: 'legend', name: 'Legend', tier: 1, minTrophies: 6000, maxTrophies: Infinity, color: '#FFD700', iconColor: '#FF6347', bgGradient: 'from-yellow-400 via-orange-500 to-red-600' },
]

// Trophy change constants
export const TROPHY_CONFIG = {
  // Base trophy changes
  WIN_BASE: 30,
  LOSS_BASE: 20,

  // Bonuses and penalties
  UNDERDOG_BONUS: 5,      // Winning against higher-rated player
  FAVORITE_PENALTY: 5,   // Losing against lower-rated player
  STREAK_BONUS: 2,       // Per consecutive win (max 5)
  MAX_STREAK_BONUS: 10,  // Cap at 5 consecutive wins

  // Trophy difference thresholds
  UNDERDOG_THRESHOLD: 200,  // Trophy difference to be considered underdog

  // Minimum trophies
  MIN_TROPHIES: 0,

  // League protection (can't drop below league minimum in first 10 games)
  PROTECTION_GAMES: 10,
}

// Helper functions
export function getLeagueById(leagueId: string): League | undefined {
  return LEAGUES.find(l => l.id === leagueId)
}

export function getLeagueByTrophies(trophies: number): League {
  // Find the appropriate league for trophy count
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (trophies >= LEAGUES[i].minTrophies) {
      return LEAGUES[i]
    }
  }
  return LEAGUES[0] // Default to bronze-3
}

export function getNextLeague(currentLeagueId: string): League | null {
  const currentIndex = LEAGUES.findIndex(l => l.id === currentLeagueId)
  if (currentIndex === -1 || currentIndex === LEAGUES.length - 1) {
    return null
  }
  return LEAGUES[currentIndex + 1]
}

export function getPreviousLeague(currentLeagueId: string): League | null {
  const currentIndex = LEAGUES.findIndex(l => l.id === currentLeagueId)
  if (currentIndex <= 0) {
    return null
  }
  return LEAGUES[currentIndex - 1]
}

export function getTrophiesToNextLeague(trophies: number): number {
  const currentLeague = getLeagueByTrophies(trophies)
  const nextLeague = getNextLeague(currentLeague.id)
  if (!nextLeague) {
    return 0 // Already at max league
  }
  return nextLeague.minTrophies - trophies
}

export function getLeagueProgress(trophies: number): number {
  const currentLeague = getLeagueByTrophies(trophies)
  const leagueRange = currentLeague.maxTrophies - currentLeague.minTrophies
  if (leagueRange === Infinity || leagueRange === 0) {
    return 100 // At legend league or edge case
  }
  const progressInLeague = trophies - currentLeague.minTrophies
  return Math.min(100, Math.round((progressInLeague / leagueRange) * 100))
}

export function formatLeagueName(league: League): string {
  if (league.id === 'legend') {
    return 'Legend'
  }
  const tierNumeral = league.tier === 3 ? 'III' : league.tier === 2 ? 'II' : 'I'
  return `${league.name} ${tierNumeral}`
}

// League display info for UI
export const LEAGUE_DISPLAY = {
  'bronze-3': { emoji: '🥉', label: 'Bronze III' },
  'bronze-2': { emoji: '🥉', label: 'Bronze II' },
  'bronze-1': { emoji: '🥉', label: 'Bronze I' },
  'silver-3': { emoji: '🥈', label: 'Silver III' },
  'silver-2': { emoji: '🥈', label: 'Silver II' },
  'silver-1': { emoji: '🥈', label: 'Silver I' },
  'gold-3': { emoji: '🥇', label: 'Gold III' },
  'gold-2': { emoji: '🥇', label: 'Gold II' },
  'gold-1': { emoji: '🥇', label: 'Gold I' },
  'platinum-3': { emoji: '💎', label: 'Platinum III' },
  'platinum-2': { emoji: '💎', label: 'Platinum II' },
  'platinum-1': { emoji: '💎', label: 'Platinum I' },
  'diamond-3': { emoji: '💠', label: 'Diamond III' },
  'diamond-2': { emoji: '💠', label: 'Diamond II' },
  'diamond-1': { emoji: '💠', label: 'Diamond I' },
  'master-3': { emoji: '👑', label: 'Master III' },
  'master-2': { emoji: '👑', label: 'Master II' },
  'master-1': { emoji: '👑', label: 'Master I' },
  'champion-3': { emoji: '🏆', label: 'Champion III' },
  'champion-2': { emoji: '🏆', label: 'Champion II' },
  'champion-1': { emoji: '🏆', label: 'Champion I' },
  'legend': { emoji: '⭐', label: 'Legend' },
  'staff': { emoji: '🛡️', label: 'Staff' },
} as const
