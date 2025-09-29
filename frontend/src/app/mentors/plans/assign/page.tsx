// frontend/src/app/mentors/plans/assign/page.tsx

// Ugdymo plano priskyrimo puslapis mentoriams
// Leidžia mentoriams priskirti sukurtus ugdymo planus studentams ar studentų grupėms
// CHANGE: Sukurtas naujas puslapis greitojo meniu "Priskirti ugdymo planą" funkcionalumui
// CHANGE: Pridėti pasirinkimo laukai dalykui, lygiui, ugdymo planui ir datos elementai
// CHANGE: Įgyvendintas dalyko filtravimas pagal prisijungusį mentorių iš MentorSubject modelio
// CHANGE: Nustatytas default dalyko pasirinkimas pirmam įrašui, pridėtas planų filtravimas
// CHANGE: Pridėtas "Atgal" mygtukas navigacijai į planų pagrindinį puslapį
// CHANGE: Atnaujinta ugdymo planų filtravimo logika - filtruoja pagal created_by lauką iš LessonSequence modelio
// CHANGE: Pridėtas DualListTransfer komponentas studentų pasirinkimui pagal dalyką ir lygį
// CHANGE: Integruota API funkcija studentų gavimui iš StudentSubjectLevel modelio su filtru
// CHANGE: Pakeista sąlyga kad studentų pasirinkimo kortelė atsiranda kai pasirinktas dalykas
// CHANGE: Pridėtas warning message kai nepasirinktas lygis
// CHANGE: Ištaisytas hydration mismatch perkėliant datos generavimą į useEffect
// CHANGE: Pridėtas isClient state ir client-only rendering visos content dalies
// CHANGE: Pridėtas state management progress ir results modalams per-student API integracijai
// CHANGE: Pridėtas comprehensive logging frontend ir backend pusėse generavimo proceso sekimui

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import DualListTransfer from '@/components/ui/DualListTransfer';
import ProgressModal from '@/components/ui/ProgressModal';
import { useModals } from '@/hooks/useModals';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import NotificationModal from '@/components/ui/NotificationModal';
import GenerationResultsModal from '@/components/ui/GenerationResultsModal';
import { Users, BookOpen, Target, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

// Interface'ai duomenų tipams
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
  subject_name: string;
  level_name: string;
  subject: number;
  level: number;
}

interface Student {
  id: number;
  name: string;
  subject: string;
  level: string;
  subject_level_id: number;
}

// Interfaces for generation results
interface SkippedDetail {
  date: string;
  period_info: string;
  subject: string;
  reason: string;
}

interface UnusedLesson {
  position: number;
  lesson_title: string;
}

interface StudentResult {
  student_id: number;
  student_name: string;
  processed: number;
  created: number;
  updated: number;
  skipped: number;
  null_lessons?: number;
  unused_lessons?: UnusedLesson[];
  skipped_details: SkippedDetail[];
  error?: string;
  info_message?: string;
}

interface CurrentStudent {
  id: number;
  name: string;
  index: number;
  total: number;
}

// API funkcijos
async function fetchSubjects(): Promise<Subject[]> {
  const response = await api.get('/crm/mentor-subjects/my_subjects/');
  return response.data;
}

async function fetchLevels(): Promise<Level[]> {
  const response = await api.get('/plans/sequences/levels/');
  return response.data;
}

async function fetchPlans(userId?: number): Promise<LessonSequence[]> {
  let url = '/plans/sequences/';
  if (userId) {
    url += `?created_by=${userId}`;
  }
  const response = await api.get(url);
  return response.data;
}

async function fetchStudentsBySubjectLevel(subjectId: number, levelId: number): Promise<Student[]> {
  const response = await api.get(`/crm/student-subject-levels/students_by_subject_level/?subject=${subjectId}&level=${levelId}`);
  return response.data;
}

import ClientAuthGuard from '@/components/auth/ClientAuthGuard';

