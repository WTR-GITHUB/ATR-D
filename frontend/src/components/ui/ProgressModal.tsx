// frontend/src/components/ui/ProgressModal.tsx

// Progress modal komponentas ugdymo planų generavimui
// Rodo dabartinį studentą, kuriam kuriamas planas, ir bendrą progresą
// CHANGE: Sukurtas naujas komponentas per-student processing progress rodymui

'use client';

import React from 'react';
import { Users, User, CheckCircle, Clock } from 'lucide-react';

interface CurrentStudent {
  id: number;
  name: string;
  index: number;  // Current student number (1-based)
  total: number;  // Total students count
}

interface ProgressModalProps {
  isOpen: boolean;
  currentStudent: CurrentStudent | null;
  completedStudents: number;
  onCancel?: () => void;
}

const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  currentStudent,
  completedStudents,
  onCancel
}) => {
  if (!isOpen || !currentStudent) {
    return null;
  }

  const progressPercentage = (completedStudents / currentStudent.total) * 100;
  const isLastStudent = currentStudent.index === currentStudent.total;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Modal antraštė */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Kuriami ugdymo planai
              </h2>
              <p className="text-sm text-gray-500">
                Prašome palaukti, vyksta procesavimas...
              </p>
            </div>
          </div>
        </div>

        {/* Modal turinys */}
        <div className="p-6">
          {/* Dabartinis studentas */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  {isLastStudent ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-green-600 animate-spin" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {isLastStudent ? 'Baigtas:' : 'Kuriamas planas:'}
                </h3>
                <p className="text-lg font-semibold text-blue-600">
                  {currentStudent.name}
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Bendras progresas
              </span>
              <span className="text-sm text-gray-500">
                {completedStudents} iš {currentStudent.total} studentų
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span className="font-medium">
                {Math.round(progressPercentage)}%
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Studentų sąrašas indikatorius */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Studentai:
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: currentStudent.total }, (_, index) => {
                const studentNumber = index + 1;
                const isCompleted = studentNumber <= completedStudents;
                const isCurrent = studentNumber === currentStudent.index;
                
                return (
                  <div
                    key={studentNumber}
                    className={`
                      w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium
                      ${isCompleted 
                        ? 'bg-green-100 border-green-500 text-green-700' 
                        : isCurrent
                        ? 'bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-200'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      studentNumber
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status pranešimas */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">
                  {isLastStudent ? 'Procesavimas baigtas' : 'Vykdomas procesavimas'}
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  {isLastStudent 
                    ? 'Visi studentai apdoroti. Ruošiama ataskaita...'
                    : `Kuriami individualūs ugdymo planai studentui: ${currentStudent.name}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal apatinė dalis */}
        {onCancel && !isLastStudent && (
          <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Atšaukti
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressModal;
