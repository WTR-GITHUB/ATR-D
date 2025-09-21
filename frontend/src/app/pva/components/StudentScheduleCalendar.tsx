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
import { useWeekInfoContext } from '@/contexts/WeekInfoContext';
import { StudentWeeklyScheduleCalendar } from './index';

interface StudentScheduleCalendarProps {
  studentId: number;
  onScheduleItemSelect?: (scheduleId: number) => void;
  selectedScheduleId?: number;
  className?: string;
  onWeekChange?: (weekInfo: Record<string, unknown>) => void;
}

const StudentScheduleCalendar: React.FC<StudentScheduleCalendarProps> = ({
  studentId,
  onScheduleItemSelect,
  selectedScheduleId,
  className = '',
  onWeekChange
}) => {
  // StudentScheduleCalendar component props received
  
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);
  
  // Savaitės valdymas - use context if available
  const contextWeekInfo = useWeekInfoContext();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [displayWeekInfo, setDisplayWeekInfo] = useState<Record<string, unknown> | null>(null);
  
  // Naudojame displayWeekInfo arba context weekInfo
  const finalWeekInfo = displayWeekInfo || contextWeekInfo.weekInfo;
  
  // Perduodame weekInfo į parent komponentą
  React.useEffect(() => {
    if (typeof onWeekChange === 'function' && finalWeekInfo) {
      onWeekChange(finalWeekInfo as Record<string, unknown>);
    }
  }, [finalWeekInfo, onWeekChange]);

  // CHANGE: Atnaujiname displayWeekInfo kai currentWeek keičiasi
  React.useEffect(() => {
    if (contextWeekInfo.weekInfo) {
      // Sukuriame savaitės datas (7 dienos nuo pirmadienio)
      const startOfWeek = new Date(currentWeek);
      startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1); // Pirmadienis
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        weekDates.push(date);
      }
      
      // Sukuriame naują weekInfo su atnaujinta data
      const newWeekInfo = {
        ...contextWeekInfo.weekInfo,
        currentWeek: currentWeek,
        weekDates: weekDates,
        // Atnaujiname kitus laukus pagal naują savaitę
        weekNumber: Math.ceil((currentWeek.getTime() - new Date(currentWeek.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
        dateRangeText: `${currentWeek.toLocaleDateString('lt-LT')} - ${new Date(currentWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('lt-LT')}`,
        statusText: isCurrentWeek(currentWeek) ? 'Dabar' : `${Math.ceil((currentWeek.getTime() - new Date(currentWeek.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))} savaitė`,
        statusColor: isCurrentWeek(currentWeek) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
      };
      setDisplayWeekInfo(newWeekInfo);
    }
  }, [currentWeek, contextWeekInfo.weekInfo]);

  // Helper funkcija patikrinti ar tai dabartinė savaitė
  const isCurrentWeek = (date: Date) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Pirmadienis
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sekmadienis
    
    return date >= startOfWeek && date <= endOfWeek;
  };

  // Navigacijos funkcijos
  const navigateWeek = (direction: number) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
    
    // CHANGE: Naudojame context navigateWeek funkciją
    if (contextWeekInfo.navigateWeek) {
      contextWeekInfo.navigateWeek(direction);
    }
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
    
    // CHANGE: Naudojame context goToToday funkciją
    if (contextWeekInfo.goToToday) {
      contextWeekInfo.goToToday();
    }
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
                {finalWeekInfo.dateRangeText as string}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${finalWeekInfo.statusColor as string}`}>
                  {finalWeekInfo.statusText as string}
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
            weekInfo={finalWeekInfo as Record<string, unknown> | undefined}
            onNavigateWeek={navigateWeek}
            onGoToToday={goToToday}
          />
        </div>
      )}
    </div>
  );
};

export default StudentScheduleCalendar;
