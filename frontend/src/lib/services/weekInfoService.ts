// /frontend/src/lib/services/weekInfoService.ts

// Server-side WeekInfo service for A-DIENYNAS system
// Provides consistent week information for both server and client rendering
// Eliminates hydration mismatches by using server-side time calculations
// CHANGE: Created server-side week info service to fix hydration issues

'use server';

import { formatDate } from '@/lib/localeConfig';

export interface WeekInfo {
  weekDates: Date[];
  weekNumber: number;
  weekStatus: 'current' | 'past' | 'future';
  dateRangeText: string;
  statusText: string;
  statusColor: string;
  currentWeek: Date;
}

/**
 * Server-side week information calculation
 * Uses server time to ensure consistent data between server and client
 */
export async function getWeekInfo(currentWeek?: Date): Promise<WeekInfo> {
  // Use provided date or current server time
  const targetWeek = currentWeek || new Date();
  
  // Calculate week dates (Monday to Sunday)
  const getWeekDates = (): Date[] => {
    const week: Date[] = [];
    const startOfWeek = new Date(targetWeek);
    
    // Set Monday as start of week (0=Sunday, 1=Monday)
    const dayOfWeek = startOfWeek.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(targetWeek.getDate() + mondayOffset);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  };

  // Calculate week number using ISO 8601 standard
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Determine week status relative to current server time
  const getWeekStatus = (weekDates: Date[]): 'current' | 'past' | 'future' => {
    const today = new Date();
    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];
    
    if (today >= weekStart && today <= weekEnd) {
      return 'current';
    } else if (today > weekEnd) {
      return 'past';
    } else {
      return 'future';
    }
  };

  // Format date as MM-DD using consistent locale configuration
  const formatDateLocal = (date: Date): string => {
    return formatDate(date).replace(/\./g, '-'); // Replace dots with dashes for MM-DD format
  };

  // Calculate all week information
  const weekDates: Date[] = getWeekDates();
  const weekNumber: number = getWeekNumber(weekDates[0]);
  const weekStatus: 'current' | 'past' | 'future' = getWeekStatus(weekDates);
  const dateRangeText: string = `${formatDateLocal(weekDates[0])} - ${formatDateLocal(weekDates[6])}`;
  const statusText: string = `${weekStatus === 'current' ? 'Dabar ' : ''}${weekNumber} savaitė`;
  
  // Status color mapping
  const statusColor: string = (() => {
    switch (weekStatus) {
      case 'current': return 'bg-green-100 text-green-700';
      case 'past': return 'bg-gray-100 text-gray-700';
      case 'future': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  })();

  return {
    weekDates,
    weekNumber,
    weekStatus,
    dateRangeText,
    statusText,
    statusColor,
    currentWeek: targetWeek
  };
}


/**
 * Get week info for today's week
 * Used for "go to today" functionality
 */
export async function getTodayWeekInfo(): Promise<WeekInfo> {
  return getWeekInfo(new Date());
}
