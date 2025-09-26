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
  studentId: number;
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

      // CHANGE: Debug informacija
      // CHANGE: Naudojame naują student-schedule endpoint'ą
      const response = await api.get(`/schedule/schedules/student-schedule/?student_id=${params.studentId}&week_start=${params.weekStartDate}`);
      
      // CHANGE: Gauname duomenis iš naujo endpoint'o struktūros
      const { results, ...info } = response.data;
            
      // CHANGE: Debug logai pašalinti po sėkmingo testavimo
      
      setScheduleItems(results || []);
      setStudentInfo(info);
      
    } catch (err: unknown) {
      console.error('❌ Klaida gaunant studento savaitės tvarkaraščio duomenis:', err);
      const error = err as { response?: { status?: number; data?: { detail?: string } } };
      
      // CHANGE: Jei student-schedule endpoint'as neveikia, bandome naudoti daily endpoint'a
      if (error.response?.status === 403) {
        console.log('🔄 Trying to use daily endpoint instead of student-schedule...');
        try {
          const weekItems: ScheduleItem[] = [];
          
          // Gauti kiekvienos dienos duomenis
          for (let i = 0; i < 7; i++) {
            const date = new Date(params.weekStartDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            try {
              const response = await api.get(`/schedule/schedules/daily/?date=${dateStr}`);
              weekItems.push(...response.data);
            } catch (dailyErr) {
              console.log(`⚠️ Klaida gaunant ${dateStr} duomenis:`, dailyErr);
            }
          }
          
          console.log('✅ Daily endpoint duomenys:', weekItems.length, 'pamokų');
          setScheduleItems(weekItems);
          setStudentInfo({
            student_id: 0,
            student_name: 'Studentas',
            week_start: params.weekStartDate,
            week_end: new Date(new Date(params.weekStartDate).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: weekItems.length,
            student_subject_levels: []
          });
          setError(null);
        } catch (fallbackErr) {
          console.error('❌ Error using daily endpoint:', fallbackErr);
          setError('Nepavyko gauti tvarkaraščio duomenų');
          setScheduleItems([]);
          setStudentInfo(null);
        }
      } else {
        setError(error.response?.data?.detail || 'Nepavyko gauti studento savaitės tvarkaraščio duomenų');
        setScheduleItems([]);
        setStudentInfo(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [params.enabled, params.weekStartDate, params.studentId]);

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
