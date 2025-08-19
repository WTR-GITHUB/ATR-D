// frontend/src/app/dashboard/mentors/activities/page.tsx

// Veiklos puslapis - pamokų peržiūra ir detalės
// Šis puslapis skirtas mentoriams peržiūrėti pasirinktas pamokas ir jų detales
// Rodo tvarkaraštį ir pasirinktos pamokos informaciją su mokinių sąrašu
// CHANGE: Pašalintas StudentsList komponentas - mokiniai rodomi tik LessonInfoCard viduje
// CHANGE: Pridėta veiklos statuso kortelė su mygtukais "Pradėti veiklą" ir "Užbaigti veiklą"
// CHANGE: Pridėtas veiklos laiko rodymas viduryje su 2 eilučių rezervacija

'use client';

import React, { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Calendar, Play, Square, Clock } from 'lucide-react';
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

  // Veiklos laiko valdymas
  const [activityStartTime, setActivityStartTime] = useState<Date | null>(null);
  const [activityEndTime, setActivityEndTime] = useState<Date | null>(null);
  const [isActivityActive, setIsActivityActive] = useState(false);

  // Veiklos pradžios funkcija
  const handleStartActivity = async () => {
    if (!globalScheduleId) return;
    
    try {
      const response = await fetch('/api/plans/imu-plans/start_activity/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          global_schedule_id: globalScheduleId
        })
      });

      if (response.ok) {
        const result = await response.json();
        const startTime = new Date(result.started_at);
        
        setActivityStartTime(startTime);
        setIsActivityActive(true);
        
        // Atnaujinti mokinių duomenis
        refreshLessonData();
      } else {
        console.error('Klaida pradedant veiklą');
      }
    } catch (error) {
      console.error('Klaida pradedant veiklą:', error);
    }
  };

  // Veiklos pabaigos funkcija
  const handleEndActivity = async () => {
    if (!globalScheduleId) return;
    
    try {
      const response = await fetch('/api/plans/imu-plans/end_activity/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          global_schedule_id: globalScheduleId
        })
      });

      if (response.ok) {
        const result = await response.json();
        const endTime = new Date(result.completed_at);
        
        setActivityEndTime(endTime);
        setIsActivityActive(false);
        
        // Atnaujinti mokinių duomenis
        refreshLessonData();
      } else {
        console.error('Klaida baigiant veiklą');
      }
    } catch (error) {
      console.error('Klaida baigiant veiklą:', error);
    }
  };

  // Formatavimo funkcija laikui
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('lt-LT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

        {/* Veiklos statuso kortelė */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Veiklos statusas</h3>
                  <p className="text-sm text-gray-600">
                    {lessonDetails ? (
                      <span className="flex items-center space-x-2">
                        <span className="font-medium text-blue-600">
                          {lessonDetails.subject_name} - {lessonDetails.levels_names?.[0] || 'N/A'}
                        </span>
                      </span>
                    ) : (
                      "Nepasirinkta jokia pamoka"
                    )}
                  </p>
                </div>
              </div>
              
              {/* Veiklos laiko rodymas viduryje */}
              <div className="flex-1 mx-8">
                <div className="text-center space-y-2">
                  {/* 1 eilutė: Veiklos pradžios laikas */}
                  <div className="text-sm">
                    {activityStartTime ? (
                      <span className="text-green-600 font-medium">
                        Veikla pradėta: {formatDateTime(activityStartTime)}
                      </span>
                    ) : (
                      <span className="text-gray-400">Veikla pradėta: -</span>
                    )}
                  </div>
                  
                  {/* 2 eilutė: Veiklos pabaigos laikas (rezervuota) */}
                  <div className="text-sm">
                    {activityEndTime ? (
                      <span className="text-red-600 font-medium">
                        Veikla baigta: {formatDateTime(activityEndTime)}
                      </span>
                    ) : (
                      <span className="text-gray-400">Veikla baigta: -</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Veiklos valdymo mygtukai */}
                <button
                  onClick={handleStartActivity}
                  disabled={!lessonDetails || isActivityActive}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    lessonDetails && !isActivityActive
                      ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={lessonDetails ? (isActivityActive ? "Veikla jau pradėta" : "Pradėti veiklą") : "Pirmiausia pasirinkite pamoką"}
                >
                  <Play size={16} />
                  <span>Pradėti veiklą</span>
                </button>
                
                <button
                  onClick={handleEndActivity}
                  disabled={!lessonDetails || !isActivityActive}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    lessonDetails && isActivityActive
                      ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={lessonDetails ? (isActivityActive ? "Užbaigti veiklą" : "Pirmiausia pradėkite veiklą") : "Pirmiausia pasirinkite pamoką"}
                >
                  <Square size={16} />
                  <span>Užbaigti veiklą</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pasirinktos pamokos detalės */}
        <LessonDetailsPanel
          lessonDetails={lessonDetails}
          allLessonsDetails={allLessonsDetails}
          imuPlans={imuPlans}
          isLoading={lessonLoading}
          error={lessonError}
          isActivityActive={isActivityActive}
          activityStartTime={activityStartTime}
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
