// /home/vilkas/atradimai/dienynas/frontend/src/app/parents/violations/page.tsx

// Tėvų pažeidimų puslapis
// CHANGE: Sukurtas tuščias puslapis su pranešimu apie kuriamą funkcionalumą

'use client';

import React from 'react';
import { ArrowLeft, Construction } from 'lucide-react';
import Link from 'next/link';

export default function ParentViolationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/parents"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Atgal į tėvų panelę
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Pažeidimų valdymas</h1>
            </div>
          </div>
        </div>
      </div>

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
  );
}
