// frontend/src/app/mentors/students/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ClientAuthGuard from '@/components/auth/ClientAuthGuard';
import { ReactDataTable } from '@/components/DataTable';
import { studentSubjectLevelsAPI } from '@/lib/api';
import { Users, BookOpen, GraduationCap } from 'lucide-react';

interface StudentSubjectLevel {
  id: number;
  student: number;
  subject: number;
  level: number;
  student_name: string;
  student_email: string;
  subject_name: string;
  level_name: string;
  created_at: string;
  updated_at: string;
}

export default function MentorStudentsPage() {
  const [students, setStudents] = useState<StudentSubjectLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await studentSubjectLevelsAPI.getAll();
        setStudents(response.data);
        setError(null);
      } catch (err: unknown) {
        console.error('Error fetching students:', err);
        setError('Nepavyko užkrauti studentų sąrašo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const columns = [
    {
      title: 'Vardas',
      data: 'student_name',
      render: (data: unknown) => {
        const fullName = (data as string) || '-';
        const nameParts = fullName.split(' ');
        return nameParts[0] || '-';
      }
    },
    {
      title: 'Pavardė',
      data: 'student_name',
      render: (data: unknown) => {
        const fullName = (data as string) || '-';
        const nameParts = fullName.split(' ');
        return nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-';
      }
    },
    {
      title: 'El. paštas',
      data: 'student_email',
      render: (data: unknown) => (data as string) || '-'
    },
    {
      title: 'Dalykas',
      data: 'subject_name',
      render: (data: unknown) => (data as string) || '-'
    },
    {
      title: 'Lygis',
      data: 'level_name',
      render: (data: unknown) => (data as string) || '-'
    }
  ];

  if (isLoading) {
    return (
      <ClientAuthGuard requireAuth={true} allowedRoles={['mentor']}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Kraunama...</p>
          </div>
        </div>
      </ClientAuthGuard>
    );
  }

  if (error) {
    return (
      <ClientAuthGuard requireAuth={true} allowedRoles={['mentor']}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Klaida</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </ClientAuthGuard>
    );
  }

  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['mentor']}>
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Studentų sąrašas</h1>
        <p className="text-gray-600">
          Peržiūrėkite mokinių dalykų ir lygių informaciją
        </p>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Iš viso mokinių</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(students.map(s => s.student_name)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unikalūs dalykai</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(students.map(s => s.subject_name)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unikalūs lygiai</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(students.map(s => s.level_name)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nėra studentų duomenų
          </h3>
          <p className="text-gray-600">
            Studentų dalykų ir lygių informacija dar nepridėta.
          </p>
        </div>
      ) : (
        <ReactDataTable
          data={students as unknown as Record<string, unknown>[]}
          columns={columns}
          title="Studentų dalykų ir lygių sąrašas"
          itemsPerPage={100}
        />
      )}
    </div>
    </ClientAuthGuard>
  );
} 