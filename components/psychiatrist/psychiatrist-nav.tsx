'use client'

import Link from 'next/link'
import { Bell, FileText, LayoutDashboard, LogOut, Users } from 'lucide-react'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Wordmark } from '@/components/brand/logo'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { useClinicianData } from '@/lib/clinician-store'
import { useSession } from '@/lib/session'
import { cn } from '@/lib/utils'

const items = [
  { href: '/psychiatrist', label: 'Overview', icon: LayoutDashboard },
  { href: '/psychiatrist/patients', label: 'Members', icon: Users },
  { href: '/psychiatrist/alerts', label: 'Alerts', icon: Bell },
  { href: '/psychiatrist/reports', label: 'Reports', icon: FileText },
]

export function PsychiatristSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useSession()
  const { activeClinician } = useClinicianData()

  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
      <div className="flex items-center justify-between px-2 [&_*]:text-sidebar-foreground">
        <Wordmark subtitle="Clinician" />
        <ThemeToggle className="border-sidebar-border bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-border" />
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Clinician navigation">
        {items.map((item) => {
          const active = item.href === '/psychiatrist' ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                  : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border pt-4">
        <div className="flex items-center gap-3 px-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-sidebar-primary/20 text-xs font-semibold text-sidebar-primary">
            {activeClinician.firstName.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-sidebar-foreground">{activeClinician.name}</p>
            <p className="truncate text-[0.65rem] text-sidebar-foreground/60">{activeClinician.title}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between px-2">
          <button
            type="button"
            onClick={() => {
              logout()
              router.push('/')
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}

export function PsychiatristMobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/90 px-4 py-2.5 backdrop-blur lg:hidden">
      <Wordmark subtitle="Clinician" />
      <ThemeToggle />
    </header>
  )
}

export function PsychiatristMobileBar() {
  const pathname = usePathname()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border/60 bg-sidebar px-2 pb-[env(safe-area-inset-bottom)] pt-2 lg:hidden">
      {items.map((item) => {
        const active = item.href === '/psychiatrist' ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[0.62rem] font-semibold text-sidebar-foreground/65',
              active && 'text-sidebar-primary',
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function ClinicianGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { clinicianAuthed, authLoading } = useSession()

  useEffect(() => {
    if (!authLoading && !clinicianAuthed) {
      router.replace('/')
    }
  }, [clinicianAuthed, authLoading, router])

  if (authLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground text-xs">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Verifying clinician session...</span>
        </div>
      </div>
    )
  }

  if (!clinicianAuthed) return null
  return <>{children}</>
}
