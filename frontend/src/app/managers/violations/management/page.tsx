// /home/vilkas/atradimai/dienynas/frontend/src/app/managers/violations/management/page.tsx

// Managerių pažeidimų valdymo puslapis su lentele, filtrais ir masiniais veiksmais
// Leidžia peržiūrėti, redaguoti, trinti ir keisti pažeidimų statusus
// CHANGE: Nukopijuotas iš curators ir pritaikytas managers rolės puslapiui

'use client';

import React, { useState, useEffect } from 'react';
import ClientAuthGuard from '@/components/auth/ClientAuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { ReactDataTable } from '@/components/DataTable';
import { violationAPI } from '@/lib/api';
import TodoCompletionModal from '@/components/ui/TodoCompletionModal';
import ViolationFormModal from '@/components/ui/ViolationFormModal';
import StatusFilter from '@/components/ui/StatusFilter';
import PenaltyStatusFilter from '@/components/ui/PenaltyStatusFilter';
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Edit, 
  Trash2, 
  DollarSign,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { Violation, TodoItem, ViolationStatus, PenaltyStatus } from '@/lib/types';
import { useModals } from '@/hooks/useModals';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import NotificationModal from '@/components/ui/NotificationModal';

export default function ManagerViolationsManagementPage() {
  useAuth();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal hooks
  const {
    confirmationModal,
    showConfirmation,
    closeConfirmation,
    notificationModal,
    closeNotification,
    showSuccess,
    showError
  } = useModals();
  // const [selectedViolations, setSelectedViolations] = useState<number[]>([]);
  
  // Todo modal state
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [selectedViolationForTodos, setSelectedViolationForTodos] = useState<Violation | null>(null);
  
  // CHANGE: Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedViolationForEdit, setSelectedViolationForEdit] = useState<Violation | null>(null);
  
  // Categories state
  const [categories, setCategories] = useState<{id: number; name: string; description?: string}[]>([]);
  
  // Filter states for modern switches
  const [statusFilter, setStatusFilter] = useState(0); // -1, 0, 1
  const [penaltyStatusFilter, setPenaltyStatusFilter] = useState(0); // -1, 0, 1

  // Fetch violations data
  useEffect(() => {
    const fetchViolations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await violationAPI.violations.getAll();
        setViolations(response.data);
      } catch (err: unknown) {
        console.error('Error fetching violations:', err);
        setError('Nepavyko užkrauti įrašų sąrašo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchViolations();
  }, []);

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

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id.toString() === categoryId);
    return category ? category.name : categoryId;
  };

  // Status badge functions
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        text: 'Neatlikta', 
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Clock
      },
      completed: { 
        text: 'Atlikta', 
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

  // Calculate statistics
  const stats = violations.reduce((acc, v) => {
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

  // Table columns
  const columns = [
    {
      title: 'Mokinys',
      data: 'student_name',
      render: (data: unknown) => (data as string) || '-'
    },
    {
      title: 'Kategorija',
      data: 'category',
      render: (data: unknown) => getCategoryName((data as number)?.toString() || '')
    },
    {
      title: 'Aprašymas',
      data: 'description',
      render: (data: unknown) => {
        const description = (data as string) || '-';
        return description.length > 50 
          ? `${description.substring(0, 50)}...` 
          : description;
      }
    },
    {
      title: 'Patirties statusas',
      data: 'status',
      render: (data: unknown) => getStatusBadge(data as string)
    },
    {
      title: 'Mokesčio statusas',
      data: 'penalty_status',
      render: (data: unknown) => getPenaltyStatusBadge(data as string)
    },
    {
      title: 'Mokestis (€)',
      data: 'penalty_amount',
      render: (data: unknown) => {
        const amount = parseFloat(String(data)) || 0;
        return `${amount.toFixed(2)}€`;
      }
    },
    {
      title: 'Data',
      data: 'created_at',
      render: (data: unknown) => {
        if (!data) return '-';
        return new Date(data as string).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
      }
    },
    {
      title: 'Veiksmai',
      data: 'id',
      render: (data: unknown, row: unknown) => {
        const violation = row as Violation;
        
        // CHANGE: If status is completed, show only edit button + "Atlikta" text
        if (violation.status === 'completed') {
          return (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(data as number)}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                title="Redaguoti"
              >
                <Edit className="w-4 h-4" />
              </button>
              <span className="text-green-600 font-medium">Atlikta</span>
            </div>
          );
        }

        // CHANGE: For non-completed status, show all buttons
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEdit(data as number)}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
              title="Redaguoti"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleOpenTodoModal(violation)}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
              title="Valdyti užduotis"
            >
              <CheckCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleDelete(data as number)}
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

  // Event handlers
  const handleEdit = (id: number) => {
    // CHANGE: Find violation by ID and open edit modal
    const violation = violations.find(v => v.id === id);
    if (violation) {
      setSelectedViolationForEdit(violation);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    showConfirmation(
      {
        title: 'Ištrinti įrašą',
        message: 'Ar tikrai norite ištrinti šį įrašą?',
        confirmText: 'Ištrinti',
        cancelText: 'Atšaukti',
        type: 'danger'
      },
      async () => {
        try {
          await violationAPI.violations.delete(id);
          setViolations(prev => prev.filter(v => v.id !== id));
          showSuccess('Įrašas sėkmingai ištrintas');
        } catch (err) {
          console.error('Error deleting violation:', err);
          showError('Nepavyko ištrinti įrašo');
        }
      }
    );
  };

  // Todo modal handlers
  const handleOpenTodoModal = (violation: Violation) => {
    setSelectedViolationForTodos(violation);
    setIsTodoModalOpen(true);
  };

  const handleCloseTodoModal = () => {
    setIsTodoModalOpen(false);
    setSelectedViolationForTodos(null);
  };

  // CHANGE: Edit modal handlers
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedViolationForEdit(null);
  };

  const handleEditSuccess = () => {
    // Refresh violations list
    const fetchViolations = async () => {
      try {
        const response = await violationAPI.violations.getAll();
        setViolations(response.data);
      } catch (err) {
        console.error('Error fetching violations:', err);
      }
    };
    fetchViolations();
  };

  const handleUpdateTodos = async (violationId: number, updatedTodos: TodoItem[], allCompleted: boolean, penaltyStatus: 'paid' | 'unpaid') => {
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
          ? { ...v, todos: updatedTodos, penalty_status: penaltyStatus as PenaltyStatus, status: finalStatus as ViolationStatus }
          : v
      ));
      
      handleCloseTodoModal();
    } catch (err) {
      console.error('Error updating todos:', err);
      showError('Nepavyko atnaujinti užduočių');
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kraunama...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Bandyti dar kartą
          </button>
        </div>
      </div>
    );
  }

  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['manager']}>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/managers/violations"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Atgal į patirčių puslapį
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Patirčių valdymas</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Iš viso įrašų</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViolations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Atlikta</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedViolations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Apmokėta</p>
                <p className="text-2xl font-bold text-gray-900">{stats.paidPenalties}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Bendra suma</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalPenalty.toFixed(2)}€</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow">
          <ReactDataTable
            data={violations.filter(violation => {
              // Status filter logic
              if (statusFilter === 1 && violation.status !== 'completed') return false;
              if (statusFilter === -1 && violation.status !== 'pending') return false;

              // Penalty status filter logic
              if (penaltyStatusFilter === 1 && violation.penalty_status !== 'paid') return false;
              if (penaltyStatusFilter === -1 && violation.penalty_status !== 'unpaid') return false;

              return true;
            }) as unknown as Record<string, unknown>[]}
            columns={columns}
            filterableColumns={['student_name', 'category', 'penalty_amount']}
            customFilters={{
              status: (
                <StatusFilter
                  value={statusFilter}
                  onChange={setStatusFilter}
                  label="Patirties statusas"
                  negativeLabel="Neatlikti"
                  positiveLabel="Atlikti"
                />
              ),
              penalty_status: (
                <PenaltyStatusFilter
                  value={penaltyStatusFilter}
                  onChange={setPenaltyStatusFilter}
                />
              )
            }}
            onFiltersChange={(filters, customFilters) => {
              // Reset custom filter states when clear filters is called
              if (Object.keys(filters).length === 0 && Object.keys(customFilters).length === 0) {
                setStatusFilter(0);
                setPenaltyStatusFilter(0);
              }
            }}
            onClearFilters={() => {
              // Reset switches to neutral position (0)
              setStatusFilter(0);
              setPenaltyStatusFilter(0);
            }}
          />
        </div>
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

      {/* CHANGE: Edit Violation Modal */}
      {isEditModalOpen && selectedViolationForEdit && (
        <ViolationFormModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
          editMode={true}
          initialData={selectedViolationForEdit}
          violationId={selectedViolationForEdit.id}
        />
      )}

      {/* Modal Components */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmation}
        onConfirm={confirmationModal.onConfirm || (() => {})}
        title={confirmationModal.options.title}
        message={confirmationModal.options.message}
        confirmText={confirmationModal.options.confirmText}
        cancelText={confirmationModal.options.cancelText}
        type={confirmationModal.options.type}
        isLoading={confirmationModal.isLoading}
      />

      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={closeNotification}
        title={notificationModal.options.title}
        message={notificationModal.options.message}
        type={notificationModal.options.type}
        autoClose={notificationModal.options.autoClose}
        autoCloseDelay={notificationModal.options.autoCloseDelay}
      />
    </div>
    </ClientAuthGuard>
  );
}