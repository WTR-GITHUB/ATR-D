// frontend/src/components/layout/Header.tsx

// Header komponentas - pagrindinė navigacijos juosta
// Rodo logo, navigacijos meniu ir vartotojo informaciją
// CHANGE: Pridėtas User dropdown meniu su Nustatymai ir Logout opcijomis

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import RoleSwitcher from '@/components/ui/RoleSwitcher';
import { BaseNavigation, MobileNavigation } from './Navigation';


const Header: React.FC = () => {
  const { user, isAuthenticated, getCurrentRole: getAuthCurrentRole, setCurrentRole } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get current role from URL or user's default role
  const getCurrentRole = React.useCallback((): string => {
    // CHANGE: Pirmiausia patikrinti current_role iš auth store
    const authCurrentRole = getAuthCurrentRole();
    
    if (authCurrentRole) {
      return authCurrentRole;
    }
    
    // Extract role from current path
    if (pathname.startsWith('/managers')) return 'manager';
    if (pathname.startsWith('/curators')) return 'curator';
    if (pathname.startsWith('/mentors')) return 'mentor';
    if (pathname.startsWith('/parents')) return 'parent';
    if (pathname.startsWith('/students')) return 'student';
    
    // CHANGE: Jei einame į /pva/[id] puslapį, išsaugoti dabartinę rolę
    if (pathname.startsWith('/pva/')) {
      // Grąžinti dabartinę rolę iš localStorage arba user default
      const savedRole = typeof window !== 'undefined' ? localStorage.getItem('current_role') : null;
      if (savedRole) {
        return savedRole;
      }
      // Jei nėra išsaugotos rolės, grąžinti user default_role
      return user?.default_role || user?.roles?.[0] || '';
    }
    
    // Fallback to user's default role or first role
    return user?.default_role || user?.roles?.[0] || '';
  }, [getAuthCurrentRole, pathname, user]);

  // CHANGE: Nustatyti rolę pagal URL kai puslapis keičiasi
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const currentRole = getCurrentRole();
    if (currentRole && currentRole !== getAuthCurrentRole()) {
      setCurrentRole(currentRole);
    }
  }, [pathname, isAuthenticated, user, setCurrentRole, getAuthCurrentRole, getCurrentRole]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              DIENYNAS
            </Link>
          </div>

          {/* Navigation */}
          <BaseNavigation />

          {/* User menu - Role Switcher */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <RoleSwitcher currentRole={getCurrentRole()} />
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="primary" size="sm">
                    Prisijungti
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <MobileNavigation 
              isOpen={isMobileMenuOpen} 
              onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 