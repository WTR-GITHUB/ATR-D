// /home/vilkas/atradimai/dienynas/frontend/src/components/ui/ViolationFormModal.tsx

// Modal komponentas pažeidimų/skolų priskyrimui
// Leidžia pasirinkti studentus, kategoriją, tipą ir nustatyti pažeidimo duomenis
// CHANGE: Sukurtas naujas modal komponentas pažeidimų priskyrimui su form validacija

'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { violationAPI, usersAPI } from '@/lib/api';
import MultiSelect from './MultiSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import Input from './Input';
import { Textarea } from './Textarea';
import { ViolationFormData, ViolationCategory, User, Violation } from '@/lib/types';
import DynamicList from './DynamicList';

interface ViolationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editMode?: boolean;        // NEW: Edit mode flag
  initialData?: Violation;   // NEW: Initial data for editing
  violationId?: number;      // NEW: Violation ID for editing
}

const ViolationFormModal: React.FC<ViolationFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editMode = false,
  initialData,
  violationId
}) => {
  // Form state
  const [formData, setFormData] = useState<ViolationFormData>({
    students: [],
    category: '',
    todos: [],
    description: '',
    notes: ''
  });
  
  // Date state
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Data state
  const [students, setStudents] = useState<User[]>([]);
  const [categories, setCategories] = useState<ViolationCategory[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  

  // CHANGE: Function to populate form with initial data for editing
  const populateFormWithInitialData = React.useCallback((violation: Violation) => {
    // CHANGE: violation.category is a category NAME (string), need to find the ID
    const categoryItem = categories.find(cat => cat.name === violation.category);
    const categoryId = categoryItem ? categoryItem.id.toString() : '';
    
    
    setFormData({
      students: violation.student ? [violation.student] : [],
      category: categoryId, // Use category ID found by name
      todos: violation.todos ? violation.todos.map((todo: { text: string }) => todo.text) : [],
      description: violation.description || '',
      notes: violation.notes || ''
    });
    
    // Set the date from violation
    if (violation.created_at) {
      const date = new Date(violation.created_at);
      setSelectedDate(date.toISOString().split('T')[0]);
    }
  }, [categories]);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // CHANGE: Separate effect to populate form after categories are loaded
  useEffect(() => {
    if (editMode && initialData && categories.length > 0) {
      populateFormWithInitialData(initialData);
    }
  }, [editMode, initialData, categories, populateFormWithInitialData]);


  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      // Load students (only those with student role)
      const studentsResponse = await usersAPI.getAll({ role: 'student' });
      setStudents(studentsResponse.data);

      // Load categories
      const categoriesResponse = await violationAPI.categories.getAll();
      setCategories(categoriesResponse.data);

    } catch (error) {
      console.error('Error loading initial data:', error);
      setErrors({ general: 'Nepavyko užkrauti duomenų' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ViolationFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // CHANGE: Always require students selection, even in edit mode
    if (formData.students.length === 0) {
      newErrors.students = 'Turi būti pasirinktas bent vienas mokinys';
    }

    if (!formData.category) {
      newErrors.category = 'Turi būti pasirinkta kategorija';
    }

    if (formData.todos.length === 0) {
      newErrors.todos = 'Turi būti pridėta bent viena užduotis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Aprašymas yra privalomas';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      // Find category name by ID
      const categoryName = categories.find(cat => cat.id.toString() === formData.category)?.name || formData.category;

      if (editMode && violationId) {
        // CHANGE: Edit mode - update existing violation
        // Note: In edit mode, we update the existing violation with the first selected student
        // If multiple students are selected, we could create additional violations
        await violationAPI.violations.update(violationId, {
          student: formData.students[0], // Use first selected student
          category: categoryName, // Send category name, not ID
          todos: formData.todos.map((text, index) => ({
            id: `todo_${Date.now()}_${index}`,
            text: text,
            completed: false,
            created_at: selectedDate
          })),
          description: formData.description,
          notes: formData.notes
        });
        
        // CHANGE: If multiple students selected in edit mode, create additional violations
        if (formData.students.length > 1) {
          const additionalStudents = formData.students.slice(1);
          const promises = additionalStudents.map(studentId => {
            return violationAPI.violations.create({
              student: studentId,
              category: categoryName,
              todos: formData.todos.map((text, index) => ({
                id: `todo_${Date.now()}_${index}`,
                text: text,
                completed: false,
                created_at: selectedDate
              })),
              description: formData.description,
              notes: formData.notes
            });
          });
          await Promise.all(promises);
        }
      } else {
        // Create mode - create violations for each selected student
        const promises = formData.students.map(studentId => {
          return violationAPI.violations.create({
            student: studentId,
            category: categoryName, // Send category name, not ID
            todos: formData.todos.map((text, index) => ({
              id: `todo_${Date.now()}_${index}`,
              text: text,
              completed: false,
              created_at: selectedDate
            })),
            description: formData.description
          });
        });

        await Promise.all(promises);
      }

      // Reset form
      setFormData({
        students: [],
        category: '',
        todos: [],
        description: '',
        notes: ''
      });
      setSelectedDate(new Date().toISOString().split('T')[0]);

      onSuccess?.();
      onClose();

    } catch (error: unknown) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} violations:`, error);
      
      if ((error as { response?: { data?: unknown } }).response?.data) {
        const apiErrors = (error as { response: { data: Record<string, unknown> } }).response.data;
        const newErrors: { [key: string]: string } = {};
        
        // Map API errors to form fields
        Object.keys(apiErrors).forEach(key => {
          if (Array.isArray(apiErrors[key])) {
            newErrors[key] = apiErrors[key][0];
          } else {
            newErrors[key] = String(apiErrors[key]);
          }
        });
        
        setErrors(newErrors);
      } else {
        setErrors({ general: `Nepavyko ${editMode ? 'atnaujinti' : 'sukurti'} pažeidimų` });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        students: [],
        category: '',
        todos: [],
        description: '',
        notes: ''
      });
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setErrors({});
      onClose();
    }
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
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editMode ? 'Redaguoti skolą' : 'Skirti skolą'}
              </h2>
              <p className="text-sm text-gray-500">
                {editMode ? 'Redaguoti esamą pažeidimą' : 'Sukurti naują pažeidimą mokiniams'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh]">
          <div className="p-6 space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aprašymas *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Įveskite pažeidimo aprašymą..."
                className="w-full"
                rows={3}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Students Selection */}
            <div>
              <MultiSelect
                label={editMode ? "Mokiniai *" : "Mokiniai *"}
                options={students.map(student => ({
                  id: student.id,
                  name: `${student.first_name} ${student.last_name}`
                }))}
                selectedValues={formData.students.map(id => id.toString())}
                onChange={(values) => handleInputChange('students', values.map(v => parseInt(v)))}
                placeholder={editMode ? "Pasirinkite mokinius..." : "Pasirinkite mokinius..."}
                className="w-full"
                // CHANGE: Allow editing students in edit mode
              />
              {errors.students && (
                <p className="mt-1 text-sm text-red-600">{errors.students}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorija *
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pasirinkite kategoriją..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Todos */}
            <div>
              <DynamicList
                label="Užduočių sąrašas *"
                values={formData.todos}
                onChange={(values) => handleInputChange('todos', values)}
                placeholder="Įveskite užduotį..."
                className="w-full"
              />
              {errors.todos && (
                <p className="mt-1 text-sm text-red-600">{errors.todos}</p>
              )}
            </div>


            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>

          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50 space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Atšaukti
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isSubmitting 
                ? (editMode ? 'Atnaujinama...' : 'Kuriama...') 
                : (editMode ? 'Atnaujinti pažeidimą' : 'Sukurti pažeidimą')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ViolationFormModal;
