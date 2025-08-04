import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import {SessionProvider} from "next-auth/react"
import Header from "@/components/ui/header"
import { Analytics } from "@vercel/analytics/next"

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
    <body className={"dark"}>
      <SessionProvider>
        <Header />
        {children}
        <Analytics />
      </SessionProvider>
    </body>
  </html>
)
}
