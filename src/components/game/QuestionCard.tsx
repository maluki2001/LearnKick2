'use client'

import { Question } from '@/types/questions'
import { useGameStore } from '@/stores/gameStore'
import { useMemo, useState, useEffect } from 'react'
import { CheckCircle, XCircle, Star, Trophy } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSounds } from '@/hooks/useSounds'

interface QuestionCardProps {
  question: Question
}

// Subject icons for visual flair
const SUBJECT_ICONS: Record<string, string> = {
  math: '🔢',
  mathematics: '🔢',
  science: '🔬',
  english: '📚',
  french: '🇫🇷',
  german: '🇩🇪',
  history: '🏛️',
  geography: '🌍',
  art: '🎨',
  music: '🎵',
  sports: '⚽',
  digital: '💻',
  default: '📖'
}

// Gradient colors for subjects
const SUBJECT_GRADIENTS: Record<string, string> = {
  math: 'from-blue-500 to-cyan-500',
  mathematics: 'from-blue-500 to-cyan-500',
  science: 'from-green-500 to-emerald-500',
  english: 'from-purple-500 to-pink-500',
  french: 'from-blue-600 to-red-500',
  german: 'from-yellow-500 to-red-500',
  history: 'from-amber-500 to-orange-500',
  geography: 'from-teal-500 to-blue-500',
  art: 'from-pink-500 to-purple-500',
  music: 'from-violet-500 to-purple-500',
  sports: 'from-green-500 to-lime-500',
  digital: 'from-slate-500 to-blue-500',
  default: 'from-gray-500 to-gray-600'
}

// Single consistent button style for all answers
const BUTTON_STYLE = {
  bg: 'from-indigo-500 to-blue-600',
  border: 'border-indigo-400',
  hover: 'hover:from-indigo-400 hover:to-blue-500'
}

// Helper to properly convert question.correct to boolean
// Handles: boolean, "true", "false", "Wahr", "Falsch", "Richtig", "Vrai", "Faux"
const parseTrueFalseCorrect = (correct: boolean | string | undefined): boolean => {
  if (typeof correct === 'boolean') {
    return correct
  }
  if (typeof correct === 'string') {
    const trueValues = ['true', 'wahr', 'richtig', 'vrai', 'correct', 'yes', 'ja', 'oui']
    return trueValues.includes(correct.toLowerCase())
  }
  return false
}

