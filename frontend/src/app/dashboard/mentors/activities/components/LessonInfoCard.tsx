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

  // CHANGE: Statusų keitimo funkcija - dabar naudojama tik frontend'o state sinchronizacijai
  // Backend'o API iškvietimas tvarkomas StudentRow komponente
  const handleStudentStatusChange = async (studentId: number, newStatus: string | null) => {
    console.log(`Keičiamas studento ${studentId} statusas į ${newStatus}`);
    
    // CHANGE: Pašalintas API iškvietimas - StudentRow jau tvarko backend'o komunikaciją
    // Dabar šis callback'as naudojamas tik frontend'o state sinchronizacijai
    
    // Galima pridėti papildomą logiką čia, jei reikia
    // Pavyzdžiui: optimistinis UI atnaujinimas, notifikacijos, etc.
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
        {/* CHANGE: Grid layout pakeistas į 2 eilutes po 3 korteles pagal paveiksliuką */}
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
                  <div key={index} className="p-3 bg-blue-100 rounded-lg border border-blue-200">
                    <span className="text-blue-800 text-sm font-medium">{component}</span>
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
                  <div key={index} className="p-3 bg-green-100 rounded-lg border border-green-200">
                    <span className="text-green-800 text-sm font-medium">{objective}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pasiekimo lygiai */}
          {(lesson.slenkstinis || lesson.bazinis || lesson.pagrindinis || lesson.aukstesnysis) && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Award size={18} className="mr-2 text-yellow-600" />
                Pasiekimo lygiai
              </h3>
              <div className="space-y-2">
                {lesson.slenkstinis && (
                  <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                    <span className="text-yellow-800 text-sm font-medium">S: {lesson.slenkstinis}</span>
                  </div>
                )}
                {lesson.bazinis && (
                  <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                    <span className="text-yellow-800 text-sm font-medium">B: {lesson.bazinis}</span>
                  </div>
                )}
                {lesson.pagrindinis && (
                  <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                    <span className="text-yellow-800 text-sm font-medium">P: {lesson.pagrindinis}</span>
                  </div>
                )}
                {lesson.aukstesnysis && (
                  <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                    <span className="text-yellow-800 text-sm font-medium">A: {lesson.aukstesnysis}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CHANGE: Antra eilutė - 3 kortelės */}
        <div className="grid grid-cols-3 gap-8 mt-8">
          
          {/* Gebėjimai */}
          {lesson.skills_list && lesson.skills_list.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Users size={18} className="mr-2 text-purple-600" />
                Gebėjimai
              </h3>
              <div className="space-y-2">
                {/* CHANGE: Dabar rodomi gebėjimų pavadinimai vietoj ID */}
                {lesson.skills_list.map((skillName, index) => (
                  <div key={index} className="p-3 bg-purple-100 rounded-lg border border-purple-200">
                    <span className="text-purple-800 text-sm font-medium">{skillName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BUP Kompetencijos */}
          {lesson.competency_atcheve_name && lesson.competency_atcheve_name.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Zap size={18} className="mr-2 text-indigo-600" />
                BUP Kompetencijos
              </h3>
              <div className="space-y-2">
                {lesson.competency_atcheve_name.map((competency, index) => (
                  <div key={index} className="p-3 bg-indigo-100 rounded-lg border border-indigo-200">
                    <span className="text-indigo-800 text-sm font-medium">{competency}</span>
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

        {/* CHANGE: Mokomoji medžiaga atskirai apačioje (viso pločio) */}
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

        {/* CHANGE: Pridėtas tarpas tarp mokomosios medžiagos ir mokinių sąrašo */}
        {lesson.content && studentsForThisLesson.length > 0 && (
          <div className="mt-12"></div>
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
                      <span className="text-green-600">Dalyvavo: {studentsForThisLesson.filter(s => s.attendance_status === 'present').length}</span>
                      <span className="text-red-600">Nedalyvavo: {studentsForThisLesson.filter(s => s.attendance_status === 'absent').length}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
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
                      lessonId={lesson.id} // CHANGE: Perduodame tikrą pamokos ID
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
