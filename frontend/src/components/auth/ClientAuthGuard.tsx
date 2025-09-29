// frontend/src/components/auth/ClientAuthGuard.tsx
// Simple authentication guard for page-level protection
'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ClientAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

/**
 * AuthLoadingSpinner - Loading state component
 */
function AuthLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Tikrinama autentifikacija...</p>
      </div>
    </div>
  );
}

/**
 * AuthErrorPage - Error state component
 */
function AuthErrorPage({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Autentifikacijos klaida</p>
          <p className="text-sm">Įvyko klaida tikrinant autentifikaciją</p>
        </div>
        <div className="space-x-4">
          <button 
            onClick={onRetry}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Bandyti iš naujo
          </button>
          <button 
            onClick={() => window.location.href = '/auth/login'}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Eiti į prisijungimo puslapį
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * LoginPage - Unauthenticated state component
 */
function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Reikalinga autentifikacija</h1>
        <p className="text-gray-600 mb-6">Norėdami tęsti, turite prisijungti</p>
        <button 
          onClick={() => window.location.href = '/auth/login'}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Prisijungti
        </button>
      </div>
    </div>
  );
}

/**
 * ClientAuthGuard - Page-level authentication guard
 * CHANGE: Išjungtas automatinis redirect activities puslapyje
 */
function ClientAuthGuard({
  children,
  requireAuth = true,
  allowedRoles = []
}: ClientAuthGuardProps) {
  const { user, isLoading, error, redirectToDashboard } = useAuth();


  // Show loading spinner while checking authentication
  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  // Show error if authentication failed
  if (error) {
    return <AuthErrorPage onRetry={() => window.location.reload()} />;
  }

  if (requireAuth && !user) {
    return <LoginPage />;
  }

  // Handle role-based access control
  if (user && allowedRoles.length > 0) {
    const userRoles = user.roles || [];
    const hasRequiredRole = userRoles.some((role: string) => allowedRoles.includes(role));

    if (!hasRequiredRole) {
      if (typeof window !== 'undefined') {
        redirectToDashboard();
        return <AuthLoadingSpinner />;
      }
    }
  }

  // Handle automatic dashboard redirects for authenticated users
  if (user && typeof window !== 'undefined') {
    const currentPath = window.location.pathname;


    // Redirect from login page if authenticated
    if (currentPath === '/auth/login') {
      redirectToDashboard();
      return <AuthLoadingSpinner />;
    }

    // Redirect from home page if authenticated
    if (currentPath === '/') {
      redirectToDashboard();
      return <AuthLoadingSpinner />;
    }
  }

  return <>{children}</>;
}

/**
 * Export ClientAuthGuard component
 * Updated to use simple useAuth hook
 */
export default ClientAuthGuard;