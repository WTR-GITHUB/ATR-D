// frontend/src/components/ui/LoadingIndicator.tsx

// Loading indikatorių komponentas A-DIENYNAS sistemoje
// Naudojamas tvarkaraščio atsinaujinimo metu ir kitose vietose
// Palaiko skirtingus dydžius ir stilius

'use client';

import React from 'react';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  showText?: boolean;
  color?: 'blue' | 'green' | 'gray' | 'white';
}

/**
 * Loading indikatorių komponentas
 * @param size - Indikatoriaus dydis
 * @param text - Tekstas po indikatoriumi
 * @param className - Papildomos CSS klasės
 * @param showText - Ar rodyti tekstą
 * @param color - Indikatoriaus spalva
 * 
 * Naudojimas:
 * <LoadingIndicator size="lg" text="Kraunamas tvarkaraštis..." />
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'md',
  text = 'Kraunama...',
  className = '',
  showText = true,
  color = 'blue'
}) => {
  // Dydžių konfigūracija
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  // Spalvų konfigūracija
  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    gray: 'border-gray-600',
    white: 'border-white'
  };

  // Teksto dydžiai
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Spinning loader */}
      <div 
        className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="Kraunama"
      >
        <span className="sr-only">Kraunama...</span>
      </div>
      
      {/* Loading tekstas */}
      {showText && text && (
        <div className={`mt-2 text-gray-600 ${textSizeClasses[size]}`}>
          {text}
        </div>
      )}
    </div>
  );
};

/**
 * Inline loading indikatorius (be teksto)
 */
export const InlineLoading: React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: 'blue' | 'green' | 'gray' | 'white' }> = ({
  size = 'sm',
  color = 'blue'
}) => (
  <LoadingIndicator 
    size={size} 
    color={color} 
    showText={false} 
    className="inline-flex" 
  />
);

/**
 * Overlay loading indikatorius (per visą ekraną)
 */
export const OverlayLoading: React.FC<{ 
  text?: string; 
  show?: boolean;
  className?: string;
}> = ({ 
  text = 'Kraunama...', 
  show = true,
  className = ''
}) => {
  if (!show) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <LoadingIndicator size="lg" text={text} color="blue" />
      </div>
    </div>
  );
};

/**
 * Button loading indikatorius
 */
export const ButtonLoading: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'gray' | 'white';
}> = ({ size = 'sm', color = 'white' }) => (
  <LoadingIndicator 
    size={size} 
    color={color} 
    showText={false} 
    className="inline-flex" 
  />
);

export default LoadingIndicator;
