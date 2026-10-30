import { ClinicianGate, PsychiatristMobileBar, PsychiatristMobileHeader, PsychiatristSidebar } from '@/components/psychiatrist/psychiatrist-nav'
import { ClinicianDataProvider } from '@/lib/clinician-store'

export default function PsychiatristAppLayout({ children }: { children: React.ReactNode }) {
  return <ClinicianGate><ClinicianDataProvider><div className="clinician-app theme-clinical flex min-h-svh bg-background"><PsychiatristSidebar /><div className="flex min-w-0 flex-1 flex-col"><PsychiatristMobileHeader /><main className="flex-1 pb-24 lg:pb-0">{children}</main><PsychiatristMobileBar /></div></div></ClinicianDataProvider></ClinicianGate>
}
