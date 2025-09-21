// /frontend/src/app/mentors/activities/VeiklosPageClient.tsx

// Client component for Veiklos (Activities) page
// Handles all client-side interactivity while using server-side week data
// CHANGE: Extracted client logic from page.tsx to separate component

'use client';

import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import WeeklyScheduleCalendar, { WeeklyScheduleCalendarRef } from './components/WeeklyScheduleCalendar';
import SelectedActivityCard from './components/SelectedActivityCard';
import { useWeekInfoContext } from '@/contexts/WeekInfoContext';
import useSelectedLesson from '@/hooks/useSelectedLesson';
import api from '@/lib/api';

// Client-side Veiklos page component
// Handles all interactive functionality
const VeiklosPageClient = () => {
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(true); // CHANGE: Default išskleistas
  
  // Ref for calendar component to access refetch function
  const calendarRef = useRef<WeeklyScheduleCalendarRef>(null);
  
  // Use WeekInfo context instead of hook
  const { weekInfo: displayWeekInfo, navigateWeek, goToToday, isLoading: weekLoading } = useWeekInfoContext();

  // Pasirinktos pamokos valdymas
  const {
    globalScheduleId,
    lessonDetails,
    imuPlans,
    selectScheduleItem,
    refreshLessonData
  } = useSelectedLesson();


  // Veiklos laiko valdymas
  const [activityStartTime, setActivityStartTime] = useState<Date | null>(null);
  const [activityEndTime, setActivityEndTime] = useState<Date | null>(null);
  const [isActivityActive, setIsActivityActive] = useState(false);
  const [isActivityCompleted, setIsActivityCompleted] = useState(false);
  
  // CHANGE: Pridėtas planStatus state realaus laiko atnaujinimui
  const [planStatus, setPlanStatus] = useState<'planned' | 'in_progress' | 'completed'>('planned');

  // Helper function to refresh calendar data
  const refreshCalendar = async () => {
    if (calendarRef.current) {
      try {
        // Small delay to ensure backend has processed the changes
        await new Promise(resolve => setTimeout(resolve, 500));
        await calendarRef.current.refetch();
      } catch (error) {
        console.error('❌ Error refreshing calendar data:', error);
      }
    }
  };

  // Veiklos pradžios funkcija
  const handleStartActivity = async () => {
    if (!globalScheduleId) return;
    
    try {
      if (!api || typeof api.post !== 'function') {
        console.error('API client is not available');
        return;
      }

      const response = await api.post(`/schedule/schedules/${globalScheduleId}/start_activity/`);
      
      const result = response.data;
      
      if (result.started_at) {
        setActivityStartTime(new Date(result.started_at));
      }
      setIsActivityActive(true);
      setIsActivityCompleted(false);
      setPlanStatus('in_progress'); // CHANGE: Atnaujinti planStatus į 'in_progress'
      
      refreshLessonData();
      await refreshCalendar(); // CHANGE: Atnaujinti kalendorių
    } catch (error) {
      console.error('Klaida pradedant veiklą:', error);
    }
  };

  // Veiklos pabaigos funkcija
  const handleEndActivity = async () => {
    if (!globalScheduleId) return;
    
    try {
      if (!api || typeof api.post !== 'function') {
        console.error('API client is not available');
        return;
      }

      const response = await api.post(`/schedule/schedules/${globalScheduleId}/end_activity/`);
      
      // Nustatyti veiklos pabaigos laiką
      if (response.data.ended_at) {
        setActivityEndTime(new Date(response.data.ended_at));
      } else {
        setActivityEndTime(new Date()); // Jei backend negrąžina laiko, naudoti dabartinį laiką
      }
      
      setIsActivityActive(false);
      setIsActivityCompleted(true);
      setPlanStatus('completed'); // CHANGE: Atnaujinti planStatus į 'completed'
      
      refreshLessonData();
      await refreshCalendar(); // CHANGE: Atnaujinti kalendorių
    } catch (error) {
      console.error('Klaida baigiant veiklą:', error);
    }
  };

  // Veiklos atšaukimas
  const handleCancelActivity = async () => {
    if (!globalScheduleId) return;
    
    try {
      if (!api || typeof api.post !== 'function') {
        console.error('API client is not available');
        return;
      }

      await api.post(`/schedule/schedules/${globalScheduleId}/cancel_activity/`);
      
      setIsActivityActive(false);
      setIsActivityCompleted(false);
      setActivityStartTime(null);
      setActivityEndTime(null); // CHANGE: Išvalyti pabaigos laiką atšaukus veiklą
      setPlanStatus('planned'); // CHANGE: Atnaujinti planStatus į 'planned'
      
      refreshLessonData();
      await refreshCalendar(); // CHANGE: Atnaujinti kalendorių
    } catch (error) {
      console.error('Klaida atšaukant veiklą:', error);
    }
  };

  // Formatavimo funkcija laikui - naudojame lokalės konfigūraciją
  // formatDateTime importuojamas iš localeConfig

  // Nustatyti veiklos būseną pagal backend'o duomenis
  React.useEffect(() => {
    const fetchGlobalScheduleData = async () => {
      if (!globalScheduleId) return;
      
      try {
        if (!api || typeof api.get !== 'function') {
          console.error('API client is not available');
          return;
        }

        const response = await api.get(`/schedule/schedules/${globalScheduleId}/`);

        const scheduleData = response.data;
        
        if (scheduleData.plan_status === 'in_progress') {
          setIsActivityActive(true);
          setIsActivityCompleted(false);
          setPlanStatus('in_progress'); // CHANGE: Atnaujinti planStatus
          if (scheduleData.started_at) {
            setActivityStartTime(new Date(scheduleData.started_at));
          }
        } else if (scheduleData.plan_status === 'completed') {
          setIsActivityActive(false);
          setIsActivityCompleted(true);
          setPlanStatus('completed'); // CHANGE: Atnaujinti planStatus
          if (scheduleData.started_at) {
            setActivityStartTime(new Date(scheduleData.started_at));
          }
          if (scheduleData.ended_at) {
            setActivityEndTime(new Date(scheduleData.ended_at));
          }
        } else {
          setIsActivityActive(false);
          setIsActivityCompleted(false);
          setPlanStatus('planned'); // CHANGE: Atnaujinti planStatus
          setActivityStartTime(null);
          setActivityEndTime(null); // CHANGE: Išvalyti pabaigos laiką
        }
      } catch (error) {
        console.error('Klaida gaunant GlobalSchedule duomenis:', error);
      }
    };

    fetchGlobalScheduleData();
  }, [globalScheduleId]);

  // Automatiškai atnaujinti duomenis po puslapio perkrovimo
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
          <div 
            className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => setIsScheduleExpanded(!isScheduleExpanded)}
            title={isScheduleExpanded ? "Suskleisti tvarkaraštį" : "Išskleisti tvarkaraštį"}
          >
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
                    onClick={(e) => {
                      e.stopPropagation(); // Sustabdyti event bubbling
                      navigateWeek(-1);
                    }}
                    disabled={weekLoading}
                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                    title="Ankstesnė savaitė"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Sustabdyti event bubbling
                      goToToday();
                    }}
                    disabled={weekLoading}
                    className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                    title="Eiti į šiandienos savaitę"
                  >
                    Dabar
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Sustabdyti event bubbling
                      navigateWeek(1);
                    }}
                    disabled={weekLoading}
                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                    title="Kita savaitė"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Sustabdyti event bubbling
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
              <WeeklyScheduleCalendar 
                ref={calendarRef}
                className="border-0 shadow-none" 
                showHeader={false}
                onScheduleItemSelect={selectScheduleItem}
                selectedScheduleId={globalScheduleId}
              />
            </div>
          )}
        </div>

        {/* Pasirinktos veiklos kortelė - naudojame SelectedActivityCard komponentą */}
        {lessonDetails && (
          <SelectedActivityCard
            globalScheduleId={globalScheduleId}
            activityInfo={{
              subject_name: lessonDetails.subject_name,
              level_name: Array.isArray(lessonDetails.levels_names) ? lessonDetails.levels_names[0] || null : null
            }}
            uniqueLessons={imuPlans ? imuPlans.map(plan => ({
              lessonDetails: lessonDetails,
              students: [plan]
            })) : []}
            activityStartTime={activityStartTime}
            activityEndTime={activityEndTime}
            isActivityActive={isActivityActive}
            isActivityCompleted={isActivityCompleted}
            planStatus={planStatus} // CHANGE: Naudojame local planStatus state'ą
            onStartActivity={handleStartActivity}
            onEndActivity={handleEndActivity}
            onCancelActivity={handleCancelActivity}
          />
        )}
      </div>
    </div>
  );
};

export default VeiklosPageClient;
