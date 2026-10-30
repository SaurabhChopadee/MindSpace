'use client'

import { useEffect } from 'react'
import { BookOpen, X, Clock, Check } from 'lucide-react'
import { usePatientData } from '@/lib/patient-store'
import type { Resource } from '@/lib/types'

const RESOURCE_FULL_CONTENT: { [id: string]: { sections: { heading: string; body: string }[]; takeaway: string; reflectionQuestion: string } } = {
  r1: {
    sections: [
      {
        heading: 'Understanding the Anxious Wave',
        body: 'Anxiety behaves like an ocean wave: it rises, peaks, and naturally subsides. When we resist anxious thoughts or fight to eliminate them immediately, we inadvertently amplify the physiological arousal.',
      },
      {
        heading: 'The Practice of Non-Resistance',
        body: 'Instead of struggling against the tide, imagine stepping slightly back onto the shore. Name what is occurring: "Here is anxiety. My heart is beating faster because my nervous system is trying to protect me." By acknowledging the wave without endorsing the anxious story, its duration shortens significantly.',
      },
      {
        heading: 'Anchoring in Physical Space',
        body: 'Look around and identify three solid objects in your immediate room. Feel the weight of your body resting against the surface beneath you. The wave will crest and recede — your only job right now is to stay anchored.',
      },
    ],
    takeaway: 'Anxiety is a transient physiological wave. It reaches its peak and declines on its own if we do not add more fuel through resistance.',
    reflectionQuestion: 'What physical sensation tells you an anxious wave has begun, and how can you offer it gentleness rather than alarm?',
  },
  r2: {
    sections: [
      {
        heading: 'Why the 3-3-3 Rule Works',
        body: 'When stress overtakes working memory, the amygdala shifts attention into threat-scanning. The 3-3-3 method provides an external cognitive anchor that rapidly re-engages the prefrontal cortex.',
      },
      {
        heading: 'Step 1: Look & Name Three Things',
        body: 'Scan your environment and silently name three distinct objects you can see. Notice their colors, textures, and distances. This interrupts internal rumination and pulls awareness outward.',
      },
      {
        heading: 'Step 2: Listen for Three Sounds',
        body: 'Close your eyes or soften your gaze and listen for three different sounds. It might be the hum of a computer, traffic in the distance, or your own breath.',
      },
      {
        heading: 'Step 3: Move Three Parts of Your Body',
        body: 'Rotate your ankles, roll your shoulders, or flex and release your fingers. Physical movement signals to the nervous system that you have agency and physical safety.',
      },
    ],
    takeaway: 'Three sights, three sounds, and three movements return your attention to the concrete physical present.',
    reflectionQuestion: 'How does your bodily state feel right now compared to three minutes ago?',
  },
  r3: {
    sections: [
      {
        heading: 'Sleep is An Invitation, Not a Command',
        body: 'We cannot force sleep to arrive; we can only create the conditions where the body feels safe enough to let down its guard. Evening rituals act as behavioral signposts that signal the parasympathetic system.',
      },
      {
        heading: 'The Digital Twilight',
        body: 'Bright artificial light and algorithmic feeds delay melatonin production and trigger dopamine spikes. Giving yourself a 30-to-45 minute digital buffer zone provides the mental runway required for restorative slow-wave sleep.',
      },
      {
        heading: 'Warmth and Transition',
        body: 'Warm herbal tea, dim amber lighting, comfortable clothing, and a few slow exhales create sensory comfort. When you lie down, view rest itself as successful, regardless of how quickly sleep comes.',
      },
    ],
    takeaway: 'A regular wind-down cue tells your nervous system that the demands of the day are officially closed.',
    reflectionQuestion: 'What is one small evening habit you can soften or release to protect your bedtime peace?',
  },
  r4: {
    sections: [
      {
        heading: 'The Myth of Multitasking',
        body: 'Neuroscience reveals that the brain does not multitask; it rapid-switches between tasks, incurring a high cognitive switching cost that produces exhaustion, error, and chronic low-grade anxiety.',
      },
      {
        heading: 'Protecting Single Attention',
        body: 'When tackling work or study, choose one clear focus unit for 20–25 minutes. Close background tabs, mute unnecessary pings, and treat this window as sacred attention.',
      },
      {
        heading: 'The Grace of Small Completions',
        body: 'Finishing even one modest task to completion delivers a deep sense of psychological calm that jumping between ten half-finished items never can.',
      },
    ],
    takeaway: 'Focus is an act of gentle self-protection against the overwhelming noise of modern demands.',
    reflectionQuestion: 'What is the single most meaningful item on your desk or screen today?',
  },
  r5: {
    sections: [
      {
        heading: 'Reconnecting with the Body',
        body: 'Modern life frequently pulls our attention entirely into our thoughts, leaving the physical body unacknowledged. A somatic scan reunites mental awareness with physical grounding.',
      },
      {
        heading: 'Sensing Without Fixing',
        body: 'As you guide awareness through each muscle group, you do not need to change anything immediately. Simply noticing tightness, temperature, or ease begins the body’s innate relaxation response.',
      },
    ],
    takeaway: 'Your body is always present in the moment. Tuning into it is the fastest road home to calm.',
    reflectionQuestion: 'Where in your body did you notice the most relief as you paid attention?',
  },
  r6: {
    sections: [
      {
        heading: 'Boundaries as Self-Care',
        body: 'A boundary is not a wall to keep others out; it is a clear door that defines where you end and others begin. Healthy boundaries preserve the vitality you need to love and connect authentically.',
      },
      {
        heading: 'Kind, Clear Communication',
        body: 'You can say "I would love to help, but I do not have the bandwidth this week" without apologies or excuses. Clarity is kindness.',
      },
    ],
    takeaway: 'Protecting your personal capacity enables your genuine presence.',
    reflectionQuestion: 'Where in your life would a gentle "no" make room for a deeper, more peaceful "yes"?',
  },
  r7: {
    sections: [
      {
        heading: 'Name It to Tame It',
        body: 'Neuroimaging studies demonstrate that verbally labeling an emotional state reduces activity in the amygdala and stimulates the prefrontal cortex. Saying "I feel disappointed" shifts brain chemistry from panic to comprehension.',
      },
      {
        heading: 'Expanding Your Vocabulary',
        body: 'Moving beyond generic words like "fine" or "bad" into nuanced words like "overstimulated", "vulnerable", or "apprehensive" provides exact clues on what kind of comfort you truly need.',
      },
    ],
    takeaway: 'Precise emotional naming shrinks the mystery and power of distressing feelings.',
    reflectionQuestion: 'What nuanced emotion is quietly asking for your attention right now?',
  },
  r8: {
    sections: [
      {
        heading: 'Recognizing When Help is Needed',
        body: 'Seeking therapy or psychiatric guidance is not a sign of failure; it is an act of wisdom. Just as we seek care for physical pain, our emotional health deserves professional partnership.',
      },
      {
        heading: 'Key Indicators',
        body: 'If low mood, panic, insomnia, or emotional numbness persists across multiple weeks and disrupts your relationships or daily functioning, reaching out to a licensed professional is the kindest step you can take.',
      },
    ],
    takeaway: 'Professional support gives you structured tools, diagnosis when appropriate, and confidential partnership.',
    reflectionQuestion: 'What holds you back from seeking more support, and how might sharing the load lighten your path?',
  },
}

