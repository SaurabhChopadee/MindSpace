import type { Metadata } from 'next'
import { Journal } from '@/components/patient/journal'

export const metadata: Metadata = {
  title: 'Journal',
}

export default function JournalPage() {
  return <Journal />
}
