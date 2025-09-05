// frontend/src/app/curators/dashboard/page.tsx

// Curators dashboard puslapis - kuratoriaus darbastalis
// Rodo "Darbastalis kuriamas" pranešimą
// CHANGE: Pašalintos visos kortelės ir pakeistas į paprastą pranešimą

'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function CuratorsDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Darbastalis kuriamas
          </h1>
          <p className="text-gray-600">
            Kuratoriaus darbastalis šiuo metu kuriamas. 
            <br />
            Ateityje čia bus rodoma informacija apie studentus, 
            jų pažymius ir kitus svarbius duomenis.
          </p>
        </div>
      </div>
    </div>
  );
}