export function CalmingReader({
  resource,
  onClose,
  onComplete,
}: {
  resource: Resource
  onClose: () => void
  onComplete?: () => void
}) {
  const { togglePractice, practicesDone } = usePatientData()
  const detail = RESOURCE_FULL_CONTENT[resource.id] ?? RESOURCE_FULL_CONTENT.r1
  const isDone = practicesDone.includes('reading')

  // Keyboard Escape listener
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleMarkComplete = () => {
    if (!isDone) {
      togglePractice('reading')
    }
    if (onComplete) onComplete()
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={resource.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div className="relative my-auto w-full max-w-2xl rounded-3xl border border-border/80 bg-card p-6 shadow-2xl sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full border border-border/60 p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close reader"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <BookOpen className="size-4" />
          {resource.category} · {resource.format}
        </div>
        <h1 className="mt-2 font-serif text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
          {resource.title}
        </h1>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" /> {resource.minutes} min read
          </span>
          <span>·</span>
          <span>MindSpace Clinical & Wellness Library</span>
        </div>

        {/* Reading Content */}
        <div className="mt-6 flex flex-col gap-5 border-t border-border/60 pt-5 text-sm sm:text-base leading-relaxed text-foreground/90">
          {detail.sections.map((sec, i) => (
            <div key={i}>
              <h2 className="font-serif text-lg font-semibold text-foreground">{sec.heading}</h2>
              <p className="mt-1.5 text-muted-foreground leading-relaxed text-xs sm:text-sm">{sec.body}</p>
            </div>
          ))}

          {/* Key Takeaway Card */}
          <div className="mt-2 rounded-2xl border border-primary/25 bg-primary/8 p-4">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-primary">
              Gentle Takeaway
            </span>
            <p className="mt-1 text-xs sm:text-sm font-serif italic text-foreground">
              {`"${detail.takeaway}"`}
            </p>
          </div>

          {/* Reflection Question */}
          <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
              A Question to Hold
            </span>
            <p className="mt-1 text-xs sm:text-sm text-foreground/90">
              {detail.reflectionQuestion}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-border/60 pt-5">
          <span className="text-xs text-muted-foreground">
            {isDone ? 'Completed today' : 'Mark reading as completed practice'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleMarkComplete}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 shadow-sm"
            >
              <Check className="size-3.5" /> Complete Reading
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
