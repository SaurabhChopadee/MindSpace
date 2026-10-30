'use client'

import { useState, useEffect } from 'react'
import { Sparkles, X, Check, Heart, Volume2, VolumeX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ambientAudioService } from '@/lib/ambient-sound-service'
import { usePatientData } from '@/lib/patient-store'

interface GratitudeItem {
  what: string
  why: string
}

export function GratitudeReflection({
  onClose,
  onComplete,
}: {
  onClose: () => void
  onComplete?: () => void
}) {
  const { addJournal, togglePractice, practicesDone } = usePatientData()
  const [items, setItems] = useState<GratitudeItem[]>([
    { what: '', why: '' },
    { what: '', why: '' },
    { what: '', why: '' },
  ])
  const [ambientSound, setAmbientSound] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Keyboard Escape listener
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      ambientAudioService.stop()
    }
  }, [])

  const toggleSound = () => {
    if (ambientSound) {
      ambientAudioService.stop()
      setAmbientSound(false)
    } else {
      ambientAudioService.play('rain')
      setAmbientSound(true)
    }
  }

  const updateItem = (index: number, field: 'what' | 'why', value: string) => {
    setItems((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
    if (errorMsg) setErrorMsg(null)
  }

  const handleSave = () => {
    const filled = items.filter((item) => item.what.trim().length > 0)
    if (filled.length === 0) {
      setErrorMsg('Please write at least one thing you feel grateful for today.')
      return
    }

    // Save as a private reflection in Journal
    const journalBody = filled
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.what.trim()}${it.why.trim() ? `\n   Why it was meaningful: ${it.why.trim()}` : ''}`,
      )
      .join('\n\n')

    addJournal({
      title: 'Three Good Things · Reflection',
      body: `Today's gratitude moments:\n\n${journalBody}`,
      mood: 'good',
      tags: ['gratitude', 'three-good-things'],
    })

    // Check off practice in store
    if (!practicesDone.includes('gratitude')) {
      togglePractice('gratitude')
    }
    if (onComplete) {
      onComplete()
    }

    setIsCompleted(true)
  }

  const prompts = [
    {
      title: '1. A simple moment or sensation',
      placeholderWhat: 'e.g., Morning tea by the window, warm sunshine, a quiet walk...',
      placeholderWhy: 'Why did this feel good or calming?',
    },
    {
      title: '2. A kind interaction or connection',
      placeholderWhat: 'e.g., A quick text from a friend, a gentle smile from a stranger...',
      placeholderWhy: 'How did this connection support you?',
    },
    {
      title: '3. Something you handled or appreciated',
      placeholderWhat: 'e.g., Finishing a task, giving yourself permission to rest...',
      placeholderWhy: 'What does this say about what matters to you?',
    },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Three Good Things Gratitude Practice"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div className="relative my-auto w-full max-w-2xl rounded-3xl border border-border/80 bg-card p-6 shadow-2xl sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full border border-border/60 p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close reflection"
        >
          <X className="size-4" />
        </button>

        {/* Ambient Sound Toggle */}
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
          /* Completion Celebration Screen */
          <div className="py-8 text-center animate-fade-in">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary shadow-sm">
              <Sparkles className="size-8 animate-pulse" />
            </div>
            <h2 className="mt-5 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
              Gratitude Rooted & Saved
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
              Taking time to notice the good trains our attention to recognize safety, warmth, and ease. Your reflection has also been saved to your private journal.
            </p>

            <div className="mt-6 flex flex-col gap-2 rounded-2xl bg-secondary/40 p-4 text-left sm:p-5 border border-border/50">
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-primary">
                Your 3 Good Things Today
              </span>
              {items.map(
                (it, i) =>
                  it.what.trim() && (
                    <div key={i} className="text-xs text-foreground/90">
                      <strong className="text-primary font-semibold">{i + 1}.</strong> {it.what.trim()}
                    </div>
                  ),
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 shadow-md"
            >
              <Check className="size-4" /> Return to MindSpace
            </button>
          </div>
        ) : (
          /* Form Screen */
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Heart className="size-4" />
              Evidence-Based Positive Psychology
            </div>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
              Three Good Things
            </h2>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed sm:text-sm">
              Notice three things that went well today, large or small. Naming why they mattered anchors the feeling in your memory.
            </p>

            {errorMsg && (
              <p className="mt-4 rounded-xl bg-destructive/10 px-3.5 py-2 text-xs font-medium text-destructive border border-destructive/20">
                {errorMsg}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-4">
              {prompts.map((p, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/70 bg-secondary/20 p-4 transition-all focus-within:border-primary/50 focus-within:bg-secondary/40"
                >
                  <label
                    htmlFor={`gratitude-${idx}-what`}
                    className="block text-xs font-semibold text-foreground"
                  >
                    {p.title}
                  </label>
                  <Input
                    id={`gratitude-${idx}-what`}
                    value={items[idx].what}
                    onChange={(e) => updateItem(idx, 'what', e.target.value)}
                    placeholder={p.placeholderWhat}
                    className="mt-2 text-xs sm:text-sm bg-card border-border/60"
                  />
                  <Textarea
                    id={`gratitude-${idx}-why`}
                    value={items[idx].why}
                    onChange={(e) => updateItem(idx, 'why', e.target.value)}
                    placeholder={p.placeholderWhy}
                    rows={2}
                    className="mt-2 text-xs sm:text-sm bg-card border-border/60 resize-none"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-border/60 pt-4">
              <span className="text-[0.68rem] text-muted-foreground">
                Saved privately to your MindSpace journal & practice history
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 shadow-sm"
                >
                  <Check className="size-3.5" /> Complete Reflection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
