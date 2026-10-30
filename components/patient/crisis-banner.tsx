"use client"

import { AlertTriangle, LifeBuoy, PhoneCall, MessageSquare, X } from "lucide-react"
import Link from "next/link"

interface CrisisBannerProps {
  onDismiss?: () => void
}

export function CrisisBanner({ onDismiss }: CrisisBannerProps) {
  return (
    <div
      role="alert"
      className="my-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-foreground shadow-sm transition-all animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-destructive">
          <AlertTriangle className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-destructive">
              Immediate Care & Crisis Support
            </h3>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/15 hover:text-foreground"
                aria-label="Dismiss crisis alert"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            We noticed you might be feeling deeply overwhelmed or hurting. Your life matters, and you
            do not have to navigate this darkness by yourself. Free, confidential, 24/7 human support is available right now:
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href="tel:988"
              className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <PhoneCall className="size-3.5" /> Call or Text 988
            </a>
            <a
              href="sms:741741&body=HOME"
              className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-destructive/10"
            >
              <MessageSquare className="size-3.5" /> Text HOME to 741741
            </a>
            <Link
              href="/crisis"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              <LifeBuoy className="size-3.5" /> More Hotlines & Safety Plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

