// frontend/src/app/mentors/activities/components/LessonInfoCard.tsx

// Komponentas vienos pamokos informacijai atvaizduoti
// Rodo pamokos pavadinimą, dalykų informacija, komponentus, tikslus, gebėjimus ir mokomąją medžiagą
// Naudoja duomenis iš curriculum/models.py Lesson modelio
// CHANGE: Patobulinta su spalvotais ikonomis, pagerintu layoutu ir modernumu dizainu pagal ddd failo pavyzdį
// CHANGE: Pašalintas StudentStats komponentas - statistikos nereikalingos
// CHANGE: Integruotas vienas bendras akordeono komponentas su visais elementais viduje

import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Target, 
  Zap, 
  Award,
  Users,
  Focus
} from 'lucide-react';
import { LessonDetails, IMUPlan, Student, AttendanceStatus } from '../types';
// import StudentRow from './StudentRow';
import StudentsList from './StudentsList';
import { User as UserType } from '@/lib/types';
import api from '@/lib/api';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { useBulkAttendanceStats } from '@/hooks/useCurriculum';

// CHANGE: Pridėti tipai objektams iš JSON
interface JsonObject {
  id?: number;
  name?: string;
  title?: string;
}

interface LessonInfoCardProps {
  lesson: LessonDetails;
  studentsForThisLesson: IMUPlan[];
  isActivityActive?: boolean; // Ar veikla aktyvi (vyksta)
  activityStartTime?: Date | null; // Veiklos pradžios laikas
  planStatus?: 'planned' | 'in_progress' | 'completed'; // CHANGE: Pridėtas plano statusas
  subjectId?: number; // CHANGE: Pridėtas subject ID lankomumo statistikai
  globalScheduleId?: number; // CHANGE: Pridėtas globalScheduleId prop
  hideHeader?: boolean; // CHANGE: Pridėtas hideHeader prop accordion be header'io
}

