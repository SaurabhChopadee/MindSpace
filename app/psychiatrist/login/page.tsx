'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Stethoscope, AlertCircle } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSession } from '@/lib/session'

export default function ClinicianLoginPage() {
  const router = useRouter()
  const { authenticateClinician } = useSession()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formattedDoctorName = name
      ? name.startsWith('Dr.')
        ? name
        : `Dr. ${name.replace(/^Dr\.?\s*/i, '')}`
      : 'Dr. Clinician'

    const res = await authenticateClinician(
      email,
      password,
      mode === 'register',
      formattedDoctorName,
    )

    setLoading(false)
    if (!res.success) {
      setError(res.error || 'Failed to authenticate')
    } else {
      router.push('/psychiatrist')
    }
  }

  return (
    <AuthShell
      variant="clinical"
      quote="Clearer signals, calmer conversations. See what your patients are living between sessions."
      quoteAuthor="MindSpace for clinicians"
      points={['Patient-reported mood trends', 'AI summaries for your review', 'Distress signals surfaced early']}
    >
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          {mode === 'login' ? 'Clinician sign in' : 'Create clinician account'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {mode === 'login'
            ? 'Access your clinical dashboard and care roster.'
            : 'Join MindSpace as a licensed mental health clinician.'}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m)
              setError(null)
            }}
            className={`rounded-lg py-2 text-sm font-medium transition-all ${
              mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {m === 'login' ? 'Sign in' : 'Register'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        {mode === 'register' && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doctorName">Doctor Name</Label>
            <div className="relative">
              <Stethoscope className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="doctorName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Adarsh Sharma"
                className="pl-10"
                required
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Work email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="clinician@mindspace.health"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10"
              required
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" size="lg" disabled={loading} className="mt-2 h-11 w-full text-sm">
          {loading
            ? 'Authenticating...'
            : mode === 'login'
            ? 'Sign in to clinical portal'
            : 'Register clinician account'}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">
          ← Return to main portal
        </Link>
        <span>Licensed clinical workspace</span>
      </div>
    </AuthShell>
  )
}
