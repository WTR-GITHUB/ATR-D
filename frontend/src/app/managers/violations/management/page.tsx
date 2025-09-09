// /home/vilkas/atradimai/dienynas/frontend/src/app/managers/violations/management/page.tsx

// Managerių pažeidimų valdymo puslapis su lentele, filtrais ir masiniais veiksmais
// Leidžia peržiūrėti, redaguoti, trinti ir keisti pažeidimų statusus
// CHANGE: Nukopijuotas iš curators ir pritaikytas managers rolės puslapiui

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ReactDataTable } from '@/components/DataTable';
import { violationAPI } from '@/lib/api';
import { PenaltyStatus } from '@/lib/types';
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
  Users,
  FileText,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { Violation, ViolationFilters } from '@/lib/types';

export default function ManagerViolationsManagementPage() {
  const { user } = useAuth();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedViolations, setSelectedViolations] = useState<number[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  
  // Todo modal state
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [selectedViolationForTodos, setSelectedViolationForTodos] = useState<Violation | null>(null);
  
  // CHANGE: Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedViolationForEdit, setSelectedViolationForEdit] = useState<Violation | null>(null);
  
  // Categories state
  const [categories, setCategories] = useState<any[]>([]);
  
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
        setError('Nepavyko užkrauti pažeidimų sąrašo');
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
      render: (data: any) => data || '-'
    },
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
      title: 'Skolos statusas',
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
      render: (data: any, row: Violation) => {
        const amount = parseFloat(String(data)) || 0;
        return `${amount.toFixed(2)}€`;
      }
    },
    {
      title: 'Data',
      data: 'created_at',
      render: (data: any) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
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

  // Event handlers
  const handleEdit = (id: number) => {
    // CHANGE: Find violation by ID and open edit modal
    const violation = violations.find(v => v.id === id);
    if (violation) {
      setSelectedViolationForEdit(violation);
      setIsEditModalOpen(true);
    }
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

  const handleUpdateTodos = async (violationId: number, updatedTodos: any[], allCompleted: boolean, penaltyStatus: 'paid' | 'unpaid') => {
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
          ? { ...v, todos: updatedTodos, penalty_status: penaltyStatus as PenaltyStatus, status: finalStatus }
          : v
      ));
      
      handleCloseTodoModal();
    } catch (err) {
      console.error('Error updating todos:', err);
      alert('Nepavyko atnaujinti užduočių');
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedViolations.length === 0) {
      alert('Pasirinkite pažeidimus');
      return;
    }

    setIsBulkActionLoading(true);
    try {
      await violationAPI.violations.bulkAction({
        action,
        violation_ids: selectedViolations
      });
      
      // Refresh data
      const response = await violationAPI.violations.getAll();
      setViolations(response.data);
      setSelectedViolations([]);
    } catch (err) {
      console.error('Error performing bulk action:', err);
      alert('Nepavyko atlikti masinio veiksmo');
    } finally {
      setIsBulkActionLoading(false);
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
                Atgal į skolų puslapį
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Pažeidimų valdymas</h1>
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
                <p className="text-sm font-medium text-gray-500">Iš viso pažeidimų</p>
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
            })}
            columns={columns}
            filterableColumns={['student_name', 'category', 'penalty_amount']}
            customFilters={{
              status: (
                <StatusFilter
                  value={statusFilter}
                  onChange={setStatusFilter}
                  label="Skolos statusas"
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
    </div>
  );
}