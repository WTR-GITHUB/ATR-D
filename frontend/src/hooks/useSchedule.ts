import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { scheduleAPI } from '@/lib/api';
import { Period, Classroom, GlobalSchedule } from '@/lib/types';

// Globalus cache'as duomenų išsaugojimui
const dataCache = {
  periods: null as Period[] | null,
  classrooms: null as Classroom[] | null,
  schedule: null as GlobalSchedule[] | null,
  lastFetch: {
    periods: 0,
    classrooms: 0,
    schedule: 0
  }
};

// Cache'ing funkcija
const getCachedData = <T>(key: 'periods' | 'classrooms' | 'schedule', maxAge: number = 5 * 60 * 1000): T | null => {
  const now = Date.now();
  const lastFetch = dataCache.lastFetch[key];
  
  if (dataCache[key] && (now - lastFetch) < maxAge) {
    return dataCache[key] as T;
  }
  
  return null;
};

const setCachedData = <T>(key: 'periods' | 'classrooms' | 'schedule', data: T) => {
  (dataCache as any)[key] = data;
  dataCache.lastFetch[key] = Date.now();
};

// Debouncing hook'as optimizacijai
export const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Centrinis loading state manager
export const useLoadingManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const loadingRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback((text: string = 'Kraunama...') => {
    setLoadingText(text);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingText('');
  }, []);

  const setLoadingWithDelay = useCallback((text: string, delay: number = 500) => {
    if (loadingRef.current) {
      clearTimeout(loadingRef.current);
    }
    
    loadingRef.current = setTimeout(() => {
      startLoading(text);
    }, delay);
  }, [startLoading]);

  useEffect(() => {
    return () => {
      if (loadingRef.current) {
        clearTimeout(loadingRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading,
    setLoadingWithDelay
  };
};

// Hook tvarkaraščio optimizacijai su Map struktūra
export const useOptimizedSchedule = (schedule: GlobalSchedule[], userId?: number, mentorSubjects?: any[]) => {
  // Memoizuojame pamokų duomenis su Map struktūra O(1) prieigai
  const optimizedSchedule = useMemo(() => {
    if (!schedule || !userId) return new Map();
    
    const scheduleMap = new Map<string, GlobalSchedule[]>();
    
    schedule.forEach((lesson: GlobalSchedule) => {
      if (lesson.user?.id !== userId) return;
      
      // Mentoriaus filtravimas - tik priskirti dalykai
      if (mentorSubjects && mentorSubjects.length > 0) {
        const mentorSubjectIds = mentorSubjects.map(subject => subject.id);
        if (!mentorSubjectIds.includes(lesson.subject?.id)) {
          return; // Praleidžiame dalykus, kurie nėra priskirti mentoriams
        }
      }
      
      // Naudojame objektą kaip raktą vietoj string concatenation
      const key = {
        date: lesson.date,
        periodId: lesson.period?.id,
        levelId: lesson.level?.id
      };
      
      const keyString = JSON.stringify(key);
      
      if (!scheduleMap.has(keyString)) {
        scheduleMap.set(keyString, []);
      }
      scheduleMap.get(keyString)!.push(lesson);
    });
    
    return scheduleMap;
  }, [schedule, userId, mentorSubjects]);
  
  // Greita funkcija pamokų paieškai O(1) greičiu
  const getLessonsForSlot = useCallback((date: string, periodId: number, levelId: number): GlobalSchedule[] => {
    const key = JSON.stringify({ date, periodId, levelId });
    return optimizedSchedule.get(key) || [];
  }, [optimizedSchedule]);
  
  // Funkcija filtravimui pagal datų diapazoną
  const getLessonsForDateRange = useCallback((startDate: string, endDate: string): GlobalSchedule[] => {
    const lessons: GlobalSchedule[] = [];
    
    optimizedSchedule.forEach((lessonArray, keyString) => {
      const key = JSON.parse(keyString);
      const lessonDate = key.date;
      
      if (lessonDate >= startDate && lessonDate <= endDate) {
        lessons.push(...lessonArray);
      }
    });
    
    return lessons;
  }, [optimizedSchedule]);
  
  return {
    optimizedSchedule,
    getLessonsForSlot,
    getLessonsForDateRange,
    scheduleSize: optimizedSchedule.size
  };
};

// Papildomas hook renderinimo optimizacijai
export const useRenderOptimization = (schedule: GlobalSchedule[], userId?: number, mentorSubjects?: any[]) => {
  // Memoizuojame renderinimo duomenis
  const renderData = useMemo(() => {
    if (!schedule || !userId) return { cells: new Map(), totalCells: 0 };
    
    const cells = new Map<string, {
      subject: string;
      classroom: string;
      lesson?: string;
      hasData: boolean;
    }>();
    
    let totalCells = 0;
    
    schedule.forEach((lesson: GlobalSchedule) => {
      if (lesson.user?.id !== userId) return;
      
      // Mentoriaus filtravimas - tik priskirti dalykai
      if (mentorSubjects && mentorSubjects.length > 0) {
        const mentorSubjectIds = mentorSubjects.map(subject => subject.id);
        if (!mentorSubjectIds.includes(lesson.subject?.id)) {
          return; // Praleidžiame dalykus, kurie nėra priskirti mentoriams
        }
      }
      
      const cellKey = `${lesson.date}-${lesson.period?.id}-${lesson.level?.id}`;
      
      cells.set(cellKey, {
        subject: lesson.subject?.name || 'Dalykas',
        classroom: lesson.classroom?.name || 'Klasė',
        lesson: lesson.lesson?.title,
        hasData: true
      });
      
      totalCells++;
    });
    
    return { cells, totalCells };
  }, [schedule, userId, mentorSubjects]);
  
  // Greita funkcija langelio duomenų gavimui
  const getCellData = useCallback((date: string, periodId: number, levelId: number) => {
    const cellKey = `${date}-${periodId}-${levelId}`;
    return renderData.cells.get(cellKey) || {
      subject: 'Dalykas',
      classroom: 'Klasė',
      hasData: false
    };
  }, [renderData.cells]);
  
  return {
    renderData,
    getCellData,
    totalCells: renderData.totalCells
  };
};

// Virtualizacijos pagrindų hook'as
export const useVirtualization = (items: any[], itemHeight: number, containerHeight: number) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%'
      }
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    containerRef
  };
};

