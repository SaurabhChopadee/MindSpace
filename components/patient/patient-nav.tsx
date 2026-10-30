'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  MessageCircleHeart,
  NotebookPen,
  Library,
  MapPin,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { Wordmark } from '@/components/brand/logo'
import { Avatar } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { EnvironmentSelectorDialog } from '@/components/shared/environment-selector'
import { useSession } from '@/lib/session'
import { useEnvironment } from '@/lib/environment-store'
import { CURRENT_PATIENT } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const items = [
  { href: '/patient', label: 'Home', icon: Home },
  { href: '/patient/companion', label: 'Companion', icon: MessageCircleHeart },
  { href: '/patient/journal', label: 'Journal', icon: NotebookPen },
  { href: '/patient/resources', label: 'Resources', icon: Library },
  { href: '/patient/support', label: 'Support', icon: MapPin },
]

function useActive() {
  const pathname = usePathname()
  return (href: string) => (href === '/patient' ? pathname === href : pathname.startsWith(href))
}

export function PatientSidebar() {
  const isActive = useActive()
  const { logout, patientName } = useSession()
  const { activeTheme } = useEnvironment()
  const router = useRouter()
  const [envOpen, setEnvOpen] = useState(false)

  return (
    <>
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar/95 px-4 py-6 backdrop-blur-md lg:flex">
        <div className="flex items-center justify-between px-2">
          <Wordmark />
          <ThemeToggle />
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {items.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all',
                  active
                    ? 'bg-primary/15 text-primary shadow-sm'
                    : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )}
              >
                <item.icon className={cn('size-4 transition-transform group-hover:scale-110', active && 'text-primary')} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Atmosphere & Sound Customizer Button */}
        <button
          type="button"
          onClick={() => setEnvOpen(true)}
          className="my-2 flex items-center justify-between rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: activeTheme.accentColor }}
            />
            <Sparkles className="size-3.5" />
            <span>Atmosphere</span>
          </span>
          <span className="text-[0.68rem] font-semibold opacity-90">{activeTheme.name.split(' ')[0]}</span>
        </button>

        {/* Member Profile Footer */}
        <div className="mt-2 flex flex-col gap-3 border-t border-border/60 pt-4">
          <Link
            href="/patient/profile"
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-sidebar-accent"
          >
            <Avatar name={patientName || CURRENT_PATIENT.name} tone={CURRENT_PATIENT.avatarTone} className="size-9" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-semibold text-sidebar-foreground">
                {patientName || CURRENT_PATIENT.name}
              </span>
              <span className="truncate text-[0.65rem] text-muted-foreground">My Member Profile</span>
            </span>
          </Link>

          <div className="flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => {
                logout()
                router.push('/')
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <EnvironmentSelectorDialog open={envOpen} onClose={() => setEnvOpen(false)} />
    </>
  )
}

export function PatientMobileBar() {
  const isActive = useActive()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border/60 bg-card/95 px-1 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-md lg:hidden">
      {items.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 rounded-lg py-1 text-[0.62rem] font-semibold transition-colors',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <item.icon className={cn('size-4', active && 'scale-110 text-primary')} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function PatientMobileHeader() {
  const { patientName } = useSession()
  const [envOpen, setEnvOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/90 px-4 py-2.5 backdrop-blur-md lg:hidden">
        <Wordmark />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setEnvOpen(true)}
            className="rounded-full border border-border p-1.5 text-primary hover:bg-secondary"
            title="Atmosphere & Sound"
            aria-label="Atmosphere & Sound"
          >
            <Sparkles className="size-4" />
          </button>
          <Link href="/patient/profile">
            <Avatar name={patientName || CURRENT_PATIENT.name} tone={CURRENT_PATIENT.avatarTone} className="size-8" />
          </Link>
        </div>
      </header>
      <EnvironmentSelectorDialog open={envOpen} onClose={() => setEnvOpen(false)} />
    </>
  )
}

export function PatientGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { patientAuthed, authLoading } = useSession()

  useEffect(() => {
    if (!authLoading && !patientAuthed) {
      router.replace('/')
    }
  }, [patientAuthed, authLoading, router])

  if (authLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground text-xs">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Restoring session...</span>
        </div>
      </div>
    )
  }

  if (!patientAuthed) return null
  return <>{children}</>
}
