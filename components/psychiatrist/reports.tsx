'use client'

import Link from 'next/link'
import { ArrowRight, FileText, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useClinicianData } from '@/lib/clinician-store'
import { longDate } from '@/lib/format'

export function Reports() {
  const { patients } = useClinicianData()

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Clinician review workspace</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Clinical Reports
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Summaries of observed trends and patient-reported activity across your care roster.
        </p>
      </header>

      {patients.length === 0 ? (
        <Card className="mt-8 p-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <FileText className="size-6" />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-foreground">No Member Reports Yet</h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
            As connected members complete their daily mood check-ins and companion interactions, AI-synthesized wellbeing summaries will appear here for your review.
          </p>
          <div className="mt-6">
            <Link
              href="/psychiatrist/patients"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
            >
              <Users className="size-3.5" /> View Care Roster & Invite Code
            </Link>
          </div>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {patients.map((patient) => (
            <Card key={patient.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </span>
                <span className="text-xs text-muted-foreground">Updated {longDate(patient.lastCheckIn)}</span>
              </div>
              <h2 className="mt-5 font-display text-xl text-foreground">{patient.name} · wellbeing review</h2>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{patient.aiSummary}</p>
              <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                <span className="text-xs font-medium text-primary">AI-supported, clinician review</span>
                <Link
                  href={`/psychiatrist/patients/${patient.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-primary"
                >
                  Open report <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
