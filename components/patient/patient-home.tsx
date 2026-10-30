"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ArrowRight,
  MessageCircleHeart,
  NotebookPen,
  Library,
  MapPin,
  Sparkles,
  Wind,
  Headphones,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { InteractiveMoodChart } from "@/components/charts/interactive-mood-chart"
import { BreathingExercise } from "@/components/patient/breathing-exercise"
import { GratitudeReflection } from "@/components/patient/gratitude-reflection"
import { BodyScanExercise } from "@/components/patient/body-scan-exercise"
import { CalmingReader } from "@/components/patient/calming-reader"
import { useSession } from "@/lib/session"
import { usePatientData } from "@/lib/patient-store"
import { AFFIRMATIONS, ANCHOR, MOOD_OPTIONS, EMOTIONS, RESOURCES, moodByKey } from "@/lib/mock-data"
import { relativeDay } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { MoodKey, Resource } from "@/lib/types"

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

const quickActions = [
  {
    href: "/patient/companion",
    label: "Talk it through",
    description: "Reflect with your AI companion",
    icon: MessageCircleHeart,
    tone: "var(--chart-2)",
  },
  {
    href: "/patient/journal",
    label: "Write it down",
    description: "Open your private journal",
    icon: NotebookPen,
    tone: "var(--chart-4)",
  },
  {
    href: "/patient/resources",
    label: "Guided practices",
    description: "Self-care exercises & library",
    icon: Library,
    tone: "var(--chart-1)",
  },
  {
    href: "/patient/support",
    label: "Local support",
    description: "Verified helplines & clinics",
    icon: MapPin,
    tone: "var(--chart-3)",
  },
]

