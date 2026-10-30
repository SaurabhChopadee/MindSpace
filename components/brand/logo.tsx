import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-flex size-9 items-center justify-center rounded-[0.9rem]',
        className,
      )}
      style={{
        background: 'linear-gradient(150deg, var(--chart-2), var(--primary) 70%)',
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-5 text-primary-foreground">
        {/* organic mind-leaf mark */}
        <path
          d="M12 3.5c-3.2 2.1-5 4.7-5 7.9 0 2.9 2.2 5.1 5 5.1s5-2.2 5-5.1c0-3.2-1.8-5.8-5-7.9Z"
          fill="currentColor"
          opacity="0.92"
        />
        <path
          d="M12 8.5v9.5M12 12.5c1.3-.9 2.2-1 3.2-.8M12 14.6c-1.1-.8-1.9-.9-2.8-.7"
          stroke="var(--primary)"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export function Wordmark({
  className,
  markClassName,
  subtitle,
}: {
  className?: string
  markClassName?: string
  subtitle?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={markClassName} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          MindSpace
        </span>
        {subtitle ? (
          <span className="mt-0.5 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  )
}
