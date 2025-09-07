// frontend/src/app/curators/children/page.tsx

// CuratorsChildrenPage - kuratoriaus vaikų valdymo puslapis
// Rodo vaikų sąrašą su StudentCard komponentais
// CHANGE: Integruotas StudentCard komponentas ir useCuratorStudents hook

'use client';

import React, { useEffect } from 'react';
import { StudentCard } from './components';
import { useCuratorStudents } from '@/hooks/useCuratorStudents';
import { useAuth } from '@/hooks/useAuth';

export default function CuratorsChildrenPage() {
  const { students, loading, error } = useCuratorStudents();
  const { setCurrentRole } = useAuth();

  // CHANGE: Nustatyti curator rolę kai puslapis kraunasi
  useEffect(() => {
    setCurrentRole('curator');
  }, [setCurrentRole]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Vaikai</h1>
          <p className="text-gray-600 mt-2">Valdykite savo vaikų informaciją ir pažangą</p>
        </div>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Kraunama...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Vaikai</h1>
          <p className="text-gray-600 mt-2">Valdykite savo vaikų informaciją ir pažangą</p>
        </div>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
          <div className="text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Klaida</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Puslapio antraštė */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Vaikai</h1>
        <p className="text-gray-600 mt-2">
          Valdykite savo vaikų informaciją ir pažangą ({students.length} vaikų)
        </p>
      </div>

      {/* Studentų kortelės */}
      {students.length === 0 ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)] bg-gray-50 rounded-lg p-8 shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nėra priskirtų vaikų</h2>
            <p className="text-gray-600 text-lg">
              Jums dar nėra priskirtų vaikų. Susisiekite su administratoriumi.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student, index) => (
            <StudentCard
              key={`student-${student.id}-${index}`}
              student={student}
              parents={{
                father: 'Petras Jonaitis', // Statinis duomuo kol kas
                mother: 'Audronė Jonaitienė' // Statinis duomuo kol kas
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
