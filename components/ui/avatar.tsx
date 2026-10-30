import { cn } from '@/lib/utils'

export function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Avatar({
  name,
  tone,
  className,
}: {
  name: string
  tone?: string
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium text-primary-foreground select-none',
        'size-10 text-sm',
        className,
      )}
      style={{
        background: tone
          ? `linear-gradient(140deg, color-mix(in oklch, ${tone} 90%, white), ${tone})`
          : 'linear-gradient(140deg, var(--chart-2), var(--primary))',
      }}
    >
      {initials(name)}
    </span>
  )
}
