// frontend/src/components/ui/LessonDualListTransfer.tsx

// Dual list transfer component specifically designed for lesson selection and sequencing
// Allows moving lessons from available list to sequence with drag & drop reordering
// CHANGE: Created new specialized dual list transfer component for lesson management
// CHANGE: Includes position-based ordering with drag & drop functionality
// CHANGE: Integrated sequence validation and visual feedback for lesson ordering
// CHANGE: Removed individual lesson removal functionality - pamokos can only be moved back via control buttons
// CHANGE: Lessons remain in available list when moved to sequence - allows repeating same lesson multiple times

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, GripVertical } from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  subject: string;
  levels: string;
  topic: string;
  created_at?: string;
}

interface LessonSequenceItem {
  id: number;
  title: string;
  subject: string;
  levels: string;
  topic: string;
  position: number;
}

interface LessonDualListTransferProps {
  availableLessons: Lesson[];
  selectedLessons: LessonSequenceItem[];
  onSelectionChange: (selected: LessonSequenceItem[]) => void;
  availableTitle?: string;
  selectedTitle?: string;
  isLoading?: boolean;
}

interface LessonItemProps {
  lesson: Lesson;
  isSelected: boolean;
  onSelect: (lessonId: number) => void;
}

interface SequenceItemProps {
  item: LessonSequenceItem;
  isSelected: boolean;
  onSelect: (itemId: number) => void;
  onDragStart: (e: React.DragEvent, position: number) => void;
  onDragOver: (e: React.DragEvent, position: number) => void;
  onDrop: (e: React.DragEvent, targetPosition: number) => void;
  onDragEnd: () => void;
  draggedPosition: number | null;
  dropTargetPosition: number | null;
}

const LessonItem: React.FC<LessonItemProps> = ({ lesson, isSelected, onSelect }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(lesson.id);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(lesson.id);
  };

  return (
    <div 
      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-blue-50 border-blue-300 shadow-sm' 
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">
            {lesson.title}
          </h4>
          <p className="text-sm text-gray-600 truncate">
            {lesson.subject} • {lesson.levels} • {lesson.topic}
          </p>
        </div>
      </div>
    </div>
  );
};

