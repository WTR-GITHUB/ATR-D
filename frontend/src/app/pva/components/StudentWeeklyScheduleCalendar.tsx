// frontend/src/app/pva/components/StudentWeeklyScheduleCalendar.tsx

// Studento savaitės tvarkaraščio kalendorius - rodo IMUPlan duomenis kalendoriaus tinklelyje
// Rodo dienas ir periodus su tuščiomis ląstelėmis, kai nėra pamokų
// CHANGE: Sukurtas komponentas kalendoriaus tinkleliui su IMUPlan duomenimis

'use client';

import React, { useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import useStudentSchedule from '@/hooks/useStudentSchedule';
import usePeriods from '@/hooks/usePeriods';
import { useWeekInfoContext } from '@/contexts/WeekInfoContext';
import StudentScheduleCell from './StudentScheduleCell';
import { AttendanceStatus } from '@/app/mentors/activities/types';

interface StudentWeeklyScheduleCalendarProps {
  studentId: number;
  onScheduleItemSelect?: (itemId: number) => void;
  selectedScheduleId?: number;
  className?: string;
  onWeekChange?: (weekInfo: any) => void;
  weekInfo?: any;
  onNavigateWeek?: (direction: number) => void;
  onGoToToday?: () => void;
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

const StudentWeeklyScheduleCalendar: React.FC<StudentWeeklyScheduleCalendarProps> = ({
  studentId,
  onScheduleItemSelect,
  selectedScheduleId,
  className = '',
  onWeekChange,
  weekInfo: parentWeekInfo,
  onNavigateWeek,
  onGoToToday
}) => {
  // Savaitės informacija - use context if available, fallback to parent
  const contextWeekInfo = useWeekInfoContext();
  const displayWeekInfo = parentWeekInfo || contextWeekInfo.weekInfo;

  // Periodai
  const { periods, isLoading: periodsLoading } = usePeriods();

  // Studento tvarkaraščio duomenys
  const { 
    scheduleItems, 
    isLoading: scheduleLoading, 
    error, 
    studentName, 
    count 
  } = useStudentSchedule({
    studentId,
    weekStartDate: displayWeekInfo?.weekDates?.[0]?.toISOString().split('T')[0] || '',
    enabled: !!displayWeekInfo?.weekDates?.[0]
  });

  // Savaitės datos - naudojame tiesiogiai iš displayWeekInfo
  const weekDates = displayWeekInfo?.weekDates || [];

  // Patikriname ar šiandien
  const isToday = (date: Date | undefined) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Navigacija savaitėmis
  const navigateWeek = (direction: number) => {
    if (onNavigateWeek) {
      onNavigateWeek(direction);
    } else if (displayWeekInfo?.navigateWeek) {
      displayWeekInfo.navigateWeek(direction);
    }
  };

  // Eiti į šiandienos savaitę
  const goToToday = () => {
    if (onGoToToday) {
      onGoToToday();
    } else if (displayWeekInfo?.goToToday) {
      displayWeekInfo.goToToday();
    }
  };

  // Gauname pamokas pagal datą ir periodą (gali būti kelios)
  const getScheduleItems = (date: Date | undefined, periodId: number) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return scheduleItems.filter(item => 
      item.global_schedule_date === dateStr && 
      item.global_schedule_period_name?.includes(periodId.toString())
    );
  };

  // Lankomumo statuso keitimas
  const handleAttendanceChange = async (itemId: number, status: AttendanceStatus) => {
    try {
      // TODO: Implementuoti attendance status keitimą per API
      // Attendance change handled
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  // Pamokos pasirinkimas
  const handleItemClick = (itemId: number) => {
    if (onScheduleItemSelect) {
      onScheduleItemSelect(itemId);
    }
  };

  // Loading state
  if (periodsLoading || scheduleLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Kraunama tvarkaraštis...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
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
      {/* Kalendoriaus tinklelis */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'auto repeat(7, 1fr)', 
              gap: '8px', 
              gridTemplateRows: `60px repeat(${periods.length}, auto)` 
            }}
          >
            {/* Antraštės eilutė */}
            {/* Laiko stulpelio antraštė */}
            <div className="flex items-center justify-center">
              <h3 className="text-sm font-semibold text-gray-600">Laikas</h3>
            </div>
            
            {/* Dienų antraštės */}
            {weekDays.map((day, dayIndex) => (
              <div 
                key={`header-${day.key}`} 
                className={`flex flex-col items-center justify-center rounded-lg border-2 ${
                  isToday(weekDates[dayIndex]) 
                    ? 'bg-blue-500 text-white border-blue-600' 
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <span className="text-sm font-semibold">{day.short}</span>
                <span className="text-xs opacity-80">
                  {weekDates[dayIndex]?.getDate().toString().padStart(2, '0')}-{(weekDates[dayIndex]?.getMonth() + 1).toString().padStart(2, '0')}
                </span>
              </div>
            ))}

            {/* Pamokų eilutės */}
            {periods.map((period, periodIndex) => (
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
                
                {/* Dienų ląstelės */}
                {weekDays.map((day, dayIndex) => {
                  const scheduleItems = getScheduleItems(weekDates[dayIndex], period.id);
                  const isEmpty = scheduleItems.length === 0;
                  
                  return (
                    <div key={`cell-${day.key}-${period.id}`} className="min-h-20">
                      <StudentScheduleCell
                        items={scheduleItems}
                        isEmpty={isEmpty}
                        onAttendanceChange={handleAttendanceChange}
                        onItemClick={handleItemClick}
                      />
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentWeeklyScheduleCalendar;
