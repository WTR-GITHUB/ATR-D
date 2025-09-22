// frontend/src/components/ui/LessonSkillModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { skillsAPI } from '@/lib/api';
import { Skill } from '@/lib/types';

interface LessonSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkillCreated: () => void;
  subjects: { id: number; subject_name: string; name: string; description: string; mentor_subject_id: number }[];
}

/**
 * Gebėjimų modifikavimo modalo komponentas
 * Leidžia kurti, peržiūrėti ir ištrinti gebėjimus
 * 
 * Atnaujinta: Pašalinti nereikalingi elementai - "Išvalyti" mygtukas ir papildomas filtravimo elementas
 * Filtravimas vyksta tik per pagrindinį select elementą su id="skill-subject"
 */
export default function LessonSkillModal({ 
  isOpen, 
  onClose, 
  onSkillCreated,
  subjects 
}: LessonSkillModalProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [skillFormData, setSkillFormData] = useState({
    subject: '',
    code: '',
    name: '',
    description: ''
  });

  // Load skills when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSkills();
    }
  }, [isOpen]);

  const loadSkills = async () => {
    try {
      setIsLoading(true);
      const response = await skillsAPI.getAll();
      setSkills(response.data);
      setFilteredSkills(response.data);
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter skills based on selected subject
  const filterSkills = (subjectId: string) => {
    if (!subjectId) {
      setFilteredSkills(skills);
    } else {
      const filtered = skills.filter(skill => skill.subject === parseInt(subjectId));
      setFilteredSkills(filtered);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSkillFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Filter skills when subject changes
    if (name === 'subject') {
      filterSkills(value);
    }
  };

  const handleCreateSkill = async () => {
    try {
      // Validate required fields
      if (!skillFormData.subject || !skillFormData.code || !skillFormData.name) {
        alert('Prašome užpildyti visus privalomus laukus');
        return;
      }

      const dataToSend = {
        ...skillFormData,
        subject: parseInt(skillFormData.subject)
      };
      
      await skillsAPI.create(dataToSend);
      
      // Refresh skills list
      await loadSkills();
      
      // Reset form
      setSkillFormData({
        subject: '',
        code: '',
        name: '',
        description: ''
      });

      // Reset filter to show all skills
      setFilteredSkills(skills);

      // Notify parent component
      onSkillCreated();
      
      alert('Gebėjimas sėkmingai sukurtas');
    } catch (error) {
      console.error('Error creating skill:', error);
      alert('Nepavyko sukurti gebėjimo');
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    if (!confirm('Ar tikrai norite ištrinti šį gebėjimą?')) {
      return;
    }

    try {
      await skillsAPI.delete(skillId);
      await loadSkills();
      
      // Update filtered skills after deletion
      const updatedSkills = skills.filter(skill => skill.id !== skillId);
      setFilteredSkills(updatedSkills);
      
      alert('Gebėjimas sėkmingai ištrintas');
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Nepavyko ištrinti gebėjimo');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Gebėjimų sąrašas</h3>
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
            {/* Create New Skill Form */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-4">Sukurti naują gebėjimą</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="skill-subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Dalykas *
                  </label>
                  <select
                    id="skill-subject"
                    name="subject"
                    value={skillFormData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pasirinkite dalyką</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.subject_name || subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="skill-code" className="block text-sm font-medium text-gray-700 mb-2">
                    Sutrumpintas kodas *
                  </label>
                  <Input
                    id="skill-code"
                    name="code"
                    type="text"
                    value={skillFormData.code}
                    onChange={handleInputChange}
                    placeholder="Įveskite sutrumpintą kodą"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="skill-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Gebėjimo pavadinimas *
                  </label>
                  <Input
                    id="skill-name"
                    name="name"
                    type="text"
                    value={skillFormData.name}
                    onChange={handleInputChange}
                    placeholder="Įveskite gebėjimo pavadinimą"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="skill-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Aprašymas
                  </label>
                  <textarea
                    id="skill-description"
                    name="description"
                    rows={3}
                    value={skillFormData.description}
                    onChange={handleInputChange}
                    placeholder="Aprašykite gebėjimą..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={handleCreateSkill}
                  disabled={!skillFormData.subject || !skillFormData.code || !skillFormData.name}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Sukurti gebėjimą
                </Button>
              </div>
            </div>

            {/* Skills List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-gray-900">Gebėjimų sąrašas</h4>
              </div>
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
                          Kodas
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Pavadinimas
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Aprašymas
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Veiksmai
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSkills.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            {skills.length === 0 ? 'Nėra sukurtų gebėjimų' : 'Nėra gebėjimų pasirinktam dalykui'}
                          </td>
                        </tr>
                      ) : (
                        filteredSkills.map((skill) => (
                          <tr key={skill.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              {skill.subject_name || 'Nenurodyta'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              {skill.code}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              {skill.name}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              {skill.description || '-'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSkill(skill.id)}
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
    </div>
  );
}