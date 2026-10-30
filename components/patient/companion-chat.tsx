"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, LifeBuoy, Plus, SendHorizonal, Settings2, Mic, MicOff, Sparkles, Trash2 } from "lucide-react"
import Link from "next/link"
import { usePatientData } from "@/lib/patient-store"
import { SUGGESTED_PROMPTS } from "@/lib/mock-data"
import { clockTime, relativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import { CrisisTakeover } from "./crisis-takeover"
import { AISettingsDialog } from "./ai-settings-dialog"

export function CompanionChat() {
  const {
    conversations,
    startConversation,
    deleteConversation,
    sendMessage,
    isStreaming,
    isCrisisTriggered,
    setIsCrisisTriggered,
    persona,
    setPersona,
    apiKey,
    setApiKey,
    addFact,
    activeConversationId,
    setActiveConversationId,
  } = usePatientData()

  const router = useRouter()
  const active = conversations.find((c) => c.id === activeConversationId) ?? conversations[0]
  const [draft, setDraft] = useState("")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Agentic UI Action Execution & Memory Extraction
  useEffect(() => {
    if (!isStreaming && active?.messages.length > 0) {
      const lastMsg = active.messages[active.messages.length - 1]
      if (lastMsg.role === 'ai') {
        // UI Actions
        if (lastMsg.content.includes('[ACTION: OPEN_JOURNAL]')) {
          router.push('/patient/journal?new=true')
        } else if (lastMsg.content.includes('[ACTION: LOG_MOOD]')) {
          router.push('/patient')
        }
        
        // Fact Extraction
        const factMatch = lastMsg.content.match(/\[FACT:\s*(.+?)\]/)
        if (factMatch && factMatch[1]) {
          addFact(factMatch[1].trim())
        }
      }
    }
  }, [isStreaming, active, router, addFact])

  // Auto-scroll to bottom on new messages or streaming chunks
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: isStreaming ? "auto" : "smooth",
      })
    }
  }, [active?.messages, isStreaming])

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Setup Web Speech API for voice dictation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionCtor =
        window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognitionCtor) {
        const recognition = new SpeechRecognitionCtor()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = "en-US"

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript
          setDraft((prev) => (prev ? `${prev} ${transcript}` : transcript))
          setIsListening(false)
        }

        recognition.onerror = () => {
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }
  }, [])

  function toggleListening() {
    if (!recognitionRef.current) {
      alert("Voice input is not supported by your current browser. Try Chrome, Edge, or Safari.")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err) {
        console.error("Speech recognition start failed:", err)
      }
    }
  }

  async function submit(text: string) {
    const content = text.trim()
    if (!content || !active || isStreaming) return
    setDraft("")
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
    await sendMessage(active.id, content)
  }

  function handleNew() {
    startConversation()
  }

  const personaBadge: Record<string, string> = {
    gentle: "Gentle Listener",
    solutions: "Solution-Focused",
    mindfulness: "Grounding",
  }

  return (
    <div className="mx-auto flex h-[calc(100svh-3.5rem)] w-full max-w-6xl gap-0 lg:h-svh">
      {/* Conversation list */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border/60 bg-sidebar/60 md:flex">
        <div className="flex items-center justify-between px-5 py-5">
          <h2 className="font-serif text-lg text-foreground">Conversations</h2>
          <button
            type="button"
            onClick={handleNew}
            className="inline-flex size-8 items-center justify-center rounded-full bg-primary/12 text-primary transition-colors hover:bg-primary/20"
            aria-label="New conversation"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={cn(
                "group relative mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors",
                c.id === active?.id ? "bg-primary/12" : "hover:bg-sidebar-accent",
              )}
            >
              <button
                type="button"
                onClick={() => setActiveConversationId(c.id)}
                className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
              >
                <span className="truncate text-sm font-medium text-foreground">{c.title}</span>
                <span className="truncate text-xs text-muted-foreground">{relativeTime(c.updatedAt)}</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setConfirmingDeleteId(c.id)
                }}
                className="ml-1 inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus:opacity-100"
                aria-label={`Delete conversation ${c.title}`}
                title="Delete conversation"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat pane */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
              <Heart className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">Your companion</p>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium text-primary">
                  {personaBadge[persona] || "AI"}
                </span>
                {apiKey && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[0.65rem] text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="size-2.5" /> Gemini
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Always here, never judging</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {active && (
              <button
                type="button"
                onClick={() => setConfirmingDeleteId(active.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete this conversation"
                title="Delete current conversation"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="AI Companion Settings"
            >
              <Settings2 className="size-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              type="button"
              onClick={handleNew}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary md:hidden"
            >
              <Plus className="size-3.5" /> New
            </button>
          </div>
        </header>

        {/* Messages scroll area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {/* Messages */}
            {isCrisisTriggered && <CrisisTakeover onClose={() => setIsCrisisTriggered(false)} />}
            {active?.messages.map((m, idx) => {
              const isLastMessage = idx === active.messages.length - 1
              const isAiStreamingThis = isLastMessage && m.role === "ai" && isStreaming

              return (
                <div
                  key={m.id}
                  className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                      m.role === "user"
                        ? "rounded-br-md bg-primary text-primary-foreground shadow-sm"
                        : "rounded-bl-md bg-card text-card-foreground shadow-sm border border-border/40",
                    )}
                  >
                    {m.content.replace(/\[ACTION: (OPEN_JOURNAL|LOG_MOOD)\]/g, '').replace(/\[FACT:.*?\]/g, '').trim()}
                    {isAiStreamingThis && (
                      <span className="inline-block size-1.5 ml-1 animate-pulse rounded-full bg-primary" />
                    )}
                    {isAiStreamingThis && !m.content && (
                      <div className="flex items-center gap-1 py-1">
                        <Dot delay={0} />
                        <Dot delay={150} />
                        <Dot delay={300} />
                      </div>
                    )}
                  </div>
                  <span className="mt-1 px-1 text-[0.65rem] text-muted-foreground">
                    {clockTime(m.time)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-border/60 bg-background/80 px-4 py-4 backdrop-blur sm:px-8">
          <div className="mx-auto max-w-2xl">
            {active && active.messages.length <= 1 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => submit(p)}
                    disabled={isStreaming}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/8 disabled:opacity-50"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit(draft)
              }}
              className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-primary/40"
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                    e.preventDefault()
                    submit(draft)
                  }
                }}
                rows={1}
                disabled={isStreaming}
                placeholder={isListening ? "Listening... speak now" : "Share whatever is on your mind..."}
                className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />

              {/* Voice input button */}
              <button
                type="button"
                onClick={toggleListening}
                className={cn(
                  "inline-flex size-10 shrink-0 items-center justify-center rounded-xl transition-all",
                  isListening
                    ? "bg-destructive text-destructive-foreground animate-pulse shadow-md"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
                title={isListening ? "Listening... click to stop" : "Speak your message"}
              >
                {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </button>

              {/* Send button */}
              <button
                type="submit"
                disabled={!draft.trim() || isStreaming}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40"
                aria-label="Send message"
              >
                <SendHorizonal className="size-4" />
              </button>
            </form>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[0.7rem] text-muted-foreground">
              <LifeBuoy className="size-3 text-primary" />
              Your companion offers support, not medical advice. In a crisis,{" "}
              <Link href="/crisis" className="font-medium text-primary underline underline-offset-2">
                get emergency help now
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Companion Settings Modal */}
      <AISettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        persona={persona}
        onSavePersona={setPersona}
        apiKey={apiKey}
        onSaveApiKey={setApiKey}
      />

      {/* Delete Confirmation Modal */}
      {confirmingDeleteId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border/80 bg-card p-6 shadow-xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center gap-3 text-destructive">
              <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="size-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-foreground">Delete Conversation</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              Are you sure you want to delete this chat? All messages and history in this conversation will be permanently removed.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDeleteId(null)}
                className="rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const idToDelete = confirmingDeleteId
                  setConfirmingDeleteId(null)
                  if (idToDelete) {
                    deleteConversation(idToDelete)
                  }
                }}
                className="rounded-xl bg-destructive px-3.5 py-2 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Delete Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="size-2 animate-bounce rounded-full bg-muted-foreground/50"
      style={{ animationDelay: `${delay}ms`, animationDuration: "1s" }}
    />
  )
}
