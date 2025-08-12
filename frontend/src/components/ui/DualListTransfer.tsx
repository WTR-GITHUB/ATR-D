// frontend/src/components/ui/DualListTransfer.tsx

// Dual list transfer component for selecting and managing items between two lists
// Allows moving items from available list to selected list and vice versa with intuitive UI
// CHANGE: Created new dual list transfer component for student selection functionality
// CHANGE: Added dynamic height calculation based on content length
// CHANGE: Fixed deselection functionality - items can now be deselected by clicking
// CHANGE: Optimized button spacing and increased list area for better UX
// CHANGE: Fixed hydration mismatch by moving dynamic height calculation to useEffect
// CHANGE: Implemented smart scroll logic - scroll appears only when > 10 items
// CHANGE: Added dynamic height calculation based on actual item count for better UX
// CHANGE: Increased button size from w-8 h-7 to w-12 h-10 for better mobile touch targets
// CHANGE: Added "Generuoti" button to summary section aligned to the right

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';

interface DualListItem {
  id: number;
  name: string;
  level?: string;
  subject?: string;
}

interface DualListTransferProps {
  availableItems: DualListItem[];
  selectedItems: DualListItem[];
  onSelectionChange: (selected: DualListItem[]) => void;
  availableTitle?: string;
  selectedTitle?: string;
  isLoading?: boolean;
}

interface ListItemProps {
  item: DualListItem;
  isSelected: boolean;
  onSelect: (itemId: number) => void;
  isAvailable: boolean;
}

