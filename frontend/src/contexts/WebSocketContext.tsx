// /frontend/src/contexts/WebSocketContext.tsx

// WebSocket context provider visai aplikacijai
// Palaiko globalų WebSocket ryšį ir skleidžia atsinaujinimus visiems komponentams
// Integruojasi su useWebSocket hook'u

'use client';

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import useWebSocket from '@/hooks/useWebSocket';

interface WebSocketMessage {
  type: 'schedule_update' | 'activity_status_change' | 'error';
  data: {
    scheduleId?: number;
    planStatus?: 'planned' | 'in_progress' | 'completed';
    message?: string;
  };
}

interface WebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sendMessage: (message: WebSocketMessage) => void;
  reconnect: () => void;
  disconnect: () => void;
  onMessage: (callback: (message: WebSocketMessage) => void) => void;
  offMessage: (callback: (message: WebSocketMessage) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

/**
 * WebSocket context provider
 * @param children - React komponentai
 * @param enabled - Ar įjungti WebSocket ryšį
 * @returns WebSocket context su visomis funkcijomis
 */
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children, 
  enabled = true 
}) => {
  const messageCallbacks = React.useRef<Set<(message: WebSocketMessage) => void>>(new Set());

  const handleMessage = useCallback((message: WebSocketMessage) => {
    // Skleisti žinutę visiems callback'ams
    messageCallbacks.current.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in WebSocket message callback:', error);
      }
    });
  }, []);

  const {
    isConnected,
    isConnecting,
    error,
    sendMessage,
    reconnect,
    disconnect
  } = useWebSocket({
    enabled,
    onMessage: handleMessage
  });

  const onMessage = useCallback((callback: (message: WebSocketMessage) => void) => {
    messageCallbacks.current.add(callback);
    
    // Grąžinti cleanup funkciją
    return () => {
      messageCallbacks.current.delete(callback);
    };
  }, []);

  const offMessage = useCallback((callback: (message: WebSocketMessage) => void) => {
    messageCallbacks.current.delete(callback);
  }, []);

  const contextValue: WebSocketContextType = {
    isConnected,
    isConnecting,
    error,
    sendMessage,
    reconnect,
    disconnect,
    onMessage,
    offMessage
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

/**
 * Hook WebSocket context naudojimui
 * @returns WebSocket context reikšmės
 * @throws Error jei naudojamas ne WebSocketProvider viduje
 */
export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  
  return context;
};

export default WebSocketProvider;
