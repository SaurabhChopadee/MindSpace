"use client"

import { useEffect, useState } from "react"
import { Check, X, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles } from "lucide-react"
import { ambientAudioService } from "@/lib/ambient-sound-service"
import { cn } from "@/lib/utils"

export interface BreathingTechnique {
  id: string
  name: string
  description: string
  phases: { label: string; action: 'inhale' | 'hold' | 'exhale' | 'rest'; seconds: number; instruction: string }[]
}

const TECHNIQUES: BreathingTechnique[] = [
  {
    id: "box",
    name: "Box Breathing",
    description: "4-4-4-4 technique used for nervous system regulation",
    phases: [
      { label: "Breathe in", action: "inhale", seconds: 4, instruction: "Fill your lungs slowly and deeply through your nose" },
      { label: "Hold breath", action: "hold", seconds: 4, instruction: "Keep your chest gently still and relaxed" },
      { label: "Breathe out", action: "exhale", seconds: 4, instruction: "Release your breath smoothly through your mouth" },
      { label: "Rest", action: "rest", seconds: 4, instruction: "Pause quietly before your next breath" },
    ],
  },
  {
    id: "relax",
    name: "4-7-8 Relaxing Breath",
    description: "Natural tranquilizer for anxiety and sleep",
    phases: [
      { label: "Breathe in", action: "inhale", seconds: 4, instruction: "Inhale quietly through your nose" },
      { label: "Hold gently", action: "hold", seconds: 7, instruction: "Hold your breath with soft shoulders" },
      { label: "Whoosh out", action: "exhale", seconds: 8, instruction: "Exhale completely making a gentle whoosh sound" },
    ],
  },
  {
    id: "belly",
    name: "Calm Belly Breathing",
    description: "Gentle 4-6 rhythm to activate parasympathetic calm",
    phases: [
      { label: "Inhale gently", action: "inhale", seconds: 4, instruction: "Feel your belly expand like a balloon" },
      { label: "Exhale slowly", action: "exhale", seconds: 6, instruction: "Let go of all tension with the exhale" },
    ],
  },
]

