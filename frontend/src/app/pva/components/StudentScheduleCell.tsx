// frontend/src/app/pva/components/StudentScheduleCell.tsx

// Komponentas kalendoriaus ląstelėms su IMUPlan duomenimis
// Rodo vieną ar kelias pamokas vienoje ląstelėje, jei jos tuo pačiu laiku
// CHANGE: Atnaujintas komponentas, kad rodytų kelias pamokas vienoje ląstelėje

'use client';

import React from 'react';
import { MapPin, BookOpen } from 'lucide-react';
import AttendanceMarker from '@/app/mentors/activities/components/AttendanceMarker';
import { AttendanceStatus } from '@/app/mentors/activities/types';

interface StudentScheduleItem {
  id: number;
  lesson_title: string;
  lesson_subject: string;
  global_schedule_time: string;
  global_schedule_period_name: string;
  global_schedule_classroom: string;
  global_schedule_level: string;
  attendance_status: AttendanceStatus | null;
  attendance_status_display: string;
}

interface StudentScheduleCellProps {
  items?: StudentScheduleItem[];
  onAttendanceChange?: (itemId: number, status: AttendanceStatus) => void;
  onItemClick?: (itemId: number) => void;
  isEmpty?: boolean;
}

const StudentScheduleCell: React.FC<StudentScheduleCellProps> = ({
  items = [],
  onAttendanceChange,
  onItemClick,
  isEmpty = false
}) => {
  // Spalvų schema pagal dalykų pavadinimus
  const getSubjectColor = (subject: string) => {
    const hash = subject.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const colors = [
      'bg-blue-500 border-blue-600',
      'bg-purple-500 border-purple-600',
      'bg-green-500 border-green-600',
      'bg-red-500 border-red-600',
      'bg-yellow-500 border-yellow-600',
      'bg-indigo-500 border-indigo-600',
      'bg-pink-500 border-pink-600',
      'bg-teal-500 border-teal-600'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const getAttendanceStatus = (item: StudentScheduleItem): AttendanceStatus => {
    if (!item?.attendance_status) return 'present';
    return item.attendance_status;
  };

  const handleAttendanceClick = (e: React.MouseEvent, itemId: number, status: AttendanceStatus) => {
    e.stopPropagation(); // Sustabdome event bubbling
    if (onAttendanceChange) {
      onAttendanceChange(itemId, status);
    }
  };

  const handleCellClick = (itemId: number) => {
    if (onItemClick) {
      onItemClick(itemId);
    }
  };

  // Tuščia ląstelė
  if (isEmpty || items.length === 0) {
    return (
      <div className="w-full h-full min-h-20 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-400 text-xs">-</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-20 space-y-1">
      {items.map((item, index) => (
        <div 
          key={item.id}
          className={`
            w-full rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
            ${getSubjectColor(item.lesson_subject)} text-white
            ${items.length > 1 ? 'h-8' : 'h-full'}
          `}
          onClick={() => handleCellClick(item.id)}
        >
          <div className="p-1 h-full flex flex-col justify-between">
            {/* Antraštė su dalyku ir attendance status'u */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs leading-tight truncate">
                  {item.lesson_subject}
                </div>
                {items.length === 1 && (
                  <div className="text-xs opacity-90 leading-tight truncate">
                    {item.lesson_title}
                  </div>
                )}
              </div>
              
              {/* Attendance status su paveiksliuku */}
              <div className="flex-shrink-0 ml-1">
                <AttendanceMarker
                  status={getAttendanceStatus(item)}
                  active={true}
                  onClick={(status) => handleAttendanceClick({} as React.MouseEvent, item.id, status)}
                  size="sm"
                />
              </div>
            </div>

            {/* Apatinė informacija tik jei viena kortelė */}
            {items.length === 1 && (
              <div className="space-y-1">
                {/* Klasė */}
                <div className="flex items-center space-x-1 text-xs opacity-80">
                  <MapPin size={10} />
                  <span className="truncate">{item.global_schedule_classroom}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentScheduleCell;