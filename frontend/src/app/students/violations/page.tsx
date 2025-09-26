// /home/vilkas/atradimai/dienynas/frontend/src/app/students/violations/page.tsx

// Studentų pažeidimų puslapis
// CHANGE: Sukurtas tuščias puslapis su pranešimu apie kuriamą funkcionalumą

'use client';

import React from 'react';
import ClientAuthGuard from '@/components/auth/ClientAuthGuard';
import { Construction } from 'lucide-react';

export default function StudentViolationsPage() {
  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['student']}>
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Construction className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Skolų puslapis kuriamas
          </h2>
          <p className="text-gray-600">
            Šis funkcionalumas bus sukurtas ateityje.
          </p>
        </div>
      </div>
    </div>
    </ClientAuthGuard>
  );
}
