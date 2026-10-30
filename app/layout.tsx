import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import { SessionProvider } from '@/lib/session'
import { ThemeProvider } from '@/lib/theme-provider'
import { EnvironmentProvider } from '@/lib/environment-store'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
})

export const metadata: Metadata = {
  title: 'MindSpace — A calmer space for your mind',
  description:
    'MindSpace is a premium AI-supported wellness platform for reflection, mood tracking, journaling and clinician-reviewed progress monitoring.',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${fraunces.variable} bg-background`}>
      <body className="font-sans antialiased transition-colors duration-300">
        <ThemeProvider>
          <EnvironmentProvider>
            <SessionProvider>{children}</SessionProvider>
          </EnvironmentProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
