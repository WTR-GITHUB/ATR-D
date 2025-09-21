// /frontend/src/hooks/useActiveActivities.ts

// Hook aktyvioms veikloms valdyti
// CHANGE: Naujas hook, kuris valdo visas aktyvias veiklas (plan_status='in_progress')
// Integruojasi su backend API per scheduleAPI.getActiveActivities()

import { useState, useEffect, useCallback } from 'react';
import { scheduleAPI } from '@/lib/api';

// TypeScript interface aktyvios veiklos duomenims
interface ActiveActivity {
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
    email: string;
    first_name: string;
    last_name: string;
  };
  // CHANGE: Pridėtas pamokos pavadinimas
  lesson_title: string | null;
  plan_status: 'planned' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
}

// Hook'as aktyvioms veikloms valdyti
export const useActiveActivities = () => {
  const [activeActivities, setActiveActivities] = useState<ActiveActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Funkcija aktyvioms veikloms gauti iš backend'o
  const fetchActiveActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
  
      const response = await scheduleAPI.globalSchedule.getActiveActivities();
      const data = response.data;
  
      // Grąžiname tik results masyvą
      const results = data.results || [];
      setActiveActivities(results);
    } catch (err: unknown) {
      console.error('❌ useActiveActivities: Klaida gaunant aktyvias veiklas:', err);
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : undefined;
      setError(errorMessage || 'Nepavyko gauti aktyvių veiklų');
      setActiveActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Automatiškai gauti aktyvias veiklas komponento montavimo metu
  useEffect(() => {
    fetchActiveActivities();
  }, [fetchActiveActivities]);

  // Funkcija atnaujinti aktyvias veiklas (panaudojama po veiklos pradžios/pabaigos)
  const refreshActiveActivities = useCallback(() => {
    fetchActiveActivities();
  }, [fetchActiveActivities]);

  return {
    activeActivities,
    isLoading,
    error,
    refreshActiveActivities
  };
};

export default useActiveActivities;
