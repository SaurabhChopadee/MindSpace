'use client'

import { createContext, useContext, useEffect, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  mounted: boolean
}

const THEME_STORAGE_KEY = 'mindspace_theme_preference'
const THEME_EVENT = 'mindspace-theme-change'

const emptySubscribe = () => () => {}

function getSavedTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      return saved
    }
  } catch {
    // Ignore storage errors
  }
  return 'dark'
}

function subscribeTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('storage', callback)
  window.addEventListener(THEME_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(THEME_EVENT, callback)
  }
}

function subscribeSystemTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getSystemIsDark(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const defaultThemeContext: ThemeContextType = {
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {},
  mounted: false,
}

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const theme = useSyncExternalStore(subscribeTheme, getSavedTheme, () => 'dark' as Theme)
  const systemIsDark = useSyncExternalStore(subscribeSystemTheme, getSystemIsDark, () => true)

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme

  // Apply theme class to documentElement
  useEffect(() => {
    const root = document.documentElement
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
  }, [resolvedTheme])

  const setTheme = (next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
      window.dispatchEvent(new Event(THEME_EVENT))
    } catch {
      // Ignore storage errors
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  return context || defaultThemeContext
}
