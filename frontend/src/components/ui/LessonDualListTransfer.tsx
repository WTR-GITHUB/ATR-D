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
  selectedLessons: LessonSequenceItem[] | any[]; // Leidžiame bet kokį tipą
  onSelectionChange: (selected: any[]) => void; // Leidžiame bet kokį tipą
  availableTitle?: string;
  selectedTitle?: string;
  isLoading?: boolean;
  showDeletedWarning?: boolean; // Naujas prop įspėjimui apie ištrintas pamokas
  deletedLessonsCount?: number; // Ištrintų pamokų skaičius
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
  isLoading = false,
  showDeletedWarning = false,
  deletedLessonsCount = 0
}) => {
  const [internalAvailable, setInternalAvailable] = useState<Lesson[]>([]);
  const [internalSelected, setInternalSelected] = useState<any[]>(selectedLessons);
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
    console.log('LessonDualListTransfer - availableLessons:', availableLessons);
    console.log('LessonDualListTransfer - selectedLessons:', selectedLessons);
    
    // Keep all available lessons - don't filter out selected ones (allow repeating lessons)
    setInternalAvailable(availableLessons);
    setInternalSelected(selectedLessons);
  }, [availableLessons, selectedLessons]);

  // Convert lesson to sequence item
  const lessonToSequenceItem = (lesson: Lesson, position: number): any => {
    console.log('Converting lesson:', lesson, 'to position:', position);
    
    // Patikriname ar lesson turi reikalingus laukus
    if (!lesson || typeof lesson !== 'object') {
      console.error('lesson yra neteisingas:', lesson);
      return null;
    }
    
    if (!('id' in lesson) || !('title' in lesson) || !('subject' in lesson)) {
      console.error('lesson neturi reikalingų laukų:', lesson);
      return null;
    }
    
    const result = {
      id: lesson.id,
      lesson: lesson.id, // Išlaikome lesson ID
      title: lesson.title || '',
      subject: lesson.subject || '',
      levels: lesson.levels || '',
      topic: lesson.topic || '',
      position: position
    };
    
    console.log('Converted result:', result);
    return result;
  };

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
  const moveAllToSelected = (e?: React.MouseEvent) => {
    // Prevent default behavior if event is provided
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('moveAllToSelected called');
    console.log('internalAvailable:', internalAvailable);
    console.log('internalSelected:', internalSelected);
    
    try {
      // Patikriname ar internalAvailable yra masyvas ir turi elementų
      if (!Array.isArray(internalAvailable) || internalAvailable.length === 0) {
        console.warn('internalAvailable yra tuščias arba ne masyvas');
        return;
      }
      
      // Patikriname ar visi internalAvailable elementai turi reikalingus laukus
      const validLessons = internalAvailable.filter(lesson => 
        lesson && 
        typeof lesson === 'object' && 
        'id' in lesson && 
        'title' in lesson && 
        'subject' in lesson
      );
      
      if (validLessons.length !== internalAvailable.length) {
        console.warn('Kai kurie internalAvailable elementai neturi reikalingų laukų');
        console.log('validLessons:', validLessons);
        console.log('internalAvailable:', internalAvailable);
      }
      
      const newSequenceItems = validLessons.map((lesson, index) => {
        console.log(`Converting lesson ${lesson.id} at position ${internalSelected.length + index + 1}`);
        return lessonToSequenceItem(lesson, internalSelected.length + index + 1);
      }).filter(item => item !== null); // Filtruojame null reikšmes
      
      if (newSequenceItems.length === 0) {
        console.error('Nepavyko konvertuoti jokių pamokų');
        return;
      }
      
      const newSelected = [...internalSelected, ...newSequenceItems];
      
      console.log('newSequenceItems:', newSequenceItems);
      console.log('newSelected:', newSelected);
      
      // Patikriname ar onSelectionChange yra funkcija
      if (typeof onSelectionChange === 'function') {
        console.log('Calling onSelectionChange with:', newSelected);
        
        // Patikriname ar newSelected turi teisingą struktūrą
        const isValidData = newSelected.every(item => 
          item && 
          typeof item === 'object' && 
          'id' in item && 
          'title' in item && 
          'subject' in item
        );
        
        if (!isValidData) {
          console.error('newSelected neturi teisingos struktūros:', newSelected);
          return;
        }
        
        // Keep lessons in available list (don't remove them)
        setInternalSelected(newSelected);
        setAvailableSelected([]);
        
        try {
          onSelectionChange(newSelected);
          console.log('onSelectionChange called successfully');
        } catch (error) {
          console.error('Error calling onSelectionChange:', error);
        }
        
        console.log('moveAllToSelected completed successfully');
      } else {
        console.error('onSelectionChange nėra funkcija:', typeof onSelectionChange);
      }
    } catch (error) {
      console.error('Error in moveAllToSelected:', error);
    }
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
    <div className="space-y-4">
      {/* Warning about deleted lessons */}
      {showDeletedWarning && deletedLessonsCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Dėmesio: Rasta ištrintų pamokų
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Jūsų plane yra {deletedLessonsCount} pamokų, kurios buvo ištrintos. 
                  Jos bus automatiškai pašalintos iš plano išsaugant.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main component */}
      <div className="grid grid-cols-12 gap-4">
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
            onClick={(e) => moveAllToSelected(e)}
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
