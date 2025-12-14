'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

interface AgeGradeStepProps {
  username: string
  onNext: (grade: number) => void
  onBack: () => void
}

type TabType = 'grade' | 'age'

// Grade configuration with emojis
const GRADES = [
  { grade: 1, emoji: '🎒', label: '1. Klasse' },
  { grade: 2, emoji: '📚', label: '2. Klasse' },
  { grade: 3, emoji: '✏️', label: '3. Klasse' },
  { grade: 4, emoji: '🔬', label: '4. Klasse' },
  { grade: 5, emoji: '🌍', label: '5. Klasse' },
  { grade: 6, emoji: '🎓', label: '6. Klasse' }
]

// Ages 6-12 with corresponding grades
const AGES = [
  { age: 6, grade: 1 },
  { age: 7, grade: 2 },
  { age: 8, grade: 3 },
  { age: 9, grade: 4 },
  { age: 10, grade: 5 },
  { age: 11, grade: 6 },
  { age: 12, grade: 6 }
]

export function AgeGradeStep({ username, onNext, onBack }: AgeGradeStepProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabType>('grade')
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)
  const [selectedAge, setSelectedAge] = useState<number | null>(null)

  const handleGradeSelect = (grade: number) => {
    setSelectedGrade(grade)
    setSelectedAge(null) // Clear age when grade is selected
  }

  const handleAgeSelect = (age: number, correspondingGrade: number) => {
    setSelectedAge(age)
    setSelectedGrade(correspondingGrade) // Auto-set grade from age
  }

  const handleSubmit = () => {
    if (selectedGrade) {
      onNext(selectedGrade)
    }
  }

  const isValid = selectedGrade !== null

  // Calculate what grade would be shown based on age
  const getGradeFromAge = (age: number): number => {
    const found = AGES.find(a => a.age === age)
    return found ? found.grade : 3
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        ← {t.kidRegistration?.back || 'Zuruck'}
      </button>

      {/* Greeting with username */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">
        {t.kidRegistration?.hello || 'Hallo'}, {username}! 👋
      </h2>

      {/* Tab switcher */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-xl inline-flex">
          <button
            onClick={() => setActiveTab('grade')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'grade'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.kidRegistration?.pickGrade || 'Klasse'}
          </button>
          <button
            onClick={() => setActiveTab('age')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'age'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.kidRegistration?.pickAge || 'Alter'}
          </button>
        </div>
      </div>

      {/* Grade picker */}
      {activeTab === 'grade' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {GRADES.map(({ grade, emoji, label }) => (
            <motion.button
              key={grade}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGradeSelect(grade)}
              className={`p-4 rounded-xl font-semibold transition-all ${
                selectedGrade === grade
                  ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 shadow-lg border-2 border-blue-400 ring-2 ring-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
              }`}
            >
              <div className="text-3xl mb-1">{emoji}</div>
              <div className="text-sm font-bold">{grade}.</div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Age picker */}
      {activeTab === 'age' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="grid grid-cols-4 gap-3 mb-4">
            {AGES.map(({ age, grade }) => (
              <motion.button
                key={age}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAgeSelect(age, grade)}
                className={`p-4 rounded-xl font-semibold transition-all ${
                  selectedAge === age
                    ? 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800 shadow-lg border-2 border-purple-400 ring-2 ring-purple-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <div className="text-2xl font-bold">{age}</div>
                <div className="text-xs text-gray-500">{t.kidRegistration?.years || 'Jahre'}</div>
              </motion.button>
            ))}
          </div>

          {/* Show calculated grade when age is selected */}
          {selectedAge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-gray-600 bg-gray-50 rounded-lg p-3"
            >
              {selectedAge} {t.kidRegistration?.years || 'Jahre'} = <span className="font-bold text-blue-600">{getGradeFromAge(selectedAge)}. {t.kidRegistration?.grade || 'Klasse'}</span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        whileHover={isValid ? { scale: 1.02 } : {}}
        whileTap={isValid ? { scale: 0.98 } : {}}
        onClick={handleSubmit}
        disabled={!isValid}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 mt-4 ${
          isValid
            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-xl hover:shadow-2xl'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {t.kidRegistration?.letsGo || "Los geht's!"} 🚀
      </motion.button>
    </motion.div>
  )
}
