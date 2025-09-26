// /home/master/DIENYNAS/frontend/src/app/curators/violations/analytics/page.tsx

// Kuratorių skolų analizės puslapis - šiuo metu kuriamas
// Rodo pranešimą, kad funkcionalumas bus sukurtas ateityje
// CHANGE: Pakeistas į "kuriamas" pranešimą vietoj pilno analytics funkcionalumo

'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import React from 'react';
import { ArrowLeft, Construction } from 'lucide-react';
import Link from 'next/link';
import ClientAuthGuard from '@/components/auth/ClientAuthGuard';

export default function CuratorViolationsAnalyticsPage() {
  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['curator']}>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/curators/violations"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Grįžti į skolų valdymą
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Skolų analizė
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
              <Construction className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Skolų puslapis kuriamas
              </h2>
              <p className="text-gray-600 text-lg">
                Šis funkcionalumas bus sukurtas ateityje.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ClientAuthGuard>
  );
}