// /frontend/src/components/WebSocketStatus.tsx

// WebSocket ryšio statuso komponentas
// Rodo WebSocket prisijungimo būseną su vizualiais indikatoriais
// Naudojamas visoje aplikacijoje statuso rodymui

'use client';

import React from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';

interface WebSocketStatusProps {
  showText?: boolean;
  className?: string;
}

/**
 * WebSocket statuso komponentas
 * @param showText - Ar rodyti tekstą šalia indikatoriaus
 * @param className - Papildomi CSS klasės
 * @returns WebSocket statuso komponentas
 */
const WebSocketStatus: React.FC<WebSocketStatusProps> = ({ 
  showText = true, 
  className = '' 
}) => {
  const { isConnected, isConnecting, error } = useWebSocketContext();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Statuso indikatorius */}
      <div className={`w-3 h-3 rounded-full ${
        isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'
      }`}></div>
      
      {/* Statuso tekstas */}
      {showText && (
        <span className="text-sm text-gray-600">
          {isConnected ? 'Prisijungta' : isConnecting ? 'Jungiamasi...' : 'Atsijungta'}
        </span>
      )}
      
      {/* Klaidos pranešimas */}
      {error && showText && (
        <span className="text-xs text-red-600 ml-2">({error})</span>
      )}
    </div>
  );
};

export default WebSocketStatus;
