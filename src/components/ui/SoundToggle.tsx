'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSounds } from '@/hooks/useSounds'

interface SoundToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function SoundToggle({ className = '', size = 'md', showLabel = false }: SoundToggleProps) {
  const { enabled, toggleSound, play } = useSounds()

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const handleToggle = () => {
    toggleSound()
    // Play click sound if enabling
    if (!enabled) {
      setTimeout(() => play('click'), 50)
    }
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-colors ${
          enabled
            ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
            : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
        }`}
        aria-label={enabled ? 'Mute sounds' : 'Enable sounds'}
      >
        <motion.div
          initial={false}
          animate={{ rotate: enabled ? 0 : -15 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {enabled ? (
            <Volume2 className={iconSizes[size]} />
          ) : (
            <VolumeX className={iconSizes[size]} />
          )}
        </motion.div>
      </motion.button>

      {showLabel && (
        <span className="text-sm text-slate-400">
          {enabled ? 'Sound On' : 'Sound Off'}
        </span>
      )}
    </div>
  )
}

// Compact version for game header
export function SoundToggleCompact({ className = '' }: { className?: string }) {
  const { enabled, toggleSound, play } = useSounds()

  const handleToggle = () => {
    toggleSound()
    if (!enabled) {
      setTimeout(() => play('click'), 50)
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-lg transition-colors ${
        enabled
          ? 'text-white/80 hover:text-white hover:bg-white/10'
          : 'text-white/40 hover:text-white/60 hover:bg-white/10'
      } ${className}`}
      aria-label={enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
    </button>
  )
}
