// frontend/src/components/layout/Navigation/roles/StudentNavigation.tsx

// StudentNavigation komponentas - studento navigacijos meniu
// Rodo Darbastalis ir Skolos nuorodas student rolei
// CHANGE: Sukurtas StudentNavigation komponentas su student rolei skirtomis nuorodomis

'use client';

import React from 'react';
import Link from 'next/link';

interface StudentNavigationProps {
  isMobile?: boolean;
}

const StudentNavigation: React.FC<StudentNavigationProps> = ({ isMobile = false }) => {
  const linkClasses = isMobile 
    ? "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
    : "text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium";

  return (
    <>
      {/* Darbastalis - student rolei */}
      <Link
        href="/students"
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

export default StudentNavigation;
