import { useState, useEffect } from 'react';
import { scheduleAPI } from '@/lib/api';
import { Period } from '@/lib/types';

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