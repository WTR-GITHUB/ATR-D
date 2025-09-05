// frontend/src/app/pva/[id]/page.tsx

// StudentDetailsPage - studento detalių puslapis
// Rodo studento pilną informaciją su role-based prieigos kontrole
// CHANGE: Sukurtas studento detalių puslapis su saugumo apsauga
// CHANGE: Atnaujintas importas - StudentScheduleCalendar perkeltas į vietinę components direktoriją

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useStudentDetails } from '@/hooks/useStudentDetails';
import { useAuth } from '@/hooks/useAuth';
import { StudentScheduleCalendar } from '../components';
import { ReactDataTable } from '@/components/DataTable';
import { violationAPI } from '@/lib/api';
import TodoCompletionModal from '@/components/ui/TodoCompletionModal';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Edit, 
  Trash2, 
  DollarSign,
  TrendingUp,
  BookOpen,
  Calendar,
  User
} from 'lucide-react';
import { Violation } from '@/lib/types';

export default function StudentDetailsPage() {
  const params = useParams();
  const studentId = params.id as string;
  const { user, token } = useAuth();
  const { student, loading, error, accessDenied } = useStudentDetails(studentId);
  
  // Tvarkaraščio valdymas
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  
  // Violations state
  const [violations, setViolations] = useState<Violation[]>([]);
  const [violationsLoading, setViolationsLoading] = useState(true);
  const [violationsError, setViolationsError] = useState<string | null>(null);
  
  // Todo modal state
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [selectedViolationForTodos, setSelectedViolationForTodos] = useState<Violation | null>(null);
  
  // Categories state
  const [categories, setCategories] = useState<any[]>([]);
  
  // IMU Plans state
  const [imuPlans, setImuPlans] = useState<any[]>([]);
  const [imuPlansLoading, setImuPlansLoading] = useState(true);
  const [imuPlansError, setImuPlansError] = useState<string | null>(null);

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
        setViolationsError('Nepavyko užkrauti pažeidimų sąrašo');
      } finally {
        setViolationsLoading(false);
      }
    };

    if (student) {
      fetchViolations();
    }
  }, [studentId, student]);

  // Fetch categories data
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

  // Fetch IMU Plans data for this student
  useEffect(() => {
    const fetchImuPlans = async () => {
      if (!studentId) return;
      
      try {
        setImuPlansLoading(true);
        setImuPlansError(null);
        
        // Call IMU Plans API endpoint for this student
        const response = await fetch(`/api/plans/imu-plans/?student=${studentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setImuPlans(data);
        
      } catch (err: unknown) {
        console.error('Error fetching IMU plans:', err);
        setImuPlansError('Nepavyko užkrauti ugdymo planų');
      } finally {
        setImuPlansLoading(false);
      }
    };

    if (student && token) {
      fetchImuPlans();
    }
  }, [studentId, student, token]);

  // Helper functions for violations table
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id.toString() === categoryId);
    return category ? category.name : categoryId;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        text: 'Neatlikta', 
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Clock
      },
      completed: { 
        text: 'Išpirkta', 
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getPenaltyStatusBadge = (status: string) => {
    const statusConfig = {
      unpaid: { 
        text: 'Neapmokėta', 
        className: 'bg-red-100 text-red-800 border-red-200'
      },
      paid: { 
        text: 'Apmokėta', 
        className: 'bg-green-100 text-green-800 border-green-200'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
        {config.text}
      </span>
    );
  };

  // Event handlers for violations
  const handleEdit = (id: number) => {
    console.log('Edit violation:', id);
    // TODO: Implement edit functionality
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Ar tikrai norite ištrinti šį pažeidimą?')) return;
    
    try {
      await violationAPI.violations.delete(id);
      setViolations(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      console.error('Error deleting violation:', err);
      alert('Nepavyko ištrinti pažeidimo');
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm('Ar tikrai norite ištrinti šį ugdymo planą?')) return;
    
    try {
      const response = await fetch(`/api/plans/imu-plans/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state by removing the deleted plan
      setImuPlans(prev => prev.filter(plan => plan.id !== id));
      
    } catch (err) {
      console.error('Error deleting IMU plan:', err);
      alert('Nepavyko ištrinti ugdymo plano');
    }
  };

  const handleOpenTodoModal = (violation: Violation) => {
    setSelectedViolationForTodos(violation);
    setIsTodoModalOpen(true);
  };

  const handleCloseTodoModal = () => {
    setIsTodoModalOpen(false);
    setSelectedViolationForTodos(null);
  };

  const handleUpdateTodos = async (violationId: number, updatedTodos: any[], allCompleted: boolean, penaltyStatus: string) => {
    if (!selectedViolationForTodos) return;

    try {
      // Determine final status based on todos and payment
      let finalStatus = selectedViolationForTodos.status;
      
      if (allCompleted) {
        // All tasks completed - mark as completed
        finalStatus = 'completed';
      } else {
        // Not all tasks completed - mark as pending
        finalStatus = 'pending';
      }

      // Send full violation data for update
      const updateData = {
        ...selectedViolationForTodos,
        todos: updatedTodos,
        penalty_status: penaltyStatus,
        status: finalStatus
      };

      await violationAPI.violations.update(selectedViolationForTodos.id, updateData);
      
      // Update local state
      setViolations(prev => prev.map(v => 
        v.id === selectedViolationForTodos.id 
          ? { ...v, todos: updatedTodos, penalty_status: penaltyStatus, status: finalStatus }
          : v
      ));
      
      handleCloseTodoModal();
    } catch (err) {
      console.error('Error updating todos:', err);
      alert('Nepavyko atnaujinti užduočių');
    }
  };

  // Violations statistics
  const violationStats = violations.reduce((acc, v) => {
    acc.totalViolations++;
    if (v.status === 'completed') acc.completedViolations++;
    if (v.penalty_status === 'paid') acc.paidPenalties++;
    acc.totalPenalty += parseFloat(String(v.penalty_amount)) || 0;
    return acc;
  }, {
    totalViolations: 0,
    completedViolations: 0,
    paidPenalties: 0,
    totalPenalty: 0
  });

  // Helper functions for IMU Plans
  const getAttendanceStatusBadge = (status: string) => {
    const statusConfig = {
      'present': { 
        text: 'Dalyvavo', 
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle
      },
      'absent': { 
        text: 'Nedalyvavo', 
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertTriangle
      },
      'left': { 
        text: 'Paliko', 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock
      },
      'excused': { 
        text: 'Pateisinta', 
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      text: 'Nepažymėta',
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Clock
    };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  // IMU Plans statistics
  const imuPlansStats = imuPlans.reduce((acc, plan) => {
    acc.totalPlans++;
    if (plan.attendance_status === 'present') acc.presentCount++;
    if (plan.attendance_status === 'absent') acc.absentCount++;
    if (plan.attendance_status === 'left') acc.leftCount++;
    if (plan.attendance_status === 'excused') acc.excusedCount++;
    return acc;
  }, {
    totalPlans: 0,
    presentCount: 0,
    absentCount: 0,
    leftCount: 0,
    excusedCount: 0
  });

  // Table columns for IMU Plans
  const imuPlanColumns = [
    {
      title: 'Pamoka',
      data: 'lesson_title',
      render: (data: any, row: any) => (
        <div className="flex items-center">
          <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
          <span>{data || row.lesson?.title || 'Nėra pavadinimo'}</span>
        </div>
      )
    },
    {
      title: 'Dalykas',
      data: 'subject_name',
      render: (data: any, row: any) => data || row.subject?.name || '-'
    },
    {
      title: 'Lygis',
      data: 'level_name', 
      render: (data: any, row: any) => data || row.level?.name || '-'
    },
    {
      title: 'Veikla',
      data: 'global_schedule_name',
      render: (data: any, row: any) => (
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-green-600" />
          <span>{data || 'Nėra veiklos'}</span>
        </div>
      )
    },
    {
      title: 'Lankomumas',
      data: 'attendance_status',
      render: (data: any) => getAttendanceStatusBadge(data)
    },
    {
      title: 'Pastabos',
      data: 'notes',
      render: (data: any) => {
        if (!data || data.trim() === '') return '-';
        return data.length > 50 ? `${data.substring(0, 50)}...` : data;
      }
    },
    {
      title: 'Sukurta',
      data: 'created_at',
      render: (data: any) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('lt-LT');
      }
    },
    {
      title: 'Veiksmai',
      data: 'id',
      render: (data: any, row: any) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleDeletePlan(data)}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
            title="Trinti"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Table columns for violations
  const violationColumns = [
    {
      title: 'Kategorija',
      data: 'category',
      render: (data: any) => getCategoryName(data)
    },
    {
      title: 'Aprašymas',
      data: 'description',
      render: (data: any) => {
        const description = data || '-';
        return description.length > 50 
          ? `${description.substring(0, 50)}...` 
          : description;
      }
    },
    {
      title: 'Statusas',
      data: 'status',
      render: (data: any) => getStatusBadge(data)
    },
    {
      title: 'Mokesčio statusas',
      data: 'penalty_status',
      render: (data: any) => getPenaltyStatusBadge(data)
    },
    {
      title: 'Mokestis (€)',
      data: 'penalty_amount',
      render: (data: any) => {
        const amount = parseFloat(String(data)) || 0;
        return `${amount.toFixed(2)}€`;
      }
    },
    {
      title: 'Data',
      data: 'created_at',
      render: (data: any) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('lt-LT');
      }
    },
    {
      title: 'Veiksmai',
      data: 'id',
      render: (data: any, row: Violation) => {
        // Hide buttons only if BOTH conditions are met: completed AND paid
        if (row.status === 'completed' && row.penalty_status === 'paid') {
          return <span className="text-green-600 font-medium">Išpirkta</span>;
        }
        
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEdit(data)}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
              title="Redaguoti"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleOpenTodoModal(row)}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
              title="Valdyti užduotis"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleDelete(data)}
              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
              title="Trinti"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }
  ];

  // Client-side role-based access control
  if (user && !user.roles?.includes('curator') && !user.roles?.includes('manager')) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Prieiga uždrausta</h1>
          <p className="text-gray-600">
            Jūs neturite teisių peržiūrėti šio puslapio turinį.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Studento informacija</h1>
        </div>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Kraunama...</p>
          </div>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Studento informacija</h1>
        </div>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Prieiga uždrausta</h2>
            <p className="text-gray-600">
              Jūs neturite teisių peržiūrėti šio studento duomenis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Studento informacija</h1>
        </div>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Klaida</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Studento informacija</h1>
        </div>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Studentas nerastas</h2>
            <p className="text-gray-600">
              Nurodytas studentas neegzistuoja arba buvo pašalintas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Puslapio antraštė */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {student.first_name} {student.last_name}
        </h1>
        <p className="text-gray-600 mt-2">Studento detali informacija</p>
      </div>

      {/* Studento informacija */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pagrindinė informacija */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagrindinė informacija</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Vardas</label>
                <p className="text-gray-900">{student.first_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Pavardė</label>
                <p className="text-gray-900">{student.last_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">El. paštas</label>
                <p className="text-gray-900">{student.email}</p>
              </div>
              {student.phone_number && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefono numeris</label>
                  <p className="text-gray-900">{student.phone_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Papildoma informacija */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Papildoma informacija</h3>
            <div className="space-y-3">
              {student.birth_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Gimimo data</label>
                  <p className="text-gray-900">{student.birth_date}</p>
                </div>
              )}
              {student.contract_number && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Sutarties numeris</label>
                  <p className="text-gray-900">{student.contract_number}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Rolės</label>
                <p className="text-gray-900">{student.roles?.join(', ') || 'Nėra'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Studento tvarkaraštis */}
      <StudentScheduleCalendar
        studentId={parseInt(studentId)}
        onScheduleItemSelect={setSelectedScheduleId}
        selectedScheduleId={selectedScheduleId || undefined}
        onWeekChange={(weekInfo) => {
          // Galime naudoti weekInfo jei reikia
          console.log('Week changed:', weekInfo);
        }}
      />

      {/* Pasirinktos pamokos informacija */}
      {selectedScheduleId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pasirinkta pamoka</h3>
          <div className="text-center text-gray-500 italic py-10 px-5 text-lg leading-relaxed font-medium">
            Pamokos informacija bus rodoma čia (ID: {selectedScheduleId})
          </div>
        </div>
      )}

      {/* Student Violations Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Studento pažeidimai</h3>
          <p className="text-sm text-gray-600 mt-1">Šio studento pažeidimų sąrašas ir jų būklė</p>
        </div>

        {violationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Kraunama pažeidimų informacija...</p>
            </div>
          </div>
        ) : violationsError ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-4">❌</div>
              <p className="text-gray-600">{violationsError}</p>
            </div>
          </div>
        ) : violations.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Nėra pažeidimų</h4>
              <p className="text-gray-600">Šis studentas neturi jokių pažeidimų.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-200">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Iš viso</p>
                    <p className="text-lg font-bold text-gray-900">{violationStats.totalViolations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Atlikta</p>
                    <p className="text-lg font-bold text-gray-900">{violationStats.completedViolations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Apmokėta</p>
                    <p className="text-lg font-bold text-gray-900">{violationStats.paidPenalties}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Bendra suma</p>
                    <p className="text-lg font-bold text-gray-900">{violationStats.totalPenalty.toFixed(2)}€</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="p-6">
              <ReactDataTable
                data={violations}
                columns={violationColumns}
                filterableColumns={['category', 'status', 'penalty_status', 'penalty_amount']}
              />
            </div>
          </>
        )}
      </div>

      {/* Student IMU Plans Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Individualūs mokinio ugdymo planai</h3>
          <p className="text-sm text-gray-600 mt-1">Mokinio pamokos, lankomumas ir ugdymo progresija</p>
        </div>

        {imuPlansLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Kraunama ugdymo planų informacija...</p>
            </div>
          </div>
        ) : imuPlansError ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-4">❌</div>
              <p className="text-gray-600">{imuPlansError}</p>
            </div>
          </div>
        ) : imuPlans.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Nėra ugdymo planų</h4>
              <p className="text-gray-600">Šiam mokiniui dar nėra sukurtų individualių ugdymo planų.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-200">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Iš viso planų</p>
                    <p className="text-lg font-bold text-gray-900">{imuPlansStats.totalPlans}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Dalyvavo</p>
                    <p className="text-lg font-bold text-gray-900">{imuPlansStats.presentCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Nedalyvavo</p>
                    <p className="text-lg font-bold text-gray-900">{imuPlansStats.absentCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <User className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Kiti statusai</p>
                    <p className="text-lg font-bold text-gray-900">{imuPlansStats.leftCount + imuPlansStats.excusedCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="p-6">
              <ReactDataTable
                data={imuPlans}
                columns={imuPlanColumns}
                filterableColumns={['lesson_title', 'subject_name', 'level_name', 'attendance_status']}
              />
            </div>
          </>
        )}
      </div>

      {/* Todo Completion Modal */}
      {isTodoModalOpen && selectedViolationForTodos && (
        <TodoCompletionModal
          isOpen={isTodoModalOpen}
          onClose={handleCloseTodoModal}
          violation={selectedViolationForTodos}
          onUpdate={handleUpdateTodos}
        />
      )}
    </div>
  );
}
