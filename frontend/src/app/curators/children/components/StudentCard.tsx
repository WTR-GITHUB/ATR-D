// frontend/src/app/curators/children/components/StudentCard.tsx

// StudentCard komponentas - mokinio kortelės komponentas
// Rodo mokinio informaciją su avataru, vardu, el. paštu ir tėvų informacija
// CHANGE: Sukurtas StudentCard komponentas pagal pavyzdį su Tailwind CSS

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface StudentCardProps {
  student: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  parents?: {
    father?: string;
    mother?: string;
  };
}

const StudentCard: React.FC<StudentCardProps> = ({ student, parents }) => {
  const router = useRouter();
  
  // Generuojame inicialus iš vardo ir pavardės
  const getInitials = (firstName: string, lastName: string): string => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  const initials = getInitials(student.first_name, student.last_name);
  const fullName = `${student.first_name} ${student.last_name}`.trim();

  // Navigacijos funkcija
  const handleCardClick = () => {
    router.push(`/pva/${student.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-5">
      {/* Kortelės antraštė - clickable */}
      <div 
        className="p-5 border-b border-gray-200 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={handleCardClick}
      >
        {/* Studento avataras */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-lg">
          {initials}
        </div>
        
        {/* Studento informacija */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {fullName}
          </h3>
          <p className="text-sm text-gray-500">
            {student.email}
          </p>
        </div>
      </div>
      
      {/* Kortelės turinys */}
      <div className="p-5">
        <div className="text-center text-gray-500 italic py-10 px-5 text-lg leading-relaxed font-medium">
          Vieta jūsų kurybiškumui. Pasakykite kokią greitą informaciją čia norėtumėte matyti?
        </div>
      </div>
      
      {/* Kortelės apačia */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
        {parents?.father && parents?.mother ? (
          `Tėvas: ${parents.father} • Mama: ${parents.mother}`
        ) : (
          'Tėvų informacija neprieinama'
        )}
      </div>
    </div>
  );
};

export default StudentCard;
