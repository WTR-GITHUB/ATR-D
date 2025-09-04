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
        redirectToDashboard(user.roles, router, user.default_role);
        return;
      }

      // Jei esame pagrindiniame puslapyje ir vartotojas prisijungęs, nukreipti į dashboard
      if (currentPath === '/') {
        redirectToDashboard(user.roles, router, user.default_role);
        return;
      }

      // Patikrinti ar vartotojas turi reikiamą rolę
      if (allowedRoles.length > 0 && !(user.roles || []).some(role => allowedRoles.includes(role))) {
        // Jei vartotojas neturi reikiamos rolės, nukreipti į jo dashboard
        redirectToDashboard(user.roles || [], router, user.default_role);
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
// CHANGE: Naudojama numatytoji rolė arba pirma rolė iš user.roles sąrašo
function redirectToDashboard(roles: string[] | null | undefined, router: any, defaultRole?: string) {
  const userRoles = roles || [];
  
  if (userRoles.length > 0) {
    // PRIORITY: Use default_role if it exists AND is valid, otherwise use first role
    let roleToUse;
    if (defaultRole && userRoles.includes(defaultRole)) {
      roleToUse = defaultRole;
      console.log('✅ AUTHGUARD Using DEFAULT ROLE:', roleToUse);
    } else {
      roleToUse = userRoles[0];
      console.log('⚠️ AUTHGUARD Using FIRST ROLE (no valid default):', roleToUse);
    }
    console.log('🚀 AUTHGUARD FINAL ROLE TO USE:', roleToUse);
    
    switch (roleToUse) {
      case 'manager':
        router.push('/managers');
        break;
      case 'curator':
        router.push('/curators');
        break;
      case 'mentor':
        router.push('/mentors');
        break;
      case 'parent':
        router.push('/parents');
        break;
      case 'student':
        router.push('/students');
        break;
      default:
        // Fallback to homepage if unknown role
        router.push('/');
    }
  } else {
    // No roles - redirect to homepage
    router.push('/');
  }
} 