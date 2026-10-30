"use client"

import { useState } from "react"
import { Check, Feather, Plus, Trash2, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { usePatientData } from "@/lib/patient-store"
import { MOOD_OPTIONS, moodByKey } from "@/lib/mock-data"
import { longDate, relativeDay } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { JournalEntry, MoodKey } from "@/lib/types"

const PROMPTS = [
  "What is one thing you're grateful for today?",
  "What drained your energy, and what restored it?",
  "Describe a moment you felt at ease recently.",
  "What would you say to a friend feeling the way you do?",
]

export function Journal() {
  const { journal, addJournal, deleteJournal } = usePatientData()
  const [composing, setComposing] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [mood, setMood] = useState<MoodKey | null>(null)
  const [selected, setSelected] = useState<JournalEntry | null>(journal[0] ?? null)

  function startNew() {
    setComposing(true)
    setSelected(null)
    setTitle("")
    setBody("")
    setMood(null)
  }

  function save() {
    if (!body.trim()) return
    addJournal({
      title: title.trim() || "Untitled entry",
      body: body.trim(),
      mood: mood ?? undefined,
      tags: [],
    })
    setComposing(false)
    setTitle("")
    setBody("")
    setMood(null)
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Journal</h1>
          <p className="mt-1 text-muted-foreground">A private space for your thoughts. Only you can see this.</p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" /> New entry
        </button>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Composer or reader */}
        <div className="lg:col-span-3">
          {composing ? (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-serif text-lg text-foreground">
                  <Feather className="size-5 text-primary" /> New entry
                </h2>
                <button
                  type="button"
                  onClick={() => setComposing(false)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="size-5" />
                </button>
              </div>

              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give it a title (optional)"
                className="mt-4 border-0 border-b border-border bg-transparent px-0 font-serif text-lg focus-visible:ring-0"
              />

              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Start writing whatever comes to mind..."
                rows={10}
                className="mt-3 resize-none border-0 bg-transparent px-0 text-base leading-relaxed focus-visible:ring-0"
              />

              <div className="mt-2 rounded-xl bg-secondary/60 p-3">
                <p className="text-xs font-medium text-muted-foreground">Need a nudge?</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setBody((b) => (b ? b : p + "\n\n"))}
                      className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/40"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Mood:</span>
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setMood((cur) => (cur === m.key ? null : m.key))}
                      className={cn(
                        "size-7 rounded-full text-[0.65rem] font-medium text-foreground/70 transition-all",
                        mood === m.key ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : "opacity-70 hover:opacity-100",
                      )}
                      style={{ backgroundColor: m.color }}
                      aria-label={m.label}
                    >
                      {m.value}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={save}
                  disabled={!body.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
                >
                  <Check className="size-4" /> Save entry
                </button>
              </div>
            </Card>
          ) : selected ? (
            <Card className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{longDate(selected.date)}</p>
                  <h2 className="mt-1 text-balance font-serif text-2xl text-foreground">{selected.title}</h2>
                </div>
                {selected.mood && (
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-medium text-foreground/70"
                    style={{ backgroundColor: moodByKey(selected.mood).color }}
                    aria-label={moodByKey(selected.mood).label}
                  >
                    {moodByKey(selected.mood).value}
                  </span>
                )}
              </div>
              <p className="mt-5 whitespace-pre-wrap text-pretty leading-relaxed text-foreground/90">{selected.body}</p>
              {selected.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {selected.tags.map((t) => (
                    <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  deleteJournal(selected.id)
                  setSelected(journal.find((j) => j.id !== selected.id) ?? null)
                }}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-3.5" /> Delete entry
              </button>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <Feather className="size-8 text-primary/50" />
              <p className="font-serif text-lg text-foreground">Your journal is a quiet place</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Writing even a few lines can help untangle a busy mind. Start whenever you&apos;re ready.
              </p>
              <button
                type="button"
                onClick={startNew}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="size-4" /> Write an entry
              </button>
            </Card>
          )}
        </div>

        {/* Entry list */}
        <div className="lg:col-span-2">
          <h2 className="px-1 font-serif text-lg text-foreground">Past entries</h2>
          <div className="mt-3 flex flex-col gap-2">
            {journal.length === 0 && <p className="px-1 text-sm text-muted-foreground">No entries yet.</p>}
            {journal.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  setSelected(entry)
                  setComposing(false)
                }}
                className={cn(
                  "flex flex-col gap-1 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm",
                  selected?.id === entry.id && !composing ? "border-primary/40 bg-primary/6" : "border-border bg-card",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium text-foreground">{entry.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{relativeDay(entry.date)}</span>
                </div>
                <span className="line-clamp-2 text-sm text-muted-foreground">{entry.body}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
