import { ANCHOR } from './mock-data'

const DAY = 86400000

export function relativeDay(iso: string): string {
  const d = new Date(iso)
  const a = new Date(ANCHOR)
  const startA = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  const startD = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diff = Math.round((startA - startD) / DAY)
  if (diff <= 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  if (diff < 14) return 'Last week'
  if (diff < 30) return `${Math.round(diff / 7)} weeks ago`
  return `${Math.round(diff / 30)} months ago`
}

export function relativeTime(iso: string): string {
  const d = new Date(iso)
  const diffH = Math.round((ANCHOR.getTime() - d.getTime()) / 3600000)
  if (diffH < 1) return 'Just now'
  if (diffH < 24) return `${diffH}h ago`
  return relativeDay(iso)
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
