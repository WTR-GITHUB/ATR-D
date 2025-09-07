// frontend/src/components/ui/GenerationResultsModal.tsx

// Results modal komponentas ugdymo planų generavimo ataskaitoms
// Rodo detalius rezultatus kiekvienam studentui su skip priežastimis
// CHANGE: Sukurtas naujas komponentas generation results rodymui

'use client';

import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, X, ChevronDown, ChevronRight, Users, Calendar, BookOpen, Info } from 'lucide-react';

interface SkippedDetail {
  date: string;
  period_info: string;
  subject: string;
  reason: string;
}

interface UnusedLesson {
  position: number;
  lesson_title: string;
}

interface StudentResult {
  student_id: number;
  student_name: string;
  processed: number;
  created: number;
  updated: number;
  skipped: number;
  null_lessons?: number;
  unused_lessons?: UnusedLesson[];
  skipped_details: SkippedDetail[];
  error?: string;
  info_message?: string;
}

interface GenerationResultsModalProps {
  isOpen: boolean;
  results: StudentResult[];
  onClose: () => void;
}

const GenerationResultsModal: React.FC<GenerationResultsModalProps> = ({
  isOpen,
  results,
  onClose
}) => {
  const [expandedStudents, setExpandedStudents] = useState<Set<number>>(new Set());

  if (!isOpen) {
    return null;
  }

  // Skaičiuoti bendrą statistiką
  const totalStats = results.reduce((acc, result) => {
    if (!result.error) {
      acc.processed += result.processed;
      acc.created += result.created;
      acc.updated += result.updated;
      acc.skipped += result.skipped;
      acc.nullLessons += result.null_lessons || 0;
    } else {
      acc.errors += 1;
    }
    return acc;
  }, {
    processed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    nullLessons: 0,
    errors: 0
  });

  const successfulStudents = results.filter(r => !r.error).length;
  const hasIssues = totalStats.skipped > 0 || totalStats.errors > 0 || totalStats.nullLessons > 0;

  const toggleStudentExpansion = (studentId: number) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Modal antraštė */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                hasIssues ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                {hasIssues ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Generavimo rezultatai
              </h2>
              <p className="text-sm text-gray-500">
                Ugdymo planų sukūrimo ataskaita
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal turinys */}
        <div className="overflow-y-auto max-h-[70vh]">
          {/* Bendra statistika */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bendra statistika</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Sukurta</p>
                    <p className="text-2xl font-bold text-blue-600">{totalStats.created}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Atnaujinta</p>
                    <p className="text-2xl font-bold text-green-600">{totalStats.updated}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Praleista</p>
                    <p className="text-2xl font-bold text-yellow-600">{totalStats.skipped}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Studentai</p>
                    <p className="text-2xl font-bold text-gray-600">{successfulStudents}/{results.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-gray-600" />
                </div>
              </div>
            </div>

            {/* Papildoma info */}
            {(totalStats.nullLessons > 0 || totalStats.errors > 0) && (
              <div className="flex items-center space-x-4 text-sm">
                {totalStats.nullLessons > 0 && (
                  <div className="flex items-center space-x-1 text-purple-600">
                    <Calendar className="w-4 h-4" />
                    <span>{totalStats.nullLessons} NULL pamokų priskyrimo</span>
                  </div>
                )}
                {totalStats.errors > 0 && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{totalStats.errors} klaidos</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Studentų rezultatai */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Detalūs rezultatai pagal studentus
            </h3>
            
            <div className="space-y-4">
              {results.map((result) => {
                const isExpanded = expandedStudents.has(result.student_id);
                const hasDetails = result.skipped_details.length > 0 || 
                                 (result.unused_lessons && result.unused_lessons.length > 0) ||
                                 result.error ||
                                 result.info_message;
                
                return (
                  <div
                    key={result.student_id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Student header */}
                    <div
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        hasDetails ? 'border-b border-gray-200' : ''
                      }`}
                      onClick={() => hasDetails && toggleStudentExpansion(result.student_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {hasDetails && (
                            <div className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {result.student_name}
                            </h4>
                            {result.error ? (
                              <p className="text-sm text-red-600">Klaida: {result.error}</p>
                            ) : result.info_message ? (
                              <p className="text-sm text-blue-600">Info: {result.info_message}</p>
                            ) : (
                              <p className="text-sm text-gray-500">
                                Sukurta: {result.created}, Atnaujinta: {result.updated}
                                {result.skipped > 0 && `, Praleista: ${result.skipped}`}
                                {result.null_lessons && result.null_lessons > 0 && `, NULL: ${result.null_lessons}`}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {result.error ? (
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          ) : result.info_message ? (
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          ) : result.skipped > 0 ? (
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          ) : (
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Student details */}
                    {hasDetails && isExpanded && (
                      <div className="p-4 bg-gray-50">
                        {/* Info message */}
                        {result.info_message && (
                          <div className="mb-4">
                            <div className="bg-white border border-blue-200 rounded p-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium text-blue-900">
                                    Informacija
                                  </p>
                                  <p className="text-sm text-blue-700 mt-1">{result.info_message}</p>
                                </div>
                                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Skipped details */}
                        {result.skipped_details.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Praleisti įrašai ({result.skipped_details.length}):
                            </h5>
                            <div className="space-y-2">
                              {result.skipped_details.map((detail, index) => (
                                <div
                                  key={index}
                                  className="bg-white border border-yellow-200 rounded p-3"
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {formatDate(detail.date)} - {detail.period_info}
                                      </p>
                                      <p className="text-sm text-gray-600">{detail.subject}</p>
                                      <p className="text-xs text-yellow-700 mt-1">{detail.reason}</p>
                                    </div>
                                    <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Unused lessons */}
                        {result.unused_lessons && result.unused_lessons.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Nepanaudotos pamokos ({result.unused_lessons.length}):
                            </h5>
                            <div className="bg-white border border-purple-200 rounded p-3">
                              <ul className="text-sm text-gray-600 space-y-1">
                                {result.unused_lessons.map((lesson) => (
                                  <li key={lesson.position} className="flex items-center space-x-2">
                                    <span className="text-purple-600 font-medium">{lesson.position}.</span>
                                    <span>{lesson.lesson_title}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal apatinė dalis */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Uždaryti
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerationResultsModal;
