'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Loader2, ShieldAlert, Sparkles, Download, Check, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/charts/progress-ring'
import { InteractiveMoodChart } from '@/components/charts/interactive-mood-chart'
import { useClinicianData } from '@/lib/clinician-store'
import { moodByKey } from '@/lib/mock-data'
import { longDate, relativeDay } from '@/lib/format'
import type { PatientRecord } from '@/lib/types'

function buildPatientContext(p: PatientRecord): string {
  const risks = p.risks.map((r) => `${r.level}: ${r.label} — ${r.detail}`).join('; ')
  const themes = p.themes.join(', ')
  const concerns = p.concerns.join(', ')
  const conversations = p.conversationContext
    .map((c) => `${c.speaker === 'patient' ? p.firstName : 'Companion'}: "${c.text}"${c.crisis ? ' [CRISIS FLAG]' : ''}`)
    .join('\n')

  return (
    `--- PATIENT: ${p.name} (${p.age}y, ${p.pronouns}) ---\n` +
    `Status: ${p.status} | Mood: ${p.currentMood} (${p.moodValue}/5) | Variability: ${p.variability}%\n` +
    `Themes: ${themes}\n` +
    `Concerns: ${concerns || 'None reported'}\n` +
    `Risks: ${risks || 'None'}\n` +
    `AI Summary: ${p.aiSummary}\n` +
    `Recent Companion Conversation:\n${conversations || 'No conversation data'}\n`
  )
}

