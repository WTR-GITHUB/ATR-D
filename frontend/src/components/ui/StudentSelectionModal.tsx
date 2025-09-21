// /home/vilkas/atradimai/dienynas/frontend/src/components/ui/StudentSelectionModal.tsx

// Modal komponentas mokinių paieškai ir pasirinkimui
// Leidžia pasirinkti vieną ar kelis mokinius iš sąrašo su paieškos funkcionalumu
// CHANGE: Sukurtas naujas modal komponentas mokinių pasirinkimui activities puslapiui

'use client';

import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { usersAPI } from '@/lib/api';
import MultiSelect from './MultiSelect';
import { User } from '@/lib/types';

interface StudentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentsSelected: (students: User[]) => void;
  existingStudents: User[]; // Mokinių sąrašas, kurie jau pridėti
}

const StudentSelectionModal: React.FC<StudentSelectionModalProps> = ({
  isOpen,
  onClose,
  onStudentsSelected,
  existingStudents
}) => {
  // Form state
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load students when modal opens
  useEffect(() => {
    if (isOpen) {
      loadStudents();
    }
  }, [isOpen]);

  // Filter out existing students
  useEffect(() => {
    if (allStudents.length > 0) {
      const existingIds = existingStudents.map(s => s.id);
      const available = allStudents.filter(s => !existingIds.includes(s.id));
      setFilteredStudents(available);
    }
  }, [allStudents, existingStudents]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load students (only those with student role)
      const response = await usersAPI.getAll({ role: 'student' });
      setAllStudents(response.data);

    } catch (error) {
      console.error('Error loading students:', error);
      setError('Nepavyko užkrauti mokinių sąrašo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentsChange = (values: string[]) => {
    setSelectedStudents(values);
  };

  const handleSubmit = () => {
    if (selectedStudents.length === 0) {
      setError('Prašome pasirinkti bent vieną mokinį');
      return;
    }

    // Convert selected IDs back to User objects
    const selectedUserObjects = filteredStudents.filter(student => 
      selectedStudents.includes(student.id.toString())
    );

    onStudentsSelected(selectedUserObjects);
    handleClose();
  };

  const handleClose = () => {
    setSelectedStudents([]);
    setError(null);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Pasirinkti mokinius
              </h2>
              <p className="text-sm text-gray-500">
                Pasirinkite mokinius, kuriuos norite pridėti į pamoką
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[70vh]">
          <div className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <X className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Kraunama mokinių sąrašas...</p>
              </div>
            )}

            {/* Students Selection */}
            {!isLoading && (
              <div>
                <MultiSelect
                  label="Mokiniai *"
                  options={filteredStudents.map(student => ({
                    id: student.id,
                    name: `${student.first_name} ${student.last_name}`
                  }))}
                  selectedValues={selectedStudents}
                  onChange={handleStudentsChange}
                  placeholder="Pasirinkite mokinius..."
                  className="w-full"
                />
                
                {/* Available students count */}
                <div className="mt-2 text-sm text-gray-500">
                  Galimi mokiniai: {filteredStudents.length}
                </div>
              </div>
            )}

            {/* Existing students info */}
            {existingStudents.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Users className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      Jau pridėti mokiniai
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      {existingStudents.length} mokinys jau pridėtas į šią pamoką ir nebus rodomas sąraše
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50 space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Atšaukti
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || selectedStudents.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pridėti mokinius ({selectedStudents.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSelectionModal;
