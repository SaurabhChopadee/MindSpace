'use client'

import { useState, useId, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { MOOD_OPTIONS, moodByKey } from '@/lib/mock-data'
import type { MoodEntry, MoodKey } from '@/lib/types'
import { cn } from '@/lib/utils'

export type ChartTimeRange = '7d' | '4w' | '6m'

interface InteractiveMoodChartProps {
  moods: MoodEntry[]
  title?: string
  subtitle?: string
  height?: number
  showRangeSelector?: boolean
  className?: string
  badgeLabel?: string
}

export interface ProcessedPoint {
  id: string
  date: string
  value: number
  moodKey: MoodKey
  isWeeklyAggregate: boolean
  weekLabel?: string
  checkInCount?: number
  emotions: string[]
  note?: string
  formattedDate: string
  formattedTime: string
  x: number
  y: number
}

export function InteractiveMoodChart({
  moods,
  title = 'Mood Trend',
  subtitle = 'Observed pattern based on member check-ins',
  height = 195,
  showRangeSelector = true,
  className,
  badgeLabel = 'Member-Reported',
}: InteractiveMoodChartProps) {
  const [timeRange, setTimeRange] = useState<ChartTimeRange>('7d')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const chartId = useId()

  // Chart dimensions & SVG geometry
  const paddingX = 44
  const paddingY = 24
  const width = 640
  const chartWidth = width - paddingX * 2
  const chartHeight = height - paddingY * 2

  // Process data points according to time range
  const { points, emptyMessage, insufficientNotice } = useMemo(() => {
    if (!moods || moods.length === 0) {
      return {
        points: [] as ProcessedPoint[],
        emptyMessage: 'No check-in entries recorded yet.',
        insufficientNotice: null,
      }
    }

    const now = new Date()

    if (timeRange === '7d' || timeRange === '4w') {
      const days = timeRange === '7d' ? 7 : 28
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

      // Filter and sort chronologically (oldest to newest)
      const filtered = moods
        .filter((m) => {
          const d = new Date(m.date)
          return !isNaN(d.getTime()) && d >= cutoff
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      if (filtered.length === 0) {
        return {
          points: [] as ProcessedPoint[],
          emptyMessage:
            timeRange === '7d'
              ? 'No mood check-ins recorded in the last 7 days.'
              : 'No mood check-ins recorded in the last 4 weeks.',
          insufficientNotice: null,
        }
      }

      const count = filtered.length
      const step = count > 1 ? chartWidth / (count - 1) : chartWidth / 2

      const mappedPoints: ProcessedPoint[] = filtered.map((entry, idx) => {
        const x = paddingX + (count > 1 ? idx * step : chartWidth / 2)
        const normalized = Math.max(1, Math.min(5, entry.value))
        const y = paddingY + chartHeight - ((normalized - 1) / 4) * chartHeight
        const d = new Date(entry.date)

        return {
          id: entry.id,
          date: entry.date,
          value: entry.value,
          moodKey: entry.mood,
          isWeeklyAggregate: false,
          emotions: entry.emotions || [],
          note: entry.note,
          formattedDate: d.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          }),
          formattedTime: d.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
          }),
          x,
          y,
        }
      })

      return {
        points: mappedPoints,
        emptyMessage: null,
        insufficientNotice:
          count === 1
            ? '1 check-in recorded. Add a few more check-ins to view your full trend line.'
            : null,
      }
    }

    // 6 Months Range: Weekly Aggregation
    const cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    const inRange = moods
      .filter((m) => {
        const d = new Date(m.date)
        return !isNaN(d.getTime()) && d >= cutoff
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (inRange.length === 0) {
      return {
        points: [] as ProcessedPoint[],
        emptyMessage: 'No mood check-ins recorded in the last 6 months.',
        insufficientNotice: null,
      }
    }

    // Group into 7-day intervals (weekly buckets)
    const weeklyBuckets: { [weekKey: string]: MoodEntry[] } = {}
    inRange.forEach((m) => {
      const d = new Date(m.date)
      // Use calendar week key (Year + WeekNumber)
      const startOfYear = new Date(d.getFullYear(), 0, 1)
      const dayDiff = Math.floor((d.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
      const weekNum = Math.ceil((dayDiff + startOfYear.getDay() + 1) / 7)
      const key = `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`

      if (!weeklyBuckets[key]) weeklyBuckets[key] = []
      weeklyBuckets[key].push(m)
    })

    const sortedWeeks = Object.keys(weeklyBuckets).sort()

    if (sortedWeeks.length < 2) {
      // If only 1 week has data across 6 months, render that single weekly point with honest notice
      const onlyWeek = weeklyBuckets[sortedWeeks[0]]
      const avg = onlyWeek.reduce((sum, item) => sum + item.value, 0) / onlyWeek.length
      const moodKey: MoodKey =
        avg >= 4.5 ? 'great' : avg >= 3.5 ? 'good' : avg >= 2.5 ? 'okay' : avg >= 1.5 ? 'low' : 'verylow'
      const firstDate = new Date(onlyWeek[0].date)
      const lastDate = new Date(onlyWeek[onlyWeek.length - 1].date)
      const weekLabel = `${firstDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${lastDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`

      const x = paddingX + chartWidth / 2
      const y = paddingY + chartHeight - ((Math.max(1, Math.min(5, avg)) - 1) / 4) * chartHeight

      return {
        points: [
          {
            id: sortedWeeks[0],
            date: onlyWeek[0].date,
            value: Number(avg.toFixed(1)),
            moodKey,
            isWeeklyAggregate: true,
            weekLabel,
            checkInCount: onlyWeek.length,
            emotions: Array.from(new Set(onlyWeek.flatMap((item) => item.emotions || []))).slice(0, 4),
            formattedDate: weekLabel,
            formattedTime: 'Weekly Average',
            x,
            y,
          },
        ],
        emptyMessage: null,
        insufficientNotice:
          '1 week of data available. Check in consistently over coming weeks to reveal your 6-month rhythms.',
      }
    }

    const step = chartWidth / (sortedWeeks.length - 1)

    const mappedPoints: ProcessedPoint[] = sortedWeeks.map((weekKey, idx) => {
      const weekMoods = weeklyBuckets[weekKey]
      const avgVal = weekMoods.reduce((acc, cur) => acc + cur.value, 0) / weekMoods.length
      const normalized = Math.max(1, Math.min(5, avgVal))
      const x = paddingX + idx * step
      const y = paddingY + chartHeight - ((normalized - 1) / 4) * chartHeight

      const moodKey: MoodKey =
        avgVal >= 4.5 ? 'great' : avgVal >= 3.5 ? 'good' : avgVal >= 2.5 ? 'okay' : avgVal >= 1.5 ? 'low' : 'verylow'

      const firstDate = new Date(weekMoods[0].date)
      const lastDate = new Date(weekMoods[weekMoods.length - 1].date)
      const weekLabel = `${firstDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${lastDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`

      const allEmotions = Array.from(new Set(weekMoods.flatMap((m) => m.emotions || []))).slice(0, 4)

      return {
        id: weekKey,
        date: weekMoods[weekMoods.length - 1].date,
        value: Number(avgVal.toFixed(1)),
        moodKey,
        isWeeklyAggregate: true,
        weekLabel,
        checkInCount: weekMoods.length,
        emotions: allEmotions,
        formattedDate: weekLabel,
        formattedTime: 'Weekly Average',
        x,
        y,
      }
    })

    return {
      points: mappedPoints,
      emptyMessage: null,
      insufficientNotice: null,
    }
  }, [moods, timeRange, chartWidth, chartHeight, paddingX, paddingY])

  // Smooth SVG Bezier Path
  const pathD = useMemo(() => {
    if (points.length < 2) return ''
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]
      const cpx1 = current.x + (next.x - current.x) / 3
      const cpy1 = current.y
      const cpx2 = current.x + ((next.x - current.x) * 2) / 3
      const cpy2 = next.y
      d += ` C ${cpx1.toFixed(1)} ${cpy1.toFixed(1)}, ${cpx2.toFixed(1)} ${cpy2.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`
    }
    return d
  }, [points])

  // Subtle Area Under Curve
  const areaD = useMemo(() => {
    if (!pathD || points.length < 2) return ''
    const lastX = points[points.length - 1].x
    const firstX = points[0].x
    const bottomY = paddingY + chartHeight
    return `${pathD} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`
  }, [pathD, points, paddingY, chartHeight])

  const hoveredPoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null

  return (
    <Card className={cn('p-5 overflow-hidden', className)}>
      {/* Header with Title, Badge, and Range Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>
            {badgeLabel && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-semibold text-primary">
                {badgeLabel}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>

        {showRangeSelector && (
          <div className="inline-flex rounded-full border border-border bg-secondary/50 p-1 self-start sm:self-auto">
            {(['7d', '4w', '6m'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setTimeRange(r)
                  setHoveredIndex(null)
                }}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-all',
                  timeRange === r
                    ? 'bg-card text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {r === '7d' ? '7 Days' : r === '4w' ? '4 Weeks' : '6 Months'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Chart Area */}
      {points.length === 0 ? (
        <div className="mt-6 flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{emptyMessage}</p>
          <p className="mt-1 max-w-sm leading-relaxed">
            Record a mood check-in to begin establishing your personal rhythm and insights.
          </p>
        </div>
      ) : (
        <div className="relative mt-4 w-full">
          {/* Active Hover Tooltip */}
          {hoveredPoint && (
            <div
              className="pointer-events-none absolute z-20 -top-2 flex -translate-x-1/2 flex-col items-center transition-all duration-150"
              style={{
                left: `${(hoveredPoint.x / width) * 100}%`,
              }}
            >
              <div className="rounded-xl border border-border/80 bg-popover px-3.5 py-2.5 text-xs shadow-xl backdrop-blur-md">
                {hoveredPoint.isWeeklyAggregate ? (
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <span className="text-base">{moodByKey(hoveredPoint.moodKey).face}</span>
                      <span>Weekly Avg: {hoveredPoint.value} / 5</span>
                      <span className="text-[0.68rem] text-muted-foreground">
                        ({moodByKey(hoveredPoint.moodKey).label})
                      </span>
                    </div>
                    <div className="mt-1 text-[0.68rem] text-muted-foreground">
                      {hoveredPoint.weekLabel} · {hoveredPoint.checkInCount} check-in{hoveredPoint.checkInCount === 1 ? '' : 's'}
                    </div>
                    {hoveredPoint.emotions.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {hoveredPoint.emotions.map((e) => (
                          <span
                            key={e}
                            className="rounded-full bg-secondary/80 px-2 py-0.5 text-[0.62rem] font-medium text-secondary-foreground"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <span className="text-base">{moodByKey(hoveredPoint.moodKey).face}</span>
                      <span>{moodByKey(hoveredPoint.moodKey).label}</span>
                      <span className="text-[0.68rem] font-normal text-muted-foreground">
                        ({hoveredPoint.value}/5)
                      </span>
                    </div>
                    <div className="mt-1 text-[0.68rem] text-muted-foreground">
                      {hoveredPoint.formattedDate} · {hoveredPoint.formattedTime}
                    </div>
                    {hoveredPoint.emotions.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {hoveredPoint.emotions.map((e) => (
                          <span
                            key={e}
                            className="rounded-full bg-secondary/80 px-2 py-0.5 text-[0.62rem] font-medium text-secondary-foreground"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    )}
                    {hoveredPoint.note && (
                      <p className="mt-1.5 max-w-[15rem] truncate text-[0.68rem] text-foreground/85 italic">
                        {`"${hoveredPoint.note}"`}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="size-1.5 rotate-45 border-r border-b border-border bg-popover" />
            </div>
          )}

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full overflow-visible touch-none"
            aria-label={`Mood trend graph for ${timeRange}`}
          >
            <defs>
              <linearGradient id={`mood-area-grad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
                <stop offset="85%" stopColor="var(--primary)" stopOpacity="0.02" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Subtle Grid Guidelines for Mood Tiers (1 to 5) */}
            {[5, 4, 3, 2, 1].map((val) => {
              const y = paddingY + chartHeight - ((val - 1) / 4) * chartHeight
              const tierOption = MOOD_OPTIONS.find((m) => m.value === val)
              return (
                <g key={val} className="opacity-40">
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="var(--border)"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-muted-foreground text-[9px] font-medium"
                  >
                    {tierOption?.face}
                  </text>
                </g>
              )
            })}

            {/* Area Fill under line */}
            {areaD && <path d={areaD} fill={`url(#mood-area-grad-${chartId})`} />}

            {/* Line Path */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Points */}
            {points.map((pt, i) => {
              const isHovered = hoveredIndex === i
              return (
                <g key={pt.id || i} className="cursor-pointer">
                  {/* Invisible enlarged hit target for touch & click */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={18}
                    fill="transparent"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onTouchStart={() => setHoveredIndex(i)}
                  />
                  {/* Outer ring */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 7 : pt.isWeeklyAggregate ? 5 : 4.5}
                    className={cn(
                      'transition-all duration-200 fill-card stroke-primary',
                      isHovered ? 'stroke-[3px]' : 'stroke-2',
                    )}
                  />
                  {/* Inner center dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 3 : 2}
                    fill="var(--primary)"
                  />
                </g>
              )
            })}
          </svg>

          {/* Time axis labels */}
          <div className="mt-1.5 flex justify-between px-10 text-[0.68rem] text-muted-foreground">
            <span>{points.length > 0 ? points[0].formattedDate : ''}</span>
            <span className="font-medium text-foreground/75">
              {timeRange === '7d'
                ? 'Daily Check-ins (7 Days)'
                : timeRange === '4w'
                ? 'Daily Progression (4 Weeks)'
                : 'Weekly Averages (6 Months)'}
            </span>
            <span>{points.length > 0 ? points[points.length - 1].formattedDate : ''}</span>
          </div>

          {/* Notice when data is minimal */}
          {insufficientNotice && (
            <p className="mt-2 text-center text-[0.7rem] text-muted-foreground italic">
              {insufficientNotice}
            </p>
          )}
        </div>
      )}
    </Card>
  )
}

