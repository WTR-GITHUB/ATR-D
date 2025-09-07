// /frontend/src/contexts/WeekInfoContext.tsx

// WeekInfo Context Provider for A-DIENYNAS system
// Provides global week information state management with server-side data
// Enables client-side navigation while maintaining server-side consistency
// CHANGE: Created WeekInfo context to replace useWeekInfo hook and fix hydration

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WeekInfo, getWeekInfo, getTodayWeekInfo } from '@/lib/services/weekInfoService';

interface WeekInfoContextType {
  weekInfo: WeekInfo;
  navigateWeek: (direction: number) => Promise<void>;
  goToToday: () => Promise<void>;
  setCurrentWeek: (week: Date) => Promise<void>;
  isLoading: boolean;
}

const WeekInfoContext = createContext<WeekInfoContextType | undefined>(undefined);

interface WeekInfoProviderProps {
  children: ReactNode;
  initialData: WeekInfo;
}

export function WeekInfoProvider({ children, initialData }: WeekInfoProviderProps) {
  const [weekInfo, setWeekInfo] = useState<WeekInfo>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // Navigate to previous/next week
  const navigateWeek = useCallback(async (direction: number) => {
    setIsLoading(true);
    try {
      // Use current week as base for navigation
      const currentWeek = weekInfo.currentWeek;
      const newWeek = new Date(currentWeek);
      newWeek.setDate(currentWeek.getDate() + (direction * 7));
      
      const newWeekInfo = await getWeekInfo(newWeek);
      setWeekInfo(newWeekInfo);
    } catch (error) {
      console.error('Error navigating week:', error);
    } finally {
      setIsLoading(false);
    }
  }, [weekInfo.currentWeek]);

  // Go to current week (today)
  const goToToday = useCallback(async () => {
    setIsLoading(true);
    try {
      const todayWeekInfo = await getTodayWeekInfo();
      setWeekInfo(todayWeekInfo);
    } catch (error) {
      console.error('Error going to today:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set specific week
  const setCurrentWeek = useCallback(async (week: Date) => {
    setIsLoading(true);
    try {
      const newWeekInfo = await getWeekInfoByOffset(0); // This will be updated to use specific date
      setWeekInfo(newWeekInfo);
    } catch (error) {
      console.error('Error setting current week:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: WeekInfoContextType = {
    weekInfo,
    navigateWeek,
    goToToday,
    setCurrentWeek,
    isLoading
  };

  return (
    <WeekInfoContext.Provider value={value}>
      {children}
    </WeekInfoContext.Provider>
  );
}

// Hook to use WeekInfo context
export function useWeekInfoContext(): WeekInfoContextType {
  const context = useContext(WeekInfoContext);
  if (context === undefined) {
    throw new Error('useWeekInfoContext must be used within a WeekInfoProvider');
  }
  return context;
}

// Backward compatibility hook (replaces old useWeekInfo)
export function useWeekInfo(): WeekInfoContextType {
  return useWeekInfoContext();
}
