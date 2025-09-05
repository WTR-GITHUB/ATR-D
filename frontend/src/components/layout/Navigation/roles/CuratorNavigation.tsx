// frontend/src/components/layout/Navigation/roles/CuratorNavigation.tsx

// CuratorNavigation komponentas - kuratoriaus navigacijos meniu
// Rodo Darbastalis, Skolos ir Vaikai nuorodas curator rolei
// CHANGE: Pridėta Vaikai nuoroda kuratoriaus navigacijai, pakeista tvarka

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
      
      {/* Skolos - curator rolei */}
      <Link
        href="/curators/violations"
        className={linkClasses}
      >
        Skolos
      </Link>
      
      {/* Vaikai - curator rolei */}
      <Link
        href="/curators/children"
        className={linkClasses}
      >
        Vaikai
      </Link>
    </>
  );
};

export default CuratorNavigation;
