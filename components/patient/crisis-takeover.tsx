'use client'

import { PhoneCall, MessageSquare, ShieldAlert, X } from 'lucide-react'

export function CrisisTakeover({ onClose }: { onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative mx-4 w-full max-w-lg rounded-3xl border border-destructive/20 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-300 sm:p-8">
        
        {/* Close / Dismiss button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none"
            aria-label="Dismiss crisis modal and return to chat"
            title="Return to chat"
          >
            <X className="size-5" />
          </button>
        )}

        {/* Pulsing indicator */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex size-20 items-center justify-center rounded-full bg-destructive/10 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
          <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" />
          <ShieldAlert className="size-10 text-destructive relative z-10" />
        </div>

        <div className="mt-8 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground">You are not alone.</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We noticed you might be feeling deeply overwhelmed or hurting. Your life matters, and you do not have to navigate this darkness by yourself. 
            Free, confidential, human support is available right now.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href="tel:14416"
            className="group flex items-center justify-between rounded-2xl bg-destructive p-4 text-destructive-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-destructive/20"
          >
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-white/20">
                <PhoneCall className="size-5" />
              </div>
              <div className="text-left">
                <p className="font-bold">Tele-MANAS</p>
                <p className="text-xs text-white/80 font-medium">National Mental Health Helpline</p>
              </div>
            </div>
            <span className="font-display text-lg font-bold tracking-wider">14416</span>
          </a>

          <a
            href="tel:18005990019"
            className="group flex items-center justify-between rounded-2xl border-2 border-destructive/20 bg-card p-4 transition-all hover:border-destructive/40 hover:bg-destructive/5"
          >
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground">
                <PhoneCall className="size-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">KIRAN Helpline</p>
                <p className="text-xs text-muted-foreground font-medium">24/7 Toll-Free Support</p>
              </div>
            </div>
            <span className="font-display text-lg font-bold text-foreground tracking-wider">1800-599-0019</span>
          </a>

          <a
            href="sms:741741&body=HOME"
            className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50"
          >
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground">
                <MessageSquare className="size-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">Crisis Text Line</p>
                <p className="text-xs text-muted-foreground font-medium">Prefer texting? We are here.</p>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Text HOME to 741741</span>
          </a>
        </div>

        <div className="mt-6 rounded-xl bg-secondary/50 p-4 text-center">
          <p className="text-xs text-muted-foreground font-medium">
            If you are in immediate physical danger, please call <span className="font-bold text-foreground">112</span> or go to the nearest hospital emergency room.
          </p>
        </div>

        {onClose && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              I am safe, return to chat
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
