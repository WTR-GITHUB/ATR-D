// /home/master/DIENYNAS/frontend/src/app/students/components/achievementCard.tsx
// UgdisCard komponentas studentų puslapyje
// Purpose: Rodo mokinio pasiekimų kortelę su dalykų pasirinkimu ir pamokų lentele
// Updates: Sukurtas naujas komponentas su realiais duomenimis iš backend API
// NOTE: Niekada netriname senų pastabų

import React, { useState } from 'react';
import { ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { useStudentIMUPlans } from '@/hooks/useStudentIMUPlans';
import { useStudentGrades } from '@/hooks/useStudentGrades';
import { useAuth } from '@/hooks/useAuth';

const AchievementCard = () => {
  const { getCurrentUserId } = useAuth();
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  
  // Gauname dabartinio mokinio ID
  const currentStudentId = getCurrentUserId();
  
  // API hook'ai
  const { subjects, loading: subjectsLoading, error: subjectsError } = useSubjects();
  const { 
    imuPlans, 
    loading: imuPlansLoading, 
    error: imuPlansError 
  } = useStudentIMUPlans({ 
    studentId: currentStudentId || undefined,
    subjectId: selectedSubjectId || undefined 
  });
  
  // Gauname vertinimus visoms pamokoms
  const lessonIds = imuPlans
    .filter(plan => plan.lesson)
    .map(plan => plan.lesson!.id);
  
  const { 
    grades, 
    loading: gradesLoading, 
    error: gradesError 
  } = useStudentGrades({ 
    studentId: currentStudentId || undefined,
    lessonId: lessonIds.length > 0 ? lessonIds[0] : undefined // Pirmas lesson ID, arba undefined
  });

  // Nustatome tuščią pasirinkimą - nėra numatytojo dalyko
  // useEffect nereikalingas - selectedSubjectId lieka null

  // Sujungiame IMUPlan ir Grade duomenis
  const getLessonsWithGrades = (): Array<{
    id: number;
    date: string;
    time: string;
    title: string;
    attendance: string;
    grade: string;
    isPast: boolean;
  }> => {
    return imuPlans.map(plan => {
      // Gauname vertinimą šiai pamokai
      const grade = grades.find(g => 
        g.lesson.id === plan.lesson?.id && 
        g.student === currentStudentId
      );
      
      // Nustatome ar pamoka praėjusi
      const planDate = new Date(plan.global_schedule_date);
      const today = new Date();
      const isPast = planDate < today;
      
      // Formatuojame laiką
      const time = plan.global_schedule_time 
        ? `${plan.global_schedule_time}`
        : `${plan.global_schedule.period.starttime} - ${plan.global_schedule.period.endtime}`;
      
      return {
        id: plan.id,
        date: plan.global_schedule_date,
        time: time,
        title: plan.lesson_title || 'Pamoka be pavadinimo',
        attendance: plan.attendance_status_display || '-',
        grade: grade ? `${grade.percentage}% (${grade.grade_letter})` : '-',
        isPast: isPast
      };
    });
  };

  // Formatuoti datą lietuvių kalba
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('lt-LT', { 
      month: '2-digit', 
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Loading ir error states
  const isLoading = subjectsLoading || imuPlansLoading || gradesLoading;
  const hasError = subjectsError || imuPlansError || gradesError;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header su dropdown */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Peržiūrėti pasiekimus</h2>
        
        <div className="relative">
          {subjectsLoading ? (
            <div className="flex items-center px-4 py-2 border border-gray-300 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
              <span className="text-gray-500">Kraunasi dalykai...</span>
            </div>
          ) : (
            <select
              value={selectedSubjectId || ''}
              onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : null)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              disabled={subjects.length === 0}
            >
              <option value="">Pasirinkite dalyką</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          )}
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Error state */}
      {hasError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">
              {subjectsError || imuPlansError || gradesError}
            </span>
          </div>
        </div>
      )}

      {/* Pamokų lentelė */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
          <span className="text-gray-600">Kraunasi pamokų duomenys...</span>
        </div>
      ) : !selectedSubjectId ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Pasirinkite dalyką, kad pamatytumėte pamokas</p>
        </div>
      ) : getLessonsWithGrades().length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Šiam dalykui nėra pamokų</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Data</th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Pamokos laikas</th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Pamokos pavadinimas</th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Lankomumas</th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Atsiskaitymo įvertinimas</th>
              </tr>
            </thead>
            <tbody>
              {getLessonsWithGrades().map((lesson) => (
                <tr
                  key={lesson.id}
                  className={`${
                    lesson.isPast 
                      ? 'bg-blue-50 hover:bg-blue-100' 
                      : 'bg-green-50 hover:bg-green-100'
                  } transition-colors duration-200`}
                >
                  <td className="border border-gray-200 px-4 py-3 text-gray-800">
                    {formatDate(lesson.date)}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-gray-800">
                    {lesson.time}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-gray-800 font-medium">
                    {lesson.title}
                  </td>
                  <td className="border border-gray-200 px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      lesson.attendance === 'Dalyvavo' 
                        ? 'bg-green-200 text-green-800'
                        : lesson.attendance === 'Nedalyvavo'
                        ? 'bg-red-200 text-red-800'
                        : lesson.attendance === 'Pateisinta'
                        ? 'bg-yellow-200 text-yellow-800'
                        : lesson.attendance === 'Paliko'
                        ? 'bg-orange-200 text-orange-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {lesson.attendance}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-3">
                    {lesson.grade !== '-' ? (
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        lesson.grade.includes('A') 
                          ? 'bg-green-200 text-green-800'
                          : lesson.grade.includes('P')
                          ? 'bg-blue-200 text-blue-800'
                          : lesson.grade.includes('B')
                          ? 'bg-yellow-200 text-yellow-800'
                          : lesson.grade.includes('S')
                          ? 'bg-red-200 text-red-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {lesson.grade}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legenda */}
      <div className="mt-4 flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 rounded border"></div>
          <span className="text-gray-600">Praėjusios pamokos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded border"></div>
          <span className="text-gray-600">Būsimos pamokos</span>
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;
