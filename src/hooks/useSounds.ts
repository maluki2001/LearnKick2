'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Sound effect names
export type SoundEffect =
  | 'correct'
  | 'incorrect'
  | 'goal'
  | 'countdown'
  | 'game-start'
  | 'game-end'
  | 'victory'
  | 'defeat'
  | 'click'
  | 'streak'
  | 'tick'

// Global sound state stored in localStorage
const SOUND_SETTINGS_KEY = 'learnkick_sound_settings'

interface SoundSettings {
  soundEnabled: boolean
  musicEnabled: boolean
  volume: number
}

function loadSoundSettings(): SoundSettings {
  if (typeof window === 'undefined') {
    return { soundEnabled: true, musicEnabled: true, volume: 0.7 }
  }

  try {
    const stored = localStorage.getItem(SOUND_SETTINGS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore errors
  }

  return { soundEnabled: true, musicEnabled: true, volume: 0.7 }
}

function saveSoundSettings(settings: SoundSettings): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Ignore errors
  }
}

// Audio context singleton
let audioContext: AudioContext | null = null
let audioUnlocked = false

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    } catch {
      console.warn('Web Audio API not supported')
      return null
    }
  }

  // Resume if suspended (needed for mobile browsers)
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {})
  }

  return audioContext
}

/**
 * Unlock audio for iOS/mobile browsers - must be called from a user gesture (tap/click)
 * Call this on the first user interaction (e.g., pressing Play button)
 */
export function unlockAudio(): Promise<boolean> {
  return new Promise((resolve) => {
    if (audioUnlocked) {
      resolve(true)
      return
    }

    const ctx = getAudioContext()
    if (!ctx) {
      resolve(false)
      return
    }

    // Create and play a silent buffer to unlock audio
    const buffer = ctx.createBuffer(1, 1, 22050)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start(0)

    // Also try to resume the context
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        audioUnlocked = true
        console.log('Audio unlocked successfully')
        resolve(true)
      }).catch(() => {
        resolve(false)
      })
    } else {
      audioUnlocked = true
      console.log('Audio already unlocked')
      resolve(true)
    }
  })
}

/**
 * Check if audio is currently unlocked and ready
 */
export function isAudioUnlocked(): boolean {
  return audioUnlocked && audioContext?.state === 'running'
}

// Sound synthesis functions using Web Audio API
interface SoundParams {
  frequency: number
  duration: number
  type: OscillatorType
  volume: number
  attack?: number
  decay?: number
}

function playTone(params: SoundParams, masterVolume: number): void {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = params.type
    osc.frequency.value = params.frequency

    const volume = params.volume * masterVolume
    const attack = params.attack ?? 0.01
    const decay = params.decay ?? 0.1

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + attack)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + params.duration - decay)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + params.duration)
  } catch {
    // Ignore audio errors
  }
}

function playCorrectSound(volume: number): void {
  // Happy ascending tone - longer durations for satisfying sound
  playTone({ frequency: 523.25, duration: 0.25, type: 'sine', volume: 0.4, attack: 0.02, decay: 0.1 }, volume) // C5
  setTimeout(() => playTone({ frequency: 659.25, duration: 0.25, type: 'sine', volume: 0.45, attack: 0.02, decay: 0.1 }, volume), 120) // E5
  setTimeout(() => playTone({ frequency: 783.99, duration: 0.4, type: 'sine', volume: 0.5, attack: 0.02, decay: 0.2 }, volume), 240) // G5
}

function playIncorrectSound(volume: number): void {
  // Descending buzzer tone - longer durations for audible feedback
  playTone({ frequency: 200, duration: 0.3, type: 'square', volume: 0.25, attack: 0.02, decay: 0.15 }, volume)
  setTimeout(() => playTone({ frequency: 150, duration: 0.35, type: 'square', volume: 0.2, attack: 0.02, decay: 0.2 }, volume), 150)
}

function playGoalSound(volume: number): void {
  // Stadium horn / fanfare
  const notes = [392, 523.25, 659.25, 783.99] // G4, C5, E5, G5
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playTone({ frequency: freq, duration: 0.3, type: 'sawtooth', volume: 0.25, attack: 0.02 }, volume)
    }, i * 100)
  })
  // Final sustained note
  setTimeout(() => {
    playTone({ frequency: 783.99, duration: 0.5, type: 'sine', volume: 0.4, attack: 0.05, decay: 0.3 }, volume)
  }, 400)
}

function playCountdownSound(count: number, volume: number): void {
  // Higher pitch for GO! (count = 0)
  const freq = count === 0 ? 880 : 440
  const duration = count === 0 ? 0.3 : 0.15
  playTone({ frequency: freq, duration, type: 'sine', volume: 0.5 }, volume)
}

