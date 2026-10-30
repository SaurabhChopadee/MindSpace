'use client'

import { useState, useEffect } from 'react'
import { Headphones, X, Play, Pause, ChevronRight, ChevronLeft, RotateCcw, Check, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { ambientAudioService } from '@/lib/ambient-sound-service'
import { usePatientData } from '@/lib/patient-store'

interface ScanStep {
  region: string
  subtitle: string
  guidance: string
  cue: string
  durationSec: number
}

const SCAN_STEPS: ScanStep[] = [
  {
    region: 'Crown & Forehead',
    subtitle: 'Releasing cognitive holding & facial tension',
    guidance: 'Bring your awareness to the top of your head and your forehead. Notice if your brow is furrowed. Gently imagine smoothing the skin of your forehead from center to temples.',
    cue: 'Unclench your jaw, soften the muscles around your eyes, and allow your face to rest.',
    durationSec: 25,
  },
  {
    region: 'Neck & Shoulders',
    subtitle: 'Letting go of carried burdens',
    guidance: 'Notice where your shoulders are positioned right now. Without judgement, invite them to drop a fraction of an inch further away from your ears.',
    cue: 'Feel the neck muscles elongating softly. Release any bracing or guarding in the upper back.',
    durationSec: 25,
  },
  {
    region: 'Chest & Heart Space',
    subtitle: 'Opening room to breathe and feel',
    guidance: 'Rest your attention lightly in the center of your chest. Observe the subtle expansion on each inhalation and the soft settling on each exhalation.',
    cue: 'You do not need to alter your breathing. Simply give this space permission to soften.',
    durationSec: 25,
  },
  {
    region: 'Abdomen & Core',
    subtitle: 'Releasing the center of nervous tension',
    guidance: 'Many of us hold unconscious vigilance in our stomach. Allow your belly to become completely soft and relaxed, moving freely with the breath like a gentle tide.',
    cue: 'Feel the soothing sensations of letting the core unclench completely.',
    durationSec: 25,
  },
  {
    region: 'Arms, Hands & Fingers',
    subtitle: 'From doing to simply being',
    guidance: 'Sense your arms resting at your sides or in your lap. Notice the temperature of your palms, the air touching your skin, and the natural curl of your fingers.',
    cue: 'There is nothing you need to grasp or produce right now. Rest in stillness.',
    durationSec: 25,
  },
  {  
    region: 'Legs, Feet & Grounding',
    subtitle: 'Connecting with solid support',
    guidance: 'Shift attention down through your hips, thighs, and calves down to your feet. Feel the solid surface of the floor or chair supporting your weight with steady reliability.',
    cue: 'Trust the ground beneath you. You are held, supported, and grounded.',
    durationSec: 25,
  },
  {
    region: 'Whole-Body Harmony',
    subtitle: 'Integrated physical calm',
    guidance: 'Expand your awareness to include your entire body at once — from the crown of your head to the soles of your feet. Breathe in as a complete whole.',
    cue: 'Take in this sense of stillness. This calm is a state you can return to anytime.',
    durationSec: 25,
  },
]

export function BodyScanExercise({
  onClose,
  onComplete,
}: {
  onClose: () => void
  onComplete?: () => void
}) {
  const { togglePractice, practicesDone } = usePatientData()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(SCAN_STEPS[0].durationSec)
  const [isPlaying, setIsPlaying] = useState(true)
  const [ambientSound, setAmbientSound] = useState(false) // Strictly OFF by default
  const [isCompleted, setIsCompleted] = useState(false)

  const step = SCAN_STEPS[currentIdx]
  const progressPercent = ((currentIdx + 1) / SCAN_STEPS.length) * 100

  // Keyboard Escape listener
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      ambientAudioService.stop()
    }
  }, [])

  // Timer countdown
  useEffect(() => {
    if (!isPlaying || isCompleted) return

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1
        // Auto advance to next step
        if (currentIdx < SCAN_STEPS.length - 1) {
          setCurrentIdx((c) => c + 1)
          return SCAN_STEPS[currentIdx + 1].durationSec
        } else {
          setIsCompleted(true)
          if (!practicesDone.includes('bodyscan')) {
            togglePractice('bodyscan')
          }
          if (onComplete) onComplete()
          return 0
        }
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isPlaying, isCompleted, currentIdx, practicesDone, togglePractice, onComplete])

  const toggleSound = () => {
    if (ambientSound) {
      ambientAudioService.stop()
      setAmbientSound(false)
    } else {
      ambientAudioService.play('soft-ambient')
      setAmbientSound(true)
    }
  }

  const handleNext = () => {
    if (currentIdx < SCAN_STEPS.length - 1) {
      setCurrentIdx((prev) => prev + 1)
      setSecondsLeft(SCAN_STEPS[currentIdx + 1].durationSec)
    } else {
      setIsCompleted(true)
      if (!practicesDone.includes('bodyscan')) {
        togglePractice('bodyscan')
      }
      if (onComplete) onComplete()
    }
  }

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1)
      setSecondsLeft(SCAN_STEPS[currentIdx - 1].durationSec)
    }
  }

  const handleReset = () => {
    setCurrentIdx(0)
    setSecondsLeft(SCAN_STEPS[0].durationSec)
    setIsPlaying(true)
    setIsCompleted(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Guided Body Scan Practice"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div className="relative my-auto w-full max-w-2xl rounded-3xl border border-border/80 bg-card p-6 shadow-2xl sm:p-8">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full border border-border/60 p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close body scan"
        >
          <X className="size-4" />
        </button>

        {/* Ambient audio toggle */}
        <button
          type="button"
          onClick={toggleSound}
          className="absolute top-5 right-16 rounded-full border border-border/60 p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title={ambientSound ? 'Mute ambient sound' : 'Play calming soundscape'}
          aria-label={ambientSound ? 'Mute ambient sound' : 'Play calming soundscape'}
        >
          {ambientSound ? <Volume2 className="size-4 text-primary" /> : <VolumeX className="size-4" />}
        </button>

        {isCompleted ? (
          /* Completion Screen */
          <div className="py-8 text-center animate-fade-in">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary shadow-sm">
              <Sparkles className="size-8 animate-pulse" />
            </div>
            <h2 className="mt-5 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
              Body Scan Completed
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
              You have completed your 5-minute somatic check-in. Notice how your body feels right now compared to when you started.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                <RotateCcw className="size-3.5" /> Repeat Scan
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 shadow-md"
              >
                <Check className="size-4" /> Return to MindSpace
              </button>
            </div>
          </div>
        ) : (
          /* Active Scan Exercise */
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Headphones className="size-4" />
              Somatic Nervous System Reset
            </div>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
              Guided Body Scan
            </h2>

            {/* Progress Bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>
                  Focus Area {currentIdx + 1} of {SCAN_STEPS.length} · <strong className="text-foreground">{step.region}</strong>
                </span>
                <span className="font-mono text-primary font-semibold">{secondsLeft}s</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Visual Focus Card */}
            <div className="mt-6 flex flex-col items-center rounded-3xl border border-primary/20 bg-primary/5 p-6 text-center shadow-inner sm:p-8">
              <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-2">
                {step.subtitle}
              </span>
              <h3 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                {step.region}
              </h3>
              <p className="mt-3 max-w-md text-xs sm:text-sm text-foreground/90 leading-relaxed">
                {step.guidance}
              </p>
              <div className="mt-4 rounded-2xl bg-card/80 px-4 py-2.5 text-xs text-muted-foreground border border-border/50 max-w-sm italic">
                {`"${step.cue}"`}
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
              >
                <ChevronLeft className="size-4" /> Previous
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-105"
                  aria-label={isPlaying ? 'Pause scan timer' : 'Resume scan timer'}
                >
                  {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary/80"
              >
                {currentIdx === SCAN_STEPS.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
