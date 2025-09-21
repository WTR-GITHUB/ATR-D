// frontend/src/components/layout/Navigation/MobileNavigation.tsx

// MobileNavigation komponentas - mobile versijos navigacijos meniu
// Rodo role-based navigation mobile įrenginiams
// CHANGE: Sukurtas MobileNavigation komponentas mobile navigacijai

'use client';

import React from 'react';
import { Menu, X } from 'lucide-react';
import BaseNavigation from './BaseNavigation';

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onToggle }) => {
  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile menu dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-b border-gray-200 z-50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <BaseNavigation isMobile={true} />
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;
