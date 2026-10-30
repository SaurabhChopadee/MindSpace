'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  HeartHandshake,
  Stethoscope,
  User,
  Mail,
  Lock,
  Key,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Wordmark } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { useSession } from '@/lib/session'
import { CURRENT_PATIENT } from '@/lib/mock-data'
import { findClinicianByInviteCode } from '@/lib/backend-api'
import { cn } from '@/lib/utils'

export default function UnifiedAuthenticationPage() {
  const router = useRouter()
  const { authenticatePatient, authenticateClinician } = useSession()

  // Top-left role toggle: 'member' | 'clinician'
  const [role, setRole] = useState<'member' | 'clinician'>('member')

  // Member sub-tabs: 'login' | 'register'
  const [memberMode, setMemberMode] = useState<'login' | 'register'>('login')

  // Member form state
  const [memberName, setMemberName] = useState('')
  const [memberEmail, setMemberEmail] = useState('')
  const [memberPassword, setMemberPassword] = useState('')
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [inviteCodeError, setInviteCodeError] = useState<string | null>(null)
  const [matchedTherapist, setMatchedTherapist] = useState<string | null>(null)

  // Clinician form state
  const [clinicianMode, setClinicianMode] = useState<'login' | 'register'>('login')
  const [clinicianName, setClinicianName] = useState('')
  const [clinicianEmail, setClinicianEmail] = useState('')
  const [clinicianPassword, setClinicianPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMemberPassword, setShowMemberPassword] = useState(false)
  const [showClinicianPassword, setShowClinicianPassword] = useState(false)

  // Check invite code as user types
  const handleInviteCodeChange = async (val: string) => {
    setInviteCode(val)
    setInviteCodeError(null)
    if (!val.trim()) {
      setMatchedTherapist(null)
      return
    }
    const clean = val.trim().toUpperCase()
    const matched = await findClinicianByInviteCode(clean)
    if (matched) {
      setMatchedTherapist(`${matched.display_name} (${matched.title || 'Clinician'})`)
      setInviteCodeError(null)
    } else if (clean.length >= 6) {
      setMatchedTherapist(null)
      setInviteCodeError('Unrecognized code. Verify with your clinician or leave blank.')
    } else {
      setMatchedTherapist(null)
    }
  }

  // Handle Member Submit
  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setIsSubmitting(true)
    if (memberMode === 'register' && inviteCode.trim()) {
      const clinician = await findClinicianByInviteCode(inviteCode.trim())
      if (!clinician) {
        setInviteCodeError('Invalid invitation code. Please verify with your clinician or leave blank.')
        setIsSubmitting(false)
        return
      }
    }
    const result = await authenticatePatient(
      memberEmail,
      memberPassword,
      memberName || CURRENT_PATIENT.name,
      memberMode === 'register',
      inviteCode.trim(),
    )
    setIsSubmitting(false)
    if (!result.success) {
      setAuthError(result.error ?? 'Unable to authenticate')
      return
    } else {
      router.push('/patient')
    }
  }

  // Handle Clinician Submit
  const handleClinicianSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setIsSubmitting(true)
    const formattedDoctorName = clinicianName
      ? clinicianName.startsWith('Dr.')
        ? clinicianName
        : `Dr. ${clinicianName.replace(/^Dr\.?\s*/i, '')}`
      : 'Dr. Clinician'

    const result = await authenticateClinician(
      clinicianEmail,
      clinicianPassword,
      clinicianMode === 'register',
      formattedDoctorName,
    )
    setIsSubmitting(false)
    if (!result.success) {
      setAuthError(result.error ?? 'Unable to authenticate')
      return
    }
    router.push('/psychiatrist')
  }

  return (
    <main
      className={cn(
        'relative min-h-svh flex flex-col justify-between transition-colors duration-500',
        role === 'clinician' ? 'theme-clinical bg-background' : 'bg-background',
      )}
    >
      {/* Atmosphere radial glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-50"
      >
        <div
          className={cn(
            'absolute -top-32 left-1/4 size-96 rounded-full blur-3xl transition-colors duration-700',
            role === 'member' ? 'bg-primary/20' : 'bg-sky/20',
          )}
        />
        <div
          className={cn(
            'absolute bottom-0 right-1/4 size-80 rounded-full blur-3xl transition-colors duration-700',
            role === 'member' ? 'bg-secondary/35' : 'bg-primary/20',
          )}
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-8">
        {/* Top-Left Clean Role Switcher */}
        <div className="flex items-center gap-3">
          <div
            className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm"
            role="tablist"
            aria-label="Select portal role"
          >
            <button
              type="button"
              role="tab"
              aria-selected={role === 'member'}
              onClick={() => setRole('member')}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300',
                role === 'member'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <HeartHandshake className="size-3.5" />
              Member
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={role === 'clinician'}
              onClick={() => setRole('clinician')}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300',
                role === 'clinician'
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Stethoscope className="size-3.5" />
              Clinician
            </button>
          </div>

          <span className="hidden text-xs text-muted-foreground sm:inline-block">
            {role === 'member' ? 'Wellness Sanctuary' : 'Clinical Intelligence'}
          </span>
        </div>

        {/* Center/Right Brand and Controls */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Wordmark subtitle={role === 'clinician' ? 'Clinician' : undefined} />
        </div>
      </header>

      {/* Main Authentication Container */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          {/* Member Authentication Experience */}
          {role === 'member' && (
            <div className="animate-fade-in rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl">
              <div className="text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-sm">
                  <Sparkles className="size-6" />
                </span>
                <h1 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {memberMode === 'login' ? 'Welcome Back' : 'Create Your Space'}
                </h1>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {memberMode === 'login'
                    ? 'Sign in to access your personal wellness sanctuary, mood insights, and private journal.'
                    : 'A private space for self-reflection, emotion tracking, and guided calm.'}
                </p>
              </div>

              {/* Sub-tab: Sign in vs Register */}
              <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-secondary/60 p-1">
                <button
                  type="button"
                  onClick={() => setMemberMode('login')}
                  className={cn(
                    'rounded-xl py-2 text-xs font-semibold transition-all',
                    memberMode === 'login'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Member Login
                </button>
                <button
                  type="button"
                  onClick={() => setMemberMode('register')}
                  className={cn(
                    'rounded-xl py-2 text-xs font-semibold transition-all',
                    memberMode === 'register'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Member Registration
                </button>
              </div>

              <form onSubmit={handleMemberSubmit} className="mt-6 flex flex-col gap-4">
                {memberMode === 'register' && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="member-name" className="text-xs font-medium text-foreground">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="member-name"
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        placeholder="Aanya Sharma"
                        className="pl-9 text-xs"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="member-email" className="text-xs font-medium text-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="member-email"
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      className="pl-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="member-password" className="text-xs font-medium text-foreground">
                      Password
                    </Label>
                    {memberMode === 'login' && (
                      <button
                        type="button"
                        className="text-[0.68rem] text-primary hover:underline"
                        onClick={() => setForgotPasswordSent(true)}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="member-password"
                      type={showMemberPassword ? 'text' : 'password'}
                      value={memberPassword}
                      onChange={(e) => setMemberPassword(e.target.value)}
                      className="pl-9 pr-9 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowMemberPassword(!showMemberPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showMemberPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {forgotPasswordSent && memberMode === 'login' && (
                    <p className="text-[0.68rem] text-success" role="status">
                      Reset instructions sent to your email.
                    </p>
                  )}
                </div>

                {/* Invitation Code for New Members (Requirement 15) */}
                {memberMode === 'register' && (
                  <div className="flex flex-col gap-1.5 rounded-2xl border border-border/80 bg-secondary/30 p-3.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="invite-code" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Key className="size-3.5 text-primary" />
                        Have an invitation code? <span className="font-normal text-muted-foreground">(optional)</span>
                      </Label>
                    </div>
                    <Input
                      id="invite-code"
                      value={inviteCode}
                      onChange={(e) => handleInviteCodeChange(e.target.value)}
                      placeholder="e.g. MS-7K4P2"
                      className="font-mono text-xs uppercase"
                    />
                    {matchedTherapist && (
                      <p className="flex items-center gap-1.5 text-xs text-success font-medium animate-fade-in mt-1">
                        <CheckCircle2 className="size-3.5" />
                        Connecting with: {matchedTherapist}
                      </p>
                    )}
                    {inviteCodeError && (
                      <p className="flex items-center gap-1.5 text-xs text-destructive font-medium animate-fade-in mt-1">
                        <AlertCircle className="size-3.5" />
                        {inviteCodeError}
                      </p>
                    )}
                    <span className="text-[0.68rem] text-muted-foreground">
                      Enter the code provided by your therapist to link your check-ins directly to their care roster.
                    </span>
                  </div>
                )}

                <Button type="submit" size="lg" className="mt-2 h-11 w-full rounded-full text-xs font-semibold shadow-sm">
                  {isSubmitting ? 'Connecting...' : memberMode === 'login' ? 'Sign In as Member' : 'Create My Member Account'}
                  <ArrowRight className="size-4 ml-1" />
                </Button>
                {authError && <p className="text-center text-xs font-medium text-destructive" role="alert">{authError}</p>}
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 text-[0.68rem] text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                <span>Private · Secure · Member data stays with you</span>
              </div>
            </div>
          )}

          {/* Clinician Authentication Experience */}
          {role === 'clinician' && (
            <div className="animate-fade-in rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl">
              <div className="text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-sidebar-primary/15 text-sidebar-primary shadow-sm">
                  <Stethoscope className="size-6" />
                </span>
                <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Clinician Workspace
                </h1>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Secure access to member-reported mood trends, engagement indicators, and clinical review summaries.
                </p>
              </div>

              {/* Clinician Sub-Tabs: Sign In vs Register */}
              <div className="mt-6 flex rounded-2xl bg-secondary/50 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setClinicianMode('login')
                    setAuthError(null)
                  }}
                  className={cn(
                    'flex-1 rounded-xl py-2 text-xs font-semibold transition-all',
                    clinicianMode === 'login'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClinicianMode('register')
                    setAuthError(null)
                  }}
                  className={cn(
                    'flex-1 rounded-xl py-2 text-xs font-semibold transition-all',
                    clinicianMode === 'register'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Register as Doctor
                </button>
              </div>

              <form onSubmit={handleClinicianSubmit} className="mt-5 flex flex-col gap-4">
                {clinicianMode === 'register' && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="clinician-name" className="text-xs font-medium text-foreground">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="clinician-name"
                        type="text"
                        placeholder="Dr. Sarah Jenkins"
                        value={clinicianName}
                        onChange={(e) => setClinicianName(e.target.value)}
                        className="pl-9 text-xs"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="clinician-email" className="text-xs font-medium text-foreground">
                    Work Email
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="clinician-email"
                      type="email"
                      placeholder="doctor@mindspace.com"
                      value={clinicianEmail}
                      onChange={(e) => setClinicianEmail(e.target.value)}
                      className="pl-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="clinician-password" className="text-xs font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="clinician-password"
                      type={showClinicianPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={clinicianPassword}
                      onChange={(e) => setClinicianPassword(e.target.value)}
                      className="pl-9 pr-9 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowClinicianPassword(!showClinicianPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showClinicianPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-2 h-11 w-full rounded-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 text-xs font-semibold shadow-sm"
                >
                  {isSubmitting
                    ? 'Connecting...'
                    : clinicianMode === 'login'
                    ? 'Enter Clinician Dashboard'
                    : 'Create Doctor Account'}
                  <ArrowRight className="size-4 ml-1" />
                </Button>
                {authError && <p className="text-center text-xs font-medium text-destructive" role="alert">{authError}</p>}
              </form>

              <p className="mt-6 text-center text-[0.68rem] text-muted-foreground">
                Clinical workspace for licensed providers · Member data is encrypted · Observational tool
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Notice */}
      <footer className="relative z-10 border-t border-border/60 px-5 py-4 text-center text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span>MindSpace · A supportive wellness sanctuary and clinician review tool.</span>
          <Link href="/crisis" className="font-semibold text-primary hover:underline">
            Need urgent crisis support?
          </Link>
        </div>
      </footer>
    </main>
  )
}
