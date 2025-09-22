// frontend/src/components/forms/LessonForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Skill, CompetencyAtcheve } from '@/lib/types';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import MultiSelect from '@/components/ui/MultiSelect';
import DynamicList from '@/components/ui/DynamicList';
import LessonSkillModal from '@/components/ui/LessonSkillModal';
import LessonCompetencyModal from '@/components/ui/LessonCompetencyModal';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import Link from 'next/link';
import { 
  lessonsAPI, 
  virtuesAPI, 
  levelsAPI, 
  skillsAPI, 
  competencyAtcheveAPI,
  mentorSubjectsAPI 
} from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useModals } from '@/hooks/useModals';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import NotificationModal from '@/components/ui/NotificationModal';

// Form data interface
export interface LessonFormData {
  title: string;
  content: string;
  subject: string;
  topic: string;
  objectives: string[];
  components: string[];
  skills: string[];
  virtues: string[];
  levels: string[];
  focus: string[];
  slenkstinis: string;
  bazinis: string;
  pagrindinis: string;
  aukstesnysis: string;
  competency_atcheve: string[];
}

// Props interface
interface LessonFormProps {
  mode: 'create' | 'edit' | 'copy';
  lessonId?: number;
  initialData?: Partial<LessonFormData>;
  onCancel?: () => void;
  onSuccess?: (lessonId: number) => void;
}

