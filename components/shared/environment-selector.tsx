'use client'

import {
  Sparkles,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Shuffle,
  X,
  Sliders,
  Check,
} from 'lucide-react'
import {
  useEnvironment,
  ENVIRONMENT_THEMES,
} from '@/lib/environment-store'
import { AMBIENT_TRACKS } from '@/lib/ambient-sound-service'
import { cn } from '@/lib/utils'

export function EnvironmentSelectorDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const {
    currentThemeId,
    setTheme,
    visualsEnabled,
    setVisualsEnabled,
    soundEnabled,
    setSoundEnabled,
    slideshowEnabled,
    setSlideshowEnabled,
    volume,
    setVolume,
  } = useEnvironment()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-4 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="env-dialog-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl animate-rise">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h2 id="env-dialog-title" className="font-serif text-lg font-semibold text-foreground">
                Atmosphere &amp; Sound
              </h2>
              <p className="text-xs text-muted-foreground">
                Customize your visual environment and calming soundscapes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close atmosphere settings"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Global toggles: Visuals, Audio, Slideshow */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {/* Visuals toggle */}
          <button
            type="button"
            onClick={() => setVisualsEnabled(!visualsEnabled)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all',
              visualsEnabled
                ? 'border-primary/40 bg-primary/8 text-primary'
                : 'border-border bg-card text-muted-foreground',
            )}
          >
            {visualsEnabled ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            <span className="text-xs font-semibold">Visuals</span>
            <span className="text-[0.65rem] opacity-75">{visualsEnabled ? 'Enabled' : 'Paused'}</span>
          </button>

          {/* Sound toggle (OFF by default) */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all',
              soundEnabled
                ? 'border-primary/40 bg-primary/10 text-primary ring-1 ring-primary/30'
                : 'border-border bg-card text-muted-foreground',
            )}
          >
            {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            <span className="text-xs font-semibold">Soundscape</span>
            <span className="text-[0.65rem] opacity-75">{soundEnabled ? 'Playing' : 'Off (Default)'}</span>
          </button>

          {/* Slideshow toggle */}
          <button
            type="button"
            onClick={() => setSlideshowEnabled(!slideshowEnabled)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all',
              slideshowEnabled
                ? 'border-primary/40 bg-primary/8 text-primary'
                : 'border-border bg-card text-muted-foreground',
            )}
          >
            <Shuffle className="size-4" />
            <span className="text-xs font-semibold">Slideshow</span>
            <span className="text-[0.65rem] opacity-75">{slideshowEnabled ? 'Cycling (28s)' : 'Static'}</span>
          </button>
        </div>

        {/* Volume slider when sound is enabled */}
        {soundEnabled && (
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-medium text-foreground">
              <span className="flex items-center gap-1.5">
                <Sliders className="size-3.5 text-primary" /> Volume
              </span>
              <span className="text-muted-foreground">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="mt-2 w-full accent-primary"
              aria-label="Ambient volume"
            />
          </div>
        )}

        {/* Atmosphere Theme Choices */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Environment Theme
            </p>
            {currentThemeId === 'standard' && (
              <span className="text-[0.68rem] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                Focus Sanctuary
              </span>
            )}
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {ENVIRONMENT_THEMES.map((theme) => {
              const isSelected = currentThemeId === theme.id
              const matchingTrack = AMBIENT_TRACKS.find((t) => t.id === theme.soundTrack)
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setTheme(theme.id)}
                  className={cn(
                    'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all',
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary'
                      : 'border-border/70 bg-card hover:border-primary/30 hover:bg-secondary/40',
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                      {theme.name}
                    </span>
                    {isSelected && <Check className="size-3.5 text-primary" />}
                  </div>
                  <span className="text-[0.68rem] text-muted-foreground leading-tight">
                    {theme.tagline}
                  </span>
                  <span className="mt-1 text-[0.62rem] text-primary/80 font-medium">
                    {theme.id === 'standard' ? 'Sound: OFF' : `Sound: ${matchingTrack?.name ?? 'Ambient'}`}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
          <p className="text-[0.68rem] text-muted-foreground">
            Procedural synthesizer &middot; 100% royalty-free &middot; No background data usage
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