export function PatientOverview({ id }: { id: string }) {
  const { allPatients, getMemberLiveMoods } = useClinicianData()
  const patient = allPatients.find(
    (p) => p.id === id || p.id === `backend-${id}` || String(p.id).endsWith(id),
  )

  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false)
  const [soapNote, setSoapNote] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  const liveMoods = patient ? getMemberLiveMoods(patient.id) : []

  if (!patient) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-semibold text-foreground">Member Record Not Found</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          The requested member could not be found in your active care roster.
        </p>
        <div className="mt-6">
          <Link
            href="/psychiatrist/patients"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            <ArrowLeft className="size-3.5" /> Return to Care Roster
          </Link>
        </div>
      </div>
    )
  }

  const handleGenerateSoap = async () => {
    setIsGeneratingSoap(true)
    try {
      const res = await fetch('/api/generate-soap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientContext: buildPatientContext(patient) })
      })
      if (!res.ok) throw new Error('Failed to generate')
      const data = await res.json()
      setSoapNote(data.note)
    } catch (err) {
      console.error(err)
      setSoapNote('Error generating SOAP note. Please try again.')
    } finally {
      setIsGeneratingSoap(false)
    }
  }

  const handleCopy = () => {
    if (soapNote) {
      navigator.clipboard.writeText(soapNote)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* Back button */}
      <Link
        href="/psychiatrist/patients"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to members roster
      </Link>

      {/* Member Header */}
      <header className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
              MEMBER PROFILE
            </span>
            <span>·</span>
            <span>Connected {relativeDay(patient.connectedSince)}</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {patient.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {patient.age} years old · {patient.pronouns} · Last check-in {relativeDay(patient.lastCheckIn)}
          </p>
        </div>

        <Button
          onClick={handleGenerateSoap}
          disabled={isGeneratingSoap}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          {isGeneratingSoap ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
          {isGeneratingSoap ? 'Generating...' : 'Generate Clinical SOAP Note'}
        </Button>
      </header>

      {/* SOAP Note Modal / Display */}
      {soapNote && (
        <Card className="mt-6 p-6 border-primary/20 bg-primary/5 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">AI-Generated SOAP Note</h2>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setSoapNote(null)} className="h-8 text-xs">
                Dismiss
              </Button>
              <Button size="sm" onClick={handleCopy} className="h-8 text-xs gap-1.5">
                {isCopied ? <Check className="size-3.5" /> : <Download className="size-3.5" />}
                {isCopied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
            </div>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90 bg-transparent p-0 m-0 border-0">
              {soapNote}
            </pre>
          </div>
        </Card>
      )}

      {/* Hero Metrics */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Current Mood"
          sublabel="MEMBER-REPORTED"
          value={`${moodByKey(patient.currentMood).face} ${moodByKey(patient.currentMood).label} (${patient.moodValue}/5)`}
        />
        <Metric
          label="30-Day Activity"
          sublabel="ENGAGEMENT INDEX"
          value={`${patient.progress}%`}
        />
        <Metric
          label="Mood Variability"
          sublabel="OBSERVED SPREAD"
          value={`${patient.variability}%`}
        />
        <Metric
          label="Signals For Review"
          sublabel="ATTENTION QUEUE"
          value={patient.risks.length}
        />
      </div>

      {/* Interactive 5d/7d/30d Synchronized Mood Chart */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_0.55fr]">
        <div>
          <InteractiveMoodChart
            moods={liveMoods}
            title="Member-Reported Mood Trends"
            subtitle="Synchronized check-in history & timestamps from the member application"
            badgeLabel="MEMBER-REPORTED"
            showRangeSelector={true}
          />
        </div>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-4">
            OBSERVED TREND
          </span>
          <ProgressRing value={patient.progress} label={`${patient.progress}%`} sublabel="activity" />
          <h2 className="mt-5 font-display text-lg font-semibold text-foreground">Engagement Snapshot</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Member check-ins, journal reflections, companion conversations, and self-care practices.
          </p>
        </Card>
      </div>

      {/* Themes & Signals */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">Member-Reported Themes</h2>
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              MEMBER-REPORTED
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {patient.themes.map((theme) => (
              <span key={theme} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
                {theme}
              </span>
            ))}
          </div>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Member-Reported Concerns
          </h3>
          <ul className="mt-2.5 flex flex-col gap-2 text-xs text-muted-foreground">
            {patient.concerns.length ? (
              patient.concerns.map((concern) => <li key={concern}>• {concern}</li>)
            ) : (
              <li>No immediate concerns recorded in this period.</li>
            )}
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-warning" />
              <h2 className="font-display text-xl font-semibold text-foreground">Signals For Clinical Review</h2>
            </div>
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-warning bg-warning/10 px-2 py-0.5 rounded-full">
              OBSERVED TREND
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {patient.risks.map((risk) => (
              <div
                key={risk.id}
                className={`rounded-2xl border p-4 ${
                  risk.level === 'elevated'
                    ? 'border-danger/30 bg-danger/5'
                    : risk.level === 'watch'
                    ? 'border-warning/30 bg-warning/8'
                    : 'border-border bg-secondary/30'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-xs font-semibold text-foreground">{risk.label}</strong>
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    {risk.level}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{risk.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI-Supported Summary & Notes */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h2 className="font-display text-xl font-semibold text-foreground">Clinical AI Assistant</h2>
              </div>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                UNFILTERED INSIGHTS
              </span>
            </div>
            
            {/* The ClinicalHelperChat Component will be extracted here */}
            <ClinicalHelperChat patient={patient} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">Private Clinician Notes</h2>
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              CLINICIAN NOTE
            </span>
          </div>
          {patient.notes.length ? (
            patient.notes.map((note) => (
              <article key={note.id} className="mt-4 rounded-xl border border-primary/15 bg-primary/5 p-4">
                <p className="text-[0.68rem] text-muted-foreground">
                  {longDate(note.date)} · {note.author}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-foreground/85">{note.body}</p>
              </article>
            ))
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">No private clinician notes added yet for this member.</p>
          )}
        </Card>
      </div>
    </div>
  )
}

function Metric({ label, sublabel, value }: { label: string; sublabel?: string; value: string | number }) {
  return (
    <Card className="p-4 flex flex-col justify-between">
      <div>
        {sublabel && (
          <p className="text-[0.62rem] font-bold uppercase tracking-wider text-primary">{sublabel}</p>
        )}
        <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
      </div>
      <p className="mt-2 font-display text-xl font-semibold text-foreground">{value}</p>
    </Card>
  )
}

function createPatientGreeting(name: string) {
  return [
    {
      role: 'assistant' as const,
      content: `Hi, I am your clinical AI assistant. I have analyzed ${name}'s chat transcripts, mood logs, and journals. What would you like to know about their current distress levels or risk factors?`,
    },
  ]
}

function ClinicalHelperChat({ patient }: { patient: PatientRecord }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`mindspace_clinical_helper_${patient.id}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch {}
    }
    return createPatientGreeting(patient.name)
  })
  const [draft, setDraft] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Persist messages whenever they change
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(`mindspace_clinical_helper_${patient.id}`, JSON.stringify(messages))
      }
    } catch {}
  }, [messages, patient.id])

  const handleReset = () => {
    const greeting = createPatientGreeting(patient.name)
    setMessages(greeting)
    try {
      localStorage.setItem(`mindspace_clinical_helper_${patient.id}`, JSON.stringify(greeting))
    } catch {}
  }

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isStreaming])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim() || isStreaming) return

    const userMessage = { role: 'user' as const, content: draft }
    const newHistory = [...messages, userMessage]
    setMessages(newHistory)
    setDraft('')
    setIsStreaming(true)

    try {
      const res = await fetch('/api/clinical-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          patientContext: buildPatientContext(patient),
          systemPrompt: "You are a clinical AI assistant. Your job is to give UNFILTERED, direct insights to the psychiatrist. Analyze the patient's transcripts and logs. Tell the clinician exactly what the patient is distressed about. Be direct, clinical, and helpful."
        })
      })

      if (!res.ok || !res.body) throw new Error('API Error')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])
      
      let accumulated = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          const clean = line.trim()
          if (!clean.startsWith('data:')) continue
          const payload = clean.slice(5).trim()
          if (payload === '[DONE]') break
          
          try {
            const data = JSON.parse(payload)
            if (data.text) {
              accumulated += data.text
              setMessages(prev => {
                const last = prev[prev.length - 1]
                if (last.role === 'assistant') {
                  return [...prev.slice(0, -1), { ...last, content: accumulated }]
                }
                return prev
              })
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Google AI is currently experiencing high demand. Please try again in a few seconds.' }])
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {messages.length > 1 && (
        <div className="flex justify-end pb-1.5 mb-1.5 border-b border-border/40">
          <button
            type="button"
            onClick={handleReset}
            disabled={isStreaming}
            title="Reset discussion for this patient"
            className="flex items-center gap-1 text-[0.62rem] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RotateCcw className="size-2.5" />
            Reset chat
          </button>
        </div>
      )}
      <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className={`text-[0.65rem] font-bold uppercase mb-1 ${m.role === 'user' ? 'text-primary' : 'text-muted-foreground'}`}>
              {m.role === 'user' ? 'You' : 'Clinical AI'}
            </span>
            <div className={`p-3 rounded-xl text-xs leading-relaxed max-w-[90%] ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {isStreaming && (
          <div className="text-xs text-muted-foreground animate-pulse flex items-center gap-2">
            <Loader2 className="size-3 animate-spin" /> Analyzing patient data...
          </div>
        )}
      </div>
      <form onSubmit={handleSend} className="relative mt-auto">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about distresses, risks, or themes..."
          disabled={isStreaming}
          className="w-full bg-secondary/50 border border-border/60 rounded-full pl-4 pr-12 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!draft.trim() || isStreaming}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
      </form>
    </div>
  )
}
