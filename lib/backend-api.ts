import { auth, db } from './firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore'

import { CLINICIANS } from './mock-data'

export const isBackendAuthEnabled = true

export interface BackendUser {
  id: number
  email: string
  role: 'patient' | 'psychiatrist'
  display_name: string
  uid?: string
  invite_code?: string
  connected_clinician_name?: string
  connected_clinician_email?: string
}

interface AuthResponse {
  access_token: string
  token_type: string
  user: BackendUser
}

export interface BackendMood {
  id: number
  recorded_at: string
  mood_label: 'great' | 'good' | 'okay' | 'low' | 'overwhelmed'
  mood_score: number
  notes: string | null
}

export interface BackendJournal {
  id: number
  entry_date: string
  title: string
  note: string
}

export interface BackendProfile {
  id: number
  display_name: string
  email: string
  age: number | null
  phone: string | null
  preferred_contact: string
  timezone: string
}

export interface BackendConversation {
  id: string | number
  title: string
  updated_at: string
  created_at?: string
}

export interface BackendMessage {
  id: string | number
  conversationId: string | number
  content: string
  sender_role: string
  created_at: string
}

export interface BackendAssignedPatient {
  id: number
  display_name: string
  email: string
  relationship_status: string
  relationship_type: string
  patientUid?: string
  current_mood?: string
  mood_score?: number
  last_checkin?: string
  connected_since?: string
  trend7?: number[]
  fullMoods?: BackendMood[]
}

export function generateClinicianInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let rand = ''
  for (let i = 0; i < 5; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)]
  }
  return `MS-${rand}`
}

export async function findClinicianByInviteCode(
  code: string,
): Promise<{ uid: string; display_name: string; email: string; title?: string } | null> {
  const clean = code.trim().toUpperCase()
  if (!clean) return null

  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'psychiatrist'),
      where('invite_code', '==', clean),
    )
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0]
      const data = docSnap.data()
      return {
        uid: docSnap.id,
        display_name: data.display_name || 'Clinician',
        email: data.email || '',
        title: 'Licensed Clinician & Therapist',
      }
    }
  } catch (err) {
    console.warn('Error querying clinician by invite code:', err)
  }

  // Fallback to mock clinicians (e.g. MS-7K4P2, MS-9M2X1, MS-3B8L5)
  const mock = CLINICIANS.find((c) => c.inviteCode === clean)
  if (mock) {
    return {
      uid: mock.id,
      display_name: mock.name,
      email: mock.email,
      title: mock.title,
    }
  }

  return null
}

function getUserId() {
  const user = auth.currentUser
  if (!user) throw new Error('Backend session is not available')
  return user.uid
}

// Generate a random numeric ID for new records
function generateNumericId(): number {
  return Math.floor(Math.random() * 1000000000)
}

export async function fetchBackendMoods(): Promise<BackendMood[]> {
  const uid = getUserId()
  const q = query(collection(db, 'moods'), where('uid', '==', uid))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => doc.data() as BackendMood)
}

export async function fetchBackendJournal(): Promise<BackendJournal[]> {
  const uid = getUserId()
  const q = query(collection(db, 'journals'), where('uid', '==', uid))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => doc.data() as BackendJournal)
}

export async function fetchBackendProfile(): Promise<BackendProfile> {
  const uid = getUserId()
  const docRef = doc(db, 'users', uid)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) throw new Error('Profile not found')
  const data = snapshot.data()
  return {
    id: data.id || generateNumericId(),
    display_name: data.display_name || '',
    email: data.email || '',
    age: data.age || null,
    phone: data.phone || null,
    preferred_contact: data.preferred_contact || '',
    timezone: data.timezone || ''
  }
}

