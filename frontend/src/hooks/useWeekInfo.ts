// frontend/src/hooks/useWeekInfo.ts

// Hook savaitės informacijos gavimui - skaičiuoja savaitės pradžią, pabaigą, numerį, statusą
// Naudojamas WeeklyScheduleCalendar ir activities puslapyje savaitės navigacijai
// CHANGE: Atkurtas hook'as po atsitiktinio pašalinimo

import { useMemo } from 'react';

interface WeekInfo {
  weekDates: Date[];
  weekNumber: number;
  weekStatus: 'current' | 'past' | 'future';
  dateRangeText: string;
  statusText: string;
  statusColor: string;
  currentWeek: Date;
}

const useWeekInfo = (currentWeek: Date = new Date()): WeekInfo => {
  // Naudojame tiesiogiai prop'ą vietoj state - taip išvengime ciklo

  const { weekDates, weekNumber, weekStatus, dateRangeText, statusText, statusColor } = useMemo(() => {
    const getWeekDates = (): Date[] => {
      const week: Date[] = [];
      const startOfWeek = new Date(currentWeek);
      // Nustatome pirmadienį kaip savaitės pradžią (0=Sekmadienis, 1=Pirmadienis)
      const dayOfWeek = startOfWeek.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Jei sekmadienis (0), atimame 6 dienas, kitaip 1 - dabartinė diena
      startOfWeek.setDate(currentWeek.getDate() + mondayOffset);
      
      for (let i = 0; i < 7; i++) { // 7 dienos
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        week.push(date);
      }
      return week;
    };

    const getWeekNumber = (date: Date): number => {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

    const getWeekStatus = (weekDates: Date[]): 'current' | 'past' | 'future' => {
      const today = new Date();
      const weekStart = weekDates[0];
      const weekEnd = weekDates[6]; // Paskutinė diena yra 6-ta (sekmadienis)
      
      if (today >= weekStart && today <= weekEnd) {
        return 'current';
      } else if (today > weekEnd) {
        return 'past';
      } else {
        return 'future';
      }
    };

    const weekDates: Date[] = getWeekDates();
    const weekNumber: number = getWeekNumber(weekDates[0]);
    const weekStatus: 'current' | 'past' | 'future' = getWeekStatus(weekDates);
    
    // Datos intervalo tekstas su 08-19 formatu
    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}-${month}`;
    };
    
    const dateRangeText: string = `${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}`;
    
    // Statuso tekstas
    const statusText: string = `${weekStatus === 'current' ? 'Dabar ' : ''}${weekNumber} savaitė`;
    
    // Statuso spalva
    const statusColor: string = (() => {
      switch (weekStatus) {
        case 'current': return 'bg-green-100 text-green-700';
        case 'past': return 'bg-gray-100 text-gray-700';
        case 'future': return 'bg-yellow-100 text-yellow-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    })();

    return { weekDates, weekNumber, weekStatus, dateRangeText, statusText, statusColor };
  }, [currentWeek]);

  // navigateWeek ir goToToday funkcijos perkeltos į komponentą

  return {
    weekDates,
    weekNumber,
    weekStatus,
    dateRangeText,
    statusText,
    statusColor,
    currentWeek
  };
};

export default useWeekInfo;

