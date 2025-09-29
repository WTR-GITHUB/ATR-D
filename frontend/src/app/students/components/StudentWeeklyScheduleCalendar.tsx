// /home/master/DIENYNAS/frontend/src/app/students/components/StudentWeeklyScheduleCalendar.tsx

// Studento savaitės tvarkaraščio komponentas - rodo studento pamokas pagal savaitę
// CHANGE: Atnaujintas naudoti useStudentWeeklySchedule hook'ą vietoj useWeeklySchedule
// PURPOSE: Rodo tik studento pamokas pagal jo subject levels, ne visų mentorių pamokas
// CHANGE: Naudojamos dalykų spalvų konstantos iš subjectColors.ts
// CHANGE: Kortelės stilius keičiasi pagal pamokos statusą (planned/in_progress/completed)
// FIX: Pataisyta user loading logika - dabar laukia kol user bus užkrautas prieš kviečiant API

'use client';

import React, { useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Clock, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import useStudentWeeklySchedule from '@/hooks/useStudentWeeklySchedule';
// import useSubjects from '@/hooks/useSubjects';
import usePeriods from '@/hooks/usePeriods';
import { useWeekInfoContext } from '@/contexts/WeekInfoContext';
import { useAuth } from '@/hooks/useAuth';
// CHANGE: Pataisytas import'as - ScheduleItem importuojamas iš useSchedule hook'o
import { ScheduleItem } from '@/hooks/useSchedule';
// CHANGE: Pridėtas import'as studentų spalvų konstantoms
import { type StudentScheduleStatus } from '@/constants/scheduleStudentColors';
// CHANGE: Pridėtas import'as dalykų spalvų konstantoms
// CHANGE: getSubjectColors import pašalintas - naudojame tik inline styles

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
  // CHANGE: Nauja logika - naudojame dalykų spalvas ir statusą pagal plan_status
  // CHANGE: Naudojame plan_status tiesiogiai, nepriklausomai nuo IMUPlan
  const lessonStatus: StudentScheduleStatus = lesson.plan_status || 'no_imu_plan';
  
  // CHANGE: Naudojame tik inline styles, nereikia subjectColors
  
  // CHANGE: Pašaliname lygio numerį iš dalyko pavadinimo
  // Funkcija, kuri pašalina skaičių iš dalyko pavadinimo pabaigos
  const getCleanSubjectName = (subjectName: string): string => {
    // Pašaliname skaičių iš pavadinimo pabaigos (pvz., "Dalykas 4" -> "Dalykas")
    return subjectName.replace(/\s+\d+$/, '');
  };

  // CHANGE: Funkcija su inline styles vietoj Tailwind klasių
  const getBorderLeftStyle = (hexColor: string): React.CSSProperties => {
    // Naudojame inline styles - garantuotai veiks
    return {
      borderLeft: `4px solid ${hexColor}`
    };
  };
  
  // CHANGE: Nauja logika kortelės stiliui pagal statusą - VISADA naudojame dalykų spalvas
  const getCardStyles = () => {
    switch (lessonStatus) {
      case 'planned':
        // planned: balta kortelė su dalyko spalvos krašteliu
        return {
          background: 'bg-white',
          border: 'border-transparent',
          text: 'text-gray-900',
          borderLeftStyle: getBorderLeftStyle(lesson.subject.color)
        };
      case 'in_progress':
        // in_progress: visa kortelė nudažyta dalyko spalva
        return {
          background: 'bg-transparent', // Naudojame inline styles
          border: 'border-transparent',
          text: 'text-white', // Balta tekstas ant spalvoto fono
          borderLeftStyle: getBorderLeftStyle(lesson.subject.color),
          backgroundColor: lesson.subject.color // Inline style spalvam fonui
        };
      case 'completed':
        // completed: dalyko spalvos kraštelis + pilkas fonas
        return {
          background: 'bg-gray-200',
          border: 'border-transparent',
          text: 'text-gray-700',
          borderLeftStyle: getBorderLeftStyle(lesson.subject.color)
        };
      case 'no_imu_plan':
        // CHANGE: no_imu_plan: balta kortelė su dalyko spalvos krašteliu (ne studentų spalvos)
        return {
          background: 'bg-white',
          border: 'border-transparent',
          text: 'text-gray-900',
          borderLeftStyle: getBorderLeftStyle(lesson.subject.color)
        };
      default:
        return {
          background: 'bg-white',
          border: 'border-transparent',
          text: 'text-gray-900',
          borderLeftStyle: getBorderLeftStyle(lesson.subject.color)
        };
    }
  };
  
  const cardStyles = getCardStyles();

  return (
    <div 
      className={`${cardStyles.background} ${cardStyles.border} rounded-lg p-3 shadow-md hover:shadow-lg transition-all cursor-pointer w-full h-full flex flex-col justify-between relative ${
        isSelected ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
      }`}
      style={{
        ...cardStyles.borderLeftStyle,
        backgroundColor: cardStyles.backgroundColor
      }}
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
          <h3 className={`font-semibold text-sm leading-tight ${cardStyles.text}`}>{getCleanSubjectName(lesson.subject.name)}</h3>
        </div>
      </div>
      
      {/* Papildoma informacija apačioje */}
      <div className={`flex items-center justify-between text-xs opacity-80 mt-2 ${cardStyles.text}`}>
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

const StudentWeeklyScheduleCalendar = forwardRef<WeeklyScheduleCalendarRef, WeeklyScheduleCalendarProps>(({ 
  className = '', 
  showHeader = true,
  onWeekChange,
  onScheduleItemSelect,
  selectedScheduleId
}, ref) => {
  // CHANGE: Pašalinta vietinė currentWeek būsena - naudojame tik WeekInfoContext
  // Pašalinta vietinė selectedLesson būsena - naudojame props
  
  // API hooks duomenų gavimui
  // useSubjects();
  const { periods } = usePeriods();
  const { user, isLoading: userLoading } = useAuth(); // FIX: Gauname user loading state
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
  
  // Gauname studento savaitės tvarkaraščio duomenis
  const mondayDate = weekDates[0].toISOString().split('T')[0];
  
  // CHANGE: Naudojame useStudentWeeklySchedule vietoj useWeeklySchedule
  // FIX: Laukiame kol user bus užkrautas prieš kviečiant API
  const { scheduleItems: allScheduleItems, isLoading, error, refetch, studentInfo } = useStudentWeeklySchedule({
    studentId: user?.id || 0,
    weekStartDate: mondayDate,
    enabled: !!(user?.id) // FIX: Tik jei user.id egzistuoja
  });

  // Expose refetch function to parent component via ref
  useImperativeHandle(ref, () => ({
    refetch
  }), [refetch]);
  
  

  // CHANGE: Gauti VISAS pamokas pagal dieną ir laiką (konfliktuojančios pamokos)
  const getLessonsForSlot = (date: Date, periodId: number): ScheduleItem[] => {
    const dateStr = date.toISOString().split('T')[0];
    const foundItems = allScheduleItems.filter(item => 
      item.date === dateStr && item.period.id === periodId
    );
    
    return foundItems;
  };

  // CHANGE: Pašalintos vietinės navigacijos funkcijos - naudojame tik konteksto funkcijas

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Savaitės informacija iš hook'o

  // Statistikos skaičiavimas pašalintas - nebereikalingas

  // FIX: Rodyti loading jei user kraunasi ARBA schedule kraunasi
  if ((userLoading || (isLoading && allScheduleItems.length === 0))) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-500">
                {userLoading ? 'Kraunami vartotojo duomenys...' : 'Kraunamas tvarkaraštis...'}
              </div>
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
              <h2 className="text-xl font-bold text-gray-900">Mano savaitės tvarkaraštis</h2>
              <p className="text-gray-600 mt-1">
                {weekInfo.dateRangeText}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${weekInfo.statusColor}`}>
                  {weekInfo.statusText}
                </span>
              </p>
              {/* CHANGE: Pridėta studento informacija */}
              {studentInfo && (
                <div className="mt-2 text-sm text-gray-500">
                  <span className="font-medium">{studentInfo.student_name}</span>
                  <span className="mx-2">•</span>
                  <span>{studentInfo.count} pamokų</span>
                  {studentInfo.student_subject_levels && studentInfo.student_subject_levels.length > 0 && (
                    <span className="mx-2">•</span>
                  )}
                  {studentInfo.student_subject_levels && studentInfo.student_subject_levels.length > 0 && (
                    <span className="text-xs">
                      {studentInfo.student_subject_levels.map(sl => `${sl.subject} (${sl.level})`).join(', ')}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* CHANGE: Naudojame konteksto navigacijos funkcijas vietoj vietinių */}
              <button
                onClick={() => contextWeekInfo.navigateWeek(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              
              <button
                onClick={() => contextWeekInfo.goToToday()}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Dabar
              </button>
              
              <button
                onClick={() => contextWeekInfo.navigateWeek(1)}
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
                  const lessons = getLessonsForSlot(weekDates[dayIndex], period.id);
                  
                  return (
                    <div key={`${day.key}-${period.id}`} className="min-h-20 flex flex-col">
                      {lessons.length > 0 ? (
                        lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className={`flex-1 ${lessonIndex > 0 ? 'mt-1' : ''}`}>
                            <LessonCard 
                              lesson={lesson} 
                              isSelected={selectedScheduleId === lesson.id}
                              onClick={() => {
                                const newSelection = selectedScheduleId === lesson.id ? null : lesson;
                                // Perduoti pasirinkimą į parent komponentą
                                onScheduleItemSelect?.(newSelection);
                              }}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="w-full h-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
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
StudentWeeklyScheduleCalendar.displayName = 'StudentWeeklyScheduleCalendar';

export default StudentWeeklyScheduleCalendar;
