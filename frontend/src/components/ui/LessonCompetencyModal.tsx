// frontend/src/components/ui/LessonCompetencyModal.tsx
'use client';

/**
 * Kompetencijų pasiekimų modifikavimo modalo komponentas
 * Leidžia kurti, peržiūrėti ir ištrinti kompetencijų pasiekimus
 * 
 * Atnaujinta: Integruotas dalyko filtravimas į esamą formos select elementą
 * - Filtravimas vyksta per competency-subject select elementą
 * - Pataisyta dalyko pavadinimo atvaizdavimas lentelėje
 * - Filtravimas veikia realiu laiku keičiant formos dalyko pasirinkimą
 * - Pašalinti papildomi filtravimo elementai
 */

import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import Button from './Button';
import MultiSelect from './MultiSelect';
import DynamicList from './DynamicList';
import { competencyAtcheveAPI, competenciesAPI, virtuesAPI } from '@/lib/api';
import { CompetencyAtcheve, Competency } from '@/lib/types';
import { useModals } from '@/hooks/useModals';
import ConfirmationModal from './ConfirmationModal';
import NotificationModal from './NotificationModal';

interface LessonCompetencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompetencyCreated: () => void;
  subjects: { id: number; subject_name: string; name: string; description: string; mentor_subject_id: number }[];
}

/**
 * Kompetencijų pasiekimų modifikavimo modalo komponentas
 * Leidžia kurti, peržiūrėti ir ištrinti kompetencijų pasiekimus
 */
export default function LessonCompetencyModal({ 
  isOpen, 
  onClose, 
  onCompetencyCreated,
  subjects 
}: LessonCompetencyModalProps) {
  const [competencyAtcheves, setCompetencyAtcheves] = useState<CompetencyAtcheve[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [virtues, setVirtues] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [competencyFormData, setCompetencyFormData] = useState({
    subject: '',
    competency: '',
    virtues: [] as string[],
    todos: [] as string[]
  });

  // Modal hooks
  const {
    confirmationModal,
    showConfirmation,
    closeConfirmation,
    notificationModal,
    closeNotification,
    showSuccess,
    showError,
    showWarning
  } = useModals();

  // Helper function to get subject name by ID
  const getSubjectName = (subjectId: number | undefined): string => {
    if (!subjectId) return 'Nenurodyta';
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? (subject.subject_name || subject.name) : 'Nenurodyta';
  };

  // Filter competencyAtcheves based on selected subject in form
  const filteredCompetencyAtcheves = competencyFormData.subject 
    ? competencyAtcheves.filter(atcheve => atcheve.subject && atcheve.subject === parseInt(competencyFormData.subject))
    : competencyAtcheves;

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [competencyAtchevesRes, competenciesRes, virtuesRes] = await Promise.all([
        competencyAtcheveAPI.getAll(),
        competenciesAPI.getAll(),
        virtuesAPI.getAll()
      ]);
      
      setCompetencyAtcheves(competencyAtchevesRes.data);
      setCompetencies(competenciesRes.data);
      setVirtues(virtuesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompetencyFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCompetency = async () => {
    try {
      // Validate required fields
      if (!competencyFormData.competency || competencyFormData.virtues.length === 0) {
        showWarning('Prašome pasirinkti kompetenciją ir dorybes');
        return;
      }

      const dataToSend = {
        ...competencyFormData,
        todos: JSON.stringify(competencyFormData.todos),
        subject: competencyFormData.subject ? parseInt(competencyFormData.subject) : null
      };
      
      await competencyAtcheveAPI.create(dataToSend);
      
      // Refresh competencyAtcheves list
      await loadData();
      
      // Reset form
      setCompetencyFormData({
        subject: '',
        competency: '',
        virtues: [],
        todos: []
      });

      // Notify parent component
      onCompetencyCreated();
      
      showSuccess('Kompetencijos pasiekimas sėkmingai sukurtas');
    } catch (error) {
      console.error('Error creating competency atcheve:', error);
      showError('Nepavyko sukurti kompetencijos pasiekimo');
    }
  };

  const handleDeleteCompetency = (competencyId: number) => {
    showConfirmation(
      {
        title: 'Ištrinti kompetencijos pasiekimą',
        message: 'Ar tikrai norite ištrinti šį kompetencijos pasiekimą?',
        confirmText: 'Ištrinti',
        cancelText: 'Atšaukti',
        type: 'danger'
      },
      async () => {
        try {
          await competencyAtcheveAPI.delete(competencyId);
          await loadData();
          showSuccess('Kompetencijos pasiekimas sėkmingai ištrintas');
        } catch (error) {
          console.error('Error deleting competency atcheve:', error);
          showError('Nepavyko ištrinti kompetencijos pasiekimo');
        }
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Kompetencijų pasiekimų sąrašas</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Create New Competency Form */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-4">Sukurti naują kompetencijos pasiekimą</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="competency-subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Dalykas
                    </label>
                    <select
                      id="competency-subject"
                      name="subject"
                      value={competencyFormData.subject}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pasirinkite dalyką...</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.subject_name || subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="competency-competency" className="block text-sm font-medium text-gray-700 mb-2">
                      Kompetencija *
                    </label>
                    <select
                      id="competency-competency"
                      name="competency"
                      value={competencyFormData.competency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pasirinkite kompetenciją</option>
                      {competencies.map((competency) => (
                        <option key={competency.id} value={competency.id}>
                          {competency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dorybės *
                  </label>
                  <MultiSelect
                    options={virtues.map((virtue) => ({
                      id: virtue.id,
                      name: virtue.name
                    }))}
                    selectedValues={competencyFormData.virtues}
                    onChange={(virtues) => setCompetencyFormData(prev => ({ ...prev, virtues }))}
                    placeholder="Pasirinkite dorybes..."
                  />
                </div>

                <div>
                  <DynamicList
                    label="Konkrečių veiksmų sąrašas"
                    values={competencyFormData.todos}
                    onChange={(todos) => setCompetencyFormData(prev => ({ ...prev, todos }))}
                    placeholder="Įveskite veiksmą"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCompetencyFormData({
                    subject: '',
                    competency: '',
                    virtues: [],
                    todos: []
                  })}
                >
                  Išvalyti
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateCompetency}
                  disabled={!competencyFormData.competency || competencyFormData.virtues.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Sukurti BUP kompetenciją
                </Button>
              </div>
            </div>

            {/* CompetencyAtcheves List */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Kompetencijų pasiekimų sąrašas</h4>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 rounded-md">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Dalykas
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Kompetencija
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Dorybės
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Konkrečių veiksmų sąrašas
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Veiksmai
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCompetencyAtcheves.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            {competencyFormData.subject ? 'Nėra kompetencijų pasiekimų šiam dalykui' : 'Nėra sukurtų kompetencijų pasiekimų'}
                          </td>
                        </tr>
                      ) : (
                        filteredCompetencyAtcheves.map((atcheve) => (
                          <tr key={atcheve.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              {getSubjectName(atcheve.subject)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              {atcheve.competency_name}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              {atcheve.virtues_names?.join(', ') || '-'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              {(() => {
                                try {
                                  const todosArray = JSON.parse(atcheve.todos || '[]');
                                  return Array.isArray(todosArray) ? todosArray.join(', ') : atcheve.todos || '-';
                                } catch {
                                  return atcheve.todos || '-';
                                }
                              })()}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCompetency(atcheve.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Ištrinti
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Uždaryti
          </Button>
        </div>
      </div>

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
