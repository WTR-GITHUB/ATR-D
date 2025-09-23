// frontend/src/app/global-error.tsx
// SEC-011: Global error boundary for Next.js App Router
// PURPOSE: Handle all application errors gracefully
// UPDATES: Created for SEC-011 security fix

'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-red-600 mb-4">Klaida</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Įvyko netikėta klaida
            </h2>
            <p className="text-gray-600 mb-8">
              Atsiprašome už nepatogumus. Bandykite dar kartą.
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Bandyti dar kartą
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
