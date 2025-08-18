// frontend/src/hooks/useLessonDetails.ts

// Hook pamokos detalių gavimui iš curriculum API
// Naudoja GlobalSchedule ID kad gautų susijusią Lesson informaciją per IMUPlan
// CHANGE: Naudoja esamą /curriculum/lessons/ endpoint vietoj naujo

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface LessonDetails {
  id: number;
  title: string;
  topic: string;
  topic_name: string;
  subject_name: string;
  content: string;
  objectives: string;
  objectives_list: any[];
  components: string;
  components_list: any[];
  focus: string;
  focus_list: any[];
  skills_list: number[];
  virtues_names: string[];
  levels_names: string[];
  slenkstinis: string;
  bazinis: string;
  pagrindinis: string;
  aukstesnysis: string;
  competency_atcheve_name: string[];
  competency_atcheves: number[];
  mentor_name: string;
  created_at: string;
  updated_at: string;
}

interface UseLessonDetailsReturn {
  lessonDetails: LessonDetails | null;
  isLoading: boolean;
  error: string | null;
  fetchLessonDetails: (globalScheduleId: number) => Promise<void>;
}

export const useLessonDetails = (): UseLessonDetailsReturn => {
  const [lessonDetails, setLessonDetails] = useState<LessonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLessonDetails = async (globalScheduleId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      // Pirma gauname lesson ID iš GlobalSchedule per IMUPlan
      const lessonIdResponse = await api.get(`/schedule/schedules/${globalScheduleId}/lesson_id/`);
      const lessonId = lessonIdResponse.data.lesson_id;

      // Tada gauname visą lesson informaciją iš curriculum API
      const lessonResponse = await api.get(`/curriculum/lessons/${lessonId}/`);
      setLessonDetails(lessonResponse.data);
    } catch (err: any) {
      console.error('Klaida gaunant pamokos detales:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        'Nepavyko gauti pamokos detalių'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reset duomenis kai keičiasi globalScheduleId
  useEffect(() => {
    setLessonDetails(null);
    setError(null);
  }, []);

  return {
    lessonDetails,
    isLoading,
    error,
    fetchLessonDetails
  };
};

export default useLessonDetails;
