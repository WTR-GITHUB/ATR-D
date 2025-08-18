// frontend/src/app/dashboard/mentors/activities/components/AttendanceMarker.tsx

// Lankomumo žymėjimo komponentas
// Atsako už lankomumo būsenos vizualizavimą ir interaktyvų keitimą
// Palaiko keturias būsenas: dalyvavo, nedalyvavo, vėlavo, pateisinta
// CHANGE: Sukurtas atskiras AttendanceMarker komponentas lankomumo mygtukų valdymui su aiškia tipizacija

'use client';

import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AttendanceStatus } from '../types';

interface AttendanceMarkerProps {
  status: AttendanceStatus;
  active: boolean;
  onClick: (status: AttendanceStatus) => void;
  size?: 'sm' | 'md' | 'lg';
}

// Lankomumo mygtuko komponentas
// Vizualizuoja ir leidžia keisti mokinio lankomumo būseną
const AttendanceMarker: React.FC<AttendanceMarkerProps> = ({ 
  status, 
  active, 
  onClick, 
  size = 'md' 
}) => {
  // Mygtuko dydžio nustatymas
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6';
      case 'lg':
        return 'w-10 h-10';
      default:
        return 'w-8 h-8';
    }
  };

  // Ikonos dydžio nustatymas
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 12;
      case 'lg':
        return 20;
      default:
        return 16;
    }
  };

  // Mygtuko stilių generavimas pagal būseną ir aktyvumą
  const getButtonStyle = () => {
    const baseStyle = `${getSizeClasses()} rounded-full flex items-center justify-center border-2 transition-all cursor-pointer hover:scale-105`;
    
    switch (status) {
      case 'present':
        return `${baseStyle} ${active ? 'bg-green-500 border-green-500 text-white shadow-md' : 'border-green-300 text-green-500 hover:bg-green-50'}`;
      case 'absent':
        return `${baseStyle} ${active ? 'bg-red-500 border-red-500 text-white shadow-md' : 'border-red-300 text-red-500 hover:bg-red-50'}`;
      case 'late':
        return `${baseStyle} ${active ? 'bg-yellow-500 border-yellow-500 text-white shadow-md' : 'border-yellow-300 text-yellow-500 hover:bg-yellow-50'}`;
      case 'excused':
        return `${baseStyle} ${active ? 'bg-blue-500 border-blue-500 text-white shadow-md' : 'border-blue-300 text-blue-500 hover:bg-blue-50'}`;
      default:
        return `${baseStyle} border-gray-300 text-gray-400`;
    }
  };

  // Ikonos pasirinkimas pagal lankomumo būseną
  const getIcon = () => {
    const iconSize = getIconSize();
    
    switch (status) {
      case 'present':
        return <CheckCircle size={iconSize} />;
      case 'absent':
        return <XCircle size={iconSize} />;
      case 'late':
        return <Clock size={iconSize} />;
      case 'excused':
        return <AlertCircle size={iconSize} />;
      default:
        return null;
    }
  };

  // Tooltip teksto generavimas
  const getTooltipText = () => {
    switch (status) {
      case 'present':
        return 'Dalyvavo';
      case 'absent':
        return 'Nedalyvavo';
      case 'late':
        return 'Vėlavo';
      case 'excused':
        return 'Pateisinta';
      default:
        return '';
    }
  };

  return (
    <button
      onClick={() => onClick(status)}
      className={getButtonStyle()}
      title={getTooltipText()}
      aria-label={`Pažymėti kaip: ${getTooltipText()}`}
    >
      {getIcon()}
    </button>
  );
};

// Lankomumo mygtukų grupės komponentas
// Sujungia visus keturis lankomumo mygtukus vienoje grupėje
interface AttendanceButtonGroupProps {
  currentStatus: AttendanceStatus | null;
  onStatusChange: (status: AttendanceStatus) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const AttendanceButtonGroup: React.FC<AttendanceButtonGroupProps> = ({
  currentStatus,
  onStatusChange,
  size = 'md'
}) => {
  const statuses: AttendanceStatus[] = ['present', 'late', 'absent', 'excused'];

  return (
    <div className="flex space-x-2">
      {statuses.map(status => (
        <AttendanceMarker
          key={status}
          status={status}
          active={currentStatus === status}
          onClick={onStatusChange}
          size={size}
        />
      ))}
    </div>
  );
};

export default AttendanceMarker;
