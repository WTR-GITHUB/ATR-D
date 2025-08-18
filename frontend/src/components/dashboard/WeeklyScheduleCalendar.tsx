// frontend/src/components/dashboard/WeeklyScheduleCalendar.tsx

// Savaitės tvarkaraščio komponentas - rodo mentoriaus pamokas pagal savaitę
// Naudoja duomenis iš GlobalSchedule, Period ir Classroom modelių
// CHANGE: Sukurtas naujas komponentas, integruotas su backend API, naudoja tikrus duomenis

'use client';

import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import useWeeklySchedule from '@/hooks/useWeeklySchedule';
import useSubjects from '@/hooks/useSubjects';
import usePeriods from '@/hooks/usePeriods';
import useWeekInfo from '@/hooks/useWeekInfo';
import useLessonDetails from '@/hooks/useLessonDetails';
import { ScheduleItem } from '@/app/dashboard/mentors/veiklos/types';

interface WeeklyScheduleCalendarProps {
  className?: string;
  showHeader?: boolean; // Ar rodyti antraštę (kai naudojamas akordeone - false)
  onWeekChange?: (weekInfo: any) => void; // Callback savaitės informacijai perduoti į parent
}

// Savaitės dienos (horizontal) - įskaitant savaitgalius
const weekDays = [
  { key: 'monday', name: 'Pirmadienis', short: 'Pir', weekday: 1 },
  { key: 'tuesday', name: 'Antradienis', short: 'Ant', weekday: 2 },
  { key: 'wednesday', name: 'Trečiadienis', short: 'Tre', weekday: 3 },
  { key: 'thursday', name: 'Ketvirtadienis', short: 'Ket', weekday: 4 },
  { key: 'friday', name: 'Penktadienis', short: 'Pen', weekday: 5 },
  { key: 'saturday', name: 'Šeštadienis', short: 'Šeš', weekday: 6 },
  { key: 'sunday', name: 'Sekmadienis', short: 'Sek', weekday: 0 }
];

