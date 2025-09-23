// /home/master/DIENYNAS/frontend/src/hooks/useStudentGrades.ts
// Hook mokinio vertinimams iš backend API
// Purpose: Gauna mokinio vertinimus su pasiekimų lygiais
// Updates: Sukurtas naujas hook su TypeScript tipais ir filtravimu
// NOTE: Niekada netriname senų pastabų

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

// AchievementLevel tipas pagal backend modelį
export interface AchievementLevel {
  id: number;
  code: 'S' | 'B' | 'P' | 'A';
  name: string;
  min_percentage: number;
  max_percentage: number;
  color: string;
  description: string;
}

// Grade tipas pagal backend modelį
export interface Grade {
  id: number;
  student: number;
  lesson: {
    id: number;
    title: string;
    subject: {
      id: number;
      name: string;
    };
  };
  mentor: number;
  achievement_level: AchievementLevel;
  percentage: number;
  imu_plan: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
  grade_letter: string;
  grade_description: string;
  grade_color: string;
}

// Hook'o parametrai
interface UseStudentGradesParams {
  studentId?: number;
  lessonId?: number;
  imuPlanId?: number;
}

// Hook'o grąžinimo tipas
interface UseStudentGradesReturn {
  grades: Grade[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useStudentGrades = ({ 
  studentId, 
  lessonId, 
  imuPlanId 
}: UseStudentGradesParams = {}): UseStudentGradesReturn => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sudarome query parametrus
      const params = new URLSearchParams();
      if (studentId) {
        params.append('student', studentId.toString());
      }
      if (lessonId) {
        params.append('lesson', lessonId.toString());
      }
      if (imuPlanId) {
        params.append('imu_plan', imuPlanId.toString());
      }
      
      const response = await api.get(`/grades/grades/?${params.toString()}`);
      setGrades(response.data.results || response.data);
    } catch (err) {
      console.error('Klaida gaunant vertinimus:', err);
      setError('Nepavyko gauti mokinio vertinimų');
      setGrades([]);
    } finally {
      setLoading(false);
    }
  }, [studentId, lessonId, imuPlanId]);

  useEffect(() => {
    fetchGrades();
  }, [studentId, lessonId, imuPlanId, fetchGrades]);

  return {
    grades,
    loading,
    error,
    refetch: fetchGrades,
  };
};