const ListItem: React.FC<ListItemProps> = ({ item, isSelected, onSelect, isAvailable }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(item.id);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(item.id);
  };

  return (
    <div 
      className={`p-2 border rounded-md cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-blue-50 border-blue-300 shadow-sm' 
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {item.name}
          </h4>
          {item.level && item.subject && (
            <p className="text-xs text-gray-500 truncate">
              {item.subject} • {item.level}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const DualListTransfer: React.FC<DualListTransferProps> = ({
  availableItems,
  selectedItems,
  onSelectionChange,
  availableTitle = "Galimi studentai",
  selectedTitle = "Pasirinkti studentai",
  isLoading = false
}) => {
  const [internalAvailable, setInternalAvailable] = useState<DualListItem[]>([]);
  const [internalSelected, setInternalSelected] = useState<DualListItem[]>(selectedItems);
  const [availableSelected, setAvailableSelected] = useState<number[]>([]);
  const [selectedSelected, setSelectedSelected] = useState<number[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Set client flag after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get scroll style based on items count
  const getScrollStyle = (itemsLength: number) => {
    if (itemsLength <= 10) {
      // No scroll for 10 or fewer items - let the content determine height
      const itemHeight = 60; // Height per item in pixels
      const calculatedHeight = Math.max(itemsLength * itemHeight, 120); // Minimum 120px for empty state
      return {
        maxHeight: `${calculatedHeight}px`,
        overflowY: 'visible' as const
      };
    }
    // Scroll for more than 10 items - fixed height with scroll
    return {
      maxHeight: '600px', // Fixed height for scroll area (10 items * 60px = 600px)
      overflowY: 'auto' as const
    };
  };

  // Update internal state when props change
  useEffect(() => {
    // Filter out already selected items from available
    const filteredAvailable = availableItems.filter(
      item => !selectedItems.find(selected => selected.id === item.id)
    );
    setInternalAvailable(filteredAvailable);
    setInternalSelected(selectedItems);
  }, [availableItems, selectedItems]);

  // Move selected items from available to selected
  const moveToSelected = () => {
    const itemsToMove = internalAvailable.filter(item => availableSelected.includes(item.id));
    const newSelected = [...internalSelected, ...itemsToMove];
    const newAvailable = internalAvailable.filter(item => !availableSelected.includes(item.id));
    
    setInternalSelected(newSelected);
    setInternalAvailable(newAvailable);
    setAvailableSelected([]);
    onSelectionChange(newSelected);
  };

  // Move selected items from selected back to available
  const moveToAvailable = () => {
    const itemsToMove = internalSelected.filter(item => selectedSelected.includes(item.id));
    const newAvailable = [...internalAvailable, ...itemsToMove];
    const newSelected = internalSelected.filter(item => !selectedSelected.includes(item.id));
    
    setInternalAvailable(newAvailable);
    setInternalSelected(newSelected);
    setSelectedSelected([]);
    onSelectionChange(newSelected);
  };

  // Move all items to selected
  const moveAllToSelected = () => {
    const newSelected = [...internalSelected, ...internalAvailable];
    setInternalSelected(newSelected);
    setInternalAvailable([]);
    setAvailableSelected([]);
    onSelectionChange(newSelected);
  };

  // Move all items back to available
  const moveAllToAvailable = () => {
    const newAvailable = [...internalAvailable, ...internalSelected];
    setInternalAvailable(newAvailable);
    setInternalSelected([]);
    setSelectedSelected([]);
    onSelectionChange([]);
  };

  // Handle checkbox selection for available items
  const handleAvailableSelect = (itemId: number) => {
    setAvailableSelected(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle checkbox selection for selected items
  const handleSelectedSelect = (itemId: number) => {
    setSelectedSelected(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Kraunama...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-12 gap-3">
        {/* Available Items */}
        <div className="col-span-5">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center justify-between">
              {availableTitle}
              <span className="text-sm font-normal text-gray-500">
                ({internalAvailable.length})
              </span>
            </h3>
            <div 
              className="space-y-2"
              style={{
                ...getScrollStyle(internalAvailable.length),
                ...(internalAvailable.length > 10 && {
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 #f1f5f9'
                })
              }}
            >
              {internalAvailable.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500 text-center text-sm">
                    Nėra galimų studentų
                  </p>
                </div>
              ) : (
                internalAvailable.map(item => (
                  <ListItem
                    key={item.id}
                    item={item}
                    isSelected={availableSelected.includes(item.id)}
                    onSelect={handleAvailableSelect}
                    isAvailable={true}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="col-span-2 flex flex-col justify-center items-center space-y-2">
          <button
            onClick={moveAllToSelected}
            disabled={internalAvailable.length === 0}
            className="w-12 h-10 flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 touch-manipulation"
            title="Perkelti visus"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={moveToSelected}
            disabled={availableSelected.length === 0}
            className="w-12 h-10 flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 touch-manipulation"
            title="Perkelti pasirinktus"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={moveToAvailable}
            disabled={selectedSelected.length === 0}
            className="w-12 h-10 flex items-center justify-center bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 touch-manipulation"
            title="Grąžinti pasirinktus"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={moveAllToAvailable}
            disabled={internalSelected.length === 0}
            className="w-12 h-10 flex items-center justify-center bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 touch-manipulation"
            title="Grąžinti visus"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Selected Items */}
        <div className="col-span-5">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center justify-between">
              {selectedTitle}
              <span className="text-sm font-normal text-gray-500">
                ({internalSelected.length})
              </span>
            </h3>
            <div 
              className="space-y-2"
              style={{
                ...getScrollStyle(internalSelected.length),
                ...(internalSelected.length > 10 && {
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 #f1f5f9'
                })
              }}
            >
              {internalSelected.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500 text-center text-sm">
                    Nepasirinkta studentų
                  </p>
                </div>
              ) : (
                internalSelected.map(item => (
                  <ListItem
                    key={item.id}
                    item={item}
                    isSelected={selectedSelected.includes(item.id)}
                    onSelect={handleSelectedSelect}
                    isAvailable={false}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Iš viso pasirinkta: <span className="font-medium">{internalSelected.length}</span> studentų
          </div>
          <button
            disabled={internalSelected.length === 0}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Generuoti
          </button>
        </div>
      </div>
    </div>
  );
};

export default DualListTransfer;