// Pamokos kortelės komponentas
const LessonCard: React.FC<{ 
  lesson: ScheduleItem; 
  isSelected?: boolean;
  onClick?: () => void;
}> = ({ lesson, isSelected = false, onClick }) => {
  const getSubjectColor = (subject: string) => {
    // Spalvų schema pagal dalykų pavadinimus
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

  return (
    <div 
      className={`${getSubjectColor(lesson.subject.name)} text-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4 w-full h-full flex flex-col justify-between relative ${
        isSelected ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
      }`}
      onClick={onClick}
    >
      {/* Geltonas ženkliukas jei pasirinkta */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          ✓
        </div>
      )}
      
      <div className="space-y-1">
        {/* Dalyko pavadinimas ir lygis */}
        <div>
          <h3 className="font-semibold text-sm leading-tight">{lesson.subject.name}</h3>
          <p className="text-xs opacity-90">{lesson.level.name}</p>
        </div>
      </div>
      
      {/* Papildoma informacija apačioje */}
      <div className="flex items-center justify-between text-xs opacity-80 mt-2">
        <div className="flex items-center space-x-1">
          <MapPin size={10} />
          <span>{lesson.classroom.name}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Users size={10} />
          <span className="text-xs">{lesson.level.name.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );
};

const WeeklyScheduleCalendar: React.FC<WeeklyScheduleCalendarProps> = ({ 
  className = '', 
  showHeader = true,
  onWeekChange 
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedLesson, setSelectedLesson] = useState<ScheduleItem | null>(null);
  
  // API hooks duomenų gavimui
  const { subjects } = useSubjects();
  const { periods } = usePeriods();
  const { lessonDetails, isLoading: lessonLoading, error: lessonError, fetchLessonDetails } = useLessonDetails();
  
  // Savaitės informacija
  const weekInfo = useWeekInfo(currentWeek);
  
  const weekDates = weekInfo.weekDates;
  
  // Perduodame savaitės informaciją į parent komponentą
  useEffect(() => {
    if (onWeekChange) {
      console.log('Passing week info to parent:', weekInfo);
      onWeekChange({
        ...weekInfo,
        navigateWeek,
        goToToday: () => setCurrentWeek(new Date())
      });
    }
  }, [currentWeek]); // Pašalinome weekInfo iš dependencies - gali sukelti ciklą
  
  // Gauname savaitės tvarkaraščio duomenis
  const mondayDate = weekDates[0].toISOString().split('T')[0];
  console.log('mondayDate for API:', mondayDate, 'weekDates:', weekDates);
  const { scheduleItems: allScheduleItems, isLoading, error } = useWeeklySchedule({
    weekStartDate: mondayDate,
    enabled: true
  });

  // Gauti pamokos objektą pagal dieną ir laiką
  const getLessonForSlot = (date: Date, periodId: number): ScheduleItem | null => {
    const dateStr = date.toISOString().split('T')[0];
    return allScheduleItems.find(item => 
      item.date === dateStr && item.period.id === periodId
    ) || null;
  };

  // Pašalintos funkcijos - naudojamas useWeekInfo hook

  const navigateWeek = (direction: number) => {
    console.log('navigateWeek called with direction:', direction, 'currentWeek:', currentWeek);
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    console.log('Setting new week:', newWeek);
    setCurrentWeek(newWeek);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Savaitės informacija iš hook'o

  // Statistikos skaičiavimas pašalintas - nebereikalingas

  if (isLoading && allScheduleItems.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-500">Kraunamas tvarkaraštis...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-600 mb-4">⚠️ Klaida kraunant tvarkaraštį</div>
              <div className="text-gray-600 text-sm">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Antraštė su savaitės navigacija - rodoma tik jei showHeader = true */}
      {showHeader && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Savaitės tvarkaraštis</h2>
              <p className="text-gray-600 mt-1">
                {weekInfo.dateRangeText}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${weekInfo.statusColor}`}>
                  {weekInfo.statusText}
                </span>
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              
              <button
                onClick={() => setCurrentWeek(new Date())}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Dabar
              </button>
              
              <button
                onClick={() => navigateWeek(1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kalendoriaus tinklelis */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(7, 1fr)', gap: '8px', gridTemplateRows: `60px repeat(${periods.length}, auto)` }}>
            {/* Antraštės eilutė */}
            {/* Laiko stulpelio antraštė */}
            <div className="flex items-center justify-center">
              <h3 className="text-sm font-semibold text-gray-600">Laikas</h3>
            </div>
            
            {/* Dienų antraštės */}
            {weekDays.map((day, dayIndex) => (
              <div key={`header-${day.key}`} className={`flex flex-col items-center justify-center rounded-lg border-2 ${
                isToday(weekDates[dayIndex]) 
                  ? 'bg-blue-500 text-white border-blue-600' 
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}>
                <span className="text-sm font-semibold">{day.short}</span>
                <span className="text-xs opacity-80">
                  {weekDates[dayIndex].getDate().toString().padStart(2, '0')}-{(weekDates[dayIndex].getMonth() + 1).toString().padStart(2, '0')}
                </span>
              </div>
            ))}

            {/* Pamokų eilutės */}
            {periods.map((period, periodIndex) => (
              <React.Fragment key={`row-${period.id}`}>
                {/* Laiko stulpelis */}
                <div className="flex items-center justify-center bg-gray-50 rounded-lg border min-h-20">
                  <div className="text-center">
                    <div className="flex items-center justify-center text-gray-600 mb-1">
                      <Clock size={14} className="mr-1" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {period.starttime}-{period.endtime}
                    </span>
                    {period.name && (
                      <div className="text-xs text-gray-500 mt-1">
                        {period.name}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Dienų pamokos */}
                {weekDays.map((day, dayIndex) => {
                  const lesson = getLessonForSlot(weekDates[dayIndex], period.id);
                  
                  return (
                    <div key={`${day.key}-${period.id}`} className="min-h-20 flex">
                      {lesson ? (
                        <LessonCard 
                          lesson={lesson} 
                          isSelected={selectedLesson?.id === lesson.id}
                          onClick={() => {
                            const newSelection = selectedLesson?.id === lesson.id ? null : lesson;
                            setSelectedLesson(newSelection);
                            
                            // Gauti pamokos detales jei pasirinkta nauja pamoka
                            if (newSelection) {
                              fetchLessonDetails(newSelection.id);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-400">Laisva</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Pasirinktos pamokos informacijos kortelė */}
      <div className="p-6 border-t border-gray-200">
        <div className={`rounded-lg p-6 transition-all duration-300 ${
          selectedLesson 
            ? 'bg-blue-50 border-2 border-blue-200' 
            : 'bg-yellow-50 border-2 border-yellow-200'
        }`}>
          {selectedLesson ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-blue-900">
                  {lessonDetails?.title || selectedLesson.subject.name}
                </h3>
                <button
                  onClick={() => {
                    setSelectedLesson(null);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ✕ Uždaryti
                </button>
              </div>
              
              {lessonLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-blue-600">Kraunamos pamokos detalės...</span>
                </div>
              ) : lessonError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="text-red-800">Klaida: {lessonError}</div>
                </div>
              ) : lessonDetails ? (
                <div className="space-y-6">
                  {/* Pagrindinė informacija */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-blue-700">Tema:</span>
                        <p className="text-blue-900">{lessonDetails.topic || 'Nenurodyta'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-700">Dalykas:</span>
                        <p className="text-blue-900">{lessonDetails.subject_name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-700">Lygiai:</span>
                        <p className="text-blue-900">{lessonDetails.levels_names.join(', ') || 'Nenurodyta'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-700">Mentorius:</span>
                        <p className="text-blue-900">{lessonDetails.mentor_name}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-blue-700">Data:</span>
                        <p className="text-blue-900">{selectedLesson.date}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-700">Laikas:</span>
                        <p className="text-blue-900">
                          {selectedLesson.period.starttime}-{selectedLesson.period.endtime}
                          {selectedLesson.period.name && ` (${selectedLesson.period.name})`}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-700">Klasė:</span>
                        <p className="text-blue-900">{selectedLesson.classroom.name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-700">Savaitės diena:</span>
                        <p className="text-blue-900">{selectedLesson.weekday}</p>
                      </div>
                    </div>
                  </div>

                  {/* Gebėjimai */}
                  {lessonDetails.virtues_names.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-blue-700">Dorybės:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {lessonDetails.virtues_names.map((virtue, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {virtue}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fokusai */}
                  {lessonDetails.focus_list.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-blue-700">Fokusai:</span>
                      <div className="mt-2 space-y-1">
                        {lessonDetails.focus_list.map((focus, index) => (
                          <div key={index} className="text-blue-900 text-sm">• {focus}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pasiekimo lygiai */}
                  <div>
                    <span className="text-sm font-medium text-blue-700">Pasiekimo lygiai:</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {lessonDetails.slenkstinis && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <div className="font-medium text-yellow-800">Slenkstinis (54%)</div>
                          <div className="text-yellow-700 text-sm mt-1">{lessonDetails.slenkstinis}</div>
                        </div>
                      )}
                      {lessonDetails.bazinis && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <div className="font-medium text-blue-800">Bazinis (74%)</div>
                          <div className="text-blue-700 text-sm mt-1">{lessonDetails.bazinis}</div>
                        </div>
                      )}
                      {lessonDetails.pagrindinis && (
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <div className="font-medium text-green-800">Pagrindinis (84%)</div>
                          <div className="text-green-700 text-sm mt-1">{lessonDetails.pagrindinis}</div>
                        </div>
                      )}
                      {lessonDetails.aukstesnysis && (
                        <div className="bg-purple-50 border border-purple-200 rounded p-3">
                          <div className="font-medium text-purple-800">Aukštesnysis (100%)</div>
                          <div className="text-purple-700 text-sm mt-1">{lessonDetails.aukstesnysis}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BUP kompetencijos */}
                  {lessonDetails.competency_atcheve_name.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-blue-700">BUP kompetencijos:</span>
                      <div className="mt-2 space-y-2">
                        {lessonDetails.competency_atcheve_name.map((comp, index) => (
                          <div key={index} className="bg-indigo-50 border border-indigo-200 rounded p-3">
                            <div className="text-indigo-900 text-sm">{comp}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Vykdyti pamoką
                    </button>
                    <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                      Redaguoti
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-blue-600">Pasirinkite pamoką detalėms pamatyti</div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-yellow-600 mb-2">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Pasirinkite pamoką
              </h3>
              <p className="text-yellow-700 text-sm">
                Spustelėkite ant pamokos kortelės tvarkaraštyje, kad pamatytumėte išsamią informaciją
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyScheduleCalendar;
