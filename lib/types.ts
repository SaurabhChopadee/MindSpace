



export type Role = 'patient' | 'psychiatrist'

export type MoodKey = 'great' | 'good' | 'okay' | 'low' | 'verylow'

export interface MoodOption {
  key: MoodKey
  label: string
  value: number // 5..1
  face: string // simple glyph used sparingly for expression
  color: string // css var token name
}

export interface MoodEntry {
  id: string
  date: string // ISO date
  mood: MoodKey
  value: number
  emotions: string[]
  intensity: number // 1..10
  note?: string
}

export interface JournalEntry {
  id: string
  date: string
  title: string
  body: string
  mood?: MoodKey
  tags: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  time: string // ISO
}

export interface Conversation {
  id: string
  title: string
  updatedAt: string
  messages: ChatMessage[]
}

export interface PatientUser {
  id: string
  name: string
  firstName: string
  email: string
  age: number
  avatarTone: string
}

export interface TimelineEvent {
  id: string
  date: string
  kind: 'observed' | 'reported' | 'ai' | 'note' | 'alert'
  title: string
  detail: string
}

export interface RiskSignal {
  id: string
  level: 'info' | 'watch' | 'elevated'
  label: string
  detail: string
  date: string
}

export interface ClinicianNote {
  id: string
  date: string
  author: string
  body: string
}

export interface PatientRecord {
  id: string
  name: string
  firstName: string
  age: number
  pronouns: string
  avatarTone: string
  status: 'stable' | 'improving' | 'needs-review' | 'new'
  connection: 'connected' | 'invited'
  connectedSince: string
  lastCheckIn: string
  currentMood: MoodKey
  moodValue: number
  trend7: number[]
  trend30: number[]
  variability: number // 0..100
  emotions: { label: string; weight: number }[]
  themes: string[]
  activity: { label: string; count: number; total: number }[]
  concerns: string[]
  timeline: TimelineEvent[]
  risks: RiskSignal[]
  aiSummary: string
  notes: ClinicianNote[]
  conversationContext: { speaker: 'patient' | 'companion'; text: string; time?: string; crisis?: boolean }[]
  progress: number // 0..100
  liveMoods?: MoodEntry[]
}

export interface Resource {
  id: string
  category: string
  title: string
  description: string
  minutes: number
  format: 'Article' | 'Practice' | 'Audio' | 'Guide'
  tone: string
}
