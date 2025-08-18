// frontend/src/components/dashboard/WeeklySchedule.tsx

// Savaitės tvarkaraščio wrapper komponentas
// Naudoja WeeklyScheduleCalendar komponentą, kuris integruotas su backend API
// CHANGE: Supaprastintas, naudoja naują WeeklyScheduleCalendar komponentą

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import WeeklyScheduleCalendar from './WeeklyScheduleCalendar';
import useWeekInfo from '@/hooks/useWeekInfo';

interface WeeklyScheduleProps {
  weekStart?: string; // YYYY-MM-DD format
  targetDate?: string; // Konkrečios dienos data testavimui
}

export default function WeeklySchedule({ weekStart, targetDate }: WeeklyScheduleProps) {
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(true); // Pagal nutylėjimą išskleistas
  
  // Inicializuojame weekInfo iš karto su dabartine savaite
  const initialWeekInfo = useWeekInfo();
  const [weekInfo, setWeekInfo] = useState<any>(null);
  
  // Kombinuojame initial info su dinamiškai atnaujinamu
  const displayWeekInfo = weekInfo || initialWeekInfo;

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center space-x-3">
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
            />
          </div>
        )}
      </div>
    </div>
  );
}