export async function fetchBackendUser(): Promise<BackendUser> {
  const uid = getUserId()
  const currentAuthUser = auth.currentUser
  const docRef = doc(db, 'users', uid)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    let role: 'patient' | 'psychiatrist' = 'patient'
    let displayName = currentAuthUser?.displayName || currentAuthUser?.email?.split('@')[0] || 'Member'
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('mindspace_user')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.role === 'psychiatrist' || parsed.role === 'clinician') role = 'psychiatrist'
          if (parsed.display_name) displayName = parsed.display_name
        }
      } catch {}
    }

    let inviteCode: string | undefined = undefined
    if (role === 'psychiatrist') {
      inviteCode = generateClinicianInviteCode()
      if (!displayName.startsWith('Dr.')) {
        displayName = `Dr. ${displayName}`
      }
    }

    const recoveredUser: BackendUser = {
      id: generateNumericId(),
      email: currentAuthUser?.email || '',
      role,
      display_name: displayName,
      uid,
      ...(inviteCode ? { invite_code: inviteCode } : {})
    }

    await setDoc(docRef, recoveredUser).catch(() => {})
    return recoveredUser
  }

  const data = snapshot.data()
  let inviteCode = data.invite_code
  const isClinician =
    data.role === 'psychiatrist' || data.role === 'clinician' || data.role === 'doctor'
  const role: 'patient' | 'psychiatrist' = isClinician ? 'psychiatrist' : 'patient'

  if (role === 'psychiatrist' && !inviteCode) {
    inviteCode = generateClinicianInviteCode()
    await updateDoc(docRef, { invite_code: inviteCode, role: 'psychiatrist' }).catch(() => {})
  }

  return {
    id: data.id || generateNumericId(),
    email: data.email || currentAuthUser?.email || '',
    role,
    display_name: data.display_name || currentAuthUser?.displayName || (role === 'psychiatrist' ? 'Dr. Clinician' : 'Member'),
    uid,
    invite_code: inviteCode,
    connected_clinician_name: data.connected_clinician_name,
    connected_clinician_email: data.connected_clinician_email,
  }
}

export async function exportBackendData(): Promise<Record<string, unknown>> {
  const moods = await fetchBackendMoods()
  const journals = await fetchBackendJournal()
  return { moods, journals }
}

export async function deleteBackendAccount(): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error('Not logged in')
  await user.delete()
}

export async function fetchBackendConversations(): Promise<BackendConversation[]> {
  const uid = getUserId()
  const q = query(collection(db, 'conversations'), where('uid', '==', uid))
  const snapshot = await getDocs(q)
  const map = new Map<string, BackendConversation>()
  for (const doc of snapshot.docs) {
    const data = doc.data() as BackendConversation
    const idStr = String(data.id)
    if (!map.has(idStr) || (data.updated_at || '').localeCompare(map.get(idStr)?.updated_at || '') > 0) {
      map.set(idStr, data)
    }
  }
  const list = Array.from(map.values())
  return list.sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''))
}

export async function fetchBackendMessages(conversationId: string | number): Promise<BackendMessage[]> {
  const uid = getUserId()
  const qStr = query(collection(db, 'messages'), where('uid', '==', uid), where('conversationId', '==', String(conversationId)))
  const snapshotStr = await getDocs(qStr)
  let list: BackendMessage[] = []
  if (!snapshotStr.empty) {
    list = snapshotStr.docs.map(doc => doc.data() as BackendMessage)
  } else {
    const qNum = query(collection(db, 'messages'), where('uid', '==', uid), where('conversationId', '==', Number(conversationId)))
    const snapshotNum = await getDocs(qNum)
    list = snapshotNum.docs.map(doc => doc.data() as BackendMessage)
  }
  return list.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))
}

export async function fetchBackendAssignedPatients(): Promise<BackendAssignedPatient[]> {
  const uid = getUserId()
  const q = query(collection(db, 'patients'), where('psychiatristUid', '==', uid))
  const snapshot = await getDocs(q)
  const patientList = snapshot.docs.map(doc => doc.data() as BackendAssignedPatient)

  for (const p of patientList) {
    if (p.patientUid) {
      try {
        const moodQ = query(collection(db, 'moods'), where('uid', '==', p.patientUid))
        const moodSnap = await getDocs(moodQ)
        if (!moodSnap.empty) {
          const moods = moodSnap.docs.map(d => d.data() as BackendMood)
          moods.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
          const latest = moods[0]
          p.current_mood = latest.mood_label
          p.mood_score = latest.mood_score
          p.last_checkin = latest.recorded_at
          p.trend7 = moods.slice(0, 7).map(m => m.mood_score).reverse()
          p.fullMoods = moods
        }
      } catch (err) {
        console.warn('Could not fetch patient moods:', err)
      }
    }
  }

  return patientList
}

export async function createBackendMood(mood: Omit<BackendMood, 'id' | 'recorded_at'>): Promise<BackendMood> {
  const uid = getUserId()
  const newMood: BackendMood = {
    ...mood,
    id: generateNumericId(),
    recorded_at: new Date().toISOString()
  }
  await addDoc(collection(db, 'moods'), { ...newMood, uid })
  return newMood
}

export async function createBackendJournal(journal: { title: string; note: string }): Promise<BackendJournal> {
  const uid = getUserId()
  const newJournal: BackendJournal = {
    ...journal,
    id: generateNumericId(),
    entry_date: new Date().toISOString()
  }
  await addDoc(collection(db, 'journals'), { ...newJournal, uid })
  return newJournal
}

