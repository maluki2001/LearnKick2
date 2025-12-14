export const GAME_CONFIG = {
  MATCH_DURATION: 60,
  ANSWERS_PER_GOAL: 3,
  MIN_ANSWER_DELAY: 1000,
  GRADE_TIME_LIMITS: {
    1: 15000, // 15 seconds for grade 1
    2: 12000, // 12 seconds for grade 2
    3: 10000, // 10 seconds for grade 3
    4: 8000,  // 8 seconds for grade 4
    5: 6000,  // 6 seconds for grade 5
    6: 5000   // 5 seconds for grade 6
  }
} as const

export const ARENAS = {
  SOCCER: 'soccer',
  HOCKEY: 'hockey'
} as const

// 12 Subjects for Team Builder (Lehrplan 21 Swiss Curriculum + All)
export const SUBJECTS = {
  ALL: 'all',
  MATH: 'math',
  GERMAN: 'german',
  FRENCH: 'french',
  ENGLISH: 'english',
  SCIENCE: 'science',
  GEOGRAPHY: 'geography',
  HISTORY: 'history',
  MUSIC: 'music',
  ART: 'art',
  SPORTS: 'sports',
  DIGITAL: 'digital'
} as const

// Subject metadata with icons and colors
export const SUBJECT_META = {
  math: { icon: '🔢', color: '#10b981', name: 'Mathematics' },
  german: { icon: '📝', color: '#6366f1', name: 'German' },
  french: { icon: '🇫🇷', color: '#3b82f6', name: 'French' },
  english: { icon: '🇬🇧', color: '#ef4444', name: 'English' },
  science: { icon: '🔬', color: '#06b6d4', name: 'Science' },
  geography: { icon: '🌍', color: '#f59e0b', name: 'Geography' },
  history: { icon: '🏛️', color: '#8b5cf6', name: 'History' },
  music: { icon: '🎵', color: '#ec4899', name: 'Music' },
  art: { icon: '🎨', color: '#f97316', name: 'Art' },
  sports: { icon: '⚽', color: '#22c55e', name: 'Sports' },
  digital: { icon: '💻', color: '#64748b', name: 'Digital Skills' }
} as const

// Soccer Positions (4-3-3 Formation) - 11 positions
export const SOCCER_POSITIONS = {
  GK: { number: 1, name: 'Goalkeeper', subject: null, row: 'goalkeeper' },
  RB: { number: 2, name: 'Right Back', subject: 'digital', row: 'defense' },
  CB1: { number: 4, name: 'Center Back', subject: 'art', row: 'defense' },
  CB2: { number: 5, name: 'Center Back', subject: 'sports', row: 'defense' },
  LB: { number: 3, name: 'Left Back', subject: 'music', row: 'defense' },
  CM1: { number: 6, name: 'Defensive Mid', subject: 'geography', row: 'midfield' },
  CAM: { number: 10, name: 'Attacking Mid', subject: 'history', row: 'midfield' },
  CM2: { number: 8, name: 'Box-to-Box Mid', subject: 'science', row: 'midfield' },
  LW: { number: 11, name: 'Left Wing', subject: 'french', row: 'attack' },
  ST: { number: 9, name: 'Striker', subject: 'math', row: 'attack' },
  RW: { number: 7, name: 'Right Wing', subject: 'english', row: 'attack' }
} as const

// Hockey Positions (6 on ice)
export const HOCKEY_POSITIONS = {
  G: { number: 1, name: 'Goalie', subject: null, row: 'goalkeeper' },
  LD: { number: 2, name: 'Left Defense', subject: 'science', row: 'defense' },
  RD: { number: 3, name: 'Right Defense', subject: 'geography', row: 'defense' },
  LW: { number: 4, name: 'Left Wing', subject: 'french', row: 'forward' },
  C: { number: 5, name: 'Center', subject: 'math', row: 'forward' },
  RW: { number: 6, name: 'Right Wing', subject: 'english', row: 'forward' }
} as const

// Position types for TypeScript
export type SoccerPosition = keyof typeof SOCCER_POSITIONS
export type HockeyPosition = keyof typeof HOCKEY_POSITIONS
export type Subject = keyof typeof SUBJECT_META

// Card rarity thresholds
export const CARD_RARITY = {
  BRONZE: { min: 0, max: 39, name: 'Bronze', color: '#cd7f32' },
  SILVER: { min: 40, max: 59, name: 'Silver', color: '#c0c0c0' },
  GOLD: { min: 60, max: 79, name: 'Gold', color: '#ffd700' },
  DIAMOND: { min: 80, max: 89, name: 'Diamond', color: '#00bfff' },
  CHAMPION: { min: 90, max: 99, name: 'Champion', color: '#ff6b6b' }
} as const

// Level XP requirements
export const LEVEL_XP = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  6: 1750,
  7: 2750,
  8: 4000,
  9: 5500,
  10: 7500,
  11: 10000,
  12: 13000,
  13: 17000,
  14: 22000
} as const

// Elixir configuration
export const ELIXIR_CONFIG = {
  MAX_STORAGE: 500,
  DAILY_CAP: 200,
  WEEKLY_STREAK_BONUS: 50,
  TRAIN_COST: 10,
  TRAIN_XP_GAIN: 5,
  BOOST_COST: 20,
  QUICK_LEVEL_COST: 50,
  QUICK_LEVEL_XP: 25
} as const

// League points
export const MATCH_POINTS = {
  WIN: 3,
  DRAW: 1,
  LOSS: 0
} as const

// League tiers
export const LEAGUE_TIERS = {
  BRONZE: { min: 0, max: 500, name: 'Bronze', icon: '🥉' },
  SILVER: { min: 501, max: 1000, name: 'Silver', icon: '🥈' },
  GOLD: { min: 1001, max: 1500, name: 'Gold', icon: '🥇' },
  PLATINUM: { min: 1501, max: 2000, name: 'Platinum', icon: '💎' },
  DIAMOND: { min: 2001, max: 2500, name: 'Diamond', icon: '💠' },
  CHAMPION: { min: 2501, max: 3000, name: 'Champion', icon: '👑' },
  LEGEND: { min: 3001, max: Infinity, name: 'Legend', icon: '🏆' }
} as const

export const LANGUAGES = {
  GERMAN: 'de',
  ENGLISH: 'en',
  FRENCH: 'fr'
} as const