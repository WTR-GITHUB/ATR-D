import React from 'react';
import { MapPin, User, BookOpen } from 'lucide-react';

interface ScheduleCardProps {
  subject: string;
  classroom: string;
  lesson?: string; // Pamokos pavadinimas (neprivaloma)
  size?: 'small' | 'medium' | 'tiny';
}

export default function ScheduleCard({ 
  subject, 
  classroom, 
  lesson, 
  size = 'small'
}: ScheduleCardProps) {
  const baseClasses = "mb-1 p-1 rounded text-white";
  const hasLesson = !!lesson; // Ar priskirta pamoka
  const variantClasses = hasLesson ? "bg-green-600" : "bg-gray-500";
  const sizeClasses = {
    tiny: "text-xs p-1",
    small: "text-xs p-2",
    medium: "text-sm p-2"
  };

  // Tiny variantas - tik dalykas ir klasė
  if (size === 'tiny') {
    return (
      <div className={`${baseClasses} ${variantClasses} ${sizeClasses.tiny} text-center`}>
        <div className="font-medium truncate text-xs">
          {subject}
        </div>
        <div className="text-blue-100 truncate text-xs">
          {classroom}
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${variantClasses} ${sizeClasses[size]}`}>
      {/* Dalykas */}
      <div className="font-medium truncate mb-1">
        <BookOpen className="inline w-3 h-3 mr-1" />
        {subject}
      </div>
      
      {/* Klasė */}
      <div className="text-blue-100 truncate flex items-center mb-1">
        <MapPin className="w-3 h-3 mr-1" />
        {classroom}
      </div>
      
      {/* Pamoka (jei priskirta) */}
      {lesson && (
        <div className="text-blue-100 truncate mb-1">
          <User className="inline w-3 h-3 mr-1" />
          {lesson}
        </div>
      )}
    </div>
  );
} 