// Hook mentoriaus priskirtų dalykų gavimui
export const useMentorSubjects = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMentorSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await scheduleAPI.globalSchedule.getMentorSubjects();
      setSubjects(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Klaida gaunant mentoriaus dalykus');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentorSubjects();
  }, [fetchMentorSubjects]);

  return {
    subjects,
    loading,
    error,
    fetchMentorSubjects,
  };
};

// Hook tvarkaraščio periodų valdymui su cache'ingu
export const usePeriods = () => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = useCallback(async (force: boolean = false) => {
    // Patikriname cache'ą
    const cached = getCachedData<Period[]>('periods');
    if (!force && cached) {
      setPeriods(cached);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await scheduleAPI.periods.getAll();
      setPeriods(response.data);
      setCachedData('periods', response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Klaida gaunant periodus');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPeriod = async (periodData: Partial<Period>) => {
    try {
      const response = await scheduleAPI.periods.create(periodData);
      setPeriods(prev => [...prev, response.data]);
      setCachedData('periods', [...periods, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida kuriant periodą');
    }
  };

  const updatePeriod = async (id: number, periodData: Partial<Period>) => {
    try {
      const response = await scheduleAPI.periods.update(id, periodData);
      setPeriods(prev => prev.map(period => 
        period.id === id ? response.data : period
      ));
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida atnaujinant periodą');
    }
  };

  const deletePeriod = async (id: number) => {
    try {
      await scheduleAPI.periods.delete(id);
      setPeriods(prev => prev.filter(period => period.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida šalinant periodą');
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  return {
    periods,
    loading,
    error,
    fetchPeriods,
    createPeriod,
    updatePeriod,
    deletePeriod,
  };
};

// Hook tvarkaraščio klasių valdymui su cache'ingu
export const useClassrooms = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClassrooms = useCallback(async (force: boolean = false) => {
    // Patikriname cache'ą
    const cached = getCachedData<Classroom[]>('classrooms');
    if (!force && cached) {
      setClassrooms(cached);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await scheduleAPI.classrooms.getAll();
      setClassrooms(response.data);
      setCachedData('classrooms', response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Klaida gaunant klases');
    } finally {
      setLoading(false);
    }
  }, []);

  const createClassroom = async (classroomData: Partial<Classroom>) => {
    try {
      const response = await scheduleAPI.classrooms.create(classroomData);
      setClassrooms(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida kuriant klasę');
    }
  };

  const updateClassroom = async (id: number, classroomData: Partial<Classroom>) => {
    try {
      const response = await scheduleAPI.classrooms.update(id, classroomData);
      setClassrooms(prev => prev.map(classroom => 
        classroom.id === id ? response.data : classroom
      ));
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida atnaujinant klasę');
    }
  };

  const deleteClassroom = async (id: number) => {
    try {
      await scheduleAPI.classrooms.delete(id);
      setClassrooms(prev => prev.filter(classroom => classroom.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida šalinant klasę');
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  return {
    classrooms,
    loading,
    error,
    fetchClassrooms,
    createClassroom,
    updateClassroom,
    deleteClassroom,
  };
};

// Hook tvarkaraščio valdymui su cache'ingu
export const useGlobalSchedule = () => {
  const [schedule, setSchedule] = useState<GlobalSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async (force: boolean = false) => {
    // Patikriname cache'ą
    const cached = getCachedData<GlobalSchedule[]>('schedule');
    if (!force && cached) {
      setSchedule(cached);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await scheduleAPI.globalSchedule.getAll();
      setSchedule(response.data);
      setCachedData('schedule', response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Klaida gaunant tvarkaraštį');
    } finally {
      setLoading(false);
    }
  }, []);

  const createScheduleEntry = async (scheduleData: Partial<GlobalSchedule>) => {
    try {
      const response = await scheduleAPI.globalSchedule.create(scheduleData);
      setSchedule(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida kuriant tvarkaraščio įrašą');
    }
  };

  const updateScheduleEntry = async (id: number, scheduleData: Partial<GlobalSchedule>) => {
    try {
      const response = await scheduleAPI.globalSchedule.update(id, scheduleData);
      setSchedule(prev => prev.map(entry => 
        entry.id === id ? response.data : entry
      ));
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida atnaujinant tvarkaraščio įrašą');
    }
  };

  const deleteScheduleEntry = async (id: number) => {
    try {
      await scheduleAPI.globalSchedule.delete(id);
      setSchedule(prev => prev.filter(entry => entry.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida šalinant tvarkaraščio įrašą');
    }
  };

  const getWeeklySchedule = async (weekStart: string) => {
    try {
      const response = await scheduleAPI.globalSchedule.getWeekly(weekStart);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida gaunant savaitės tvarkaraštį');
    }
  };

  const getDailySchedule = async (date: string) => {
    try {
      const response = await scheduleAPI.globalSchedule.getDaily(date);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida gaunant dienos tvarkaraštį');
    }
  };

  const getConflicts = async () => {
    try {
      const response = await scheduleAPI.globalSchedule.getConflicts();
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida gaunant konfliktus');
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return {
    schedule,
    loading,
    error,
    fetchSchedule,
    createScheduleEntry,
    updateScheduleEntry,
    deleteScheduleEntry,
    getWeeklySchedule,
    getDailySchedule,
    getConflicts,
  };
}; 