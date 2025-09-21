// frontend/src/hooks/usePeriods.ts

// Hook pamokų periodų gavimui iš API
// Naudojamas periodų (pamokų laikų) sąrašo gavimui Veiklos puslapyje
// Gauna duomenis iš backend schedule.Period modelio
// CHANGE: Sukurtas usePeriods hook periodų duomenų valdymui

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export interface Period {
  id: number;
  name: string;
  starttime: string;
  duration: number;
  endtime: string;
}

interface UsePeriodsReturn {
  periods: Period[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Hook pamokų periodų sąrašo gavimui
export const usePeriods = (): UsePeriodsReturn => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/schedule/periods/');
      setPeriods(response.data);
    } catch (err: unknown) {
      console.error('Klaida gaunant periodų duomenis:', err);
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Nepavyko gauti periodų duomenų');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  return {
    periods,
    isLoading,
    error,
    refetch: fetchPeriods
  };
};

export default usePeriods;