'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, AlertCircle } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSession } from '@/lib/session'

export default function PatientLoginPage() {
  const router = useRouter()
  const { authenticatePatient } = useSession()
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

    const res = await authenticatePatient(
      email,
      password,
      name || 'Member',
      mode === 'register',
    )

    setLoading(false)
    if (!res.success) {
      setError(res.error || 'Failed to authenticate')
    } else {
      router.push('/patient')
    }
  }

  return (
    <AuthShell
      quote="Every feeling is welcome here. This is your space to slow down and understand yourself a little more."
      quoteAuthor="The MindSpace approach"
      points={['Private mood check-ins', 'A supportive AI companion', 'Journaling & gentle self-care']}
    >
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          {mode === 'login' ? 'Welcome back' : 'Create your space'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {mode === 'login'
            ? 'Sign in to continue your wellbeing journey.'
            : 'A few details and your calm corner is ready.'}
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
            <Label htmlFor="name">Full name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aanya Sharma"
                className="pl-10"
                required
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
            ? 'Sign in to MindSpace'
            : 'Create my space'}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">
          ← Return to main portal
        </Link>
        <span>Encrypted & private</span>
      </div>
    </AuthShell>
  )
}
