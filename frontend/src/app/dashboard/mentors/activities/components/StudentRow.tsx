// frontend/src/app/dashboard/mentors/activities/components/StudentRow.tsx

// Universalus mokinio eilutės komponentas su accordion funkcionalumu
// Rodo pagrindinę mokinio informaciją ir leidžia išplėsti papildomus vertinimo laukus
// Integruoja lankomumo žymėjimą, aktyvumo vertinimą ir pastabų rašymą
// CHANGE: Sujungtas su StudentRowForLesson - dabar vienas komponentas dirba su abiem duomenų tipais
// CHANGE: Pridėtas useGrades hook esamo vertinimo gavimui iš duomenų bazės

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, MessageSquare, User } from 'lucide-react';
import { AttendanceButtonGroup } from './AttendanceMarker';
import {
  Student,
  IMUPlan,
  AttendanceStatus
} from '../types';
import GradeSelector from './GradeSelector';
import useGrades from '@/hooks/useGrades';
import { useAuth } from '@/hooks/useAuth';

// Tipas, kuris gali priimti abu duomenų tipus
type StudentData = Student | IMUPlan;

interface StudentRowProps {
  student: StudentData;
  onAttendanceChange: (studentId: number, status: AttendanceStatus) => void;
  // Naujas prop nustatyti, ar tai IMUPlan duomenys
  isIMUPlan?: boolean;
  // CHANGE: Pridėtas pamokos ID prop'as
  lessonId?: number;
}

