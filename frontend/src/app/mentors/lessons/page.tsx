// frontend/src/app/mentors/lessons/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ClientAuthGuard from '@/components/auth/ClientAuthGuard';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ReactDataTable } from '@/components/DataTable';
import { lessonsAPI } from '@/lib/api';
import { BookOpen, Calendar, Users, Plus, Edit, Trash2, Copy } from 'lucide-react';
import Link from 'next/link';

import { Lesson } from '@/lib/types';
import { useModals } from '@/hooks/useModals';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import NotificationModal from '@/components/ui/NotificationModal';

export default function MentorLessonsPage() {
  useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal hooks
  const {
    confirmationModal,
    showConfirmation,
    closeConfirmation,
    notificationModal,
    closeNotification,
    showSuccess,
    showError
  } = useModals();

  const handleEdit = (lessonId: number) => {
    // Navigate to edit page
    window.location.href = `/mentors/lessons/edit/${lessonId}`;
  };

  const handleDelete = (lessonId: number) => {
    showConfirmation(
      {
        title: 'Ištrinti pamoką',
        message: 'Ar tikrai norite ištrinti šią pamoką?',
        confirmText: 'Ištrinti',
        cancelText: 'Atšaukti',
        type: 'danger'
      },
      async () => {
        try {
          await lessonsAPI.delete(lessonId);
          // Refresh the list
          const response = await lessonsAPI.getAll();
          setLessons(response.data);
          showSuccess('Pamoka sėkmingai ištrinta');
        } catch (error) {
          console.error('Error deleting lesson:', error);
          showError('Nepavyko ištrinti pamokos');
          throw error; // Re-throw to keep modal open
        }
      }
    );
  };

  const handleCopy = (lessonId: number) => {
    // Navigate to copy page
    window.location.href = `/mentors/lessons/copy/${lessonId}`;
  };

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setIsLoading(true);
        const response = await lessonsAPI.getAll();
        setLessons(response.data);
        setError(null);
      } catch (err: unknown) {
        console.error('Error fetching lessons:', err);
        setError('Nepavyko užkrauti pamokų sąrašo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, []);



  if (isLoading) {
    return (
      <ClientAuthGuard requireAuth={true} allowedRoles={['mentor']}>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ClientAuthGuard>
    );
  }

  if (error) {
    return (
      <ClientAuthGuard requireAuth={true} allowedRoles={['mentor']}>
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
      </ClientAuthGuard>
    );
  }

  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['mentor']}>
      <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Greitos veiklos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/mentors/lessons/create" className="block">
              <button className="text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full">
                <div className="flex items-center space-x-3">
                  <Plus className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Sukurti naują pamoką</span>
                </div>
              </button>
            </Link>
            
            <Link href="/mentors/schedule" className="block">
              <button className="text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Pamokų tvarkaraštis</span>
                </div>
              </button>
            </Link>
            
            <Link href="/mentors/students" className="block">
              <button className="text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Studentų sąrašas</span>
                </div>
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>



      {/* Lessons Table */}
      {lessons.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Pamokų nėra
          </h3>
          <p className="text-gray-600">
            Kol kas pamokų sąrašas tuščias. Sukurkite pirmąją pamoką.
          </p>
          <div className="mt-6">
            <Link href="/mentors/lessons/create">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Plus className="w-4 h-4 mr-2" />
                Sukurti pamoką
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <ReactDataTable
          data={lessons.map(lesson => ({
            ...lesson,
            subject_name: lesson.subject_name || '-',
            topic_name: lesson.topic_name || '-',
            levels_names: Array.isArray(lesson.levels_names) && lesson.levels_names.length > 0 
              ? lesson.levels_names.join(', ') 
              : '-',
            actions: (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleEdit(lesson.id)} 
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors" 
                  title="Redaguoti"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleCopy(lesson.id)} 
                  className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors" 
                  title="Kopijuoti pamoką"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(lesson.id)} 
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors" 
                  title="Ištrinti"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )
          }))}
          columns={[
            { title: 'Dalykas', data: 'subject_name' },
            { title: 'Pavadinimas', data: 'title' },
            { title: 'Tema', data: 'topic_name' },
            { title: 'Mokymo lygiai', data: 'levels_names' },
            { title: 'Veiksmai', data: 'actions' }
          ]}
          title="Pamokų sąrašas"
          itemsPerPage={100}
          showFilters={true}
          filterableColumns={['subject_name', 'title', 'topic_name', 'levels_names']}
        />
      )}

      {/* Modal Components */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmation}
        onConfirm={confirmationModal.onConfirm || (() => {})}
        title={confirmationModal.options.title}
        message={confirmationModal.options.message}
        confirmText={confirmationModal.options.confirmText}
        cancelText={confirmationModal.options.cancelText}
        type={confirmationModal.options.type}
        isLoading={confirmationModal.isLoading}
      />

      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={closeNotification}
        title={notificationModal.options.title}
        message={notificationModal.options.message}
        type={notificationModal.options.type}
        autoClose={notificationModal.options.autoClose}
        autoCloseDelay={notificationModal.options.autoCloseDelay}
      />
      </div>
    </ClientAuthGuard>
  );
} 