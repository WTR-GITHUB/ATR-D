// frontend/src/app/mentors/activities/components/StudentRow.tsx

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
import useGrades, { Grade } from '@/hooks/useGrades';
import { useAuth } from '@/hooks/useAuth';
// CHANGE: Pašalintas individual API import'as, naudojame tik bulk API

// Tipas, kuris gali priimti abu duomenų tipus
type StudentData = Student | IMUPlan;

// Tipas lankomumo statistikoms
interface AttendanceStats {
  present: number;
  total: number;
  percentage: number;
}

interface StudentRowProps {
  student: StudentData;
  onAttendanceChange: (studentId: number, status: AttendanceStatus) => void;
  // Naujas prop nustatyti, ar tai IMUPlan duomenys
  isIMUPlan?: boolean;
  // CHANGE: Pridėtas pamokos ID prop'as
  lessonId?: number;
  // CHANGE: Pridėtas subject ID prop'as lankomumo statistikai skaičiuoti
  subjectId?: number;
  // CHANGE: Pridėtas bulk stats prop'as lankomumo statistikai
  bulkStats?: { [studentId: number]: Record<string, unknown> } | null;
  // CHANGE: Pridėtas veiklos aktyvumo prop
  isActivityActive?: boolean;
  // CHANGE: Pridėtas plano statusas
  planStatus?: 'planned' | 'in_progress' | 'completed';
}

