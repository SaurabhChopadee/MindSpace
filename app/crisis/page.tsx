import Link from 'next/link'
import { ArrowLeft, Phone, MessageCircle, Globe, HeartHandshake } from 'lucide-react'
import { Wordmark } from '@/components/brand/logo'
import { Card } from '@/components/ui/card'

const lines = [
  { region: 'India (Govt. 24/7)', name: 'Tele-MANAS National Helpline', contact: 'Call 14416 or 1800-891-4416', href: 'tel:14416', icon: Phone },
  { region: 'India (Govt. 24/7)', name: 'KIRAN Mental Health Helpline', contact: 'Call 1800-599-0019', href: 'tel:18005990019', icon: Phone },
  { region: 'India (24/7 Free)', name: 'Vandrevala Foundation Counseling', contact: 'Call 9999 666 555', href: 'tel:9999666555', icon: Phone },
  { region: 'India (Emergency)', name: 'National Emergency / Ambulance', contact: 'Call 112 or 108', href: 'tel:112', icon: Phone },
  { region: 'United States & Canada', name: '988 Suicide & Crisis Lifeline', contact: 'Call or text 988', href: 'tel:988', icon: Phone },
  { region: 'Global / International', name: 'Find A Helpline Directory', contact: 'findahelpline.com', href: 'https://findahelpline.com', icon: Globe },
]

export default function CrisisPage() {
  return (
    <main className="atmos grain min-h-svh">
      <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to MindSpace
          </Link>
          <Wordmark />
        </div>

        <div className="animate-rise mt-10">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <HeartHandshake className="size-7" />
          </span>
          <h1 className="mt-6 text-balance font-display text-4xl font-semibold tracking-tight text-foreground">
            You deserve support, right now
          </h1>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            If you are in crisis or thinking about harming yourself, please reach out to a trained
            person who can help. You matter, and you do not have to face this alone.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {lines.map((l) => (
            <a
              key={l.name}
              href={l.href}
              target={l.href.startsWith('http') ? '_blank' : undefined}
              rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group block"
            >
              <Card className="flex items-center gap-4 p-4 shadow-[var(--shadow-soft)] transition-all hover:border-primary/50 hover:bg-card/90">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <l.icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {l.region}
                  </p>
                  <p className="font-medium text-foreground">{l.name}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-primary group-hover:underline">
                  {l.contact}
                </span>
              </Card>
            </a>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/patient/support"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Looking for nearby hospital psychiatry or local clinics? Open Local Directory &rarr;
          </Link>
        </div>

        <Card className="mt-6 flex items-start gap-3 border-primary/20 bg-primary/5 p-5">
          <MessageCircle className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-foreground/80">
            If your life is in immediate danger, please call your national emergency number (112 in India, 911 in the US/Canada). MindSpace
            is a supportive wellness tool and cannot provide emergency or crisis intervention.
          </p>
        </Card>
      </div>
    </main>
  )
}