const LessonInfoCard: React.FC<LessonInfoCardProps> = ({
  lesson,
  studentsForThisLesson,
  isActivityActive = false,
  // activityStartTime = null,
  planStatus = 'planned', // CHANGE: Pridėtas plano statusas
  subjectId, // CHANGE: Pridėtas subjectId parametras
  globalScheduleId, // CHANGE: Pridėtas globalScheduleId parametras
  hideHeader = false // CHANGE: Pridėtas hideHeader parametras accordion be header'io
}) => {
  // CHANGE: State valdymas mokinių pridėjimui
  const [students, setStudents] = useState<Student[]>([]);

  // CHANGE: Atnaujinti students state kai keičiasi studentsForThisLesson
  useEffect(() => {
    if (studentsForThisLesson) {
      // Konvertuoti IMUPlan į Student formatą
      const convertedStudents: Student[] = studentsForThisLesson.map(imuPlan => ({
        id: imuPlan.student, // student yra number, ne objektas
        first_name: imuPlan.student_name.split(' ')[0] || '',
        last_name: imuPlan.student_name.split(' ').slice(1).join(' ') || '',
        email: '', // IMUPlan neturi email
        attendance_status: imuPlan.attendance_status as AttendanceStatus,
        activity_level: 'medium' as const,
        task_completion: 'not_started' as const,
        understanding: 'fair' as const,
        notes: imuPlan.notes || '',
        tasks_completed: 0,
        total_tasks: 0
      }));
      setStudents(convertedStudents);
    }
  }, [studentsForThisLesson]);

  // CHANGE: Mokinių pridėjimo funkcionalumas su nauju endpoint'u
  const handleStudentsAdded = async (newStudents: UserType[]) => {
    if (!globalScheduleId) return;

    try {
      // Naudoti naują endpoint'ą mokinių pridėjimui
    const response = await api.post('/plans/imu-plans/add-students-to-lesson/', {
      global_schedule_id: globalScheduleId,
      student_ids: newStudents.map(student => student.id),
      lesson_id: lesson.id  // CHANGE: Pridėtas pamokos ID iš props
    });

      console.log('Mokinių pridėjimo atsakas:', response.data);

      // Atnaujinti students state su naujais mokiniais
      const newStudentObjects: Student[] = newStudents.map(student => ({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        attendance_status: 'present' as AttendanceStatus, // Default status
        activity_level: 'medium' as const,
        task_completion: 'not_started' as const,
        understanding: 'fair' as const,
        notes: '',
        tasks_completed: 0,
        total_tasks: 0
      }));

      setStudents(prev => [...prev, ...newStudentObjects]);

    } catch (error) {
      console.error('Klaida pridedant mokinius:', error);
      // Rodyti klaidos pranešimą vartotojui
      alert('Nepavyko pridėti mokinių. Patikrinkite, ar mokiniai dar nėra pridėti į šią pamoką.');
    }
  };
  // Pagalbinė funkcija JSON string'o parse'inimui
  const parseJsonString = (jsonString: string): unknown[] => {
    if (!jsonString) return [];
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  };

  // CHANGE: Statusų keitimo funkcija su backend'o API iškvietimu
  const handleStudentStatusChange = async (studentId: number, newStatus: string | null) => {
    try {
      // CHANGE: Rasti IMUPlan ID šiam mokiniui
      const imuPlan = studentsForThisLesson.find(student => student.student === studentId);
      
      if (imuPlan && newStatus) {
        // CHANGE: Iškvieti backend'o API lankomumo keitimui
        const response = await fetch(`/api/plans/imu-plans/${imuPlan.id}/update_attendance/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            attendance_status: newStatus
          })
        });
        
        if (response.ok) {
          // CHANGE: Atnaujinti bulk statistiką po sėkmingo lankomumo keitimo
          if (subjectId) {
            await fetchBulkAttendanceStats(subjectId, globalScheduleId, lesson.id);
          }
        }
      }
    } catch {
      // Klaida apdorojama tyliai
    }
  };

  // CHANGE: Naudojame bulk attendance stats hook'ą
  const { fetchBulkAttendanceStats } = useBulkAttendanceStats();

  // CHANGE: Pridėtas useEffect lankomumo statistikos atnaujinimui, kai pasirenkama pamoka
  useEffect(() => {
    if (subjectId && studentsForThisLesson.length > 0) {
      // Viena užklausa tik šios pamokos mokiniams
      fetchBulkAttendanceStats(subjectId, globalScheduleId, lesson.id);
    }
  }, [subjectId, lesson.id, globalScheduleId, studentsForThisLesson, fetchBulkAttendanceStats]);

  // CHANGE: Papildomas useEffect bulk stats atnaujinimui pašalintas

  const objectives = parseJsonString(lesson.objectives);
  const components = parseJsonString(lesson.components);
  const focus = parseJsonString(lesson.focus);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
      {/* Antraštė su pagerintų stilium - paslėpta jei hideHeader=true */}
      {!hideHeader && (
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{lesson.title}</h1>
              <p className="text-gray-600 mt-1">
                {lesson.subject_name} • {Array.isArray(lesson.levels_names) ? lesson.levels_names.join(', ') : 'N/A'} • {lesson.topic}
              </p>
            </div>
            {Array.isArray(lesson.virtues_names) && lesson.virtues_names.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Dorybės:</span>
                <div className="flex space-x-2">
                  {lesson.virtues_names.map((virtue, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                    >
                      {virtue}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-6">
        {/* CHANGE: Vienas bendras akordeono komponentas su visais elementais viduje */}
        <Accordion defaultOpen={[]} className="mb-8">
          <AccordionItem
            id="lesson-info"
            title="Pamokos informacija"
            icon={<BookOpen size={18} className="text-gray-600" />}
            defaultOpen={false} // CHANGE: Pakeista į false - akordeonas pagal nutylėjimą suskleistas
            largeContent={true} // CHANGE: Pridėtas largeContent prop'as didesniam turiniui
            titleClassName="text-lg font-semibold text-gray-900" // CHANGE: Pridėtas custom stilius, kad atitiktų "Mokinių sąrašas" stilių
          >
            {/* CHANGE: Atstatytas originalus grid layout - 2 eilutės po 3 korteles */}
            <div className="grid grid-cols-3 gap-8">
              
              {/* Komponentai */}
              {components.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Zap size={18} className="mr-2 text-blue-600" />
                    Komponentai
                  </h3>
                  <div className="space-y-2">
                    {components.map((component, index) => (
                      <div key={index} className="p-3 bg-blue-100 rounded-lg border border-blue-200">
                        <span className="text-blue-800 text-sm font-medium">
                          {typeof component === 'object' && component ? 
                            (component as JsonObject).name || (component as JsonObject).title || `Component ${(component as JsonObject).id}` : 
                            String(component)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tikslai */}
              {objectives.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Target size={18} className="mr-2 text-green-600" />
                    Tikslai
                  </h3>
                  <div className="space-y-2">
                    {objectives.map((objective, index) => (
                      <div key={index} className="p-3 bg-green-100 rounded-lg border border-green-200">
                        <span className="text-green-800 text-sm font-medium">{String(objective)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pasiekimo lygiai */}
              {(lesson.slenkstinis || lesson.bazinis || lesson.pagrindinis || lesson.aukstesnysis) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Award size={18} className="mr-2 text-yellow-600" />
                    Pasiekimo lygiai
                  </h3>
                  <div className="space-y-2">
                    {lesson.slenkstinis && (
                      <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                        <span className="text-yellow-800 text-sm font-medium">S: {lesson.slenkstinis}</span>
                      </div>
                    )}
                    {lesson.bazinis && (
                      <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                        <span className="text-yellow-800 text-sm font-medium">B: {lesson.bazinis}</span>
                      </div>
                    )}
                    {lesson.pagrindinis && (
                      <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                        <span className="text-yellow-800 text-sm font-medium">P: {lesson.pagrindinis}</span>
                      </div>
                    )}
                    {lesson.aukstesnysis && (
                      <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                        <span className="text-yellow-800 text-sm font-medium">A: {lesson.aukstesnysis}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CHANGE: Antra eilutė - 3 kortelės */}
            <div className="grid grid-cols-3 gap-8 mt-8">
              
              {/* Gebėjimai */}
              {lesson.skills_list && lesson.skills_list.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Users size={18} className="mr-2 text-purple-600" />
                    Gebėjimai
                  </h3>
                  <div className="space-y-2">
                    {/* CHANGE: Dabar rodomi gebėjimų pavadinimai vietoj ID */}
                    {lesson.skills_list.map((skill, index) => (
                      <div key={index} className="p-3 bg-purple-100 rounded-lg border border-purple-200">
                        <span className="text-purple-800 text-sm font-medium">
                          {typeof skill === 'object' && skill ? 
                            (skill as JsonObject).name || (skill as JsonObject).title || `Skill ${(skill as JsonObject).id}` : 
                            String(skill)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BUP Kompetencijos */}
              {lesson.competency_atcheve_name && lesson.competency_atcheve_name.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Zap size={18} className="mr-2 text-indigo-600" />
                    BUP Kompetencijos
                  </h3>
                  <div className="space-y-2">
                    {lesson.competency_atcheve_name.map((competency, index) => (
                      <div key={index} className="p-3 bg-indigo-100 rounded-lg border border-indigo-200">
                        <span className="text-indigo-800 text-sm font-medium">
                          {typeof competency === 'object' && competency ? 
                            (competency as JsonObject).name || (competency as JsonObject).title || `Competency ${(competency as JsonObject).id}` : 
                            String(competency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fokusai */}
              {focus.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Focus size={18} className="mr-2 text-rose-600" />
                    Fokusai
                  </h3>
                  <div className="space-y-2">
                    {focus.map((focusItem, index) => (
                      <div key={index} className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                        <span className="text-gray-600 text-sm font-medium">
                          {typeof focusItem === 'object' && focusItem ? 
                            (focusItem as JsonObject).name || (focusItem as JsonObject).title || `Focus ${(focusItem as JsonObject).id}` : 
                            String(focusItem)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CHANGE: Mokomoji medžiaga atskirai apačioje (viso pločio) */}
            {lesson.content && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <BookOpen size={18} className="mr-2 text-gray-600" />
                  Mokomoji medžiaga
                </h3>
                <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                  <div className="text-gray-700 text-sm whitespace-pre-wrap">
                    {lesson.content}
                  </div>
                </div>
              </div>
            )}
          </AccordionItem>
        </Accordion>

        {/* CHANGE: Pridėtas tarpas tarp akordeono ir mokinių sąrašo */}
        {studentsForThisLesson.length > 0 && (
          <div className="mt-8"></div>
        )}

        {/* 5. Mokinių sąrašas su antrašte ir statistikomis */}
        {studentsForThisLesson.length > 0 && (
          <div>
            {/* Mokinių sąrašo antraštė su statistikomis - pagal paveiksliuką */}
            <div className="bg-white rounded-lg border border-gray-200 mb-4">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Mokinių sąrašas
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="text-green-600">Dalyvavo: {studentsForThisLesson.filter(s => s.attendance_status === 'present').length}</span>
                      <span className="text-red-600">Nedalyvavo: {studentsForThisLesson.filter(s => s.attendance_status === 'absent').length}</span>
                    </div>
                  </div>

                  {/* CHANGE: Pašalintas "Pridėti mokinį" mygtukas - dabar yra StudentsList komponente */}
                </div>
              </div>
              
              {/* CHANGE: Mokinių sąrašas su StudentsList komponentu */}
              <div className="p-4">
                <StudentsList
                  students={students}
                  onAttendanceChange={(studentId, status) => handleStudentStatusChange(studentId, status as string)}
                  onStudentsAdded={handleStudentsAdded}
                  showAddButton={true}
                  isActivityActive={isActivityActive} // CHANGE: Perduodamas veiklos aktyvumas
                  planStatus={planStatus} // CHANGE: Perduodamas plano statusas
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonInfoCard;
