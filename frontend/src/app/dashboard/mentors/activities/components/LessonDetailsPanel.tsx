// frontend/src/app/dashboard/mentors/activities/components/LessonDetailsPanel.tsx

// Komponentas išsamiai pamokos informacijai rodyti
// Parodo komponentus, tikslus, gebėjimus, mokomąją medžiagą ir IMU planus
// Naudoja duomenis iš curriculum/models.py Lesson ir plans/models.py IMUPlan
// CHANGE: Sukurtas naujas komponentas pilnai pamokos informacijai su IMU planų palaikymu

import React from 'react';
import { 
  BookOpen, 
  Target, 
  Puzzle, 
  Users, 
  Clock, 
  User, 
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  AlertCircle
} from 'lucide-react';
import { LessonDetails, IMUPlan } from '../types';

interface LessonDetailsPanelProps {
  lessonDetails: LessonDetails | null;
  imuPlans: IMUPlan[];
  isLoading: boolean;
  error: string | null;
}

const LessonDetailsPanel: React.FC<LessonDetailsPanelProps> = ({
  lessonDetails,
  imuPlans,
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Kraunama pamokos informacija...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Klaida: {error}</span>
        </div>
      </div>
    );
  }

  if (!lessonDetails) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500 py-8">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Pasirinkite pamoką iš tvarkaraščio, kad matytumėte išsamią informaciją</p>
        </div>
      </div>
    );
  }

  // Pagalbinė funkcija JSON string'o parse'inimui
  const parseJsonString = (jsonString: string): any[] => {
    if (!jsonString) return [];
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  };

  // Gauti IMU planų statusų piktogramas
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case 'missed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <PauseCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  // Gauti statusų spalvas
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'missed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const objectives = parseJsonString(lessonDetails.objectives);
  const components = parseJsonString(lessonDetails.components);
  const focus = parseJsonString(lessonDetails.focus);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Antraštė */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{lessonDetails.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {lessonDetails.subject_name} • {lessonDetails.topic}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Mentorius: {lessonDetails.mentor_name}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* IMU planai - kelios pamokos vienoje veikloje */}
        {imuPlans.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <Users className="h-5 w-5 text-gray-600 mr-2" />
              <h4 className="text-md font-medium text-gray-900">
                Mokytojų planai ({imuPlans.length})
              </h4>
            </div>
            <div className="space-y-2">
              {imuPlans.map((plan) => (
                <div 
                  key={plan.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(plan.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {plan.student_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {plan.lesson_title || 'Pamoka nepriskirta'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {plan.global_schedule_date} {plan.global_schedule_time} • {plan.global_schedule_classroom}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(plan.status)}`}>
                      {plan.status_display}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mokomoji medžiaga */}
        {lessonDetails.content && (
          <div>
            <div className="flex items-center mb-3">
              <BookOpen className="h-5 w-5 text-gray-600 mr-2" />
              <h4 className="text-md font-medium text-gray-900">Mokomoji medžiaga</h4>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {lessonDetails.content}
              </div>
            </div>
          </div>
        )}

        {/* Tikslai */}
        {objectives.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <Target className="h-5 w-5 text-gray-600 mr-2" />
              <h4 className="text-md font-medium text-gray-900">Tikslai</h4>
            </div>
            <ul className="space-y-2">
              {objectives.map((objective, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
                  <span className="text-sm text-gray-700">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Komponentai */}
        {components.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <Puzzle className="h-5 w-5 text-gray-600 mr-2" />
              <h4 className="text-md font-medium text-gray-900">Komponentai</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {components.map((component, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-sm font-medium text-blue-900">{component}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gebėjimai ir dorybės */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dorybės */}
          {lessonDetails.virtues_names.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Dorybės</h4>
              <div className="space-y-2">
                {lessonDetails.virtues_names.map((virtue, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-2">
                    <span className="text-sm text-green-900">{virtue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lygiai */}
          {lessonDetails.levels_names.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Mokymo lygiai</h4>
              <div className="space-y-2">
                {lessonDetails.levels_names.map((level, index) => (
                  <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                    <span className="text-sm text-purple-900">{level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pasiekimo lygiai */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {lessonDetails.slenkstinis && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h5 className="text-sm font-medium text-yellow-900 mb-2">Slenkstinis (54%)</h5>
              <p className="text-xs text-yellow-800">{lessonDetails.slenkstinis}</p>
            </div>
          )}
          
          {lessonDetails.bazinis && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h5 className="text-sm font-medium text-orange-900 mb-2">Bazinis (74%)</h5>
              <p className="text-xs text-orange-800">{lessonDetails.bazinis}</p>
            </div>
          )}
          
          {lessonDetails.pagrindinis && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h5 className="text-sm font-medium text-blue-900 mb-2">Pagrindinis (84%)</h5>
              <p className="text-xs text-blue-800">{lessonDetails.pagrindinis}</p>
            </div>
          )}
          
          {lessonDetails.aukstesnysis && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h5 className="text-sm font-medium text-green-900 mb-2">Aukštesnysis (100%)</h5>
              <p className="text-xs text-green-800">{lessonDetails.aukstesnysis}</p>
            </div>
          )}
        </div>

        {/* Fokusas veiksmai */}
        {focus.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Fokusas veiksmai</h4>
            <div className="space-y-2">
              {focus.map((action, index) => (
                <div key={index} className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <span className="text-sm text-indigo-900">{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonDetailsPanel;