function playGameStartSound(volume: number): void {
  // Exciting start fanfare
  playTone({ frequency: 523.25, duration: 0.12, type: 'square', volume: 0.3 }, volume)
  setTimeout(() => playTone({ frequency: 659.25, duration: 0.12, type: 'square', volume: 0.3 }, volume), 100)
  setTimeout(() => playTone({ frequency: 783.99, duration: 0.12, type: 'square', volume: 0.3 }, volume), 200)
  setTimeout(() => playTone({ frequency: 1046.5, duration: 0.25, type: 'sine', volume: 0.5 }, volume), 300)
}

function playGameEndSound(volume: number): void {
  // Whistle sound
  playTone({ frequency: 1200, duration: 0.3, type: 'sine', volume: 0.4 }, volume)
  setTimeout(() => playTone({ frequency: 1200, duration: 0.15, type: 'sine', volume: 0.3 }, volume), 400)
  setTimeout(() => playTone({ frequency: 1200, duration: 0.5, type: 'sine', volume: 0.5, decay: 0.4 }, volume), 600)
}

function playVictorySound(volume: number): void {
  // Triumphant fanfare
  const melody = [
    { freq: 523.25, delay: 0 },    // C5
    { freq: 659.25, delay: 150 },  // E5
    { freq: 783.99, delay: 300 },  // G5
    { freq: 1046.5, delay: 450 },  // C6
    { freq: 783.99, delay: 600 },  // G5
    { freq: 1046.5, delay: 750 },  // C6
  ]
  melody.forEach(({ freq, delay }) => {
    setTimeout(() => playTone({ frequency: freq, duration: 0.2, type: 'sine', volume: 0.4 }, volume), delay)
  })
}

function playDefeatSound(volume: number): void {
  // Sad descending tones
  playTone({ frequency: 392, duration: 0.3, type: 'sine', volume: 0.3 }, volume)
  setTimeout(() => playTone({ frequency: 349.23, duration: 0.3, type: 'sine', volume: 0.25 }, volume), 300)
  setTimeout(() => playTone({ frequency: 293.66, duration: 0.5, type: 'sine', volume: 0.2, decay: 0.4 }, volume), 600)
}

function playClickSound(volume: number): void {
  playTone({ frequency: 800, duration: 0.05, type: 'sine', volume: 0.2 }, volume)
}

function playStreakSound(volume: number): void {
  // Quick ascending arpeggio for streak bonus
  playTone({ frequency: 880, duration: 0.08, type: 'sine', volume: 0.3 }, volume)
  setTimeout(() => playTone({ frequency: 1100, duration: 0.08, type: 'sine', volume: 0.35 }, volume), 60)
  setTimeout(() => playTone({ frequency: 1320, duration: 0.1, type: 'sine', volume: 0.4 }, volume), 120)
}

function playTickSound(volume: number): void {
  playTone({ frequency: 600, duration: 0.03, type: 'sine', volume: 0.15 }, volume)
}

// Background music using oscillators
class BackgroundMusic {
  private ctx: AudioContext | null = null
  private oscillators: OscillatorNode[] = []
  private gainNode: GainNode | null = null
  private isPlaying = false
  private animationId: number | null = null

  start(volume: number): void {
    if (this.isPlaying) return

    this.ctx = getAudioContext()
    if (!this.ctx) return

    this.isPlaying = true
    this.gainNode = this.ctx.createGain()
    this.gainNode.gain.value = volume * 0.15 // Keep music quiet
    this.gainNode.connect(this.ctx.destination)

    // Simple ambient loop using low frequency oscillators
    this.playAmbientLoop()
  }

  private playAmbientLoop(): void {
    if (!this.ctx || !this.gainNode || !this.isPlaying) return

    // Create a gentle chord that changes
    const chords = [
      [261.63, 329.63, 392], // C major
      [293.66, 369.99, 440], // D minor
      [349.23, 440, 523.25], // F major
      [392, 493.88, 587.33], // G major
    ]

    let chordIndex = 0

    const playChord = () => {
      if (!this.ctx || !this.gainNode || !this.isPlaying) return

      // Clean up previous oscillators
      this.oscillators.forEach(osc => {
        try { osc.stop() } catch {}
      })
      this.oscillators = []

      const chord = chords[chordIndex]
      chord.forEach(freq => {
        const osc = this.ctx!.createOscillator()
        const gain = this.ctx!.createGain()

        osc.type = 'sine'
        osc.frequency.value = freq / 2 // Lower octave for ambiance

        gain.gain.setValueAtTime(0, this.ctx!.currentTime)
        gain.gain.linearRampToValueAtTime(0.1, this.ctx!.currentTime + 0.5)
        gain.gain.linearRampToValueAtTime(0.05, this.ctx!.currentTime + 3.5)
        gain.gain.linearRampToValueAtTime(0, this.ctx!.currentTime + 4)

        osc.connect(gain)
        gain.connect(this.gainNode!)

        osc.start()
        osc.stop(this.ctx!.currentTime + 4)
        this.oscillators.push(osc)
      })

      chordIndex = (chordIndex + 1) % chords.length
    }

    playChord()
    // Change chord every 4 seconds
    const loop = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(loop)
        return
      }
      playChord()
    }, 4000)
  }

  stop(): void {
    this.isPlaying = false
    this.oscillators.forEach(osc => {
      try { osc.stop() } catch {}
    })
    this.oscillators = []
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = volume * 0.15
    }
  }
}

