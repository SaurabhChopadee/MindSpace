'use client'

import { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  PATIENT_CONVERSATIONS,
  PATIENT_JOURNAL,
  PATIENT_MOODS,
} from './mock-data'
import type { ChatMessage, Conversation, JournalEntry, MoodEntry, MoodKey } from './types'
import { generateLocalResponse, evaluateCrisisIntent, type CompanionPersona } from './ai-service'
import {
  createBackendJournal,
  createBackendMood,
  createBackendConversation,
  createBackendMessage,
  updateBackendConversationTitle,
  deleteBackendConversation,
  deleteBackendJournal,
  fetchBackendJournal,
  fetchBackendMoods,
  fetchBackendConversations,
  fetchBackendMessages,
  isBackendAuthEnabled,
  updateBackendJournal,
} from './backend-api'

interface PatientStore {
  moods: MoodEntry[]
  journal: JournalEntry[]
  conversations: Conversation[]
  addMood: (entry: Omit<MoodEntry, 'id' | 'date'>) => void
  addJournal: (entry: Omit<JournalEntry, 'id' | 'date'>) => void
  updateJournal: (id: string, patch: Partial<JournalEntry>) => void
  deleteJournal: (id: string) => void
  startConversation: () => string
  clearConversations: () => string
  deleteConversation: (conversationId: string) => void
  sendMessage: (conversationId: string, content: string) => Promise<void>
  facts: string[]
  addFact: (fact: string) => void
  practicesDone: string[]
  togglePractice: (id: string) => void
  isStreaming: boolean
  isCrisisTriggered: boolean
  setIsCrisisTriggered: (val: boolean) => void
  persona: CompanionPersona
  setPersona: (p: CompanionPersona) => void
  apiKey: string
  setApiKey: (k: string) => void
  activeConversationId: string
  setActiveConversationId: (id: string) => void
}

const Ctx = createContext<PatientStore | null>(null)

let idc = 1000
const nid = (p: string) => `${p}-${Date.now()}-${++idc}`

const STORAGE_KEY = 'mindspace_patient_state_v1'

