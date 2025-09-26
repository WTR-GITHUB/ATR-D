'use client';

import React from 'react';
import { Construction } from 'lucide-react';
import ClientAuthGuard from '@/components/auth/ClientAuthGuard';


export default function MentorDashboardPage() {
  
  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['mentor']}>
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Construction className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Darbastalis kuriamas
          </h2>
          <p className="text-gray-600">
            Vieta jūms pamąstyti ir pasiūlyti ką norite matyti, kokia informacija svarbiausia?
          </p>
        </div>
      </div>
    </div>
    </ClientAuthGuard>
  );
}