// frontend/src/hooks/useStudentDetails.ts

// useStudentDetails hook - gauna studento detalią informaciją
// Implementuoja role-based prieigos kontrolę ir saugumo patikrinimus
// CHANGE: Sukurtas hook studento detalių duomenų valdymui su saugumo apsauga

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

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
  const { token, isAuthenticated, user } = useAuth();
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!isAuthenticated || !token || !user) {
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

        const response = await fetch(`/api/users/students/${studentId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 403) {
          setAccessDenied(true);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: StudentDetails = await response.json();
        setStudent(data);

      } catch (err) {
        console.error('Error fetching student details:', err);
        setError(err instanceof Error ? err.message : 'Nepavyko gauti studento duomenų');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [isAuthenticated, token, user, studentId]);

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
