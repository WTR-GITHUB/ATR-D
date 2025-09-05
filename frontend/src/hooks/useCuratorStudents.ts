// frontend/src/hooks/useCuratorStudents.ts

// useCuratorStudents hook - gauna kuratoriaus priskirtus studentus
// Naudoja StudentCurator API endpoint'ą duomenų gavimui
// CHANGE: Sukurtas hook kuratoriaus studentų duomenų valdymui

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

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
      console.log('🔍 useCuratorStudents: Starting fetch...', {
        isAuthenticated,
        hasToken: !!token,
        tokenLength: token?.length
      });

      if (!isAuthenticated || !token) {
        console.log('❌ useCuratorStudents: Not authenticated or no token');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('🌐 useCuratorStudents: Making API request to /api/crm/student-curators/');

        const response = await fetch('/api/crm/student-curators/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('📨 useCuratorStudents: Response received', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ useCuratorStudents: API Error Response:', errorText);
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data: StudentCurator[] = await response.json();
        console.log('✅ useCuratorStudents: Data received:', data);
        
        // Ištraukiame studentus iš StudentCurator duomenų
        const studentList: Student[] = data.map(item => ({
          id: item.student,
          first_name: item.student_first_name,
          last_name: item.student_last_name,
          email: item.student_email
        }));
        
        console.log('🎯 useCuratorStudents: Processed students:', studentList);
        setStudents(studentList);

      } catch (err) {
        console.error('💥 useCuratorStudents: Error occurred:', err);
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
