// frontend/src/components/auth/ClientAuthGuard.tsx
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
        redirectToDashboard(user.roles, router);
        return;
      }

      // Jei esame pagrindiniame puslapyje ir vartotojas prisijungęs, nukreipti į dashboard
      if (currentPath === '/') {
        redirectToDashboard(user.roles, router);
        return;
      }

      // Patikrinti ar vartotojas turi reikiamą rolę
      if (allowedRoles.length > 0 && !(user.roles || []).some(role => allowedRoles.includes(role))) {
        // Jei vartotojas neturi reikiamos rolės, nukreipti į jo dashboard
        redirectToDashboard(user.roles || [], router);
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

// Pagalbinė funkcija nukreipti į dashboard pagal roles
// CHANGE: Pakeista iš window.location.href į Next.js router.push ir 'admin' į 'manager'
function redirectToDashboard(roles: string[] | null | undefined, router: any) {
  const userRoles = roles || [];
  // Prioritizuoti roles: manager > curator > mentor > parent > student
  if (userRoles.includes('manager')) {
    router.push('/dashboard/managers');
  } else if (userRoles.includes('curator')) {
    router.push('/dashboard/curators');
  } else if (userRoles.includes('mentor')) {
    router.push('/dashboard/mentors');
  } else if (userRoles.includes('parent')) {
    router.push('/dashboard/parents');
  } else if (userRoles.includes('student')) {
    router.push('/dashboard/students');
  } else {
    router.push('/dashboard');
  }
} 