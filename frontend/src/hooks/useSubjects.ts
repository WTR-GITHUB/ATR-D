// /home/master/DIENYNAS/frontend/src/hooks/useSubjects.ts
// Hook dalykų sąrašui iš backend API
// Purpose: Gauna dalykų sąrašą iš curriculum API endpoint'o
// Updates: Sukurtas naujas hook su TypeScript tipais ir error handling
// NOTE: Niekada netriname senų pastabų

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

// Dalyko tipas pagal backend modelį
export interface Subject {
  id: number;
  name: string;
  description: string;
  color: string;
}

// Hook'o grąžinimo tipas
interface UseSubjectsReturn {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSubjects = (): UseSubjectsReturn => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/curriculum/subjects/');
      setSubjects(response.data.results || response.data);
    } catch (err) {
      console.error('Klaida gaunant dalykus:', err);
      setError('Nepavyko gauti dalykų sąrašo');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return {
    subjects,
    loading,
    error,
    refetch: fetchSubjects,
  };
};