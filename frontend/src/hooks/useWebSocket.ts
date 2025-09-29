// frontend/src/hooks/useWebSocket.ts

// WebSocket hook real-time atsinaujinimui A-DIENYNAS sistemoje
// Naudojamas tvarkaraščio atsinaujinimui po veiklų statusų keitimo
// Palaiko automatinį prisijungimą ir error handling

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: 'schedule_update' | 'activity_status_change' | 'error';
  data: {
    scheduleId?: number;
    planStatus?: 'planned' | 'in_progress' | 'completed';
    message?: string;
  };
}

interface UseWebSocketOptions {
  url?: string;
  enabled?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sendMessage: (message: WebSocketMessage) => void;
  reconnect: () => void;
  disconnect: () => void;
}

/**
 * WebSocket hook real-time komunikacijai
 * @param options - WebSocket konfigūracijos parametrai
 * @returns WebSocket valdymo funkcijos ir būsena
 * 
 * Naudojimas:
 * const { isConnected, sendMessage, onMessage } = useWebSocket({
 *   onMessage: (msg) => {
 *     if (msg.type === 'schedule_update') {
 *       // Atnaujinti tvarkaraštį
 *     }
 *   }
 * });
 */
export const useWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const {
    url = (() => {
      // CHANGE: Automatiškai nustatyti WebSocket URL pagal aplinką
      if (typeof window !== 'undefined') {
        // Client-side: naudoti environment kintamąjį arba nustatyti pagal host
        if (process.env.NEXT_PUBLIC_WS_URL) {
          return process.env.NEXT_PUBLIC_WS_URL;
        }
        // Development režime: naudoti Nginx proxy (be porto)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}/ws/schedule/`;
      }
      // Server-side: naudoti environment kintamąjį arba default
      return process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/schedule/';
    })(),
    enabled = true,
    onMessage,
    onError,
    onConnect,
    onDisconnect,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);

  /**
   * Prisijungti prie WebSocket serverio
   */
  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();

        // Automatinis prisijungimas jei reikia
        if (shouldReconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError('Nepavyko prisijungti prie serverio po daugelio bandymų');
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket klaida');
        onError?.(event);
      };

    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Nepavyko sukurti WebSocket ryšio');
      setIsConnecting(false);
    }
  }, [url, enabled, onMessage, onError, onConnect, onDisconnect, reconnectInterval, maxReconnectAttempts]);

  /**
   * Atsijungti nuo WebSocket serverio
   */
  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  /**
   * Siųsti žinutę per WebSocket
   */
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, []);

  /**
   * Prisijungti iš naujo
   */
  const reconnect = useCallback(() => {
    disconnect();
    shouldReconnectRef.current = true;
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  // Prisijungti komponento montavimo metu
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Valyti timeout'us komponento išmontavimo metu
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    sendMessage,
    reconnect,
    disconnect
  };
};

export default useWebSocket;
