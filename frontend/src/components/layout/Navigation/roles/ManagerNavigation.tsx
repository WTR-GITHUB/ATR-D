// frontend/src/components/layout/Navigation/roles/ManagerNavigation.tsx

// ManagerNavigation komponentas - sistemos valdytojo navigacijos meniu
// Rodo Darbastalis ir Skolos nuorodas manager rolei
// CHANGE: Sukurtas ManagerNavigation komponentas su manager rolei skirtomis nuorodomis

'use client';

import React from 'react';
import Link from 'next/link';

interface ManagerNavigationProps {
  isMobile?: boolean;
}

const ManagerNavigation: React.FC<ManagerNavigationProps> = ({ isMobile = false }) => {
  const linkClasses = isMobile 
    ? "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
    : "text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium";

  return (
    <>
      {/* Darbastalis - manager rolei */}
      <Link
        href="/managers"
        className={linkClasses}
      >
        Darbastalis
      </Link>
      
      {/* Skolos - bendra visoms rolėms */}
      <Link
        href="/managers/violations"
        className={linkClasses}
      >
        Skolos
      </Link>
    </>
  );
};

export default ManagerNavigation;
