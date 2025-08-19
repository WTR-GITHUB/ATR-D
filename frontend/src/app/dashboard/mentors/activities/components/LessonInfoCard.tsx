// frontend/src/app/dashboard/mentors/activities/components/LessonInfoCard.tsx

// Komponentas vienos pamokos informacijai atvaizduoti
// Rodo pamokos pavadinimą, dalykų informacija, komponentus, tikslus, gebėjimus ir mokomąją medžiagą
// Naudoja duomenis iš curriculum/models.py Lesson modelio
// CHANGE: Patobulinta su spalvotais ikonomis, pagerintu layoutu ir modernumu dizainu pagal ddd failo pavyzdį
// CHANGE: Pašalintas StudentStats komponentas - statistikos nereikalingos

import React from 'react';
import { 
  BookOpen, 
  Target, 
  Zap, 
  Award,
  Users,
  Search,
  Filter,
  Focus
} from 'lucide-react';
import { LessonDetails, IMUPlan } from '../types';
import StudentRow from './StudentRow';

interface LessonInfoCardProps {
  lesson: LessonDetails;
  studentsForThisLesson: IMUPlan[];
  isActivityActive?: boolean; // Ar veikla aktyvi (vyksta)
  activityStartTime?: Date | null; // Veiklos pradžios laikas
}

const LessonInfoCard: React.FC<LessonInfoCardProps> = ({
  lesson,
  studentsForThisLesson,
  isActivityActive = false,
  activityStartTime = null
}) => {
  // Pagalbinė funkcija JSON string'o parse'inimui
  const parseJsonString = (jsonString: string): any[] => {
    if (!jsonString) return [];
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  };

  // Statusų keitimo funkcija
  const handleStudentStatusChange = (studentId: number, newStatus: string) => {
    console.log(`Keičiamas studento ${studentId} statusas į ${newStatus}`);
    // Čia galima pridėti API iškvietimą statusui atnaujinti
  };

  const objectives = parseJsonString(lesson.objectives);
  const components = parseJsonString(lesson.components);
  const focus = parseJsonString(lesson.focus);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
      {/* Antraštė su pagerintų stilium */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{lesson.title}</h1>
            <p className="text-gray-600 mt-1">
              {lesson.subject_name} • {lesson.levels_names.join(', ')} • {lesson.topic}
            </p>
          </div>
          {lesson.virtues_names.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Dorybės:</span>
              <div className="flex space-x-2">
                {lesson.virtues_names.map((virtue, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                  >
                    {virtue}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-8">
          
          {/* Komponentai */}
          {components.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Zap size={18} className="mr-2 text-blue-600" />
                Komponentai
              </h3>
              <div className="space-y-2">
                {components.map((component, index) => (
                  <div key={index} className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <span className="text-gray-600 text-sm font-medium">{component}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tikslai */}
          {objectives.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Target size={18} className="mr-2 text-green-600" />
                Tikslai
              </h3>
              <div className="space-y-2">
                {objectives.map((objective, index) => (
                  <div key={index} className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <span className="text-gray-600 text-sm font-medium">{objective}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fokusai */}
          {focus.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Focus size={18} className="mr-2 text-rose-600" />
                Fokusai
              </h3>
              <div className="space-y-2">
                {focus.map((focusItem, index) => (
                  <div key={index} className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <span className="text-gray-600 text-sm font-medium">{focusItem}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mokomoji medžiaga */}
        {lesson.content && (
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BookOpen size={18} className="mr-2 text-gray-600" />
              Mokomoji medžiaga
            </h3>
            <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
              <div className="text-gray-700 text-sm whitespace-pre-wrap">
                {lesson.content}
              </div>
            </div>
          </div>
        )}

        {/* 5. Mokinių sąrašas su antrašte ir statistikomis */}
        {studentsForThisLesson.length > 0 && (
          <div>
            {/* Mokinių sąrašo antraštė su statistikomis - pagal paveiksliuką */}
            <div className="bg-white rounded-lg border border-gray-200 mb-4">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Mokinių sąrašas
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>Iš viso: {studentsForThisLesson.length}</span>
                      {/* REFAKTORINIMAS: Dabar naudojame attendance_status tiesiogiai */}
                      <span className="text-green-600">Dalyvavo: {studentsForThisLesson.filter(s => s.attendance_status === 'present').length}</span>
                      <span className="text-red-600">Nedalyvavo: {studentsForThisLesson.filter(s => s.attendance_status === 'absent').length}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Paieškos laukas */}
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Ieškoti mokinio..."
                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                      />
                    </div>

                    {/* Filtrų mygtukas */}
                    <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors">
                      <Filter size={16} />
                      <span>Filtrai</span>
                    </button>

                    {/* Pridėti mokinio mygtukas */}
                    <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                      <span>+ Pridėti mokinį</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Mokinių sąrašas */}
              <div className="p-4">
                <div className="space-y-2">
                  {studentsForThisLesson.map((student) => (
                    <StudentRow
                      key={student.id}
                      student={student}
                      onAttendanceChange={(studentId, status) => handleStudentStatusChange(studentId, status as string)}
                      isIMUPlan={true}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonInfoCard;
