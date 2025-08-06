import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

// Nuolatinis loading indikatorius
export default function LoadingSpinner({ 
  text = 'Kraunama...', 
  size = 'lg',
  showText = true 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16', 
    lg: 'h-32 w-32',
    xl: 'h-48 w-48'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      {/* Pagrindinis spinner */}
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      
      {/* Papildomas animuotas elementas */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      
      {/* Tekstas */}
      {showText && text && (
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">{text}</p>
          <p className="text-sm text-gray-500 mt-2">Prašome palaukti...</p>
        </div>
      )}
    </div>
  );
}

// Kompaktinis loading indikatorius
export function CompactLoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
}

// Skeleton loading komponentas
export function SkeletonLoader({ rows = 3, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-20 bg-gray-200 rounded animate-pulse flex-1"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
} 