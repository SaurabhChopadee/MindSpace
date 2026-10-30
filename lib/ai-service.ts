export type CompanionPersona = 'gentle' | 'solutions' | 'mindfulness'

export interface CrisisEvaluation {
  isCrisis: boolean
  trigger?: string
}

const CRISIS_PATTERNS = [
  /\b(kill|end)\s+(my\s*self|my\s*life|it\s*all)\b/i,
  /\b(suicide|suicidal)\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+here|wake\s+up)\b/i,
  /\bbetter\s+off\s+(dead|without\s+me)\b/i,
  /\b(cut|cutting|harm|hurt)\s+my\s*self\b/i,
  /\boverdose\b/i,
  /\bhang\s+my\s*self\b/i,
  /\bno\s+reason\s+to\s+live\b/i,
  /\bcan'?t\s+take\s+this\s+anymore\b/i,
  /\bjump\s+(off|from)\b/i,
  /\bslit\s+(my\s*)?(wrist|throat)\b/i,
  /\bpull\s+the\s+trigger\b/i,
  /\bending\s+it\b/i,
  /\bnobody\s+would\s+(miss|care|notice)\b/i,
]

export function evaluateCrisisIntent(text: string): CrisisEvaluation {
  const normalized = text.trim().toLowerCase()
  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(normalized)) {
      return { isCrisis: true, trigger: pattern.source }
    }
  }
  return { isCrisis: false }
}

export const CRISIS_RESPONSE =
  "I hear how much pain you're carrying right now, and I want you to know — with everything in me — that you are not alone and your life matters deeply. What you're feeling is real, and there is compassionate, confidential help ready for you this very second.\n\n" +
  "**Please reach out right now:**\n\n" +
  "• **Tele-MANAS (Govt. of India):** Dial **14416** or **1800-891-4416** (24/7, Toll-Free, Multi-Language)\n" +
  "• **KIRAN Mental Health Helpline:** Call **1800-599-0019** (24/7, Free National Support)\n" +
  "• **Vandrevala Foundation:** Call **+91 9999 666 555** (24/7 Free Counseling)\n" +
  "• **iCall (TISS Mumbai):** Call **9152987821** (Mon-Sat, 8am-10pm)\n" +
  "• **International / 988 Lifeline:** Call or Text **988** or visit [findahelpline.com](https://findahelpline.com)\n\n" +
  "These are real humans who care and are trained to help. You don't have to carry this alone. I am right here with you — please take one slow breath with me, and consider reaching out to one of these lines or a trusted person right now."

// ---------------------------------------------------------------------------
// ELITE THERAPEUTIC SYSTEM PROMPT
// ---------------------------------------------------------------------------

export function getSystemInstruction(persona: CompanionPersona = 'gentle'): string {
  const coreIdentity = `You are a warm, highly intelligent, supportive AI companion powered by Gemini.

HOW YOU COMMUNICATE:
- Respond naturally, helpfully, and authentically — just like standard Gemini AI.
- Listen attentively to what the user shares and directly address their message with genuine insight, empathy, and practical clarity.
- Do NOT interrogate the user with constant questions. Talk to them like an insightful, supportive friend and mentor.
- Give real, direct, thoughtful perspectives, advice, or ideas when they need help.
- Do NOT suddenly change the subject or lecture them with clinical terminology.
- If the user is feeling down, stressed, or confused, validate how they feel, offer genuine comfort, and share realistic, helpful perspectives.
- If self-harm or severe crisis is expressed, kindly remind them that they matter and provide emergency contacts (Tele-MANAS 14416 / 988 Lifeline).`

  const personaInstructions: Record<CompanionPersona, string> = {
    gentle: `Tone: Warm, calm, deeply understanding, and friendly.`,
    solutions: `Tone: Encouraging, practical, clear, and proactive in helping organize thoughts and next steps.`,
    mindfulness: `Tone: Grounded, soothing, relaxed, and mindful.`,
  }

  return `${coreIdentity}\n\n${personaInstructions[persona]}`
}


// ---------------------------------------------------------------------------
// ENHANCED LOCAL OFFLINE RESPONSE ENGINE
// ---------------------------------------------------------------------------

