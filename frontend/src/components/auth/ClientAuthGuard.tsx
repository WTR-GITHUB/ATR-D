'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ClientAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export default function ClientAuthGuard({ 
  children, 
  requireAuth = true, 
  allowedRoles = [] 
}: ClientAuthGuardProps) {
  const { isAuthenticated, user, isLoading, initializeAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Initialize auth on component mount
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isLoading) return; // Palaukti kol autentifikacija užsikraus

    if (requireAuth && !isAuthenticated) {
      // Jei reikia autentifikacijos, bet vartotojas neprisijungęs
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated && user) {
      // Jei vartotojas prisijungęs, nukreipti pagal rolę
      const currentPath = window.location.pathname;
      
      // Jei esame login puslapyje ir vartotojas prisijungęs, nukreipti į dashboard
      if (currentPath === '/auth/login') {
        redirectToDashboard(user.role);
        return;
      }

      // Jei esame pagrindiniame puslapyje ir vartotojas prisijungęs, nukreipti į dashboard
      if (currentPath === '/') {
        redirectToDashboard(user.role);
        return;
      }

      // Patikrinti ar vartotojas turi reikiamą rolę
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Jei vartotojas neturi reikiamos rolės, nukreipti į jo dashboard
        redirectToDashboard(user.role);
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requireAuth, allowedRoles, router]);

  // Rodyti loading būseną kol autentifikacija užsikraus
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

// Pagalbinė funkcija nukreipti į dashboard pagal rolę
function redirectToDashboard(role: string) {
  switch (role) {
    case 'admin':
      window.location.href = '/admin';
      break;
    case 'student':
      window.location.href = '/dashboard/students';
      break;
    case 'parent':
      window.location.href = '/dashboard/parents';
      break;
    case 'curator':
      window.location.href = '/dashboard/curators';
      break;
    case 'mentor':
      window.location.href = '/dashboard/mentors';
      break;
    default:
      window.location.href = '/dashboard';
      break;
  }
} 