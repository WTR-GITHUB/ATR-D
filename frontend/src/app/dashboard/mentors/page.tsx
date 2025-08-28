// frontend/src/app/dashboard/mentors/page.tsx
// Mentor dashboard puslapis - rodo informaciją apie dienyno kūrimą
// CHANGE: Pašalintos visos dashboard kortelės, pateiktas tekstas apie dienyno kūrimą
// CHANGE: Atstatyta sveikinimo kortelė viršuje per visą ekrano plotį

'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function MentorsDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Sveiki, {user?.first_name} {user?.last_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Jūsų darbastalis - {new Date().toLocaleDateString('lt-LT')}
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow p-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Dienynas kuriamas
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            Tikimės čia grietai išvysite piloto kabina su nuostabiu vaizdu.
          </p>
          
          {/* Decorative Elements */}
          <div className="mt-12 flex justify-center space-x-8">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
            </div>
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 