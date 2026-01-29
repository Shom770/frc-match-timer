import type { Metadata } from 'next'
import { Inter, Hanken_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken-grotesk',
})

export const metadata: Metadata = {
  title: 'FRC Match Timer',
  description: 'Timer for FRC Rebuilt Game matches',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${hankenGrotesk.variable}`}>{children}</body>
    </html>
  )
}