export function PatientHome() {
  const { patientName } = useSession()
  const { moods, journal, conversations, practicesDone, togglePractice, addMood } = usePatientData()

  // Mood Check-in State
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null)
  const [intensity, setIntensity] = useState(6)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [note, setNote] = useState("")
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null)

  // Active Modals
  const [activePracticeModal, setActivePracticeModal] = useState<
    'breathing' | 'gratitude' | 'bodyscan' | 'reading' | null
  >(null)
  const [readerResource, setReaderResource] = useState<Resource | null>(null)

  const affirmation = useMemo(
    () => AFFIRMATIONS[new Date(ANCHOR).getDate() % AFFIRMATIONS.length],
    [],
  )

  // Toggle emotion chip
  function toggleEmotion(e: string) {
    setSelectedEmotions((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : prev.length < 6 ? [...prev, e] : prev,
    )
  }

  // Save check-in
  function handleSaveCheckIn() {
    if (!selectedMood) return
    const opt = moodByKey(selectedMood)
    addMood({
      mood: opt.key,
      value: opt.value,
      emotions: selectedEmotions,
      intensity,
      note: note.trim() || undefined,
    })

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setSavedFeedback(`Recorded “${opt.label}” at ${timeStr}. Thank you for checking in.`)
    setSelectedMood(null)
    setSelectedEmotions([])
    setNote("")
    setIntensity(6)
    setIsDetailsOpen(false)
    setTimeout(() => setSavedFeedback(null), 4000)
  }

  // Quick Mood Click (selects emoji and opens details if user wants, or one-tap save)
  function handleSelectMood(key: MoodKey) {
    setSelectedMood(key)
    setIsDetailsOpen(true)
  }

  // Filter today's check-ins
  const todayMoods = useMemo(() => {
    const todayStr = new Date().toDateString()
    return moods.filter((m) => {
      const d = new Date(m.date)
      return !isNaN(d.getTime()) && d.toDateString() === todayStr
    })
  }, [moods])

  // Latest check-in for dynamic recommendations
  const latestMood = moods[0]

  // Dynamic recommendation based on latest mood
  const recommendation = useMemo(() => {
    if (!latestMood) return null
    if (latestMood.value <= 2) {
      return {
        title: "Soothe your nervous system",
        description: "Your recent check-in noticed higher tension or low energy. A 4-minute box breathing session can activate your parasympathetic calm.",
        actionLabel: "Begin Box Breathing",
        onAction: () => setActivePracticeModal('breathing'),
        icon: Wind,
        badge: "Based on your recent check-in",
      }
    }
    if (latestMood.value === 3) {
      return {
        title: "Take a somatic reset",
        description: "A steady, neutral day is a wonderful moment to ground yourself. A 5-minute body scan helps you reconnect with physical ease.",
        actionLabel: "Start Body Scan",
        onAction: () => setActivePracticeModal('bodyscan'),
        icon: Headphones,
        badge: "Recommended for you",
      }
    }
    return {
      title: "Anchor what went well",
      description: "You're experiencing pleasant or uplifting moments today. Writing down three good things locks positive memories into long-term awareness.",
      actionLabel: "Three Good Things",
      onAction: () => setActivePracticeModal('gratitude'),
      icon: Sparkles,
      badge: "Uplifting Practice",
    }
  }, [latestMood])

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* Greeting Header */}
      <header className="animate-rise flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Member Sanctuary · {relativeDay(new Date().toISOString())}
        </p>
        <h1 className="text-balance font-serif text-3xl leading-tight text-foreground sm:text-4xl">
          {greeting()}, {patientName || 'Friend'}.
        </h1>
      </header>

      {/* Daily Affirmation */}
      <Card className="animate-rise mt-6 flex items-center gap-4 border-primary/20 bg-primary/8 p-5 [animation-delay:100ms] shadow-sm">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary shadow-sm">
          <Sparkles className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">A gentle thought for today</p>
          <p className="mt-1 text-pretty font-serif text-lg text-foreground">{affirmation}</p>
        </div>
      </Card>

      {/* CONSOLIDATED MOOD CHECK-IN HUB */}
      <section id="mood-hub" className="animate-rise mt-8 [animation-delay:180ms]">
        <Card className="p-6 sm:p-7 border-border/80 shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Heart className="size-4" />
                Member Wellness Check-In
              </div>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-foreground">
                How are you feeling right now?
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Select your emotional state. You can record a quick check-in or expand to add emotions and notes.
              </p>
            </div>

            {selectedMood && (
              <button
                type="button"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline self-start sm:self-auto mt-2 sm:mt-0"
              >
                {isDetailsOpen ? (
                  <>Hide details <ChevronUp className="size-3.5" /></>
                ) : (
                  <>Add details & context <ChevronDown className="size-3.5" /></>
                )}
              </button>
            )}
          </div>

          {/* Large Expressive Emoji Buttons */}
          <div className="stagger mt-6 grid grid-cols-5 gap-2.5 sm:gap-4">
            {MOOD_OPTIONS.map((m) => {
              const isSelected = selectedMood === m.key
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => handleSelectMood(m.key as MoodKey)}
                  aria-pressed={isSelected}
                  aria-label={`Select mood: ${m.label} (${m.value} of 5)`}
                  className={cn(
                    "group relative flex flex-col items-center justify-center rounded-3xl p-3 sm:p-4 border transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
                    isSelected
                      ? "border-primary bg-primary/12 ring-2 ring-primary scale-105 shadow-md"
                      : "border-border/80 bg-card hover:-translate-y-1 hover:border-primary/40 hover:shadow-md",
                  )}
                >
                  {/* Large visual circle with dominant emoji */}
                  <div
                    className={cn(
                      "relative flex size-13 sm:size-16 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110",
                      isSelected && "ring-4 ring-primary/25",
                    )}
                    style={{ backgroundColor: `${m.color}35` }}
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

          {/* Feedback Toast Banner */}
          {savedFeedback && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-2.5 text-xs font-medium text-primary border border-primary/20 animate-fade-in">
              <Check className="size-4 shrink-0 stroke-[3]" />
              <span>{savedFeedback}</span>
            </div>
          )}

          {/* Expandable Context Form */}
          {selectedMood && (
            <div className="mt-6 rounded-2xl border border-border/80 bg-secondary/25 p-4 sm:p-6 animate-fade-in">
              {/* Intensity Slider */}
              <div>
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-foreground">
                  <label htmlFor="home-intensity">How strong is this feeling?</label>
                  <span className="font-semibold text-primary">{intensity}/10</span>
                </div>
                <input
                  id="home-intensity"
                  type="range"
                  min={1}
                  max={10}
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="mt-2.5 w-full accent-primary"
                />
              </div>

              {/* Emotion Chips */}
              <div className="mt-5">
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  What emotions are present? <span className="font-normal text-muted-foreground">(up to 6)</span>
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {EMOTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => toggleEmotion(e)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                        selectedEmotions.includes(e)
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-card text-foreground hover:border-primary/40",
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="mt-5">
                <label htmlFor="home-mood-note" className="text-xs sm:text-sm font-medium text-foreground">
                  Anything you&apos;d like to add? <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <Textarea
                  id="home-mood-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="A sentence or two about what's going on..."
                  rows={2}
                  className="mt-2 text-xs sm:text-sm bg-card border-border/70"
                />
              </div>

              {/* Save Button */}
              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMood(null)
                    setIsDetailsOpen(false)
                  }}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCheckIn}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 shadow-sm"
                >
                  <Check className="size-3.5" /> Save Check-In
                </button>
              </div>
            </div>
          )}

          {/* Today's Check-in Timeline */}
          <div className="mt-6 border-t border-border/50 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Today&apos;s Check-In History
              </span>
              <span className="text-xs text-muted-foreground">
                {todayMoods.length} {todayMoods.length === 1 ? 'entry' : 'entries'} today
              </span>
            </div>

            {todayMoods.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground italic">
                No check-ins logged yet today. Select an emoji above to record your first.
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-2.5">
                {todayMoods.map((m) => {
                  const opt = moodByKey(m.mood)
                  const time = new Date(m.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-secondary/20 p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="flex size-9 shrink-0 items-center justify-center rounded-full text-lg shadow-sm"
                          style={{ backgroundColor: `${opt.color}35` }}
                        >
                          {opt.face}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-semibold text-foreground">{opt.label}</span>
                            <span className="text-[0.68rem] text-muted-foreground">({m.value}/5 · Intensity {m.intensity || 5}/10)</span>
                          </div>
                          {m.emotions && m.emotions.length > 0 && (
                            <p className="truncate text-[0.7rem] text-muted-foreground mt-0.5">
                              {m.emotions.join(', ')}
                            </p>
                          )}
                          {m.note && (
                            <p className="truncate text-[0.7rem] text-foreground/80 italic mt-0.5">
                              {`"${m.note}"`}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-[0.7rem] font-medium text-muted-foreground">
                        {time}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Dynamic Recommendation Card */}
      {recommendation && (
        <Card className="animate-rise mt-6 flex flex-col items-start gap-4 border-primary/20 bg-primary/6 p-5 [animation-delay:220ms] sm:flex-row sm:items-center sm:justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary shadow-sm">
              <recommendation.icon className="size-5" />
            </span>
            <div>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary">
                {recommendation.badge}
              </span>
              <p className="font-serif text-lg font-semibold text-foreground">{recommendation.title}</p>
              <p className="text-xs text-muted-foreground max-w-xl">{recommendation.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={recommendation.onAction}
            className="inline-flex items-center gap-2 shrink-0 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 shadow-sm"
          >
            {recommendation.actionLabel} <ArrowRight className="size-3.5" />
          </button>
        </Card>
      )}

      {/* Interactive 7d / 4w / 6m Mood Analytics */}
      <div className="animate-rise mt-8 grid gap-4 [animation-delay:260ms] lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InteractiveMoodChart
            moods={moods}
            title="Your Mood Trend"
            subtitle="Observed patterns from your recent check-in timestamps"
            badgeLabel="Observed Pattern"
          />
        </div>

        {/* Activity Snapshot */}
        <Card className="flex flex-col justify-between p-5">
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">Activity Snapshot</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Your reflections over the last 30 days</p>

            <div className="mt-4 flex flex-col gap-3">
              <StatRow label="Check-ins recorded" value={moods.length} />
              <StatRow label="Journal reflections" value={journal.length} />
              <StatRow label="Companion chats" value={conversations.length} />
            </div>
          </div>

          <Link
            href="/patient/resources"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Explore all guided practices <ArrowRight className="size-3.5" />
          </Link>
        </Card>
      </div>

      {/* TODAY'S PRACTICES SECTION */}
      <section className="animate-rise mt-8 [animation-delay:320ms]">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl font-semibold text-foreground">Today&apos;s Guided Practices</h2>
          <span className="text-xs text-muted-foreground">
            {practicesDone.length} of 4 completed
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Practice 1: Box Breathing */}
          <Card
            className={cn(
              "flex flex-col justify-between p-4 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
              practicesDone.includes('breathing') ? "border-primary/30 bg-primary/5" : "",
            )}
            onClick={() => setActivePracticeModal('breathing')}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Wind className="size-5" />
                </span>
                {practicesDone.includes('breathing') && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">Box Breathing</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">4 rounds · 4 min nervous system reset</p>
            </div>
            <span className="mt-4 text-xs font-semibold text-primary">
              {practicesDone.includes('breathing') ? 'Repeat practice →' : 'Begin practice →'}
            </span>
          </Card>

          {/* Practice 2: Three Good Things */}
          <Card
            className={cn(
              "flex flex-col justify-between p-4 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
              practicesDone.includes('gratitude') ? "border-primary/30 bg-primary/5" : "",
            )}
            onClick={() => setActivePracticeModal('gratitude')}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Sparkles className="size-5" />
                </span>
                {practicesDone.includes('gratitude') && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">Three Good Things</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">3 min gratitude & reflection exercise</p>
            </div>
            <span className="mt-4 text-xs font-semibold text-primary">
              {practicesDone.includes('gratitude') ? 'Review gratitude →' : 'Begin reflection →'}
            </span>
          </Card>

          {/* Practice 3: Body Scan */}
          <Card
            className={cn(
              "flex flex-col justify-between p-4 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
              practicesDone.includes('bodyscan') ? "border-primary/30 bg-primary/5" : "",
            )}
            onClick={() => setActivePracticeModal('bodyscan')}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  <Headphones className="size-5" />
                </span>
                {practicesDone.includes('bodyscan') && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">Body Scan</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">5 min guided somatic awareness</p>
            </div>
            <span className="mt-4 text-xs font-semibold text-primary">
              {practicesDone.includes('bodyscan') ? 'Repeat scan →' : 'Begin scan →'}
            </span>
          </Card>

          {/* Practice 4: Read Something Calming */}
          <Card
            className={cn(
              "flex flex-col justify-between p-4 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
              practicesDone.includes('reading') ? "border-primary/30 bg-primary/5" : "",
            )}
            onClick={() => {
              setReaderResource(RESOURCES[0])
              setActivePracticeModal('reading')
            }}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="size-5" />
                </span>
                {practicesDone.includes('reading') && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">Read Something Calming</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">6 min · Riding the wave of anxious thoughts</p>
            </div>
            <span className="mt-4 text-xs font-semibold text-primary">
              {practicesDone.includes('reading') ? 'Re-read article →' : 'Begin reading →'}
            </span>
          </Card>
        </div>
      </section>

      {/* Quick Action Navigation Grid */}
      <section className="animate-rise mt-8 [animation-delay:380ms]">
        <h2 className="font-serif text-xl font-semibold text-foreground">MindSpace Sanctuaries</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href} className="group">
              <Card className="h-full p-4 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                <span
                  className="flex size-10 items-center justify-center rounded-xl text-foreground/75 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: a.tone }}
                >
                  <a.icon className="size-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {a.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Modals for Interactive Practices */}
      {activePracticeModal === 'breathing' && (
        <BreathingExercise
          onClose={() => setActivePracticeModal(null)}
          onComplete={() => {
            if (!practicesDone.includes('breathing')) togglePractice('breathing')
          }}
        />
      )}

      {activePracticeModal === 'gratitude' && (
        <GratitudeReflection
          onClose={() => setActivePracticeModal(null)}
          onComplete={() => {
            if (!practicesDone.includes('gratitude')) togglePractice('gratitude')
          }}
        />
      )}

      {activePracticeModal === 'bodyscan' && (
        <BodyScanExercise
          onClose={() => setActivePracticeModal(null)}
          onComplete={() => {
            if (!practicesDone.includes('bodyscan')) togglePractice('bodyscan')
          }}
        />
      )}

      {activePracticeModal === 'reading' && readerResource && (
        <CalmingReader
          resource={readerResource}
          onClose={() => {
            setActivePracticeModal(null)
            setReaderResource(null)
          }}
          onComplete={() => {
            if (!practicesDone.includes('reading')) togglePractice('reading')
          }}
        />
      )}
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/40 pb-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-serif text-xl font-semibold text-foreground">{value}</span>
    </div>
  )
}
