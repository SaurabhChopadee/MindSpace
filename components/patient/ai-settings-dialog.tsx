"use client"

import { useState } from "react"
import { Key, Settings2, Sparkles, X, Eye, EyeOff, ShieldCheck } from "lucide-react"
import type { CompanionPersona } from "@/lib/ai-service"

interface AISettingsDialogProps {
  open: boolean
  onClose: () => void
  persona: CompanionPersona
  onSavePersona: (persona: CompanionPersona) => void
  apiKey: string
  onSaveApiKey: (key: string) => void
}

export function AISettingsDialog({
  open,
  onClose,
  persona,
  onSavePersona,
  apiKey,
  onSaveApiKey,
}: AISettingsDialogProps) {
  // Reset local state when the dialog reopens by using `open` as a key signal.
  // We avoid useEffect + setState by using initializers that re-run on remount.
  // The parent should key this component on `open` or we track it manually:
  const [prevOpen, setPrevOpen] = useState(open)
  const [localKey, setLocalKey] = useState(apiKey)
  const [localPersona, setLocalPersona] = useState<CompanionPersona>(persona)
  const [showKey, setShowKey] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)

  // Sync props → local state when dialog transitions to open (no effect needed)
  if (open && !prevOpen) {
    setLocalKey(apiKey)
    setLocalPersona(persona)
  }
  if (open !== prevOpen) {
    setPrevOpen(open)
  }

  if (!open) return null

  function handleSave() {
    onSaveApiKey(localKey.trim())
    onSavePersona(localPersona)
    setSavedMessage(true)
    setTimeout(() => {
      setSavedMessage(false)
      onClose()
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <Settings2 className="size-4" />
            </span>
            <h2 className="font-serif text-lg text-foreground">Companion Settings</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Close settings"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {/* Companion Style Selection */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Companion Tone & Approach
            </label>
            <div className="mt-2 grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setLocalPersona('gentle')}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                  localPersona === 'gentle'
                    ? 'border-primary bg-primary/8 ring-1 ring-primary/30'
                    : 'border-border bg-card hover:border-border/80 hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-center gap-2 font-medium text-sm text-foreground">
                  <span>🌸 Gentle Listener</span>
                  {localPersona === 'gentle' && (
                    <span className="text-[0.65rem] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Holds space, validates emotions with deep empathy, and never pushes you.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLocalPersona('solutions')}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                  localPersona === 'solutions'
                    ? 'border-primary bg-primary/8 ring-1 ring-primary/30'
                    : 'border-border bg-card hover:border-border/80 hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-center gap-2 font-medium text-sm text-foreground">
                  <span>🌱 Solution-Focused</span>
                  {localPersona === 'solutions' && (
                    <span className="text-[0.65rem] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Empathizes first, then gently helps break overwhelm into one small, manageable step.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLocalPersona('mindfulness')}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                  localPersona === 'mindfulness'
                    ? 'border-primary bg-primary/8 ring-1 ring-primary/30'
                    : 'border-border bg-card hover:border-border/80 hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-center gap-2 font-medium text-sm text-foreground">
                  <span>🌊 Grounding & Mindfulness</span>
                  {localPersona === 'mindfulness' && (
                    <span className="text-[0.65rem] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Focuses on present-moment somatic grounding, breath pacing, and nervous system calm.
                </p>
              </button>
            </div>
          </div>

          {/* Gemini API Key */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Google Gemini API Key (Optional)
              </label>
              <span className="text-[0.7rem] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="size-3 text-emerald-500" /> Stored locally in browser
              </span>
            </div>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Key className="size-4" />
              </div>
              <input
                type={showKey ? "text" : "password"}
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="AIzaSy... (leave blank for local CBT engine)"
                className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-10 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                aria-label={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-[0.7rem] text-muted-foreground leading-relaxed">
              If left empty, MindSpace runs using the intelligent offline CBT engine. You can also get a free key from{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline hover:opacity-80"
              >
                Google AI Studio
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <Sparkles className="size-3.5" />
            {savedMessage ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  )
}

