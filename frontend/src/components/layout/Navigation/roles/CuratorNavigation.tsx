// frontend/src/components/layout/Navigation/roles/CuratorNavigation.tsx

// CuratorNavigation komponentas - kuratoriaus navigacijos meniu
// Rodo Darbastalis ir Skolos nuorodas curator rolei
// CHANGE: Sukurtas CuratorNavigation komponentas su curator rolei skirtomis nuorodomis

'use client';

import React from 'react';
import Link from 'next/link';

interface CuratorNavigationProps {
  isMobile?: boolean;
}

const CuratorNavigation: React.FC<CuratorNavigationProps> = ({ isMobile = false }) => {
  const linkClasses = isMobile 
    ? "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
    : "text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium";

  return (
    <>
      {/* Darbastalis - curator rolei */}
      <Link
        href="/curators"
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

export default CuratorNavigation;
