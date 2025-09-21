// frontend/src/app/pva/components/AttendanceFilter.tsx

// Vizualus lankomumo filtro komponentas PVA studento detalių puslapiui
// Rodo 5 ikonų mygtukus filtravimui pagal lankomumo statusą + išvalyti mygtukas
// CHANGE: Sukurtas vizualus filtras vietoj teksto įvedimo lauko

'use client';

import React from 'react';
import {
  UserCheck,
  UserX,
  Footprints,
  MessagesSquare,
  Hourglass
} from 'lucide-react';

interface AttendanceFilterProps {
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
}

const AttendanceFilter: React.FC<AttendanceFilterProps> = ({
  selectedStatus,
  onStatusChange
}) => {
  const statusOptions = [
    {
      value: 'present',
      icon: UserCheck,
      className: 'bg-green-600 text-white shadow-md',
      hoverClassName: 'hover:bg-green-700',
      inactiveClassName: 'bg-green-100 text-green-600 border border-green-300 hover:bg-green-200',
      title: 'Dalyvavo'
    },
    {
      value: 'absent',
      icon: UserX,
      className: 'bg-pink-600 text-white shadow-md',
      hoverClassName: 'hover:bg-pink-700',
      inactiveClassName: 'bg-pink-100 text-pink-600 border border-pink-300 hover:bg-pink-200',
      title: 'Nedalyvavo'
    },
    {
      value: 'left',
      icon: Footprints,
      className: 'bg-yellow-600 text-white shadow-md',
      hoverClassName: 'hover:bg-yellow-700',
      inactiveClassName: 'bg-yellow-100 text-yellow-600 border border-yellow-300 hover:bg-yellow-200',
      title: 'Paliko'
    },
    {
      value: 'excused',
      icon: MessagesSquare,
      className: 'bg-blue-600 text-white shadow-md',
      hoverClassName: 'hover:bg-blue-700',
      inactiveClassName: 'bg-blue-100 text-blue-600 border border-blue-300 hover:bg-blue-200',
      title: 'Pateisinta'
    },
    {
      value: null,
      icon: Hourglass,
      className: 'bg-gray-400 text-white shadow-md',
      hoverClassName: 'hover:bg-gray-500',
      inactiveClassName: 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200',
      title: 'Pamoka neįvyko'
    }
  ];

  const handleStatusClick = (status: string | null) => {
    // Jei paspaustas tas pats statusas - išjungti filtrą
    if (selectedStatus === status) {
      onStatusChange(null);
    } else {
      onStatusChange(status);
    }
  };


  return (
    <div className="flex items-center space-x-1">
      {/* Ikonų mygtukai */}
      {statusOptions.map((option) => {
        const Icon = option.icon;
        const isActive = selectedStatus === option.value;
        const buttonClass = isActive 
          ? `${option.className} ${option.hoverClassName}` 
          : option.inactiveClassName;

        return (
          <button
            key={option.value || 'null'}
            onClick={() => handleStatusClick(option.value)}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors cursor-pointer ${buttonClass}`}
            title={option.title}
            aria-label={`Filtruoti pagal: ${option.title}`}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
};

export default AttendanceFilter;
