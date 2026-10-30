'use client'

import { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import {
  backendLogin,
  backendRegister,
  clearBackendSession,
  fetchBackendUser,
  generateClinicianInviteCode,
  isBackendAuthEnabled,
  storeBackendSession,
} from './backend-api'
import { CURRENT_CLINICIAN, CURRENT_PATIENT, CLINICIANS, getClinicianByInviteCode, type ClinicianProfile } from './mock-data'

interface SessionState {
  patientName: string
  patientAuthed: boolean
  clinicianAuthed: boolean
  authLoading: boolean
  clinicianName: string
  clinicianEmail: string
  clinicianUid: string
  clinicianInviteCode: string
  activeClinicianId: string
  connectedClinician: ClinicianProfile | null
  loginPatient: (name?: string) => void
  registerPatient: (name: string, inviteCode?: string) => { success: boolean; error?: string }
  loginClinician: (clinicianId?: string, doctorName?: string) => void
  authenticatePatient: (
    email: string,
    password: string,
    displayName: string,
    register: boolean,
    inviteCode?: string,
  ) => Promise<{ success: boolean; error?: string }>
  authenticateClinician: (
    email: string,
    password: string,
    register?: boolean,
    doctorName?: string,
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const SessionContext = createContext<SessionState | null>(null)

function getStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem('mindspace_user')
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const initialUser = useMemo(() => getStoredUser(), [])

  const [patientName, setPatientName] = useState(
    initialUser?.role === 'patient'
      ? (initialUser.display_name?.split(' ')[0] || CURRENT_PATIENT.firstName)
      : CURRENT_PATIENT.firstName,
  )
  const [patientAuthed, setPatientAuthed] = useState(
    initialUser?.role === 'patient' && typeof window !== 'undefined' && !!sessionStorage.getItem('mindspace_access_token'),
  )
  const [clinicianAuthed, setClinicianAuthed] = useState(
    initialUser?.role === 'psychiatrist' && typeof window !== 'undefined' && !!sessionStorage.getItem('mindspace_access_token'),
  )
  const [clinicianDisplayName, setClinicianDisplayName] = useState(
    initialUser?.role === 'psychiatrist' ? (initialUser.display_name || 'Dr. Clinician') : '',
  )
  const [clinicianEmail, setClinicianEmail] = useState(
    initialUser?.role === 'psychiatrist' ? (initialUser.email || '') : '',
  )
  const [clinicianUid, setClinicianUid] = useState(
    initialUser?.role === 'psychiatrist' ? (initialUser.uid || '') : '',
  )
  const [clinicianInviteCode, setClinicianInviteCode] = useState(
    initialUser?.role === 'psychiatrist' ? (initialUser.invite_code || '') : '',
  )
  const [authLoading, setAuthLoading] = useState(isBackendAuthEnabled)
  const [activeClinicianId, setActiveClinicianId] = useState<string>(CURRENT_CLINICIAN.id)
  const [connectedClinician, setConnectedClinician] = useState<ClinicianProfile | null>(CURRENT_CLINICIAN)

  // Use Firebase onAuthStateChanged to properly restore sessions after page refresh
  useEffect(() => {
    if (!isBackendAuthEnabled) return

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        firebaseUser
          .getIdToken()
          .then((token) => {
            fetchBackendUser()
              .then((validatedUser) =>
                startTransition(() => {
                  storeBackendSession({
                    access_token: token,
                    token_type: 'Bearer',
                    user: validatedUser,
                  })
                  if (validatedUser.role === 'patient') {
                    setPatientName(validatedUser.display_name.split(' ')[0] || CURRENT_PATIENT.firstName)
                    setPatientAuthed(true)
                    setClinicianAuthed(false)
                    if (validatedUser.connected_clinician_name) {
                      setConnectedClinician({
                        id: 'connected-clinician',
                        name: validatedUser.connected_clinician_name,
                        firstName:
                          validatedUser.connected_clinician_name.replace(/^Dr\.?\s*/i, '').split(' ')[0] || 'Clinician',
                        title: 'Licensed Clinician & Therapist',
                        email: validatedUser.connected_clinician_email || '',
                        license: 'Licensed Provider',
                        inviteCode: '',
                        assignedMemberIds: [],
                      })
                    }
                  } else if (validatedUser.role === 'psychiatrist') {
                    setClinicianDisplayName(validatedUser.display_name)
                    setClinicianEmail(validatedUser.email)
                    setClinicianUid(firebaseUser.uid)
                    if (validatedUser.invite_code) {
                      setClinicianInviteCode(validatedUser.invite_code)
                    }
                    setClinicianAuthed(true)
                    setPatientAuthed(false)
                  }
                  setAuthLoading(false)
                }),
              )
              .catch(() => {
                clearBackendSession()
                setPatientAuthed(false)
                setClinicianAuthed(false)
                setAuthLoading(false)
              })
          })
          .catch(() => {
            setAuthLoading(false)
          })
      } else {
        clearBackendSession()
        setPatientAuthed(false)
        setClinicianAuthed(false)
        setAuthLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  const loginPatient = useCallback((name?: string) => {
    if (name) setPatientName(name.split(' ')[0])
    setPatientAuthed(true)
  }, [])

  const registerPatient = useCallback((name: string, inviteCode?: string) => {
    if (name) setPatientName(name.split(' ')[0] || CURRENT_PATIENT.firstName)

    if (inviteCode && inviteCode.trim()) {
      const matchedClinician = getClinicianByInviteCode(inviteCode)
      if (matchedClinician) {
        setConnectedClinician(matchedClinician)
      }
    }

    // Force a fresh slate for new registrations
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mindspace_patient_state_v1')
      localStorage.setItem('mindspace_new_user', 'true')
    }

    setPatientAuthed(true)
    return { success: true }
  }, [])

  const loginClinician = useCallback((clinicianId?: string, doctorName?: string) => {
    if (clinicianId) {
      setActiveClinicianId(clinicianId)
    }
    if (doctorName) {
      setClinicianDisplayName(doctorName)
    }
    setClinicianAuthed(true)
  }, [])

  const authenticatePatient = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      register: boolean,
      inviteCode?: string,
    ) => {
      if (!isBackendAuthEnabled) {
        if (register) {
          const result = registerPatient(displayName, inviteCode)
          return result
        }
        loginPatient(displayName)
        return { success: true }
      }

      try {
        let response
        if (register) {
          try {
            response = await backendRegister(email, password, displayName, 'patient', inviteCode)
          } catch (regErr: unknown) {
            const errObj = regErr as { code?: string; message?: string }
            if (errObj?.code === 'auth/email-already-in-use' || errObj?.message?.includes('email-already-in-use')) {
              response = await backendLogin(email, password, 'patient')
            } else {
              throw regErr
            }
          }
        } else {
          response = await backendLogin(email, password, 'patient')
        }

        storeBackendSession(response)
        setPatientName(response.user.display_name.split(' ')[0] || CURRENT_PATIENT.firstName)
        setPatientAuthed(true)
        setClinicianAuthed(false)
        setAuthLoading(false)
        if (response.user.connected_clinician_name) {
          setConnectedClinician({
            id: 'connected-clinician',
            name: response.user.connected_clinician_name,
            firstName:
              response.user.connected_clinician_name.replace(/^Dr\.?\s*/i, '').split(' ')[0] || 'Clinician',
            title: 'Licensed Clinician & Therapist',
            email: response.user.connected_clinician_email || '',
            license: 'Licensed Provider',
            inviteCode: inviteCode || '',
            assignedMemberIds: [],
          })
        }
        return { success: true }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unable to authenticate' }
      }
    },
    [loginPatient, registerPatient],
  )

  const authenticateClinician = useCallback(
    async (email: string, password: string, register = false, doctorName = 'Doctor') => {
      if (!isBackendAuthEnabled) {
        setClinicianDisplayName(doctorName)
        loginClinician(undefined, doctorName)
        return { success: true }
      }

      try {
        let response
        if (register) {
          try {
            response = await backendRegister(email, password, doctorName, 'psychiatrist')
          } catch (regErr: unknown) {
            const errObj = regErr as { code?: string; message?: string }
            if (errObj?.code === 'auth/email-already-in-use' || errObj?.message?.includes('email-already-in-use')) {
              response = await backendLogin(email, password, 'psychiatrist')
            } else {
              throw regErr
            }
          }
        } else {
          response = await backendLogin(email, password, 'psychiatrist')
        }

        // Guarantee psychiatrist role and credentials
        if (response.user.role !== 'psychiatrist') {
          response.user.role = 'psychiatrist'
          const uid = response.user.uid || auth.currentUser?.uid
          if (uid) {
            if (!response.user.invite_code) {
              response.user.invite_code = generateClinicianInviteCode()
            }
            await setDoc(
              doc(db, 'users', uid),
              {
                role: 'psychiatrist',
                invite_code: response.user.invite_code,
                display_name: doctorName || response.user.display_name || 'Dr. Clinician',
              },
              { merge: true },
            ).catch(() => {})
          }
        }

        storeBackendSession(response)
        setClinicianDisplayName(response.user.display_name || doctorName)
        setClinicianEmail(response.user.email)
        setClinicianUid(response.user.uid || auth.currentUser?.uid || '')
        if (response.user.invite_code) setClinicianInviteCode(response.user.invite_code)
        setClinicianAuthed(true)
        setPatientAuthed(false)
        setAuthLoading(false)
        return { success: true }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unable to authenticate' }
      }
    },
    [loginClinician],
  )

  const logout = useCallback(() => {
    setPatientAuthed(false)
    setClinicianAuthed(false)
    setClinicianDisplayName('')
    setClinicianEmail('')
    setClinicianUid('')
    setClinicianInviteCode('')
    clearBackendSession()
  }, [])

  const clinicianObj = CLINICIANS.find((c) => c.id === activeClinicianId) ?? CURRENT_CLINICIAN

  const value = useMemo<SessionState>(
    () => ({
      patientName,
      patientAuthed,
      clinicianAuthed,
      authLoading,
      clinicianName: clinicianDisplayName || clinicianObj.name,
      clinicianEmail,
      clinicianUid,
      clinicianInviteCode,
      activeClinicianId,
      connectedClinician,
      loginPatient,
      registerPatient,
      loginClinician,
      authenticatePatient,
      authenticateClinician,
      logout,
    }),
    [
      patientName,
      patientAuthed,
      clinicianAuthed,
      authLoading,
      clinicianDisplayName,
      clinicianEmail,
      clinicianUid,
      clinicianInviteCode,
      clinicianObj.name,
      activeClinicianId,
      connectedClinician,
      loginPatient,
      registerPatient,
      loginClinician,
      authenticatePatient,
      authenticateClinician,
      logout,
    ],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
