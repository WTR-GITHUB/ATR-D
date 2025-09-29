// frontend/src/app/mentors/plans/create/page.tsx

// Ugdymo plano kūrimo puslapis mentoriams
// Leidžia mentoriams sukurti pamokų sekas su pasirinktomis pamokomis
// CHANGE: Ištaisytas duomenų struktūros neatitikimas - items dabar siunčiami kaip ID sąrašas, ne objektų masyvas
// CHANGE: Backend'as automatiškai priskiria pozicijas pagal masyvo indeksą

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import LessonDualListTransfer from '@/components/ui/LessonDualListTransfer';
import { ArrowLeft, Save } from 'lucide-react';
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

import ClientAuthGuard from '@/components/auth/ClientAuthGuard';

export default function CreateLessonSequencePage() {
  useAuth(); // ROLE SWITCHING FIX: Iškviečia useAuth hook'ą
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    level: ''
  });

  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<LessonSequenceItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

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

  // Gauname duomenis iš API
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingData(true);
        const [lessonsData, subjectsData, levelsData] = await Promise.all([
          fetchMentorLessons(),
          fetchSubjects(),
          fetchLevels()
        ]);
        
        setAvailableLessons(lessonsData);
        setSubjects(subjectsData);
        setLevels(levelsData);
      } catch (error) {
        console.error('Klaida gaunant duomenis:', error);
        showError('Įvyko klaida gaunant duomenis');
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [showError]);

  // Filter lessons when subject or level changes
  useEffect(() => {
    async function filterLessons() {
      try {
        const filteredLessons = await fetchMentorLessons(formData.subject, formData.level);
        setAvailableLessons(filteredLessons);
      } catch (error) {
        console.error('Klaida filtruojant pamokas:', error);
      }
    }

    // Only filter if we have initial data loaded
    if (!isLoadingData) {
      filterLessons();
    }
  }, [formData.subject, formData.level, isLoadingData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle lesson sequence changes from the dual list component
  const handleLessonSequenceChange = (selected: Record<string, unknown>[] | LessonSequenceItem[]) => {
    // Type guard to ensure we have LessonSequenceItem[]
    const lessonItems = selected.map(item => ({
      id: Number(item.id),
      title: String(item.title),
      subject: String(item.subject),
      levels: String(item.levels),
      topic: String(item.topic),
      position: Number(item.position) || 0
    })) as LessonSequenceItem[];
    
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

    // Patikriname ar visos pamokos egzistuoja availableLessons masyve
    const invalidLessons = selectedLessons.filter(item => 
      !availableLessons.some(lesson => lesson.id === item.id)
    );
    
    if (invalidLessons.length > 0) {
      console.warn(`Rasta ${invalidLessons.length} pamokų, kurios nėra availableLessons masyve:`, invalidLessons);
      
      // Patikriname ar tai ištrintos pamokos
      const deletedLessonIds = invalidLessons.map(lesson => lesson.id);
      console.warn(`Pamokų ID, kurios gali būti ištrintos: ${deletedLessonIds.join(', ')}`);
      
      // Parodyti vartotojui pranešimą apie ištrintas pamokas
      const confirmMessage = `Rasta ${invalidLessons.length} pamokų, kurios gali būti ištrintos arba neegzistuoti.\n\n` +
                           `Ištrintos pamokos bus automatiškai pašalintos iš plano.\n\n` +
                           `Ar norite tęsti?`;
      
      showConfirmation(
        {
          title: 'Patvirtinimas',
          message: confirmMessage,
          confirmText: 'Tęsti',
          cancelText: 'Atšaukti',
          type: 'warning'
        },
        () => {
          // Ištrinti neegzistuojančias pamokas iš selectedLessons
          const validLessons = selectedLessons.filter(lesson => 
            availableLessons.some(available => available.id === lesson.id)
          );
          
          if (validLessons.length === 0) {
            showWarning('Po ištrintų pamokų pašalinimo, plane nebeliko jokių pamokų. Prašome pridėti naujų pamokų.');
            return;
          }
          
          setSelectedLessons(validLessons);
          console.log(`Pašalintos ${invalidLessons.length} ištrintos pamokos. Liko ${validLessons.length} galiojančių pamokų.`);
          
          // Continue with submission
          continueWithSubmission();
        }
      );
      return;
    }

    // Continue with submission if no invalid lessons
    continueWithSubmission();
  };

  const continueWithSubmission = async () => {
    // Ištrinti neegzistuojančias pamokas iš selectedLessons
    const validLessons = selectedLessons.filter(lesson => 
      availableLessons.some(available => available.id === lesson.id)
    );
    
    if (validLessons.length === 0) {
      showWarning('Po ištrintų pamokų pašalinimo, plane nebeliko jokių pamokų. Prašome pridėti naujų pamokų.');
      return;
    }
      
    setSelectedLessons(validLessons);
    console.log(`Išfiltruotos neegzistuojančios pamokos. Liko ${validLessons.length} galiojančių pamokų.`);

    setIsLoading(true);

    try {
      // Paruošiame duomenis API užklausai
      const sequenceData = {
        name: formData.name,
        description: formData.description,
        subject: parseInt(formData.subject),
        level: parseInt(formData.level),
        items: selectedLessons.map(lesson => lesson.id) // Siunčiame tik pamokų ID sąrašą
      };

      console.log('Siunčiami duomenys:', sequenceData);

      // Siunčiame užklausą į backend'ą
      const response = await api.post('/plans/sequences/', sequenceData);

      if (response.status === 201) {
        showSuccess('Pamokų seka sėkmingai sukurta!');
        router.push('/mentors/plans');
      } else {
        throw new Error('Nepavyko sukurti pamokų sekos');
      }
    } catch (error: unknown) {
      console.error('Klaida kuriant pamokų seką:', error);
      
      let errorMessage = 'Įvyko klaida kuriant pamokų seką';
      
      // Geresnis klaidų apdorojimas
      const axiosError = error as { response?: { data?: unknown } };
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
  };

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
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atgal</span>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Ugdymo planai</h1>
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
              />
            )}
          </CardContent>
        </Card>

        {/* Veiksmai */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Atšaukti
          </Button>
          <Button
            disabled={isLoading}
            onClick={handleSubmit}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Kuriama...' : 'Sukurti ugdymo planą'}</span>
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
