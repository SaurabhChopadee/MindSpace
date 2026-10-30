'use client'

import { useState, useRef, useCallback } from 'react'
import { Bot, Send, Loader2, Sparkles, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useClinicianData } from '@/lib/clinician-store'
import type { PatientRecord } from '@/lib/types'

interface Message {
  id: string
  role: 'clinician' | 'ai'
  content: string
  time: string
}

function buildPatientContext(patients: PatientRecord[]): string {
  if (!patients || patients.length === 0) {
    return 'NO PATIENTS CURRENTLY ASSIGNED TO THIS CLINICIAN.\nThe clinician has zero active patients linked in their portal. If asked about patients or caseload, inform them that their roster is currently empty and they can link patients using their Clinician Invite Code in the Clinician Portal settings. However, you can assist with any general clinical, diagnostic, pharmacological, or therapeutic questions.'
  }

  return patients.map((p) => {
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
  }).join('\n\n')
}

const CLINICIAN_SYSTEM_PROMPT = `You are MindSpace Clinical AI — a frank, evidence-based clinical intelligence assistant designed exclusively for licensed mental health professionals.

YOUR ROLE:
You are a clinical decision-support and psychiatric intelligence assistant. You assist the clinician with caseload insights, patient telemetry analysis, session briefs, differential considerations, psychopharmacology, clinical frameworks, and consultation planning.

HOW YOU COMMUNICATE:
- Respond naturally and helpfully to greetings (e.g., if the clinician says "hi", "hello", or introduces themselves, greet them warmly and professionally as Doctor, confirming readiness to review caseload, discuss differential diagnoses, or formulate treatment protocols).
- Be DIRECT, PROFESSIONAL, and CLINICAL. No therapeutic patient language. No emotional padding. This is doctor-to-assistant clinical communication.
- Use clinical terminology freely (anhedonia, psychomotor retardation, rumination, cognitive distortion, etc.)
- When asked general questions about psychiatric disorders, psychopharmacology, clinical frameworks, or therapy modalities, provide high-yield, evidence-based answers referencing standard guidelines (DSM-5-TR, APA, NICE, CANMAT, Maudsley Prescribing Guidelines).
- When asked about patients in their care roster, cite specific data points from the patient records provided below (exact quotes, mood scores, variability, dates).
- If the patient roster is empty, clearly inform the clinician while offering immediate assistance with general clinical inquiries, pharmacology dosing considerations, or diagnostic criteria.
- Never diagnose. You present observations and patterns. The clinician makes the final clinical judgment.
- Be concise and structured. Use bullet points and clean formatting where helpful.

CAPABILITIES:
- Compare patient trajectories across time
- Identify risk patterns across conversations
- Suggest session talking points based on recent companion data
- Flag discrepancies between self-reported mood and conversation content
- Generate session preparation briefs
- Track engagement patterns (when patients chat, how often, what topics)
- Answer general psychiatric, pharmacological, and clinical practice questions
`

export function ClinicalAIAssistant() {
  const {
    patients,
    clinicalAiMessages: messages,
    setClinicalAiMessages: setMessages,
    clearClinicalAiMessages,
  } = useClinicianData()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'clinician',
      content: trimmed,
      time: new Date().toISOString(),
    }

    const aiMsgId = `ai-${Date.now()}`
    const placeholderAi: Message = {
      id: aiMsgId,
      role: 'ai',
      content: '',
      time: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg, placeholderAi])
    setInput('')
    setIsLoading(true)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 90_000)

    try {
      const patientContext = buildPatientContext(patients)

      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role === 'clinician' ? 'user' : 'assistant',
          content: m.content,
        }))
      history.push({ role: 'user', content: trimmed })

      const res = await fetch('/api/clinical-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: history,
          patientContext,
          systemPrompt: CLINICIAN_SYSTEM_PROMPT,
        }),
      })

      if (!res.ok || !res.body) throw new Error('API error')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
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
            const parsed = JSON.parse(payload)
            if (parsed.text) {
              accumulated += parsed.text
              const current = accumulated
              setMessages((prev) =>
                prev.map((m) => (m.id === aiMsgId ? { ...m, content: current } : m)),
              )
            }
          } catch {}
        }
      }
    } catch (error) {
      const message = error instanceof DOMException && error.name === 'AbortError'
        ? 'The clinical AI request timed out. Please try again.'
        : 'Google AI is currently experiencing high demand. Please try again in a few seconds.'
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, content: message }
            : m,
        ),
      )
    } finally {
      window.clearTimeout(timeoutId)
      setIsLoading(false)
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100)
    }
  }, [input, isLoading, messages, patients, setMessages])

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Bot className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Clinical AI Assistant</h2>
          <p className="text-[0.68rem] text-muted-foreground">
            Full patient access · Unfiltered · Evidence-based
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {messages.length > 1 && (
            <button
              type="button"
              onClick={clearClinicalAiMessages}
              disabled={isLoading}
              title="Clear conversation history"
              className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[0.65rem] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RotateCcw className="size-3" />
              Reset Chat
            </button>
          )}
          <span className="flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-success">
            <span className="size-1.5 rounded-full bg-success animate-pulse" />
            Online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'clinician' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'clinician'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/60 border border-border/40 text-foreground'
              }`}
            >
              {msg.role === 'ai' && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="size-3 text-primary" />
                  <span className="text-[0.6rem] font-bold uppercase tracking-wider text-primary">Clinical AI</span>
                </div>
              )}
              <p className="text-xs leading-relaxed whitespace-pre-line">{msg.content}</p>
              {!msg.content && isLoading && (
                <div className="flex items-center gap-2 py-1">
                  <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Analyzing patient data...</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border/60 px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your patients..."
            className="flex-1 text-sm"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0">
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}
