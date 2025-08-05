import { useState, useEffect } from 'react';
import { gradesAPI } from '@/lib/api';
import { Grade } from '@/lib/types';

// Hook pažymių valdymui
export const useGrades = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await gradesAPI.getAll();
      setGrades(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Klaida gaunant pažymius');
    } finally {
      setLoading(false);
    }
  };

  const createGrade = async (gradeData: Partial<Grade>) => {
    try {
      const response = await gradesAPI.create(gradeData);
      setGrades(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida kuriant pažymį');
    }
  };

  const updateGrade = async (id: number, gradeData: Partial<Grade>) => {
    try {
      const response = await gradesAPI.update(id, gradeData);
      setGrades(prev => prev.map(grade => 
        grade.id === id ? response.data : grade
      ));
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida atnaujinant pažymį');
    }
  };

  const deleteGrade = async (id: number) => {
    try {
      await gradesAPI.delete(id);
      setGrades(prev => prev.filter(grade => grade.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida šalinant pažymį');
    }
  };

  const getGradeById = async (id: number) => {
    try {
      const response = await gradesAPI.getById(id);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida gaunant pažymį');
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  return {
    grades,
    loading,
    error,
    fetchGrades,
    createGrade,
    updateGrade,
    deleteGrade,
    getGradeById,
  };
}; 