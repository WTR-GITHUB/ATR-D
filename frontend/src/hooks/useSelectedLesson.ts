// frontend/src/hooks/useSelectedLesson.ts

// Hook pasirinktos pamokos būsenos valdymui activities puslapyje
// Išsaugo pasirinkimą localStorage ir gauna detalius duomenis apie pamoką
// Palaiko kelias pamokas per IMUPlan vienoje veikloje (GlobalSchedule)
// CHANGE: Sukurtas naujas hook pasirinktos pamokos valdymui su localStorage išsaugojimu

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { SelectedLessonState, LessonDetails, IMUPlan, ScheduleItem } from '@/app/dashboard/mentors/activities/types';

const STORAGE_KEY = 'activities_selected_lesson';

interface UseSelectedLessonReturn extends SelectedLessonState {
  selectScheduleItem: (item: ScheduleItem | null) => void;
  clearSelection: () => void;
  refreshLessonData: () => Promise<void>;
}

export const useSelectedLesson = (): UseSelectedLessonReturn => {
  const [state, setState] = useState<SelectedLessonState>({
    globalScheduleId: null,
    lessonDetails: null,
    imuPlans: [],
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

      // Paraleliai gauname pamokos detales ir IMU planus
      const [lessonIdResponse, imuPlansResponse] = await Promise.all([
        // Pirma gauti lesson ID iš GlobalSchedule per IMUPlan
        api.get(`/schedule/schedules/${globalScheduleId}/lesson_id/`),
        // Gauti IMU planus šiai veiklai
        api.get(`/plans/imu-plans/?global_schedule=${globalScheduleId}`)
      ]);

      // Tada gauti visą lesson informaciją iš curriculum API
      const lessonResponse = await api.get(`/curriculum/lessons/${lessonIdResponse.data.lesson_id}/`);

      setState(prev => ({
        ...prev,
        globalScheduleId,
        lessonDetails: lessonResponse.data,
        imuPlans: imuPlansResponse.data.results || [],
        isLoading: false,
        error: null
      }));

    } catch (err: any) {
      console.error('Klaida gaunant pamokos duomenis:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.response?.data?.error || 
               err.response?.data?.detail || 
               'Nepavyko gauti pamokos duomenų'
      }));
    }
  }, []);

  // Pasirinkti tvarkaraščio elementą
  const selectScheduleItem = useCallback((item: ScheduleItem | null) => {
    if (!item) {
      setState({
        globalScheduleId: null,
        lessonDetails: null,
        imuPlans: [],
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
    if (savedId) {
      fetchLessonData(savedId);
    }
  }, [loadFromStorage, fetchLessonData]);

  return {
    ...state,
    selectScheduleItem,
    clearSelection,
    refreshLessonData
  };
};

export default useSelectedLesson;
