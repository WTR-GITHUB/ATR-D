// frontend/src/hooks/useLevels.ts
import { useState, useEffect } from 'react';
import { levelsAPI } from '@/lib/api';
import { Level } from '@/lib/types';

export const useLevels = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const response = await levelsAPI.getAll();
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
      const response = await levelsAPI.create(levelData);
      setLevels(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Klaida kuriant lygį');
    }
  };

  const updateLevel = async (id: number, levelData: Partial<Level>) => {
    try {
      const response = await levelsAPI.update(id, levelData);
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
      await levelsAPI.delete(id);
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