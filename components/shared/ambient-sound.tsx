'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Self-contained calming ambient pad generated with the Web Audio API.
 * Soft, slow, low-passed detuned sines with a gentle volume swell — no assets.
 */
export function AmbientSound({ className }: { className?: string }) {
  const [on, setOn] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{ master: GainNode; stop: () => void } | null>(null)

  useEffect(() => {
    return () => {
      nodesRef.current?.stop()
      ctxRef.current?.close().catch(() => {})
    }
  }, [])

  function start() {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    ctxRef.current = ctx

    const master = ctx.createGain()
    master.gain.value = 0
    master.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 2.5)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 780
    filter.Q.value = 0.6
    filter.connect(master)
    master.connect(ctx.destination)

    // gentle chord (A2, E3, A3, C#4, E4) detuned for rich acoustic warmth
    const freqs = [110, 164.81, 220, 277.18, 329.63]
    const oscs = freqs.map((f, i) => {
      const o = ctx.createOscillator()
      o.type = i === 1 || i === 3 ? 'triangle' : 'sine'
      o.frequency.value = f
      o.detune.value = i % 2 === 0 ? -5 : 6
      const g = ctx.createGain()
      g.gain.value = i === 0 ? 0.6 : 0.38
      o.connect(g)
      g.connect(filter)
      o.start()
      return o
    })

    // slow LFO swelling the master gain like calm breathing
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.08
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.06
    lfo.connect(lfoGain)
    lfoGain.connect(master.gain)
    lfo.start()

    nodesRef.current = {
      master,
      stop: () => {
        try {
          master.gain.cancelScheduledValues(ctx.currentTime)
          master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2)
          setTimeout(() => {
            oscs.forEach((o) => o.stop())
            lfo.stop()
          }, 1300)
        } catch {
          /* noop */
        }
      },
    }
  }

  function toggle() {
    if (on) {
      nodesRef.current?.stop()
      nodesRef.current = null
      ctxRef.current?.close().catch(() => {})
      ctxRef.current = null
      setOn(false)
    } else {
      start()
      setOn(true)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Turn off calming sound' : 'Play calming sound'}
      title={on ? 'Calming sound on' : 'Play calming sound'}
      className={cn(
        'relative inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-card/70 text-muted-foreground transition-colors hover:text-foreground',
        on && 'border-primary/30 bg-primary/10 text-primary',
        className,
      )}
    >
      {on ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
      {on && (
        <span className="absolute -right-0.5 -top-0.5 flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/50" />
          <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
        </span>
      )}
    </button>
  )
}
