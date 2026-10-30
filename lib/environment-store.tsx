'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { ambientAudioService, type AmbientSoundTrack } from './ambient-sound-service'

export type EnvironmentThemeId =
  | 'standard'
  | 'forest'
  | 'ocean'
  | 'aquatic'
  | 'rain'
  | 'night'
  | 'nature'
  | 'zen'

export interface EnvironmentTheme {
  id: EnvironmentThemeId
  name: string
  tagline: string
  soundTrack: AmbientSoundTrack
  cssClass: string
  accentColor: string
  asset: {
    videoSrc?: string
    posterSrc?: string
    hasProceduralVisuals: boolean
  }
}

export const ENVIRONMENT_THEMES: EnvironmentTheme[] = [
  {
    id: 'forest',
    name: 'Forest Canopy',
    tagline: 'Deep forest, swaying leaves & soft sunlit canopy with birdsong',
    soundTrack: 'forest',
    cssClass: 'env-forest',
    accentColor: '#2e7d5e',
    asset: { hasProceduralVisuals: true },
  },
  {
    id: 'ocean',
    name: 'Tranquil Ocean',
    tagline: 'Blue/teal water, rhythmic slow ocean swell & shore wash',
    soundTrack: 'ocean',
    cssClass: 'env-ocean',
    accentColor: '#0284c7',
    asset: { hasProceduralVisuals: true },
  },
  {
    id: 'aquatic',
    name: 'Aquatic Life',
    tagline: 'Deep underwater sanctuary with floating resonance & chimes',
    soundTrack: 'aquatic',
    cssClass: 'env-aquatic',
    accentColor: '#06b6d4',
    asset: { hasProceduralVisuals: true },
  },
  {
    id: 'rain',
    name: 'Quiet Rain',
    tagline: 'Soft rainfall mist, gentle rain showers & delicate droplets',
    soundTrack: 'rain',
    cssClass: 'env-rain',
    accentColor: '#64748b',
    asset: { hasProceduralVisuals: true },
  },
  {
    id: 'night',
    name: 'Night Sanctuary',
    tagline: 'Deep starlit cosmos sky, moon glow, crickets & night chimes',
    soundTrack: 'night',
    cssClass: 'env-night',
    accentColor: '#6366f1',
    asset: { hasProceduralVisuals: true },
  },
  {
    id: 'nature',
    name: 'Golden Nature',
    tagline: 'Sunlit mountain brook, crystal water ripples & warm meadow',
    soundTrack: 'nature-stream',
    cssClass: 'env-nature',
    accentColor: '#d97706',
    asset: { hasProceduralVisuals: true },
  },
  {
    id: 'zen',
    name: 'Zen Sanctuary',
    tagline: 'Tibetan singing bowls, meditative harmonic bells & peaceful presence',
    soundTrack: 'zen-bell',
    cssClass: 'env-zen',
    accentColor: '#8b5cf6',
    asset: { hasProceduralVisuals: true },
  },
  {
    id: 'standard',
    name: 'Calm / Standard',
    tagline: 'Clean static distraction-free sanctuary (No animation, Sound OFF)',
    soundTrack: 'soft-ambient',
    cssClass: 'env-standard',
    accentColor: '#94a3b8',
    asset: { hasProceduralVisuals: false },
  },
]

interface EnvironmentState {
  currentThemeId: EnvironmentThemeId
  setTheme: (id: EnvironmentThemeId) => void
  visualsEnabled: boolean
  setVisualsEnabled: (enabled: boolean) => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  slideshowEnabled: boolean
  setSlideshowEnabled: (enabled: boolean) => void
  volume: number
  setVolume: (vol: number) => void
  activeTheme: EnvironmentTheme
}

const EnvironmentContext = createContext<EnvironmentState | null>(null)

const ENV_STORAGE_KEY = 'mindspace_environment_preferences'

export function EnvironmentProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState<EnvironmentThemeId>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(ENV_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.currentThemeId) return parsed.currentThemeId
        }
      } catch {}
    }
    return 'standard'
  })

  const [visualsEnabled, setVisualsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(ENV_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (typeof parsed.visualsEnabled === 'boolean') return parsed.visualsEnabled
        }
      } catch {}
    }
    return true
  })

  const [soundEnabled, setSoundEnabled] = useState(false) // OFF BY DEFAULT
  const [slideshowEnabled, setSlideshowEnabled] = useState(false)

  const [volume, setVolumeState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(ENV_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (typeof parsed.volume === 'number') return parsed.volume
        }
      } catch {}
    }
    return 0.75 // Default 75% for clear, rich audio
  })

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem(
        ENV_STORAGE_KEY,
        JSON.stringify({
          currentThemeId,
          visualsEnabled,
          volume,
        }),
      )
    } catch {}
  }, [currentThemeId, visualsEnabled, volume])

  const activeTheme =
    ENVIRONMENT_THEMES.find((t) => t.id === currentThemeId) ?? ENVIRONMENT_THEMES[0]

  // Synchronize data-env attribute on root document element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-env', currentThemeId)
    }
  }, [currentThemeId])

  // Synchronize sound when soundEnabled or theme changes (Standard mode is strictly silent)
  useEffect(() => {
    if (soundEnabled && currentThemeId !== 'standard') {
      ambientAudioService.play(activeTheme.soundTrack)
    } else {
      ambientAudioService.stop()
    }
  }, [soundEnabled, currentThemeId, activeTheme.soundTrack])

  // Slideshow timer
  useEffect(() => {
    if (!slideshowEnabled) return
    const interval = window.setInterval(() => {
      setCurrentThemeId((prev) => {
        const validThemes = ENVIRONMENT_THEMES.filter((t) => t.id !== 'standard')
        const idx = validThemes.findIndex((t) => t.id === prev)
        const nextIdx = (idx + 1) % validThemes.length
        return validThemes[nextIdx].id
      })
    }, 28000) // cycle every 28 seconds

    return () => window.clearInterval(interval)
  }, [slideshowEnabled])

  const setVolume = useCallback((val: number) => {
    setVolumeState(val)
    ambientAudioService.setVolume(val)
  }, [])

  return (
    <EnvironmentContext.Provider
      value={{
        currentThemeId,
        setTheme: setCurrentThemeId,
        visualsEnabled,
        setVisualsEnabled,
        soundEnabled,
        setSoundEnabled,
        slideshowEnabled,
        setSlideshowEnabled,
        volume,
        setVolume,
        activeTheme,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  )
}

export function useEnvironment() {
  const ctx = useContext(EnvironmentContext)
  if (!ctx) throw new Error('useEnvironment must be used within EnvironmentProvider')
  return ctx
}

