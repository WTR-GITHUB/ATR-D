// frontend/src/hooks/useWeeklySchedule.ts

// Custom hook savaitės tvarkaraščio duomenims gauti
// Gauna duomenis visoms savaitės dienoms ir filtruoja pagal mentorių
// CHANGE: Sukurtas naujas hook savaitės tvarkaraščio duomenims

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ScheduleItem } from '@/app/dashboard/mentors/veiklos/types';

interface UseWeeklyScheduleParams {
  weekStartDate: string; // YYYY-MM-DD formato pirmadienio data
  enabled?: boolean;
}

interface UseWeeklyScheduleReturn {
  scheduleItems: ScheduleItem[];
  isLoading: boolean;
  error: string | null;
}

export const useWeeklySchedule = (params: UseWeeklyScheduleParams): UseWeeklyScheduleReturn => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklySchedule = async () => {
    if (!params.enabled || !params.weekStartDate) return;

    try {
      setIsLoading(true);
      setError(null);

      const weekItems: ScheduleItem[] = [];
      
      // Gauname duomenis kiekvienai savaitės dienai (7 dienos)
      for (let i = 0; i < 7; i++) {
        const date = new Date(params.weekStartDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        try {
          const response = await api.get(`/schedule/schedules/daily/?date=${dateStr}`);
          weekItems.push(...response.data);
        } catch (dayError) {
          console.warn(`Nepavyko gauti ${dateStr} tvarkaraščio:`, dayError);
          // Netęsiame klaidų, nes kai kurios dienos gali neturėti pamokų
        }
      }

      setScheduleItems(weekItems);
    } catch (err: any) {
      console.error('Klaida gaunant savaitės tvarkaraščio duomenis:', err);
      setError(err.response?.data?.detail || 'Nepavyko gauti savaitės tvarkaraščio duomenų');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('useWeeklySchedule useEffect triggered with weekStartDate:', params.weekStartDate, 'enabled:', params.enabled);
    fetchWeeklySchedule();
  }, [params.weekStartDate, params.enabled]);

  return { scheduleItems, isLoading, error };
};

export default useWeeklySchedule;
