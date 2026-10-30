'use client'

import { Moon, Sun, Laptop } from 'lucide-react'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme, mounted } = useTheme()

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light')
    else if (theme === 'light') setTheme('dark')
    else setTheme('system')
  }

  // Before hydration on client, render stable default dark button with matching dimensions
  if (!mounted) {
    return (
      <button
        type="button"
        suppressHydrationWarning
        className={cn(
          'relative inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-card/80 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          className,
        )}
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        <Moon className="size-4 text-sky" />
      </button>
    )
  }

  return (
    <button
      type="button"
      suppressHydrationWarning
      onClick={cycleTheme}
      className={cn(
        'relative inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-card/80 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
      aria-label={`Current theme is ${theme} (${resolvedTheme} active). Click to change.`}
      title={`Theme: ${theme} (${resolvedTheme})`}
    >
      {theme === 'system' ? (
        <Laptop className="size-4 transition-transform hover:rotate-12" />
      ) : resolvedTheme === 'dark' ? (
        <Moon className="size-4 text-sky transition-transform hover:-rotate-12" />
      ) : (
        <Sun className="size-4 text-amber transition-transform hover:rotate-45" />
      )}
    </button>
  )
}