export async function updateBackendJournal(entryId: number, journal: { title: string; note: string }): Promise<BackendJournal> {
  const uid = getUserId()
  const q = query(collection(db, 'journals'), where('uid', '==', uid), where('id', '==', entryId))
  const snapshot = await getDocs(q)
  if (snapshot.empty) throw new Error('Journal entry not found')
  
  const docRef = snapshot.docs[0].ref
  const data = snapshot.docs[0].data() as BackendJournal
  const updatedJournal = { ...data, ...journal }
  await updateDoc(docRef, journal)
  return updatedJournal
}

export async function deleteBackendJournal(entryId: number): Promise<void> {
  const uid = getUserId()
  const q = query(collection(db, 'journals'), where('uid', '==', uid), where('id', '==', entryId))
  const snapshot = await getDocs(q)
  if (!snapshot.empty) {
    await deleteDoc(snapshot.docs[0].ref)
  }
}

export async function backendRegister(
  email: string,
  password: string,
  displayName: string,
  role: 'patient' | 'psychiatrist' = 'patient',
  inviteCode?: string
): Promise<AuthResponse> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const id = generateNumericId()
  let invite_code: string | undefined = undefined

  if (role === 'psychiatrist') {
    invite_code = generateClinicianInviteCode()
  }

  const user: BackendUser = {
    id,
    email: userCredential.user.email || email,
    role,
    display_name: displayName,
    uid: userCredential.user.uid,
    ...(invite_code ? { invite_code } : {})
  }

  // If patient provided an invite code, link to clinician
  if (role === 'patient' && inviteCode && inviteCode.trim()) {
    try {
      const clinician = await findClinicianByInviteCode(inviteCode.trim())
      if (clinician) {
        user.connected_clinician_name = clinician.display_name
        user.connected_clinician_email = clinician.email

        await addDoc(collection(db, 'patients'), {
          psychiatristUid: clinician.uid,
          patientUid: userCredential.user.uid,
          id: generateNumericId(),
          display_name: displayName,
          email: userCredential.user.email || email,
          relationship_status: 'active',
          relationship_type: 'direct',
          connected_since: new Date().toISOString(),
          last_checkin: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.warn('Could not link clinician during registration:', err)
    }
  }

  await setDoc(doc(db, 'users', userCredential.user.uid), user)

  return {
    access_token: await userCredential.user.getIdToken(),
    token_type: 'Bearer',
    user
  }
}

export async function backendLogin(
  email: string,
  password: string,
  roleHint?: 'patient' | 'psychiatrist',
): Promise<AuthResponse> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const uid = userCredential.user.uid
  const userDocRef = doc(db, 'users', uid)
  const userDoc = await getDoc(userDocRef)
  let user: BackendUser

  if (userDoc.exists()) {
    const data = userDoc.data()
    const isClinician =
      roleHint === 'psychiatrist' ||
      data.role === 'psychiatrist' ||
      data.role === 'clinician' ||
      data.role === 'doctor'

    const role: 'patient' | 'psychiatrist' = isClinician ? 'psychiatrist' : 'patient'

    let inviteCode = data.invite_code
    if (role === 'psychiatrist' && !inviteCode) {
      inviteCode = generateClinicianInviteCode()
    }

    let displayName = data.display_name || userCredential.user.displayName
    if (!displayName) {
      const emailPrefix = email.split('@')[0] || ''
      const capName = emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : 'Clinician'
      displayName = role === 'psychiatrist' ? `Dr. ${capName}` : capName || 'Member'
    } else if (role === 'psychiatrist' && !displayName.startsWith('Dr.')) {
      displayName = `Dr. ${displayName}`
    }

    user = {
      ...(data as BackendUser),
      id: data.id || generateNumericId(),
      email: data.email || userCredential.user.email || email,
      role,
      display_name: displayName,
      uid,
      invite_code: inviteCode,
      connected_clinician_name: data.connected_clinician_name,
      connected_clinician_email: data.connected_clinician_email,
    }

    if (data.role !== role || data.invite_code !== inviteCode || data.display_name !== displayName) {
      await setDoc(userDocRef, user, { merge: true }).catch(() => {})
    }
  } else {
    const role: 'patient' | 'psychiatrist' = roleHint || 'patient'
    let invite_code: string | undefined = undefined
    if (role === 'psychiatrist') {
      invite_code = generateClinicianInviteCode()
    }

    const emailPrefix = email.split('@')[0] || ''
    const capName = emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : 'Clinician'
    const displayName =
      userCredential.user.displayName ||
      (role === 'psychiatrist' ? `Dr. ${capName}` : capName || 'Member')

    user = {
      id: generateNumericId(),
      email: userCredential.user.email || email,
      role,
      display_name: displayName,
      uid,
      ...(invite_code ? { invite_code } : {})
    }

    await setDoc(userDocRef, user).catch((err) => {
      console.warn('Could not persist user to Firestore on login:', err)
    })
  }

  return {
    access_token: await userCredential.user.getIdToken(),
    token_type: 'Bearer',
    user,
  }
}

// Save or update a conversation in Firestore
export async function createBackendConversation(conversation: { id: string; title: string }): Promise<void> {
  const uid = getUserId()
  const now = new Date().toISOString()
  const q = query(collection(db, 'conversations'), where('uid', '==', uid), where('id', '==', String(conversation.id)))
  const snap = await getDocs(q)
  if (snap.empty) {
    await addDoc(collection(db, 'conversations'), {
      uid,
      id: String(conversation.id),
      title: conversation.title,
      updated_at: now,
      created_at: now,
    })
  } else {
    await updateDoc(snap.docs[0].ref, {
      title: conversation.title,
      updated_at: now,
    })
  }
}

// Save a chat message to Firestore and ensure parent conversation document exists
export async function createBackendMessage(message: { conversationId: string | number; content: string; senderRole: string }): Promise<void> {
  const uid = getUserId()
  const now = new Date().toISOString()
  const convIdStr = String(message.conversationId)

  // Ensure conversation exists in Firestore so fetchBackendConversations retrieves it
  const convQ = query(collection(db, 'conversations'), where('uid', '==', uid), where('id', '==', convIdStr))
  const convSnap = await getDocs(convQ)
  if (convSnap.empty) {
    await addDoc(collection(db, 'conversations'), {
      uid,
      id: convIdStr,
      title: message.content.slice(0, 36) || 'New conversation',
      updated_at: now,
      created_at: now,
    })
  } else {
    await updateDoc(convSnap.docs[0].ref, {
      updated_at: now,
    })
  }

  await addDoc(collection(db, 'messages'), {
    uid,
    conversationId: convIdStr,
    content: message.content,
    sender_role: message.senderRole,
    created_at: now,
  })
}

// Update conversation title in Firestore
export async function updateBackendConversationTitle(conversationId: string, title: string): Promise<void> {
  const uid = getUserId()
  const q = query(collection(db, 'conversations'), where('uid', '==', uid), where('id', '==', String(conversationId)))
  const snapshot = await getDocs(q)
  if (!snapshot.empty) {
    await updateDoc(snapshot.docs[0].ref, { title, updated_at: new Date().toISOString() })
  }
}

// Delete conversation and associated messages from Firestore
export async function deleteBackendConversation(conversationId: string | number): Promise<void> {
  const uid = getUserId()
  const convIdStr = String(conversationId)

  try {
    // 1. Delete conversation document
    const qConv = query(collection(db, 'conversations'), where('uid', '==', uid), where('id', '==', convIdStr))
    const snapConv = await getDocs(qConv)
    const convDeletes = snapConv.docs.map((d) => deleteDoc(d.ref))

    // 2. Delete messages belonging to this conversation
    const qMsgStr = query(collection(db, 'messages'), where('uid', '==', uid), where('conversationId', '==', convIdStr))
    const snapMsgStr = await getDocs(qMsgStr)
    const msgDeletes = snapMsgStr.docs.map((d) => deleteDoc(d.ref))

    const qMsgNum = query(collection(db, 'messages'), where('uid', '==', uid), where('conversationId', '==', Number(conversationId)))
    const snapMsgNum = await getDocs(qMsgNum)
    const msgNumDeletes = snapMsgNum.docs.map((d) => deleteDoc(d.ref))

    await Promise.all([...convDeletes, ...msgDeletes, ...msgNumDeletes])
  } catch (err) {
    console.warn('Error deleting conversation from Firestore:', err)
  }
}

// Update user profile in Firestore
export async function updateBackendProfile(profile: { display_name?: string; age?: number | null; phone?: string | null; preferred_contact?: string; timezone?: string }): Promise<void> {
  const uid = getUserId()
  const docRef = doc(db, 'users', uid)
  await updateDoc(docRef, { ...profile, updated_at: new Date().toISOString() })
}

export function storeBackendSession(response: AuthResponse): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('mindspace_access_token', response.access_token)
  sessionStorage.setItem('mindspace_user', JSON.stringify(response.user))
}

export function clearBackendSession(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('mindspace_access_token')
  sessionStorage.removeItem('mindspace_user')
  auth.signOut().catch(() => {})
}
