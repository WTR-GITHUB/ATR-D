// /frontend/src/app/mentors/activities/components/SelectedActivityCard.tsx

// Atskiras komponentas kalendoriaus pasirinktos veiklos statuso kortelei
// Skiriasi nuo ActivityStatusCard tuo, kad dirba su pasirinktos veiklos duomenimis
// CHANGE: Sukurtas atskiras komponentas kalendoriaus pasirinktai veiklai

'use client';

import React, { useState, useEffect } from 'react';
import { Play, Square, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { LessonDetails, IMUPlan } from '../types';
import LessonInfoCard from './LessonInfoCard';
import { plansAPI, curriculumAPI } from '@/lib/api';

// TypeScript interface komponento props'ams
// CHANGE: Interface skirtas kalendoriaus pasirinktos veiklos duomenims
interface SelectedActivityCardProps {
  globalScheduleId: number | undefined;
  // CHANGE: Pagrindinė veiklos informacija (dalykas, lygis)
  activityInfo: {
    subject_name?: string;
    level_name?: string | null;
  } | null;
  // CHANGE: Unikalios pamokos su mokiniais (gali būti tuščias, nes pasirinkta veikla gali neturėti IMU planų)
  uniqueLessons: {
    lessonDetails: LessonDetails;
    students: IMUPlan[];
  }[];
  activityStartTime: Date | null;
  activityEndTime: Date | null;
  isActivityActive: boolean;
  isActivityCompleted: boolean;
  // CHANGE: Pridėtas plan_status iš GlobalSchedule modelio
  planStatus?: 'planned' | 'in_progress' | 'completed';
  onStartActivity: () => Promise<void>;
  onEndActivity: () => Promise<void>;
  onCancelActivity: () => Promise<void>;
}

// Pasirinktos veiklos statuso kortelės komponentas
// Rodo veiklos būseną, laikus ir valdymo mygtukus
// Integruojasi su backend API per parent komponento funkcijas
// CHANGE: Skiriasi nuo ActivityStatusCard tuo, kad rodo pasirinktos veiklos informaciją
const SelectedActivityCard: React.FC<SelectedActivityCardProps> = ({
  globalScheduleId,
  activityInfo,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uniqueLessons: propUniqueLessons, // CHANGE: Pervadintas, kad nesikirstų su state
  activityStartTime,
  activityEndTime,
  isActivityActive,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isActivityCompleted,
  // CHANGE: Pridėtas planStatus prop
  planStatus = 'planned', // Default reikšmė jei nenurodyta
  onStartActivity,
  onEndActivity,
  onCancelActivity,
}) => {
  // CHANGE: Akordeono būsenos valdymas
  const [isExpanded, setIsExpanded] = useState(false);
  // CHANGE: Tikrų pamokos duomenų valdymas
  const [uniqueLessons, setUniqueLessons] = useState<{
    lessonDetails: LessonDetails;
    students: IMUPlan[];
  }[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);

  // CHANGE: Funkcija tikrų pamokos duomenų gavimui pasirinktai veiklai
  const fetchRealLessonsForSelectedActivity = async (globalScheduleId: number | undefined): Promise<{
    lessonDetails: {
      id: number;
      title: string;
      topic: string;
      subject_name: string;
      levels_names: string[];
      components_list: string[];
      objectives_list: string[];
      objectives: string;
      components: string;
      focus: string;
      content: string;
      slenkstinis: string;
      bazinis: string;
      pagrindinis: string;
      aukstesnysis: string;
      skills_list: { id: number; code: string; name: string; }[];
      competency_atcheve_details: { id: number; competency_name: string; virtues: string[]; todos: string; }[];
      competency_atcheve_name: string[];
      competency_atcheves: number[];
      focus_list: string[];
      virtues_names: string[];
      mentor_name: string;
      created_at: string;
      updated_at: string;
    };
    students: IMUPlan[];
  }[]> => {
    try {
      // Patikrinti ar globalScheduleId yra nurodytas
      if (!globalScheduleId) {
        return [];
      }
      
      // Gauti IMU planus šiai veiklai
      const imuPlansResponse = await plansAPI.imuPlans.getAll({ global_schedule: globalScheduleId });
      const imuPlans = Array.isArray(imuPlansResponse.data) ? imuPlansResponse.data : (imuPlansResponse.data.results || []);
      
      // Grupuoti IMU planus pagal pamokas
      const lessonsMap = new Map<number, {
        lessonId: number;
        lessonTitle: string;
        students: IMUPlan[];
      }>();
      
      imuPlans.forEach((imuPlan: IMUPlan) => {
        // Gauti pamokos ID ir pavadinimą
        let lessonId: number;
        let lessonTitle: string;
        
        if (typeof imuPlan.lesson === 'object' && imuPlan.lesson?.id) {
          lessonId = imuPlan.lesson.id;
          lessonTitle = imuPlan.lesson.title || `Pamoka ${lessonId}`;
        } else if (typeof imuPlan.lesson === 'number') {
          lessonId = imuPlan.lesson;
          lessonTitle = imuPlan.lesson_title || `Pamoka ${lessonId}`;
        } else {
          lessonId = 0; // Default pamoka
          lessonTitle = imuPlan.lesson_title || 'Pamoka be ID';
        }
        
        // Sukurti pamokos įrašą jei neegzistuoja
        if (!lessonsMap.has(lessonId)) {
          lessonsMap.set(lessonId, {
            lessonId,
            lessonTitle,
            students: []
          });
        }
        
        // Pridėti mokinį prie pamokos
        const lessonData = lessonsMap.get(lessonId)!;
        lessonData.students.push(imuPlan);
      });
      
      // Gauti tikrus pamokos duomenis iš curriculum API
      const lessonsWithDetails = await Promise.all(
        Array.from(lessonsMap.values()).map(async (lessonData) => {
          try {
            // Gauti pamokos detales iš curriculum API
            const lessonResponse = await curriculumAPI.lessons.getById(lessonData.lessonId);
            const lessonDetails = lessonResponse.data;
            
            return {
              lessonDetails: {
                id: lessonDetails.id,
                title: lessonDetails.title,
                topic: lessonDetails.topic,
                subject_name: lessonDetails.subject?.name || 'Nepasiekiamas dalykas',
                levels_names: lessonDetails.levels?.map((level: { name: string }) => level.name) || ['Nepasiekiamas lygis'],
                components_list: lessonDetails.components ? JSON.parse(lessonDetails.components) : [],
                objectives_list: lessonDetails.objectives ? JSON.parse(lessonDetails.objectives) : [],
                objectives: lessonDetails.objectives || "Tikslai nepasiekiami",
                components: lessonDetails.components || "Komponentai nepasiekiami",
                focus: lessonDetails.focus || "Fokusai nepasiekiami",
                content: lessonDetails.content || "Mokomoji medžiaga nepasiekiama",
                slenkstinis: lessonDetails.slenkstinis || "54%",
                bazinis: lessonDetails.bazinis || "74%", 
                pagrindinis: lessonDetails.pagrindinis || "84%",
                aukstesnysis: lessonDetails.aukstesnysis || "100%",
                skills_list: lessonDetails.skills?.map((skill: { id: number; code: string; name: string }) => ({
                  id: skill.id,
                  code: skill.code,
                  name: skill.name
                })) || [],
                competency_atcheve_details: lessonDetails.competency_atcheves?.map((comp: { id: number; competency_name: string; virtues: string[]; todos: string }) => ({
                  id: comp.id,
                  competency_name: comp.competency_name,
                  virtues: comp.virtues || [],
                  todos: comp.todos || ""
                })) || [],
                competency_atcheve_name: lessonDetails.competency_atcheves?.map((comp: { competency_name: string }) => comp.competency_name) || [],
                competency_atcheves: lessonDetails.competency_atcheves || [],
                focus_list: lessonDetails.focus ? JSON.parse(lessonDetails.focus) : [],
                virtues_names: lessonDetails.virtues?.map((virtue: { name: string }) => virtue.name) || [],
                mentor_name: lessonDetails.mentor?.first_name + ' ' + lessonDetails.mentor?.last_name || "Mentorius nepasiekiamas",
                created_at: lessonDetails.created_at,
                updated_at: lessonDetails.updated_at
              },
              students: lessonData.students
            };
          } catch (error) {
            console.error(`❌ SelectedActivityCard: Klaida gaunant pamokos ${lessonData.lessonId} duomenis:`, error);
            // Grąžinti fallback duomenis jei nepavyksta gauti tikrų duomenų
            return {
              lessonDetails: {
                id: lessonData.lessonId,
                title: lessonData.lessonTitle,
                topic: lessonData.lessonTitle,
                subject_name: "Dalykas nepasiekiamas",
                levels_names: ["Lygis nepasiekiamas"],
                components_list: [],
                objectives_list: [],
                objectives: "Tikslai nepasiekiami",
                components: "Komponentai nepasiekiami",
                focus: "Fokusai nepasiekiami",
                content: "Mokomoji medžiaga nepasiekiama",
                slenkstinis: "54%",
                bazinis: "74%", 
                pagrindinis: "84%",
                aukstesnysis: "100%",
                skills_list: [],
                competency_atcheve_details: [],
                competency_atcheve_name: ["Kompetencijos nepasiekiamos"],
                competency_atcheves: [],
                focus_list: [],
                virtues_names: [],
                mentor_name: "Mentorius nepasiekiamas",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
              students: lessonData.students
            };
          }
        })
      );
      
      return lessonsWithDetails;
    } catch (error) {
      console.error('❌ SelectedActivityCard: Klaida gaunant tikrus pamokos duomenis:', error);
      return [];
    }
  };

  // CHANGE: useEffect duomenų gavimui pasirinktos veiklos
  useEffect(() => {
    const loadLessons = async () => {
      if (!globalScheduleId) {
        setUniqueLessons([]);
        return;
      }
      
      try {
        setIsLoadingLessons(true);
        const realLessons = await fetchRealLessonsForSelectedActivity(globalScheduleId);
        setUniqueLessons(realLessons);
      } catch (error) {
        console.error('❌ SelectedActivityCard: Klaida kraunant pamokos duomenis:', error);
        setUniqueLessons([]);
      } finally {
        setIsLoadingLessons(false);
      }
    };
    
    loadLessons();
  }, [globalScheduleId]);
  
  // CHANGE: Loading būsenų valdymas mygtukams
  const [buttonLoading, setButtonLoading] = useState({
    start: false,
    end: false,
    cancel: false
  });

  // CHANGE: Mygtukų logika pagal plan_status vietoj isActivityActive/isActivityCompleted
  const getButtonStates = () => {
    switch (planStatus) {
      case 'planned':
        return {
          startEnabled: true,
          endEnabled: false,
          cancelEnabled: false,
          startTitle: "Pradėti veiklą",
          endTitle: "Pirmiausia pradėkite veiklą",
          cancelTitle: "Veikla gali būti atšaukta tik pradėta arba užbaigta"
        };
      case 'in_progress':
        return {
          startEnabled: false,
          endEnabled: true,
          cancelEnabled: true,
          startTitle: "Veikla jau pradėta",
          endTitle: "Užbaigti veiklą",
          cancelTitle: "Atšaukti veiklą"
        };
      case 'completed':
        return {
          startEnabled: false,
          endEnabled: false,
          cancelEnabled: true,
          startTitle: "Veikla užbaigta",
          endTitle: "Veikla jau užbaigta",
          cancelTitle: "Atšaukti veiklą"
        };
      default:
        return {
          startEnabled: true,
          endEnabled: false,
          cancelEnabled: false,
          startTitle: "Pradėti veiklą",
          endTitle: "Pirmiausia pradėkite veiklą",
          cancelTitle: "Veikla gali būti atšaukta tik pradėta arba užbaigta"
        };
    }
  };

  // CHANGE: Wrapper funkcijos su loading state
  const handleStartActivity = async () => {
    setButtonLoading(prev => ({ ...prev, start: true }));
    try {
      await onStartActivity();
    } catch (error) {
      console.error('❌ SelectedActivityCard: Klaida pradedant veiklą:', error);
    } finally {
      setButtonLoading(prev => ({ ...prev, start: false }));
    }
  };

  const handleEndActivity = async () => {
    setButtonLoading(prev => ({ ...prev, end: true }));
    try {
      await onEndActivity();
    } catch (error) {
      console.error('❌ SelectedActivityCard: Klaida baigiant veiklą:', error);
    } finally {
      setButtonLoading(prev => ({ ...prev, end: false }));
    }
  };

  const handleCancelActivity = async () => {
    setButtonLoading(prev => ({ ...prev, cancel: true }));
    try {
      await onCancelActivity();
    } catch (error) {
      console.error('❌ SelectedActivityCard: Klaida atšaukant veiklą:', error);
    } finally {
      setButtonLoading(prev => ({ ...prev, cancel: false }));
    }
  };


  const buttonStates = getButtonStates();
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* CHANGE: Akordeono header'is - veiklos valdymas */}
      <div 
        className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? "Suskleisti pamokos informaciją" : "Išskleisti pamokos informaciją"}
      >
        {/* Kairėje pusėje - veiklos informacija */}
        <div className="flex items-center space-x-3 flex-1">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {activityInfo?.subject_name || 'Pasirinktos veiklos statusas'}
            </h3>
            {/* CHANGE: Rodo veiklos pradžios ir pabaigos datas */}
            {activityStartTime && (
              <div className="text-sm text-gray-600 mt-1 space-y-1">
                <p>
                  <span className="font-medium text-gray-900">
                    Veikla pradėta: 
                  </span>
                  <span className="font-medium text-blue-600">
                    {' '}{activityStartTime.toISOString().split('T')[0]}
                  </span>
                </p>
                {activityEndTime && (
                  <p>
                    <span className="font-medium text-gray-900">
                      Veikla užbaigta: 
                    </span>
                    <span className="font-medium text-green-600">
                      {' '}{activityEndTime.toISOString().split('T')[0]}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Viduryje - valdymo mygtukai */}
        <div className="flex items-center space-x-3">
          {/* CHANGE: Veiklos pradžios mygtukas su loading state */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Sustabdyti event bubbling
              handleStartActivity();
            }}
            disabled={!activityInfo || !buttonStates.startEnabled || buttonLoading.start}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              activityInfo && buttonStates.startEnabled && !buttonLoading.start
                ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={activityInfo ? buttonStates.startTitle : "Pirmiausia pasirinkite veiklą kalendoriuje"}
          >
            {buttonLoading.start ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Play size={16} />
            )}
          </button>
          
          {/* CHANGE: Veiklos pabaigos mygtukas su loading state */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Sustabdyti event bubbling
              handleEndActivity();
            }}
            disabled={!activityInfo || !buttonStates.endEnabled || buttonLoading.end}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              activityInfo && buttonStates.endEnabled && !buttonLoading.end
                ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={activityInfo ? buttonStates.endTitle : "Pirmiausia pasirinkite veiklą kalendoriuje"}
          >
            {buttonLoading.end ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Square size={16} />
            )}
          </button>
          
          {/* CHANGE: Veiklos atšaukimo mygtukas su loading state */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Sustabdyti event bubbling
              handleCancelActivity();
            }}
            disabled={!activityInfo || !buttonStates.cancelEnabled || buttonLoading.cancel}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              activityInfo && buttonStates.cancelEnabled && !buttonLoading.cancel
                ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={activityInfo ? buttonStates.cancelTitle : "Pirmiausia pasirinkite veiklą kalendoriuje"}
          >
            {buttonLoading.cancel ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <RefreshCcw size={16} />
            )}
          </button>
          
        </div>
        
        {/* Dešinėje - chevron ikona */}
        <div className="ml-4 p-1 text-gray-400 pointer-events-none">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {/* CHANGE: Akordeono turinys - kiekviena pamoka kaip accordion su "Pamokos informacija" */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6">
          {isLoadingLessons ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Kraunami pamokos duomenys...</span>
            </div>
          ) : uniqueLessons.length > 0 ? (
            <div className="space-y-4">
              {uniqueLessons.map((lessonGroup) => (
                <LessonInfoCard
                  key={`selected-lesson-${lessonGroup.lessonDetails.id}`}
                  lesson={lessonGroup.lessonDetails}
                  studentsForThisLesson={lessonGroup.students}
                  hideHeader={true} // CHANGE: Tik accordion be header'io
                  isActivityActive={isActivityActive}
                  activityStartTime={activityStartTime}
                  planStatus={planStatus} // CHANGE: Pridėtas planStatus prop'as
                  globalScheduleId={globalScheduleId} // CHANGE: Pridėtas globalScheduleId prop'as
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-2">
                {activityInfo 
                  ? "Šiai pasirinktai veiklai nėra priskirtų pamokų" 
                  : "Pasirinkite veiklą kalendoriuje, kad pamatytumėte jos informaciją"
                }
              </p>
              <p className="text-sm text-gray-500">
                {activityInfo 
                  ? "Pamokos bus rodomos čia, kai bus sukurti IMU planai šiai veiklai" 
                  : "Spustelėkite ant veiklos kalendoriuje, kad ją pasirinktumėte"
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectedActivityCard;