// /home/master/DIENYNAS/frontend/src/app/students/components/achievementCard.tsx
// UgdisCard komponentas studentų puslapyje
// Purpose: Rodo mokinio pasiekimų kortelę su dalykų pasirinkimu ir pamokų lentele
// Updates: Atnaujintas su filtravimo funkcionalumu ir nauju lentelės stiliumi pagal ReactDataTable pavyzdį
// Updates: Pašalinti TIK "Data" ir "Pamokos laikas" filtravimo laukai, bet palikti visi stulpeliai lentelėje
// FIX: Pridėtas user loading state - komponentas laukia kol user bus užkrautas prieš kviečiant API
// NOTE: Niekada netriname senų pastabų

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { useStudentIMUPlans } from '@/hooks/useStudentIMUPlans';
import { useStudentGrades } from '@/hooks/useStudentGrades';
import { useAuth } from '@/hooks/useAuth';

const AchievementCard = () => {
  const { getCurrentUserId, isLoading: userLoading } = useAuth(); // FIX: Pridėtas user loading state
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  
  // Filtravimo state
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 100;
  
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
  
  // Gauname vertinimus visoms pamokoms - be lesson filtro, kad gautume visus vertinimus
  const { 
    grades, 
    loading: gradesLoading, 
    error: gradesError 
  } = useStudentGrades({ 
    studentId: currentStudentId || undefined
    // Pašaliname lessonId filtro, kad gautume visus mokinio vertinimus
  });

  // Nustatome tuščią pasirinkimą - nėra numatytojo dalyko
  // useEffect nereikalingas - selectedSubjectId lieka null

  // Sujungiame IMUPlan ir Grade duomenis
  const getLessonsWithGrades = useCallback((): Array<{
    id: number;
    date: string;
    time: string;
    title: string;
    attendance: string;
    grade: string;
    achievementLevel: string | null;
    achievementLevelCode: string | null;
    achievementLevelName: string | null;
    achievementLevelColor: string | null;
    percentage: number | null;
    isPast: boolean;
  }> => {
    
    return imuPlans.map(plan => {
      // Gauname vertinimą šiai pamokai per IMUPlan ryšį
      const grade = grades.find(g => 
        g.imu_plan === plan.id && 
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
        achievementLevel: grade?.achievement_level?.code || null,
        achievementLevelCode: grade?.achievement_level?.code || null,
        achievementLevelName: grade?.achievement_level?.name || null,
        achievementLevelColor: grade?.achievement_level?.color || null,
        percentage: grade?.percentage || null,
        isPast: isPast
      };
    });
  }, [imuPlans, grades, currentStudentId]);

  // Formatuoti datą lietuvių kalba
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('lt-LT', { 
      month: '2-digit', 
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Filtruoti duomenis
  const filteredLessons = useMemo(() => {
    const lessons = getLessonsWithGrades();
    return lessons.filter(lesson => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key];
        if (!filterValue) return true;
        
        let cellValue = '';
        switch (key) {
          case 'title':
            cellValue = lesson.title;
            break;
          case 'attendance':
            cellValue = lesson.attendance;
            break;
          case 'grade':
            cellValue = lesson.achievementLevelCode || '';
            break;
          default:
            return true;
        }
        
        return cellValue.toString().toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [getLessonsWithGrades, filters]);

  // Rūšiuoti duomenis
  const sortedLessons = useMemo(() => {
    if (!sortColumn) return filteredLessons;
    
    return [...filteredLessons].sort((a, b) => {
      let aValue = '';
      let bValue = '';
      
      switch (sortColumn) {
        case 'date':
          aValue = a.date;
          bValue = b.date;
          break;
        case 'time':
          aValue = a.time;
          bValue = b.time;
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'attendance':
          aValue = a.attendance;
          bValue = b.attendance;
          break;
        case 'grade':
          aValue = a.achievementLevelCode || '';
          bValue = b.achievementLevelCode || '';
          break;
        default:
          return 0;
      }
      
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredLessons, sortColumn, sortDirection]);

  // Puslapiavimas
  const totalPages = Math.ceil(sortedLessons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLessons = sortedLessons.slice(startIndex, endIndex);

  // Filtravimo funkcija
  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
    setCurrentPage(1); // Grįžti į pirmą puslapį
  };

  // Išvalyti filtrus
  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  // Rūšiavimo funkcija
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Puslapiavimo funkcijos
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // FIX: Early return jei user dar kraunasi arba currentStudentId nėra
  if (userLoading || !currentStudentId) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <div className="text-gray-500">
              {userLoading ? 'Kraunami vartotojo duomenys...' : 'Laukiama vartotojo duomenų...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="space-y-4">
          {/* Filtravimo laukeliai */}
          <div className="filter-container mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="filter-row flex flex-wrap gap-4 items-center justify-center">
              <div className="w-[150px]">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pavadinimas</label>
                <input
                  placeholder="Ieškoti Pavadinimas"
                  value={filters.title || ''}
                  onChange={(e) => handleFilterChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  type="text"
                />
              </div>
              <div className="w-[150px]">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lankomumas</label>
                <input
                  placeholder="Ieškoti Lankomumas"
                  value={filters.attendance || ''}
                  onChange={(e) => handleFilterChange('attendance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  type="text"
                />
              </div>
              <div className="w-[150px]">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Įvertinimas</label>
                <input
                  placeholder="Ieškoti Įvertinimas"
                  value={filters.grade || ''}
                  onChange={(e) => handleFilterChange('grade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  type="text"
                />
              </div>
              <div className="w-[150px]">
                <div className="h-6 mb-1"></div>
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm font-medium"
                >
                  Išvalyti filtrus
                </button>
              </div>
            </div>
          </div>

          {/* Lentelė */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th 
                    className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Data</span>
                      {sortColumn === 'date' && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('time')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Pamokos laikas</span>
                      {sortColumn === 'time' && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Pamokos pavadinimas</span>
                      {sortColumn === 'title' && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('attendance')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Lankomumas</span>
                      {sortColumn === 'attendance' && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('grade')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Atsiskaitymo įvertinimas</span>
                      {sortColumn === 'grade' && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedLessons.map((lesson, rowIndex) => (
                  <tr
                    key={lesson.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 ${
                      rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                      {formatDate(lesson.date)}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                      {lesson.time}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                      {lesson.title}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
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
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                      {lesson.achievementLevelCode ? (
                        <button 
                          className="w-12 h-9 rounded-xl border-2 font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                          title={`${lesson.achievementLevelName} (${lesson.percentage}%)`}
                        >
                          {lesson.achievementLevelCode}
                        </button>
                      ) : (
                        <span></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Puslapiavimas */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Rodomi įrašai nuo {startIndex + 1} iki {Math.min(endIndex, sortedLessons.length)} iš {sortedLessons.length}
                {Object.values(filters).some(f => f) && (
                  <span className="ml-2 text-gray-500">
                    (atrinkta iš {getLessonsWithGrades().length} įrašų)
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ‹
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                {totalPages > 5 && (
                  <span className="px-2 text-gray-500">...</span>
                )}
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ›
                </button>
              </div>
            </div>
          )}

          {/* Statistika */}
          <div className="mt-4 text-sm text-gray-600">
            Iš viso: {sortedLessons.length} įrašų
            {Object.values(filters).some(f => f) && (
              <span className="ml-2">
                (filtruota iš {getLessonsWithGrades().length} įrašų)
              </span>
            )}
          </div>
        </div>
      )}


    </div>
  );
};

export default AchievementCard;