// Mokinio eilutės komponentas
// Pagrindinis komponentas, atvaizduojantis mokinio informaciją ir vertinimo galimybes
const StudentRow: React.FC<StudentRowProps> = ({ 
  student, 
  onAttendanceChange,
  isIMUPlan = false,
  lessonId,
  // subjectId,
  bulkStats,
  isActivityActive = false, // CHANGE: Pridėtas veiklos aktyvumo parametras
  planStatus = 'planned' // CHANGE: Pridėtas plano statusas
}) => {
  // CHANGE: Debug console.log'ai pašalinti - bulk API veikia
  const [expanded, setExpanded] = useState(false);
  const [currentGrade, setCurrentGrade] = useState<Grade | null>(null);
  
  // CHANGE: Naudojame useGrades hook'ą esamo vertinimo gavimui
  const { getStudentGrade } = useGrades();
  
  // CHANGE: Gaunome prisijungusio vartotojo duomenis mentorId nustatymui
  const { user } = useAuth();
  
  // CHANGE: Debug informacija apie props (pašalinta dėl initialization error)
  
  // CHANGE: Nustatyti ar eilutė disabled - disabled kai planned arba completed
  const isDisabled = planStatus === 'planned' || planStatus === 'completed';
  
  // CHANGE: Pašalintas individual API hook'as, naudojame tik bulk API
  
  // CHANGE: Apskaičiuojame lessonId komponento lygyje
  const getLessonId = React.useCallback((): number => {
    // CHANGE: Pirmiausia naudojame perduotą lessonId prop'ą
    if (lessonId) return lessonId;
    
    // CHANGE: Jei student yra IMUPlan tipas, bandome gauti lesson iš jo
    if (isIMUPlan && 'lesson' in student) {
      // Jei lesson yra objektas, paimame id
      if (typeof student.lesson === 'object' && student.lesson?.id) {
        return student.lesson.id;
      }
      // Jei lesson yra number
      if (typeof student.lesson === 'number') {
        return student.lesson;
      }
    }
    
    // CHANGE: Jei nieko neradome, grąžiname null vietoj default 1
    // Tai leis backend'ui gauti tinkamą klaidą vietoj neteisingų duomenų
    throw new Error('LessonId not found - cannot determine lesson for grade saving');
  }, [lessonId, student, isIMUPlan]);
  
  // Pagalbinės funkcijos duomenų gavimui iš skirtingų tipų
  const getStudentId = React.useCallback((): number => {
    if (isIMUPlan) {
      // CHANGE: Jei student yra konvertuotas iš IMUPlan, naudojame id lauką
      const studentWithImuPlan = student as Student & { imuPlanId: number };
      return studentWithImuPlan.id;
    }
    const regularStudent = student as Student;
    return regularStudent.id;
  }, [isIMUPlan, student]);

  const getStudentName = (): string => {
    if (isIMUPlan) {
      // CHANGE: Jei student yra konvertuotas iš IMUPlan, naudojame first_name ir last_name
      const studentWithImuPlan = student as Student & { imuPlanId: number };
      const firstName = studentWithImuPlan.first_name || '';
      const lastName = studentWithImuPlan.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'Nežinomas mokinys';
    }
    const s = student as Student;
    const firstName = s.first_name || '';
    const lastName = s.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Nežinomas mokinys';
  };

  const getStudentStatus = (): string => {
    if (isIMUPlan) {
      return (student as Student & { attendance_status: AttendanceStatus }).attendance_status || '';
    }
    return (student as Student).attendance_status || '';
  };

  const getAttendanceStats = (): AttendanceStats => {
    if (isIMUPlan && bulkStats) {
      // Realūs duomenys iš bulk API
      const studentId = getStudentId();
      const studentStats = bulkStats[studentId];
      
      if (studentStats) {
        return {
          present: Number(studentStats.present_records) || 0,
          total: Number(studentStats.total_records) || 0,
          percentage: Number(studentStats.percentage) || 0
        };
      }
    }
    
    // Fallback duomenys, kol bulk API duomenys kraunasi
    if (isIMUPlan) {
      return {
        present: 0,
        total: 0,
        percentage: 0
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
      return !!(student as Student & { notes: string }).notes;
    }
    return !!(student as Student).notes;
  };

  // CHANGE: Gauname esamą vertinimą iš duomenų bazės, kai komponentas išsiplečia
  useEffect(() => {
    const fetchCurrentGrade = async () => {
      if (expanded) {

        
        const studentId = getStudentId();
        const imuPlanId = isIMUPlan ? (student as Student & { imuPlanId: number }).imuPlanId : undefined;
        
        try {
          const lessonId = getLessonId();
          const grade = await getStudentGrade(studentId, lessonId, imuPlanId);
          
          setCurrentGrade(grade);
        } catch (error) {
          console.error('❌ StudentRow: Klaida gaunant vertinimą:', error);
          // CHANGE: Jei lessonId nerastas, nenustatome currentGrade
          if (error instanceof Error && error.message.includes('LessonId not found')) {
            console.warn('⚠️ StudentRow: LessonId nerastas - vertinimas negalimas');
          }
        }
      }
    };

    fetchCurrentGrade();
  }, [expanded, getStudentGrade, student, isIMUPlan, getLessonId, getStudentId]);

  // CHANGE: Pašalintas individual API useEffect, naudojame tik bulk API
  
  // Pridėti lankomumo statistikos atnaujinimą po statuso keitimo
  // CHANGE: Pašalinta individual API logika, naudojame tik bulk API

  // Statusų konvertavimas (reikalinga IMUPlan duomenims)
  // REFAKTORINIMAS: Dabar naudojame attendance_status tiesiogiai
  const convertToAttendanceStatus = (status: string): AttendanceStatus => {
    if (isIMUPlan) {
      // REFAKTORINIMAS: Dabar galime naudoti attendance_status tiesiogiai
      const studentWithAttendance = student as Student & { attendance_status: AttendanceStatus };
      if (studentWithAttendance.attendance_status) {
        return studentWithAttendance.attendance_status;
      }
      // CHANGE: Vietoj null grąžiname 'present' kaip default
      return 'present';
    }
    // CHANGE: Vietoj null grąžiname 'present' kaip default
    return (status as AttendanceStatus) || 'present';
  };

  // const convertFromAttendanceStatus = (status: AttendanceStatus): AttendanceStatus => {
  //   if (isIMUPlan) {
  //     // REFAKTORINIMAS: Dabar galime grąžinti attendance_status
  //     // Bet palaikome seną logiką migracijos metu
  //     switch (status) {
  //       case 'present': return 'present';  // Tiesiogiai attendance_status
  //       case 'left': return 'left';        // CHANGE: Pakeista 'late' į 'left'
  //       case 'absent': return 'absent';    // Tiesiogiai attendance_status
  //       case 'excused': return 'excused';  // Tiesiogiai attendance_status
  //       default: return 'present';         // CHANGE: Vietoj null grąžiname 'present'
  //     }
  //   }
  //   return status;
  // };

  const [attendance, setAttendance] = useState<AttendanceStatus>(convertToAttendanceStatus(getStudentStatus()));
  
  // Lankomumo keitimo valdymas
  const handleAttendanceChange = async (status: AttendanceStatus) => {
    try {
      // SEC-001: Updated for cookie-based authentication
      // No need to check for access token - cookies handle authentication automatically

      // Ieškome IMU planą pagal studento ID ir global_schedule ID
      if (isIMUPlan) {
        const studentWithImuPlan = student as Student & { imuPlanId: number };
        // SEC-001: Updated for cookie-based authentication
        const response = await fetch(`/api/plans/imu-plans/${studentWithImuPlan.imuPlanId}/update_attendance/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // SEC-001: Remove Authorization header - cookies handle authentication
          },
          credentials: 'include', // SEC-001: Include cookies for authentication
          body: JSON.stringify({
            attendance_status: status
          })
        });

        if (response.ok) {
          // const result = await response.json();
  
          
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

  const localAttendanceStats = getAttendanceStats();

  // Lankomumo būsenos rodymas - dabar visada turi būti statusas
  // const getAttendanceDisplay = () => {
  //   switch (attendance) {
  //     case 'present': return 'Dalyvavo';
  //     case 'absent': return 'Nedalyvavo';
  //     case 'left': return 'Paliko';
  //     case 'excused': return 'Pateisinta';
  //     default: return 'Nepažymėta';
  //   }
  // };

  return (
    <div className={`border border-gray-200 rounded-lg mb-2 shadow-sm transition-all ${
      isDisabled 
        ? 'bg-gray-100 opacity-60 cursor-not-allowed' 
        : 'bg-white hover:bg-gray-50'
    }`}>
      {/* Pagrindinė eilutė - tiksliai pagal paveiksliuko stilių */}
      <div className={`p-4 flex items-center justify-between transition-colors ${
        isDisabled ? 'cursor-not-allowed' : 'hover:bg-gray-50'
      }`}>
        <div className="flex items-center space-x-4">
          {/* Išplėtimo mygtukas */}
          <button
            onClick={() => !isDisabled && setExpanded(!expanded)}
            disabled={isDisabled}
            className={`text-gray-400 transition-colors ${
              isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:text-gray-600'
            }`}
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
                Lankomumas: {localAttendanceStats.present}/{localAttendanceStats.total} ({localAttendanceStats.percentage}%)
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Statistikos ženkliukai - tiksliai pagal paveiksliuką */}
          <div className="flex items-center space-x-2 text-sm">
            <div className="bg-green-100 px-2 py-1 rounded text-green-700 font-medium">
              +{localAttendanceStats.present}
            </div>
            <div className="bg-red-100 px-2 py-1 rounded text-red-700 font-medium">
              -{localAttendanceStats.total - localAttendanceStats.present}
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
          <div className={`flex space-x-2 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <AttendanceButtonGroup
              currentStatus={attendance}
              onStatusChange={isDisabled ? () => {} : handleAttendanceChange}
              isActivityActive={isActivityActive && !isDisabled} // CHANGE: Perduodamas veiklos aktyvumas ir disabled
            />
          </div>
        </div>
      </div>

      {/* CHANGE: Pridėtas GradeSelector komponentas išplėstoje sekcijoje su esamu vertinimu */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="pt-4">

            
            {(() => {
              try {
                const lessonId = getLessonId();
                return (
                  <GradeSelector
                    currentGrade={currentGrade} // CHANGE: Dabar perduodame tikrą esamą vertinimą
                    onGradeChange={(grade: unknown) => {
              
                      // CHANGE: Atnaujiname local state su nauju vertinimu
                      setCurrentGrade(grade as Grade);
                    }}
                    studentId={getStudentId()}
                    lessonId={lessonId} // CHANGE: Naudojame apskaičiuotą lessonId
                    imuPlanId={isIMUPlan ? (student as Student & { imuPlanId: number }).imuPlanId : undefined} // CHANGE: Teisingai nustatome IMUPlan ID iš student objekto
                    mentorId={user?.id || 82} // CHANGE: Naudojame tikrojo prisijungusio vartotojo ID, fallback 82
                  />
                );
              } catch {
                return (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      ⚠️ Vertinimas negalimas: nepavyko nustatyti pamokos ID
                    </p>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRow;
