import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { SecurityScript } from '@/components/security-script'
import './globals.css'

export const metadata: Metadata = {
  title: 'GameCoach.AI',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} no-select no-context-menu`}>
        {children}
        <Analytics />
        <SecurityScript />
      </body>
    </html>
  )
}
