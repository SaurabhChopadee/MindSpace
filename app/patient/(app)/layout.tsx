import { PatientDataProvider } from '@/lib/patient-store'
import { EnvironmentScene } from '@/components/shared/environment-scene'
import { PatientGate, PatientMobileBar, PatientMobileHeader, PatientSidebar } from '@/components/patient/patient-nav'

export default function PatientAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PatientGate>
    <PatientDataProvider>
      <EnvironmentScene>
        <div className="patient-app flex min-h-svh bg-background/65 backdrop-blur-[1px] transition-colors duration-700">
          <PatientSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <PatientMobileHeader />
            <main className="flex-1 pb-24 lg:pb-0">{children}</main>
            <PatientMobileBar />
          </div>
        </div>
      </EnvironmentScene>
    </PatientDataProvider>
    </PatientGate>
  )
}
