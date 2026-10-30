import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Wordmark } from '@/components/brand/logo'
import { cn } from '@/lib/utils'

export function AuthShell({
  children,
  variant = 'patient',
  quote,
  quoteAuthor,
  points,
}: {
  children: React.ReactNode
  variant?: 'patient' | 'clinical'
  quote: string
  quoteAuthor: string
  points: string[]
}) {
  const clinical = variant === 'clinical'
  return (
    <main className={cn('min-h-svh lg:grid lg:grid-cols-2', clinical && 'theme-clinical')}>
      {/* Brand / atmosphere panel */}
      <aside
        className={cn(
          'atmos grain relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between',
          clinical && 'atmos-clinical',
        )}
        style={{
          background: clinical
            ? 'linear-gradient(155deg, var(--sidebar), oklch(0.22 0.03 240))'
            : 'linear-gradient(160deg, oklch(0.96 0.03 155), oklch(0.93 0.04 175))',
        }}
      >
        <div
          aria-hidden="true"
          className="animate-drift pointer-events-none absolute -right-20 top-24 size-96 rounded-full opacity-50 blur-3xl"
          style={{ background: clinical ? 'oklch(0.62 0.1 210 / 0.4)' : 'oklch(0.72 0.09 165 / 0.4)' }}
        />
        <Wordmark
          subtitle={clinical ? 'Clinician' : undefined}
          className={clinical ? '[&_span]:text-sidebar-foreground' : ''}
        />
        <div className="relative max-w-md">
          <p
            className={cn(
              'text-balance font-display text-3xl font-medium leading-snug',
              clinical ? 'text-sidebar-foreground' : 'text-foreground',
            )}
          >
            {quote}
          </p>
          <p
            className={cn(
              'mt-4 text-sm font-medium',
              clinical ? 'text-sidebar-foreground/70' : 'text-muted-foreground',
            )}
          >
            {quoteAuthor}
          </p>
        </div>
        <ul className="relative flex flex-col gap-2.5">
          {points.map((p) => (
            <li
              key={p}
              className={cn(
                'flex items-center gap-2.5 text-sm',
                clinical ? 'text-sidebar-foreground/80' : 'text-foreground/75',
              )}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: clinical ? 'var(--sidebar-primary)' : 'var(--primary)' }}
              />
              {p}
            </li>
          ))}
        </ul>
      </aside>

      {/* Form panel */}
      <section className="flex min-h-svh flex-col px-5 py-8 sm:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <div className="lg:hidden">
            <Wordmark />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm animate-rise">{children}</div>
        </div>
      </section>
    </main>
  )
}
