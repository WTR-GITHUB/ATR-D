// frontend/src/app/mentors/plans/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
// import { useAuth } from '@/hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ReactDataTable } from '@/components/DataTable';
import { GraduationCap, BookOpen, Plus, Users, Edit, Trash2, Eye, X } from 'lucide-react';
import api from '@/lib/api';
import { useModals } from '@/hooks/useModals';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import NotificationModal from '@/components/ui/NotificationModal';

// Interface'ai duomenų tipams
interface LessonSequence {
  id: number;
  name: string;
  description: string;
  subject_name: string;
  level_name: string;
  created_by_name: string;
  items_count: number;
  created_at: string;
  is_active: boolean;
  items: LessonSequenceItem[];
}

interface LessonSequenceItem {
  id: number;
  lesson: number;
  lesson_title: string;
  lesson_subject: string;
  position: number;
}

export default function MentorPlansPage() {
  // useAuth();
  
  const [plans, setPlans] = useState<LessonSequence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LessonSequence | null>(null);

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

  // Gauname ugdymo planus iš API
  useEffect(() => {
    async function fetchPlans() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/plans/sequences/');
        setPlans(response.data);
      } catch (error: unknown) {
        console.error('Klaida gaunant ugdymo planus:', error);
        setError('Įvyko klaida gaunant ugdymo planus');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlans();
  }, []);

  // Formatavimo funkcijos
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Atidaro modalą su plano pamokų sąrašu
  const handleViewPlan = (plan: LessonSequence) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  // Naviguoja į plano redagavimo puslapį
  const handleEditPlan = (planId: number) => {
    window.location.href = `/mentors/plans/edit/${planId}`;
  };

  // Ištrina ugdymo planą
  const handleDeletePlan = (planId: number) => {
    showConfirmation(
      {
        title: 'Ištrinti ugdymo planą',
        message: 'Ar tikrai norite ištrinti šį ugdymo planą?',
        confirmText: 'Ištrinti',
        cancelText: 'Atšaukti',
        type: 'danger'
      },
      async () => {
        try {
          await api.delete(`/plans/sequences/${planId}/`);
          setPlans(prev => prev.filter(plan => plan.id !== planId));
          showSuccess('Ugdymo planas sėkmingai ištrintas');
        } catch (error: unknown) {
          console.error('Klaida trinant planą:', error);
          showError('Nepavyko ištrinti ugdymo plano');
          throw error; // Re-throw to keep modal open
        }
      }
    );
  };

  // Uždaro modalą
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

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
                <GraduationCap className="mx-auto h-12 w-12" />
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
      {/* Greitos veiklos kortelė */}
      <Card>
        <CardHeader>
          <CardTitle>Greitos veiklos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => window.location.href = '/mentors/plans/create'}
              className="text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Sukurti ugdymo planą</span>
              </div>
            </button>
            
            <button 
              onClick={() => window.location.href = '/mentors/plans/assign'}
              className="text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Priskirti ugdymo planą</span>
              </div>
            </button>
            
            <button 
              onClick={() => window.location.href = '/mentors/plans/imuplan-assigned'}
              className="text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Edit className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Peržiūrėti priskirtus ugdymo planus</span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Ugdymo planų sąrašo lentelė */}
      {plans.length === 0 ? (
        <div className="text-center py-8">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ugdymo planų nėra
          </h3>
          <p className="text-gray-600">
            Kol kas ugdymo planų sąrašas tuščias. Sukurkite pirmąjį planą.
          </p>
          <div className="mt-6">
            <button 
              onClick={() => window.location.href = '/mentors/plans/create'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Sukurti ugdymo planą
            </button>
          </div>
        </div>
      ) : (
        <ReactDataTable
          data={plans.map(plan => ({
            ...plan,
            description: plan.description || '-',
            items_count_badge: (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {plan.items_count}
              </span>
            ),
            created_at_formatted: formatDate(plan.created_at),
            actions: (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewPlan(plan)}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  title="Peržiūrėti pamokų sąrašą"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditPlan(plan.id)}
                  className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                  title="Redaguoti"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  title="Ištrinti"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          }))}
          columns={[
            { title: 'Pavadinimas', data: 'name' },
            { title: 'Aprašymas', data: 'description' },
            { title: 'Dalykas', data: 'subject_name' },
            { title: 'Lygis', data: 'level_name' },
            { title: 'Pamokų skaičius', data: 'items_count_badge' },
            { title: 'Sukūrimo data', data: 'created_at_formatted' },
            { title: 'Veiksmai', data: 'actions' }
          ]}
          title="Ugdymo planų sąrašas"
          itemsPerPage={100}
          showFilters={true}
          filterableColumns={['name', 'subject_name', 'level_name']}
        />
      )}

      {/* Modalas pamokų sąrašui rodyti */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Modal antraštė */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedPlan.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedPlan.subject_name} • {selectedPlan.level_name}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal turinys */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedPlan.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Aprašymas</h3>
                  <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Pamokų sąrašas ({selectedPlan.items?.length || 0} pamokos)
                </h3>
                
                {selectedPlan.items && selectedPlan.items.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPlan.items.map((item) => (
                      <div key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {item.position}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.lesson_title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Dalykas: {item.lesson_subject}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Pamokų nėra</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Šis ugdymo planas neturi pridėtų pamokų.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal apatinė dalis */}
            <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Uždaryti
              </button>
            </div>
          </div>
        </div>
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
  );
}

