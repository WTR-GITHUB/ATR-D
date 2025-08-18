// frontend/src/app/dashboard/mentors/activities/components/StudentRow.tsx

// Mokinio eilutės komponentas su accordion funkcionalumu
// Rodo pagrindinę mokinio informaciją ir leidžia išplėsti papildomus vertinimo laukus
// Integruoja lankomumo žymėjimą, aktyvumo vertinimą ir pastabų rašymą
// CHANGE: Sukurtas atskiras StudentRow komponentas su pilna funkcionalumu ir tipizacija

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare, User } from 'lucide-react';
import { AttendanceButtonGroup } from './AttendanceMarker';
import { 
  Student, 
  AttendanceStatus, 
  StudentEvaluation, 
  ActivityLevel, 
  TaskCompletion, 
  Understanding 
} from '../types';

interface StudentRowProps {
  student: Student;
  onAttendanceChange: (studentId: number, status: AttendanceStatus) => void;
  onEvaluationChange?: (studentId: number, evaluation: StudentEvaluation) => void;
}

// Mokinio eilutės komponentas
// Pagrindinis komponentas, atvaizduojantis mokinio informaciją ir vertinimo galimybes
const StudentRow: React.FC<StudentRowProps> = ({ 
  student, 
  onAttendanceChange,
  onEvaluationChange 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceStatus>(student.status);
  
  // Vertinimo būsenos
  const [evaluation, setEvaluation] = useState<StudentEvaluation>({
    activity: '',
    taskCompletion: '',
    understanding: '',
    notes: '',
    tasks: []
  });

  // Lankomumo keitimo valdymas
  const handleAttendanceChange = (status: AttendanceStatus) => {
    setAttendance(status);
    onAttendanceChange(student.id, status);
  };

  // Vertinimo kriterijų keitimo valdymas
  const handleEvaluationChange = (field: keyof StudentEvaluation, value: any) => {
    const newEvaluation = { ...evaluation, [field]: value };
    setEvaluation(newEvaluation);
    
    if (onEvaluationChange) {
      onEvaluationChange(student.id, newEvaluation);
    }
  };

  // Užduočių žymėjimo valdymas
  const handleTaskToggle = (task: string) => {
    const newTasks = evaluation.tasks.includes(task)
      ? evaluation.tasks.filter(t => t !== task)
      : [...evaluation.tasks, task];
    
    handleEvaluationChange('tasks', newTasks);
  };

  // Lankomumo procentų skaičiavimas
  const attendancePercentage = Math.round((student.attendance.present / student.attendance.total) * 100);
  
  // Lankomumo spalvos nustatymas pagal procentus
  const getAttendanceColor = () => {
    if (attendancePercentage >= 90) return 'text-green-600';
    if (attendancePercentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-2 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Pagrindinė eilutė su mokinio informacija */}
      <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-4">
          {/* Išplėtimo mygtukas */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
            aria-label={expanded ? 'Suskleisti' : 'Išplėsti'}
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {/* Mokinio informacija */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {student.firstName} {student.lastName}
              </h3>
              <div className={`text-sm ${getAttendanceColor()}`}>
                Lankomumas: {student.attendance.present}/{student.attendance.total} ({attendancePercentage}%)
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Lankomumo statistikos rodikliai */}
          <div className="flex items-center space-x-2 text-sm">
            <div className="bg-green-100 px-2 py-1 rounded text-green-700 font-medium">
              +{student.attendance.present}
            </div>
            <div className="bg-red-100 px-2 py-1 rounded text-red-700 font-medium">
              -{student.attendance.absent}
            </div>
            <div className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium">
              Liko: {student.attendance.total - student.attendance.present - student.attendance.absent}
            </div>
          </div>

          {/* Grįžtamojo ryšio indikatorius */}
          {student.hasRecentFeedback && (
            <div className="flex items-center space-x-1 text-blue-600 bg-blue-50 px-2 py-1 rounded">
              <MessageSquare size={16} />
              <span className="text-sm font-medium">GR</span>
            </div>
          )}

          {/* Lankomumo žymėjimo mygtukai */}
          <AttendanceButtonGroup
            currentStatus={attendance}
            onStatusChange={handleAttendanceChange}
          />
        </div>
      </div>

      {/* Išplėsta sekcija su papildomais vertinimo kriterijais */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="pt-4 space-y-4">
            {/* Vertinimo kriterijai: aktyvumas, užduočių atlikimas, supratimas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aktyvumas
                </label>
                <select 
                  value={evaluation.activity}
                  onChange={(e) => handleEvaluationChange('activity', e.target.value as ActivityLevel)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Nepasirinkta</option>
                  <option value="high">Aukštas</option>
                  <option value="medium">Vidutinis</option>
                  <option value="low">Žemas</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Užduočių atlikimas
                </label>
                <select 
                  value={evaluation.taskCompletion}
                  onChange={(e) => handleEvaluationChange('taskCompletion', e.target.value as TaskCompletion)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Nepasirinkta</option>
                  <option value="completed">Atlikta</option>
                  <option value="partial">Dalinai atlikta</option>
                  <option value="not_completed">Neatlikta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supratimas
                </label>
                <select 
                  value={evaluation.understanding}
                  onChange={(e) => handleEvaluationChange('understanding', e.target.value as Understanding)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Nepasirinkta</option>
                  <option value="excellent">Puikus</option>
                  <option value="good">Geras</option>
                  <option value="needs_help">Reikia pagalbos</option>
                </select>
              </div>
            </div>

            {/* Pastabų laukas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pastabos
              </label>
              <textarea
                value={evaluation.notes}
                onChange={(e) => handleEvaluationChange('notes', e.target.value)}
                placeholder="Įrašykite pastabas apie mokinio dalyvavimą pamokoje..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>

            {/* Individualūs užduočių žymėjimai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Užduočių žymėjimai
              </label>
              <div className="flex flex-wrap gap-2">
                {['Namų darbai', 'Klasės darbas', 'Prezentacija', 'Testas'].map((task) => (
                  <label key={task} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={evaluation.tasks.includes(task)}
                      onChange={() => handleTaskToggle(task)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{task}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Papildomi veiksmai */}
            <div className="flex justify-end pt-2 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Išsaugoti vertinimą
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRow;
