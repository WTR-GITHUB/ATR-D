// frontend/src/hooks/useLessons.ts

// Hook pamokų duomenų gavimui iš API
// Naudojamas mentorių pamokų sąrašo gavimui Veiklos puslapyje
// Palaiko filtravimą pagal dalyką ir gauna pamokų duomenis
// CHANGE: Sukurtas useLessons hook pamokų duomenų valdymui

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export interface Lesson {
  id: number;
  title: string;
  subject: string;
  topic: string;
  subject_id: number;
  time?: string;
  created_at: string;
}

interface UseLessonsReturn {
  lessons: Lesson[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Hook mentorių pamokų sąrašo gavimui
export const useLessons = (): UseLessonsReturn => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/plans/sequences/mentor_lessons/');
      
      // Konvertuojame duomenis į reikiamą formatą
      const formattedLessons = response.data.map((lesson: { id: number; title: string; subject_name: string; topic: string; subject_id?: number; time?: string }) => ({
        ...lesson,
        subject_id: lesson.subject_id || lesson.id, // Prisitaikome prie API struktūros
        time: lesson.time || '08:00-08:45' // Default laikas jei nėra
      }));
      
      setLessons(formattedLessons);
    } catch (err: unknown) {
      console.error('Klaida gaunant pamokų duomenis:', err);
      
      // CHANGE: Type-safe error handling for lessons fetching
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as any).response?.data?.detail || 'Nepavyko gauti pamokų duomenų'
        : 'Nepavyko gauti pamokų duomenų';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  return {
    lessons,
    isLoading,
    error,
    refetch: fetchLessons
  };
};

export default useLessons;
