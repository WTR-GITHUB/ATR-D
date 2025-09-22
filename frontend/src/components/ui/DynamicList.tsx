// frontend/src/components/ui/DynamicList.tsx
'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface DynamicListProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Dinamiško sąrašo komponentas - leidžia pridėti ir pašalinti reikšmes
 */
export default function DynamicList({ 
  label, 
  values, 
  onChange, 
  placeholder = "Įveskite reikšmę",
  className = "" 
}: DynamicListProps) {
  const [newValue, setNewValue] = useState('');

  const handleAddValue = () => {
    if (newValue.trim()) {
      onChange([...values, newValue.trim()]);
      setNewValue('');
    }
  };

  const handleRemoveValue = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddValue();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* Esamos reikšmės */}
      {values.map((value, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const newValues = [...values];
              newValues[index] = e.target.value;
              onChange(newValues);
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => handleRemoveValue(index)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      
      {/* Naujos reikšmės pridėjimas */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={handleAddValue}
          disabled={!newValue.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
        >
          <Check className="w-4 h-4" />
          <span>Tvirtinti</span>
        </button>
      </div>
      
      {/* Bendras skaičius */}
      {values.length > 0 && (
        <div className="text-sm text-gray-500">
          Iš viso: {values.length}
        </div>
      )}
    </div>
  );
} 