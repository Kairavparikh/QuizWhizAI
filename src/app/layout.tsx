import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import Header from '@/components/ui/header'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from '@/components/ui/toaster'
import { SidebarProvider } from '@/components/SidebarProvider'
import { LayoutWrapper } from '@/components/LayoutWrapper'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

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
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SessionProvider>
            <SidebarProvider>
              <Header />
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
              <Toaster />
              <Analytics />
              <SpeedInsights />
            </SidebarProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
