'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function OpenAIStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'fallback'>('checking')

  useEffect(() => {
    const checkOpenAIStatus = async () => {
      try {
        const hasKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY?.startsWith('sk-')
        setStatus(hasKey ? 'connected' : 'fallback')
      } catch (error) {
        console.error('OpenAI status check failed:', error)
        setStatus('fallback')
      }
    }

    const timer = setTimeout(checkOpenAIStatus, 1000)
    return () => clearTimeout(timer)
  }, [])

  const statusConfig = {
    checking: {
      icon: '🔄',
      text: 'Checking AI connection...',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    connected: {
      icon: '✅',
      text: 'AI question generation ready',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    fallback: {
      icon: '📚',
      text: 'Using offline question bank',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  }

  const config = statusConfig[status]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg} ${config.color} text-sm font-medium mb-4`}
    >
      <motion.span
        animate={status === 'checking' ? { rotate: 360 } : {}}
        transition={status === 'checking' ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
      >
        {config.icon}
      </motion.span>
      {config.text}
    </motion.div>
  )
}