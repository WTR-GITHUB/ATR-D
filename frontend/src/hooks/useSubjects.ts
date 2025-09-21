// frontend/src/hooks/useSubjects.ts

// Hook dalykų duomenų gavimui iš API
// Naudojamas mentorių dalykų sąrašo gavimui Veiklos puslapyje
// Automatiškai gauna duomenis ir valdo loading/error būsenas
// CHANGE: Sukurtas useSubjects hook dalykų duomenų valdymui

'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface Subject {
  id: number;
  name: string;
  description: string;
}

interface UseSubjectsReturn {
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Hook mentorių dalykų sąrašo gavimui
export const useSubjects = (): UseSubjectsReturn => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/crm/mentor-subjects/my_subjects/');
      setSubjects(response.data);
    } catch (err: unknown) {
      console.error('Klaida gaunant dalykų duomenis:', err);
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Nepavyko gauti dalykų duomenų');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return {
    subjects,
    isLoading,
    error,
    refetch: fetchSubjects
  };
};

export default useSubjects;
