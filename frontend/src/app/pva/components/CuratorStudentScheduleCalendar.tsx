// /home/master/DIENYNAS/frontend/src/app/pva/components/CuratorStudentScheduleCalendar.tsx

// CuratorStudentScheduleCalendar komponentas - curator tvarkaraščio kalendorius
// Rodo konkretaus studento tvarkaraštį pagal perduotą studentId
// CHANGE: Sukurtas pagal StudentsDashboardClient akordeon logiką
// CHANGE: Naudoja useStudentSchedule hook'ą vietoj useStudentWeeklySchedule
// CHANGE: Pritaišytas curator kontekstui su studentId parametru

'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useWeekInfoContext } from '@/contexts/WeekInfoContext';
import { useStudentSchedule } from '@/hooks/useStudentSchedule';
import usePeriods from '@/hooks/usePeriods';
import { getSubjectColors } from '@/constants/subjectColors';

interface CuratorStudentScheduleCalendarProps {
  studentId: number;
  className?: string;
  onScheduleItemSelect?: (scheduleId: number | null) => void;
  selectedScheduleId?: number;
}

// Ref interface for exposing refetch function
export interface CuratorStudentScheduleCalendarRef {
  refetch: () => Promise<void>;
}

const CuratorStudentScheduleCalendar = React.forwardRef<CuratorStudentScheduleCalendarRef, CuratorStudentScheduleCalendarProps>(({ 
  studentId, 
  className = '',
  onScheduleItemSelect,
  selectedScheduleId
}, ref) => {
  const { weekInfo, navigateWeek, goToToday, isLoading } = useWeekInfoContext();
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(true);
  
  // Gauname studento tvarkaraščio duomenis pagal studentId
  const mondayDate = weekInfo.weekDates[0].toISOString().split('T')[0];
  const { scheduleItems, isLoading: scheduleLoading, error: scheduleError, studentName } = useStudentSchedule({
    studentId,
    weekStartDate: mondayDate,
    enabled: true
  });

  // Expose refetch function to parent component via ref
  React.useImperativeHandle(ref, () => ({
    refetch: async () => {
      // Re-fetch data by updating the weekStartDate
      // This will trigger the useStudentSchedule hook to refetch
      window.location.reload(); // Simple solution for now
    }
  }), []);

  // Pamokos kortelės komponentas - pritaikytas StudentScheduleItem duomenims su spalvomis
  const LessonCard: React.FC<{ 
    lesson: {
      id: number;
      lesson_subject: string;
      lesson_title: string;
      global_schedule_classroom: string;
      global_schedule_level: string;
    }; 
    isSelected?: boolean;
    onClick?: () => void;
  }> = ({ lesson, isSelected = false, onClick }) => {
    // CHANGE: Gauname dalyko spalvas pagal dalyko pavadinimą
    const subjectColors = getSubjectColors(lesson.lesson_subject || 'Matematika');
    
    // CHANGE: Funkcija su inline styles vietoj Tailwind klasių
    const getBorderLeftStyle = (hexColor: string): React.CSSProperties => {
      return {
        borderLeft: `4px solid ${hexColor}`
      };
    };
    
    // CHANGE: Kortelės stilius pagal dalyko spalvas
    const getCardStyles = () => {
      return {
        background: 'bg-white',
        border: 'border-transparent',
        text: 'text-gray-900',
        borderLeftStyle: getBorderLeftStyle(subjectColors.hex.background)
      };
    };
    
    const cardStyles = getCardStyles();

    return (
      <div 
        className={`${cardStyles.background} ${cardStyles.border} rounded-lg p-3 shadow-md hover:shadow-lg transition-all cursor-pointer w-full h-full flex flex-col justify-between relative ${
          isSelected ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
        }`}
        style={cardStyles.borderLeftStyle}
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
            <h3 className={`font-semibold text-sm leading-tight ${cardStyles.text}`}>
              {lesson.lesson_subject || 'Nepriskirtas dalykas'}
            </h3>
            <p className="text-xs text-gray-600">{lesson.lesson_title}</p>
          </div>
        </div>
        
        {/* Papildoma informacija apačioje */}
        <div className={`flex items-center justify-between text-xs opacity-80 mt-2 ${cardStyles.text}`}>
          <div className="flex items-center space-x-1">
            <span>{lesson.global_schedule_classroom || '-'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>{lesson.global_schedule_level || '-'}</span>
          </div>
        </div>
      </div>
    );
  };

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

  const { periods } = usePeriods();

  // Memoize date formatting to prevent hydration mismatches
  const formattedWeekDates = React.useMemo(() => {
    return weekInfo.weekDates.map(date => ({
      day: date.getDate().toString().padStart(2, '0'),
      month: (date.getMonth() + 1).toString().padStart(2, '0')
    }));
  }, [weekInfo.weekDates]);

  // Gauti pamokas pagal dieną ir laiką
  const getLessonsForSlot = (date: Date, periodId: number) => {
    const dateStr = date.toISOString().split('T')[0];
    const foundItems = scheduleItems.filter(item => 
      item.global_schedule_date === dateStr && 
      item.global_schedule_period_name === periods.find(p => p.id === periodId)?.name
    );
    
    return foundItems;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (scheduleLoading && scheduleItems.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
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

  if (scheduleError) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-600 mb-4">⚠️ Klaida kraunant tvarkaraštį</div>
              <div className="text-gray-600 text-sm">{scheduleError}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Antraštė su savaitės navigacija - akordeon stilius */}
      <div
        className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setIsScheduleExpanded(!isScheduleExpanded)}
        title={isScheduleExpanded ? 'Suskleisti tvarkaraštį' : 'Išskleisti tvarkaraštį'}
      >
        <div className="flex items-center space-x-3 flex-1">
          <Calendar className="h-5 w-5 text-gray-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Studento tvarkaraštis</h3>
            <p className="text-sm text-gray-600">
              {weekInfo.dateRangeText}
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${weekInfo.statusColor}`}>
                {weekInfo.statusText}
              </span>
              {studentName && (
                <span className="ml-2 text-xs text-gray-500">• {studentName}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Navigacijos mygtukai akordeono antraštėje */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateWeek(-1);
            }}
            disabled={isLoading}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            title="Ankstesnė savaitė"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToToday();
            }}
            disabled={isLoading}
            className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
            title="Eiti į šiandienos savaitę"
          >
            Dabar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateWeek(1);
            }}
            disabled={isLoading}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            title="Kita savaitė"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsScheduleExpanded(!isScheduleExpanded);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            title={isScheduleExpanded ? 'Suskleisti tvarkaraštį' : 'Išskleisti tvarkaraštį'}
          >
            {isScheduleExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Kalendoriaus tinklelis - rodomas tik jei išskleista */}
      {isScheduleExpanded && (
        <div className="border-t border-gray-200 p-6">
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
                  isToday(weekInfo.weekDates[dayIndex]) 
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
                        <span className="text-xs font-medium text-gray-700">
                          {period.starttime}-{period.endtime}
                        </span>
                      </div>
                      {period.name && (
                        <div className="text-xs text-gray-500 mt-1">
                          {period.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Dienų pamokos */}
                  {weekDays.map((day, dayIndex) => {
                    const lessons = getLessonsForSlot(weekInfo.weekDates[dayIndex], period.id);
                    
                    return (
                      <div key={`${day.key}-${period.id}`} className="min-h-20 flex flex-col">
                        {lessons.length > 0 ? (
                          lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className={`flex-1 ${lessonIndex > 0 ? 'mt-1' : ''}`}>
                              <LessonCard 
                                lesson={lesson} 
                                isSelected={selectedScheduleId === lesson.id}
                                onClick={() => {
                                  const newSelection = selectedScheduleId === lesson.id ? null : lesson.id;
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
      )}
    </div>
  );
});

// Add display name for debugging
CuratorStudentScheduleCalendar.displayName = 'CuratorStudentScheduleCalendar';

export default CuratorStudentScheduleCalendar;
