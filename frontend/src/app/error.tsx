// frontend/src/app/error.tsx
// SEC-011: Custom error page for Next.js App Router
// PURPOSE: Handle application errors gracefully
// UPDATES: Created for SEC-011 security fix

'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">Klaida</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Įvyko netikėta klaida
        </h2>
        <p className="text-gray-600 mb-8">
          Atsiprašome už nepatogumus. Bandykite dar kartą.
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Bandyti dar kartą
          </button>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Grįžti į pagrindinį puslapį
          </Link>
        </div>
      </div>
    </div>
  )
}
