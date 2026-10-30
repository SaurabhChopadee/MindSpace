'use client'

import { useId } from 'react'

export function Sparkline({
  data,
  color = 'var(--primary)',
  height = 40,
  width = 120,
  min = 1,
  max = 5,
  strokeWidth = 2,
  fill = true,
}: {
  data: number[]
  color?: string
  height?: number
  width?: number
  min?: number
  max?: number
  strokeWidth?: number
  fill?: boolean
}) {
  const id = useId()
  if (data.length === 0) return null
  const range = max - min || 1
  const step = width / Math.max(1, data.length - 1)
  const points = data.map((v, i) => {
    const x = i * step
    const y = height - ((v - min) / range) * height
    return [x, Math.max(strokeWidth, Math.min(height - strokeWidth, y))] as const
  })
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#sg-${id})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r={strokeWidth + 0.5} fill={color} />
    </svg>
  )
}
