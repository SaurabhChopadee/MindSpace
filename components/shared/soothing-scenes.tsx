'use client'

import { Flower2, Leaf, Waves } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const scenes = [
  { id: 'blossom', label: 'Cherry blossom', icon: Flower2, className: 'scene-blossom' },
  { id: 'golden', label: 'Golden evening', icon: Leaf, className: 'scene-golden' },
  { id: 'waves', label: 'Quiet waves', icon: Waves, className: 'scene-waves' },
]

export function SoothingScenes({ className }: { className?: string }) {
  const [active, setActive] = useState('blossom')
  const scene = scenes.find((entry) => entry.id === active) ?? scenes[0]
  return <div className={cn('soothing-scenes', scene.className, className)} aria-label="Soothing visual atmosphere">
    <div className="scene-particles" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <span key={index} style={{ '--i': index } as React.CSSProperties} />)}</div>
    <div className="scene-content"><p className="scene-kicker">A moment to settle</p><h2>{scene.label}</h2><p>Choose a gentle atmosphere while you reflect, write, or breathe.</p></div>
    <div className="scene-switcher" role="group" aria-label="Choose atmosphere">{scenes.map((entry) => <button key={entry.id} type="button" onClick={() => setActive(entry.id)} className={cn(active === entry.id && 'active')} aria-label={`Use ${entry.label} atmosphere`} aria-pressed={active === entry.id}><entry.icon className="size-4" /></button>)}</div>
  </div>
}
