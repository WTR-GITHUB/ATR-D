// frontend/src/hooks/useCurriculum.ts
import { useState, useEffect, useCallback } from 'react';
import { curriculumAPI, plansAPI } from '@/lib/api';
import { Subject, Level, Lesson, Skill, Competency, CompetencyAtcheve, Virtue, Objective, Component } from '@/lib/types';

// Hook dalykų valdymui
export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await curriculumAPI.subjects.getAll();
      setSubjects(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Klaida gaunant dalykus');
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async (subjectData: Partial<Subject>) => {
    try {
      const response = await curriculumAPI.subjects.create(subjectData);
      setSubjects(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida kuriant dalyką');
    }
  };

  const updateSubject = async (id: number, subjectData: Partial<Subject>) => {
    try {
      const response = await curriculumAPI.subjects.update(id, subjectData);
      setSubjects(prev => prev.map(subject => 
        subject.id === id ? response.data : subject
      ));
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida atnaujinant dalyką');
    }
  };

  const deleteSubject = async (id: number) => {
    try {
      await curriculumAPI.subjects.delete(id);
      setSubjects(prev => prev.filter(subject => subject.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida šalinant dalyką');
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return {
    subjects,
    loading,
    error,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
  };
};

// Hook lankomumo statistikai skaičiuoti
export const useAttendanceStats = () => {
  const [stats, setStats] = useState<{
    total_records: number;
    present_records: number;
    absent_records: number;
    left_records: number;
    excused_records: number;
    percentage: number;
    calculated_from: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendanceStats = async (studentId: number, subjectId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await plansAPI.imuPlans.getAttendanceStats(studentId, subjectId);
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Klaida gaunant lankomumo statistiką');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const clearStats = () => {
    setStats(null);
    setError(null);
  };

  return {
    stats,
    loading,
    error,
    fetchAttendanceStats,
    clearStats,
  };
};

// Hook bulk lankomumo statistikai skaičiuoti (visiems mokiniams viena užklausa)
export const useBulkAttendanceStats = () => {
  const [stats, setStats] = useState<{
    [studentId: number]: {
      student_id: number;
      student_name: string;
      total_records: number;
      present_records: number;
      absent_records: number;
      left_records: number;
      excused_records: number;
      percentage: number;
      calculated_from: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBulkAttendanceStats = useCallback(async (subjectId: number, globalScheduleId?: number, lessonId?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await plansAPI.imuPlans.getBulkAttendanceStats(subjectId, globalScheduleId, lessonId);
      
      // Konvertuoti į objektą su student_id kaip raktu
      const statsObject: { [studentId: number]: any } = {};
      
      // CHANGE: Backend'o API grąžina 'student_stats', ne 'students'
      const studentsArray = response.data.students || response.data.student_stats;
      
      if (studentsArray && Array.isArray(studentsArray)) {
        studentsArray.forEach((student: any) => {
          statsObject[student.student_id] = student;
        });
      }
      
      setStats(statsObject);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Klaida gaunant bulk lankomumo statistiką');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []); // CHANGE: useCallback su tuščiu dependency array

  const clearStats = () => {
    setStats(null);
    setError(null);
  };

  return {
    stats,
    loading,
    error,
    fetchBulkAttendanceStats,
    clearStats,
  };
};

// Hook lygių valdymui
export const useLevels = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const response = await curriculumAPI.levels.getAll();
      setLevels(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Klaida gaunant lygius');
    } finally {
      setLoading(false);
    }
  };

  const createLevel = async (levelData: Partial<Level>) => {
    try {
      const response = await curriculumAPI.levels.create(levelData);
      setLevels(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida kuriant lygį');
    }
  };

  const updateLevel = async (id: number, levelData: Partial<Level>) => {
    try {
      const response = await curriculumAPI.levels.update(id, levelData);
      setLevels(prev => prev.map(level => 
        level.id === id ? response.data : level
      ));
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida atnaujinant lygį');
    }
  };

  const deleteLevel = async (id: number) => {
    try {
      await curriculumAPI.levels.delete(id);
      setLevels(prev => prev.filter(level => level.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida šalinant lygį');
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  return {
    levels,
    loading,
    error,
    fetchLevels,
    createLevel,
    updateLevel,
    deleteLevel,
  };
};

// Hook pamokų valdymui
export const useLessons = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await curriculumAPI.lessons.getAll();
      setLessons(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Klaida gaunant pamokas');
    } finally {
      setLoading(false);
    }
  };

  const createLesson = async (lessonData: Partial<Lesson>) => {
    try {
      const response = await curriculumAPI.lessons.create(lessonData);
      setLessons(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida kuriant pamoką');
    }
  };

  const updateLesson = async (id: number, lessonData: Partial<Lesson>) => {
    try {
      const response = await curriculumAPI.lessons.update(id, lessonData);
      setLessons(prev => prev.map(lesson => 
        lesson.id === id ? response.data : lesson
      ));
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida atnaujinant pamoką');
    }
  };

  const deleteLesson = async (id: number) => {
    try {
      await curriculumAPI.lessons.delete(id);
      setLessons(prev => prev.filter(lesson => lesson.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida šalinant pamoką');
    }
  };

  const getLessonById = async (id: number) => {
    try {
      const response = await curriculumAPI.lessons.getById(id);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida gaunant pamoką');
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  return {
    lessons,
    loading,
    error,
    fetchLessons,
    createLesson,
    updateLesson,
    deleteLesson,
    getLessonById,
  };
};

// Hook gebėjimų valdymui
export const useSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = async (params?: any) => {
    try {
      setLoading(true);
      const response = await curriculumAPI.skills.getAll(params);
      setSkills(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Klaida gaunant gebėjimus');
    } finally {
      setLoading(false);
    }
  };

  const createSkill = async (skillData: Partial<Skill>) => {
    try {
      const response = await curriculumAPI.skills.create(skillData);
      setSkills(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida kuriant gebėjimą');
    }
  };

  const updateSkill = async (id: number, skillData: Partial<Skill>) => {
    try {
      const response = await curriculumAPI.skills.update(id, skillData);
      setSkills(prev => prev.map(skill => 
        skill.id === id ? response.data : skill
      ));
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida atnaujinant gebėjimą');
    }
  };

  const deleteSkill = async (id: number) => {
    try {
      await curriculumAPI.skills.delete(id);
      setSkills(prev => prev.filter(skill => skill.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida šalinant gebėjimą');
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  return {
    skills,
    loading,
    error,
    fetchSkills,
    createSkill,
    updateSkill,
    deleteSkill,
  };
};

// Hook kompetencijų valdymui
export const useCompetencies = () => {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetencies = async (params?: any) => {
    try {
      setLoading(true);
      const response = await curriculumAPI.competencies.getAll(params);
      setCompetencies(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Klaida gaunant kompetencijas');
    } finally {
      setLoading(false);
    }
  };

  const createCompetency = async (competencyData: Partial<Competency>) => {
    try {
      const response = await curriculumAPI.competencies.create(competencyData);
      setCompetencies(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida kuriant kompetenciją');
    }
  };

  const updateCompetency = async (id: number, competencyData: Partial<Competency>) => {
    try {
      const response = await curriculumAPI.competencies.update(id, competencyData);
      setCompetencies(prev => prev.map(competency => 
        competency.id === id ? response.data : competency
      ));
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida atnaujinant kompetenciją');
    }
  };

  const deleteCompetency = async (id: number) => {
    try {
      await curriculumAPI.competencies.delete(id);
      setCompetencies(prev => prev.filter(competency => competency.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida šalinant kompetenciją');
    }
  };

  useEffect(() => {
    fetchCompetencies();
  }, []);

  return {
    competencies,
    loading,
    error,
    fetchCompetencies,
    createCompetency,
    updateCompetency,
    deleteCompetency,
  };
};

// Hook dorybių valdymui
export const useVirtues = () => {
  const [virtues, setVirtues] = useState<Virtue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVirtues = async () => {
    try {
      setLoading(true);
      const response = await curriculumAPI.virtues.getAll();
      setVirtues(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Klaida gaunant dorybes');
    } finally {
      setLoading(false);
    }
  };

  const createVirtue = async (virtueData: Partial<Virtue>) => {
    try {
      const response = await curriculumAPI.virtues.create(virtueData);
      setVirtues(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida kuriant dorybę');
    }
  };

  const updateVirtue = async (id: number, virtueData: Partial<Virtue>) => {
    try {
      const response = await curriculumAPI.virtues.update(id, virtueData);
      setVirtues(prev => prev.map(virtue => 
        virtue.id === id ? response.data : virtue
      ));
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida atnaujinant dorybę');
    }
  };

  const deleteVirtue = async (id: number) => {
    try {
      await curriculumAPI.virtues.delete(id);
      setVirtues(prev => prev.filter(virtue => virtue.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida šalinant dorybę');
    }
  };

  useEffect(() => {
    fetchVirtues();
  }, []);

  return {
    virtues,
    loading,
    error,
    fetchVirtues,
    createVirtue,
    updateVirtue,
    deleteVirtue,
  };
}; 