export function QuestionCard({ question }: QuestionCardProps) {
  const { t } = useLanguage()
  const { submitAnswer, showAnswer, selectedAnswer, answerFeedback } = useGameStore()
  const [pressedIndex, setPressedIndex] = useState<number | null>(null)
  const { play } = useSounds()

  // Play sound when answer feedback changes
  useEffect(() => {
    if (showAnswer && answerFeedback) {
      if (answerFeedback.correct) {
        play('correct')
      } else {
        play('incorrect')
      }
    }
  }, [showAnswer, answerFeedback, play])

  // For number-input questions, generate options ONCE and memoize them
  const numberOptions = useMemo(() => {
    if (question.type !== 'number-input') return null

    const correctAnswer = question.correctAnswer
    const options = [
      correctAnswer,
      correctAnswer + Math.max(1, Math.floor(correctAnswer * 0.2)),
      correctAnswer - Math.max(1, Math.floor(correctAnswer * 0.15)),
      correctAnswer + Math.max(2, Math.floor(correctAnswer * 0.3))
    ].filter(opt => opt > 0)

    while (options.length < 4) {
      const newOption = correctAnswer + options.length
      if (!options.includes(newOption)) {
        options.push(newOption)
      }
    }

    const sortedOptions = [...new Set(options)].slice(0, 4).sort((a, b) => a - b)
    const correctIndex = sortedOptions.indexOf(correctAnswer)

    return { options: sortedOptions, correctIndex }
  }, [question])

  if (!question) return null

  const handleMultipleChoice = (index: number) => {
    if (showAnswer) return
    setPressedIndex(index)
    setTimeout(() => {
      submitAnswer(index)
      setPressedIndex(null)
    }, 150)
  }

  const subjectKey = question.subject.toLowerCase()
  const subjectIcon = SUBJECT_ICONS[subjectKey] || SUBJECT_ICONS.default
  const subjectGradient = SUBJECT_GRADIENTS[subjectKey] || SUBJECT_GRADIENTS.default

  // Render answer button - GAME STYLE
  const renderAnswerButton = (answer: string, index: number, correctIdx: number) => {
    const isCorrect = index === correctIdx
    const isWrong = selectedAnswer === index && index !== correctIdx
    const _isPressed = pressedIndex === index

    let buttonStyle = ''
    let contentStyle = ''

    if (!showAnswer) {
      // Normal state - same color for all buttons
      buttonStyle = `bg-gradient-to-r ${BUTTON_STYLE.bg} ${BUTTON_STYLE.hover} border-2 ${BUTTON_STYLE.border} shadow-lg`
      contentStyle = 'text-white'
    } else if (isCorrect) {
      // Correct answer
      buttonStyle = 'bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-green-300 shadow-lg shadow-green-500/30'
      contentStyle = 'text-white'
    } else if (isWrong) {
      // Wrong answer selected
      buttonStyle = 'bg-gradient-to-r from-red-400 to-red-500 border-2 border-red-300 shadow-lg shadow-red-500/30'
      contentStyle = 'text-white'
    } else {
      // Other options after answer
      buttonStyle = 'bg-gray-200 border-2 border-gray-300 opacity-50'
      contentStyle = 'text-gray-500'
    }

    return (
      <button
        key={index}
        onClick={() => handleMultipleChoice(index)}
        disabled={showAnswer}
        className={`
          h-14 text-left px-3 relative flex items-center w-full rounded-xl
          transition-opacity duration-150
          ${buttonStyle}
        `}
      >
        {/* Letter badge */}
        <div className={`
          w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mr-2
          ${showAnswer ? 'bg-white/20' : 'bg-white/30'}
          backdrop-blur-sm
        `}>
          <span className={`font-black text-sm ${contentStyle}`}>
            {String.fromCharCode(65 + index)}
          </span>
        </div>

        {/* Answer text */}
        <span className={`flex-1 leading-tight font-bold text-sm line-clamp-2 ${contentStyle}`}>
          {answer}
        </span>

        {/* Result icon - always reserve space to prevent layout shift */}
        <div className="w-6 h-6 flex-shrink-0 ml-1 flex items-center justify-center">
          {showAnswer && isCorrect && (
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          )}
          {showAnswer && isWrong && (
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>
      </button>
    )
  }

  return (
    <>
      {/* GAME-STYLE Question Card */}
      <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${subjectGradient} px-3 py-2 flex-shrink-0`}>
          <div className="flex justify-between items-center">
            {/* Subject badge */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <span className="text-lg">{subjectIcon}</span>
              </div>
              <div>
                <div className="text-white font-black text-sm drop-shadow-md">
                  {t.gameSetup.subjects[question.subject as keyof typeof t.gameSetup.subjects] ||
                    question.subject.charAt(0).toUpperCase() + question.subject.slice(1)}
                </div>
                <div className="text-white/80 text-[10px] font-medium">
                  {t.game.grade} {question.grade}
                </div>
              </div>
            </div>

            {/* Difficulty stars */}
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i <= question.difficulty
                      ? 'text-yellow-300 fill-yellow-300'
                      : 'text-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Question area - dark themed, compact layout */}
        <div className="flex-1 min-h-0 flex flex-col bg-gradient-to-b from-slate-800 to-slate-900 p-3">
          {/* Question text - centered in available space */}
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 w-full">
            {question.type === 'image-question' && question.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={question.imageUrl}
                alt="Question"
                className="h-12 max-w-[100px] object-contain rounded bg-white/10 p-1 mx-auto mb-2"
              />
            )}
            <h2 className="text-white font-bold text-center leading-snug text-sm">
              {question.type === 'true-false'
                ? (question.statement || (question as unknown as { question?: string }).question || 'True or False?')
                : question.question}
            </h2>
            </div>
          </div>

          {/* Answer Grid - no flex-1, stays compact */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {question.type === 'multiple-choice' || question.type === 'image-question' ? (
              question.answers.map((answer, index) =>
                renderAnswerButton(answer, index, question.correctIndex)
              )
            ) : question.type === 'true-false' ? (
              <>
                {/* Use helper to properly handle both boolean and string "true"/"false" */}
                {renderAnswerButton(t.game.trueLabel, 0, parseTrueFalseCorrect(question.correct) ? 0 : 1)}
                {renderAnswerButton(t.game.falseLabel, 1, parseTrueFalseCorrect(question.correct) ? 0 : 1)}
              </>
            ) : question.type === 'number-input' && numberOptions ? (
              numberOptions.options.map((option, index) =>
                renderAnswerButton(
                  `${option}${question.unit ? ` ${question.unit}` : ''}`,
                  index,
                  numberOptions.correctIndex
                )
              )
            ) : null}
          </div>

        </div>
      </div>

      {/* FLOATING Feedback Notification - Simple, no layout impact */}
      {showAnswer && answerFeedback && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div
            className={`px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl ${
              answerFeedback.correct
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-red-500 to-orange-500'
            }`}
          >
            {answerFeedback.correct ? (
              <Trophy className="w-8 h-8 text-yellow-300" />
            ) : (
              <XCircle className="w-8 h-8 text-white" />
            )}
            <div>
              <div className="text-white font-black text-lg">
                {answerFeedback.correct ? t.game.goal : t.game.miss}
              </div>
              <div className="text-white/80 text-xs font-medium">
                {answerFeedback.correct ? t.game.towardGoal : t.game.keepGoing}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
