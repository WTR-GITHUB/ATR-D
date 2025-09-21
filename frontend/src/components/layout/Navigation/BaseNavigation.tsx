// frontend/src/components/layout/Navigation/BaseNavigation.tsx

// BaseNavigation komponentas - pagrindinis navigacijos wrapper
// Valdo role-based navigation rendering ir mobile/desktop versijas
// CHANGE: Sukurtas naujas BaseNavigation komponentas role-based navigacijai

'use client';

import React from 'react';
// import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ManagerNavigation from './roles/ManagerNavigation';
import CuratorNavigation from './roles/CuratorNavigation';
import MentorNavigation from './roles/MentorNavigation';
import StudentNavigation from './roles/StudentNavigation';
import ParentNavigation from './roles/ParentNavigation';

interface BaseNavigationProps {
  isMobile?: boolean;
}

const BaseNavigation: React.FC<BaseNavigationProps> = ({ isMobile = false }) => {
  const { user, isAuthenticated, getCurrentRole } = useAuth();
  // usePathname();

  if (!isAuthenticated || !user) {
    return null;
  }

  // CHANGE: Naudoti useAuth hook'o getCurrentRole funkciją vietoj atskiros logikos
  const currentRole = getCurrentRole();

  // Rodyti atitinkamą navigation komponentą pagal rolę
  const renderNavigation = () => {
    switch (currentRole) {
      case 'manager':
        return <ManagerNavigation isMobile={isMobile} />;
      case 'curator':
        return <CuratorNavigation isMobile={isMobile} />;
      case 'mentor':
        return <MentorNavigation isMobile={isMobile} />;
      case 'student':
        return <StudentNavigation isMobile={isMobile} />;
      case 'parent':
        return <ParentNavigation isMobile={isMobile} />;
      default:
        return null;
    }
  };

  return (
    <nav className={isMobile ? "flex flex-col space-y-2" : "hidden md:flex space-x-8"}>
      {renderNavigation()}
    </nav>
  );
};

export default BaseNavigation;
