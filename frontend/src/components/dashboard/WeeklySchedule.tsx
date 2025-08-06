'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGlobalSchedule, useOptimizedSchedule, useRenderOptimization, useLoadingManager } from '@/hooks/useSchedule';
import { useLevels } from '@/hooks/useLevels';
import { usePeriods } from '@/hooks/usePeriods';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';
import { GlobalSchedule, Level, Period } from '@/lib/types';
import ScheduleCard from './ScheduleCard';
import TableCell from './TableCell';

interface WeeklyScheduleProps {
  weekStart?: string; // YYYY-MM-DD format
  targetDate?: string; // Konkrečios dienos data testavimui
}

export default function WeeklySchedule({ weekStart, targetDate }: WeeklyScheduleProps) {
  const { user } = useAuth();
  const { schedule, fetchSchedule, getWeeklySchedule, loading: scheduleLoading } = useGlobalSchedule();
  const { levels, loading: levelsLoading, error: levelsError } = useLevels();
  const { periods, loading: periodsLoading, error: periodsError } = usePeriods();
  
  // Centrinis loading manager
  const { isLoading, loadingText, startLoading, stopLoading } = useLoadingManager();
  
  // Naudojame optimizuotus hook'us
  const { getLessonsForSlot, getLessonsForDateRange, scheduleSize } = useOptimizedSchedule(
    schedule, 
    user?.id
  );
  
  const { getCellData, totalCells } = useRenderOptimization(schedule, user?.id);

  const [error, setError] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoizuojame savaitės dienas
  const weekDays = useMemo(() => {
    // Naudojame šiandienos datą arba nurodytą datą
    let startDate = new Date();
    if (targetDate) {
      startDate = new Date(targetDate);
    } else if (weekStart) {
      startDate = new Date(weekStart);
    }
    
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // JavaScript getDay() grąžina 0-6 (sekmadienis-sabata)
      const weekdayNames: { [key: number]: string } = {
        0: 'Sekmadienis',  // 0 = Sunday
        1: 'Pirmadienis',  // 1 = Monday
        2: 'Antradienis',  // 2 = Tuesday
        3: 'Trečiadienis', // 3 = Wednesday
        4: 'Ketvirtadienis', // 4 = Thursday
        5: 'Penktadienis', // 5 = Friday
        6: 'Šeštadienis'   // 6 = Saturday
      };
      
      const shortNames: { [key: number]: string } = {
        0: 'Sek',
        1: 'Pir',
        2: 'Ant',
        3: 'Tre',
        4: 'Ket',
        5: 'Pen',
        6: 'Šeš'
      };
      
      weekDays.push({
        id: date.toISOString().split('T')[0], // Datos ID (YYYY-MM-DD)
        name: weekdayNames[date.getDay()],
        short: shortNames[date.getDay()],
        date: date
      });
    }
    
    return weekDays;
  }, [weekStart, targetDate]);

  // Centrinis duomenų kraunimas
  useEffect(() => {
    const loadAllData = async () => {
      if (isInitialized) return; // Išvengiame daugkartinio kraunamo
      
      try {
        startLoading('Kraunamas tvarkaraštis...');
        setError(null);
        
        // Krauname visus duomenis vienu metu
        await Promise.all([
          fetchSchedule(),
          // getWeeklySchedule() - nereikia, nes fetchSchedule() jau krauna visus duomenis
        ]);
        
        // Jei nurodyta savaitės pradžia, naudojame ją
        if (weekStart) {
          setCurrentWeekStart(weekStart);
        } else {
          // Nustatome einamą savaitę
          const today = new Date();
          const monday = new Date(today);
          monday.setDate(today.getDate() - today.getDay() + 1); // Pirmadienis
          const weekStartStr = monday.toISOString().split('T')[0];
          setCurrentWeekStart(weekStartStr);
        }
        
        setIsInitialized(true);
      } catch (err: any) {
        console.error('Error loading schedule:', err);
        setError('Nepavyko užkrauti tvarkaraščio');
      } finally {
        stopLoading();
      }
    };

    loadAllData();
  }, [weekStart, fetchSchedule, startLoading, stopLoading, isInitialized]);

  // Memoizuojame dienos datą
  const getDayDate = useMemo(() => {
    return (date: Date) => {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      const weekday = date.toLocaleDateString('lt-LT', { weekday: 'long' });
      return `${dateStr} - ${weekday.toUpperCase()}`;
    };
  }, []);

  // Patikriname, ar visi duomenys yra paruošti
  const isDataReady = useMemo(() => {
    return !scheduleLoading && !levelsLoading && !periodsLoading && isInitialized && schedule.length > 0;
  }, [scheduleLoading, levelsLoading, periodsLoading, isInitialized, schedule.length]);

  // Nuolatinis loading indikatorius
  if (isLoading || !isDataReady) {
    return <LoadingSpinner text={loadingText || 'Kraunamas tvarkaraštis...'} />;
  }

  if (error || levelsError || periodsError) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <Calendar className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Klaida</h3>
            <p className="text-sm text-gray-500">{error || levelsError || periodsError}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Memoizuojame komponentą vienai dienai
  const DaySchedule = React.memo(({ day, dayIndex }: { day: any; dayIndex: number }) => (
    <Card key={day.name}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>{getDayDate(day.date)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-700">
                  Lygis
                </th>
                {periods.map((period: Period) => (
                  <th key={period.name || period.id} className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-700">
                    <div className="text-sm font-semibold">{period.name || `P${period.id}`}</div>
                    <div className="text-xs text-gray-500">{period.starttime} - {period.endtime}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {levels.map((level: Level) => (
                <tr key={level.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600 bg-gray-50">
                    <div className="font-medium">{level.name}</div>
                    <div className="text-xs text-gray-500">{level.description}</div>
                  </td>
                  {periods.map((period) => {
                    // Naudojame optimizuotą O(1) paiešką
                    const lessons = getLessonsForSlot(day.id, period.id, level.id);
                    const cellData = getCellData(day.id, period.id, level.id);
                    
                    return (
                      <td key={`${day.name}-${period.id}-${level.id}`} className="border border-gray-200 px-2 py-2 min-h-[80px]">
                        {lessons.length > 0 ? (
                          lessons.map((lesson: GlobalSchedule, index: number) => (
                            <TableCell
                              key={lesson.id}
                              subject={cellData.subject}
                              classroom={cellData.classroom}
                              lesson={cellData.lesson}
                            />
                          ))
                        ) : (
                          <div className="text-gray-400 text-center text-xs py-4">
                            -
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  ));

  // Priskiriame displayName komponentui
  DaySchedule.displayName = 'DaySchedule';
  
  return (
    <div className="space-y-6">
      {weekDays.map((day, dayIndex) => (
        <DaySchedule key={`${day.name}-${day.date.toISOString()}`} day={day} dayIndex={dayIndex} />
      ))}
    </div>
  );
} 