import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import Header from '@/components/ui/header'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from '@/components/ui/toaster' 

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QuizWhizAI',
  description: 'Generated Quizzes And Study Faster Using AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={'dark'}>
        <SessionProvider>
          <Header />
          <div style={{ textAlign: 'center', margin: '1rem 0', color: 'white' }}>
            <p>
              🚀 Helping students with over <strong>{50}</strong> quizzes and <strong>{400}</strong> + questions answered!
            </p>
          </div>
          {children}
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </SessionProvider>
      </body>
    </html>
  )
}