// Singleton music instance
let backgroundMusic: BackgroundMusic | null = null

function getBackgroundMusic(): BackgroundMusic {
  if (!backgroundMusic) {
    backgroundMusic = new BackgroundMusic()
  }
  return backgroundMusic
}

/**
 * Hook for managing game sound effects and music
 */
export function useSounds() {
  const [settings, setSettings] = useState<SoundSettings>(loadSoundSettings)
  const musicStartedRef = useRef(false)

  // Save settings when they change
  useEffect(() => {
    saveSoundSettings(settings)
  }, [settings])

  // Handle music based on settings
  useEffect(() => {
    const music = getBackgroundMusic()

    if (settings.musicEnabled && settings.volume > 0) {
      music.setVolume(settings.volume)
      if (!musicStartedRef.current) {
        // Music will start on first user interaction
      }
    } else {
      music.stop()
      musicStartedRef.current = false
    }

    return () => {
      music.stop()
    }
  }, [settings.musicEnabled, settings.volume])

  /**
   * Play a sound effect
   */
  const play = useCallback((effect: SoundEffect) => {
    if (!settings.soundEnabled || settings.volume === 0) return

    const volume = settings.volume

    switch (effect) {
      case 'correct':
        playCorrectSound(volume)
        break
      case 'incorrect':
        playIncorrectSound(volume)
        break
      case 'goal':
        playGoalSound(volume)
        break
      case 'countdown':
        playCountdownSound(1, volume) // Default count
        break
      case 'game-start':
        playGameStartSound(volume)
        break
      case 'game-end':
        playGameEndSound(volume)
        break
      case 'victory':
        playVictorySound(volume)
        break
      case 'defeat':
        playDefeatSound(volume)
        break
      case 'click':
        playClickSound(volume)
        break
      case 'streak':
        playStreakSound(volume)
        break
      case 'tick':
        playTickSound(volume)
        break
    }
  }, [settings.soundEnabled, settings.volume])

  /**
   * Play countdown beep with count number (3, 2, 1, 0=GO!)
   */
  const playCountdown = useCallback((count: number) => {
    if (!settings.soundEnabled || settings.volume === 0) return
    playCountdownSound(count, settings.volume)
  }, [settings.soundEnabled, settings.volume])

  /**
   * Start background music
   */
  const startMusic = useCallback(() => {
    if (!settings.musicEnabled || settings.volume === 0) return
    const music = getBackgroundMusic()
    music.start(settings.volume)
    musicStartedRef.current = true
  }, [settings.musicEnabled, settings.volume])

  /**
   * Stop background music
   */
  const stopMusic = useCallback(() => {
    const music = getBackgroundMusic()
    music.stop()
    musicStartedRef.current = false
  }, [])

  /**
   * Toggle sound effects on/off
   */
  const toggleSound = useCallback(() => {
    setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))
  }, [])

  /**
   * Toggle music on/off
   */
  const toggleMusic = useCallback(() => {
    setSettings(prev => {
      const newEnabled = !prev.musicEnabled
      if (!newEnabled) {
        getBackgroundMusic().stop()
        musicStartedRef.current = false
      }
      return { ...prev, musicEnabled: newEnabled }
    })
  }, [])

  /**
   * Set master volume (0-1)
   */
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    setSettings(prev => ({ ...prev, volume: clampedVolume }))
    getBackgroundMusic().setVolume(clampedVolume)
  }, [])

  return {
    // State
    soundEnabled: settings.soundEnabled,
    musicEnabled: settings.musicEnabled,
    volume: settings.volume,

    // Actions
    play,
    playCountdown,
    startMusic,
    stopMusic,
    toggleSound,
    toggleMusic,
    setVolume,
  }
}

/**
 * Standalone function to play sounds outside React components
 */
export function playSound(effect: SoundEffect): void {
  const settings = loadSoundSettings()
  if (!settings.soundEnabled || settings.volume === 0) return

  const volume = settings.volume

  switch (effect) {
    case 'correct':
      playCorrectSound(volume)
      break
    case 'incorrect':
      playIncorrectSound(volume)
      break
    case 'goal':
      playGoalSound(volume)
      break
    case 'game-start':
      playGameStartSound(volume)
      break
    case 'game-end':
      playGameEndSound(volume)
      break
    case 'victory':
      playVictorySound(volume)
      break
    case 'defeat':
      playDefeatSound(volume)
      break
    case 'click':
      playClickSound(volume)
      break
    case 'streak':
      playStreakSound(volume)
      break
    case 'tick':
      playTickSound(volume)
      break
  }
}

// Export sound effect list
export const SOUNDS: SoundEffect[] = [
  'correct',
  'incorrect',
  'goal',
  'countdown',
  'game-start',
  'game-end',
  'victory',
  'defeat',
  'click',
  'streak',
  'tick'
]
