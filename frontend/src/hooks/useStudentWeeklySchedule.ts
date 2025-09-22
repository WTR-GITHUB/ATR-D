// /home/master/DIENYNAS/frontend/src/hooks/useStudentWeeklySchedule.ts

// Custom hook studento savaitės tvarkaraščio duomenims gauti
// Gauna duomenis tik studento pamokoms pagal jo subject levels
// CHANGE: Sukurtas naujas hook studento tvarkaraščio duomenims
// PURPOSE: Filtruoja GlobalSchedule pagal studento StudentSubjectLevel duomenis

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
// CHANGE: Pataisytas import'as - ScheduleItem importuojamas iš useSchedule hook'o
import { ScheduleItem } from '@/hooks/useSchedule';

interface UseStudentWeeklyScheduleParams {
  weekStartDate: string; // YYYY-MM-DD formato pirmadienio data
  enabled?: boolean;
}

interface UseStudentWeeklyScheduleReturn {
  scheduleItems: ScheduleItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  studentInfo: {
    student_id: number;
    student_name: string;
    week_start: string;
    week_end: string;
    count: number;
    student_subject_levels: Array<{
      subject: string;
      level: string;
    }>;
  } | null;
}

export const useStudentWeeklySchedule = (params: UseStudentWeeklyScheduleParams): UseStudentWeeklyScheduleReturn => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<UseStudentWeeklyScheduleReturn['studentInfo']>(null);

  const fetchStudentWeeklySchedule = useCallback(async () => {
    if (!params.enabled || !params.weekStartDate) return;

    try {
      setIsLoading(true);
      setError(null);

      // CHANGE: Naudojame naują student-schedule endpoint'ą
      const response = await api.get(`/schedule/schedules/student-schedule/?week_start=${params.weekStartDate}`);
      
      // CHANGE: Gauname duomenis iš naujo endpoint'o struktūros
      const { results, ...info } = response.data;
      
      setScheduleItems(results || []);
      setStudentInfo(info);
      
    } catch (err: unknown) {
      console.error('❌ Klaida gaunant studento savaitės tvarkaraščio duomenis:', err);
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Nepavyko gauti studento savaitės tvarkaraščio duomenų');
      setScheduleItems([]);
      setStudentInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [params.enabled, params.weekStartDate]);

  useEffect(() => {
    fetchStudentWeeklySchedule();
  }, [fetchStudentWeeklySchedule, params.weekStartDate, params.enabled]);

  return { 
    scheduleItems, 
    isLoading, 
    error, 
    refetch: fetchStudentWeeklySchedule,
    studentInfo 
  };
};

export default useStudentWeeklySchedule;
