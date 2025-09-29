// frontend/src/app/mentors/plans/edit/[id]/page.tsx

// Ugdymo plano redagavimo puslapis mentoriams
// Leidžia mentoriams redaguoti esamas pamokų sekas
// CHANGE: Ištaisytas duomenų struktūros neatitikimas - items dabar siunčiami kaip ID sąrašas, ne objektų masyvas
// CHANGE: Backend'as automatiškai priskiria pozicijas pagal masyvo indeksą
// CHANGE: Pridėtas saugumo patikrinimas items laukui - naudojamas fallback tuščiam masyvui jei backend'as nepateikia
// CHANGE: Suvienodintas dizainas su create puslapiu - naudojamas LessonDualListTransfer komponentas
// CHANGE: Automatiškai pašalinamos ištrintos pamokos iš plano - nereikia patvirtinimo modalų
// CHANGE: Parodomas įspėjimas apie automatiškai pašalintas pamokas
// ATNAUJINTA LOGIKA (2024-12-19):
// - Perduodamas subjectId ir levelId į LessonDualListTransfer
// - Pašalintas dubliavimasis filtravimas - availableLessons nefiltruojami pagal dalyką/lygį
// - Filtravimas pagal dalyką ir lygį vykdomas tik LessonDualListTransfer komponente
// - Tikrai ištrintos pamokos pašalinamos automatiškai
// - Rodyti įspėjimą tik apie tikrai ištrintas pamokas iš DB
// - Ištaisytas duomenų struktūros neatitikimas - handleLessonSequenceChange naudoja item.lesson

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import LessonDualListTransfer from '@/components/ui/LessonDualListTransfer';
import { Save } from 'lucide-react';
import { useModals } from '@/hooks/useModals';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import NotificationModal from '@/components/ui/NotificationModal';

interface Lesson {
  id: number;
  title: string;
  subject: string;
  levels: string;
  topic: string;
  created_at: string;
}

interface LessonSequenceItem {
  id: number;
  title: string;
  subject: string;
  levels: string;
  topic: string;
  position: number;
}

interface LessonSequenceItemDisplay {
  id: number;
  lesson: number; // Pamokos ID iš backend'o
  title: string;
  subject: string;
  levels: string;
  topic: string;
  position: number;
}

interface Subject {
  id: number;
  name: string;
  description: string;
}

interface Level {
  id: number;
  name: string;
  description: string;
}

interface LessonSequence {
  id: number;
  name: string;
  description: string;
  subject: number;
  level: number;
  is_active: boolean;
  created_at: string;
  items: Array<{
    id: number;
    lesson: number;
    lesson_title: string;
    lesson_subject: string;
    lesson_topic: string;
    position: number;
  }>;
}

// API funkcijos
import api from '@/lib/api';