export default function LessonForm({ 
  mode, 
  lessonId, 
  initialData, 
  onCancel, 
  onSuccess 
}: LessonFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLesson, setIsLoadingLesson] = useState(mode !== 'create');

  // Modal hooks
  const {
    confirmationModal,
    closeConfirmation,
    notificationModal,
    closeNotification,
    showError,
    showWarning
  } = useModals();
  
  // Dropdown data
  const [subjects, setSubjects] = useState<{ id: number; subject_name: string; name: string; description: string; mentor_subject_id: number }[]>([]);
  const [virtues, setVirtues] = useState([]);
  const [levels, setLevels] = useState([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [competencyAtcheves, setCompetencyAtcheves] = useState<CompetencyAtcheve[]>([]);
  
  // Modal states
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isCompetencyAtcheveModalOpen, setIsCompetencyAtcheveModalOpen] = useState(false);
  
  // Main form data
  const [formData, setFormData] = useState<LessonFormData>({
    title: '',
    content: '',
    subject: '',
    topic: '',
    objectives: [],
    components: [],
    skills: [],
    virtues: [],
    levels: [],
    focus: [],
    slenkstinis: '',
    bazinis: '',
    pagrindinis: '',
    aukstesnysis: '',
    competency_atcheve: []
  });

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [subjectsRes, virtuesRes, levelsRes, skillsRes, competencyAtchevesRes] = await Promise.all([
          mentorSubjectsAPI.mySubjects(),
          virtuesAPI.getAll(),
          levelsAPI.getAll(),
          skillsAPI.getAll(),
          competencyAtcheveAPI.getAll()
        ]);
        
        setSubjects(subjectsRes.data);
        setVirtues(virtuesRes.data);
        setLevels(levelsRes.data);
        setSkills(skillsRes.data);
        setCompetencyAtcheves(competencyAtchevesRes.data);
      } catch (error) {
        console.error('Error loading dropdown data:', error);
      }
    };

    loadDropdownData();
  }, []);

  // Load lesson data for edit/copy modes
  useEffect(() => {
    const loadLessonData = async () => {
      if (mode === 'create' || !lessonId) return;
      
      try {
        setIsLoadingLesson(true);
        
        const lessonRes = await lessonsAPI.getById(lessonId);
        const lesson = lessonRes.data;
        
        // Prepare form data
        const formDataToSet: LessonFormData = {
          title: mode === 'copy' ? '' : (lesson.title || ''), // Clear title for copy mode
          content: lesson.content || '',
          subject: lesson.subject?.id?.toString() || lesson.subject?.toString() || '',
          topic: lesson.topic || '',
          objectives: lesson.objectives_list || [],
          components: lesson.components_list || [],
          slenkstinis: lesson.slenkstinis || '',
          bazinis: lesson.bazinis || '',
          pagrindinis: lesson.pagrindinis || '',
          aukstesnysis: lesson.aukstesnysis || '',
          skills: Array.isArray(lesson.skills_list) 
            ? lesson.skills_list.map((skill: number | { id: number; code: string; name: string }) => 
                typeof skill === 'number' ? skill.toString() : skill.id?.toString() || ''
              ).filter((id: string) => id !== '')
            : [],
          competency_atcheve: lesson.competency_atcheves?.map((id: number) => id?.toString() || '') || [],
          virtues: Array.isArray(lesson.virtues_names) && Array.isArray(virtues)
            ? lesson.virtues_names.map((virtueName: string) => {
                const virtue = (virtues as { id: number; name: string }[]).find((v) => v.name === virtueName);
                return virtue ? virtue.id.toString() : '';
              }).filter((id: string) => id !== '')
            : [],
          levels: Array.isArray(lesson.levels_names) && Array.isArray(levels)
            ? lesson.levels_names.map((levelName: string) => {
                const level = (levels as { id: number; name: string }[]).find((l) => l.name === levelName);
                return level ? level.id.toString() : '';
              }).filter((id: string) => id !== '')
            : [],
          focus: lesson.focus_list || []
        };
        
        setFormData(formDataToSet);
      } catch (error) {
        console.error('Error loading lesson data:', error);
        showError('Nepavyko užkrauti pamokos duomenų');
      } finally {
        setIsLoadingLesson(false);
      }
    };

    loadLessonData();
  }, [mode, lessonId, virtues, levels, showError]);

  // Apply initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Input change handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Modal handlers
  const handleSkillCreated = async () => {
    try {
      // Refresh skills list
      const skillsRes = await skillsAPI.getAll();
      setSkills(skillsRes.data);
    } catch (error) {
      console.error('Error refreshing skills:', error);
    }
  };

  const handleCompetencyCreated = async () => {
    try {
      // Refresh competencyAtcheves list
      const competencyAtchevesRes = await competencyAtcheveAPI.getAll();
      setCompetencyAtcheves(competencyAtchevesRes.data);
    } catch (error) {
      console.error('Error refreshing competencyAtcheves:', error);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.subject) {
      showWarning('Prašome pasirinkti dalyką');
      return;
    }
    
    if (!formData.title || formData.title.trim() === '') {
      showWarning('Prašome įvesti pamokos pavadinimą');
      return;
    }
    
    // Validate arrays
    if (!Array.isArray(formData.skills)) {
      console.error('Skills is not an array:', formData.skills);
      showError('Klaida: gebėjimų duomenys neteisingi');
      return;
    }
    
    if (!Array.isArray(formData.virtues)) {
      console.error('Virtues is not an array:', formData.virtues);
      showError('Klaida: dorybių duomenys neteisingi');
      return;
    }
    
    if (!Array.isArray(formData.levels)) {
      console.error('Levels is not an array:', formData.levels);
      showError('Klaida: lygių duomenys neteisingi');
      return;
    }
    
    if (!Array.isArray(formData.competency_atcheve)) {
      console.error('Competency atcheve is not an array:', formData.competency_atcheve);
      showError('Klaida: kompetencijų duomenys neteisingi');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Clean and prepare lesson data
      const cleanArray = (arr: unknown[]) => {
        if (!Array.isArray(arr)) return [];
        return arr.filter(item => item != null && item !== '' && item !== undefined);
      };
      
      const validateAndParseIds = (arr: unknown[], fieldName: string) => {
        const cleaned = cleanArray(arr);
        const parsed = cleaned.map(id => {
          const parsedId = parseInt(String(id));
          if (isNaN(parsedId) || parsedId <= 0) {
            console.error(`Invalid ID in ${fieldName}:`, id);
            return null;
          }
          return parsedId;
        }).filter(id => id !== null);
        
        return parsed;
      };
      
      // Prepare lesson data
      const lessonData = {
        title: formData.title,
        content: formData.content,
        subject: parseInt(formData.subject),
        topic: formData.topic || '',
        objectives: JSON.stringify(formData.objectives),
        components: JSON.stringify(formData.components),
        slenkstinis: formData.slenkstinis,
        bazinis: formData.bazinis,
        pagrindinis: formData.pagrindinis,
        aukstesnysis: formData.aukstesnysis,
        skills: validateAndParseIds(formData.skills, 'skills'),
        competency_atcheves: validateAndParseIds(formData.competency_atcheve, 'competency_atcheve'),
        virtues: validateAndParseIds(formData.virtues, 'virtues'),
        levels: validateAndParseIds(formData.levels, 'levels'),
        focus: JSON.stringify(formData.focus)
      };
      
      let response;
      if (mode === 'create' || mode === 'copy') {
        response = await lessonsAPI.create(lessonData);
      } else {
        response = await lessonsAPI.update(lessonId!, lessonData);
      }
      
      // Handle success
      // For copy mode, always redirect to lessons list
      if (mode === 'copy') {
        router.push('/mentors/lessons');
      } else if (onSuccess) {
        onSuccess(response.data.id);
      } else {
        router.push('/mentors/lessons');
      }
    } catch (error: unknown) {
      console.error('Error saving lesson:', error);
      const axiosError = error as { response?: { data?: unknown; status?: number }; message?: string };
      console.error('Error response:', axiosError.response?.data);
      console.error('Error status:', axiosError.response?.status);
      console.error('Error message:', axiosError.message);
      
      // Show more detailed error information
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data as Record<string, unknown>;
        console.error('Detailed error data:', errorData);
        
        // Check for specific field errors
        if (errorData.skills) {
          console.error('Skills error:', errorData.skills);
          showError(`Klaida su gebėjimais: ${JSON.stringify(errorData.skills)}`);
        } else if (errorData.non_field_errors) {
          const errors = Array.isArray(errorData.non_field_errors) 
            ? (errorData.non_field_errors as string[]).join(', ')
            : String(errorData.non_field_errors);
          showError(`Bendroji klaida: ${errors}`);
        } else {
          showError(`Nepavyko išsaugoti pamokos. Klaida: ${JSON.stringify(errorData)}`);
        }
      } else {
        showError('Nepavyko išsaugoti pamokos');
      }
    } finally {
      setIsLoading(false);
    }
  };;

  // Loading state
  if (isLoadingLesson) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Get page title based on mode
  const getPageTitle = () => {
    switch (mode) {
      case 'create': return 'Sukurti naują pamoką';
      case 'edit': return 'Redaguoti pamoką';
      case 'copy': return 'Kopijuoti pamoką';
      default: return 'Pamokos forma';
    }
  };

  // Get submit button text based on mode
  const getSubmitButtonText = () => {
    switch (mode) {
      case 'create': return 'Sukurti pamoką';
      case 'edit': return 'Išsaugoti pakeitimus';
      case 'copy': return 'Sukurti kopiją';
      default: return 'Išsaugoti';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/mentors/lessons">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Grįžti
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Pamokos informacija</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information - One row with 3 fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Dalykas *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-12"
                  required
                >
                  <option value="">Pasirinkite dalyką *</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.subject_name || subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Pamokos pavadinimas *
                </label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Įveskite pamokos pavadinimą"
                  required
                  className="w-full h-12 px-6"
                />
              </div>

              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                  Tema
                </label>
                <Input
                  id="topic"
                  name="topic"
                  type="text"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="Įveskite pamokos temą"
                  className="w-full h-12 px-6"
                />
              </div>
            </div>

            <div>
              <DynamicList
                label="Komponentai"
                values={formData.components}
                onChange={(values) => setFormData(prev => ({ ...prev, components: values }))}
                placeholder="Įveskite komponentą"
              />
            </div>

            <div>
              <DynamicList
                label="Pamokos tikslai"
                values={formData.objectives}
                onChange={(values) => setFormData(prev => ({ ...prev, objectives: values }))}
                placeholder="Įveskite tikslą. Ką turi įsisavinti mokiniai?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pasiekimo lygiai
              </label>
              <div className="border border-gray-300 rounded-md p-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="slenkstinis" className="block text-sm font-medium text-gray-700 mb-2">
                      S: Slenkstinis
                    </label>
                    <Input
                      id="slenkstinis"
                      name="slenkstinis"
                      type="text"
                      value={formData.slenkstinis}
                      onChange={handleInputChange}
                      placeholder="Įveskite slenkstinio lygio reikalavimus"
                      className="w-full h-12 px-6"
                    />
                  </div>

                  <div>
                    <label htmlFor="bazinis" className="block text-sm font-medium text-gray-700 mb-2">
                      B: Bazinis
                    </label>
                    <Input
                      id="bazinis"
                      name="bazinis"
                      type="text"
                      value={formData.bazinis}
                      onChange={handleInputChange}
                      placeholder="Įveskite bazinio lygio reikalavimus"
                      className="w-full h-12 px-6"
                    />
                  </div>

                  <div>
                    <label htmlFor="pagrindinis" className="block text-sm font-medium text-gray-700 mb-2">
                      P: Pagrindinis
                    </label>
                    <Input
                      id="pagrindinis"
                      name="pagrindinis"
                      type="text"
                      value={formData.pagrindinis}
                      onChange={handleInputChange}
                      placeholder="Įveskite pagrindinio lygio reikalavimus"
                      className="w-full h-12 px-6"
                    />
                  </div>

                  <div>
                    <label htmlFor="aukstesnysis" className="block text-sm font-medium text-gray-700 mb-2">
                      A: Aukštesnysis
                    </label>
                    <Input
                      id="aukstesnysis"
                      name="aukstesnysis"
                      type="text"
                      value={formData.aukstesnysis}
                      onChange={handleInputChange}
                      placeholder="Įveskite aukštesniojo lygio reikalavimus"
                      className="w-full h-12 px-6"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gebėjimai
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <MultiSelect
                      options={skills
                        .filter(skill => !formData.subject || skill.subject === parseInt(formData.subject))
                        .map(skill => ({
                          id: skill.id,
                          name: `${skill.code} - ${skill.name}`
                        }))}
                      selectedValues={formData.skills}
                      onChange={(values) => setFormData(prev => ({ ...prev, skills: values }))}
                      placeholder="Pasirinkite gebėjimus..."
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSkillModalOpen(true)}
                    className="flex items-center space-x-1 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Modifikuoti</span>
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BUP Kompetencijos
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <MultiSelect
                      options={competencyAtcheves
                        .filter(atcheve => !formData.subject || atcheve.subject === parseInt(formData.subject))
                        .map(atcheve => ({
                          id: atcheve.id,
                          name: `${atcheve.competency_name} - ${atcheve.virtues_names.join(', ')}`
                        }))}
                      selectedValues={formData.competency_atcheve}
                      onChange={(values) => setFormData(prev => ({ 
                        ...prev, 
                        competency_atcheve: values 
                      }))}
                      placeholder="Pasirinkite kompetencijos pasiekimą..."
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCompetencyAtcheveModalOpen(true)}
                    className="flex items-center space-x-1 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Modifikuoti</span>
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <DynamicList
                label="Fokusas veiksmai"
                values={formData.focus}
                onChange={(values) => setFormData(prev => ({ ...prev, focus: values }))}
                placeholder="Įveskite fokusą"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <MultiSelect
                  label="Mokymo lygiai"
                  options={levels.map((level: { id: number; name: string }) => ({
                    id: level.id,
                    name: level.name
                  }))}
                  selectedValues={formData.levels}
                  onChange={(values) => setFormData(prev => ({ ...prev, levels: values }))}
                  placeholder="Pasirinkite mokymo lygius..."
                />
              </div>

              <div>
                <MultiSelect
                  label="Dorybės"
                  options={virtues.map((virtue: { id: number; name: string }) => ({
                    id: virtue.id,
                    name: virtue.name
                  }))}
                  selectedValues={formData.virtues}
                  onChange={(values) => setFormData(prev => ({ ...prev, virtues: values }))}
                  placeholder="Pasirinkite dorybes..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Mokomoji medžiaga
              </label>
              <textarea
                id="content"
                name="content"
                rows={6}
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Įveskite mokomąją medžiagą..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              {onCancel ? (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Atšaukti
                </Button>
              ) : (
                <Link href="/mentors/lessons">
                  <Button type="button" variant="outline">
                    Atšaukti
                  </Button>
                </Link>
              )}
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kuriama...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {getSubmitButtonText()}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Skill Creation Modal */}
      <LessonSkillModal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        onSkillCreated={handleSkillCreated}
        subjects={subjects}
      />

      {/* CompetencyAtcheve Creation Modal */}
      <LessonCompetencyModal
        isOpen={isCompetencyAtcheveModalOpen}
        onClose={() => setIsCompetencyAtcheveModalOpen(false)}
        onCompetencyCreated={handleCompetencyCreated}
        subjects={subjects}
      />

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
