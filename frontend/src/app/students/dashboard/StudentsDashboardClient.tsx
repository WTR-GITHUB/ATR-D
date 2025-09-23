// /home/master/DIENYNAS/frontend/src/app/students/dashboard/StudentsDashboardClient.tsx

// Purpose: Client UI studentų dashboard puslapiui su savaitės navigacija.
// Updates: Sukurtas naujas client komponentas; navigacija per WeekInfoContext; kalendorius su showHeader=false.
// NOTE: Niekada netriname senų pastabų.

'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useWeekInfoContext } from '@/contexts/WeekInfoContext';
import StudentWeeklyScheduleCalendar, { WeeklyScheduleCalendarRef } from '../components/StudentWeeklyScheduleCalendar';
import AchievementCard from '../components/achievementCard';

export default function StudentsDashboardClient() {
  const { weekInfo, navigateWeek, goToToday, isLoading } = useWeekInfoContext();
  const calendarRef = useRef<WeeklyScheduleCalendarRef>(null);
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Savaitės tvarkaraščio akordeonas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div
            className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => setIsScheduleExpanded(!isScheduleExpanded)}
            title={isScheduleExpanded ? 'Suskleisti tvarkaraštį' : 'Išskleisti tvarkaraštį'}
          >
            <div className="flex items-center space-x-3 flex-1">
              <Calendar className="h-5 w-5 text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Savaitės tvarkaraštis</h3>
                <p className="text-sm text-gray-600">
                  {weekInfo.dateRangeText}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${weekInfo.statusColor}`}>
                    {weekInfo.statusText}
                  </span>
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
          {isScheduleExpanded && (
            <div className="border-t border-gray-200">
              <StudentWeeklyScheduleCalendar ref={calendarRef} className="border-0 shadow-none" showHeader={false} />
            </div>
          )}
        </div>

        {/* Ugdis kortelė */}
        <AchievementCard />
      </div>
    </div>
  );
}


