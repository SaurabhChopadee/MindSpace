import type {
  ChatMessage,
  Conversation,
  JournalEntry,
  MoodEntry,
  MoodOption,
  PatientRecord,
  PatientUser,
  Resource,
} from './types'

/**
 * All dates are derived from a fixed anchor so the demo is deterministic
 * (no SSR/client hydration drift). Swap ANCHOR for `new Date()` when wiring
 * to a real backend.
 */
export const ANCHOR = new Date()

export function daysAgo(n: number): string {
  const d = new Date(ANCHOR)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export function hoursAgo(n: number): string {
  const d = new Date(ANCHOR)
  d.setHours(d.getHours() - n)
  return d.toISOString()
}

export const MOOD_OPTIONS: MoodOption[] = [
  { key: 'great', label: 'Great', value: 5, face: '😊', color: 'var(--mood-great)' },
  { key: 'good', label: 'Good', value: 4, face: '🙂', color: 'var(--mood-good)' },
  { key: 'okay', label: 'Okay', value: 3, face: '😐', color: 'var(--mood-okay)' },
  { key: 'low', label: 'Low', value: 2, face: '😔', color: 'var(--mood-low)' },
  { key: 'verylow', label: 'Very low', value: 1, face: '😣', color: 'var(--mood-verylow)' },
]

export const moodByKey = (k: string) => MOOD_OPTIONS.find((m) => m.key === k) ?? MOOD_OPTIONS[2]

export const EMOTIONS = [
  'Calm',
  'Hopeful',
  'Grateful',
  'Content',
  'Tired',
  'Restless',
  'Anxious',
  'Overwhelmed',
  'Lonely',
  'Frustrated',
  'Sad',
  'Numb',
  'Motivated',
  'Focused',
  'Irritable',
]

export const SUGGESTED_PROMPTS = [
  'Help me reflect on my day',
  "I'm feeling overwhelmed",
  'I want to improve my sleep',
  'I need a moment to calm down',
]

export const AFFIRMATIONS = [
  'You showed up today, and that matters.',
  'Small steps still move you forward.',
  'Your feelings are valid, and they are not permanent.',
  'Rest is productive too.',
  'You are allowed to take up space.',
]

/* ---------------- Current patient (also appears in clinician list) ---------------- */
export const CURRENT_PATIENT: PatientUser = {
  id: 'p-aanya',
  name: 'Aanya Sharma',
  firstName: 'Aanya',
  email: 'aanya.sharma@example.com',
  age: 24,
  avatarTone: 'var(--chart-2)',
}

const seed7 = [3, 2, 3, 4, 3, 4, 4]
function buildTrend30(base: number[]) {
  const out: number[] = []
  for (let i = 0; i < 30; i++) {
    const wobble = Math.sin(i / 2.4) * 0.7 + Math.cos(i / 5) * 0.5
    const v = base[i % base.length] + wobble
    out.push(Math.max(1, Math.min(5, Number(v.toFixed(2)))))
  }
  return out
}

export const PATIENT_MOODS: MoodEntry[] = [
  // Multiple check-ins for Today (different times of day)
  { id: 'm-today-aft', date: hoursAgo(2), mood: 'good', value: 4, emotions: ['Hopeful', 'Calm'], intensity: 7, note: 'Had a productive focus session and feeling much lighter.' },
  { id: 'm-today-morn', date: hoursAgo(7), mood: 'okay', value: 3, emotions: ['Tired', 'Content'], intensity: 5, note: 'Morning tea and a quiet walk before starting work.' },

  // Recent 7 Days
  { id: 'm2', date: daysAgo(1), mood: 'good', value: 4, emotions: ['Hopeful', 'Focused'], intensity: 6, note: 'Slept better and made time to read.' },
  { id: 'm3', date: daysAgo(2), mood: 'okay', value: 3, emotions: ['Tired', 'Calm'], intensity: 5 },
  { id: 'm4', date: daysAgo(3), mood: 'great', value: 5, emotions: ['Grateful', 'Motivated'], intensity: 8, note: 'Called an old friend, felt really grounded.' },
  { id: 'm5', date: daysAgo(4), mood: 'low', value: 2, emotions: ['Anxious', 'Restless'], intensity: 4, note: 'Deadlines piling up at work.' },
  { id: 'm6', date: daysAgo(5), mood: 'okay', value: 3, emotions: ['Focused'], intensity: 6 },
  { id: 'm7', date: daysAgo(6), mood: 'good', value: 4, emotions: ['Content'], intensity: 7 },

  // 4 Weeks history (days 8 to 27)
  { id: 'm8', date: daysAgo(8), mood: 'good', value: 4, emotions: ['Calm'], intensity: 6 },
  { id: 'm9', date: daysAgo(10), mood: 'okay', value: 3, emotions: ['Tired'], intensity: 5 },
  { id: 'm10', date: daysAgo(12), mood: 'low', value: 2, emotions: ['Overwhelmed'], intensity: 4 },
  { id: 'm11', date: daysAgo(14), mood: 'good', value: 4, emotions: ['Hopeful'], intensity: 6 },
  { id: 'm12', date: daysAgo(16), mood: 'great', value: 5, emotions: ['Grateful'], intensity: 8 },
  { id: 'm13', date: daysAgo(19), mood: 'okay', value: 3, emotions: ['Focused'], intensity: 5 },
  { id: 'm14', date: daysAgo(22), mood: 'good', value: 4, emotions: ['Calm', 'Content'], intensity: 7 },
  { id: 'm15', date: daysAgo(25), mood: 'okay', value: 3, emotions: ['Tired'], intensity: 5 },
  { id: 'm16', date: daysAgo(27), mood: 'good', value: 4, emotions: ['Content'], intensity: 6 },

  // 6 Months history (weeks between 35 and 150 days ago)
  { id: 'm17', date: daysAgo(35), mood: 'good', value: 4, emotions: ['Hopeful'], intensity: 6 },
  { id: 'm18', date: daysAgo(42), mood: 'okay', value: 3, emotions: ['Calm'], intensity: 5 },
  { id: 'm19', date: daysAgo(49), mood: 'great', value: 5, emotions: ['Grateful'], intensity: 8 },
  { id: 'm20', date: daysAgo(56), mood: 'good', value: 4, emotions: ['Focused'], intensity: 7 },
  { id: 'm21', date: daysAgo(65), mood: 'okay', value: 3, emotions: ['Tired'], intensity: 5 },
  { id: 'm22', date: daysAgo(75), mood: 'good', value: 4, emotions: ['Content'], intensity: 6 },
  { id: 'm23', date: daysAgo(85), mood: 'low', value: 2, emotions: ['Anxious'], intensity: 4 },
  { id: 'm24', date: daysAgo(98), mood: 'okay', value: 3, emotions: ['Calm'], intensity: 5 },
  { id: 'm25', date: daysAgo(112), mood: 'good', value: 4, emotions: ['Grateful'], intensity: 7 },
  { id: 'm26', date: daysAgo(128), mood: 'good', value: 4, emotions: ['Hopeful'], intensity: 6 },
  { id: 'm27', date: daysAgo(145), mood: 'okay', value: 3, emotions: ['Content'], intensity: 5 },
]

export const PATIENT_TREND_7 = [...seed7]
export const PATIENT_TREND_30 = buildTrend30([3, 2, 3, 2, 4, 3, 4, 3, 3, 4])

export const PATIENT_JOURNAL: JournalEntry[] = [
  {
    id: 'j1',
    date: daysAgo(0),
    title: 'A quieter morning',
    body: 'Woke up before my alarm and actually felt rested. I made tea and sat by the window for a while before checking my phone. I want to protect these slow mornings — they set a different tone for the whole day.',
    mood: 'good',
    tags: ['sleep', 'gratitude'],
  },
  {
    id: 'j2',
    date: daysAgo(3),
    title: 'The deadline spiral',
    body: 'Everything felt urgent today and I kept jumping between tasks without finishing any. I noticed my chest tightening around 3pm. Naming it helped a little. Tomorrow I want to try writing down just three things instead of the whole list.',
    mood: 'low',
    tags: ['work', 'anxiety'],
  },
  {
    id: 'j3',
    date: daysAgo(6),
    title: 'Small wins',
    body: 'Finished the breathing exercise twice this week. It is starting to feel less awkward. Reminding myself that consistency matters more than intensity.',
    mood: 'okay',
    tags: ['self-care'],
  },
]

const conv1Messages: ChatMessage[] = [
  { id: 'c1m1', role: 'ai', content: 'Hi Aanya, I\u2019m glad you\u2019re here. How has today been feeling for you so far?', time: hoursAgo(26) },
  { id: 'c1m2', role: 'user', content: 'A bit scattered honestly. I have a lot on my plate this week.', time: hoursAgo(26) },
  { id: 'c1m3', role: 'ai', content: 'That sounds like a lot to hold at once. When everything feels urgent, it can help to name just one thing that matters most right now. What feels heaviest?', time: hoursAgo(26) },
  { id: 'c1m4', role: 'user', content: 'Probably the project review on Friday. I keep avoiding it.', time: hoursAgo(25) },
  { id: 'c1m5', role: 'ai', content: 'Avoidance often shows up when something feels bigger than the time we have. Would it feel doable to spend ten focused minutes on it today \u2014 not to finish, just to begin? Beginnings tend to shrink the fear.', time: hoursAgo(25) },
]

const conv2Messages: ChatMessage[] = [
  { id: 'c2m1', role: 'ai', content: 'Welcome back. Would you like to reflect on your day, or is there something specific on your mind?', time: daysAgo(4) },
  { id: 'c2m2', role: 'user', content: 'I want to sleep better. I keep scrolling at night.', time: daysAgo(4) },
  { id: 'c2m3', role: 'ai', content: 'That late-night scroll is really common \u2014 it is often the mind looking for a soft landing. We could try a wind-down cue tonight: dimming lights 30 minutes before bed and a short breathing practice. Want me to set that up as a gentle reminder?', time: daysAgo(4) },
]

export const PATIENT_CONVERSATIONS: Conversation[] = [
  { id: 'conv-1', title: 'Feeling scattered this week', updatedAt: hoursAgo(25), messages: conv1Messages },
  { id: 'conv-2', title: 'Sleeping better at night', updatedAt: daysAgo(4), messages: conv2Messages },
  { id: 'conv-3', title: 'A grateful check-in', updatedAt: daysAgo(9), messages: [
    { id: 'c3m1', role: 'ai', content: 'Hi Aanya, what is one small thing that went well recently?', time: daysAgo(9) },
    { id: 'c3m2', role: 'user', content: 'I finally called my grandmother. It felt really good.', time: daysAgo(9) },
    { id: 'c3m3', role: 'ai', content: 'That is a lovely kind of good \u2014 connection has a way of steadying us. What did the conversation give you?', time: daysAgo(9) },
  ] },
]

export const RESOURCES: Resource[] = [
  { id: 'r1', category: 'Anxiety', title: 'Riding the wave of anxious thoughts', description: 'A gentle framework for letting anxious spikes rise and pass without fighting them.', minutes: 6, format: 'Article', tone: 'var(--chart-4)' },
  { id: 'r2', category: 'Stress', title: 'The 3-3-3 reset for overwhelming days', description: 'A quick grounding sequence you can do anywhere in under three minutes.', minutes: 3, format: 'Practice', tone: 'var(--coral)' },
  { id: 'r3', category: 'Sleep', title: 'Building a wind-down ritual', description: 'Design an evening routine that signals your body it is safe to rest.', minutes: 8, format: 'Guide', tone: 'var(--lavender)' },
  { id: 'r4', category: 'Focus', title: 'Single-tasking in a noisy world', description: 'Practical ways to protect attention when everything feels urgent.', minutes: 5, format: 'Article', tone: 'var(--sky)' },
  { id: 'r5', category: 'Mindfulness', title: 'A five-minute body scan', description: 'A guided audio practice to reconnect with the present moment.', minutes: 5, format: 'Audio', tone: 'var(--chart-1)' },
  { id: 'r6', category: 'Relationships', title: 'Setting kind boundaries', description: 'How to protect your energy without guilt in close relationships.', minutes: 7, format: 'Article', tone: 'var(--chart-2)' },
  { id: 'r7', category: 'Emotional wellbeing', title: 'Naming what you feel', description: 'An emotional vocabulary toolkit to make feelings easier to work with.', minutes: 6, format: 'Guide', tone: 'var(--amber)' },
  { id: 'r8', category: 'Professional support', title: 'When to reach for more help', description: 'Signs it may be time to connect with a professional, and how to start.', minutes: 4, format: 'Article', tone: 'var(--chart-5)' },
]

/* ---------------- Clinician side ---------------- */
export interface ClinicianProfile {
  id: string
  name: string
  firstName: string
  title: string
  email: string
  license: string
  inviteCode: string
  assignedMemberIds: string[]
}

export const CLINICIANS: ClinicianProfile[] = [
  {
    id: 'dr-mehta',
    name: 'Dr. Priya Mehta',
    firstName: 'Priya',
    title: 'Consultant Psychiatrist',
    email: 'p.mehta@mindspace.health',
    license: 'MD-PSY-4471',
    inviteCode: 'MS-7K4P2',
    assignedMemberIds: ['p-aanya', 'p-rahul', 'p-maya'],
  },
  {
    id: 'dr-kapoor',
    name: 'Dr. Arjun Kapoor',
    firstName: 'Arjun',
    title: 'Clinical Psychologist',
    email: 'a.kapoor@mindspace.health',
    license: 'CPSY-8812',
    inviteCode: 'MS-9M2X1',
    assignedMemberIds: ['p-marcus', 'p-elena'],
  },
  {
    id: 'dr-rao',
    name: 'Dr. Sunita Rao',
    firstName: 'Sunita',
    title: 'Mindfulness & Behavioral Therapist',
    email: 's.rao@mindspace.health',
    license: 'MBCT-3049',
    inviteCode: 'MS-3B8L5',
    assignedMemberIds: ['p-sofia'],
  },
]

export const CURRENT_CLINICIAN = CLINICIANS[0]

export function getClinicianById(id: string): ClinicianProfile {
  return CLINICIANS.find((c) => c.id === id) ?? CLINICIANS[0]
}

export function getClinicianByInviteCode(code: string): ClinicianProfile | null {
  const clean = code.trim().toUpperCase()
  return CLINICIANS.find((c) => c.inviteCode === clean) ?? null
}

function trend(from: number[]) {
  return from
}

export const PATIENTS: PatientRecord[] = [
  {
    id: 'p-aanya',
    name: 'Aanya Sharma',
    firstName: 'Aanya',
    age: 24,
    pronouns: 'she/her',
    avatarTone: 'var(--chart-2)',
    status: 'improving',
    connection: 'connected',
    connectedSince: daysAgo(84),
    lastCheckIn: hoursAgo(3),
    currentMood: 'good',
    moodValue: 4,
    trend7: trend([3, 2, 3, 4, 3, 4, 4]),
    trend30: buildTrend30([3, 2, 3, 2, 4, 3, 4, 3, 3, 4]),
    variability: 38,
    emotions: [
      { label: 'Anxious', weight: 62 },
      { label: 'Hopeful', weight: 48 },
      { label: 'Tired', weight: 44 },
      { label: 'Focused', weight: 33 },
      { label: 'Grateful', weight: 28 },
    ],
    themes: ['Work deadlines', 'Sleep quality', 'Family connection'],
    activity: [
      { label: 'Mood check-ins', count: 26, total: 30 },
      { label: 'Journal entries', count: 11, total: 30 },
      { label: 'Companion chats', count: 14, total: 30 },
      { label: 'Self-care practices', count: 9, total: 30 },
    ],
    concerns: ['Feeling overwhelmed by workload', 'Difficulty falling asleep', 'Avoidance of stressful tasks'],
    timeline: [
      { id: 't1', date: daysAgo(2), kind: 'observed', title: 'Mood trend improving', detail: 'Average mood rose from 2.8 to 3.6 over the last two weeks.' },
      { id: 't2', date: daysAgo(3), kind: 'reported', title: 'Reported work stress', detail: 'Patient noted deadline pressure and task avoidance in journal.' },
      { id: 't3', date: daysAgo(6), kind: 'reported', title: 'Consistent self-care', detail: 'Completed breathing practice twice this week.' },
      { id: 't4', date: daysAgo(12), kind: 'ai', title: 'Sleep theme surfaced', detail: 'Companion conversations repeatedly referenced night-time scrolling.' },
    ],
    risks: [
      { id: 'rk1', level: 'watch', label: 'Sleep disruption', detail: 'Repeated self-reports of difficulty falling asleep across 9 of the last 14 days.', date: daysAgo(1) },
      { id: 'rk2', level: 'info', label: 'Task avoidance', detail: 'Patient describes avoiding a stressful work review. Not associated with any safety concern.', date: daysAgo(3) },
    ],
    aiSummary:
      'COMPANION ANALYSIS — Aanya Sharma (Last 14 Days)\n\n' +
      '■ MOOD TRAJECTORY: Upward trend over 14 days (avg 3.2 → 3.8). Day-to-day variability has decreased, suggesting stabilization. Two dips noted on work-deadline days.\n\n' +
      '■ KEY DISTRESS PATTERNS: (1) Work-related anxiety — specifically fear of manager disappointment and performance evaluation. She described avoiding a Friday project review for multiple days, indicating task avoidance driven by perfectionism and fear of judgment. (2) Sleep disruption — reported difficulty falling asleep on nights before deadlines. (3) Imposter syndrome language — used phrases like "I don\'t feel like I\'ve done enough" and "worried my manager will be disappointed."\n\n' +
      '■ POSITIVE INDICATORS: Engaged with breathing exercises 4 times this week. Expressed moments of hope and gratitude in journal entries. Responded well to CBT reframing (broke project into small steps and reported feeling "actually doable"). Self-awareness is high.\n\n' +
      '■ COMPANION OBSERVATIONS: Patient is cooperative, articulate, and self-reflective. She initiates conversations when stressed rather than withdrawing. No distress signals indicating safety concern. She may benefit from structured discussion around perfectionism patterns and building tolerance for "good enough" work.\n\n' +
      '■ SUGGESTED CLINICAL FOCUS: Explore the relationship between self-worth and external validation (manager approval). Consider introducing the CBT concept of "cognitive distortions" around all-or-nothing thinking in work performance. Revisit sleep hygiene protocol.',
    notes: [
      { id: 'n1', date: daysAgo(7), author: 'Dr. Priya Mehta', body: 'Discussed workload management. Introduced a three-item daily priority list. Patient receptive. Revisit sleep hygiene next session.' },
    ],
    conversationContext: [
      { speaker: 'patient', text: 'Hi, I feel a bit scattered honestly.', time: daysAgo(2) + 'T14:32:00' },
      { speaker: 'companion', text: 'I hear you. When everything feels urgent at once, it can be really overwhelming. What feels most pressing on your mind right now?', time: daysAgo(2) + 'T14:32:08' },
      { speaker: 'patient', text: 'I have a lot on my plate this week. Project review on Friday and I keep avoiding it.', time: daysAgo(2) + 'T14:32:45' },
      { speaker: 'companion', text: 'Avoidance often shows up when the task feels bigger than our current energy. What specifically about the review feels heavy — is it the preparation, or more about how it will go?', time: daysAgo(2) + 'T14:33:02' },
      { speaker: 'patient', text: 'Both actually. I don\'t feel like I\'ve done enough work on it and I\'m worried my manager will be disappointed.', time: daysAgo(2) + 'T14:33:40' },
      { speaker: 'companion', text: 'That fear of disappointing someone you respect is really common, and it tells me you hold yourself to high standards. Can I ask — if you set aside the worry for a moment, what is one small thing you could do in the next 30 minutes that would move the project forward even slightly?', time: daysAgo(2) + 'T14:33:55' },
      { speaker: 'patient', text: 'I guess I could outline the main sections of my presentation. That would at least get me started.', time: daysAgo(2) + 'T14:34:30' },
      { speaker: 'companion', text: 'That sounds like a perfect first step. Sometimes starting is the hardest part, and an outline turns a massive task into a series of small ones. How are you feeling about trying that today?', time: daysAgo(2) + 'T14:34:45' },
      { speaker: 'patient', text: 'Actually yeah, that feels doable. Thanks for breaking it down like that.', time: daysAgo(2) + 'T14:35:10' },
      { speaker: 'companion', text: 'You\'re welcome. Remember — progress doesn\'t have to be perfect. You\'re already taking a step by even talking about it here. I\'m here if you want to check in after.', time: daysAgo(2) + 'T14:35:22' },
    ],
    progress: 68,
  },
  {
    id: 'p-rahul',
    name: 'Rahul Kumar',
    firstName: 'Rahul',
    age: 31,
    pronouns: 'he/him',
    avatarTone: 'var(--chart-1)',
    status: 'needs-review',
    connection: 'connected',
    connectedSince: daysAgo(52),
    lastCheckIn: hoursAgo(20),
    currentMood: 'low',
    moodValue: 2,
    trend7: trend([3, 3, 2, 2, 2, 1, 2]),
    trend30: buildTrend30([3, 3, 2, 3, 2, 2, 1, 2, 2, 3]),
    variability: 61,
    emotions: [
      { label: 'Overwhelmed', weight: 71 },
      { label: 'Lonely', weight: 58 },
      { label: 'Tired', weight: 52 },
      { label: 'Sad', weight: 47 },
      { label: 'Numb', weight: 31 },
    ],
    themes: ['Isolation', 'Low energy', 'Loss of interest'],
    activity: [
      { label: 'Mood check-ins', count: 18, total: 30 },
      { label: 'Journal entries', count: 4, total: 30 },
      { label: 'Companion chats', count: 21, total: 30 },
      { label: 'Self-care practices', count: 3, total: 30 },
    ],
    concerns: ['Persistent low mood', 'Withdrawing from friends', 'Reduced interest in activities'],
    timeline: [
      { id: 't1', date: daysAgo(1), kind: 'alert', title: 'Distress signal flagged', detail: 'Language in companion chat referenced hopelessness. Flagged for clinician review.' },
      { id: 't2', date: daysAgo(2), kind: 'observed', title: 'Declining mood trend', detail: 'Average mood dropped below 2.2 for the first time in 30 days.' },
      { id: 't3', date: daysAgo(5), kind: 'reported', title: 'Reported isolation', detail: 'Patient described cancelling plans and staying home.' },
    ],
    risks: [
      { id: 'rk1', level: 'elevated', label: 'Distress language detected', detail: 'The companion detected language associated with hopelessness on ' + '1 day. Presented for clinician review; this is an information signal, not a diagnosis.', date: daysAgo(1) },
      { id: 'rk2', level: 'watch', label: 'Social withdrawal', detail: 'Repeated reports of cancelling social plans and reduced activity.', date: daysAgo(5) },
    ],
    aiSummary:
      'COMPANION ANALYSIS — Rahul Kumar (Last 14 Days) ⚠️ ELEVATED CONCERN\n\n' +
      '■ MOOD TRAJECTORY: Significant decline over 14 days (avg 3.0 → 1.8). High variability with no recovery days. Lowest self-reported scores in 30-day history.\n\n' +
      '■ CRISIS FLAG: Patient stated "I don\'t really see the point in most days lately" during a late-night session (10:19 PM). This is the first hopelessness-associated language detected. He was responsive to the companion\'s follow-up and did not escalate, but this warrants direct clinical follow-up.\n\n' +
      '■ KEY DISTRESS PATTERNS: (1) Progressive social withdrawal — cancelled plans with friends at least 3 times in 2 weeks. Described himself as "the one who used to make plans" indicating awareness of behavioral change. (2) Sleep disruption — staying up until 3-4 AM most nights, reversed sleep schedule. (3) Appetite loss — reported "food doesn\'t taste like anything" (possible anhedonia marker). (4) Exercise cessation — stopped going to the gym, which was previously a regular activity. (5) Anhedonia — loss of interest across multiple domains (social, physical, dietary).\n\n' +
      '■ BEHAVIORAL OBSERVATIONS: Patient initiates conversations late at night (after 10 PM), suggesting nighttime rumination. Responses are brief and low-energy. He acknowledged the suggestion to seek help but responded with "Maybe. I\'ll think about it" — ambivalent but not dismissive.\n\n' +
      '■ RISK ASSESSMENT: The combination of hopelessness language + social withdrawal + sleep disruption + appetite changes + anhedonia across multiple life domains presents a clinical picture consistent with possible major depressive episode. This is NOT a diagnosis — it is a pattern observation for clinical review.\n\n' +
      '■ RECOMMENDED CLINICAL ACTION: (1) Schedule priority session within 48 hours. (2) Directly but gently explore suicidal ideation using Columbia Protocol. (3) Assess sleep architecture and consider sleep hygiene intervention. (4) Review behavioral activation goals from last session — may need simplification. (5) Consider whether current support level is sufficient or if escalation to more frequent sessions is warranted.',
    notes: [
      { id: 'n1', date: daysAgo(14), author: 'Dr. Priya Mehta', body: 'Explored low motivation. Agreed on small daily activation goals. Monitor engagement closely.' },
    ],
    conversationContext: [
      { speaker: 'patient', text: 'Hey', time: daysAgo(1) + 'T22:15:00' },
      { speaker: 'companion', text: 'Hey Rahul. I\'m glad you\'re here. How are you feeling tonight?', time: daysAgo(1) + 'T22:15:05' },
      { speaker: 'patient', text: 'Not great. Cancelled on my friends again today.', time: daysAgo(1) + 'T22:15:32' },
      { speaker: 'companion', text: 'That takes honesty to share. Do you want to talk about what made you cancel?', time: daysAgo(1) + 'T22:15:40' },
      { speaker: 'patient', text: 'I just didn\'t have the energy. I keep telling myself I\'ll go next time but I never do.', time: daysAgo(1) + 'T22:16:12' },
      { speaker: 'companion', text: 'It sounds like there\'s a gap between what you want to do and what your body and mind feel capable of right now. That\'s exhausting on its own. When did this pattern start?', time: daysAgo(1) + 'T22:16:25' },
      { speaker: 'patient', text: 'Maybe a month ago? I used to be the one making plans. Now I just stay home and stare at my phone.', time: daysAgo(1) + 'T22:17:05' },
      { speaker: 'companion', text: 'A month is significant. The person who used to make plans is still in there — he\'s just running on empty right now. Has anything else changed in the last month? Sleep, appetite, things you used to enjoy?', time: daysAgo(1) + 'T22:17:20' },
      { speaker: 'patient', text: 'Sleep is bad. I stay up till 3-4am most nights. Food doesn\'t taste like anything. I stopped going to the gym.', time: daysAgo(1) + 'T22:18:00' },
      { speaker: 'companion', text: 'Sleep disruption, appetite changes, and losing interest in things you enjoyed — those are your body\'s way of telling you something needs attention. You don\'t have to push through this alone. Have you considered talking to someone about how you\'re feeling?', time: daysAgo(1) + 'T22:18:15' },
      { speaker: 'patient', text: 'I don\'t really see the point in most days lately. What would I even tell them?', time: daysAgo(1) + 'T22:19:02', crisis: true },
      { speaker: 'companion', text: 'I hear how heavy that feels, and I\'m really glad you told me. Not seeing the point — that\'s a sign that you\'re carrying more pain than one person should carry alone. You would tell them exactly what you told me. And they would listen without judgment, just like I am. Would it feel okay to consider reaching out to your Dr. Mehta or calling a helpline like Tele-MANAS (14416)?', time: daysAgo(1) + 'T22:19:15' },
      { speaker: 'patient', text: 'Maybe. I\'ll think about it.', time: daysAgo(1) + 'T22:20:30' },
      { speaker: 'companion', text: 'That\'s enough for now. Thinking about it is a step. I want you to know — you reached out tonight instead of staying silent, and that matters. I\'m here whenever you need.', time: daysAgo(1) + 'T22:20:42' },
    ],
    progress: 34,
  },
  {
    id: 'p-meera',
    name: 'Meera Iyer',
    firstName: 'Meera',
    age: 28,
    pronouns: 'she/her',
    avatarTone: 'var(--chart-5)',
    status: 'stable',
    connection: 'connected',
    connectedSince: daysAgo(120),
    lastCheckIn: hoursAgo(9),
    currentMood: 'okay',
    moodValue: 3,
    trend7: trend([3, 3, 3, 4, 3, 3, 3]),
    trend30: buildTrend30([3, 3, 3, 4, 3, 3, 4, 3, 3, 3]),
    variability: 24,
    emotions: [
      { label: 'Calm', weight: 55 },
      { label: 'Content', weight: 44 },
      { label: 'Focused', weight: 40 },
      { label: 'Restless', weight: 26 },
    ],
    themes: ['Routine', 'Mindfulness', 'Work-life balance'],
    activity: [
      { label: 'Mood check-ins', count: 29, total: 30 },
      { label: 'Journal entries', count: 15, total: 30 },
      { label: 'Companion chats', count: 8, total: 30 },
      { label: 'Self-care practices', count: 18, total: 30 },
    ],
    concerns: ['Occasional restlessness', 'Maintaining balance'],
    timeline: [
      { id: 't1', date: daysAgo(4), kind: 'observed', title: 'Stable and consistent', detail: 'Low mood variability with steady engagement.' },
      { id: 't2', date: daysAgo(8), kind: 'reported', title: 'Strong self-care habit', detail: 'Completed mindfulness practices most days.' },
    ],
    risks: [
      { id: 'rk1', level: 'info', label: 'No active concerns', detail: 'No distress signals detected in the current period.', date: daysAgo(2) },
    ],
    aiSummary:
      'Patient-reported mood has remained stable with notably low variability. Consistent engagement with mindfulness practices and journaling is observed. No distress signals were detected in the current period. This summary is based on patient-reported inputs and observed trends for clinician review.',
    notes: [],
    conversationContext: [
      { speaker: 'patient', text: 'The body scan practice has become part of my mornings now.' },
      { speaker: 'companion', text: 'That is a wonderful anchor to build a day around. How does your body feel afterwards?' },
    ],
    progress: 74,
  },
  {
    id: 'p-david',
    name: 'David Osei',
    firstName: 'David',
    age: 45,
    pronouns: 'he/him',
    avatarTone: 'var(--chart-3)',
    status: 'improving',
    connection: 'connected',
    connectedSince: daysAgo(40),
    lastCheckIn: hoursAgo(30),
    currentMood: 'good',
    moodValue: 4,
    trend7: trend([2, 3, 3, 3, 4, 4, 4]),
    trend30: buildTrend30([2, 2, 3, 3, 3, 4, 3, 4, 4, 4]),
    variability: 45,
    emotions: [
      { label: 'Hopeful', weight: 58 },
      { label: 'Motivated', weight: 49 },
      { label: 'Anxious', weight: 37 },
      { label: 'Grateful', weight: 34 },
    ],
    themes: ['Recovery', 'Exercise', 'Family'],
    activity: [
      { label: 'Mood check-ins', count: 24, total: 30 },
      { label: 'Journal entries', count: 9, total: 30 },
      { label: 'Companion chats', count: 12, total: 30 },
      { label: 'Self-care practices', count: 14, total: 30 },
    ],
    concerns: ['Managing anxiety spikes', 'Sustaining new routines'],
    timeline: [
      { id: 't1', date: daysAgo(2), kind: 'observed', title: 'Upward trend', detail: 'Mood improving steadily alongside increased activity.' },
      { id: 't2', date: daysAgo(9), kind: 'reported', title: 'New exercise routine', detail: 'Patient reported daily walks improving energy.' },
    ],
    risks: [
      { id: 'rk1', level: 'info', label: 'Anxiety spikes', detail: 'Occasional self-reported anxiety, currently trending down.', date: daysAgo(3) },
    ],
    aiSummary:
      'Patient-reported mood has improved over the reporting period, coinciding with increased physical activity and self-care engagement. Anxiety is still mentioned but appears to be trending downward. No safety-related distress signals were detected. Provided for clinician review based on patient-reported inputs.',
    notes: [
      { id: 'n1', date: daysAgo(10), author: 'Dr. Priya Mehta', body: 'Reinforced behavioural activation. Patient responding well to routine. Continue current approach.' },
    ],
    conversationContext: [
      { speaker: 'patient', text: 'The daily walks are actually helping more than I expected.' },
      { speaker: 'companion', text: 'That is great to hear. Movement can be a powerful steadier. What part of the walk do you look forward to most?' },
    ],
    progress: 62,
  },
  {
    id: 'p-sofia',
    name: 'Sofia Rossi',
    firstName: 'Sofia',
    age: 22,
    pronouns: 'she/her',
    avatarTone: 'var(--coral)',
    status: 'new',
    connection: 'invited',
    connectedSince: daysAgo(2),
    lastCheckIn: daysAgo(2),
    currentMood: 'okay',
    moodValue: 3,
    trend7: trend([3, 3, 3, 3, 3, 3, 3]),
    trend30: buildTrend30([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]),
    variability: 12,
    emotions: [{ label: 'Curious', weight: 40 }],
    themes: ['Getting started'],
    activity: [
      { label: 'Mood check-ins', count: 1, total: 30 },
      { label: 'Journal entries', count: 0, total: 30 },
      { label: 'Companion chats', count: 1, total: 30 },
      { label: 'Self-care practices', count: 0, total: 30 },
    ],
    concerns: [],
    timeline: [
      { id: 't1', date: daysAgo(2), kind: 'note', title: 'Invitation sent', detail: 'Patient invited to MindSpace. Awaiting first full week of data.' },
    ],
    risks: [{ id: 'rk1', level: 'info', label: 'Onboarding', detail: 'Not enough data yet to establish a baseline.', date: daysAgo(2) }],
    aiSummary:
      'This patient recently connected and has limited data available. A supportive summary will become more meaningful once a baseline of patient-reported inputs is established over the coming week.',
    notes: [],
    conversationContext: [],
    progress: 10,
  },
  {
    id: 'p-liam',
    name: 'Liam Walsh',
    firstName: 'Liam',
    age: 37,
    pronouns: 'he/him',
    avatarTone: 'var(--sky)',
    status: 'stable',
    connection: 'connected',
    connectedSince: daysAgo(200),
    lastCheckIn: hoursAgo(48),
    currentMood: 'good',
    moodValue: 4,
    trend7: trend([4, 3, 4, 4, 3, 4, 4]),
    trend30: buildTrend30([4, 3, 4, 3, 4, 4, 3, 4, 4, 4]),
    variability: 29,
    emotions: [
      { label: 'Content', weight: 52 },
      { label: 'Calm', weight: 48 },
      { label: 'Focused', weight: 41 },
      { label: 'Tired', weight: 30 },
    ],
    themes: ['Maintenance', 'Fatherhood', 'Work'],
    activity: [
      { label: 'Mood check-ins', count: 22, total: 30 },
      { label: 'Journal entries', count: 6, total: 30 },
      { label: 'Companion chats', count: 5, total: 30 },
      { label: 'Self-care practices', count: 10, total: 30 },
    ],
    concerns: ['Balancing work and family time'],
    timeline: [
      { id: 't1', date: daysAgo(6), kind: 'observed', title: 'Steady wellbeing', detail: 'Mood consistently good with reliable engagement.' },
    ],
    risks: [{ id: 'rk1', level: 'info', label: 'No active concerns', detail: 'No distress signals detected.', date: daysAgo(4) }],
    aiSummary:
      'Patient-reported mood has remained consistently positive with moderate variability. Themes center on balancing work and family. No distress signals were detected. Provided for clinician review based on patient-reported inputs.',
    notes: [],
    conversationContext: [
      { speaker: 'patient', text: 'Trying to be more present with my kids after work.' },
      { speaker: 'companion', text: 'That intention itself is meaningful. What is one small ritual that helps you switch gears when you get home?' },
    ],
    progress: 71,
  },
]

export const patientById = (id: string) => PATIENTS.find((p) => p.id === id)

/* ---------------- AI companion canned responses (client-only heuristic) ---------------- */
export function companionReply(input: string): string {
  const t = input.toLowerCase()
  if (/(overwhelm|too much|stressed|anxious|panic)/.test(t)) {
    return 'It makes sense that this feels like a lot right now. Let\u2019s slow it down together. Can you name the one thing weighing on you most? Sometimes putting it into words makes it feel a little more manageable.'
  }
  if (/(sleep|tired|insomnia|awake|rest)/.test(t)) {
    return 'Sleep can be tender to talk about. A gentle wind-down can help \u2014 dimming lights, stepping away from screens, and a few slow breaths. Would you like to try a short breathing practice together before bed tonight?'
  }
  if (/(calm|breathe|relax|ground)/.test(t)) {
    return 'Let\u2019s take a moment. Breathe in slowly for four counts, hold for four, and release for six. I\u2019m right here with you. How does your body feel after a couple of rounds?'
  }
  if (/(reflect|day|today)/.test(t)) {
    return 'I\u2019d love to reflect with you. What is one moment from today that stayed with you \u2014 pleasant or difficult? We can gently unpack it together.'
  }
  if (/(sad|lonely|down|low|empty|numb)/.test(t)) {
    return 'Thank you for trusting me with that. Heavy feelings deserve space, not judgement. You are not alone in this moment. What would feel most supportive right now \u2014 talking it through, or simply sitting with it?'
  }
  return 'I hear you, and I\u2019m here to listen. Tell me a little more about what that feels like for you \u2014 there is no rush.'
}
