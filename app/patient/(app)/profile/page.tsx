'use client'

import { startTransition, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, UserRound, Sparkles, Volume2, VolumeX, Eye, EyeOff, ShieldCheck, Stethoscope } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnvironmentSelectorDialog } from '@/components/shared/environment-selector'
import { useSession } from '@/lib/session'
import { useEnvironment } from '@/lib/environment-store'
import { CURRENT_PATIENT } from '@/lib/mock-data'
import {
  deleteBackendAccount,
  exportBackendData,
  fetchBackendProfile,
  isBackendAuthEnabled,
  type BackendProfile,
} from '@/lib/backend-api'

export default function PatientProfilePage() {
  const router = useRouter()
  const { patientName, connectedClinician, logout } = useSession()
  const { activeTheme, soundEnabled, visualsEnabled } = useEnvironment()
  const [envOpen, setEnvOpen] = useState(false)
  const [profile, setProfile] = useState<BackendProfile | null>(null)
  const [privacyMessage, setPrivacyMessage] = useState<string | null>(null)
  const [privacyBusy, setPrivacyBusy] = useState(false)

  useEffect(() => {
    if (!isBackendAuthEnabled || typeof window === 'undefined' || !sessionStorage.getItem('mindspace_access_token')) return
    fetchBackendProfile()
      .then((nextProfile) => startTransition(() => setProfile(nextProfile)))
      .catch((error) => console.warn('Could not load backend profile:', error))
  }, [])

  const handleExport = async () => {
    setPrivacyBusy(true)
    setPrivacyMessage(null)
    try {
      const data = await exportBackendData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'mindspace-data-export.json'
      link.click()
      URL.revokeObjectURL(url)
      setPrivacyMessage('Your data export has downloaded.')
    } catch (error) {
      setPrivacyMessage(error instanceof Error ? error.message : 'Could not export your data.')
    } finally {
      setPrivacyBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete your account and all associated wellbeing data? This cannot be undone.')) return
    setPrivacyBusy(true)
    setPrivacyMessage(null)
    try {
      await deleteBackendAccount()
      logout()
      router.replace('/')
    } catch (error) {
      setPrivacyMessage(error instanceof Error ? error.message : 'Could not delete your account.')
      setPrivacyBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Your Private Space</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          My Member Profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your account preferences and personalized wellness atmosphere.
        </p>
      </header>

      <div className="mt-8 grid gap-6 max-w-2xl">
        {/* Profile Details Card */}
        <Card className="p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-4 border-b border-border/60 pb-6">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <UserRound className="size-7" />
            </span>
            <div>
              <h2 className="font-display text-xl text-foreground font-semibold">
                {profile?.display_name || patientName || CURRENT_PATIENT.name}
              </h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <ShieldCheck className="size-3.5 text-primary" /> Verified Member Account
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-foreground">
                <Mail className="size-4 text-primary" />
                {profile?.email || CURRENT_PATIENT.email}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Age</p>
              <p className="mt-1 text-sm text-foreground">{profile?.age ?? CURRENT_PATIENT.age} years</p>
            </div>
          </div>

          {/* Linked Clinician Section */}
          <div className="mt-6 border-t border-border/60 pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Connected Clinician</p>
            {connectedClinician ? (
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-border/70 bg-secondary/30 p-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Stethoscope className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{connectedClinician.name}</p>
                  <p className="text-[0.68rem] text-muted-foreground">{connectedClinician.title} · License: {connectedClinician.license}</p>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex items-center justify-between rounded-xl border border-border/70 bg-secondary/20 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Stethoscope className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-foreground">Independent Self-Care Mode</p>
                    <p className="text-[0.68rem] text-muted-foreground">Your account is operating privately. No external therapist linked.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Atmosphere & Sound Preferences Card */}
        <Card className="p-6 sm:p-8 shadow-sm border-primary/20">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Sparkles className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold text-foreground text-base">Atmosphere &amp; Sound</h3>
                <p className="text-xs text-muted-foreground">Control global environmental theme, audio, and visual motion.</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEnvOpen(true)}
              className="rounded-full"
            >
              Customize
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-border/80 bg-card p-3">
              <span
                className="mx-auto block size-3 rounded-full mb-1.5"
                style={{ backgroundColor: activeTheme.accentColor }}
              />
              <p className="text-[0.68rem] text-muted-foreground uppercase">Theme</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{activeTheme.name.split(' ')[0]}</p>
            </div>
            <div className="rounded-xl border border-border/80 bg-card p-3">
              <span className="mx-auto block mb-1 text-primary">
                {visualsEnabled ? <Eye className="size-3.5 mx-auto" /> : <EyeOff className="size-3.5 mx-auto text-muted-foreground" />}
              </span>
              <p className="text-[0.68rem] text-muted-foreground uppercase">Motion</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{visualsEnabled ? 'Active' : 'Off'}</p>
            </div>
            <div className="rounded-xl border border-border/80 bg-card p-3">
              <span className="mx-auto block mb-1 text-primary">
                {soundEnabled ? <Volume2 className="size-3.5 mx-auto" /> : <VolumeX className="size-3.5 mx-auto text-muted-foreground" />}
              </span>
              <p className="text-[0.68rem] text-muted-foreground uppercase">Audio</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{soundEnabled ? 'Playing' : 'Off'}</p>
            </div>
          </div>
        </Card>

        {isBackendAuthEnabled && (
          <Card className="p-6 sm:p-8 shadow-sm border-destructive/20">
            <h3 className="font-semibold text-foreground">Your Data</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Download a copy of your MindSpace data or permanently delete your account.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button" variant="outline" size="sm" onClick={handleExport} disabled={privacyBusy}>
                Download my data
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={privacyBusy}>
                Delete account
              </Button>
            </div>
            {privacyMessage && <p className="mt-3 text-xs text-muted-foreground" role="status">{privacyMessage}</p>}
          </Card>
        )}
      </div>

      <EnvironmentSelectorDialog open={envOpen} onClose={() => setEnvOpen(false)} />
    </div>
  )
}
