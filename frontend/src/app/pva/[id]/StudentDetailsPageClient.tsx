// /frontend/src/app/pva/[id]/StudentDetailsPageClient.tsx

// Client component for Student Details page
// Handles all client-side interactivity while using server-side week data
// CHANGE: Extracted client logic from page.tsx to separate component

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useStudentDetails } from '@/hooks/useStudentDetails';
import { useAuth } from '@/hooks/useAuth';
import { StudentScheduleCalendar } from '../components';
import { ReactDataTable } from '@/components/DataTable';
import api, { violationAPI } from '@/lib/api';
// import TodoCompletionModal from '@/components/ui/TodoCompletionModal';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Trash2, 
  BookOpen,
  User,
  UserCheck,
  Footprints,
  UserX,
  MessagesSquare
} from 'lucide-react';
import { Violation } from '@/lib/types';
import { formatDate } from '@/lib/localeConfig';

// Client-side Student Details page component
// Handles all interactive functionality
const StudentDetailsPageClient = () => {
  const params = useParams();
  const studentId = params.id as string;
  useAuth();
  const { student, loading, error, accessDenied } = useStudentDetails(studentId);
  
  // Tvarkaraščio valdymas
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  
  // Violations state
  const [violations, setViolations] = useState<Violation[]>([]);
  const [violationsLoading, setViolationsLoading] = useState(true);
  const [violationsError, setViolationsError] = useState<string | null>(null);
  
  // Todo modal state (currently unused but kept for future functionality)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedViolationForTodos, setSelectedViolationForTodos] = useState<Violation | null>(null);
  
  // Categories state (currently unused but kept for future functionality)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [categories, setCategories] = useState<{id: number; name: string; description?: string}[]>([]);
  
  // IMU Plans state
  const [imuPlans, setImuPlans] = useState<Record<string, unknown>[]>([]);
  const [imuPlansLoading, setImuPlansLoading] = useState(true);
  const [imuPlansError, setImuPlansError] = useState<string | null>(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState<number | null>(null);
  
  // Schedule refresh key - keičiasi kai ištrinamas IMU Plan
  const [scheduleRefreshKey, setScheduleRefreshKey] = useState(0);
  
  // Attendance filter state
  const [attendanceFilter, setAttendanceFilter] = useState<string | null>(null);

  // Fetch violations data for this student
  useEffect(() => {
    const fetchViolations = async () => {
      if (!studentId) return;
      
      try {
        setViolationsLoading(true);
        setViolationsError(null);
        const response = await violationAPI.violations.getAll();
        
        // Filter violations for this specific student
        const studentViolations = response.data.filter((violation: Violation) => 
          violation.student_name && violation.student_name.includes(student?.first_name || '') && 
          violation.student_name.includes(student?.last_name || '')
        );
        
        setViolations(studentViolations);
      } catch (err: unknown) {
        console.error('Error fetching violations:', err);
        setViolationsError('Nepavyko gauti pažeidimų duomenų');
      } finally {
        setViolationsLoading(false);
      }
    };

    if (student) {
      fetchViolations();
    }
  }, [student, studentId]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await violationAPI.categories.getAll();
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch IMU Plans for this student
  useEffect(() => {
    const fetchImuPlans = async () => {
      if (!studentId) return;
      
      try {
        setImuPlansLoading(true);
        setImuPlansError(null);
        
        const response = await api.get(`/plans/imu-plans/?student_id=${studentId}`);
        setImuPlans(response.data);
      } catch (err: unknown) {
        console.error('Error fetching IMU plans:', err);
        setImuPlansError('Nepavyko gauti ugdymo planų duomenų');
      } finally {
        setImuPlansLoading(false);
      }
    };

    if (student) {
      fetchImuPlans();
    }
  }, [student, studentId]);

  // Handle schedule item selection
  const handleScheduleItemSelect = (scheduleId: number) => {
    setSelectedScheduleId(scheduleId);
  };

  // Handle IMU plan deletion
  const handleDeleteIMUPlan = async (planId: number) => {
    if (!confirm('Ar tikrai norite ištrinti šį ugdymo planą?')) return;
    
    try {
      setIsDeletingPlan(planId);
      await api.delete(`/plans/imu-plans/${planId}/`);
      setImuPlans(prev => prev.filter(plan => plan.id !== planId));
      
      // Atnaujinti tvarkaraštį - pakeisti key, kad komponentas atsinaujintų
      setScheduleRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Error deleting IMU plan:', err);
      alert('Nepavyko ištrinti ugdymo plano');
    } finally {
      setIsDeletingPlan(null);
    }
  };

  // Handle todo completion
  const handleTodoCompletion = (violation: Violation) => {
    setSelectedViolationForTodos(violation);
    setIsTodoModalOpen(true);
  };

  // Handle todo modal close
  // const handleTodoModalClose = () => {
  //   setIsTodoModalOpen(false);
  //   setSelectedViolationForTodos(null);
  // };

  // Handle todo completion success
  // const handleTodoCompletionSuccess = () => {
  //   // Refresh violations data
  //   const fetchViolations = async () => {
  //     try {
  //       const response = await violationAPI.violations.getAll();
  //       const studentViolations = response.data.filter((violation: Violation) => 
  //         violation.student_name && violation.student_name.includes(student?.first_name || '') && 
  //         violation.student_name.includes(student?.last_name || '')
  //       );
  //       setViolations(studentViolations);
  //     } catch (err) {
  //       console.error('Error refreshing violations:', err);
  //     }
  //   };
    
  //   fetchViolations();
  //   handleTodoModalClose();
  // };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Kraunama...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Klaida</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Prieiga uždrausta</h2>
          <p className="text-gray-600">Neturite teisių peržiūrėti šio studento informaciją</p>
        </div>
      </div>
    );
  }

  // Student not found
  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Studentas nerastas</h2>
          <p className="text-gray-600">Nepavyko rasti studento su nurodytu ID</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Student Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {student.first_name} {student.last_name}
                </h1>
                <p className="text-gray-600">Studento informacija</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Aktyvus
              </span>
            </div>
          </div>
        </div>

        {/* Student Schedule */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tvarkaraštis</h2>
          <StudentScheduleCalendar
            key={scheduleRefreshKey}
            studentId={parseInt(studentId)}
            onScheduleItemSelect={handleScheduleItemSelect}
            selectedScheduleId={selectedScheduleId || undefined}
          />
        </div>

        {/* Violations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pažeidimai</h2>
            {/* AttendanceFilter temporarily disabled due to prop mismatch */}
          </div>
          
          {violationsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Kraunama...</p>
            </div>
          ) : violationsError ? (
            <div className="text-center py-8">
              <p className="text-red-600">{violationsError}</p>
            </div>
          ) : violations.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Nėra pažeidimų</p>
            </div>
          ) : (
            <div className="space-y-4">
              {violations.map((violation: Violation) => (
                <div key={violation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {formatDate(new Date(violation.created_at))}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {violation.description || 'Nėra aprašymo'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        violation.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {violation.status === 'completed' ? 'Užbaigta' : 'Vykdoma'}
                      </span>
                      <button
                        onClick={() => handleTodoCompletion(violation)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Užbaigti užduotis"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* IMU Plans */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ugdymo planai</h2>
          
          {imuPlansLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Kraunama...</p>
            </div>
          ) : imuPlansError ? (
            <div className="text-center py-8">
              <p className="text-red-600">{imuPlansError}</p>
            </div>
          ) : imuPlans.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nėra ugdymo planų</p>
            </div>
          ) : (
            <ReactDataTable
              data={imuPlans.filter(plan => {
                // Apply attendance filter
                if (attendanceFilter === null) return true; // Show all data when no filter selected
                
                // Special case for Clock icon - filter records with null/undefined attendance_status
                if (attendanceFilter === 'pending') {
                  return !plan.attendance_status || plan.attendance_status === null || plan.attendance_status === undefined;
                }
                
                return plan.attendance_status === attendanceFilter;
              })}
              filterableColumnIndexes={[0, 1, 2, 5]} // Pamoka, Dalykas, Lygis, Klasė (be Lankomumas)
              customFilters={{
                attendance: (
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Lankomumas
                    </label>
                    <div className="flex gap-1">
                      {/* Pending */}
                      <button
                        onClick={() => setAttendanceFilter('pending')}
                        className={`p-2 rounded transition-colors ${
                          attendanceFilter === 'pending' 
                            ? 'bg-gray-600 text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title="Nepatvirtintas"
                      >
                        <Clock size={16} />
                      </button>
                      {/* Present */}
                      <button
                        onClick={() => setAttendanceFilter('present')}
                        className={`p-2 rounded transition-colors ${
                          attendanceFilter === 'present' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title="Dalyvauja"
                      >
                        <UserCheck size={16} />
                      </button>
                      {/* Absent */}
                      <button
                        onClick={() => setAttendanceFilter('absent')}
                        className={`p-2 rounded transition-colors ${
                          attendanceFilter === 'absent' 
                            ? 'bg-pink-600 text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title="Nedalyvauja"
                      >
                        <UserX size={16} />
                      </button>
                      {/* Left */}
                      <button
                        onClick={() => setAttendanceFilter('left')}
                        className={`p-2 rounded transition-colors ${
                          attendanceFilter === 'left' 
                            ? 'bg-yellow-600 text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title="Išėjo"
                      >
                        <Footprints size={16} />
                      </button>
                      {/* Excused */}
                      <button
                        onClick={() => setAttendanceFilter('excused')}
                        className={`p-2 rounded transition-colors ${
                          attendanceFilter === 'excused' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title="Pateisintas"
                      >
                        <MessagesSquare size={16} />
                      </button>
                    </div>
                  </div>
                )
              }}
              columns={[
                {
                  title: 'Pamoka',
                  data: 'lesson_title',
                  render: (_data: unknown, row: unknown): string => ((row as Record<string, unknown>).lesson as Record<string, unknown>)?.title as string || 'Nepriskirta pamoka'
                },
                {
                  title: 'Dalykas',
                  data: 'subject_name',
                  render: (_data: unknown, row: unknown): string => (((row as Record<string, unknown>).global_schedule as Record<string, unknown>)?.subject as Record<string, unknown>)?.name as string || 'Nepriskirtas dalykas'
                },
                {
                  title: 'Lygis',
                  data: 'level_name',
                  render: (_data: unknown, row: unknown): string => (((row as Record<string, unknown>).global_schedule as Record<string, unknown>)?.level as Record<string, unknown>)?.name as string || 'Nepriskirtas lygis'
                },
                {
                  title: 'Data',
                  data: 'global_schedule',
                  render: (data: unknown): string => {
                    const scheduleData = data as Record<string, unknown>;
                    if (!scheduleData?.date) return '-';
                    return new Date(scheduleData.date as string).toLocaleDateString('lt-LT');
                  }
                },
                {
                  title: 'Laikas',
                  data: 'global_schedule',
                  render: (data: unknown): string => {
                    const scheduleData = data as Record<string, unknown>;
                    if (!scheduleData?.period) return '-';
                    const period = scheduleData.period as Record<string, unknown>;
                    return `${period.starttime} - ${period.endtime}`;
                  }
                },
                {
                  title: 'Klasė',
                  data: 'classroom_name',
                  render: (_data: unknown, row: unknown): string => (((row as Record<string, unknown>).global_schedule as Record<string, unknown>)?.classroom as Record<string, unknown>)?.name as string || '-'
                },
                {
                  title: 'Lankomumas',
                  data: 'attendance_status',
                  render: (data: unknown) => {
                    const status = data as string;
                    // Tik ikonos be teksto, kaip AttendanceMarker komponente
                    const getIconStyle = (status: string) => {
                      const baseStyle = "w-8 h-8 rounded flex items-center justify-center";
                      
                      switch (status) {
                        case 'present':
                          return `${baseStyle} bg-green-600 text-white`;
                        case 'absent':
                          return `${baseStyle} bg-pink-600 text-white`;
                        case 'left':
                          return `${baseStyle} bg-yellow-600 text-white`;
                        case 'excused':
                          return `${baseStyle} bg-blue-600 text-white`;
                        default:
                          return `${baseStyle} bg-gray-200 text-gray-400`;
                      }
                    };

                    const getIcon = (status: string) => {
                      switch (status) {
                        case 'present':
                          return <UserCheck size={16} />;
                        case 'absent':
                          return <UserX size={16} />;
                        case 'left':
                          return <Footprints size={16} />;
                        case 'excused':
                          return <MessagesSquare size={16} />;
                        default:
                          return <Clock size={16} />;
                      }
                    };

                    return (
                      <div className={getIconStyle(status)}>
                        {getIcon(status)}
                      </div>
                    );
                  }
                },
                {
                  title: 'Veiksmai',
                  data: 'id',
                  render: (data: unknown) => {
                    const isDeleting = isDeletingPlan === (data as number);
                    
                    return (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDeleteIMUPlan(data as number)}
                          disabled={isDeleting}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Ištrinti ugdymo planą"
                        >
                          {isDeleting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    );
                  }
                }
              ]}
              filterableColumns={['lesson_title', 'subject_name', 'level_name', 'classroom_name']}
              onFiltersChange={(filters, customFilters) => {
                // Handle custom attendance filter
                if (customFilters.attendance !== undefined) {
                  setAttendanceFilter(customFilters.attendance as string | null);
                }
              }}
              onClearFilters={() => {
                setAttendanceFilter(null);
              }}
            />
          )}
        </div>
      </div>

      {/* Todo Completion Modal - temporarily disabled due to prop mismatch */}
      {/* {isTodoModalOpen && selectedViolationForTodos && (
        <TodoCompletionModal
          violation={selectedViolationForTodos}
          onClose={handleTodoModalClose}
        />
      )} */}
    </div>
  );
};

export default StudentDetailsPageClient;