export function PatientDataProvider({ children }: { children: React.ReactNode }) {
  // Hydrate from localStorage via lazy initializers (no effect needed)
  const [savedState] = useState(() => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const isNewUser = typeof window !== 'undefined' && localStorage.getItem('mindspace_new_user') === 'true'

  const [moods, setMoods] = useState<MoodEntry[]>(
    savedState?.moods && Array.isArray(savedState.moods) ? savedState.moods : (isNewUser ? [] : PATIENT_MOODS),
  )
  const [journal, setJournal] = useState<JournalEntry[]>(
    savedState?.journal && Array.isArray(savedState.journal) ? savedState.journal : (isNewUser ? [] : PATIENT_JOURNAL),
  )
  const [conversations, setConversations] = useState<Conversation[]>(
    savedState?.conversations && Array.isArray(savedState.conversations)
      ? savedState.conversations
      : (isNewUser ? [{
          id: nid('c'),
          title: 'New Conversation',
          updatedAt: new Date().toISOString(),
          messages: [{ id: nid('m'), role: 'ai', content: 'Hi there. I am your MindSpace companion. How are you feeling today?', time: new Date().toISOString() }]
        }] : PATIENT_CONVERSATIONS),
  )
  const [facts, setFacts] = useState<string[]>(
    savedState?.facts && Array.isArray(savedState.facts) ? savedState.facts : []
  )
  const [practicesDone, setPracticesDone] = useState<string[]>(
    savedState?.practicesDone && Array.isArray(savedState.practicesDone)
      ? savedState.practicesDone
      : (isNewUser ? [] : ['breathing']),
  )
  const [isStreaming, setIsStreaming] = useState(false)
  const [isCrisisTriggered, setIsCrisisTriggered] = useState(false)
  const [persona, setPersona] = useState<CompanionPersona>(savedState?.persona || 'gentle')
  const [apiKey, setApiKey] = useState(savedState?.apiKey || '')
  const [activeConversationId, setActiveConversationIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('mindspace_active_conv_id') || ''
    }
    return ''
  })

  const setActiveConversationId = useCallback((id: string) => {
    setActiveConversationIdState(id)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mindspace_active_conv_id', id)
    }
  }, [])

  // Persist state to localStorage on updates
  useEffect(() => {
    try {
      const stateToSave = {
        moods,
        journal,
        conversations,
        practicesDone,
        persona,
        apiKey,
        facts,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
    } catch (e) {
      console.warn('Could not persist to localStorage:', e)
    }
  }, [moods, journal, conversations, practicesDone, persona, apiKey, facts])

  useEffect(() => {
    if (!isBackendAuthEnabled || typeof window === 'undefined' || !sessionStorage.getItem('mindspace_access_token')) return
    let active = true

    Promise.all([fetchBackendMoods(), fetchBackendJournal(), fetchBackendConversations()])
      .then(async ([backendMoods, backendJournal, backendConversations]) => {
        if (!active) return
        const conversationsWithMessages = await Promise.all(
          backendConversations.map(async (conversation) => ({
            id: String(conversation.id),
            title: conversation.title,
            updatedAt: conversation.updated_at,
            messages: (await fetchBackendMessages(conversation.id)).map((message) => ({
              id: String(message.id),
              role: message.sender_role === 'patient' ? 'user' as const : 'ai' as const,
              content: message.content,
              time: message.created_at,
            })),
          })),
        )
        if (!active) return
        startTransition(() => {
          setMoods(backendMoods.map((mood) => ({
            id: String(mood.id),
            date: mood.recorded_at,
            mood: mood.mood_label === 'overwhelmed' ? 'verylow' : mood.mood_label,
            value: mood.mood_score,
            emotions: [],
            intensity: mood.mood_score * 2,
            note: mood.notes ?? undefined,
          })))
          setJournal(backendJournal.map((entry) => ({
            id: String(entry.id),
            date: entry.entry_date,
            title: entry.title,
            body: entry.note,
            tags: [],
          })))
          if (conversationsWithMessages.length > 0) {
            setConversations(conversationsWithMessages)
          } else {
            // Do not wipe out conversations if current state has user messages!
            setConversations((prev) => {
              const hasUserMessages = prev.some((c) => c.messages.some((m) => m.role === 'user'))
              if (hasUserMessages) return prev
              const id = String(Date.now())
              return [{
                id,
                title: 'New conversation',
                updatedAt: new Date().toISOString(),
                messages: [{ id: 'msg-1', role: 'ai', content: 'Hi there. I am your MindSpace companion. How are you feeling today?', time: new Date().toISOString() }]
              }]
            })
          }
        })
      })
      .catch((error) => console.warn('Could not hydrate backend wellbeing data:', error))

    return () => {
      active = false
    }
  }, [])

  const addFact = useCallback((fact: string) => {
    setFacts((prev) => prev.includes(fact) ? prev : [...prev, fact])
  }, [])

  const addMood = useCallback((entry: Omit<MoodEntry, 'id' | 'date'>) => {
    const mood = { ...entry, id: nid('m'), date: new Date().toISOString() }
    setMoods((prev) => [mood, ...prev])
    if (isBackendAuthEnabled && typeof window !== 'undefined') {
      void createBackendMood({
        mood_label: mood.mood === 'verylow' ? 'overwhelmed' : mood.mood,
        mood_score: mood.value,
        notes: mood.note ?? null,
      }).catch((error) => console.warn('Could not sync mood entry:', error))
    }
  }, [])

  const addJournal = useCallback((entry: Omit<JournalEntry, 'id' | 'date'>) => {
    const journalEntry = { ...entry, id: nid('j'), date: new Date().toISOString() }
    setJournal((prev) => [journalEntry, ...prev])
    if (isBackendAuthEnabled && typeof window !== 'undefined') {
      void createBackendJournal({ title: journalEntry.title, note: journalEntry.body })
        .catch((error) => console.warn('Could not sync journal entry:', error))
    }
  }, [])

  const updateJournal = useCallback((id: string, patch: Partial<JournalEntry>) => {
    setJournal((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)))
    const entryId = Number(id)
    if (isBackendAuthEnabled && Number.isInteger(entryId) && typeof window !== 'undefined') {
      const current = journal.find((entry) => entry.id === id)
      if (current) {
        void updateBackendJournal(entryId, {
          title: patch.title ?? current.title,
          note: patch.body ?? current.body,
        }).catch((error) => console.warn('Could not sync journal update:', error))
      }
    }
  }, [journal])

  const deleteJournal = useCallback((id: string) => {
    setJournal((prev) => prev.filter((j) => j.id !== id))
    const entryId = Number(id)
    if (isBackendAuthEnabled && Number.isInteger(entryId) && typeof window !== 'undefined') {
      void deleteBackendJournal(entryId).catch((error) => console.warn('Could not sync journal deletion:', error))
    }
  }, [])

  const startConversation = useCallback(() => {
    // If the active conversation or the most recent one is already empty (only 1 AI greeting), reuse it
    let existingEmptyId = ''
    setConversations((prev) => {
      const emptyConv = prev.find((c) => c.messages.length <= 1 && c.messages.every((m) => m.role === 'ai'))
      if (emptyConv) {
        existingEmptyId = emptyConv.id
        return prev
      }
      const id = nid('conv')
      existingEmptyId = id
      const greeting: ChatMessage = {
        id: nid('msg'),
        role: 'ai',
        content:
          'Hi, I\u2019m your MindSpace companion. This is a calm, judgement-free space. What\u2019s on your mind today?',
        time: new Date().toISOString(),
      }
      return [
        { id, title: 'New conversation', updatedAt: new Date().toISOString(), messages: [greeting] },
        ...prev,
      ]
    })

    if (existingEmptyId) {
      setActiveConversationId(existingEmptyId)
    }
    return existingEmptyId
  }, [setActiveConversationId])

  const clearConversations = useCallback(() => {
    const id = nid('conv')
    const greeting: ChatMessage = {
      id: nid('msg'),
      role: 'ai',
      content:
        'Hi, I\u2019m your MindSpace companion. This is a calm, judgement-free space. What\u2019s on your mind today?',
      time: new Date().toISOString(),
    }
    const fresh = [
      { id, title: 'New conversation', updatedAt: new Date().toISOString(), messages: [greeting] },
    ]
    setConversations(fresh)
    setActiveConversationId(id)
    // Save new conversation to Firebase
    if (isBackendAuthEnabled && typeof window !== 'undefined') {
      void createBackendConversation({ id, title: 'New conversation' }).catch((e) => console.warn('Could not save conversation:', e))
    }
    return id
  }, [setActiveConversationId])

  const deleteConversation = useCallback(
    (conversationId: string) => {
      setConversations((prev) => {
        const remaining = prev.filter((c) => c.id !== conversationId)
        if (remaining.length === 0) {
          const freshId = nid('c')
          const greeting: ChatMessage = {
            id: nid('m'),
            role: 'ai',
            content: 'Hi there. I am your MindSpace companion. How are you feeling today?',
            time: new Date().toISOString(),
          }
          const fresh = [
            { id: freshId, title: 'New conversation', updatedAt: new Date().toISOString(), messages: [greeting] },
          ]
          setActiveConversationId(freshId)
          if (isBackendAuthEnabled && typeof window !== 'undefined') {
            void createBackendConversation({ id: freshId, title: 'New conversation' }).catch(() => {})
            void createBackendMessage({ conversationId: freshId, content: greeting.content, senderRole: 'ai' }).catch(() => {})
          }
          return fresh
        }
        if (activeConversationId === conversationId) {
          setActiveConversationId(remaining[0].id)
        }
        return remaining
      })
      if (isBackendAuthEnabled && typeof window !== 'undefined') {
        void deleteBackendConversation(conversationId).catch((e) => console.warn('Could not delete conversation:', e))
      }
    },
    [activeConversationId, setActiveConversationId],
  )

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      const trimmed = content.trim()
      if (!trimmed) return

      // Pre-screen for crisis locally to pop alert instantly
      const instantCrisis = evaluateCrisisIntent(trimmed)
      if (instantCrisis.isCrisis) {
        setIsCrisisTriggered(true)
      }

      const userMsg: ChatMessage = {
        id: nid('msg'),
        role: 'user',
        content: trimmed,
        time: new Date().toISOString(),
      }

      const aiMsgId = nid('msg')
      const initialAiMsg: ChatMessage = {
        id: aiMsgId,
        role: 'ai',
        content: '',
        time: new Date().toISOString(),
      }

      // Add user message and empty AI message
      const isNewTitle = conversations.find((c) => c.id === conversationId)?.title === 'New conversation'
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c
          return {
            ...c,
            title: c.title === 'New conversation' ? trimmed.slice(0, 40) : c.title,
            updatedAt: new Date().toISOString(),
            messages: [...c.messages, userMsg, initialAiMsg],
          }
        }),
      )

      // Save user message to Firebase
      if (isBackendAuthEnabled && typeof window !== 'undefined') {
        void createBackendMessage({ conversationId, content: trimmed, senderRole: 'patient' }).catch((e) => console.warn('Could not save user message:', e))
        if (isNewTitle) {
          void updateBackendConversationTitle(conversationId, trimmed.slice(0, 40)).catch((e) => console.warn('Could not update title:', e))
        }
      }

      setIsStreaming(true)

      try {
        // Collect conversation context
        const currentConv = conversations.find((c) => c.id === conversationId)
        const history = (currentConv?.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
        }))
        history.push({ role: 'user', content: trimmed })

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            persona,
            userApiKey: apiKey,
            facts,
          }),
        })

        if (!res.ok || !res.body) {
          throw new Error(`API responded with status: ${res.status}`)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let accumulatedText = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            const clean = line.trim()
            if (!clean.startsWith('data:')) continue
            const payloadStr = clean.slice(5).trim()

            if (payloadStr === '[DONE]') {
              break
            }

            try {
              const parsed = JSON.parse(payloadStr)
              if (parsed.crisis) {
                setIsCrisisTriggered(true)
              }
              if (parsed.text) {
                accumulatedText += parsed.text
                const currentText = accumulatedText
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id !== conversationId) return c
                    return {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === aiMsgId ? { ...m, content: currentText } : m,
                      ),
                    }
                  }),
                )
              }
            } catch {
              // Non-JSON SSE line, continue
            }
          }
        }
        // Save AI response to Firebase after streaming completes
        if (isBackendAuthEnabled && accumulatedText && typeof window !== 'undefined') {
          void createBackendMessage({ conversationId, content: accumulatedText, senderRole: 'ai' }).catch((e) => console.warn('Could not save AI message:', e))
        }
      } catch (err) {
        console.warn('Streaming failed, invoking local fallback engine:', err)
        const currentConv = conversations.find((c) => c.id === conversationId)
        const history = (currentConv?.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
        }))
        const fallback = generateLocalResponse(trimmed, history, persona)

        // Stream fallback locally word-by-word
        const words = fallback.split(' ')
        let currentText = ''
        for (let i = 0; i < words.length; i++) {
          currentText += words[i] + (i < words.length - 1 ? ' ' : '')
          const copy = currentText
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== conversationId) return c
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === aiMsgId ? { ...m, content: copy } : m,
                ),
              }
            }),
          )
          await new Promise((r) => setTimeout(r, 20))
        }
        // Save fallback response to Firebase too
        if (isBackendAuthEnabled && fallback && typeof window !== 'undefined') {
          void createBackendMessage({ conversationId, content: fallback, senderRole: 'ai' }).catch((e) => console.warn('Could not save fallback message:', e))
        }
      } finally {
        setIsStreaming(false)
      }
    },
    [conversations, facts, persona, apiKey],
  )

  const togglePractice = useCallback((id: string) => {
    setPracticesDone((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }, [])

  const value = useMemo<PatientStore>(
    () => ({
      moods,
      journal,
      conversations,
      facts,
      addMood,
      addJournal,
      updateJournal,
      deleteJournal,
      startConversation,
      clearConversations,
      deleteConversation,
      sendMessage,
      addFact,
      practicesDone,
      togglePractice,
      isStreaming,
      isCrisisTriggered,
      setIsCrisisTriggered,
      persona,
      setPersona,
      apiKey,
      setApiKey,
      activeConversationId,
      setActiveConversationId,
    }),
    [
      moods,
      journal,
      conversations,
      facts,
      addMood,
      addJournal,
      updateJournal,
      deleteJournal,
      startConversation,
      clearConversations,
      deleteConversation,
      sendMessage,
      addFact,
      practicesDone,
      togglePractice,
      isStreaming,
      isCrisisTriggered,
      setIsCrisisTriggered,
      persona,
      apiKey,
      activeConversationId,
      setActiveConversationId,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePatientData() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePatientData must be used within PatientDataProvider')
  return ctx
}

export type { MoodKey }
