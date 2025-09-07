// frontend/src/app/pva/components/AttendanceStatusIcon.tsx

// Lankomumo būsenos ikonos komponentas PVA studento detalių puslapiui
// Rodo spalvotas ikonas pagal lankomumo statusą lentelėje
// CHANGE: Sukurtas atskiras komponentas lankomumo ikonų atvaizdavimui

'use client';

import React from 'react';
import {
  UserCheck,
  UserX,
  Footprints,
  MessagesSquare,
  Hourglass
} from 'lucide-react';

interface AttendanceStatusIconProps {
  status: string | null | undefined;
  size?: number;
}

const AttendanceStatusIcon: React.FC<AttendanceStatusIconProps> = ({ 
  status, 
  size = 20 
}) => {
  const statusConfig = {
    'present': { 
      icon: UserCheck,
      className: 'bg-green-600 text-white shadow-md',
      title: 'Dalyvavo'
    },
    'absent': { 
      icon: UserX,
      className: 'bg-pink-600 text-white shadow-md', 
      title: 'Nedalyvavo'
    },
    'left': { 
      icon: Footprints,
      className: 'bg-yellow-600 text-white shadow-md',
      title: 'Paliko'
    },
    'excused': { 
      icon: MessagesSquare,
      className: 'bg-blue-600 text-white shadow-md',
      title: 'Pateisinta'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    icon: Hourglass,
    className: 'bg-gray-400 text-white shadow-md',
    title: 'Pamoka neįvyko'
  };
  
  const Icon = config.icon;

  return (
    <div 
      className={`w-8 h-8 rounded flex items-center justify-center ${config.className}`}
      title={config.title}
    >
      <Icon size={size} />
    </div>
  );
};

export default AttendanceStatusIcon;
