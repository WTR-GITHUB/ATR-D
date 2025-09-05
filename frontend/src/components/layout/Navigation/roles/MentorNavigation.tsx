// frontend/src/components/layout/Navigation/roles/MentorNavigation.tsx

// MentorNavigation komponentas - mentoriaus navigacijos meniu
// Rodo Darbastalis, Skolos ir papildomas nuorodas mentor rolei
// CHANGE: Sukurtas MentorNavigation komponentas su mentor rolei skirtomis nuorodomis

'use client';

import React from 'react';
import Link from 'next/link';

interface MentorNavigationProps {
  isMobile?: boolean;
}

const MentorNavigation: React.FC<MentorNavigationProps> = ({ isMobile = false }) => {
  const linkClasses = isMobile 
    ? "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
    : "text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium";

  return (
    <>
      {/* Darbastalis - mentor rolei */}
      <Link
        href="/mentors"
        className={linkClasses}
      >
        Darbastalis
      </Link>
      
      {/* Papildomos nuorodos - tik mentor rolei */}
      <Link
        href="/mentors/activities"
        className={linkClasses}
      >
        Veiklos
      </Link>
      
      <Link
        href="/mentors/lessons"
        className={linkClasses}
      >
        Pamokos
      </Link>
      
      <Link
        href="/mentors/plans"
        className={linkClasses}
      >
        Ugdymo planai
      </Link>
      
      {/* Skolos - bendra visoms rolėms */}
      <Link
        href="/mentors/violations"
        className={linkClasses}
      >
        Skolos
      </Link>
    </>
  );
};

export default MentorNavigation;
