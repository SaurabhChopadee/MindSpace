'use client'

import Link from 'next/link'
import { ArrowRight, Bell, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useClinicianData } from '@/lib/clinician-store'
import { relativeDay } from '@/lib/format'

export function Alerts() {
  const { patients } = useClinicianData()
  const alerts = patients
    .flatMap((patient) => patient.risks.map((risk) => ({ patient, risk })))
    .sort((a, b) => (a.risk.level === 'elevated' ? -1 : b.risk.level === 'elevated' ? 1 : 0))

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <header>
        <div className="flex items-center gap-2 text-warning">
          <Bell className="size-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Review Queue</span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Clinical Alerts
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Signals surfaced from patient-reported inputs for clinician review.
        </p>
      </header>

      <Card className="mt-8 overflow-hidden">
        <div className="border-b border-border/60 bg-secondary/30 p-5">
          <p className="text-xs text-muted-foreground">
            These signals are informational and are not diagnoses or emergency determinations.
          </p>
        </div>

        {alerts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-success/15 text-success">
              <CheckCircle2 className="size-6" />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-foreground">Review Queue Clear</h2>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
              No active alerts or elevated distress signals have been flagged across your assigned members.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {alerts.map(({ patient, risk }) => (
              <div
                key={`${patient.id}-${risk.id}`}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex gap-3">
                  <span
                    className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${
                      risk.level === 'elevated'
                        ? 'bg-danger/10 text-danger'
                        : risk.level === 'watch'
                        ? 'bg-warning/15 text-warning-foreground'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <ShieldAlert className="size-4" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-foreground text-sm">{risk.label}</strong>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-medium uppercase text-muted-foreground">
                        {risk.level}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{risk.detail}</p>
                    <p className="mt-2 text-[0.65rem] text-muted-foreground">
                      {patient.name} · {relativeDay(risk.date)}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/psychiatrist/patients/${patient.id}`}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Review patient <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
