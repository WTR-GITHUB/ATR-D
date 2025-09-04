// frontend/src/components/layout/Navigation/roles/ParentNavigation.tsx

// ParentNavigation komponentas - tėvo/globėjo navigacijos meniu
// Rodo Darbastalis ir Skolos nuorodas parent rolei
// CHANGE: Sukurtas ParentNavigation komponentas su parent rolei skirtomis nuorodomis

'use client';

import React from 'react';
import Link from 'next/link';

interface ParentNavigationProps {
  isMobile?: boolean;
}

const ParentNavigation: React.FC<ParentNavigationProps> = ({ isMobile = false }) => {
  const linkClasses = isMobile 
    ? "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
    : "text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium";

  return (
    <>
      {/* Darbastalis - parent rolei */}
      <Link
        href="/parents"
        className={linkClasses}
      >
        Darbastalis
      </Link>
      
      {/* Skolos - bendra visoms rolėms */}
      <Link
        href="/violations"
        className={linkClasses}
      >
        Skolos
      </Link>
    </>
  );
};

export default ParentNavigation;
