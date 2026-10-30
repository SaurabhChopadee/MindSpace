"use client"

interface BarChartProps {
  data: { label: string; value: number }[]
  max?: number
  height?: number
  className?: string
}

export function BarChart({ data, max = 5, height = 140, className }: BarChartProps) {
  if (!data || data.length === 0) return null

  return (
    <div className={className}>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => {
          const pct = Math.max(0.04, Math.min(1, d.value / max))
          return (
            <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2">
              <div className="flex w-full flex-1 items-end justify-center">
                <div
                  className="chart-bar w-full max-w-9 rounded-t-lg bg-primary/80 transition-all"
                  style={{ height: `${pct * 100}%` }}
                  title={`${d.label}: ${d.value.toFixed(1)}`}
                />
              </div>
              <span className="text-xs text-muted-foreground">{d.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
