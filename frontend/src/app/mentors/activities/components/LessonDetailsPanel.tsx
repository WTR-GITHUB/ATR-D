// frontend/src/app/mentors/activities/components/LessonDetailsPanel.tsx

// Komponentas išsamiai pamokos informacijai rodyti
// Naudoja LessonInfoCard komponentą kiekvienai pamokai atvaizduoti
// Filtruoja IMU planus pagal pamokas ir rodo studentus kiekvienai pamokai
// CHANGE: Pertvarkyta naudoti LessonInfoCard komponentą su studentų filtravimu
// CHANGE: Pridėti props veiklos būsenai, kad StudentStats komponentas galėtų rodyti aktyvų "Dalyvavo" statusą

import React from 'react';
import { 
  BookOpen, 
  AlertCircle
} from 'lucide-react';
import { LessonDetails, IMUPlan } from '../types';
import LessonInfoCard from './LessonInfoCard';

interface LessonDetailsPanelProps {
  lessonDetails: LessonDetails | null;
  allLessonsDetails: LessonDetails[];
  imuPlans: IMUPlan[];
  isLoading: boolean;
  error: string | null;
  isActivityActive?: boolean; // Ar veikla aktyvi (vyksta)
  activityStartTime?: Date | null; // Veiklos pradžios laikas
  planStatus?: 'planned' | 'in_progress' | 'completed'; // CHANGE: Pridėtas plano statusas
  subjectId?: number; // CHANGE: Pridėtas subject ID lankomumo statistikai
  globalScheduleId?: number; // CHANGE: Pridėtas globalScheduleId prop
}

const LessonDetailsPanel: React.FC<LessonDetailsPanelProps> = ({
  // lessonDetails,
  allLessonsDetails,
  imuPlans,
  isLoading,
  error,
  isActivityActive = false,
  activityStartTime = null,
  planStatus = 'planned', // CHANGE: Pridėtas plano statusas
  subjectId, // CHANGE: Pridėtas subjectId parametras
  globalScheduleId // CHANGE: Pridėtas globalScheduleId parametras
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Kraunama pamokos informacija...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Klaida: {error}</span>
        </div>
      </div>
    );
  }

  if (allLessonsDetails.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500 py-8">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Pasirinkite pamoką iš tvarkaraščio, kad matytumėte išsamią informaciją</p>
        </div>
      </div>
    );
  }

  // Funkcija gauti studentus konkrečiai pamokai
  const getStudentsForLesson = (lessonId: number): IMUPlan[] => {
    return imuPlans.filter(plan => 
      typeof plan.lesson === 'object' && plan.lesson?.id === lessonId
    );
  };

  return (
    <div className="space-y-4">
      {/* Rodome kiekvieną pamoką atskirame LessonInfoCard komponente */}
      {allLessonsDetails.map((lesson) => (
        <LessonInfoCard
          key={lesson.id}
          lesson={lesson}
          studentsForThisLesson={getStudentsForLesson(lesson.id)}
          isActivityActive={isActivityActive}
          activityStartTime={activityStartTime}
          planStatus={planStatus} // CHANGE: Pridėtas plano statusas
          subjectId={subjectId} // CHANGE: Pridėtas subjectId
          globalScheduleId={globalScheduleId} // CHANGE: Pridėtas globalScheduleId
        />
      ))}
      
      {/* Jei nėra pamokų duomenų, bet yra IMU planai be pamokų */}
      {allLessonsDetails.length === 0 && imuPlans.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <h4 className="text-md font-medium text-gray-900">
              Studentai be priskirtų pamokų ({imuPlans.length})
            </h4>
          </div>
          <div className="space-y-2">
            {imuPlans.map((plan) => (
              <div 
                key={plan.id}
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {plan.student_name}
                  </p>
                  <p className="text-xs text-gray-600">
                    Pamoka nepriskirta
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {plan.attendance_status_display || 'Nepažymėta'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonDetailsPanel;
