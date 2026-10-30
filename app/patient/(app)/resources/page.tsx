import type { Metadata } from 'next'
import { Resources } from '@/components/patient/resources'

export const metadata: Metadata = {
  title: 'Resources',
}

export default function ResourcesPage() {
  return <Resources />
}
