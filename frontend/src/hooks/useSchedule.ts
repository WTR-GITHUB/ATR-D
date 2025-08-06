import { useState, useEffect } from 'react';
import { scheduleAPI } from '@/lib/api';
import { Period, Classroom, GlobalSchedule } from '@/lib/types';

// Hook tvarkaraščio periodų valdymui
export const usePeriods = () => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const response = await scheduleAPI.periods.getAll();
      setPeriods(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Klaida gaunant periodus');
    } finally {
      setLoading(false);
    }
  };

  const createPeriod = async (periodData: Partial<Period>) => {
    try {
      const response = await scheduleAPI.periods.create(periodData);
      setPeriods(prev => [...prev, response.data]);
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
  }, []);

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

// Hook tvarkaraščio klasių valdymui
export const useClassrooms = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await scheduleAPI.classrooms.getAll();
      setClassrooms(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Klaida gaunant klases');
    } finally {
      setLoading(false);
    }
  };

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
  }, []);

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

// Hook tvarkaraščio valdymui
export const useGlobalSchedule = () => {
  const [schedule, setSchedule] = useState<GlobalSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await scheduleAPI.globalSchedule.getAll();
      setSchedule(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Klaida gaunant tvarkaraštį');
    } finally {
      setLoading(false);
    }
  };

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
  }, []);



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