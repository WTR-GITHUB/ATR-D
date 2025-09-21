// frontend/src/app/mentors/activities/components/WeeklyScheduleCalendar.tsx

// Savaitės tvarkaraščio komponentas - rodo mentoriaus pamokas pagal savaitę
// Naudoja duomenis iš GlobalSchedule, Period ir Classroom modelių
// CHANGE: Sukurtas naujas komponentas, integruotas su backend API, naudoja tikrus duomenis
// CHANGE: Pamokos detalių modalas atnaujintas - rodomi tik būtini laukai: pavadinimas, tema, dorybės, fokusai, pasiekimo lygiai, BUP kompetencijos
// CHANGE: Pašalinti console.log pranešimai, kurie rodo pamokų duomenis
// CHANGE: Atnaujinta spalvų sistema - naudojamos konstantos iš scheduleColors.ts vietoj hash-based spalvų
// CHANGE: Pašalintas lygio numeris iš dalyko pavadinimo - dabar rodomas tik švarus dalyko pavadinimas
// CHANGE: Pašalintas lygio pavadinimas (lesson.level.name) iš pamokos kortelės
// MOVE: Perkeltas iš /frontend/src/components/dashboard/ į /frontend/src/app/mentors/activities/components/

'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Clock, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import useWeeklySchedule from '@/hooks/useWeeklySchedule';
// import useSubjects from '@/hooks/useSubjects';
import usePeriods from '@/hooks/usePeriods';
import { useWeekInfoContext } from '@/contexts/WeekInfoContext';
// CHANGE: Pataisytas import'as - ScheduleItem importuojamas iš useSchedule hook'o
import { ScheduleItem } from '@/hooks/useSchedule';
// CHANGE: Pridėtas import'as spalvų konstantoms
import { getScheduleColors, getScheduleColorClasses, type ScheduleStatus } from '@/constants/scheduleColors';

interface WeeklyScheduleCalendarProps {
  className?: string;
  showHeader?: boolean; // Ar rodyti antraštę (kai naudojamas akordeone - false)
  onWeekChange?: (weekInfo: Record<string, unknown>) => void; // Callback savaitės informacijai perduoti į parent
  onScheduleItemSelect?: (item: ScheduleItem | null) => void; // Callback pamokos pasirinkimui
  selectedScheduleId?: number | null; // Pasirinktos pamokos ID
}

// Ref interface for exposing refetch function
export interface WeeklyScheduleCalendarRef {
  refetch: () => Promise<void>;
}

// Savaitės dienos (horizontal) - įskaitant savaitgalius
const weekDays = [
  { key: 'monday', name: 'Pirmadienis', short: 'Pir', weekday: 1 },
  { key: 'tuesday', name: 'Antradienis', short: 'Ant', weekday: 2 },
  { key: 'wednesday', name: 'Trečiadienis', short: 'Tre', weekday: 3 },
  { key: 'thursday', name: 'Ketvirtadienis', short: 'Ket', weekday: 4 },
  { key: 'friday', name: 'Penktadienis', short: 'Pen', weekday: 5 },
  { key: 'saturday', name: 'Šeštadienis', short: 'Šeš', weekday: 6 },
  { key: 'sunday', name: 'Sekmadienis', short: 'Sek', weekday: 0 }
];

// Pamokos kortelės komponentas
const LessonCard: React.FC<{ 
  lesson: ScheduleItem; 
  isSelected?: boolean;
  onClick?: () => void;
}> = ({ lesson, isSelected = false, onClick }) => {
  // CHANGE: Naudojamos spalvų konstantos iš scheduleColors.ts
  // Gauti pamokos statusą (pagal nutylėjimą 'planned' jei nėra statuso)
  // CHANGE: Pridėta logika IMUPlan tikrinimui - jei nėra IMUPlan duomenų, naudoti raudoną spalvą
  // Tikriname ar yra IMUPlan duomenų - naudojame has_imu_plan lauką iš API
  const hasImuPlan = lesson.has_imu_plan; // Tikriname ar yra IMUPlan duomenų
  const lessonStatus: ScheduleStatus = hasImuPlan ? (lesson.plan_status || 'planned') : 'no_imu_plan';
  const colorClasses = getScheduleColorClasses(lessonStatus);
  const colors = getScheduleColors(lessonStatus);
  
  // CHANGE: Pašaliname lygio numerį iš dalyko pavadinimo
  // Funkcija, kuri pašalina skaičių iš dalyko pavadinimo pabaigos
  const getCleanSubjectName = (subjectName: string): string => {
    // Pašaliname skaičių iš pavadinimo pabaigos (pvz., "Dalykas 4" -> "Dalykas")
    return subjectName.replace(/\s+\d+$/, '');
  };
  

  return (
    <div 
      className={`${colorClasses} rounded-lg p-3 shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4 w-full h-full flex flex-col justify-between relative ${
        isSelected ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
      }`}
      onClick={onClick}
    >
      {/* Geltonas ženkliukas jei pasirinkta */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          ✓
        </div>
      )}
      
      <div className="space-y-1">
        {/* Dalyko pavadinimas */}
        <div>
          <h3 className={`font-semibold text-sm leading-tight ${colors.text}`}>{getCleanSubjectName(lesson.subject.name)}</h3>
        </div>
      </div>
      
      {/* Papildoma informacija apačioje */}
      <div className={`flex items-center justify-between text-xs opacity-80 mt-2 ${colors.text}`}>
        <div className="flex items-center space-x-1">
          <MapPin size={10} />
          <span>{lesson.classroom.name}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Users size={10} />
          <span className="text-xs">{lesson.level.name.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );
};