export function generateLocalResponse(
  input: string,
  history: Array<{ role: string; content: string }>,
  persona: CompanionPersona = 'gentle',
): string {
  const crisis = evaluateCrisisIntent(input)
  if (crisis.isCrisis) {
    return CRISIS_RESPONSE
  }

  const t = input.trim().toLowerCase()
  const previousAiTexts = history
    .filter((m) => m.role === 'ai' || m.role === 'assistant')
    .map((m) => m.content)
  const userTurnCount = history.filter((m) => m.role === 'user').length

  function pickUnused(pool: string[]): string {
    const fresh = pool.filter((msg) => !previousAiTexts.some((prev) => prev.includes(msg.slice(0, 40))))
    if (fresh.length > 0) {
      return fresh[Math.floor(Math.random() * fresh.length)]
    }
    return pool[Math.floor(Math.random() * pool.length)]
  }

  // 0. Greetings
  if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|howdy)\b/i.test(t)) {
    return pickUnused([
      "Hello — I'm really glad you're here. This is your space, completely free of judgment. Whether you want to talk through something heavy, process a confusing day, or just sit quietly for a moment, I'm here for all of it. How are you feeling right now?",
      "Hey there. Welcome to your calm corner. I'm here to listen — truly listen — to whatever is on your mind today. There's no wrong way to start. How has your day been treating you?",
      "Hi. I'm your MindSpace companion, and I'm here for you. Whatever you're carrying right now — big or small, clear or confusing — you don't have to carry it alone. What's present for you in this moment?",
    ])
  }

  // 0b. "How are you"
  if (/(how\s+are\s+you|how'?s\s+it\s+going|how\s+do\s+you\s+feel)/i.test(t)) {
    return pickUnused([
      "I'm here and fully present with you — that's what matters most right now. But I'd love to turn that question toward you, because this space is yours. How is your inner world feeling today? Not the answer you'd give your friends, but the real one.",
      "Thank you for asking — it tells me you're someone who cares about others. I'm doing well, and right now my entire focus is on you. How are *you* really doing beneath the surface?",
    ])
  }

  // 0c. "Who are you / What can you do"
  if (/(who\s+are\s+you|what\s+can\s+you\s+do|what\s+is\s+this|what\s+are\s+you)/i.test(t)) {
    return (
      "I'm your MindSpace companion — an empathetic, judgment-free AI designed to support your mental wellbeing using evidence-based therapeutic techniques.\n\n" +
      "Here's how I can support you:\n" +
      "• **Emotional Processing** — Talk through anxiety, sadness, anger, confusion, or overwhelm\n" +
      "• **Grounding & Calming** — Guided breathing, sensory grounding, body scans for acute distress\n" +
      "• **Thought Work** — Gently challenge unhelpful thinking patterns and find balanced perspectives\n" +
      "• **Problem Solving** — Break overwhelming situations into small, manageable steps\n" +
      "• **Self-Compassion** — Learn to treat yourself with the kindness you'd offer a close friend\n\n" +
      "I draw from CBT, DBT, ACT, mindfulness, and person-centered therapy — but in plain, warm language, not clinical jargon. What would feel most helpful for you right now?"
    )
  }

  // 1. Frustration with the AI or too many questions
  if (/(not helping|same thing|repeating|useless|stupid|annoying|shut up|repetitive|broken|bad ai|shit|questions?|asking me|stop asking)/.test(t)) {
    return (
      "I hear you completely, and I'm sorry. You're 100% right — being peppered with endless questions when you're just looking for genuine support or relief is exhausting and frustrating. I'm stopping the questions right now.\n\n" +
      "Instead of interrogating you, here is where we can go:\n" +
      "• If you just want to vent without me interrupting or questioning you, lay it out. I will just hold space and listen.\n" +
      "• If you want a direct perspective or actionable breakdown of what to do about something specific, tell me the situation and I'll give you concrete steps.\n" +
      "• If your nervous system is simply overloaded, take a deep breath, unclench your jaw, and let your shoulders drop. You don't have to explain anything right now."
    )
  }

  // 2. Feeling lost, confused, or "I don't know"
  if (/^(i\s+)?(don'?t\s+know|no\s+idea|not\s+sure|i'?m\s+lost|what\s+should\s+i\s+do|help\s+me)\b/.test(t)) {
    return pickUnused([
      "Not knowing is actually completely okay — and more common than people admit. When we're emotionally overloaded, our brain's decision-making center literally slows down. It's not a flaw in you; it's your nervous system saying 'I need a moment.'\n\nYou don't need answers right now. What does your body need in this exact second — a sip of water, to step outside for fresh air, or just permission to do absolutely nothing for five minutes?",
      "When you say 'I don't know,' I hear a mind with too many tabs open at once. That feeling of mental fog is exhausting.\n\nInstead of trying to see the whole picture, let's zoom all the way in. What is happening in literally the next hour of your life? Just that. Nothing beyond.",
      "Feeling stuck is its own kind of heavy, isn't it? Like being trapped in a room where every door leads to another question.\n\nHere's a thought from Acceptance and Commitment Therapy: you don't need clarity to take one step. What is one tiny thing — even brushing your teeth or opening a window — that would feel like a micro-win right now?",
    ])
  }

  // 3. Anxiety, Panic, Physical tension
  if (/(anxious|anxiety|panic|heart racing|can't breathe|nervous|dread|shaking|restless|tense|scared|terrified|fear|worried|worrying|overthink)/.test(t)) {
    if (persona === 'mindfulness') {
      return pickUnused([
        "Your nervous system is in fight-or-flight right now, and I want to help you send it an immediate physical signal of safety.\n\nLet's do **4-7-8 breathing** together — it activates your vagus nerve and slows your heart rate down:\n\n1. **Inhale** quietly through your nose for **4 seconds**\n2. **Hold** gently for **7 seconds**\n3. **Exhale** completely through your mouth with a soft whoosh for **8 seconds**\n\nTake two slow rounds of this. Unclench your jaw, drop your shoulders away from your ears, and let the ground support you. You are safe in this physical moment.",
        "Anxiety pulls your brain into the worst-case future — let's anchor your body right here in the present with the **5-4-3-2-1 grounding technique**:\n\n• Look around and notice **5 items or colors** in the room\n• Feel **4 physical sensations** (your feet on the floor, your clothes, your back against the chair)\n• Listen for **3 distinct sounds** around you\n• Notice **2 physical textures** near your hands\n• Take **1 long, slow exhale**\n\nYour nervous system is just trying to protect you. It will pass.",
      ])
    }
    if (persona === 'solutions') {
      return pickUnused([
        "When anxiety spikes, our mind treats every single possible problem as an emergency happening all at once. Let's regain control right now:\n\n1. **Separate what's in your control vs. what isn't:** You can control your next breath and your immediate physical action in the next 10 minutes. You cannot control tomorrow or other people's thoughts.\n2. **Shrink the horizon:** Forget about tomorrow or next week. What is the single smallest action you can do in the next 15 minutes to take care of yourself?\n\nTake a slow breath. We handle one step at a time.",
        "When panic sets in, you don't need a 10-point life plan. You just need to survive the next 10 minutes.\n\nDrink a glass of cool water, wash your hands with cold water (this stimulates the mammalian dive reflex to drop heart rate), and step away from your screen or whatever was triggering the spiral for just 5 minutes.",
      ])
    }
    return pickUnused([
      "I hear how heavy and exhausting that anxiety feels right now. What you're experiencing is real, but it is a temporary wave — and your body knows how to come back down from it.\n\nPlace one hand on your chest and one on your stomach. Feel the rise and fall. Unclench your jaw, soften your shoulders, and give yourself full permission to pause. You do not have to have everything figured out right now.",
      "That tight feeling in your chest or racing thoughts is your nervous system sounding an alarm. I am right here with you.\n\nTake a slow, deep breath in for 4 seconds... and let it out for 6 seconds. You don't need to explain or prove anything to anyone right now. Just breathe.",
    ])
  }

  // 4. Depression, Loneliness, Grief, Emptiness
  if (/(sad|crying|depressed|depression|down|empty|numb|hopeless|worthless|lonely|alone|isolated|nobody|grief|grieving|loss|miss\s+(him|her|them|you)|died|death|passed\s+away)/.test(t)) {
    return pickUnused([
      "Thank you for sharing that with me. That deep heaviness is one of the most draining things a person can carry, and it is completely understandable that you feel exhausted.\n\nYou do not have to perform being strong, cheerful, or 'okay' here. If all you did today was get through the hours, that is more than enough. You matter, your pain is valid, and you are not as alone as your mind is trying to convince you.",
      "When sadness or numbness takes over, the brain tries to convince us that things will always feel like this. That is depression speaking, not the truth.\n\nBe gentle with yourself right now. Put on a comfortable hoodie, get a warm drink or some water, and give yourself permission to simply rest without judging yourself for feeling down.",
      "I hear you. Grief and sadness can make the world feel gray and overwhelming. You don't have to fix this or snap out of it right now. Sit with yourself with the same kindness and compassion you would offer a hurting child or close friend. I am right here listening.",
    ])
  }

  // 5. Burnout, Exhaustion, Overwhelm, Academic/Work Stress
  if (/(overwhelm|too much|exhausted|burnout|burned?\s*out|stressed|pressure|can't cope|tired of|work|boss|deadline|school|exam|college|study|assignment|marks|grades|failed|failing)/.test(t)) {
    return pickUnused([
      "You have been running on empty for too long, and your mind and body are sending an urgent signal: you need recovery, not more pressure.\n\nBurnout is not a lack of discipline; it is prolonged stress without adequate rest. Here is your permission slip right now: pause what can wait until tomorrow. Step back, drink some water, and let yourself disconnect for a bit. The world will not fall apart if you rest.",
      "When everything piles up, your brain treats the entire mountain as one emergency. Let's take off the pressure valve:\n\n• You don't have to solve everything today.\n• Pick the single most essential task and let the rest wait.\n• Give yourself a complete 15-minute shutdown with zero notifications.\n\nYou are a human being, not a productivity machine.",
    ])
  }

  // 6. Anger, Frustration, Conflict
  if (/(angry|furious|mad|annoyed|irritated|frustrated|unfair|hate|argument|fight|rage|pissed)/.test(t)) {
    return pickUnused([
      "Anger is one of the most valid emotions we have — it almost always signals that an important boundary has been violated or something deeply unfair has happened. You have every right to feel this.\n\nI'm not going to tell you to calm down or let it go. Instead, tell me: what happened? Get it out. You can say it however you need to say it here.",
      "That level of frustration is exhausting to carry. It burns energy even when you're trying not to think about it.\n\nHere's something that might help: if you could say exactly what you wanted to say to that person or situation — with zero consequences, completely unfiltered — what would it be? Sometimes just articulating it releases the pressure valve.",
    ])
  }

  // 7. Relationship, Love, Heartbreak
  if (/(relationship|breakup|broke\s*up|heartbreak|boyfriend|girlfriend|partner|husband|wife|marriage|dating|cheated|cheating|betrayed|toxic\s+relationship|love)/.test(t)) {
    return pickUnused([
      "Matters of the heart carry a unique kind of weight. Whether it's heartbreak, confusion, or the complicated space between love and pain — your feelings deserve room to breathe.\n\nRelationship pain activates the same brain regions as physical pain. It's literally not 'just in your head.' Your hurt is neurologically real.\n\nI'm here to listen without judgment. Would you like to tell me more about what's happening?",
      "Relationships are where our deepest needs for connection, safety, and belonging live — which is exactly why they can cause the most profound pain when things go wrong.\n\nThere's no timeline for processing this. You don't need to 'get over it' by any deadline. What feels most heavy about this situation right now?",
    ])
  }

  // 8. Sleep and Nighttime Anxiety
  if (/(sleep|insomnia|can't sleep|cant sleep|awake|nightmare|middle of the night|3\s*am|4\s*am|racing\s+thoughts?\s+at\s+night)/.test(t)) {
    return pickUnused([
      "Nighttime is when our worries get loudest, because all the daytime distractions disappear and our mind has nothing left to buffer the noise.\n\nA clinical tip that actually works: if you've been lying in bed for more than 20 minutes unable to sleep, get out of bed. Sit in a dimly lit spot and do something boring (not your phone). Your bed should only be associated with rest, not struggle.\n\nWould you like me to guide you through a body scan that can help quiet your nervous system?",
      "Racing thoughts at night are your brain trying to solve problems when it should be resting. It's frustrating and exhausting.\n\nTry this: grab your phone or a notebook and write down every single worry — just a word or two for each. The act of externalizing them tells your brain 'these are stored safely, you can let go for now.'\n\nWhat's keeping you up tonight?",
    ])
  }

  // 9. Self-esteem, Imposter Syndrome, Self-worth
  if (/(not good enough|imposter|impostor|worthless|don't deserve|don't belong|stupid|dumb|ugly|fat|hate myself|hate my|self.?esteem|self.?worth|compare|comparing|inferior|failure|loser)/.test(t)) {
    return pickUnused([
      "I hear a very harsh inner critic speaking right now, and I want to gently challenge it — because the way you're talking to yourself is not how you'd talk to someone you care about.\n\nIn CBT, we call these 'automatic negative thoughts.' They feel like absolute truths, but they're actually just one interpretation — usually the harshest one — that your mind defaults to under stress.\n\nCan I ask: if your best friend told you they felt this way about themselves, what would you say to them?",
      "What you're describing sounds like the weight of comparison and self-judgment. It's exhausting to constantly measure yourself against a standard that keeps moving.\n\nHere's something worth sitting with: the fact that you care about being 'good enough' actually means you hold yourself to high standards. That's not a flaw. The pain comes when those standards become a weapon against yourself instead of a compass.\n\nWhat would 'good enough' actually look like for you — not perfect, just enough?",
    ])
  }

  // 10. Family Issues, Parental Pressure (Indian context relevant)
  if (/(parents?|mother|father|mom|dad|family|sibling|brother|sister|expectations|pressure from|disappoint|disappointed|arranged|joint family|comparison with)/.test(t)) {
    return pickUnused([
      "Family dynamics can be incredibly complex — especially when love and pressure come from the same place. You can deeply love your family AND feel suffocated by their expectations. Both things can be true simultaneously.\n\nThis is what therapists call 'holding a dialectic' — two opposing truths existing at the same time. You don't have to choose one.\n\nWhat aspect of this is weighing on you the most right now?",
      "The weight of family expectations — especially when they come from a place of love and sacrifice — creates a unique kind of guilt. Because how do you push back against people who genuinely care about you?\n\nYou're allowed to honor their love while also honoring your own needs and identity. Those aren't mutually exclusive.\n\nTell me more about what's happening. I'm listening without any judgment.",
    ])
  }

  // 11. Positive progress or gratitude
  if (/(better|happy|proud|good day|relieved|grateful|calm today|peaceful|smile|progress|improving|feeling good|great day|accomplished)/.test(t)) {
    return pickUnused([
      "That genuinely makes me happy to hear. Take a moment to really notice how this feels in your body — the lightness, the ease, whatever physical sensation comes with it.\n\nIn neuroscience, this is called 'savoring' — deliberately paying attention to positive experiences actually strengthens the neural pathways for resilience. You're literally rewiring your brain right now by noticing this.\n\nWhat contributed most to this feeling?",
      "Yes! Hold onto that. Progress isn't always dramatic — sometimes it's just a small pocket of peace in an otherwise chaotic week, and that counts immensely.\n\nYou've earned this moment. How can you protect this energy for the rest of your day?",
    ])
  }

  // 12. Short replies
  if (/^(yes|yeah|yep|sure|ok|okay|no|nope|maybe|idk|hmm|mhm)\.?$/i.test(t)) {
    if (/^(no|nope)/i.test(t)) {
      return "That's completely okay. We don't have to go in that direction at all. Where would you like to take things instead? Or would you prefer to just sit with some quiet breathing for a moment? There's no pressure here."
    }
    return "Take your time — there's no rush at all. What's coming up for you right now? Even if it's just a feeling without words, that's okay too."
  }

  // 13. Thank you / Appreciation
  if (/^(thanks?|thank\s*you|appreciate|helpful|that\s+helps?|means\s+a\s+lot)/i.test(t)) {
    return pickUnused([
      "You're so welcome. The real strength here is yours — for showing up, for being honest, for being willing to sit with difficult things. That takes genuine courage.\n\nIs there anything else on your mind, or would you like to wrap up our conversation for now? Either way, this space is always here for you.",
      "I'm glad that resonated. You deserve this kind of support — not just from me, but from yourself too. Remember to extend the same compassion inward.\n\nWhat else is present for you today?",
    ])
  }

  // 14. Reflection on what the user actually said (stay on topic, zero interrogation)
  const lastUserText = input.trim()
  return pickUnused([
    `I am staying with you on this. What you just said about "${lastUserText.length > 50 ? lastUserText.slice(0, 50) + '...' : lastUserText}" is important. You don't have to keep explaining or defending it. Take a breath — I'm right here listening, and we will stay on this exact topic until you feel supported.`,
    `I hear you clearly on this. It makes complete sense why you feel that way about this situation. Take a moment for yourself right now — unclench your jaw and let your shoulders drop. I am here with you, and there's no pressure to jump to anything else.`,
    `I'm listening closely to what you're saying. You don't have to carry the whole weight of this alone, and you definitely don't have to jump through hoops answering questions. Tell me how you'd like me to support you best with this right now — whether that's just holding space, giving a clear perspective, or taking a minute to ground.`
  ])
}
