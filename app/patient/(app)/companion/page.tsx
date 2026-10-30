import type { Metadata } from 'next'
import { CompanionChat } from '@/components/patient/companion-chat'

export const metadata: Metadata = {
  title: 'Companion',
}

export default function CompanionPage() {
  return <CompanionChat />
}
