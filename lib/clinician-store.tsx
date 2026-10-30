'use client'

import { createContext, startTransition, useCallback, useContext, useMemo, useState, useEffect } from 'react'
import { PATIENTS, CLINICIANS, type ClinicianProfile } from './mock-data'
import type { PatientRecord, MoodEntry } from './types'
import { fetchBackendAssignedPatients, isBackendAuthEnabled, type BackendAssignedPatient } from './backend-api'
import { useSession } from './session'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

interface InviteCodeRecord {
  code: string
  clinicianId: string
  createdAt: string
  active: boolean
}

export interface ClinicalAIMessage {
  id: string
  role: 'clinician' | 'ai'
  content: string
  time: string
}

interface ClinicianStore {
  activeClinician: ClinicianProfile
  setActiveClinicianId: (id: string) => void
  allClinicians: ClinicianProfile[]
  patients: PatientRecord[] // Scoped to active clinician
  allPatients: PatientRecord[]
  activeInviteCodes: InviteCodeRecord[]
  generateInviteCode: () => string
  addPatient: (input: { name: string; email: string; age: number; pronouns: string }) => void
  getMemberLiveMoods: (memberId: string) => MoodEntry[]
  clinicalAiMessages: ClinicalAIMessage[]
  setClinicalAiMessages: React.Dispatch<React.SetStateAction<ClinicalAIMessage[]>>
  clearClinicalAiMessages: () => void
}

const ClinicianContext = createContext<ClinicianStore | null>(null)

const PATIENT_STORAGE_KEY = 'mindspace_patient_state_v1'

function mapBackendPatient(patient: BackendAssignedPatient): PatientRecord {
  const now = patient.last_checkin || new Date().toISOString()
  const firstName = patient.display_name.trim().split(/\s+/)[0] || 'Member'
  const currentMood = (patient.current_mood as PatientRecord['currentMood']) || 'okay'
  const moodScore = patient.mood_score || 3
  const trend7 =
    patient.trend7 && patient.trend7.length > 0
      ? patient.trend7
      : [moodScore, moodScore, moodScore, moodScore, moodScore, moodScore, moodScore]

  const mappedLiveMoods: MoodEntry[] = (patient.fullMoods || []).map((m) => ({
    id: `m-${m.id}`,
    date: m.recorded_at,
    mood: (m.mood_label === 'overwhelmed' ? 'verylow' : m.mood_label) as MoodEntry['mood'],
    value: m.mood_score,
    emotions: [],
    intensity: Math.round(m.mood_score * 2),
    note: m.notes ?? undefined,
  }))

  const trend30 = mappedLiveMoods.length > 0
    ? mappedLiveMoods.slice(0, 30).map((m) => m.value).reverse()
    : Array(30).fill(moodScore)

  return {
    id: `backend-${patient.id}`,
    name: patient.display_name,
    firstName,
    age: 0,
    pronouns: 'member',
    avatarTone: 'var(--chart-4)',
    status: patient.relationship_status === 'active' ? 'stable' : 'new',
    connection: 'connected',
    connectedSince: patient.connected_since || now,
    lastCheckIn: now,
    currentMood,
    moodValue: moodScore,
    trend7,
    trend30,
    liveMoods: mappedLiveMoods,
    variability: 0,
    emotions: [],
    themes: ['Active care relationship'],
    activity: [
      { label: 'Mood check-ins', count: mappedLiveMoods.length || patient.trend7?.length || 0, total: 30 },
      { label: 'Journal entries', count: 0, total: 30 },
      { label: 'Companion chats', count: 0, total: 30 },
      { label: 'Self-care practices', count: 0, total: 30 },
    ],
    concerns: [],
    timeline: [
      {
        id: `t-${patient.id}`,
        date: patient.connected_since || now,
        kind: 'note',
        title: 'Care relationship established',
        detail: 'Member linked to your clinical workspace via your invitation code.',
      },
    ],
    risks: [],
    aiSummary: `Connected member account: ${patient.email}. Observed wellbeing trends and check-in reports will update as the member uses MindSpace.`,
    notes: [],
    conversationContext: [],
    progress: Math.min(100, ((mappedLiveMoods.length || patient.trend7?.length || 0)) * 14),
  }
}

