// frontend/src/app/pva/[id]/page.tsx

// StudentDetailsPage - studento detalių puslapis
// Rodo studento pilną informaciją su role-based prieigos kontrole
// CHANGE: Sukurtas studento detalių puslapis su saugumo apsauga
// CHANGE: Atnaujintas importas - StudentScheduleCalendar perkeltas į vietinę components direktoriją

'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useStudentDetails } from '@/hooks/useStudentDetails';
import { useAuth } from '@/hooks/useAuth';
import { StudentScheduleCalendar } from '../components';

export default function StudentDetailsPage() {
  const params = useParams();
  const studentId = params.id as string;
  const { user } = useAuth();
  const { student, loading, error, accessDenied } = useStudentDetails(studentId);
  
  // Tvarkaraščio valdymas
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  // Client-side role-based access control
  if (user && !user.roles?.includes('curator') && !user.roles?.includes('manager')) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Prieiga uždrausta</h1>
          <p className="text-gray-600">
            Jūs neturite teisių peržiūrėti šio puslapio turinį.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Studento informacija</h1>
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

  if (accessDenied) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Studento informacija</h1>
        </div>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Prieiga uždrausta</h2>
            <p className="text-gray-600">
              Jūs neturite teisių peržiūrėti šio studento duomenis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Studento informacija</h1>
        </div>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Klaida</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Studento informacija</h1>
        </div>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Studentas nerastas</h2>
            <p className="text-gray-600">
              Nurodytas studentas neegzistuoja arba buvo pašalintas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Puslapio antraštė */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {student.first_name} {student.last_name}
        </h1>
        <p className="text-gray-600 mt-2">Studento detali informacija</p>
      </div>

      {/* Studento informacija */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pagrindinė informacija */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagrindinė informacija</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Vardas</label>
                <p className="text-gray-900">{student.first_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Pavardė</label>
                <p className="text-gray-900">{student.last_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">El. paštas</label>
                <p className="text-gray-900">{student.email}</p>
              </div>
              {student.phone_number && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefono numeris</label>
                  <p className="text-gray-900">{student.phone_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Papildoma informacija */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Papildoma informacija</h3>
            <div className="space-y-3">
              {student.birth_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Gimimo data</label>
                  <p className="text-gray-900">{student.birth_date}</p>
                </div>
              )}
              {student.contract_number && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Sutarties numeris</label>
                  <p className="text-gray-900">{student.contract_number}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Rolės</label>
                <p className="text-gray-900">{student.roles?.join(', ') || 'Nėra'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Studento tvarkaraštis */}
      <StudentScheduleCalendar
        studentId={parseInt(studentId)}
        onScheduleItemSelect={setSelectedScheduleId}
        selectedScheduleId={selectedScheduleId || undefined}
        onWeekChange={(weekInfo) => {
          // Galime naudoti weekInfo jei reikia
          console.log('Week changed:', weekInfo);
        }}
      />

      {/* Pasirinktos pamokos informacija */}
      {selectedScheduleId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pasirinkta pamoka</h3>
          <div className="text-center text-gray-500 italic py-10 px-5 text-lg leading-relaxed font-medium">
            Pamokos informacija bus rodoma čia (ID: {selectedScheduleId})
          </div>
        </div>
      )}

      {/* Placeholder turinys */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Papildoma informacija</h3>
        <div className="text-center text-gray-500 italic py-10 px-5 text-lg leading-relaxed font-medium">
          Vieta jūsų kurybiškumui. Pasakykite kokią greitą informaciją čia norėtumėte matyti?
        </div>
      </div>
    </div>
  );
}
