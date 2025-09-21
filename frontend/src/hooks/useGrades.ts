// frontend/src/hooks/useGrades.ts

// Hook studento vertinimų duomenų gavimui iš backend'o
// CHANGE: Sukurtas naujas hook vertinimų duomenų gavimui

import { useState, useCallback } from 'react';
import api from '@/lib/api';

interface AchievementLevel {
  id: number;
  code: string;
  name: string;
  min_percentage: number;
  max_percentage: number;
  color: string;
  description: string;
}

export interface Grade {
  id: number;
  student: number;
  lesson: number;
  mentor: number;
  achievement_level: AchievementLevel;
  percentage: number;
  imu_plan?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface UseGradesReturn {
  getStudentGrade: (studentId: number, lessonId: number, imuPlanId?: number) => Promise<Grade | null>;
  isLoading: boolean;
  error: string | null;
}

export const useGrades = (): UseGradesReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CHANGE: Funkcija gauti studento vertinimą pagal studentId, lessonId ir imuPlanId
  const getStudentGrade = useCallback(async (
    studentId: number, 
    lessonId: number, 
    imuPlanId?: number
  ): Promise<Grade | null> => {
  
    
    setIsLoading(true);
    setError(null);
    
    try {
      // CHANGE: Sukuriame URL parametrus vertinimo paieškai
      const params = new URLSearchParams({
        student: studentId.toString(),
        lesson: lessonId.toString(),
        ...(imuPlanId && { imu_plan: imuPlanId.toString() })
      });
      
      
      
      const response = await api.get(`/grades/grades/?${params}`);
      
      
      // CHANGE: Teisingai apdorojame API atsakymą - gali būti tiesiog masyvas arba objektas su results
      let grades = [];
      if (Array.isArray(response.data)) {
        // CHANGE: Jei API grąžina tiesiog masyvą
        grades = response.data;
        
      } else if (response.data.results && Array.isArray(response.data.results)) {
        // CHANGE: Jei API grąžina objektą su results lauku
        grades = response.data.results;
        
      } else {
        
        grades = [];
      }
      
      if (grades.length > 0) {
        const existingGrade = grades[0];
        
        setIsLoading(false);
        return existingGrade;
      } else {
        
        setIsLoading(false);
        return null;
      }
    } catch (err: unknown) {
      console.error('❌ useGrades: Klaida gaunant vertinimą:', err);
      
      // CHANGE: Type-safe error handling for grades fetching
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Nepavyko gauti vertinimo'
        : 'Nepavyko gauti vertinimo';
      
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, []);

  return {
    getStudentGrade,
    isLoading,
    error
  };
};

export default useGrades; 