const WeeklyScheduleCalendar = forwardRef<WeeklyScheduleCalendarRef, WeeklyScheduleCalendarProps>(({ 
  className = '', 
  showHeader = true,
  onWeekChange,
  onScheduleItemSelect,
  selectedScheduleId
}, ref) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  // Pašalinta vietinė selectedLesson būsena - naudojame props
  
  // API hooks duomenų gavimui
  // useSubjects();
  const { periods } = usePeriods();
  // Pašalinta lessonDetails logika - naudojama activities puslapyje
  
  // Savaitės informacija - use context if available
  const contextWeekInfo = useWeekInfoContext();
  const weekInfo = contextWeekInfo.weekInfo;
  
  const weekDates = weekInfo.weekDates;
  
  // Memoize date formatting to prevent hydration mismatches
  const formattedWeekDates = useMemo(() => {
    return weekDates.map(date => ({
      day: date.getDate().toString().padStart(2, '0'),
      month: (date.getMonth() + 1).toString().padStart(2, '0')
    }));
  }, [weekDates]);
  
  // Perduodame savaitės informaciją į parent komponentą
  useEffect(() => {
    if (onWeekChange) {
      onWeekChange({
        ...weekInfo,
        navigateWeek: contextWeekInfo.navigateWeek,
        goToToday: contextWeekInfo.goToToday
      });
    }
  }, [weekInfo, onWeekChange, contextWeekInfo.navigateWeek, contextWeekInfo.goToToday]);
  
  // Gauname savaitės tvarkaraščio duomenis
  const mondayDate = weekDates[0].toISOString().split('T')[0];
  
  const { scheduleItems: allScheduleItems, isLoading, error, refetch } = useWeeklySchedule({
    weekStartDate: mondayDate,
    enabled: true
  });

  // Expose refetch function to parent component via ref
  useImperativeHandle(ref, () => ({
    refetch
  }), [refetch]);
  
  

  // Gauti pamokos objektą pagal dieną ir laiką
  const getLessonForSlot = (date: Date, periodId: number): ScheduleItem | null => {
    const dateStr = date.toISOString().split('T')[0];
    const foundItem = allScheduleItems.find(item => 
      item.date === dateStr && item.period.id === periodId
    );
    
    
    return foundItem || null;
  };

  // Pašalintos funkcijos - naudojamas useWeekInfo hook

  const navigateWeek = (direction: number) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Savaitės informacija iš hook'o

  // Statistikos skaičiavimas pašalintas - nebereikalingas

  if (isLoading && allScheduleItems.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-500">Kraunamas tvarkaraštis...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-600 mb-4">⚠️ Klaida kraunant tvarkaraštį</div>
              <div className="text-gray-600 text-sm">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Antraštė su savaitės navigacija - rodoma tik jei showHeader = true */}
      {showHeader && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Savaitės tvarkaraštis</h2>
              <p className="text-gray-600 mt-1">
                {weekInfo.dateRangeText}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${weekInfo.statusColor}`}>
                  {weekInfo.statusText}
                </span>
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              
              <button
                onClick={() => setCurrentWeek(new Date())}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Dabar
              </button>
              
              <button
                onClick={() => navigateWeek(1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kalendoriaus tinklelis */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(7, 1fr)', gap: '8px', gridTemplateRows: `60px repeat(${periods.length}, auto)` }}>
            {/* Antraštės eilutė */}
            {/* Laiko stulpelio antraštė */}
            <div className="flex items-center justify-center">
              <h3 className="text-sm font-semibold text-gray-600">Laikas</h3>
            </div>
            
            {/* Dienų antraštės */}
            {weekDays.map((day, dayIndex) => (
              <div key={`header-${day.key}`} className={`flex flex-col items-center justify-center rounded-lg border-2 ${
                isToday(weekDates[dayIndex]) 
                  ? 'bg-blue-500 text-white border-blue-600' 
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}>
                <span className="text-sm font-semibold">{day.short}</span>
                <span className="text-xs opacity-80">
                  {formattedWeekDates[dayIndex]?.day}-{formattedWeekDates[dayIndex]?.month}
                </span>
              </div>
            ))}

            {/* Pamokų eilutės */}
            {periods.map((period) => (
              <React.Fragment key={`row-${period.id}`}>
                {/* Laiko stulpelis */}
                <div className="flex items-center justify-center bg-gray-50 rounded-lg border min-h-20">
                  <div className="text-center">
                    <div className="flex items-center justify-center text-gray-600 mb-1">
                      <Clock size={14} className="mr-1" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {period.starttime}-{period.endtime}
                    </span>
                    {period.name && (
                      <div className="text-xs text-gray-500 mt-1">
                        {period.name}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Dienų pamokos */}
                {weekDays.map((day, dayIndex) => {
                  const lesson = getLessonForSlot(weekDates[dayIndex], period.id);
                  
                  return (
                    <div key={`${day.key}-${period.id}`} className="min-h-20 flex">
                      {lesson ? (
                        <LessonCard 
                          lesson={lesson} 
                          isSelected={selectedScheduleId === lesson.id}
                          onClick={() => {
                            const newSelection = selectedScheduleId === lesson.id ? null : lesson;
                            // Perduoti pasirinkimą į parent komponentą
                            onScheduleItemSelect?.(newSelection);
                          }}
                        />
                      ) : (
                        <div className="w-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-400">Laisva</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Pašalinta pasirinktos pamokos informacijos kortelė - naudojama activities puslapyje */}
    </div>
  );
});

// Add display name for debugging
WeeklyScheduleCalendar.displayName = 'WeeklyScheduleCalendar';

export default WeeklyScheduleCalendar;
