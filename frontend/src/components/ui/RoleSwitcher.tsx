'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Check, ChevronDown } from 'lucide-react';

// Role display information
const roleInfo = {
  manager: {
    name: 'Administracija',
    description: 'Pilnas sistemos valdymas',
    path: '/managers'
  },
  curator: {
    name: 'Kuratorius', 
    description: 'Turinio valdymas ir moderavimas',
    path: '/curators'
  },
  mentor: {
    name: 'Mentorius',
    description: 'Mokinių konsultavimas ir vedimas',
    path: '/mentors'
  },
  parent: {
    name: 'Tėvai/Globėjai',
    description: 'Vaiko ugties stebėjimas',
    path: '/parents'
  },
  student: {
    name: 'Mokinys/Mokinė',
    description: 'Mokymosi veikla',
    path: '/students'
  }
};

interface RoleSwitcherProps {
  currentRole?: string;
  onRoleChange?: (role: string) => void;
}

export default function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const { user, logout, getCurrentRole, setCurrentRole } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get active role (from prop or current role from auth store)
  const activeRole = currentRole || getCurrentRole() || user?.default_role || user?.roles?.[0] || '';
  const activeRoleInfo = roleInfo[activeRole as keyof typeof roleInfo];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRoleSelect = (role: string) => {
    
    // CHANGE: Išsaugoti dabartinę rolę auth store
    setCurrentRole(role);
    
    // Call callback if provided
    if (onRoleChange) {
      onRoleChange(role);
    }
    
    // Navigate to role dashboard
    const rolePath = roleInfo[role as keyof typeof roleInfo]?.path || '/';
    router.push(rolePath);
    
    // Close dropdown
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const handleSettings = () => {
    router.push('/settings');
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (!user) return null;

  // Get user initials for avatar
  const initials = user.first_name && user.last_name 
    ? `${user.first_name[0]}${user.last_name[0]}`
    : user.email[0].toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Header Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {/* Avatar */}
        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {initials}
        </div>
        
        {/* User Info */}
        <div className="text-left hidden md:block">
          <div className="text-sm font-medium text-gray-900">
            {user.first_name} {user.last_name}
          </div>
          <div className="text-xs text-gray-500">
            {activeRoleInfo?.name || 'Vartotojas'}
          </div>
        </div>
        
        {/* Dropdown Arrow */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          
          {/* Settings & Logout Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={handleSettings}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700">Nustatymai</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700">Logout</span>
            </button>
          </div>

          {/* Roles Section */}
          {user.roles && user.roles.length > 1 && (
            <div className="py-2">
              <div className="px-4 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rolės
                </h3>
              </div>
              
              {user.roles.map((role) => {
                const info = roleInfo[role as keyof typeof roleInfo];
                const isSelected = role === activeRole;
                
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200 border-l-3 ${
                      isSelected 
                        ? 'bg-blue-50 border-l-blue-500 text-blue-900' 
                        : 'border-l-transparent hover:bg-gray-50 hover:border-l-gray-300'
                    }`}
                  >
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {info?.name || role}
                      </div>
                      <div className={`text-xs mt-1 ${
                        isSelected ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {info?.description || ''}
                      </div>
                    </div>
                    
                    {/* Checkmark */}
                    <Check className={`w-5 h-5 text-green-500 transition-all duration-200 ${
                      isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    }`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}