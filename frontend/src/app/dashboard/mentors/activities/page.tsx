// frontend/src/app/dashboard/mentors/activities/page.tsx

// Veiklos puslapis - pamokų peržiūra ir detalės
// Šis puslapis skirtas mentoriams peržiūrėti pasirinktas pamokas ir jų detales
// Rodo tvarkaraštį ir pasirinktos pamokos informaciją su mokinių sąrašu
// CHANGE: Pašalintas StudentsList komponentas - mokiniai rodomi tik LessonInfoCard viduje

'use client';

import React, { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import LessonDetailsPanel from './components/LessonDetailsPanel';
import WeeklyScheduleCalendar from '@/components/dashboard/WeeklyScheduleCalendar';
import useWeekInfo from '@/hooks/useWeekInfo';
import useSelectedLesson from '@/hooks/useSelectedLesson';

// Pamokų duomenys gaunami per API hooks

// Pagrindinis Veiklos puslapis
// Skirtas mentoriams vykdyti pamokas ir peržiūrėti pamokų detales
const VeiklosPage = () => {
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);
  
  // Inicializuojame weekInfo iš karto su dabartine savaite
  const initialWeekInfo = useWeekInfo();
  const [weekInfo, setWeekInfo] = useState<any>(null);
  
  // Kombinuojame initial info su dinamiškai atnaujinamu
  const displayWeekInfo = weekInfo || initialWeekInfo;

  // Pasirinktos pamokos valdymas
  const {
    globalScheduleId,
    lessonDetails,
    allLessonsDetails,
    imuPlans,
    isLoading: lessonLoading,
    error: lessonError,
    selectScheduleItem,
    clearSelection,
    refreshLessonData
  } = useSelectedLesson();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Puslapio antraštė */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Veiklos</h1>
          <p className="text-gray-600 mt-1">Pamokų vykdymas ir mokinių lankomumo registravimas</p>
        </div>

        {/* Pamokos pasirinkimo komponentas pašalintas - nebe reikalingas */}

        {/* Savaitės tvarkaraščio akordeoras */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3 flex-1">
              <Calendar className="h-5 w-5 text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Savaitės tvarkaraštis</h3>
                {displayWeekInfo ? (
                  <p className="text-sm text-gray-600">
                    {displayWeekInfo.dateRangeText}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${displayWeekInfo.statusColor}`}>
                      {displayWeekInfo.statusText}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">Peržiūrėti visą savaitės tvarkaraštį</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Navigacijos mygtukai akordeono antraštėje */}
              {displayWeekInfo && (
                <>
                  <button
                    onClick={() => weekInfo?.navigateWeek ? weekInfo.navigateWeek(-1) : console.log('Navigate -1')}
                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                    title="Ankstesnė savaitė"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <button
                    onClick={() => weekInfo?.goToToday ? weekInfo.goToToday() : console.log('Go to today')}
                    className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    title="Eiti į šiandienos savaitę"
                  >
                    Dabar
                  </button>
                  
                  <button
                    onClick={() => weekInfo?.navigateWeek ? weekInfo.navigateWeek(1) : console.log('Navigate +1')}
                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                    title="Kita savaitė"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsScheduleExpanded(!isScheduleExpanded)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                title={isScheduleExpanded ? "Suskleisti tvarkaraštį" : "Išskleisti tvarkaraštį"}
              >
                {isScheduleExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>
          
          {isScheduleExpanded && (
            <div className="border-t border-gray-200">
              <WeeklyScheduleCalendar 
                className="border-0 shadow-none" 
                showHeader={false}
                onWeekChange={setWeekInfo}
                onScheduleItemSelect={selectScheduleItem}
                selectedScheduleId={globalScheduleId}
              />
            </div>
          )}
        </div>

        {/* Pasirinktos pamokos detalės */}
        <LessonDetailsPanel
          lessonDetails={lessonDetails}
          allLessonsDetails={allLessonsDetails}
          imuPlans={imuPlans}
          isLoading={lessonLoading}
          error={lessonError}
        />





        {/* Auto-save indikatorius (fiksuotas pozicija apačioje dešinėje) */}
        <div className="fixed bottom-6 right-6">
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} />
              <span className="text-sm">Pakeitimai automatiškai išsaugoti</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeiklosPage;
