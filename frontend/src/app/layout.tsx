import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import ClientAuthGuard from '@/components/auth/ClientAuthGuard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'A-DIENYNAS',
  description: 'Studentų dienynas ir mokymosi valdymo sistema',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="lt">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ClientAuthGuard requireAuth={false}>
              {children}
            </ClientAuthGuard>
          </main>
        </div>
      </body>
    </html>
  )
}
