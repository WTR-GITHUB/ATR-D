// frontend/src/components/ui/MultiSelect.tsx

// MultiSelect component for selecting multiple options with search functionality
// Provides a dropdown interface with search input and multiple selection capabilities
// CHANGE: Redesigned based on search-select example with improved UI and functionality

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface Option {
  id: number | string;
  name: string;
}

interface MultiSelectProps {
  label?: string;
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Ieškoti ir pasirinkti...",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter and sort options based on search term
  const filteredOptions = options
    .filter(option =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'lt', { sensitivity: 'base' }));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(''); // Clear search when closing
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleOption = (optionId: string) => {
    const isSelected = selectedValues.includes(optionId);
    if (isSelected) {
      onChange(selectedValues.filter(id => id !== optionId));
    } else {
      onChange([...selectedValues, optionId]);
    }
  };

  const isSelected = (optionId: string) => {
    return selectedValues.includes(optionId);
  };

  const handleSearchClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const removeSelected = (optionId: string) => {
    onChange(selectedValues.filter(id => id !== optionId));
  };

  const getSelectedOptions = () => {
    return options.filter(option => selectedValues.includes(option.id.toString()));
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        {/* Search input */}
        <div className="relative">
          <div 
            className={`flex items-center border-2 rounded-md bg-white cursor-text ${
              disabled ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-blue-500'
            }`}
            onClick={handleSearchClick}
          >
            <Search size={16} className="ml-3 text-gray-400" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => !disabled && setIsOpen(true)}
              disabled={disabled}
              className={`flex-1 px-3 py-2 outline-none text-gray-700 placeholder-gray-400 ${
                disabled ? 'cursor-not-allowed' : ''
              }`}
            />
            <ChevronDown 
              size={16} 
              className={`mr-3 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              } ${disabled ? 'cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        {/* Options list */}
        {isOpen && !disabled && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-hidden">
            <div className="max-h-80 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">
                  Nerasta rezultatų
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.id}
                    onClick={() => toggleOption(option.id.toString())}
                    className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between ${
                      index === 0 ? 'bg-blue-50' : ''
                    } ${
                      isSelected(option.id.toString()) 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="font-medium">{option.name}</span>
                    </div>
                    {isSelected(option.id.toString()) && (
                      <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected items */}
      {selectedValues.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
          <div className="text-sm font-medium text-blue-700 mb-2">
            Pasirinkta ({selectedValues.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {getSelectedOptions().map(option => (
              <span 
                key={option.id}
                className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium"
              >
                {option.name}
                <button
                  type="button"
                  onClick={() => removeSelected(option.id.toString())}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X size={12} className="text-blue-600" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;