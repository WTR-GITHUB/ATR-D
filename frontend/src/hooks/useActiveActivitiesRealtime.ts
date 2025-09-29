// /frontend/src/hooks/useActiveActivitiesRealtime.ts

// Hook aktyvioms veikloms valdyti su WebSocket real-time atsinaujinimais
// Integruojasi su useActiveActivities ir useWebSocket hook'ais
// Palaiko automatinį atsinaujinimą po veiklų statusų keitimo

'use client';

import { useCallback, useState, useEffect } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import useActiveActivities from './useActiveActivities';

// Import ActiveActivity type from useActiveActivities
interface ActiveActivity {
  id: number;
  date: string;
  weekday: string;
  period: {
    id: number;
    name: string;
    starttime: string;
    endtime: string;
    duration: number;
  };
  classroom: {
    id: number;
    name: string;
    description: string;
  };
  subject: {
    id: number;
    name: string;
    description: string;
  };
  level: {
    id: number;
    name: string;
    description: string;
  };
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  lesson_title: string | null;
  plan_status: 'planned' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
}

interface UseActiveActivitiesRealtimeOptions {
  enabled?: boolean;
  onActivityUpdate?: (activities: ActiveActivity[]) => void;
}

interface UseActiveActivitiesRealtimeReturn {
  activeActivities: ActiveActivity[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  wsError: string | null;
  refreshActiveActivities: () => void;
  reconnect: () => void;
  sendActivityStatusChange: (scheduleId: number, newStatus: 'planned' | 'in_progress' | 'completed') => void;
}

/**
 * Hook aktyvioms veikloms valdyti su real-time atsinaujinimais
 * @param options - Konfigūracijos parametrai
 * @returns Aktyvių veiklų duomenys ir real-time valdymo funkcijos
 * 
 * Naudojimas:
 * const { activeActivities, refreshActiveActivities, sendActivityStatusChange } = useActiveActivitiesRealtime({
 *   onActivityUpdate: (activities) => {}
 * });
 */
export const useActiveActivitiesRealtime = (options: UseActiveActivitiesRealtimeOptions = {}): UseActiveActivitiesRealtimeReturn => {
  const { enabled = true, onActivityUpdate } = options;
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  // WebSocket ryšys per globalų context
  const {
    isConnected,
    isConnecting,
    error: wsError,
    sendMessage,
    reconnect,
    onMessage,
    offMessage
  } = useWebSocketContext();

  // Aktyvių veiklų duomenys
  const { 
    activeActivities, 
    isLoading, 
    error, 
    refreshActiveActivities: originalRefreshActiveActivities 
  } = useActiveActivities();

  /**
   * Aktyvių veiklų atsinaujinimo handler'is
   */
  const handleActivityUpdate = useCallback(async () => {
    if (isRefreshing) return; // Vengiame daugkartinio atsinaujinimo
    
    setIsRefreshing(true);
    
    try {
      await originalRefreshActiveActivities();
      onActivityUpdate?.(activeActivities);
    } catch (err) {
      console.error('Error refreshing active activities:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, originalRefreshActiveActivities, onActivityUpdate, activeActivities]);

  // WebSocket žinutės listener'is
  useEffect(() => {
    if (!enabled) return;

    const handleWebSocketMessage = (message: { type: string; data?: unknown }) => {
      if (message.type === 'activity_status_change' || message.type === 'schedule_update') {
        handleActivityUpdate();
      }
    };

    onMessage(handleWebSocketMessage);

    return () => {
      offMessage(handleWebSocketMessage);
    };
  }, [enabled, onMessage, offMessage, handleActivityUpdate]);

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
   * Atnaujinti aktyvias veiklas
   */
  const refreshActiveActivities = useCallback(async () => {
    await handleActivityUpdate();
  }, [handleActivityUpdate]);

  return {
    activeActivities,
    isLoading: isLoading || isRefreshing,
    error: error || wsError,
    isConnected,
    isConnecting,
    wsError,
    refreshActiveActivities,
    reconnect,
    sendActivityStatusChange
  };
};

export default useActiveActivitiesRealtime;
