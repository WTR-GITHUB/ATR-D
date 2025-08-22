// frontend/src/app/dashboard/mentors/activities/components/StudentsList.tsx

// Mokinių sąrašo komponentas
// Atsako už mokinių sąrašo rodymą ir papildomo mokinio pridėjimą
// Integruoja StudentRow komponentus ir valdoma bendrus sąrašo veiksmus
// CHANGE: Pašalinti paieškos lauką, filtrų mygtuką, "Iš viso" statistiką ir visą filtrų sekciją

'use client';

import React, { useState } from 'react';
import { Plus, User } from 'lucide-react';
import StudentRow from './StudentRow';
import { Student, AttendanceStatus } from '../types';

interface StudentsListProps {
  students: Student[];
  onAttendanceChange: (studentId: number, status: AttendanceStatus) => void;
  onAddStudent?: () => void;
  showAddButton?: boolean;
}

// Mokinių sąrašo komponentas
// Pagrindinis komponentas mokinių sąrašo valdymui
const StudentsList: React.FC<StudentsListProps> = ({
  students,
  onAttendanceChange,
  onAddStudent,
  showAddButton = true
}) => {
  // Statistikų skaičiavimas
  const stats = React.useMemo(() => {
    const present = students.filter(s => s.attendance_status === 'present').length;
    const absent = students.filter(s => s.attendance_status === 'absent').length;
    const late = students.filter(s => s.attendance_status === 'late').length;
    const excused = students.filter(s => s.attendance_status === 'excused').length;
    
    return { present, absent, late, excused };
  }, [students]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Antraštė su statistikomis ir veiksmais */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Mokinių sąrašas
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <span className="text-green-600">Dalyvavo: {stats.present}</span>
              <span className="text-red-600">Nedalyvavo: {stats.absent}</span>
              {stats.late > 0 && <span className="text-yellow-600">Vėlavo: {stats.late}</span>}
              {stats.excused > 0 && <span className="text-blue-600">Pateisinta: {stats.excused}</span>}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Pridėti mokinio mygtukas */}
            {showAddButton && onAddStudent && (
              <button
                onClick={onAddStudent}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span>Pridėti mokinį</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mokinių sąrašas */}
      <div className="p-6">
        {students.length > 0 ? (
          <div className="space-y-2">
            {students.map(student => (
              <StudentRow
                key={student.id}
                student={student}
                onAttendanceChange={onAttendanceChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <User size={48} className="mx-auto mb-2 text-gray-300" />
            <p>Šiai pamokai nėra priskirtų mokinių</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsList;
