"use client"

import { useMemo, useState } from "react"
import { BookOpen, Check, Clock, Headphones, Sparkles, Wind, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { BreathingExercise } from "@/components/patient/breathing-exercise"
import { GratitudeReflection } from "@/components/patient/gratitude-reflection"
import { BodyScanExercise } from "@/components/patient/body-scan-exercise"
import { CalmingReader } from "@/components/patient/calming-reader"
import { usePatientData } from "@/lib/patient-store"
import { RESOURCES } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type { Resource } from "@/lib/types"

const PRACTICES = [
  { id: "breathing", label: "Box breathing", description: "4 rounds · 4 min", icon: Wind, actionText: "Start breathing" },
  { id: "gratitude", label: "Three good things", description: "Reflect · 3 min", icon: Sparkles, actionText: "Start reflection" },
  { id: "bodyscan", label: "Body scan", description: "Guided · 5 min", icon: Headphones, actionText: "Start body scan" },
  { id: "reading", label: "Read something calming", description: "Article · 6 min", icon: BookOpen, actionText: "Read article" },
]

const FORMAT_ICON = {
  Article: BookOpen,
  Practice: Sparkles,
  Audio: Headphones,
  Guide: BookOpen,
} as const

export function Resources() {
  const { practicesDone, togglePractice } = usePatientData()
  const [activeModal, setActiveModal] = useState<'breathing' | 'gratitude' | 'bodyscan' | 'reading' | null>(null)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const categories = useMemo(() => ["All", ...Array.from(new Set(RESOURCES.map((r) => r.category)))], [])
  const [activeCategory, setActiveCategory] = useState("All")

  const filtered = activeCategory === "All" ? RESOURCES : RESOURCES.filter((r) => r.category === activeCategory)
  const doneCount = practicesDone.length

  const handleStartPractice = (id: string) => {
    if (id === 'breathing') setActiveModal('breathing')
    else if (id === 'gratitude') setActiveModal('gratitude')
    else if (id === 'bodyscan') setActiveModal('bodyscan')
    else if (id === 'reading') {
      setSelectedResource(RESOURCES[0])
      setActiveModal('reading')
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <header>
        <h1 className="font-serif text-3xl text-foreground">Resources & Self-Care</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Evidence-based practices and gentle reading to support your mental wellbeing.
        </p>
      </header>

      {/* Daily practices */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl font-semibold text-foreground">Today&apos;s Guided Practices</h2>
          <span className="text-xs text-muted-foreground">{doneCount} of {PRACTICES.length} completed</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PRACTICES.map((p) => {
            const done = practicesDone.includes(p.id)
            return (
              <Card
                key={p.id}
                className={cn(
                  "flex items-center gap-4 p-4 transition-all hover:border-primary/40",
                  done ? "border-primary/30 bg-primary/6" : "",
                )}
              >
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                    done ? "bg-primary/15 text-primary" : "bg-secondary text-foreground/70",
                  )}
                >
                  <p.icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground text-sm">{p.label}</p>
                  <p className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: p.description }} />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartPractice(p.id)}
                    className="shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 shadow-sm"
                  >
                    {done ? 'Replay' : 'Start'}
                  </button>

                  <button
                    type="button"
                    onClick={() => togglePractice(p.id)}
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                      done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-transparent hover:border-primary/50",
                    )}
                    aria-label={done ? `Mark ${p.label} not done` : `Mark ${p.label} done`}
                  >
                    <Check className="size-4" />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Library */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">Explore the Library</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Select an article, practice, or guide to read and reflect.</p>
          </div>
          <span className="text-xs text-muted-foreground">{filtered.length} resources</span>
        </div>

        {/* Category Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
                activeCategory === c
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-foreground hover:border-primary/40",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Resource Cards with working onClick */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => {
            const Icon = FORMAT_ICON[r.format]
            return (
              <Card
                key={r.id}
                onClick={() => {
                  setSelectedResource(r)
                  setActiveModal('reading')
                }}
                className="group flex flex-col p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="flex size-10 items-center justify-center rounded-xl text-foreground/75 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: r.tone }}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    {r.format}
                  </span>
                </div>

                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary">{r.category}</p>
                <h3 className="mt-1 text-pretty font-serif text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                  {r.title}
                </h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">{r.description}</p>

                <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {r.minutes} min read
                  </span>
                  <span className="font-semibold text-primary group-hover:underline inline-flex items-center gap-1">
                    Read <ArrowRight className="size-3" />
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Practice Modals */}
      {activeModal === 'breathing' && (
        <BreathingExercise
          onClose={() => setActiveModal(null)}
          onComplete={() => {
            if (!practicesDone.includes('breathing')) togglePractice('breathing')
          }}
        />
      )}

      {activeModal === 'gratitude' && (
        <GratitudeReflection
          onClose={() => setActiveModal(null)}
          onComplete={() => {
            if (!practicesDone.includes('gratitude')) togglePractice('gratitude')
          }}
        />
      )}

      {activeModal === 'bodyscan' && (
        <BodyScanExercise
          onClose={() => setActiveModal(null)}
          onComplete={() => {
            if (!practicesDone.includes('bodyscan')) togglePractice('bodyscan')
          }}
        />
      )}

      {activeModal === 'reading' && selectedResource && (
        <CalmingReader
          resource={selectedResource}
          onClose={() => {
            setActiveModal(null)
            setSelectedResource(null)
          }}
          onComplete={() => {
            if (!practicesDone.includes('reading')) togglePractice('reading')
          }}
        />
      )}
    </div>
  )
}