export function ClinicianDataProvider({ children }: { children: React.ReactNode }) {
  const session = useSession()
  const [activeClinicianId, setActiveClinicianId] = useState<string>('dr-mehta')
  const [patients, setPatients] = useState<PatientRecord[]>(PATIENTS)
  const [backendPatients, setBackendPatients] = useState<PatientRecord[] | null>(null)
  const [inviteCodes, setInviteCodes] = useState<InviteCodeRecord[]>([
    { code: 'MS-7K4P2', clinicianId: 'dr-mehta', createdAt: new Date().toISOString(), active: true },
    { code: 'MS-9M2X1', clinicianId: 'dr-kapoor', createdAt: new Date().toISOString(), active: true },
    { code: 'MS-3B8L5', clinicianId: 'dr-rao', createdAt: new Date().toISOString(), active: true },
  ])

  // Hydrate & synchronize live member data from localStorage
  const [liveMemberMoods, setLiveMemberMoods] = useState<MoodEntry[]>([])

  const DEFAULT_AI_WELCOME: ClinicalAIMessage = useMemo(() => ({
    id: 'welcome',
    role: 'ai',
    content: 'Clinical AI ready. I have access to your caseload telemetry, clinical protocols, and psychiatric reference data. How can I assist you today, Doctor?',
    time: new Date().toISOString(),
  }), [])

  const clinicianStorageId = session.clinicianAuthed
    ? (session.clinicianUid || session.clinicianName || activeClinicianId)
    : activeClinicianId

  const [loadedStorageId, setLoadedStorageId] = useState(clinicianStorageId)
  const [clinicalAiMessages, setClinicalAiMessages] = useState<ClinicalAIMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(`mindspace_clinical_ai_messages_${clinicianStorageId}`)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch {}
    }
    return [DEFAULT_AI_WELCOME]
  })

  // Adjust state during render when switching clinician ID (per official React docs)
  if (loadedStorageId !== clinicianStorageId) {
    setLoadedStorageId(clinicianStorageId)
    let nextMessages = [DEFAULT_AI_WELCOME]
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(`mindspace_clinical_ai_messages_${clinicianStorageId}`)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) nextMessages = parsed
        }
      } catch {}
    }
    setClinicalAiMessages(nextMessages)
  }

  // Persist clinical AI messages whenever they change
  useEffect(() => {
    try {
      if (clinicalAiMessages.length > 0) {
        localStorage.setItem(`mindspace_clinical_ai_messages_${clinicianStorageId}`, JSON.stringify(clinicalAiMessages))
      }
    } catch {}
  }, [clinicalAiMessages, clinicianStorageId])

  const clearClinicalAiMessages = useCallback(() => {
    const fresh: ClinicalAIMessage[] = [{
      id: 'welcome',
      role: 'ai',
      content: 'Clinical AI ready. I have access to your caseload telemetry, clinical protocols, and psychiatric reference data. How can I assist you today, Doctor?',
      time: new Date().toISOString(),
    }]
    setClinicalAiMessages(fresh)
    try {
      localStorage.setItem(`mindspace_clinical_ai_messages_${clinicianStorageId}`, JSON.stringify(fresh))
    } catch {}
  }, [clinicianStorageId])

  useEffect(() => {
    if (!isBackendAuthEnabled) return
    if (!session.clinicianAuthed) return

    fetchBackendAssignedPatients()
      .then((assignedPatients) => {
        startTransition(() => {
          setBackendPatients(assignedPatients.map(mapBackendPatient))
        })
      })
      .catch((error) => {
        console.warn('Could not load backend clinician roster:', error)
        startTransition(() => {
          setBackendPatients([])
        })
      })
  }, [session.clinicianAuthed])

  useEffect(() => {
    const syncMemberData = () => {
      try {
        const raw = localStorage.getItem(PATIENT_STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed.moods && Array.isArray(parsed.moods) && parsed.moods.length > 0) {
            setLiveMemberMoods(parsed.moods)

            // Synchronize Aanya Sharma's record with live check-ins
            const latest = parsed.moods[0]
            const trend7Values = parsed.moods.slice(0, 7).map((m: MoodEntry) => m.value).reverse()

            setPatients((prev) =>
              prev.map((p) => {
                if (p.id === 'p-aanya') {
                  return {
                    ...p,
                    currentMood: latest.mood,
                    moodValue: latest.value,
                    lastCheckIn: latest.date,
                    trend7: trend7Values.length >= 7 ? trend7Values : p.trend7,
                  }
                }
                return p
              }),
            )
          }
        }
      } catch {}
    }

    syncMemberData()
    // Listen for storage events across tabs or local updates
    window.addEventListener('storage', syncMemberData)
    return () => window.removeEventListener('storage', syncMemberData)
  }, [])

  const activeClinician: ClinicianProfile = useMemo(() => {
    if (session.clinicianAuthed && session.clinicianName) {
      const dName = session.clinicianName.startsWith('Dr.')
        ? session.clinicianName
        : `Dr. ${session.clinicianName}`
      const fName = dName.replace(/^Dr\.?\s*/i, '').split(' ')[0] || 'Clinician'
      return {
        id: session.clinicianUid || 'active-clinician',
        name: dName,
        firstName: fName,
        title: 'Consultant Psychiatrist & Clinician',
        email: session.clinicianEmail || 'doctor@mindspace.health',
        license: 'Licensed Provider',
        inviteCode: session.clinicianInviteCode || 'MS-CLINIC',
        assignedMemberIds: [],
      }
    }
    return CLINICIANS.find((c) => c.id === activeClinicianId) ?? CLINICIANS[0]
  }, [
    session.clinicianAuthed,
    session.clinicianName,
    session.clinicianUid,
    session.clinicianEmail,
    session.clinicianInviteCode,
    activeClinicianId,
  ])

  // Filter roster by active clinician: NEVER leak mock patients to an authenticated doctor!
  const scopedPatients = useMemo(() => {
    if (session.clinicianAuthed) {
      return backendPatients ?? []
    }
    return patients.filter((p) => activeClinician.assignedMemberIds.includes(p.id))
  }, [session.clinicianAuthed, backendPatients, patients, activeClinician])

  // Active clinician's invitation codes
  const clinicianCodes = useMemo(() => {
    if (session.clinicianAuthed && session.clinicianInviteCode) {
      const dynamicCodes = inviteCodes.filter((c) => c.clinicianId === session.clinicianUid && c.active)
      return [
        {
          code: session.clinicianInviteCode,
          clinicianId: session.clinicianUid || 'me',
          createdAt: new Date().toISOString(),
          active: true,
        },
        ...dynamicCodes,
      ]
    }
    return inviteCodes.filter((c) => c.clinicianId === activeClinicianId && c.active)
  }, [
    session.clinicianAuthed,
    session.clinicianInviteCode,
    session.clinicianUid,
    inviteCodes,
    activeClinicianId,
  ])

  // Generate a new 8-character clinician invitation code
  const generateInviteCode = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let rand = ''
    for (let i = 0; i < 5; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)]
    }
    const newCode = `MS-${rand}`
    const record: InviteCodeRecord = {
      code: newCode,
      clinicianId: session.clinicianUid || activeClinicianId,
      createdAt: new Date().toISOString(),
      active: true,
    }
    setInviteCodes((prev) => [record, ...prev])

    if (session.clinicianUid) {
      updateDoc(doc(db, 'users', session.clinicianUid), {
        invite_code: newCode,
      }).catch((err) => console.warn('Could not save new clinician code to Firestore:', err))
    }

    return newCode
  }, [session.clinicianUid, activeClinicianId])

  const addPatient = useCallback(
    (input: { name: string; email: string; age: number; pronouns: string }) => {
      const firstName = input.name.trim().split(/\s+/)[0] || 'New'
      const newId = `p-${Date.now()}`
      const newPatient: PatientRecord = {
        id: newId,
        name: input.name.trim(),
        firstName,
        age: input.age,
        pronouns: input.pronouns.trim() || 'they/them',
        avatarTone: 'var(--chart-4)',
        status: 'new',
        connection: 'invited',
        connectedSince: new Date().toISOString(),
        lastCheckIn: new Date().toISOString(),
        currentMood: 'okay',
        moodValue: 3,
        trend7: [3, 3, 3, 3, 3, 3, 3],
        trend30: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        variability: 0,
        emotions: [],
        themes: ['Getting started'],
        activity: [
          { label: 'Mood check-ins', count: 0, total: 30 },
          { label: 'Journal entries', count: 0, total: 30 },
          { label: 'Companion chats', count: 0, total: 30 },
          { label: 'Self-care practices', count: 0, total: 30 },
        ],
        concerns: [],
        timeline: [
          {
            id: `t-${Date.now()}`,
            date: new Date().toISOString(),
            kind: 'note',
            title: 'Invitation sent',
            detail: 'Member added to your care roster. Awaiting their first check-in.',
          },
        ],
        risks: [
          {
            id: `r-${Date.now()}`,
            level: 'info',
            label: 'Onboarding',
            detail: 'Not enough member-reported data yet to establish an observed baseline.',
            date: new Date().toISOString(),
          },
        ],
        aiSummary:
          'This member has just been added to your roster and does not have enough member-reported inputs for an observed pattern yet. Supportive context will appear as they begin using MindSpace.',
        notes: [],
        conversationContext: [],
        progress: 0,
      }

      // Add to patient list and assign to active clinician
      setPatients((current) => [newPatient, ...current])
      activeClinician.assignedMemberIds.unshift(newId)
    },
    [activeClinician],
  )

  const getMemberLiveMoods = useCallback(
    (memberId: string): MoodEntry[] => {
      // If member is Aanya Sharma and we have live moods in storage, return them!
      if (memberId === 'p-aanya' && liveMemberMoods.length > 0) {
        return liveMemberMoods
      }
      const activeList = session.clinicianAuthed ? (backendPatients ?? []) : patients
      const target = activeList.find(
        (p) => p.id === memberId || p.id === `backend-${memberId}` || String(p.id).endsWith(memberId),
      )
      if (!target) {
        return liveMemberMoods.length > 0 ? liveMemberMoods : []
      }
      if (target.liveMoods && target.liveMoods.length > 0) {
        return target.liveMoods
      }
      if (liveMemberMoods.length > 0) {
        return liveMemberMoods
      }
      return target.trend30.map((val, idx) => {
        const d = new Date()
        d.setDate(d.getDate() - (target.trend30.length - 1 - idx))
        const key = val >= 4.5 ? 'great' : val >= 3.5 ? 'good' : val >= 2.5 ? 'okay' : val >= 1.5 ? 'low' : 'verylow'
        return {
          id: `m-synth-${idx}`,
          date: d.toISOString(),
          mood: key,
          value: val,
          emotions: target.emotions.slice(0, 2).map((e) => e.label),
          intensity: Math.round(val * 2),
        }
      })
    },
    [session.clinicianAuthed, backendPatients, patients, liveMemberMoods],
  )

  const value = useMemo(
    () => ({
      activeClinician,
      setActiveClinicianId,
      allClinicians: CLINICIANS,
      patients: scopedPatients,
      allPatients: session.clinicianAuthed ? (backendPatients ?? []) : patients,
      activeInviteCodes: clinicianCodes,
      generateInviteCode,
      addPatient,
      getMemberLiveMoods,
      clinicalAiMessages,
      setClinicalAiMessages,
      clearClinicalAiMessages,
    }),
    [
      activeClinician,
      scopedPatients,
      session.clinicianAuthed,
      backendPatients,
      patients,
      clinicianCodes,
      generateInviteCode,
      addPatient,
      getMemberLiveMoods,
      clinicalAiMessages,
      setClinicalAiMessages,
      clearClinicalAiMessages,
    ],
  )

  return <ClinicianContext.Provider value={value}>{children}</ClinicianContext.Provider>
}

export function useClinicianData() {
  const context = useContext(ClinicianContext)
  if (!context) throw new Error('useClinicianData must be used within ClinicianDataProvider')
  return context
}
