// frontend/src/hooks/useSchedule.ts

// Hook tvarkaraščio duomenų gavimui iš API
// Naudojamas GlobalSchedule duomenų gavimui pagal filtrus
// Gauna duomenis iš backend schedule.GlobalSchedule modelio
// CHANGE: Sukurtas useSchedule hook tvarkaraščio duomenų valdymui

'use client';

import { useState, useEffect, useCallback } from 'react';
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
  plan_status?: 'completed' | 'planned' | 'in_progress'; // CHANGE: Pridėtas plan_status property su specifiniu tipu
}

// CHANGE: Pridėti trūkstami tipai iš activities/types.ts
export interface LessonDetails {
  id: number;
  title: string;
  content: string;
  subject: number;
  subject_name: string;
  topic: string;
  objectives: string;
  components: string;
  skills: number[];
  skills_names: string[];
  virtues: number[];
  virtues_names: string[];
  levels: number[];
  levels_names: string[];
  focus: string;
  slenkstinis: string;
  bazinis: string;
  pagrindinis: string;
  aukstesnysis: string;
  competency_atcheves: number[];
  competency_atcheves_names: string[];
  created_at: string;
  updated_at: string;
}

export interface IMUPlan {
  id: number;
  name: string;
  description: string;
  global_schedule: number;
  lesson: number;
  lesson_name: string;
  created_at: string;
  updated_at: string;
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

  const fetchSchedule = useCallback(async () => {
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
    } catch (err: unknown) {
      console.error('Klaida gaunant tvarkaraščio duomenis:', err);
      
      // CHANGE: Type-safe error handling for schedule data fetching
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Nepavyko gauti tvarkaraščio duomenų'
        : 'Nepavyko gauti tvarkaraščio duomenų';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [params.enabled, params.date, params.period, params.subject]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule, params.date, params.period, params.subject, params.enabled]);

  return {
    scheduleItems,
    isLoading,
    error,
    refetch: fetchSchedule
  };
};

export default useSchedule;