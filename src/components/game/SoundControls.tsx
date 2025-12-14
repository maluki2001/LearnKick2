'use client'

import { useSounds } from '@/hooks/useSounds'
import { Volume2, VolumeX, Music, Music2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation, type Language } from '@/lib/translations'

interface SoundControlsProps {
  compact?: boolean
  language?: Language
}

/**
 * Sound and music toggle controls for the game UI
 * Displays as small icon buttons that can be placed in the game header
 */
export function SoundControls({ compact = true, language = 'en' }: SoundControlsProps) {
  const { t } = useTranslation(language)
  const { soundEnabled, musicEnabled, toggleSound, toggleMusic, play } = useSounds()
  const [soundPressed, setSoundPressed] = useState(false)
  const [musicPressed, setMusicPressed] = useState(false)

  const handleToggleSound = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleSound()
    // Play a click sound if we're enabling sounds
    if (!soundEnabled) {
      setTimeout(() => play('click'), 50)
    }
  }

  const handleToggleMusic = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleMusic()
  }

  if (compact) {
    // Compact mode: small icon buttons for game header
    // Using regular buttons with touch-action:manipulation for mobile compatibility
    return (
      <div className="flex items-center gap-1">
        {/* Sound effects toggle */}
        <button
          type="button"
          onClick={handleToggleSound}
          onTouchEnd={handleToggleSound}
          onMouseDown={() => setSoundPressed(true)}
          onMouseUp={() => setSoundPressed(false)}
          onMouseLeave={() => setSoundPressed(false)}
          onTouchStart={() => setSoundPressed(true)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all touch-manipulation select-none ${
            soundEnabled
              ? 'bg-white/20 text-white hover:bg-white/30 active:bg-white/40'
              : 'bg-red-500/30 text-red-300 hover:bg-red-500/40 active:bg-red-500/50'
          } ${soundPressed ? 'scale-90' : 'scale-100'}`}
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>

        {/* Music toggle */}
        <button
          type="button"
          onClick={handleToggleMusic}
          onTouchEnd={handleToggleMusic}
          onMouseDown={() => setMusicPressed(true)}
          onMouseUp={() => setMusicPressed(false)}
          onMouseLeave={() => setMusicPressed(false)}
          onTouchStart={() => setMusicPressed(true)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all touch-manipulation select-none ${
            musicEnabled
              ? 'bg-white/20 text-white hover:bg-white/30 active:bg-white/40'
              : 'bg-red-500/30 text-red-300 hover:bg-red-500/40 active:bg-red-500/50'
          } ${musicPressed ? 'scale-90' : 'scale-100'}`}
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          aria-label={musicEnabled ? 'Mute music' : 'Enable music'}
        >
          {musicEnabled ? (
            <Music className="w-5 h-5" />
          ) : (
            <Music2 className="w-5 h-5 opacity-50" />
          )}
        </button>
      </div>
    )
  }

  // Full mode: larger buttons with labels (for settings modal)
  return (
    <div className="flex flex-col gap-3">
      {/* Sound effects toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t.settings.soundEffects}</span>
        <button
          type="button"
          onClick={handleToggleSound}
          onTouchEnd={handleToggleSound}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all touch-manipulation select-none ${
            soundEnabled
              ? 'bg-green-500 text-white active:bg-green-600'
              : 'bg-gray-300 text-gray-600 active:bg-gray-400'
          }`}
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-5 h-5" />
              <span>{t.settings.on}</span>
            </>
          ) : (
            <>
              <VolumeX className="w-5 h-5" />
              <span>{t.settings.off}</span>
            </>
          )}
        </button>
      </div>

      {/* Music toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t.settings.backgroundMusic}</span>
        <button
          type="button"
          onClick={handleToggleMusic}
          onTouchEnd={handleToggleMusic}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all touch-manipulation select-none ${
            musicEnabled
              ? 'bg-green-500 text-white active:bg-green-600'
              : 'bg-gray-300 text-gray-600 active:bg-gray-400'
          }`}
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          {musicEnabled ? (
            <>
              <Music className="w-5 h-5" />
              <span>{t.settings.on}</span>
            </>
          ) : (
            <>
              <Music2 className="w-5 h-5" />
              <span>{t.settings.off}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
