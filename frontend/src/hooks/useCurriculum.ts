// frontend/src/hooks/useCurriculum.ts
import { useState, useEffect } from 'react';
import { curriculumAPI } from '@/lib/api';
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