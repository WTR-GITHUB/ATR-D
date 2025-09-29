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
  const { user, isAuthenticated, currentRole } = useAuth();
  // usePathname();

  // CHANGE: Naudoti currentRole tiesiogiai iš useAuth state
  // Event-based role synchronization užtikrina, kad visi komponentai gauna atnaujinimus

  if (!isAuthenticated || !user) {
    return null;
  }

  // CHANGE: Naudoti currentRole tiesiogiai iš useAuth state vietoj getCurrentRole funkcijos
  // Tai užtikrins, kad komponentas per-renderinamas kai currentRole keičiasi

  // Rodyti atitinkamą navigation komponentą pagal rolę
  const renderNavigation = () => {
    switch (currentRole) {
      case 'manager':
        return <ManagerNavigation key="manager" isMobile={isMobile} />;
      case 'curator':
        return <CuratorNavigation key="curator" isMobile={isMobile} />;
      case 'mentor':
        return <MentorNavigation key="mentor" isMobile={isMobile} />;
      case 'student':
        return <StudentNavigation key="student" isMobile={isMobile} />;
      case 'parent':
        return <ParentNavigation key="parent" isMobile={isMobile} />;
      default:
        return null;
    }
  };

  return (
    <nav 
      key={currentRole} 
      className={isMobile ? "flex flex-col space-y-2" : "hidden md:flex space-x-8"}
    >
      {renderNavigation()}
    </nav>
  );
};

export default BaseNavigation;
