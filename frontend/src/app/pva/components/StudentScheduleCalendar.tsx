// frontend/src/app/pva/components/StudentScheduleCalendar.tsx

// StudentScheduleCalendar komponentas - studento tvarkaraščio kalendorius
// Rodo IMUPlan duomenis pagal studento ID su attendance status'ais
// CHANGE: Sukurtas perpanaudojamas kalendoriaus komponentas studento puslapiui
// CHANGE: Perkeltas į pva/components direktoriją vietiniam naudojimui
// CHANGE: Atnaujintas naudoti useStudentSchedule hook'ą ir StudentScheduleCard komponentą
// CHANGE: Rodo tik konkretaus studento tvarkaraštį su IMUPlan duomenimis

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import useWeekInfo from '@/hooks/useWeekInfo';
import { StudentWeeklyScheduleCalendar } from './index';

interface StudentScheduleCalendarProps {
  studentId: number;
  onScheduleItemSelect?: (scheduleId: number) => void;
  selectedScheduleId?: number;
  className?: string;
  onWeekChange?: (weekInfo: any) => void;
}

const StudentScheduleCalendar: React.FC<StudentScheduleCalendarProps> = ({
  studentId,
  onScheduleItemSelect,
  selectedScheduleId,
  className = '',
  onWeekChange
}) => {
  // DEBUG: Patikriname props'us
  console.log('StudentScheduleCalendar props:', { 
    studentId, 
    onScheduleItemSelect, 
    selectedScheduleId, 
    className, 
    onWeekChange,
    typeofOnWeekChange: typeof onWeekChange
  });
  
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);
  
  // Savaitės valdymas
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const weekInfo = useWeekInfo(currentWeek);
  const [displayWeekInfo, setDisplayWeekInfo] = useState<any>(null);
  
  // Naudojame displayWeekInfo arba weekInfo
  const finalWeekInfo = displayWeekInfo || weekInfo;
  
  // Perduodame weekInfo į parent komponentą
  React.useEffect(() => {
    console.log('useEffect called with:', { 
      finalWeekInfo, 
      onWeekChange, 
      typeofOnWeekChange: typeof onWeekChange,
      isFunction: typeof onWeekChange === 'function'
    });
    
    if (typeof onWeekChange === 'function' && finalWeekInfo) {
      console.log('Calling onWeekChange with:', finalWeekInfo);
      onWeekChange(finalWeekInfo);
    }
  }, [finalWeekInfo, onWeekChange]);

  // Navigacijos funkcijos
  const navigateWeek = (direction: number) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-3 flex-1">
          <Calendar className="h-5 w-5 text-gray-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Studento tvarkaraštis</h3>
            {finalWeekInfo ? (
              <p className="text-sm text-gray-600">
                {finalWeekInfo.dateRangeText}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${finalWeekInfo.statusColor}`}>
                  {finalWeekInfo.statusText}
                </span>
              </p>
            ) : (
              <p className="text-sm text-gray-600">Peržiūrėti studento tvarkaraštį</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Navigacijos mygtukai akordeono antraštėje */}
          {finalWeekInfo && (
            <>
              <button
                onClick={() => navigateWeek(-1)}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Ankstesnė savaitė"
              >
                <ChevronLeft size={16} />
              </button>
              
              <button
                onClick={goToToday}
                className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                title="Eiti į šiandienos savaitę"
              >
                Dabar
              </button>
              
              <button
                onClick={() => navigateWeek(1)}
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
          <StudentWeeklyScheduleCalendar
            studentId={studentId}
            onScheduleItemSelect={onScheduleItemSelect}
            selectedScheduleId={selectedScheduleId}
            onWeekChange={setDisplayWeekInfo}
            className="border-0 shadow-none"
            weekInfo={finalWeekInfo}
            onNavigateWeek={navigateWeek}
            onGoToToday={goToToday}
          />
        </div>
      )}
    </div>
  );
};

export default StudentScheduleCalendar;