export function BreathingExercise({
  onClose,
  onComplete,
}: {
  onClose: () => void
  onComplete?: () => void
}) {
  const [techniqueIndex, setTechniqueIndex] = useState(0)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(TECHNIQUES[0].phases[0].seconds)
  const [isActive, setIsActive] = useState(true)
  const [rounds, setRounds] = useState(0)
  const [ambientSound, setAmbientSound] = useState(false) // OFF by default
  const targetRounds = 4

  const technique = TECHNIQUES[techniqueIndex]
  const currentPhase = technique.phases[phaseIndex]
  const isComplete = rounds >= targetRounds

  // Handle ambient sound toggle during breathing
  const toggleAmbientSound = () => {
    if (ambientSound) {
      ambientAudioService.stop()
      setAmbientSound(false)
    } else {
      ambientAudioService.play('soft-ambient')
      setAmbientSound(true)
    }
  }

  // Clean up sound and listeners on unmount
  useEffect(() => {
    return () => {
      ambientAudioService.stop()
    }
  }, [])

  // Keyboard Escape listener
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  // Timer countdown
  useEffect(() => {
    if (!isActive || isComplete) return

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1

        const nextPhase = (phaseIndex + 1) % technique.phases.length
        if (nextPhase === 0) {
          setRounds((r) => r + 1)
        }
        setPhaseIndex(nextPhase)
        return technique.phases[nextPhase].seconds
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isActive, isComplete, phaseIndex, technique])

  // Completion trigger
  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete()
    }
  }, [isComplete, onComplete])

  // Reset exercise
  const reset = () => {
    setRounds(0)
    setPhaseIndex(0)
    setSecondsLeft(technique.phases[0].seconds)
    setIsActive(true)
  }

  // Calculate dynamic scale and ring progress for smooth animation
  const progressFraction = (currentPhase.seconds - secondsLeft) / currentPhase.seconds
  let ringScale = 1
  if (currentPhase.action === "inhale") {
    ringScale = 1 + progressFraction * 0.35 // smooth expansion
  } else if (currentPhase.action === "hold") {
    ringScale = 1.35 // held expanded
  } else if (currentPhase.action === "exhale") {
    ringScale = 1.35 - progressFraction * 0.35 // smooth contraction
  } else {
    ringScale = 1 // rest
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="breathing-title"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 sm:p-8 text-center shadow-2xl animate-rise">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close breathing exercise"
        >
          <X className="size-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="size-3.5" />
          Guided Paced Breathing
        </div>

        <h2 id="breathing-title" className="mt-1 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          {isComplete ? "Practice Complete" : technique.name}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {isComplete
            ? "You created a calm pause for your body and mind."
            : `Round ${Math.min(rounds + 1, targetRounds)} of ${targetRounds} · Follow the circle`}
        </p>

        {/* Technique Selector Pills (when not actively in middle of a round) */}
        {!isComplete && rounds === 0 && (
          <div className="mt-4 flex justify-center gap-1.5 overflow-x-auto pb-1">
            {TECHNIQUES.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTechniqueIndex(idx)
                  setPhaseIndex(0)
                  setSecondsLeft(TECHNIQUES[idx].phases[0].seconds)
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-[0.68rem] font-medium transition-all",
                  techniqueIndex === idx
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-secondary/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        {/* Animated Expanding / Contracting Visual Breathing Ring */}
        <div className="my-8 flex h-52 items-center justify-center">
          <div
            className="relative flex size-44 items-center justify-center rounded-full transition-transform duration-1000 ease-in-out"
            style={{ transform: `scale(${isComplete ? 1 : ringScale})` }}
          >
            {/* Outer Soft Glow Halo */}
            <div
              className={cn(
                "absolute inset-0 rounded-full transition-opacity duration-700 blur-xl",
                currentPhase.action === "inhale"
                  ? "bg-primary/25 opacity-100"
                  : currentPhase.action === "hold"
                  ? "bg-amber/20 opacity-80"
                  : currentPhase.action === "exhale"
                  ? "bg-teal-400/20 opacity-60"
                  : "bg-primary/10 opacity-30",
              )}
            />

            {/* Concentric Breathing Circle */}
            <div className="relative flex size-full flex-col items-center justify-center rounded-full border-4 border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent text-primary shadow-inner">
              {isComplete ? (
                <Check className="size-14 text-primary animate-scale-up" />
              ) : (
                <>
                  <strong className="font-serif text-5xl tracking-tight text-foreground select-none">
                    {secondsLeft}
                  </strong>
                  <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-primary select-none">
                    {currentPhase.label}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Instructional Text */}
        <p className="min-h-[2.5rem] px-4 text-xs leading-relaxed text-foreground/85 font-medium">
          {isComplete
            ? "Notice how your shoulders and breathing feel right now. Carry this gentleness with you."
            : currentPhase.instruction}
        </p>

        {/* Round Progress Dots */}
        <div className="mt-4 flex justify-center gap-2" aria-label={`${rounds} of ${targetRounds} rounds complete`}>
          {Array.from({ length: targetRounds }).map((_, roundIdx) => (
            <span
              key={roundIdx}
              className={cn(
                "size-2 rounded-full transition-all duration-300",
                roundIdx < rounds || isComplete ? "bg-primary scale-110" : "bg-border",
              )}
            />
          ))}
        </div>

        {/* Interactive Controls: Play/Pause, Reset, Ambient Sound */}
        <div className="mt-6 flex items-center justify-center gap-3 border-t border-border/60 pt-5">
          {!isComplete ? (
            <>
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-all"
              >
                {isActive ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                {isActive ? "Pause" : "Resume"}
              </button>

              {/* Reset */}
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card p-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Restart exercise"
                aria-label="Restart exercise"
              >
                <RotateCcw className="size-3.5" />
              </button>

              {/* Ambient Sound Toggle (Off by default) */}
              <button
                type="button"
                onClick={toggleAmbientSound}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all",
                  ambientSound
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
                title={ambientSound ? "Calming sound playing (Click to mute)" : "Play soothing background sound"}
              >
                {ambientSound ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
                <span>Sound: {ambientSound ? "On" : "Off"}</span>
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
              >
                Another 4 Rounds
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
