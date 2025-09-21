// frontend/src/components/ui/StatusFilter.tsx

// Modernaus jungiklio komponentas statusų filtravimui
// Palaiko 3 būsenas: -1 (Ne/Neatlikti), 0 (Visi), 1 (Taip/Atlikti)
// CHANGE: Sukurtas pagal examples/multi_checker pavyzdį

'use client';

import React from 'react';

interface StatusFilterProps {
  value: number; // -1, 0, 1
  onChange: (value: number) => void;
  label: string;
  negativeLabel?: string; // Pvz. "Neatlikti"
  positiveLabel?: string; // Pvz. "Atlikti"
}

const StatusFilter: React.FC<StatusFilterProps> = ({ 
  value, 
  onChange, 
  label,
  negativeLabel = "Ne",
  positiveLabel = "Taip"
}) => {
  const getNextState = (currentState: number) => {
    if (currentState === 0) return 1;
    if (currentState === 1) return -1;
    return 0;
  };

  const getColorClass = () => {
    if (value === -1) return 'from-red-400 to-red-500';
    if (value === 0) return 'from-gray-300 to-gray-400';
    return 'from-green-400 to-green-500';
  };

  const getLabel = () => {
    if (value === -1) return negativeLabel;
    if (value === 0) return 'Visi';
    return positiveLabel;
  };

  // const getLabelColor = () => {
  //   if (value === -1) return 'text-red-600';
  //   if (value === 0) return 'text-gray-600';
  //   return 'text-green-600';
  // };

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Label */}
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      
      {/* Switch button */}
      <button
        onClick={() => onChange(getNextState(value))}
        className={`relative w-16 h-8 rounded-full bg-gradient-to-r transition-all duration-300 ${getColorClass()} shadow-lg hover:shadow-xl`}
        title={`Dabartinis filtras: ${getLabel()}`}
      >
        <div className="absolute inset-0.5 bg-white rounded-full flex items-center justify-center">
          <div className="flex space-x-1">
            <div className={`w-1 h-4 rounded ${value === -1 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
            <div className={`w-1 h-4 rounded ${value === 0 ? 'bg-gray-500' : 'bg-gray-200'}`}></div>
            <div className={`w-1 h-4 rounded ${value === 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default StatusFilter;
