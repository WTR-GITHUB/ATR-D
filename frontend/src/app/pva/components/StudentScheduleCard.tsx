// frontend/src/app/pva/components/StudentScheduleCard.tsx

// Studento tvarkaraščio kortelės komponentas - rodo IMUPlan duomenis
// Rodo subject, klasę, lygį, pamokos pavadinimą ir attendance status'ą su paveiksliuku
// CHANGE: Sukurtas naujas komponentas studento tvarkaraščio kortelėms

'use client';

import React from 'react';
import { MapPin, BookOpen } from 'lucide-react';
import AttendanceMarker from '@/app/mentors/activities/components/AttendanceMarker';
import { AttendanceStatus } from '@/app/mentors/activities/types';

interface StudentScheduleCardProps {
  item: {
    id: number;
    lesson_title: string;
    lesson_subject: string;
    global_schedule_time: string;
    global_schedule_period_name: string;
    global_schedule_classroom: string;
    global_schedule_level: string;
    attendance_status: AttendanceStatus | null;
    attendance_status_display: string;
    notes?: string;
  };
  onAttendanceChange?: (itemId: number, status: AttendanceStatus) => void;
  isClickable?: boolean;
}

const StudentScheduleCard: React.FC<StudentScheduleCardProps> = ({
  item,
  onAttendanceChange,
  isClickable = false
}) => {
  // Konvertuojame attendance_status į reikiamą formatą
  const getAttendanceStatus = (): AttendanceStatus => {
    if (!item.attendance_status) return 'present'; // Default status
    return item.attendance_status;
  };

  // Spalvų schema pagal dalykų pavadinimus
  const getSubjectColor = (subject: string) => {
    const hash = subject.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-red-100 text-red-800 border-red-200'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const handleAttendanceClick = (status: AttendanceStatus) => {
    if (onAttendanceChange) {
      onAttendanceChange(item.id, status);
    }
  };

  return (
    <div className={`
      bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200
      ${isClickable ? 'cursor-pointer hover:border-blue-300' : ''}
    `}>
      {/* Antraštė su dalyku ir laiku */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <BookOpen className="h-4 w-4 text-gray-500" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSubjectColor(item.lesson_subject)}`}>
              {item.lesson_subject}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 text-sm leading-tight">
            {item.lesson_title}
          </h4>
        </div>
        
        {/* Attendance status su paveiksliuku */}
        <div className="flex-shrink-0 ml-2">
          <AttendanceMarker
            status={getAttendanceStatus()}
            active={true}
            onClick={handleAttendanceClick}
            size="sm"
          />
        </div>
      </div>

      {/* Informacijos eilutės */}
      <div className="space-y-2">
        {/* Klasė ir lygis */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{item.global_schedule_classroom}</span>
          <span className="text-gray-400">•</span>
          <span>{item.global_schedule_level}</span>
        </div>

        {/* Pastabos, jei yra */}
        {item.notes && (
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
            {item.notes}
          </div>
        )}
      </div>

      {/* Attendance status display */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Lankomumas:</span>
          <span className="text-xs font-medium text-gray-700">
            {item.attendance_status_display}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudentScheduleCard;