async function fetchMentorLessons(subjectId?: string, levelId?: string): Promise<Lesson[]> {
  let url = '/plans/sequences/all_lessons/';
  const params = new URLSearchParams();
  
  if (subjectId) {
    params.append('subject', subjectId);
  }
  if (levelId) {
    params.append('level', levelId);
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await api.get(url);
  return response.data;
}

async function fetchSubjects(): Promise<Subject[]> {
  const response = await api.get('/crm/mentor-subjects/my_subjects/');
  return response.data;
}

async function fetchLevels(): Promise<Level[]> {
  const response = await api.get('/plans/sequences/levels/');
  return response.data;
}

async function fetchPlan(planId: string): Promise<LessonSequence> {
  try {
    const response = await api.get(`/plans/sequences/${planId}/`);
    return response.data;
  } catch (error) {
    console.error('Klaida gaunant planą:', error);
    throw error;
  }
}

import ClientAuthGuard from '@/components/auth/ClientAuthGuard';

export default function EditLessonSequencePage() {
  useAuth(); // ROLE SWITCHING FIX: Iškviečia useAuth hook'ą
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    level: ''
  });

  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<LessonSequenceItemDisplay[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Modal hooks
  const {
    confirmationModal,
    closeConfirmation,
    notificationModal,
    closeNotification,
    showError,
    showWarning
  } = useModals();


  // Gauname duomenis iš API
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingData(true);
        const [lessonsData, subjectsData, levelsData, planData] = await Promise.all([
          fetchMentorLessons(),
          fetchSubjects(),
          fetchLevels(),
          fetchPlan(planId)
        ]);
        
        
        // Užpildome pamokų seką
        // Saugumo patikrinimas - items gali būti undefined jei backend'as nepateikia
        const existingItems: LessonSequenceItemDisplay[] = (planData.items || []).map(item => ({
          id: item.id,
          lesson: item.lesson, // Pamokos ID iš backend'o
          title: item.lesson_title || '',
          subject: item.lesson_subject || '',
          levels: 'Nenurodyta', // Backend'as nepateikia lesson_levels, naudojame default reikšmę
          topic: item.lesson_topic || '',
          position: item.position
        }));
        
        // Nustatome selectedLessons tiesiogiai iš plano duomenų
        // Backend'as jau filtruoja ištrintas pamokas
        if (existingItems && existingItems.length > 0) {
          setSelectedLessons(existingItems);
        } else {
          setSelectedLessons([]);
        }

        
        
        setAvailableLessons(lessonsData);
        setSubjects(subjectsData);
        setLevels(levelsData);

        // Užpildome formą esamais duomenimis
        setFormData({
          name: planData.name || '',
          description: planData.description || '',
          subject: planData.subject?.toString() || '',
          level: planData.level?.toString() || ''
        });
      } catch (error: unknown) {
        console.error('Klaida gaunant duomenis:', error);
        let errorMessage = 'Įvyko klaida gaunant duomenis';
        const axiosError = error as { response?: { data?: unknown } };
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData && typeof errorData === 'object' && 'detail' in errorData) {
            errorMessage = (errorData as { detail: string }).detail;
          }
        }
        showError(errorMessage);
      } finally {
        setIsLoadingData(false);
      }
    }

    if (planId) {
      loadData();
    }
  }, [planId, showError]);

  // NEPERKRAUNIAME availableLessons kai keičiasi dalykas/lygis
  // Filtravimas vykdomas LessonDualListTransfer komponente

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle lesson sequence changes from the dual list component
  const handleLessonSequenceChange = (selected: Record<string, unknown>[] | LessonSequenceItem[]) => {
    
    // Type guard to ensure we have LessonSequenceItemDisplay[]
    const lessonItems = selected.map(item => {
      // Debug logging
      
      // Check if item already has lesson field (from LessonSequenceItemDisplay)
      const lessonId = (item as Record<string, unknown>).lesson 
        ? Number((item as Record<string, unknown>).lesson)
        : Number(item.id); // Fallback to id for LessonSequenceItem
      
      const result = {
        id: Number(item.id),
        lesson: lessonId, // Use lesson field if available, fallback to id
        title: String(item.title),
        subject: String(item.subject),
        levels: String(item.levels || 'Nenurodyta'),
        topic: String(item.topic),
        position: Number(item.position) || 0
      };
      
      return result;
    }) as LessonSequenceItemDisplay[];
    
    setSelectedLessons(lessonItems);
  };



  const handleSubmit = async () => {
    if (!formData.name || !formData.subject || !formData.level) {
      showWarning('Prašome užpildyti visus privalomus laukus');
      return;
    }

    if (selectedLessons.length === 0) {
      showWarning('Prašome pridėti bent vieną pamoką į seką');
      return;
    }

    // Automatiškai išfiltruojame ištrintas pamokas prieš išsaugant
    const validLessons = selectedLessons.filter(item => 
      availableLessons.some(lesson => lesson.id === item.lesson)
    );
    
    if (validLessons.length === 0) {
      showWarning('Po ištrintų pamokų pašalinimo, plane nebeliko jokių pamokų. Prašome pridėti naujų pamokų.');
      return;
    }
    
    // Atnaujiname selectedLessons su galiojančiomis pamokomis
    if (validLessons.length !== selectedLessons.length) {
      const removedCount = selectedLessons.length - validLessons.length;
      setSelectedLessons(validLessons);
      
      // Parodyti pranešimą apie automatiškai pašalintas pamokas
      showWarning(`Automatiškai pašalintos ${removedCount} ištrintos pamokos iš plano. Planas bus išsaugotas su galiojančiomis pamokomis.`);
    }

    // Tęsti su išsaugojimu
    continueWithSubmission();
  };;

  const continueWithSubmission = async () => {
    // Papildomas patikrinimas - ar visos pamokos turi teisingus ID's
    if (selectedLessons.some(item => !item.id || item.id <= 0)) {
      showError('Kai kurios pamokos neturi teisingų ID. Prašome perkrauti puslapį.');
      return;
    }

    setIsLoading(true);

    try {
      // Paruošiame duomenis API užklausai
      const sequenceData = {
        name: formData.name,
        description: formData.description,
        subject: parseInt(formData.subject),
        level: parseInt(formData.level),
        items: selectedLessons.map(lesson => lesson.lesson) // Siunčiame pamokų ID sąrašą, ne item ID
      };

      // Siunčiame užklausą į backend'ą
      
      const response = await api.put(`/plans/sequences/${planId}/`, sequenceData);

      if (response.status === 200) {
        // Rodyti sėkmės pranešimą
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
        successMessage.innerHTML = `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span>Pamokų seka sėkmingai atnaujinta!</span>
        `;
        document.body.appendChild(successMessage);
        
        // Pašalinti pranešimą po 3 sekundžių
        setTimeout(() => {
          successMessage.remove();
        }, 3000);
        
        // Nukreipti į planų sąrašą po 1 sekundės
        setTimeout(() => {
          router.push('/mentors/plans');
        }, 1000);
      } else {
        throw new Error('Nepavyko atnaujinti pamokų sekos');
      }
    } catch (error: unknown) {
      console.error('Klaida atnaujinant pamokų seką:', error);
      const axiosError = error as { response?: { data?: unknown } };
      
      let errorMessage = 'Įvyko klaida atnaujinant pamokų seką';
      
      // Geresnis klaidų apdorojimas
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (Array.isArray(errorData)) {
          // Jei backend grąžina klaidų sąrašą
          errorMessage = errorData.join('\n');
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData && typeof errorData === 'object' && 'detail' in errorData) {
          errorMessage = (errorData as { detail: string }).detail;
        } else if (errorData && typeof errorData === 'object' && 'error' in errorData) {
          errorMessage = (errorData as { error: string }).error;
        }
      }
      
      // Specialus pranešimas apie ištrintas pamokas
      if (errorMessage.includes('yra ištrintos')) {
        errorMessage = 'Kai kurios pamokos yra ištrintos ir negali būti naudojamos. ' +
                      'Prašome pašalinti jas iš plano ir bandyti iš naujo.';
      }
      
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };;

  if (isLoadingData) {
    return (
      <ClientAuthGuard requireAuth={true} allowedRoles={['mentor']}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Kraunama...</p>
          </div>
        </div>
      </ClientAuthGuard>
    );
  }

  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['mentor']}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900">Redaguoti ugdymo planą</h1>
      </div>

      <form className="space-y-6">
        {/* Pagrindinė informacija */}
        <Card>
          <CardHeader>
            <CardTitle>Pagrindinė informacija</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pavadinimas *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Įveskite ugdymo plano pavadinimą"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dalykas *
                </label>
                <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pasirinkite dalyką" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lygis *
                </label>
                <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pasirinkite lygį" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.id} value={level.id.toString()}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aprašymas
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Aprašykite ugdymo planą"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pamokų seka */}
        <Card>
          <CardHeader>
            <CardTitle>Pamokų seka</CardTitle>
            <p className="text-sm text-gray-600">
              Pridėkite pamokas į seką ir nustatykite jų eiliškumą vilkdami bei mesdami
            </p>
          </CardHeader>
          <CardContent>
            {availableLessons.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium">Jūs neturite sukurtų pamokų</p>
                <p className="text-sm mt-2">Pirmiausia sukurkite pamokas, kad galėtumėte jas pridėti į seką</p>
              </div>
            ) : (
              <LessonDualListTransfer
                availableLessons={availableLessons}
                selectedLessons={selectedLessons}
                onSelectionChange={handleLessonSequenceChange}
                availableTitle="Galimos pamokos"
                selectedTitle="Pamokų seka"
                isLoading={isLoadingData}
                showDeletedWarning={true}
                subjectId={formData.subject}
                levelId={formData.level}
                subjects={subjects}
                levels={levels}
              />
            )}
          </CardContent>
        </Card>

        {/* Veiksmai */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              router.push('/mentors/plans');
            }}
          >
            Atšaukti
          </Button>
          <Button
            disabled={isLoading}
            onClick={handleSubmit}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Atnaujinama...' : 'Išsaugoti pakeitimus'}</span>
          </Button>
        </div>
      </form>

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
