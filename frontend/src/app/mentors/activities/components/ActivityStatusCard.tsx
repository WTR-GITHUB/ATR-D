// /frontend/src/app/mentors/activities/components/ActivityStatusCard.tsx

// Atskirą komponentas veiklos statuso kortelei su visais backend ryšiais ir funkcionalumu
// CHANGE: Išskirtas iš VeiklosPageClient.tsx kaip atskiras komponentas ActivityStatusCard

'use client';

import React, { useState } from 'react';
import { Play, Square, Recycle, ChevronDown, ChevronUp } from 'lucide-react';
import { LessonDetails, IMUPlan } from '../types';
import LessonInfoCard from './LessonInfoCard';

// TypeScript interface komponento props'ams
// CHANGE: Atnaujintas interface naujai struktūrai - viena kortelė su keliomis pamokomis
interface ActivityStatusCardProps {
  globalScheduleId: number | null;
  // CHANGE: Pagrindinė veiklos informacija (dalykas, lygis)
  activityInfo: {
    subject_name?: string;
    level_name?: string | null;
  } | null;
  // CHANGE: Unikalios pamokos su mokiniais
  uniqueLessons: {
    lessonDetails: LessonDetails;
    students: IMUPlan[];
  }[];
  activityStartTime: Date | null;
  isActivityActive: boolean;
  isActivityCompleted: boolean;
  onStartActivity: () => Promise<void>;
  onEndActivity: () => Promise<void>;
  onCancelActivity: () => Promise<void>;
}

// Veiklos statuso kortelės komponentas
// Rodo veiklos būseną, laikus ir valdymo mygtukus
// Integruojasi su backend API per parent komponento funkcijas
const ActivityStatusCard: React.FC<ActivityStatusCardProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  globalScheduleId, // CHANGE: Nenaudojamas, bet palikta dėl interface suderinamumo
  activityInfo,
  uniqueLessons,
  activityStartTime,
  isActivityActive,
  isActivityCompleted,
  onStartActivity,
  onEndActivity,
  onCancelActivity,
}) => {
  // CHANGE: Akordeono būsenos valdymas
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* CHANGE: Akordeono header'is - veiklos valdymas */}
      <div 
        className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? "Suskleisti pamokos informaciją" : "Išskleisti pamokos informaciją"}
      >
        {/* Kairėje pusėje - veiklos informacija */}
        <div className="flex items-center space-x-3 flex-1">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {activityInfo?.subject_name || 'Veiklos statusas'}
            </h3>
            {/* CHANGE: Rodo veiklos pradžios datą */}
            {activityStartTime && (
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium text-gray-900">
                  Veikla pradėta: 
                </span>
                <span className="font-medium text-blue-600">
                  {' '}{activityStartTime.toISOString().split('T')[0]}
                </span>
              </p>
            )}
          </div>
        </div>
        
        {/* Viduryje - valdymo mygtukai */}
        <div className="flex items-center space-x-3">
          {/* Veiklos pradžios mygtukas */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Sustabdyti event bubbling
              onStartActivity();
            }}
            disabled={!activityInfo || isActivityActive || isActivityCompleted}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              activityInfo && !isActivityActive && !isActivityCompleted
                ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={activityInfo ? (isActivityActive ? "Veikla jau pradėta" : isActivityCompleted ? "Veikla užbaigta" : "Pradėti veiklą") : "Pirmiausia pasirinkite pamoką"}
          >
            <Play size={16} />
          </button>
          
          {/* Veiklos pabaigos mygtukas */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Sustabdyti event bubbling
              onEndActivity();
            }}
            disabled={!activityInfo || !isActivityActive || isActivityCompleted}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              activityInfo && isActivityActive && !isActivityCompleted
                ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={activityInfo ? (isActivityActive && !isActivityCompleted ? "Užbaigti veiklą" : isActivityCompleted ? "Veikla jau užbaigta" : "Pirmiausia pradėkite veiklą") : "Pirmiausia pasirinkite pamoką"}
          >
            <Square size={16} />
          </button>
          
          {/* CHANGE: Veiklos atšaukimo mygtukas */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Sustabdyti event bubbling
              onCancelActivity();
            }}
            disabled={!activityInfo || (!isActivityActive && !isActivityCompleted)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              activityInfo && (isActivityActive || isActivityCompleted)
                ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={activityInfo ? ((isActivityActive || isActivityCompleted) ? "Atšaukti veiklą" : "Veikla gali būti atšaukta tik pradėta arba užbaigta") : "Pirmiausia pasirinkite pamoką"}
          >
            <Recycle size={16} />
          </button>
        </div>
        
        {/* Dešinėje - chevron ikona */}
        <div className="ml-4 p-1 text-gray-400 pointer-events-none">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {/* CHANGE: Akordeono turinys - kiekviena pamoka kaip accordion su "Pamokos informacija" */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6">
          {uniqueLessons.length > 0 ? (
            <div className="space-y-4">
              {uniqueLessons.map((lessonGroup) => (
                <LessonInfoCard
                  key={`lesson-${lessonGroup.lessonDetails.id}`}
                  lesson={lessonGroup.lessonDetails}
                  studentsForThisLesson={lessonGroup.students}
                  hideHeader={true} // CHANGE: Tik accordion be header'io
                  isActivityActive={isActivityActive}
                  activityStartTime={activityStartTime}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              {isActivityActive 
                ? "Šiai aktyviai veiklai nėra priskirtų pamokų" 
                : "Šiai veiklai nėra priskirtų pamokų"
              }
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityStatusCard;
