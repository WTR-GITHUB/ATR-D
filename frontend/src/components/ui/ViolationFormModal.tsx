// /home/vilkas/atradimai/dienynas/frontend/src/components/ui/ViolationFormModal.tsx

// Modal komponentas pažeidimų/skolų priskyrimui
// Leidžia pasirinkti studentus, kategoriją, tipą ir nustatyti pažeidimo duomenis
// CHANGE: Sukurtas naujas modal komponentas pažeidimų priskyrimui su form validacija

'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Users, Tag, FileText, Euro, Calendar } from 'lucide-react';
import { violationAPI, usersAPI } from '@/lib/api';
import MultiSelect from './MultiSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import Input from './Input';
import { Textarea } from './Textarea';
import { ViolationFormData, ViolationCategory, ViolationType, User } from '@/lib/types';

interface ViolationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ViolationFormModal: React.FC<ViolationFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  // Form state
  const [formData, setFormData] = useState<ViolationFormData>({
    students: [],
    category: '',
    violation_type: '',
    description: '',
    amount: 0,
    currency: 'EUR',
    notes: ''
  });

  // Data state
  const [students, setStudents] = useState<User[]>([]);
  const [categories, setCategories] = useState<ViolationCategory[]>([]);
  const [types, setTypes] = useState<ViolationType[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // Load types when category changes
  useEffect(() => {
    if (formData.category) {
      loadTypes(formData.category);
    } else {
      setTypes([]);
      setFormData(prev => ({ ...prev, violation_type: '' }));
    }
  }, [formData.category]);

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

  const loadTypes = async (categoryId: string) => {
    try {
      const typesResponse = await violationAPI.types.getAll({ category: categoryId });
      setTypes(typesResponse.data);
    } catch (error) {
      console.error('Error loading types:', error);
      setTypes([]);
    }
  };

  const handleInputChange = (field: keyof ViolationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (formData.students.length === 0) {
      newErrors.students = 'Turi būti pasirinktas bent vienas mokinys';
    }

    if (!formData.category) {
      newErrors.category = 'Turi būti pasirinkta kategorija';
    }

    if (!formData.violation_type) {
      newErrors.violation_type = 'Turi būti pasirinktas pažeidimo tipas';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Aprašymas yra privalomas';
    }

    if (formData.amount < 0) {
      newErrors.amount = 'Suma negali būti neigiama';
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

      // Create violations for each selected student
      const promises = formData.students.map(studentId => 
        violationAPI.violations.create({
          student: studentId,
          category: formData.category,
          violation_type: formData.violation_type,
          description: formData.description,
          amount: formData.amount,
          currency: formData.currency,
          notes: formData.notes
        })
      );

      await Promise.all(promises);

      // Reset form
      setFormData({
        students: [],
        category: '',
        violation_type: '',
        description: '',
        amount: 0,
        currency: 'EUR',
        notes: ''
      });

      onSuccess?.();
      onClose();

    } catch (error: any) {
      console.error('Error creating violations:', error);
      
      if (error.response?.data) {
        const apiErrors = error.response.data;
        const newErrors: { [key: string]: string } = {};
        
        // Map API errors to form fields
        Object.keys(apiErrors).forEach(key => {
          if (Array.isArray(apiErrors[key])) {
            newErrors[key] = apiErrors[key][0];
          } else {
            newErrors[key] = apiErrors[key];
          }
        });
        
        setErrors(newErrors);
      } else {
        setErrors({ general: 'Nepavyko sukurti pažeidimų' });
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
        violation_type: '',
        description: '',
        amount: 0,
        currency: 'EUR',
        notes: ''
      });
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
                Skirti skolą
              </h2>
              <p className="text-sm text-gray-500">
                Sukurti naują pažeidimą mokiniams
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

            {/* Students Selection */}
            <div>
              <MultiSelect
                label="Mokiniai *"
                options={students.map(student => ({
                  id: student.id,
                  name: student.get_full_name || `${student.first_name} ${student.last_name}`
                }))}
                selectedValues={formData.students.map(id => id.toString())}
                onChange={(values) => handleInputChange('students', values.map(v => parseInt(v)))}
                placeholder="Pasirinkite mokinius..."
                className="w-full"
              />
              {errors.students && (
                <p className="mt-1 text-sm text-red-600">{errors.students}</p>
              )}
            </div>

            {/* Category and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pažeidimo tipas *
                </label>
                <Select
                  value={formData.violation_type}
                  onValueChange={(value) => handleInputChange('violation_type', value)}
                  disabled={!formData.category}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pasirinkite tipą..." />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.violation_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.violation_type}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aprašymas *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Aprašykite pažeidimą..."
                rows={3}
                className="w-full"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Suma (€)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  leftIcon={<Euro className="w-4 h-4" />}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valiuta
                </label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="LTL">LTL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pastabos
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Papildomos pastabos..."
                rows={2}
                className="w-full"
              />
            </div>

            {/* Date Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">
                    Automatinis datos nustatymas
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Pažeidimo data bus automatiškai nustatyta į šiandienos datą
                  </p>
                </div>
              </div>
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
              {isSubmitting ? 'Kuriama...' : 'Sukurti pažeidimą'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ViolationFormModal;
