// frontend/src/hooks/useStudentSchedule.ts

// Custom hook studento tvarkaraščio duomenims gauti iš IMUPlan
// Gauna duomenis pagal studento ID ir savaitės datą
// CHANGE: Sukurtas naujas hook studento tvarkaraščio duomenims

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface StudentScheduleItem {
  id: number;
  student: number;
  student_name: string;
  lesson: number;
  lesson_title: string;
  lesson_subject: string;
  attendance_status: 'present' | 'absent' | 'left' | 'excused' | null;
  attendance_status_display: string;
  notes: string;
  created_at: string;
  updated_at: string;
  global_schedule_date: string;
  global_schedule_time: string;
  global_schedule_period_name: string;
  global_schedule_level: string;
  global_schedule_classroom: string;
}

interface UseStudentScheduleParams {
  studentId: number;
  weekStartDate: string; // YYYY-MM-DD formato pirmadienio data
  enabled?: boolean;
}

interface UseStudentScheduleReturn {
  scheduleItems: StudentScheduleItem[];
  isLoading: boolean;
  error: string | null;
  studentName: string;
  count: number;
}

export const useStudentSchedule = (params: UseStudentScheduleParams): UseStudentScheduleReturn => {
  const [scheduleItems, setScheduleItems] = useState<StudentScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [count, setCount] = useState<number>(0);

  const fetchStudentSchedule = async () => {
    if (!params.enabled || !params.weekStartDate || !params.studentId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/plans/imu-plans/student_schedule/', {
        params: {
          student_id: params.studentId,
          week_start: params.weekStartDate
        }
      });
      
      setScheduleItems(response.data.results || []);
      setStudentName(response.data.student_name || '');
      setCount(response.data.count || 0);
      
    } catch (err: any) {
      console.error('❌ Klaida gaunant studento tvarkaraščio duomenis:', err);
      setError(err.response?.data?.error || 'Nepavyko gauti studento tvarkaraščio duomenų');
      setScheduleItems([]);
      setStudentName('');
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentSchedule();
  }, [params.studentId, params.weekStartDate, params.enabled]);

  return { scheduleItems, isLoading, error, studentName, count };
};

export default useStudentSchedule;
