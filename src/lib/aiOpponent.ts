import { Question } from '@/types/questions'
import { Player } from '@/types/game'

export interface AIOpponentConfig {
  skillLevel: number // 0-1, where 1 is perfect player
  responseTimeVariation: number // milliseconds of randomness
  streakBonus: number // accuracy boost when on a streak
  difficultyPenalty: number // accuracy penalty for harder questions
}

export class AIOpponent {
  private config: AIOpponentConfig
  private currentStreak: number = 0
  private totalAnswered: number = 0
  private correctAnswers: number = 0

  constructor(player: Player) {
    // Calculate AI skill based on ELO rating
    const skillFromElo = Math.min(0.95, Math.max(0.3, (player.elo - 800) / 1000))
    
    this.config = {
      skillLevel: skillFromElo,
      responseTimeVariation: 2000, // 2 seconds of variation
      streakBonus: 0.1, // 10% bonus when on streak
      difficultyPenalty: 0.05 // 5% penalty per difficulty level above 2
    }
  }

  // Calculate if AI will answer correctly
  calculateCorrectness(question: Question): boolean {
    let baseAccuracy = this.config.skillLevel

    // Adjust for question difficulty
    const difficultyPenalty = Math.max(0, (question.difficulty - 2) * this.config.difficultyPenalty)
    baseAccuracy -= difficultyPenalty

    // Apply streak bonus
    if (this.currentStreak >= 3) {
      baseAccuracy += this.config.streakBonus
    }

    // Subject-specific adjustments (AI might be better at some subjects)
    switch (question.subject) {
      case 'math':
        baseAccuracy += 0.05 // AI slightly better at math
        break
      case 'language':
        baseAccuracy -= 0.05 // AI slightly worse at language nuances
        break
    }

    // Cap accuracy between 0.1 and 0.98 (AI can make mistakes)
    baseAccuracy = Math.min(0.98, Math.max(0.1, baseAccuracy))

    return Math.random() < baseAccuracy
  }

  // Calculate AI response time
  calculateResponseTime(question: Question, isCorrect: boolean): number {
    const baseTime = question.timeLimit * 0.4 // AI uses ~40% of available time on average
    
    // Harder questions take longer
    const difficultyMultiplier = 1 + (question.difficulty - 1) * 0.2
    
    // Wrong answers might be quicker (AI gives up) or slower (AI struggles)
    const correctnessMultiplier = isCorrect ? 1 : (Math.random() > 0.5 ? 0.7 : 1.3)
    
    // Add randomness
    const randomVariation = (Math.random() - 0.5) * this.config.responseTimeVariation
    
    const finalTime = (baseTime * difficultyMultiplier * correctnessMultiplier) + randomVariation
    
    // Ensure response time is within reasonable bounds
    return Math.max(1000, Math.min(question.timeLimit - 500, finalTime))
  }

  // Get AI's answer for a question
  getAnswer(question: Question): { 
    answerIndex?: number
    answerValue?: number | boolean
    isCorrect: boolean
    responseTime: number 
  } {
    const isCorrect = this.calculateCorrectness(question)
    const responseTime = this.calculateResponseTime(question, isCorrect)

    // Update AI stats
    this.totalAnswered++
    if (isCorrect) {
      this.correctAnswers++
      this.currentStreak++
    } else {
      this.currentStreak = 0
    }

    // Generate answer based on question type
    switch (question.type) {
      case 'multiple-choice':
      case 'image-question':
        const correctIndex = question.correctIndex
        let answerIndex: number
        
        if (isCorrect) {
          answerIndex = correctIndex
        } else {
          // Pick a wrong answer (but not completely random - AI has some logic)
          const wrongAnswers = question.answers
            .map((_, i) => i)
            .filter(i => i !== correctIndex)
          
          // AI might pick an answer that's "close" to correct (e.g., off by one in math)
          answerIndex = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)]
        }
        
        return { answerIndex, isCorrect, responseTime }
        
      case 'true-false':
        const correctAnswer = question.correct
        const aiAnswer = isCorrect ? correctAnswer : !correctAnswer
        return { 
          answerValue: aiAnswer, 
          answerIndex: aiAnswer ? 1 : 0, // Convert to index for consistency
          isCorrect, 
          responseTime 
        }
        
      case 'number-input':
        const correctValue = question.correctAnswer
        let aiValue: number
        
        if (isCorrect) {
          // Add small tolerance even for "correct" answers
          const tolerance = question.tolerance || 0
          const variation = (Math.random() - 0.5) * tolerance * 0.5
          aiValue = correctValue + variation
        } else {
          // Generate a plausible wrong answer
          const variation = correctValue * (0.2 + Math.random() * 0.6) // 20-80% off
          aiValue = Math.random() > 0.5 
            ? correctValue + variation 
            : correctValue - variation
        }
        
        return { answerValue: aiValue, isCorrect, responseTime }
        
      default:
        return { isCorrect: false, responseTime }
    }
  }

  // Get AI's current stats
  getStats() {
    return {
      accuracy: this.totalAnswered > 0 ? (this.correctAnswers / this.totalAnswered) * 100 : 0,
      currentStreak: this.currentStreak,
      totalAnswered: this.totalAnswered,
      correctAnswers: this.correctAnswers
    }
  }

  // Reset AI for new game
  reset() {
    this.currentStreak = 0
    this.totalAnswered = 0
    this.correctAnswers = 0
  }
}