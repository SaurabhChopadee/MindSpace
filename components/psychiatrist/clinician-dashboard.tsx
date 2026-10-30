'use client'

import Link from 'next/link'
import { ArrowUpRight, Bell, HeartPulse, Stethoscope } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Sparkline } from '@/components/charts/sparkline'
import { ClinicalAIAssistant } from '@/components/psychiatrist/clinical-ai-assistant'
import { useClinicianData } from '@/lib/clinician-store'
import { relativeDay } from '@/lib/format'

export function ClinicianDashboard() {
  const { patients, activeClinician } = useClinicianData()

  const safeCount = Math.max(1, patients.length)
  const needsReview = patients.filter((patient) => patient.status === 'needs-review').length
  const activeAlerts = patients.reduce(
    (sum, patient) => sum + patient.risks.filter((risk) => risk.level === 'elevated' || risk.level === 'watch').length,
    0,
  )
  const averageMood = patients.reduce((sum, patient) => sum + patient.moodValue, 0) / safeCount
  const averageActivity = Math.round(patients.reduce((sum, patient) => sum + patient.progress, 0) / safeCount)

  const rosterTrend =
    patients.length > 0
      ? patients[0].trend7.map((_, index) =>
          Number((patients.reduce((sum, patient) => sum + patient.trend7[index], 0) / safeCount).toFixed(1)),
        )
      : [3, 3, 3, 3, 3, 3, 3]

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* Hero Workspace Banner */}
      <section className="animate-rise relative overflow-hidden rounded-[2rem] bg-sidebar p-6 text-sidebar-foreground shadow-[var(--shadow-float)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-sidebar-primary/20 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sidebar-accent px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-sidebar-foreground/80">
                Clinical Workspace
              </span>
              <div className="flex items-center gap-1.5 rounded-full border border-sidebar-border bg-sidebar px-3 py-1 text-xs text-sidebar-foreground">
                <Stethoscope className="size-3 text-sidebar-primary" />
                <span className="font-semibold">{activeClinician.name}</span>
              </div>
            </div>

            <h1 className="mt-4 max-w-xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Welcome, {activeClinician.name}.
            </h1>
            <p className="mt-2 max-w-lg text-xs leading-relaxed text-sidebar-foreground/70">
              Overview of {patients.length} connected care relationship{patients.length !== 1 ? 's' : ''}, with member-reported patterns and early distress indicators.
            </p>
          </div>

          <Link
            href="/psychiatrist/patients"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-sidebar-primary px-5 py-2.5 text-xs font-semibold text-sidebar-primary-foreground transition-transform hover:-translate-y-0.5 shadow-sm"
          >
            Open Members Roster <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="stagger relative mt-8 grid gap-6 border-t border-sidebar-border/80 pt-6 sm:grid-cols-3">
          <HeroStat
            label="Roster Health"
            value={patients.length > 0 ? `${averageMood.toFixed(1)} / 5` : '—'}
            detail={patients.length > 0 ? 'average member-reported mood' : 'no check-ins yet'}
          />
          <HeroStat
            label="Engagement"
            value={patients.length > 0 ? `${averageActivity}%` : '0%'}
            detail="average 30-day activity index"
          />
          <HeroStat
            label="Review Queue"
            value={needsReview}
            detail={`${activeAlerts} active signals to inspect`}
            alert={needsReview > 0}
          />
        </div>
      </section>

      {/* Roster Mood Pulse & Attention Map */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="animate-rise overflow-hidden [animation-delay:180ms]">
          <div className="flex flex-col gap-4 border-b border-border/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <HeartPulse className="size-4 text-primary" />
                <h2 className="font-display text-xl font-semibold text-foreground">Roster Mood Pulse</h2>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Average member-reported mood across the last seven check-in points.
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[0.68rem] font-semibold text-primary">
              OBSERVED TREND
            </span>
          </div>

          <div className="p-5 sm:p-7">
            {patients.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No check-in points recorded yet. As assigned members log their daily moods, aggregate trends will display here.
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-display text-4xl font-semibold text-foreground">
                      {averageMood.toFixed(1)}
                      <span className="font-sans text-base font-normal text-muted-foreground"> / 5</span>
                    </p>
                    <p className="mt-1 text-xs font-medium text-success">Active aggregate across {patients.length} members</p>
                  </div>
                  <Sparkline data={rosterTrend} width={220} height={70} color="var(--primary)" strokeWidth={3} />
                </div>

                <div className="stagger mt-6 grid grid-cols-7 gap-2 text-center text-[0.65rem] text-muted-foreground">
                  {rosterTrend.map((value, index) => (
                    <div key={index}>
                      <div className="mx-auto mb-2 h-16 w-full max-w-8 rounded-t-lg bg-secondary">
                        <div
                          className="mt-auto h-full rounded-t-lg bg-primary/65 transition-all duration-500"
                          style={{ transform: `scaleY(${value / 5})`, transformOrigin: 'bottom' }}
                        />
                      </div>
                      <span>Point {index + 1}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Where to Look Next / Attention Map */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  OBSERVED SIGNALS
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Where to Look Next</h2>
              </div>
              <Bell className="size-5 text-warning" />
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {patients
                .filter((patient) => patient.risks.some((risk) => risk.level !== 'info'))
                .slice(0, 3)
                .map((patient) => (
                  <Link
                    key={patient.id}
                    href={`/psychiatrist/patients/${patient.id}`}
                    className="group rounded-2xl border border-warning/25 bg-warning/8 p-3.5 transition-all hover:-translate-y-0.5 hover:bg-warning/12"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-xs text-foreground">{patient.name}</span>
                      <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{patient.risks[0]?.label}</p>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-warning/15">
                      <div
                        className="h-full rounded-full bg-warning"
                        style={{ width: `${Math.min(100, patient.risks.length * 38)}%` }}
                      />
                    </div>
                  </Link>
                ))}

              {patients.filter((p) => p.risks.some((r) => r.level !== 'info')).length === 0 && (
                <p className="text-xs text-muted-foreground py-4">No active distress signals in your roster.</p>
              )}
            </div>
          </div>

          <Link href="/psychiatrist/alerts" className="mt-4 text-xs font-semibold text-primary hover:underline">
            View all signals →
          </Link>
        </Card>
      </div>

      {/* Clinical AI Assistant */}
      <div className="mt-6 animate-rise overflow-hidden [animation-delay:240ms]">
        <ClinicalAIAssistant />
      </div>

      {/* Connected Members List */}
      <Card className="animate-rise mt-6 overflow-hidden [animation-delay:260ms]">
        <div className="flex items-center justify-between border-b border-border/60 p-5">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Connected Members</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {patients.length} care relationship{patients.length !== 1 ? 's' : ''} assigned to {activeClinician.name}.
            </p>
          </div>
          <Link href="/psychiatrist/patients" className="text-xs font-semibold text-primary hover:underline">
            Full Member Roster →
          </Link>
        </div>

        {patients.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-xs text-muted-foreground">
              No members connected to your roster yet. Share your clinician invitation code{' '}
              <strong className="font-mono text-foreground">{activeClinician.inviteCode}</strong> with your patients so they can link during registration.
            </p>
            <div className="mt-4">
              <Link
                href="/psychiatrist/patients"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
              >
                View Care Roster & Invite Code
              </Link>
            </div>
          </div>
        ) : (
          <div className="stagger divide-y divide-border/50">
            {patients.map((patient) => (
              <Link
                key={patient.id}
                href={`/psychiatrist/patients/${patient.id}`}
                className="grid gap-4 p-5 transition-colors hover:bg-secondary/40 sm:grid-cols-[1.4fr_0.75fr_0.8fr_1fr_120px] sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-10 items-center justify-center rounded-full text-xs font-semibold"
                    style={{ backgroundColor: patient.avatarTone }}
                  >
                    {patient.firstName.slice(0, 2).toUpperCase()}
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
                  <p className="text-xs font-semibold capitalize text-foreground">
                    {patient.currentMood.replace('verylow', 'very low')}
                  </p>
                  <p className="text-[0.65rem] text-muted-foreground">member-reported mood</p>
                </div>

                <div>
                  <p className="text-xs text-foreground">{relativeDay(patient.lastCheckIn)}</p>
                  <p className="text-[0.65rem] text-muted-foreground">last check-in</p>
                </div>

                <Sparkline
                  data={patient.trend7}
                  width={110}
                  height={32}
                  color={patient.status === 'needs-review' ? 'var(--danger)' : 'var(--primary)'}
                />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function HeroStat({
  label,
  value,
  detail,
  alert = false,
}: {
  label: string
  value: string | number
  detail: string
  alert?: boolean
}) {
  return (
    <div>
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-sidebar-foreground/60">{label}</p>
      <p className={`mt-1.5 font-display text-3xl font-semibold ${alert ? 'text-warning' : 'text-sidebar-foreground'}`}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-sidebar-foreground/60">{detail}</p>
    </div>
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
