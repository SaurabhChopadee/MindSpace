import { PatientOverview } from '@/components/psychiatrist/patient-overview'

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PatientOverview id={id} />
}
