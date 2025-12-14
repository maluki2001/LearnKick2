export type GameMode = 'family' | 'school'

export interface GameModeConfig {
  // Timing and pace
  questionTimeLimit: number // milliseconds
  countdownDuration: number // seconds before game starts
  resultDisplayTime: number // time to show answer feedback
  
  // Scoring and progression
  enableELORating: boolean
  showDetailedStats: boolean
  enableLeaderboards: boolean
  strictAnswering: boolean // prevent multiple attempts
  
  // UI and experience
  celebrationLevel: 'minimal' | 'moderate' | 'enthusiastic'
  showCorrectAnswer: boolean
  encouragingMessages: boolean
  soundEffects: boolean
  
  // Content and difficulty
  adaptiveDifficulty: boolean
  allowSkipping: boolean
  hintSystem: boolean
  multipleAttempts: boolean
  
  // Assessment and tracking
  detailedAnalytics: boolean
  progressReports: boolean
  parentTeacherDashboard: boolean
  exportResults: boolean
}

export const FAMILY_MODE_CONFIG: GameModeConfig = {
  // More relaxed timing
  questionTimeLimit: 20000, // 20 seconds
  countdownDuration: 3,
  resultDisplayTime: 3000, // 3 seconds
  
  // Casual progression
  enableELORating: false,
  showDetailedStats: false,
  enableLeaderboards: false,
  strictAnswering: false,
  
  // Fun and encouraging
  celebrationLevel: 'enthusiastic',
  showCorrectAnswer: true,
  encouragingMessages: true,
  soundEffects: true,
  
  // Helpful features
  adaptiveDifficulty: true,
  allowSkipping: true,
  hintSystem: true,
  multipleAttempts: true,
  
  // Minimal tracking
  detailedAnalytics: false,
  progressReports: false,
  parentTeacherDashboard: false,
  exportResults: false
}

export const SCHOOL_MODE_CONFIG: GameModeConfig = {
  // Standard academic timing
  questionTimeLimit: 15000, // 15 seconds
  countdownDuration: 5,
  resultDisplayTime: 2000, // 2 seconds
  
  // Academic assessment
  enableELORating: true,
  showDetailedStats: true,
  enableLeaderboards: true,
  strictAnswering: true,
  
  // Professional presentation
  celebrationLevel: 'moderate',
  showCorrectAnswer: true,
  encouragingMessages: false,
  soundEffects: false,
  
  // Structured learning
  adaptiveDifficulty: true,
  allowSkipping: false,
  hintSystem: false,
  multipleAttempts: false,
  
  // Comprehensive tracking
  detailedAnalytics: true,
  progressReports: true,
  parentTeacherDashboard: true,
  exportResults: true
}

export function getGameModeConfig(mode: GameMode): GameModeConfig {
  return mode === 'family' ? FAMILY_MODE_CONFIG : SCHOOL_MODE_CONFIG
}

export interface GameModeDescription {
  name: string
  description: string
  icon: string
  features: string[]
  bestFor: string[]
}

export const GAME_MODE_DESCRIPTIONS: Record<GameMode, GameModeDescription> = {
  family: {
    name: 'Family Mode',
    description: 'Fun learning experience for family game time',
    icon: '👨‍👩‍👧‍👦',
    features: [
      'Relaxed timing (20 seconds per question)',
      'Encouraging celebrations and messages',
      'Multiple attempts allowed',
      'Hints and help available',
      'Skip difficult questions',
      'Focus on fun and engagement'
    ],
    bestFor: [
      'Family learning time',
      'Casual practice',
      'Building confidence',
      'Younger children',
      'Homework support'
    ]
  },
  school: {
    name: 'School Mode',
    description: 'Structured learning environment for educational assessment',
    icon: '🏫',
    features: [
      'Standard timing (15 seconds per question)',
      'Detailed performance analytics',
      'ELO rating system',
      'Progress reports',
      'Single attempt per question',
      'Comprehensive tracking'
    ],
    bestFor: [
      'Classroom use',
      'Formal assessment',
      'Progress monitoring',
      'Teacher dashboards',
      'Academic evaluation'
    ]
  }
}