// Mokinio eilutės komponentas
// Pagrindinis komponentas, atvaizduojantis mokinio informaciją ir vertinimo galimybes
const StudentRow: React.FC<StudentRowProps> = ({ 
  student, 
  onAttendanceChange,
  isIMUPlan = false,
  lessonId
}) => {
  const [expanded, setExpanded] = useState(false);
  const [currentGrade, setCurrentGrade] = useState<any>(null);
  
  // CHANGE: Naudojame useGrades hook'ą esamo vertinimo gavimui
  const { getStudentGrade, isLoading: gradeLoading, error: gradeError } = useGrades();
  
  // CHANGE: Gaunome prisijungusio vartotojo duomenis mentorId nustatymui
  const { user } = useAuth();
  
  // CHANGE: Apskaičiuojame lessonId komponento lygyje
  const getLessonId = (): number => {
    return lessonId || ('lesson' in student ? student.lesson || 1 : 1);
  };
  
  // Pagalbinės funkcijos duomenų gavimui iš skirtingų tipų
  const getStudentId = (): number => {
    if (isIMUPlan) {
      return (student as IMUPlan).student;
    }
    return (student as Student).id;
  };

  const getStudentName = (): string => {
    if (isIMUPlan) {
      return (student as IMUPlan).student_name;
    }
    const s = student as Student;
    return `${s.first_name} ${s.last_name}`;
  };

  const getStudentStatus = (): string => {
    if (isIMUPlan) {
      return (student as IMUPlan).attendance_status || '';
    }
    return (student as Student).attendance_status || '';
  };

  const getAttendanceStats = () => {
    if (isIMUPlan) {
      // Mock duomenys IMUPlan tipo duomenims
      return {
        present: 18,
        total: 20,
        percentage: 90
      };
    }
    const s = student as Student;
    return {
      present: s.tasks_completed || 0,
      total: s.total_tasks || 0,
      percentage: s.total_tasks > 0 ? Math.round((s.tasks_completed / s.total_tasks) * 100) : 0
    };
  };

  const hasRecentFeedback = (): boolean => {
    if (isIMUPlan) {
      return !!(student as IMUPlan).notes;
    }
    return !!(student as Student).notes;
  };

  // CHANGE: Gauname esamą vertinimą iš duomenų bazės, kai komponentas išsiplečia
  useEffect(() => {
    const fetchCurrentGrade = async () => {
      if (expanded) {

        
        const studentId = getStudentId();
        const imuPlanId = isIMUPlan ? student.id : undefined;
        
        try {
          const grade = await getStudentGrade(studentId, getLessonId(), imuPlanId);
          
          setCurrentGrade(grade);
        } catch (error) {
          console.error('❌ StudentRow: Klaida gaunant vertinimą:', error);
        }
      }
    };

    fetchCurrentGrade();
  }, [expanded, getStudentGrade, student, isIMUPlan]);

  // Statusų konvertavimas (reikalinga IMUPlan duomenims)
  // REFAKTORINIMAS: Dabar naudojame attendance_status tiesiogiai
  const convertToAttendanceStatus = (status: string): AttendanceStatus => {
    if (isIMUPlan) {
      // REFAKTORINIMAS: Dabar galime naudoti attendance_status tiesiogiai
      const imuPlan = student as IMUPlan;
      if (imuPlan.attendance_status) {
        return imuPlan.attendance_status;
      }
      // CHANGE: Vietoj null grąžiname 'present' kaip default
      return 'present';
    }
    // CHANGE: Vietoj null grąžiname 'present' kaip default
    return (status as AttendanceStatus) || 'present';
  };

  const convertFromAttendanceStatus = (status: AttendanceStatus): AttendanceStatus => {
    if (isIMUPlan) {
      // REFAKTORINIMAS: Dabar galime grąžinti attendance_status
      // Bet palaikome seną logiką migracijos metu
      switch (status) {
        case 'present': return 'present';  // Tiesiogiai attendance_status
        case 'late': return 'late';        // Tiesiogiai attendance_status
        case 'absent': return 'absent';    // Tiesiogiai attendance_status
        case 'excused': return 'excused';  // Tiesiogiai attendance_status
        default: return 'present';         // CHANGE: Vietoj null grąžiname 'present'
      }
    }
    return status;
  };

  const [attendance, setAttendance] = useState<AttendanceStatus>(convertToAttendanceStatus(getStudentStatus()));
  
  // Lankomumo keitimo valdymas
  const handleAttendanceChange = async (status: AttendanceStatus) => {
    try {
      // CHANGE: Iškviečiame backend API lankomumo statusui atnaujinti
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error('Nėra autentifikacijos token\'o');
        return;
      }

      // Ieškome IMU planą pagal studento ID ir global_schedule ID
      if (isIMUPlan) {
        const imuPlan = student as IMUPlan;
        const response = await fetch(`/api/plans/imu-plans/${imuPlan.id}/update_attendance/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            attendance_status: status
          })
        });

        if (response.ok) {
          const result = await response.json();
  
          
          // CHANGE: Atnaujiname local state po sėkmingo API atsakymo
          setAttendance(status);
          
          // CHANGE: Iškviečiame parent callback'ą tik po sėkmingo backend'o atnaujinimo
          // Tai užtikrina, kad frontend'o state būtų sinchronizuotas su backend'o duomenimis
          onAttendanceChange(getStudentId(), status);
        } else {
          console.error('Klaida atnaujinant lankomumo statusą:', response.statusText);
        }
      } else {
        // CHANGE: Jei ne IMUPlan, tiesiog atnaujiname local state
        setAttendance(status);
        onAttendanceChange(getStudentId(), status);
      }
    } catch (error) {
      console.error('Klaida atnaujinant lankomumo statusą:', error);
    }
  };

  const attendanceStats = getAttendanceStats();

  // Lankomumo būsenos rodymas - dabar visada turi būti statusas
  const getAttendanceDisplay = () => {
    switch (attendance) {
      case 'present': return 'Dalyvavo';
      case 'absent': return 'Nedalyvavo';
      case 'late': return 'Vėlavo';
      case 'excused': return 'Pateisinta';
      default: return 'Nepažymėta';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-2 bg-white shadow-sm">
      {/* Pagrindinė eilutė - tiksliai pagal paveiksliuko stilių */}
      <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-4">
          {/* Išplėtimo mygtukas */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {/* Mokinio informacija su paveiksliuko style */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{getStudentName()}</h4>
              <div className="text-sm text-gray-500">
                Lankomumas: {attendanceStats.present}/{attendanceStats.total} ({attendanceStats.percentage}%)
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Statistikos ženkliukai - tiksliai pagal paveiksliuką */}
          <div className="flex items-center space-x-2 text-sm">
            <div className="bg-green-100 px-2 py-1 rounded text-green-700 font-medium">
              +{attendanceStats.present}
            </div>
            <div className="bg-red-100 px-2 py-1 rounded text-red-700 font-medium">
              -{attendanceStats.total - attendanceStats.present}
            </div>
          </div>

          {/* Grįžtamojo ryšio indikatorius */}
          {hasRecentFeedback() && (
            <div className="flex items-center space-x-1 text-blue-600">
              <MessageSquare size={16} />
              <span className="text-sm">GR</span>
            </div>
          )}

          {/* Lankomumo mygtukai - spalvoti pagal paveiksliuką */}
          <div className="flex space-x-2">
            <AttendanceButtonGroup
              currentStatus={attendance}
              onStatusChange={handleAttendanceChange}
            />
          </div>
        </div>
      </div>

      {/* CHANGE: Pridėtas GradeSelector komponentas išplėstoje sekcijoje su esamu vertinimu */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="pt-4">

            
            <GradeSelector
              currentGrade={currentGrade} // CHANGE: Dabar perduodame tikrą esamą vertinimą
              onGradeChange={(grade) => {
        
                // CHANGE: Atnaujiname local state su nauju vertinimu
                setCurrentGrade(grade);
              }}
              studentId={getStudentId()}
                                    lessonId={getLessonId()} // CHANGE: Naudojame apskaičiuotą lessonId
              imuPlanId={isIMUPlan ? student.id : undefined}
              mentorId={user?.id || 82} // CHANGE: Naudojame tikrojo prisijungusio vartotojo ID, fallback 82
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRow;
