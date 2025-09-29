// frontend/src/hooks/useStudentDetails.ts

// useStudentDetails hook - gauna studento detalią informaciją
// Implementuoja role-based prieigos kontrolę ir saugumo patikrinimus
// CHANGE: Sukurtas hook studento detalių duomenų valdymui su saugumo apsauga

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import api from '@/lib/api';

interface StudentDetails {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  birth_date?: string;
  phone_number?: string;
  contract_number?: string;
  roles: string[];
  created_at: string;
  updated_at: string;
}

export const useStudentDetails = (studentId: string) => {
  const { isAuthenticated, user } = useAuth(); // SEC-001: Remove token - handled by cookies
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!isAuthenticated || !user) { // SEC-001: Remove token check - handled by cookies
        setLoading(false);
        return;
      }

      // Client-side role-based access control
      const hasAccess = user.roles?.includes('curator') || user.roles?.includes('manager');
      if (!hasAccess) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setAccessDenied(false);

        const response = await api.get(`/users/students/${studentId}/`);
        const data: StudentDetails = response.data;
        setStudent(data);

      } catch (err: unknown) {
        const error = err as { response?: { status?: number; data?: unknown } };
        
        // Handle 403 Forbidden error
        if (error.response?.status === 403) {
          setAccessDenied(true);
          return;
        }
        
        setError((error.response?.data as { message?: string })?.message || (err as { message?: string }).message || 'Nepavyko gauti studento duomenų');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [isAuthenticated, user, studentId]); // SEC-001: Remove token dependency - handled by cookies

  return {
    student,
    loading,
    error,
    accessDenied,
    refetch: () => {
      setLoading(true);
      setError(null);
      setAccessDenied(false);
      // Re-fetch logic will be triggered by useEffect
    }
  };
};
