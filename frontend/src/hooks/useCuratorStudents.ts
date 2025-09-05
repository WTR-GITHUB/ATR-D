// frontend/src/hooks/useCuratorStudents.ts

// useCuratorStudents hook - gauna kuratoriaus priskirtus studentus
// Naudoja StudentCurator API endpoint'ą duomenų gavimui
// CHANGE: Sukurtas hook kuratoriaus studentų duomenų valdymui

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import api from '@/lib/api';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface StudentCurator {
  id: number;
  student: number; // Student ID
  curator: number;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  student_name: string;
  student_email: string;
  student_first_name: string;
  student_last_name: string;
}

export const useCuratorStudents = () => {
  const { token, isAuthenticated } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {

      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);


        const response = await api.get('/crm/student-curators/');


        const data: StudentCurator[] = response.data;
        
        // Ištraukiame studentus iš StudentCurator duomenų
        const studentList: Student[] = data.map(item => ({
          id: item.student,
          first_name: item.student_first_name,
          last_name: item.student_last_name,
          email: item.student_email
        }));
        
        setStudents(studentList);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nepavyko gauti studentų duomenų');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [isAuthenticated, token]);

  return {
    students,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      // Re-fetch logic will be triggered by useEffect
    }
  };
};
