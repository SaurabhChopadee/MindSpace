"use client"

import { useState } from "react"
import { Check, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { InteractiveMoodChart } from "@/components/charts/interactive-mood-chart"
import { usePatientData } from "@/lib/patient-store"
import { EMOTIONS, MOOD_OPTIONS, moodByKey } from "@/lib/mock-data"
import { relativeDay } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { MoodKey } from "@/lib/types"

export function MoodTracker() {
  const { moods, addMood } = usePatientData()
  const [selected, setSelected] = useState<MoodKey | null>(null)
  const [intensity, setIntensity] = useState(6)
  const [emotions, setEmotions] = useState<string[]>([])
  const [note, setNote] = useState("")
  const [saved, setSaved] = useState(false)

  function toggleEmotion(e: string) {
    setEmotions((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : prev.length < 6 ? [...prev, e] : prev,
    )
  }

  function save() {
    if (!selected) return
    const opt = moodByKey(selected)
    addMood({ mood: opt.key, value: opt.value, emotions, intensity, note: note.trim() || undefined })
    setSaved(true)
    setSelected(null)
    setEmotions([])
    setNote("")
    setIntensity(6)
    setTimeout(() => setSaved(false), 2600)
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <header>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="size-4" />
          Member Wellness Check-In
        </div>
        <h1 className="mt-1 font-serif text-3xl text-foreground sm:text-4xl">How are you feeling?</h1>
        <p className="mt-1 text-sm text-muted-foreground">Noticing how you feel is a quiet, powerful act of self-awareness.</p>
      </header>

      {/* Interactive 5d/7d/30d Mood Trend Analytics */}
      <div className="mt-8">
        <InteractiveMoodChart
          moods={moods}
          title="Your Mood Trend"
          subtitle="Observed patterns across your recent check-in timestamps"
          badgeLabel="Member Pattern"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Check-in form */}
        <Card className="p-6 lg:col-span-3">
          <h2 className="font-serif text-xl font-semibold text-foreground">Record a Check-In</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Select the emotion that best reflects your current emotional state.
          </p>

          {/* Large Expressive Emoji Buttons */}
          <div className="mt-6 grid grid-cols-5 gap-2.5 sm:gap-4">
            {MOOD_OPTIONS.map((m) => {
              const isSelected = selected === m.key
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSelected(m.key)}
                  aria-pressed={isSelected}
                  aria-label={`Select mood: ${m.label} (${m.value} of 5)`}
                  className={cn(
                    "group relative flex flex-col items-center justify-center rounded-3xl p-2.5 sm:p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
                    isSelected
                      ? "border-2 border-primary bg-primary/10 shadow-lg scale-105"
                      : "border border-border/80 bg-card hover:-translate-y-1 hover:border-primary/40 hover:shadow-md",
                  )}
                >
                  {/* Visual Circle with Dominant Large Emoji */}
                  <div
                    className={cn(
                      "relative flex size-14 sm:size-18 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110",
                      isSelected && "ring-4 ring-primary/25",
                    )}
                    style={{ backgroundColor: `${m.color}30` }}
                  >
                    <span className="text-3xl sm:text-4xl select-none leading-none" role="img" aria-hidden="true">
                      {m.face}
                    </span>
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                        <Check className="size-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <span
                    className={cn(
                      "mt-2 text-xs font-semibold text-center transition-colors",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {m.label}
                  </span>
                  <span className="text-[0.62rem] text-muted-foreground">{m.value}/5</span>
                </button>
              )
            })}
          </div>

          <div className={cn("transition-opacity duration-300", selected ? "opacity-100" : "pointer-events-none opacity-45")}>
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <label htmlFor="intensity" className="text-sm font-medium text-foreground">
                  How strong is this feeling?
                </label>
                <span className="text-sm font-semibold text-primary">{intensity}/10</span>
              </div>
              <input
                id="intensity"
                type="range"
                min={1}
                max={10}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={intensity}
                aria-valuetext={`${intensity} out of 10`}
                className="mt-3 w-full accent-primary"
              />
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-foreground">
                What emotions are present? <span className="font-normal text-muted-foreground">(up to 6)</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {EMOTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => toggleEmotion(e)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      emotions.includes(e)
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-foreground hover:border-primary/40",
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="note" className="text-sm font-medium text-foreground">
                Anything you&apos;d like to add?
              </label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="A sentence or two about what's going on..."
                rows={3}
                className="mt-2 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={save}
              disabled={!selected}
              aria-disabled={!selected}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-40"
            >
              Save check-in
            </button>
            {saved && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-primary animate-fade-in">
                <Check className="size-4 stroke-[3]" /> Saved. Thank you for taking a moment for yourself.
              </p>
            )}
          </div>
        </Card>

        {/* History / Recent timeline */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="font-serif text-lg font-semibold text-foreground">Recent Check-Ins</h2>
            <p className="text-xs text-muted-foreground">Stored timestamps from your check-ins</p>
            <ul className="mt-4 flex flex-col gap-3.5">
              {moods.slice(0, 7).map((m) => {
                const opt = moodByKey(m.mood)
                return (
                  <li key={m.id} className="flex items-start gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                    <span
                      className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-lg shadow-sm"
                      style={{ backgroundColor: `${opt.color}35` }}
                      aria-hidden="true"
                    >
                      {opt.face}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground">{opt.label}</span>
                        <span className="shrink-0 text-[0.68rem] text-muted-foreground">{relativeDay(m.date)}</span>
                      </div>
                      {m.emotions.length > 0 && (
                        <p className="truncate text-[0.72rem] text-muted-foreground mt-0.5">{m.emotions.join(", ")}</p>
                      )}
                      {m.note && <p className="mt-1 line-clamp-2 text-xs text-foreground/80 italic">{`"${m.note}"`}</p>}
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
