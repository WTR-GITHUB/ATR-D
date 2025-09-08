// frontend/src/app/mentors/activities/components/AttendanceMarker.tsx

// Lankomumo žymėjimo komponentas - rodo ir leidžia keisti mokinio lankomumo būseną
// Palaiko keturias būsenas: dalyvavo, nedalyvavo, paliko, pateisinta // CHANGE: Pakeista 'vėlavo' į 'paliko'
// CHANGE: Atnaujintos spalvos su aiškesniais skirtumais - aktyvūs: tamsūs su baltomis ikonoms, neaktyvūs: šviesūs su spalvotomis ikonoms
// CHANGE: Pridėtas "Išvalyti" mygtukas lankomumo būsenos išvalymui (null reikšmė)

'use client';

import React from 'react';
import { 
  UserCheck, 
  UserX, 
  Footprints, 
  MessagesSquare,
  X
} from 'lucide-react';
import { AttendanceStatus } from '../types';

interface AttendanceMarkerProps {
  status: AttendanceStatus;
  active: boolean;
  onClick: (status: AttendanceStatus) => void;
  size?: 'sm' | 'md' | 'lg';
}

// Lankomumo mygtuko komponentas
// Vizualizuoja ir leidžia keisti mokinio lankomumo būseną pagal paveiksliuko dizainą
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

  // Mygtuko stilių generavimas su aiškesniais skirtumais tarp aktyvių ir neaktyvių būsenų
  const getButtonStyle = () => {
    const baseStyle = `${getSizeClasses()} rounded flex items-center justify-center transition-colors cursor-pointer`;
    
    switch (status) {
      case 'present':
        return `${baseStyle} ${active 
          ? 'bg-green-600 text-white shadow-md' 
          : 'bg-green-100 text-green-600 border border-green-300 hover:bg-green-200'}`;
      case 'absent':
        return `${baseStyle} ${active 
          ? 'bg-pink-600 text-white shadow-md' 
          : 'bg-pink-100 text-pink-600 border border-pink-300 hover:bg-pink-200'}`;
      case 'left': // CHANGE: Pakeista 'late' į 'left'
        return `${baseStyle} ${active 
          ? 'bg-yellow-600 text-white shadow-md' 
          : 'bg-yellow-100 text-yellow-600 border border-yellow-300 hover:bg-yellow-200'}`;
      case 'excused':
        return `${baseStyle} ${active 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-blue-100 text-blue-600 border border-blue-300 hover:bg-blue-200'}`;
      default:
        return `${baseStyle} bg-gray-200 text-gray-400 border border-gray-300`;
    }
  };

  // Ikonos pasirinkimas pagal lankomumo būseną (pagal paveiksliuko ikonas)
  const getIcon = () => {
    const iconSize = getIconSize();
    
    switch (status) {
      case 'present':
        return <UserCheck size={iconSize} />;
      case 'absent':
        return <UserX size={iconSize} />;
      case 'left': // CHANGE: Pakeista 'late' į 'left', Clock → Footprints
        return <Footprints size={iconSize} />;
      case 'excused': // CHANGE: FileText → MessagesSquare
        return <MessagesSquare size={iconSize} />;
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
      case 'left': // CHANGE: Pakeista 'late' į 'left'
        return 'Paliko'; // CHANGE: Pakeista 'Vėlavo' į 'Paliko'
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
  isActivityActive?: boolean; // CHANGE: Pridėtas veiklos aktyvumo prop
  size?: 'sm' | 'md' | 'lg';
}

export const AttendanceButtonGroup: React.FC<AttendanceButtonGroupProps> = ({
  currentStatus,
  onStatusChange,
  isActivityActive = false, // CHANGE: Pridėtas veiklos aktyvumo parametras
  size = 'md'
}) => {
  const statuses: AttendanceStatus[] = ['present', 'left', 'absent', 'excused']; // CHANGE: Pakeista 'late' į 'left'

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

  return (
    <div className="flex space-x-2">
      {statuses.map(status => (
        <AttendanceMarker
          key={status}
          status={status}
          active={currentStatus === status && isActivityActive} // CHANGE: Aktyvus tik kai veikla aktyvi
          onClick={onStatusChange}
          size={size}
        />
      ))}
    </div>
  );
};

export default AttendanceMarker;