const SequenceItem: React.FC<SequenceItemProps> = ({ 
  item, 
  isSelected, 
  onSelect, 
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  draggedPosition,
  dropTargetPosition
}) => {
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
      className={`p-3 border rounded-lg flex items-center space-x-3 transition-all duration-200 cursor-move ${
        draggedPosition === item.position
          ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
          : dropTargetPosition === item.position
          ? 'border-blue-400 bg-blue-100'
          : isSelected
          ? 'bg-blue-50 border-blue-300 shadow-sm'
          : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, item.position)}
      onDragOver={(e) => onDragOver(e, item.position)}
      onDrop={(e) => onDrop(e, item.position)}
      onDragEnd={onDragEnd}
      onClick={handleClick}
    >
      <GripVertical className="w-4 h-4 text-gray-400 cursor-move flex-shrink-0" />
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleCheckboxChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">
          {item.title}
        </h4>
        <p className="text-sm text-gray-600 truncate">
          {item.subject} • {item.levels} • {item.topic}
        </p>
      </div>
      <div className="flex items-center flex-shrink-0">
        <span className="text-sm font-medium text-gray-500">#{item.position}</span>
      </div>
    </div>
  );
};

const LessonDualListTransfer: React.FC<LessonDualListTransferProps> = ({
  availableLessons,
  selectedLessons,
  onSelectionChange,
  availableTitle = "Galimos pamokos",
  selectedTitle = "Pasirinktos pamokos",
  isLoading = false
}) => {
  const [internalAvailable, setInternalAvailable] = useState<Lesson[]>([]);
  const [internalSelected, setInternalSelected] = useState<LessonSequenceItem[]>(selectedLessons);
  const [availableSelected, setAvailableSelected] = useState<number[]>([]);
  const [selectedSelected, setSelectedSelected] = useState<number[]>([]);
  const [draggedPosition, setDraggedPosition] = useState<number | null>(null);
  const [dropTargetPosition, setDropTargetPosition] = useState<number | null>(null);

  // Get scroll style based on items count
  const getScrollStyle = (itemsLength: number) => {
    if (itemsLength <= 8) {
      const itemHeight = 70;
      const calculatedHeight = Math.max(itemsLength * itemHeight, 120);
      return {
        maxHeight: `${calculatedHeight}px`,
        overflowY: 'visible' as const
      };
    }
    return {
      maxHeight: '560px',
      overflowY: 'auto' as const
    };
  };

  // Update internal state when props change
  useEffect(() => {
    // Keep all available lessons - don't filter out selected ones (allow repeating lessons)
    setInternalAvailable(availableLessons);
    setInternalSelected(selectedLessons);
  }, [availableLessons, selectedLessons]);

  // Convert lesson to sequence item
  const lessonToSequenceItem = (lesson: Lesson, position: number): LessonSequenceItem => ({
    id: lesson.id,
    title: lesson.title,
    subject: lesson.subject,
    levels: lesson.levels,
    topic: lesson.topic,
    position
  });

  // Move selected lessons from available to sequence
  const moveToSelected = () => {
    const lessonsToMove = internalAvailable.filter(lesson => availableSelected.includes(lesson.id));
    const newSequenceItems = lessonsToMove.map((lesson, index) => 
      lessonToSequenceItem(lesson, internalSelected.length + index + 1)
    );
    const newSelected = [...internalSelected, ...newSequenceItems];
    
    // Keep lessons in available list (don't remove them)
    setInternalSelected(newSelected);
    setAvailableSelected([]);
    onSelectionChange(newSelected);
  };

  // Move selected sequence items back to available (remove from sequence)
  const moveToAvailable = () => {
    const newSelected = internalSelected.filter(item => !selectedSelected.includes(item.id));
    
    // Reorder positions
    const reorderedSelected = newSelected.map((item, index) => ({ ...item, position: index + 1 }));
    
    // Don't add items back to available - they're already there
    setInternalSelected(reorderedSelected);
    setSelectedSelected([]);
    onSelectionChange(reorderedSelected);
  };

  // Move all lessons to sequence
  const moveAllToSelected = () => {
    const newSequenceItems = internalAvailable.map((lesson, index) => 
      lessonToSequenceItem(lesson, internalSelected.length + index + 1)
    );
    const newSelected = [...internalSelected, ...newSequenceItems];
    
    // Keep lessons in available list (don't remove them)
    setInternalSelected(newSelected);
    setAvailableSelected([]);
    onSelectionChange(newSelected);
  };

  // Move all sequence items back to available (clear sequence)
  const moveAllToAvailable = () => {
    // Don't add items back to available - they're already there
    // Just clear the sequence
    setInternalSelected([]);
    setSelectedSelected([]);
    onSelectionChange([]);
  };

  // Handle checkbox selection for available lessons
  const handleAvailableSelect = (lessonId: number) => {
    setAvailableSelected(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  // Handle checkbox selection for sequence items
  const handleSelectedSelect = (itemId: number) => {
    setSelectedSelected(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };



  // Drag & Drop functionality
  const handleDragStart = (e: React.DragEvent, position: number) => {
    e.dataTransfer.setData('text/plain', position.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedPosition(position);
  };

  const handleDragOver = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetPosition(position);
  };

  const handleDrop = (e: React.DragEvent, targetPosition: number) => {
    e.preventDefault();
    const fromPosition = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (fromPosition !== targetPosition) {
      const newList = [...internalSelected];
      const [movedItem] = newList.splice(fromPosition - 1, 1);
      newList.splice(targetPosition - 1, 0, movedItem);
      
      // Reorder positions
      const reorderedList = newList.map((item, index) => ({ ...item, position: index + 1 }));
      
      setInternalSelected(reorderedList);
      onSelectionChange(reorderedList);
    }
    setDraggedPosition(null);
    setDropTargetPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedPosition(null);
    setDropTargetPosition(null);
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
        {/* Available Lessons */}
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
                ...(internalAvailable.length > 8 && {
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 #f1f5f9'
                })
              }}
            >
              {internalAvailable.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500 text-center text-sm">
                    Nėra galimų pamokų
                  </p>
                </div>
              ) : (
                internalAvailable.map(lesson => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    isSelected={availableSelected.includes(lesson.id)}
                    onSelect={handleAvailableSelect}
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
            className="w-12 h-10 flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            title="Perkelti visas"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={moveToSelected}
            disabled={availableSelected.length === 0}
            className="w-12 h-10 flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            title="Perkelti pasirinktas"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={moveToAvailable}
            disabled={selectedSelected.length === 0}
            className="w-12 h-10 flex items-center justify-center bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            title="Grąžinti pasirinktas"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={moveAllToAvailable}
            disabled={internalSelected.length === 0}
            className="w-12 h-10 flex items-center justify-center bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            title="Grąžinti visas"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Selected Lessons Sequence */}
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
                ...(internalSelected.length > 8 && {
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 #f1f5f9'
                })
              }}
            >
              {internalSelected.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500 text-center text-sm">
                    Pamokų seka tuščia
                  </p>
                </div>
              ) : (
                internalSelected.map(item => (
                  <SequenceItem
                    key={item.position}
                    item={item}
                    isSelected={selectedSelected.includes(item.id)}
                    onSelect={handleSelectedSelect}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    draggedPosition={draggedPosition}
                    dropTargetPosition={dropTargetPosition}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Pamokų sekoje: <span className="font-medium">{internalSelected.length}</span> pamokų
        </div>
      </div>
    </div>
  );
};

export default LessonDualListTransfer;
