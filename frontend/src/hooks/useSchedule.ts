// frontend/src/hooks/useSchedule.ts

// Hook tvarkaraščio duomenų gavimui iš API
// Naudojamas GlobalSchedule duomenų gavimui pagal filtrus
// Gauna duomenis iš backend schedule.GlobalSchedule modelio
// CHANGE: Sukurtas useSchedule hook tvarkaraščio duomenų valdymui

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export interface ScheduleItem {
  id: number;
  date: string;
  weekday: string;
  period: {
    id: number;
    name: string;
    starttime: string;
    endtime: string;
    duration: number;
  };
  classroom: {
    id: number;
    name: string;
    description: string;
  };
  subject: {
    id: number;
    name: string;
    description: string;
  };
  level: {
    id: number;
    name: string;
    description: string;
  };
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface UseScheduleParams {
  date?: string;
  period?: number;
  subject?: number;
  enabled?: boolean;
}

interface UseScheduleReturn {
  scheduleItems: ScheduleItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Hook tvarkaraščio duomenų gavimui su filtrais
export const useSchedule = (params: UseScheduleParams = {}): UseScheduleReturn => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async () => {
    if (!params.enabled) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Naudojame daily endpoint su data parametru
      if (params.date) {
        const url = `/schedule/schedules/daily/?date=${params.date}`;
        const response = await api.get(url);
        
        // Filtruojame pagal period ir subject jei reikia
        let filteredData = response.data;
        
        if (params.period) {
          filteredData = filteredData.filter((item: ScheduleItem) => item.period.id === params.period);
        }
        
        if (params.subject) {
          filteredData = filteredData.filter((item: ScheduleItem) => item.subject.id === params.subject);
        }
        
        setScheduleItems(filteredData);
      } else {
        // Jei nėra datos, grąžiname tuščią sąrašą
        setScheduleItems([]);
      }
    } catch (err: any) {
      console.error('Klaida gaunant tvarkaraščio duomenis:', err);
      setError(err.response?.data?.detail || 'Nepavyko gauti tvarkaraščio duomenų');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [params.date, params.period, params.subject, params.enabled]);

  return {
    scheduleItems,
    isLoading,
    error,
    refetch: fetchSchedule
  };
};

export default useSchedule;