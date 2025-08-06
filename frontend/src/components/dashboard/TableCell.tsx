import React from 'react';
import { MapPin, User, BookOpen } from 'lucide-react';

interface TableCellProps {
  subject: string;
  classroom: string;
  lesson?: string; // Pamokos pavadinimas (neprivaloma)
}

export default function TableCell({ 
  subject, 
  classroom, 
  lesson
}: TableCellProps) {
  const hasLesson = !!lesson; // Ar priskirta pamoka
  const bgColor = hasLesson ? "bg-green-600" : "bg-gray-500";

  return (
    <div className={`${bgColor} text-white text-xs p-1 rounded text-center min-h-[60px] flex flex-col justify-center`}>
      {/* Dalykas */}
      <div className="font-medium truncate mb-1">
        <BookOpen className="inline w-2 h-2 mr-1" />
        {subject}
      </div>
      
      {/* Klasė */}
      <div className="text-blue-100 truncate text-xs">
        <MapPin className="inline w-2 h-2 mr-1" />
        {classroom}
      </div>
      
      {/* Pamoka (jei priskirta) */}
      {lesson && (
        <div className="text-blue-100 truncate text-xs mt-1">
          <User className="inline w-2 h-2 mr-1" />
          {lesson}
        </div>
      )}
    </div>
  );
} 