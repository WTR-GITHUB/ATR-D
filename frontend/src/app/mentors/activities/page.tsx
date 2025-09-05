// frontend/src/app/mentors/activities/page.tsx

// Veiklos puslapis - pamokų peržiūra ir detalės
// Šis puslapis skirtas mentoriams vykdyti pamokas ir peržiūrėti pamokų detales
// Rodo tvarkaraštį ir pasirinktos pamokos informaciją su mokinių sąrašu
// CHANGE: Pašalintas StudentsList komponentas - mokiniai rodomi tik LessonInfoCard viduje
// CHANGE: Pridėta veiklos statuso kortelė su mygtukais "Pradėti veiklą" ir "Užbaigti veiklą"
// CHANGE: Pridėtas veiklos laiko rodymas viduryje su 2 eilučių rezervacija
// REFAKTORINIMAS: Atnaujinta veiklos valdymo logika - naudojama GlobalSchedule plan_status vietoj IMUPlan

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
    globalSchedule, // CHANGE: Pridėtas globalSchedule
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
  const [isActivityCompleted, setIsActivityCompleted] = useState(false); // CHANGE: Pridėtas naujas state veiklos užbaigimo būsenai

  // Veiklos pradžios funkcija
  const handleStartActivity = async () => {
    if (!globalScheduleId) return;
    
    try {
      // CHANGE: Pridėtas JWT autentifikacijos header'is
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error('Nėra autentifikacijos token\'o');
        return;
      }

      const response = await fetch(`/api/schedule/schedules/${globalScheduleId}/start_activity/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Veikla pradėta:', result);
        
        // CHANGE: Nustatome veiklos pradžios laiką iš backend'o atsakymo
        if (result.started_at) {
          setActivityStartTime(new Date(result.started_at));
        }
        setIsActivityActive(true);
        setIsActivityCompleted(false); // CHANGE: Nustatome, kad veikla nebaigta
        
        // CHANGE: Atnaujinti mokinių duomenis, kad matytų naują lankomumo statusą
        refreshLessonData();
      } else {
        console.error('Klaida pradedant veiklą:', response.statusText);
      }
    } catch (error) {
      console.error('Klaida pradedant veiklą:', error);
    }
  };

  // Veiklos pabaigos funkcija
  const handleEndActivity = async () => {
    if (!globalScheduleId) return;
    
    try {
      // CHANGE: Pridėtas JWT autentifikacijos header'is
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error('Nėra autentifikacijos token\'o');
        return;
      }

      const response = await fetch(`/api/schedule/schedules/${globalScheduleId}/end_activity/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Veikla baigta:', result);
        
        // CHANGE: Nustatome veiklos pabaigos laiką iš backend'o atsakymo
        if (result.completed_at) {
          setActivityEndTime(new Date(result.completed_at));
        }
        setIsActivityActive(false);
        setIsActivityCompleted(true); // CHANGE: Nustatome, kad veikla užbaigta
        
        // CHANGE: Atnaujinti mokinių duomenis
        refreshLessonData();
      } else {
        console.error('Klaida baigiant veiklą:', response.statusText);
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

  // CHANGE: Nustatyti veiklos būseną pagal backend'o duomenis
  React.useEffect(() => {
    const fetchGlobalScheduleData = async () => {
      if (!globalScheduleId) return;
      
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) return;

        const response = await fetch(`/api/schedule/schedules/${globalScheduleId}/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.ok) {
          const scheduleData = await response.json();
          
          if (scheduleData.plan_status === 'in_progress') {
            setIsActivityActive(true);
            setIsActivityCompleted(false); // CHANGE: Veikla vyksta, todėl nebaigta
            if (scheduleData.started_at) {
              setActivityStartTime(new Date(scheduleData.started_at));
            }
            setActivityEndTime(null);
          } else if (scheduleData.plan_status === 'completed') {
            setIsActivityActive(false);
            setIsActivityCompleted(true); // CHANGE: Veikla užbaigta
            if (scheduleData.started_at) {
              setActivityStartTime(new Date(scheduleData.started_at));
            }
            if (scheduleData.completed_at) {
              setActivityEndTime(new Date(scheduleData.completed_at));
            }
          } else {
            // 'planned' status
            setIsActivityActive(false);
            setIsActivityCompleted(false); // CHANGE: Veikla planuojama, todėl nebaigta
            setActivityStartTime(null);
            setActivityEndTime(null);
          }
        }
      } catch (error) {
        console.error('Klaida gaunant GlobalSchedule duomenis:', error);
      }
    };

    fetchGlobalScheduleData();
  }, [globalScheduleId]);

  // CHANGE: Automatiškai atnaujinti duomenis po puslapio perkrovimo
  React.useEffect(() => {
    if (globalScheduleId) {
      refreshLessonData();
    }
  }, [globalScheduleId, refreshLessonData]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Antraštė */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Veiklos</h1>
          <p className="text-gray-600">
            Pamokų vykdymas ir mokinių lankomumo žymėjimas realiu laiku
          </p>
        </div>

        {/* Savaitės tvarkaraščio akordeonas */}
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
                {/* DEBUG: Akordeono būsena */}
                <p className="text-xs text-gray-400">
                  DEBUG: Akordeonas {isScheduleExpanded ? 'IŠSKLEISTAS' : 'SUSKLEISTAS'}
                </p>
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
                onClick={() => {
                  console.log('🔍 AKORDEONO MYGTUKAS:');
                  console.log('   📊 Dabartinė būsena:', isScheduleExpanded ? 'IŠSKLEISTAS' : 'SUSKLEISTAS');
                  console.log('   🔄 Keičiame į:', !isScheduleExpanded ? 'IŠSKLEISTAS' : 'SUSKLEISTAS');
                  setIsScheduleExpanded(!isScheduleExpanded);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                title={isScheduleExpanded ? "Suskleisti tvarkaraštį" : "Išskleisti tvarkaraštį"}
              >
                {isScheduleExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>
          
          {isScheduleExpanded && (
            <div className="border-t border-gray-200">
              {console.log('🔍 RENDERINAME WEEKLY SCHEDULE CALENDAR:')}
              {console.log('   📊 GlobalScheduleId:', globalScheduleId)}
              {console.log('   📊 WeekInfo:', weekInfo)}
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
                  disabled={!lessonDetails || isActivityActive || isActivityCompleted} // CHANGE: Pridėtas isActivityCompleted
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    lessonDetails && !isActivityActive && !isActivityCompleted // CHANGE: Pridėtas !isActivityCompleted
                      ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={lessonDetails ? (isActivityActive ? "Veikla jau pradėta" : isActivityCompleted ? "Veikla užbaigta" : "Pradėti veiklą") : "Pirmiausia pasirinkite pamoką"} // CHANGE: Pridėtas isActivityCompleted patikrinimas
                >
                  <Play size={16} />
                  <span>Pradėti veiklą</span>
                </button>
                
                <button
                  onClick={handleEndActivity}
                  disabled={!lessonDetails || !isActivityActive || isActivityCompleted} // CHANGE: Pridėtas isActivityCompleted
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    lessonDetails && isActivityActive && !isActivityCompleted // CHANGE: Pridėtas !isActivityCompleted
                      ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={lessonDetails ? (isActivityActive && !isActivityCompleted ? "Užbaigti veiklą" : isActivityCompleted ? "Veikla jau užbaigta" : "Pirmiausia pradėkite veiklą") : "Pirmiausia pasirinkite pamoką"} // CHANGE: Pridėtas isActivityCompleted patikrinimas
                >
                  <Square size={16} />
                  <span>Užbaigti veiklą</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pasirinktos pamokos informacija */}
        {globalScheduleId && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pasirinkta pamoka</h2>
            
            {lessonLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Kraunama...</p>
              </div>
            ) : lessonError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Klaida: {lessonError}</p>
              </div>
            ) : lessonDetails ? (
              <div className="space-y-6">
                {/* Pamokos detalės */}
                <LessonDetailsPanel
                  lessonDetails={lessonDetails}
                  allLessonsDetails={allLessonsDetails}
                  imuPlans={imuPlans}
                  isLoading={lessonLoading}
                  error={lessonError}
                  subjectId={globalSchedule?.subject?.id} // CHANGE: Pridėtas subject ID iš GlobalSchedule
                  globalScheduleId={globalScheduleId} // CHANGE: Pridėtas globalScheduleId
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Pasirinkite pamoką iš tvarkaraščio</p>
              </div>
            )}
          </div>
        )}

        {/* Mokinių sąrašas */}
        {globalScheduleId && lessonDetails && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mokinių sąrašas</h2>
            <p className="text-gray-600 mb-4">
              Pasirinkite pamoką iš viršuje esančio sąrašo, kad pamatytumėte mokinių informaciją
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VeiklosPage;
