// frontend/src/hooks/useSelectedLesson.ts

// Hook pasirinktos pamokos būsenos valdymui activities puslapyje
// Išsaugo pasirinkimą localStorage ir gauna detalius duomenis apie pamoką
// Palaiko kelias pamokas per IMUPlan vienoje veikloje (GlobalSchedule)
// CHANGE: Sukurtas naujas hook pasirinktos pamokos valdymui su localStorage išsaugojimu

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
// CHANGE: Pataisytas import'as - tipai importuojami iš activities/types.ts ir useSchedule
import { LessonDetails, IMUPlan } from '../app/mentors/activities/types';
import { ScheduleItem } from '@/hooks/useSchedule';

// CHANGE: Sukurtas SelectedLessonState tipas tiesiogiai hook'e
interface SelectedLessonState {
  globalScheduleId: number | null;
  lessonDetails: LessonDetails | null;
  allLessonsDetails: LessonDetails[];
  imuPlans: IMUPlan[];
  globalSchedule: ScheduleItem | null; // CHANGE: Pridėtas GlobalSchedule objektas su konkretaus tipo
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'activities_selected_lesson';

interface UseSelectedLessonReturn {
  globalScheduleId: number | null;
  lessonDetails: LessonDetails | null;
  allLessonsDetails: LessonDetails[];
  imuPlans: IMUPlan[];
  globalSchedule: ScheduleItem | null; // CHANGE: Pridėtas GlobalSchedule objektas su konkretaus tipo
  isLoading: boolean;
  error: string | null;
  selectScheduleItem: (item: ScheduleItem | null) => void;
  clearSelection: () => void;
  refreshLessonData: () => Promise<void>;
}

export const useSelectedLesson = (): UseSelectedLessonReturn => {
  const { getCurrentUserId } = useAuth();
  const [state, setState] = useState<SelectedLessonState>({
    globalScheduleId: null,
    lessonDetails: null,
    allLessonsDetails: [],
    imuPlans: [],
    globalSchedule: null, // CHANGE: Pridėtas GlobalSchedule state
    isLoading: false,
    error: null
  });

  // Išsaugoti pasirinkimą localStorage
  const saveToStorage = useCallback((globalScheduleId: number | null) => {
    if (globalScheduleId) {
      localStorage.setItem(STORAGE_KEY, globalScheduleId.toString());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Atkurti pasirinkimą iš localStorage
  const loadFromStorage = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : null;
  }, []);

  // Gauti pamokos detales pagal GlobalSchedule ID
  const fetchLessonData = useCallback(async (globalScheduleId: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Pirma gauti GlobalSchedule duomenis
      const globalScheduleResponse = await api.get(`/schedule/schedules/${globalScheduleId}/`);
      const globalSchedule = globalScheduleResponse.data;
      
      // Tada gauti IMU planus šiai veiklai
      const imuPlansResponse = await api.get(`/plans/imu-plans/?global_schedule=${globalScheduleId}`);
      
      // IMUPlan API grąžina masyvą tiesiogiai, ne objektą su results lauku
      const imuPlans = Array.isArray(imuPlansResponse.data) 
        ? imuPlansResponse.data 
        : (imuPlansResponse.data.results || []);

      // Gauti unikalių pamokų ID sąrašą iš IMU planų
      const lessonIds = [...new Set(
        imuPlans
          .map((plan: IMUPlan) => {
            if (typeof plan.lesson === 'object' && plan.lesson?.id) {
              return plan.lesson.id;
            } else if (typeof plan.lesson === 'number') {
              return plan.lesson;
            }
            return null;
          })
          .filter((lessonId: number | null) => lessonId !== null && lessonId !== undefined)
      )];

      // Gauti visų pamokų detales paraleliai
      let lessonDetails: LessonDetails | null = null;
      let allLessonsDetails: LessonDetails[] = [];
      
      if (lessonIds.length > 0) {
        // Gauti visas pamokas paraleliai
        const lessonResponses = await Promise.all(
          lessonIds.map(lessonId => api.get(`/curriculum/lessons/${lessonId}/`))
        );
        
        allLessonsDetails = lessonResponses.map(response => response.data);
        // Pagrindine pamoka - pirmoji
        lessonDetails = allLessonsDetails[0] || null;
      }

      setState(prev => ({
        ...prev,
        globalScheduleId,
        lessonDetails,
        allLessonsDetails,
        imuPlans,
        globalSchedule, // CHANGE: Pridėtas GlobalSchedule
        isLoading: false,
        error: null
      }));

    } catch (err: unknown) {
      console.error('Klaida gaunant pamokos duomenis:', err);
      
      // CHANGE: Type-safe error handling for lesson data fetching
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: unknown } };
        if (axiosError.response?.status === 404) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Pasirinkta pamoka neegzistuoja. Prašome pasirinkti pamoką iš tvarkaraščio.'
          }));
          // Išvalyti neteisingą ID iš localStorage
          saveToStorage(null);
          return;
        }
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: (axiosError.response?.data as { error?: string; detail?: string })?.error || 
                 (axiosError.response?.data as { error?: string; detail?: string })?.detail || 
                 'Nepavyko gauti pamokos duomenų'
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Nepavyko gauti pamokos duomenų'
        }));
      }
    }
  }, [saveToStorage]);

  // Pasirinkti tvarkaraščio elementą
  const selectScheduleItem = useCallback((item: ScheduleItem | null) => {
    if (!item) {
      setState({
        globalScheduleId: null,
        lessonDetails: null,
        allLessonsDetails: [],
        imuPlans: [],
        globalSchedule: null, // CHANGE: Pridėtas GlobalSchedule
        isLoading: false,
        error: null
      });
      saveToStorage(null);
      return;
    }

    const globalScheduleId = item.id;
    saveToStorage(globalScheduleId);
    fetchLessonData(globalScheduleId);
  }, [saveToStorage, fetchLessonData]);

  // Išvalyti pasirinkimą
  const clearSelection = useCallback(() => {
    selectScheduleItem(null);
  }, [selectScheduleItem]);

  // Atnaujinti duomenis
  const refreshLessonData = useCallback(async () => {
    if (state.globalScheduleId) {
      await fetchLessonData(state.globalScheduleId);
    }
  }, [state.globalScheduleId, fetchLessonData]);

  // Atkurti pasirinkimą iš localStorage komponento mount metu
  useEffect(() => {
    const savedId = loadFromStorage();
    const currentUserId = getCurrentUserId();
    
    // CHANGE: Tikrinti, ar išsaugotas ID priklauso dabartiniam vartotojui
    if (savedId && currentUserId) {
      // Čia galėtume pridėti papildomą tikrinimą, jei būtų reikia
      // Kol kas tiesiog bandoma gauti duomenis
      fetchLessonData(savedId);
    } else if (savedId && !currentUserId) {
      // CHANGE: Jei yra išsaugotas ID, bet nėra vartotojo - išvalyti
      clearSelection();
    }
  }, [loadFromStorage, fetchLessonData, getCurrentUserId, clearSelection]);

  return {
    ...state,
    selectScheduleItem,
    clearSelection,
    refreshLessonData
  };
};

export default useSelectedLesson;
