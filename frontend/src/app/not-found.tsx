// frontend/src/app/not-found.tsx
// SEC-011: Custom 404 page for Next.js App Router
// PURPOSE: Handle 404 errors gracefully
// UPDATES: Created for SEC-011 security fix

import Link from "next/link"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Puslapis nerastas
        </h2>
        <p className="text-gray-600 mb-8">
          Atsiprašome, bet ieškomas puslapis neegzistuoja.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Grįžti į pagrindinį puslapį
        </Link>
      </div>
    </div>
  )
}
