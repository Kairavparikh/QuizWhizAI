import React from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import Header from '@/components/ui/header'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

async function fetchStats() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/stats`, {
    cache: 'no-store', // always fetch fresh
  })
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json() as Promise<{ totalQuizzesTaken: number; totalQuestions: number }>
}

export const metadata = {
  title: 'QuizWhizAI',
  description: 'Generated Quizzes And Study Faster Using AI',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { totalQuizzesTaken, totalQuestions } = await fetchStats()

  return (
    <html lang="en">
      <body className={'dark'}>
        <SessionProvider>
          <Header />
          <div style={{ textAlign: 'center', margin: '1rem 0', color: 'white' }}>
            <p>
              🚀 Helping students with <strong>{totalQuizzesTaken}</strong> quizzes and <strong>{totalQuestions}</strong> questions answered!
            </p>
          </div>
          {children}
          <Analytics />
          <SpeedInsights />
        </SessionProvider>
      </body>
    </html>
  )
}
