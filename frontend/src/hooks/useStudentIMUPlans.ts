// /home/master/DIENYNAS/frontend/src/hooks/useStudentIMUPlans.ts
// Hook mokinio IMU planams iš backend API
// Purpose: Gauna mokinio individualius ugdymo planus su pamokų informacija
// Updates: Sukurtas naujas hook su TypeScript tipais ir filtravimu pagal dalyką
// NOTE: Niekada netriname senų pastabų

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

// IMUPlan tipas pagal backend modelį
export interface IMUPlan {
  id: number;
  student: number;
  student_name: string;
  lesson: {
    id: number;
    title: string;
    topic: string;
    subject: {
      id: number;
      name: string;
    };
    mentor: number;
  } | null;
  lesson_title: string;
  lesson_subject: string;
  attendance_status: 'present' | 'absent' | 'left' | 'excused' | null;
  attendance_status_display: string;
  notes: string;
  created_at: string;
  updated_at: string;
  global_schedule: {
    id: number;
    date: string;
    weekday: string;
    subject: {
      id: number;
      name: string;
    };
    level: {
      id: number;
      name: string;
    };
    period: {
      id: number;
      name: string;
      starttime: string;
      endtime: string;
    };
    classroom: {
      id: number;
      name: string;
    };
    plan_status: string;
    user: number;
  };
  global_schedule_date: string;
  global_schedule_time: string;
  global_schedule_period_name: string;
  global_schedule_level: string;
  global_schedule_classroom: string;
}

// Hook'o parametrai
interface UseStudentIMUPlansParams {
  studentId?: number;
  subjectId?: number;
}

// Hook'o grąžinimo tipas
interface UseStudentIMUPlansReturn {
  imuPlans: IMUPlan[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useStudentIMUPlans = ({ 
  studentId, 
  subjectId 
}: UseStudentIMUPlansParams = {}): UseStudentIMUPlansReturn => {
  const [imuPlans, setImuPlans] = useState<IMUPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIMUPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sudarome query parametrus
      const params = new URLSearchParams();
      if (studentId) {
        params.append('student_id', studentId.toString());
      }
      if (subjectId) {
        params.append('global_schedule__subject', subjectId.toString());
      }
      
      const response = await api.get(`/plans/imu-plans/?${params.toString()}`);
      setImuPlans(response.data.results || response.data);
    } catch (err) {
      console.error('Klaida gaunant IMU planus:', err);
      setError('Nepavyko gauti mokinio ugdymo planų');
      setImuPlans([]);
    } finally {
      setLoading(false);
    }
  }, [studentId, subjectId]);

  useEffect(() => {
    fetchIMUPlans();
  }, [studentId, subjectId, fetchIMUPlans]);

  return {
    imuPlans,
    loading,
    error,
    refetch: fetchIMUPlans,
  };
};
