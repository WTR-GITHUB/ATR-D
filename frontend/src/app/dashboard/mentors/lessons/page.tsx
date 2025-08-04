'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LocalDataTable } from '@/components/DataTable';
import { lessonsAPI } from '@/lib/api';
import { BookOpen, Calendar, Users, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { Lesson } from '@/lib/types';

export default function MentorLessonsPage() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (lessonId: number) => {
    // Navigate to edit page
    window.location.href = `/dashboard/mentors/lessons/edit/${lessonId}`;
  };

  const handleDelete = async (lessonId: number) => {
    if (confirm('Ar tikrai norite ištrinti šią pamoką?')) {
      try {
        await lessonsAPI.delete(lessonId);
        // Refresh the list
        const response = await lessonsAPI.getAll();
        setLessons(response.data);
      } catch (error) {
        console.error('Error deleting lesson:', error);
        alert('Nepavyko ištrinti pamokos');
      }
    }
  };

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setIsLoading(true);
        const response = await lessonsAPI.getAll();
        setLessons(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching lessons:', err);
        setError('Nepavyko užkrauti pamokų sąrašo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();

    // Add global functions for DataTable buttons
    (window as any).handleEdit = handleEdit;
    (window as any).handleDelete = handleDelete;

    return () => {
      delete (window as any).handleEdit;
      delete (window as any).handleDelete;
    };
  }, []);

  const columns = [
    {
      title: 'Dalykas',
      data: 'subject_name',
      render: (data: any) => data || '-'
    },
    {
      title: 'Pavadinimas',
      data: 'title'
    },
    {
      title: 'Tema',
      data: 'topic_name',
      render: (data: any) => data || '-'
    },
    {
      title: 'Mokymo lygiai',
      data: 'levels_names',
      render: (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          return data.join(', ');
        }
        return '-';
      }
    },
    {
      title: 'Veiksmai',
      data: 'id',
      render: (data: any) => {
        const lessonId = data;
        return `
          <div class="flex items-center space-x-2">
            <button onclick="window.handleEdit(${lessonId})" class="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors" title="Redaguoti">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button onclick="window.handleDelete(${lessonId})" class="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors" title="Ištrinti">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        `;
      }
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <BookOpen className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Klaida</h3>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Greitos veiklos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/mentors/lessons/create" className="block">
              <button className="text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full">
                <div className="flex items-center space-x-3">
                  <Plus className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Sukurti naują pamoką</span>
                </div>
              </button>
            </Link>
            
            <button className="text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Pamokų tvarkaraštis</span>
              </div>
            </button>
            
            <button className="text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Studentų sąrašas</span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Lessons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pamokų sąrašas</CardTitle>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Pamokų nėra</h3>
              <p className="mt-1 text-sm text-gray-500">
                Kol kas pamokų sąrašas tuščias. Sukurkite pirmąją pamoką.
              </p>
              <div className="mt-6">
                <Link href="/dashboard/mentors/lessons/create">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Sukurti pamoką
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <LocalDataTable
              id="lessons-table"
              data={lessons}
              columns={columns}
              options={{
                pageLength: 10,
                order: [[0, 'asc'], [1, 'asc']],
                responsive: true
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 