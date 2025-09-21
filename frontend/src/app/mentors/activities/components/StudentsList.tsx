// frontend/src/app/mentors/activities/components/StudentsList.tsx

// Mokinių sąrašo komponentas
// Atsako už mokinių sąrašo rodymą ir papildomo mokinio pridėjimą
// Integruoja StudentRow komponentus ir valdoma bendrus sąrašo veiksmus
// CHANGE: Pašalinti paieškos lauką, filtrų mygtuką, "Iš viso" statistiką ir visą filtrų sekciją
// CHANGE: Pridėtas StudentSelectionModal funkcionalumas mokinių pridėjimui

'use client';

import React, { useState, useEffect } from 'react';
import { Plus, User } from 'lucide-react';
import StudentRow from './StudentRow';
import StudentSelectionModal from '@/components/ui/StudentSelectionModal';
import { Student, AttendanceStatus } from '../types';
import { User as UserType } from '@/lib/types';

interface StudentsListProps {
  students: Student[];
  onAttendanceChange: (studentId: number, status: AttendanceStatus) => void;
  onAddStudent?: () => void;
  onStudentsAdded?: (students: UserType[]) => void; // CHANGE: Pridėtas callback mokinių pridėjimui
  showAddButton?: boolean;
  isActivityActive?: boolean; // CHANGE: Pridėtas veiklos aktyvumo prop
  planStatus?: 'planned' | 'in_progress' | 'completed'; // CHANGE: Pridėtas plano statusas
  globalScheduleId?: number; // CHANGE: Pridėtas globalScheduleId modal filtravimui
  lessonId?: number; // CHANGE: Pridėtas lessonId modal filtravimui
}

// Mokinių sąrašo komponentas
// Pagrindinis komponentas mokinių sąrašo valdymui
const StudentsList: React.FC<StudentsListProps> = ({
  students: initialStudents,
  onAttendanceChange,
  onAddStudent,
  onStudentsAdded,
  showAddButton = true,
  isActivityActive = false, // CHANGE: Pridėtas veiklos aktyvumo parametras
  planStatus = 'planned', // CHANGE: Pridėtas plano statusas
  globalScheduleId, // CHANGE: Pridėtas globalScheduleId parametras
  lessonId // CHANGE: Pridėtas lessonId parametras
}) => {
  // CHANGE: Modal state valdymas
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // CHANGE: Pridėtas local students state realaus laiko atnaujinimui
  const [students, setStudents] = useState<Student[]>(initialStudents);
  
  // CHANGE: Atnaujinti students state kai keičiasi initialStudents prop
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);
  
  // Statistikų skaičiavimas
  const getAttendanceStats = () => {
    const present = students.filter(s => s.attendance_status === 'present').length;
    const absent = students.filter(s => s.attendance_status === 'absent').length;
    const left = students.filter(s => s.attendance_status === 'left').length; // CHANGE: Pakeista 'late' į 'left'
    const excused = students.filter(s => s.attendance_status === 'excused').length;
    
    return { present, absent, left, excused }; // CHANGE: Pakeista 'late' į 'left'
  };

  // CHANGE: Gauname statistikas
  const stats = getAttendanceStats();

  // CHANGE: Realaus laiko atnaujinimo funkcija lankomumo keitimui
  const handleAttendanceChange = (studentId: number, status: AttendanceStatus) => {
    // Atnaujinti local students state
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === studentId 
          ? { ...student, attendance_status: status }
          : student
      )
    );
    
    // Iškviesti parent callback'ą
    onAttendanceChange(studentId, status);
  };

  // CHANGE: Modal handlers
  const handleAddStudent = () => {
    if (onAddStudent) {
      onAddStudent();
    } else {
      setIsModalOpen(true);
    }
  };

  const handleStudentsSelected = (selectedStudents: UserType[]) => {
    onStudentsAdded?.(selectedStudents);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Debug logging removed - functionality working correctly

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
              {stats.left > 0 && <span className="text-yellow-600">Paliko: {stats.left}</span>} {/* CHANGE: Pakeista 'Vėlavo:' į 'Paliko:' */}
              {stats.excused > 0 && <span className="text-blue-600">Pateisinta: {stats.excused}</span>}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Pridėti mokinio mygtukas */}
            {showAddButton && (
              <button
                onClick={handleAddStudent}
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
                onAttendanceChange={handleAttendanceChange} // CHANGE: Naudojame local handleAttendanceChange funkciją
                isActivityActive={isActivityActive} // CHANGE: Perduodamas veiklos aktyvumas
                planStatus={planStatus} // CHANGE: Perduodamas plano statusas
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

      {/* CHANGE: StudentSelectionModal */}
      <StudentSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStudentsSelected={handleStudentsSelected}
        existingStudents={students.map(s => ({
          id: s.id,
          first_name: s.first_name,
          last_name: s.last_name,
          email: s.email || '',
          roles: ['student'] as const,
          is_active: true,
          date_joined: new Date().toISOString()
        }))}
        globalScheduleId={globalScheduleId}
        lessonId={lessonId}
      />
    </div>
  );
};

export default StudentsList;
