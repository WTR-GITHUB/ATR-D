// frontend/src/components/layout/Header.tsx

// Header komponentas - pagrindinė navigacijos juosta
// Rodo logo, navigacijos meniu ir vartotojo informaciją
// CHANGE: Pridėtas User dropdown meniu su Nustatymai ir Logout opcijomis

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { User, LogOut, Menu, Settings, ChevronDown } from 'lucide-react';

// Funkcija rolių pavadinimams gauti
const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'manager':
      return 'Sistemos valdytojas';
    case 'student':
      return 'Studentas';
    case 'parent':
      return 'Tėvas';
    case 'curator':
      return 'Kuratorius';
    case 'mentor':
      return 'Mentorius';
    default:
      return 'A-DIENYNAS';
  }
};

// Funkcija rolių sąrašui gauti
const getRolesDisplayNames = (roles: string[] | null | undefined): string => {
  if (!roles || !Array.isArray(roles)) {
    return 'A-DIENYNAS';
  }
  return roles.map(getRoleDisplayName).join(', ');
};

// Funkcija patikrinti, ar vartotojas turi role
const hasRole = (roles: string[] | null | undefined, role: string): boolean => {
  if (!roles || !Array.isArray(roles)) {
    return false;
  }
  return roles.includes(role);
};

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  // Uždaryti dropdown, kai paspaudžiama už jo ribų
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              {isAuthenticated && user ? getRolesDisplayNames(user.roles) : 'A-DIENYNAS'}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {isAuthenticated && user && (
              <>
                {/* Mentorius meniu */}
                {hasRole(user.roles, 'mentor') && (
                  <>
                    <Link
                      href="/dashboard/mentors"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Darbastalis
                    </Link>
                    <Link
                      href="/dashboard/mentors/activities"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Veiklos
                    </Link>
                    <Link
                      href="/dashboard/mentors/lessons"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Pamokos
                    </Link>
                    <Link
                      href="/dashboard/mentors/plans"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Ugdymo planai
                    </Link>
                  </>
                )}
                
                {/* Admin meniu */}
                {hasRole(user.roles, 'manager') && (
                  <>
                    <Link
                      href="/dashboard/managers"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Sistemos valdymas
                    </Link>
                  </>
                )}
                
                {/* Kiti vartotojai - bendras meniu */}
                {!hasRole(user.roles, 'mentor') && !hasRole(user.roles, 'manager') && (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/students"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Students
                    </Link>
                    <Link
                      href="/dashboard/parents"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Parents
                    </Link>
                    <Link
                      href="/dashboard/curators"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Curators
                    </Link>
                    <Link
                      href="/dashboard/mentors"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Mentors
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                {/* User dropdown trigger */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-700">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Nustatymai</span>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="primary" size="sm">
                    Prisijungti
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 