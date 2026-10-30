'use client'

import Link from 'next/link'
import { Search, UserRound, Key, Copy, Check, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Sparkline } from '@/components/charts/sparkline'
import { relativeDay } from '@/lib/format'
import { useClinicianData } from '@/lib/clinician-store'
import { moodByKey } from '@/lib/mock-data'

export function PatientList() {
  const [query, setQuery] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { patients, activeClinician, activeInviteCodes, generateInviteCode } = useClinicianData()

  const currentInviteCode = activeInviteCodes[0]?.code ?? activeClinician.inviteCode

  const filtered = useMemo(
    () => patients.filter((patient) => patient.name.toLowerCase().includes(query.toLowerCase())),
    [patients, query],
  )

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2500)
  }

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {/* Page Header */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Care Roster · {activeClinician.name}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Connected Members
            </h1>
            <p className="mt-2 text-xs text-muted-foreground">
              Member-reported signals and check-in trends from your active therapeutic relationships.
            </p>
          </div>
        </header>

        {/* Clinician Invite Code Banner */}
        <Card className="mt-6 flex flex-col gap-4 border-primary/25 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Key className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Your Member Invitation Code
              </p>
              <p className="text-xs text-muted-foreground">
                Share this code with new members so they can connect with you during registration.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-primary/30 bg-card px-3.5 py-1.5 font-mono text-sm font-bold tracking-wider text-foreground">
              {currentInviteCode}
            </span>
            <button
              type="button"
              onClick={() => copyCode(currentInviteCode)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
              title="Copy code to clipboard"
            >
              {copiedCode === currentInviteCode ? (
                <>
                  <Check className="size-3.5 text-success" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy
                </>
              )}
            </button>
            <button
              type="button"
              onClick={generateInviteCode}
              className="rounded-xl border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Generate fresh code"
            >
              <RefreshCw className="size-3.5" />
            </button>
          </div>
        </Card>
        {/* Member Roster Card */}
        <Card className="mt-6 overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-border/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Active Members <span className="font-sans text-xs font-normal text-muted-foreground">({filtered.length})</span>
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Access is restricted to members explicitly assigned to {activeClinician.name}.
              </p>
            </div>
            <label className="relative block sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search members..."
                aria-label="Search members"
                className="h-9 w-full rounded-full border border-input bg-background pl-9 pr-4 text-xs outline-none transition-shadow focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          <div className="divide-y divide-border/50">
            {filtered.map((patient) => (
              <Link
                key={patient.id}
                href={`/psychiatrist/patients/${patient.id}`}
                className="grid gap-4 p-5 transition-colors hover:bg-secondary/40 sm:grid-cols-[1.5fr_0.8fr_1fr_130px] sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-10 items-center justify-center rounded-full text-xs font-semibold text-foreground/70"
                    style={{ backgroundColor: patient.avatarTone }}
                  >
                    <UserRound className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {patient.age ? `${patient.age} · ` : ''}{patient.pronouns}
                    </p>
                  </div>
                </div>

                <Status status={patient.status} />

                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {moodByKey(patient.currentMood).face} {patient.currentMood.replace('verylow', 'very low')}
                  </p>
                  <p className="text-[0.68rem] text-muted-foreground">
                    Checked in {relativeDay(patient.lastCheckIn)}
                  </p>
                </div>

                <Sparkline data={patient.trend7} width={120} height={36} color="var(--chart-1)" />
              </Link>
            ))}

            {filtered.length === 0 && (
              <div className="p-12 text-center text-xs text-muted-foreground">
                {query ? (
                  'No connected members match that search query.'
                ) : (
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground text-sm">No connected members yet</p>
                    <p className="max-w-md mx-auto text-muted-foreground">
                      Share your member invitation code <strong className="font-mono text-foreground">{currentInviteCode}</strong> with your patients so they can link to your care roster during registration.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}

function Status({ status }: { status: string }) {
  return (
    <span
      className={`w-fit rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold ${
        status === 'needs-review'
          ? 'bg-warning/15 text-warning-foreground'
          : status === 'new'
          ? 'bg-sky/15 text-sky'
          : 'bg-success/15 text-success-foreground'
      }`}
    >
      {status === 'needs-review'
        ? 'Needs review'
        : status === 'new'
        ? 'New'
        : status === 'improving'
        ? 'Improving'
        : 'Stable'}
    </span>
  )
}