export default function AssignPlanPage() {
  useAuth(); // ROLE SWITCHING FIX: Iškviečia useAuth hook'ą
  const { user } = useAuth();
  const router = useRouter();

  // State valdymas
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [plans, setPlans] = useState<LessonSequence[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<LessonSequence[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  
  // Generation state management
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<CurrentStudent | null>(null);
  const [completedStudents, setCompletedStudents] = useState(0);
  const [generationResults, setGenerationResults] = useState<StudentResult[]>([]);

  // Modal hooks
  const {
    confirmationModal,
    closeConfirmation,
    notificationModal,
    closeNotification,
    showError,
    showWarning
  } = useModals();
  
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [todayDate, setTodayDate] = useState<string>('');
  const [tomorrowDate, setTomorrowDate] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  
  // Refs for date inputs
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  // Set client flag after component mounts to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    setTodayDate(today.toISOString().split('T')[0]);
    
    // Set tomorrow date as default end date (today + 1 day)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setTomorrowDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Gauname duomenis iš API tik kliento pusėje
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingData(true);
        const [subjectsData, levelsData, plansData] = await Promise.all([
          fetchSubjects(),
          fetchLevels(),
          fetchPlans(user?.id)
        ]);
        
        setSubjects(subjectsData);
        setLevels(levelsData);
        setPlans(plansData);
        setFilteredPlans(plansData);

        // Nustatyti default subject pirmą įrašą
        if (subjectsData.length > 0) {
          setSelectedSubject(subjectsData[0].id.toString());
        }
      } catch (error) {
        console.error('Klaida gaunant duomenis:', error);
      } finally {
        setIsLoadingData(false);
      }
    }

    if (isClient && user?.id) {
      loadData();
    }
  }, [isClient, user?.id]);

  // Filtruoti planus pagal pasirinktą dalyką ir lygį
  useEffect(() => {
    let filtered = plans;
    
    if (selectedSubject) {
      filtered = filtered.filter(plan => plan.subject.toString() === selectedSubject);
    }
    
    if (selectedLevel) {
      filtered = filtered.filter(plan => plan.level.toString() === selectedLevel);
    }
    
    setFilteredPlans(filtered);
    
    // Reset plan selection jei filtruotas sąrašas nebeturi pasirinkto plano
    if (selectedPlan && !filtered.find(plan => plan.id.toString() === selectedPlan)) {
      setSelectedPlan('');
    }
  }, [selectedSubject, selectedLevel, plans, selectedPlan]);

  // Handle subject change
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    setSelectedLevel(''); // Reset level when subject changes
    setSelectedPlan(''); // Reset plan when subject changes
  };

  // Handle level change
  const handleLevelChange = (value: string) => {
    setSelectedLevel(value);
    setSelectedPlan(''); // Reset plan when level changes
  };

  // Load students when subject and level are selected (only on client side)
  useEffect(() => {
    async function loadStudents() {
      if (isClient && selectedSubject && selectedLevel) {
        try {
          setIsLoadingStudents(true);
          const studentsData = await fetchStudentsBySubjectLevel(parseInt(selectedSubject), parseInt(selectedLevel));
          setStudents(studentsData);
        } catch (error) {
          console.error('Klaida gaunant studentus:', error);
          setStudents([]);
        } finally {
          setIsLoadingStudents(false);
        }
      } else {
        setStudents([]);
        setSelectedStudents([]);
      }
    }

    loadStudents();
  }, [isClient, selectedSubject, selectedLevel]);

  // Handle students selection change
  const handleStudentsSelectionChange = (selected: Student[]) => {
    setSelectedStudents(selected);
  };

  // Handle generation process
  const handleGenerate = async () => {
    if (!selectedSubject || !selectedLevel || !selectedPlan || selectedStudents.length === 0) {
      showWarning('Prašome užpildyti visus laukus ir pasirinkti studentus');
      return;
    }

    if (!startDateRef.current?.value || !endDateRef.current?.value) {
      showWarning('Prašome pasirinkti pradžios ir pabaigos datas');
      return;
    }

    // Validate that end date is after start date
    const startDate = new Date(startDateRef.current.value);
    const endDate = new Date(endDateRef.current.value);
    
    if (startDate >= endDate) {
      showWarning('Pabaigos data turi būti vėlesnė už pradžios datą');
      return;
    }

    const basePayload = {
      subject_id: parseInt(selectedSubject),
      level_id: parseInt(selectedLevel),
      lesson_sequence_id: parseInt(selectedPlan),
      start_date: startDateRef.current.value,
      end_date: endDateRef.current.value
    };

    // Starting generation process

    setIsGenerating(true);
    setShowProgressModal(true);
    setCompletedStudents(0);
    setGenerationResults([]);

    const allResults: StudentResult[] = [];

    try {
      for (let i = 0; i < selectedStudents.length; i++) {
        const student = selectedStudents[i];
        
        // Update current student info
        setCurrentStudent({
          id: student.id,
          name: student.name,
          index: i + 1,
          total: selectedStudents.length
        });

        // Processing student

        try {
          const response = await api.post('/plans/sequences/generate_student_plan_optimized/', {
            ...basePayload,
            student_id: student.id
          });

          allResults.push(response.data);
          setCompletedStudents(i + 1);

        } catch (error: unknown) {
          console.error('Failed for student:', error);
          
          // CHANGE: Type-safe error handling for student processing
          const errorMessage = error && typeof error === 'object' && 'response' in error 
            ? (error as { response?: { data?: { error?: string } }; message?: string }).response?.data?.error || (error as { response?: { data?: { error?: string } }; message?: string }).message || 'Nežinoma klaida'
            : 'Nežinoma klaida';
          
          const errorResult: StudentResult = {
            student_id: student.id,
            student_name: student.name,
            processed: 0,
            created: 0,
            updated: 0,
            skipped: 0,
            skipped_details: [],
            error: errorMessage
          };
          
          allResults.push(errorResult);
          setCompletedStudents(i + 1);
        }

        // Small delay between requests to avoid overwhelming the server
        if (i < selectedStudents.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Generation completed successfully
      setGenerationResults(allResults);

      // Show final results
      setTimeout(() => {
        setShowProgressModal(false);
        setShowResultsModal(true);
      }, 1000);

    } catch (error: unknown) {
      console.error('Generation process failed:', error);
      
      // CHANGE: Type-safe error handling for generation process
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message?: string }).message || 'Nežinoma klaida'
        : 'Nežinoma klaida';
      
      showError('Generavimo procesas nepavyko: ' + errorMessage);
      setShowProgressModal(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Close results modal
  const handleCloseResults = () => {
    setShowResultsModal(false);
    setGenerationResults([]);
    setCurrentStudent(null);
    setCompletedStudents(0);
  };

  // Cancel generation
  const handleCancelGeneration = () => {
    setIsGenerating(false);
    setShowProgressModal(false);
    setCurrentStudent(null);
    setCompletedStudents(0);
  };

  // Loading state or not client yet
  if (isLoadingData || !isClient) {
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
      {/* Header su atgal mygtuku */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/mentors/plans')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atgal</span>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Ugdymo planai</h1>
      </div>

      {/* Puslapio antraštė */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Plano priskyrimas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Pasirinkimo laukai vienoje eilutėje */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dalykas
              </label>
              <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pasirinkite dalyką..." />
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lygis
              </label>
              <Select value={selectedLevel} onValueChange={handleLevelChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pasirinkite lygį..." />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ugdymo planas
              </label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pasirinkite ugdymo planą..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Datos pasirinkimo elementai */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Laikotarpio pradžia
              </label>
              <Input
                ref={startDateRef}
                type="date"
                defaultValue={todayDate}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Laikotarpio pabaiga
              </label>
              <Input
                ref={endDateRef}
                type="date"
                defaultValue={tomorrowDate}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Studentų pasirinkimas */}
      {selectedSubject && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span>Studentų pasirinkimas</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Pasirinkite studentus, kuriems norite priskirti ugdymo planą
            </p>
          </CardHeader>
          <CardContent>
            {!selectedLevel ? (
              <div className="text-center py-12 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  Pasirinkite dalyką ir lygį
                </h3>
                <p className="text-sm text-yellow-700">
                  Prašome pasirinkti dalyką ir mokymo lygį, kad galėtumėte matyti galimus studentus
                </p>
              </div>
            ) : (
              <DualListTransfer
                availableItems={students.map(student => ({
                  id: student.id,
                  name: student.name,
                  subject: student.subject,
                  level: student.level
                }))}
                selectedItems={selectedStudents.map(student => ({
                  id: student.id,
                  name: student.name,
                  subject: student.subject,
                  level: student.level
                }))}
                                      onSelectionChange={(selected) => {
                        const mappedSelected = selected.map(item => {
                          const original = students.find(s => s.id === item.id);
                          return original || {
                            id: item.id,
                            name: item.name,
                            subject: item.subject || '',
                            level: item.level || '',
                            subject_level_id: 0
                          };
                        });
                        handleStudentsSelectionChange(mappedSelected);
                      }}
                      onGenerate={handleGenerate}
                      isGenerating={isGenerating}
                availableTitle="Galimi studentai"
                selectedTitle="Pasirinkti studentai"
                isLoading={isLoadingStudents}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Papildomas turinys */}
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <BookOpen className="w-12 h-12 text-gray-400" />
              <Target className="w-12 h-12 text-gray-400" />
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Čia bus Plano priskyrimas
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Šis puslapis bus skirtas ugdymo planų priskyrimui studentams. 
              Funkcionalumas bus įgyvendintas vėliau.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Papildoma informacija */}
      <Card>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Planuojamas funkcionalumas</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Šiame puslapyje bus galima:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Pasirinkti esamą ugdymo planą</li>
                  <li>Pasirinkti studentą ar studentų grupę</li>
                  <li>Nustatyti priskyrimo parametrus (pradžios data, trukmė)</li>
                  <li>Peržiūrėti priskirtų planų istoriją</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Modal */}
      <ProgressModal
        isOpen={showProgressModal}
        currentStudent={currentStudent}
        completedStudents={completedStudents}
        onCancel={handleCancelGeneration}
      />

      {/* Results Modal */}
      <GenerationResultsModal
        isOpen={showResultsModal}
        results={generationResults}
        onClose={handleCloseResults}
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
    </ClientAuthGuard>
  );
}
