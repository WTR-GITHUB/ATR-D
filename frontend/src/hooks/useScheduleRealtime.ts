// frontend/src/hooks/useScheduleRealtime.ts

// Hook tvarkaraščio real-time atsinaujinimui su WebSocket
// Integruojasi su useWebSocket ir useWeeklySchedule hook'ais
// Palaiko automatinį tvarkaraščio atsinaujinimą po veiklų statusų keitimo

'use client';

import { useCallback, useState } from 'react';
import useWebSocket from './useWebSocket';
import useWeeklySchedule from './useWeeklySchedule';
import { ScheduleItem } from './useSchedule';

interface UseScheduleRealtimeOptions {
  weekStartDate: string;
  enabled?: boolean;
  onScheduleUpdate?: (scheduleItems: ScheduleItem[]) => void;
}

interface UseScheduleRealtimeReturn {
  scheduleItems: ScheduleItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  wsError: string | null;
  refetch: () => Promise<void>;
  reconnect: () => void;
}

/**
 * Hook tvarkaraščio real-time atsinaujinimui
 * @param options - Konfigūracijos parametrai
 * @returns Tvarkaraščio duomenys ir real-time valdymo funkcijos
 * 
 * Naudojimas:
 * const { scheduleItems, isRefreshing, isConnected } = useScheduleRealtime({
 *   weekStartDate: '2024-09-16',
 *   onScheduleUpdate: (items) => {}
 * });
 */
export const useScheduleRealtime = (options: UseScheduleRealtimeOptions): UseScheduleRealtimeReturn => {
  const { weekStartDate, enabled = true, onScheduleUpdate } = options;
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Tvarkaraščio duomenys
  const { 
    scheduleItems, 
    isLoading, 
    error, 
    refetch: originalRefetch 
  } = useWeeklySchedule({
    weekStartDate,
    enabled
  });

  /**
   * Tvarkaraščio atsinaujinimo handler'is
   */
  const handleScheduleUpdate = useCallback(async () => {
    if (isRefreshing) return; // Vengiame daugkartinio atsinaujinimo
    
    setIsRefreshing(true);
    
    try {
      await originalRefetch();
      setLastUpdateTime(new Date());
      onScheduleUpdate?.(scheduleItems);
    } catch (err) {
      console.error('Error refreshing schedule:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, originalRefetch, onScheduleUpdate, scheduleItems]);

  // WebSocket ryšys
  const {
    isConnected,
    isConnecting,
    error: wsError,
    sendMessage,
    reconnect
  } = useWebSocket({
    enabled,
    onMessage: useCallback((message: { type: string; data?: unknown }) => {
      if (message.type === 'schedule_update' || message.type === 'activity_status_change') {
        handleScheduleUpdate();
      }
    }, [handleScheduleUpdate]),
    onError: useCallback((error: Event) => {
      console.error('WebSocket error in schedule realtime:', error);
    }, [])
  });

  /**
   * Siųsti veiklos statuso keitimo žinutę
   */
  const sendActivityStatusChange = useCallback((scheduleId: number, newStatus: 'planned' | 'in_progress' | 'completed') => {
    const message = {
      type: 'activity_status_change' as const,
      data: {
        scheduleId,
        planStatus: newStatus,
        message: `Activity ${scheduleId} status changed to ${newStatus}`
      }
    };
    
    sendMessage(message);
  }, [sendMessage]);

  /**
   * Pradėti veiklą
   */
  const startActivity = useCallback(async (scheduleId: number) => {
    try {
      // Siųsti WebSocket žinutę
      sendActivityStatusChange(scheduleId, 'in_progress');
      
      // Atnaujinti tvarkaraštį
      await handleScheduleUpdate();
    } catch (err) {
      console.error('Error starting activity:', err);
    }
  }, [sendActivityStatusChange, handleScheduleUpdate]);

  /**
   * Užbaigti veiklą
   */
  const endActivity = useCallback(async (scheduleId: number) => {
    try {
      // Siųsti WebSocket žinutę
      sendActivityStatusChange(scheduleId, 'completed');
      
      // Atnaujinti tvarkaraštį
      await handleScheduleUpdate();
    } catch (err) {
      console.error('Error ending activity:', err);
    }
  }, [sendActivityStatusChange, handleScheduleUpdate]);

  /**
   * Atšaukti veiklą
   */
  const cancelActivity = useCallback(async (scheduleId: number) => {
    try {
      // Siųsti WebSocket žinutę
      sendActivityStatusChange(scheduleId, 'planned');
      
      // Atnaujinti tvarkaraštį
      await handleScheduleUpdate();
    } catch (err) {
      console.error('Error cancelling activity:', err);
    }
  }, [sendActivityStatusChange, handleScheduleUpdate]);

  // Eksportuoti funkcijas per refetch
  const refetch = useCallback(async () => {
    await handleScheduleUpdate();
  }, [handleScheduleUpdate]);

  return {
    scheduleItems,
    isLoading: isLoading || isRefreshing,
    isRefreshing,
    error: error || wsError,
    isConnected,
    isConnecting,
    wsError,
    refetch,
    reconnect,
    // Eksportuoti veiklų valdymo funkcijas
    startActivity,
    endActivity,
    cancelActivity
  } as UseScheduleRealtimeReturn & {
    startActivity: typeof startActivity;
    endActivity: typeof endActivity;
    cancelActivity: typeof cancelActivity;
  };
};

export default useScheduleRealtime;
