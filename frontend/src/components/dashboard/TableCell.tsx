import React, { useMemo, useCallback } from 'react';
import { MapPin, User, BookOpen } from 'lucide-react';

interface TableCellProps {
  subject: string;
  classroom: string;
  lesson?: string; // Pamokos pavadinimas (neprivaloma)
}

// Custom hook TableCell optimizacijai
const useTableCellOptimization = (subject: string, classroom: string, lesson?: string) => {
  // Memoizuojame pamokų duomenis
  const lessonData = useMemo(() => {
    const hasLesson = !!lesson;
    const bgColor = hasLesson ? "bg-green-600" : "bg-gray-500";
    
    return {
      hasLesson,
      bgColor,
      lessonDisplay: lesson || undefined
    };
  }, [lesson]);

  // Memoizuojame ikonas
  const icons = useMemo(() => ({
    book: <BookOpen className="inline w-2 h-2 mr-1" />,
    mapPin: <MapPin className="inline w-2 h-2 mr-1" />,
    user: <User className="inline w-2 h-2 mr-1" />
  }), []);

  // Memoizuojame CSS klases
  const cssClasses = useMemo(() => ({
    container: `${lessonData.bgColor} text-white text-xs p-1 rounded text-left min-h-[60px] flex flex-col justify-center w-full whitespace-normal break-all`,
    subject: "font-medium mb-1 whitespace-normal break-all",
    classroom: "text-blue-100 text-xs whitespace-normal break-all",
    lesson: "text-blue-100 text-xs mt-1 whitespace-normal break-all"
  }), [lessonData.bgColor]);

  return {
    lessonData,
    icons,
    cssClasses
  };
};

// Optimizuotas TableCell komponentas su React.memo
const TableCell = React.memo(({ 
  subject, 
  classroom, 
  lesson
}: TableCellProps) => {
  const { lessonData, icons, cssClasses } = useTableCellOptimization(subject, classroom, lesson);

  return (
    <div className={cssClasses.container}>
      {/* Dalykas */}
      <div className={cssClasses.subject}>
        {icons.book}
        {subject}
      </div>
      
      {/* Klasė */}
      <div className={cssClasses.classroom}>
        {icons.mapPin}
        {classroom}
      </div>
      
      {/* Pamoka (jei priskirta) */}
      {lessonData.lessonDisplay && (
        <div className={cssClasses.lesson}>
          {icons.user}
          {lessonData.lessonDisplay}
        </div>
      )}
    </div>
  );
});

// Priskiriame displayName komponentui
TableCell.displayName = 'TableCell';

export default TableCell; 