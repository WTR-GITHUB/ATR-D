// /home/vilkas/atradimai/dienynas/frontend/src/app/violations/management/page.tsx

// Pažeidimų valdymo puslapis su lentele, filtrais ir masiniais veiksmais
// Leidžia peržiūrėti, redaguoti, trinti ir keisti pažeidimų statusus
// CHANGE: Sukurtas pažeidimų valdymo puslapis su ReactDataTable ir bulk operations

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ReactDataTable } from '@/components/DataTable';
import { violationAPI } from '@/lib/api';
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

export default function ViolationManagementPage() {
  const { user } = useAuth();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedViolations, setSelectedViolations] = useState<number[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

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

  // Handle individual violation actions
  const handleEdit = (violationId: number) => {
    // TODO: Navigate to edit page or open edit modal
    alert(`Redaguoti pažeidimą ${violationId} - bus implementuota vėliau`);
  };

  const handleDelete = async (violationId: number) => {
    if (confirm('Ar tikrai norite ištrinti šį pažeidimą?')) {
      try {
        await violationAPI.violations.delete(violationId);
        setViolations(prev => prev.filter(v => v.id !== violationId));
      } catch (error) {
        console.error('Error deleting violation:', error);
        alert('Nepavyko ištrinti pažeidimo');
      }
    }
  };

  const handleMarkCompleted = async (violationId: number) => {
    try {
      await violationAPI.violations.markCompleted(violationId);
      setViolations(prev => prev.map(v => 
        v.id === violationId 
          ? { ...v, status: 'completed', task_completed_at: new Date().toISOString() }
          : v
      ));
    } catch (error) {
      console.error('Error marking violation as completed:', error);
      alert('Nepavyko pažymėti pažeidimo kaip atlikto');
    }
  };

  const handleMarkPenaltyPaid = async (violationId: number) => {
    try {
      await violationAPI.violations.markPenaltyPaid(violationId);
      setViolations(prev => prev.map(v => 
        v.id === violationId 
          ? { ...v, penalty_status: 'paid', penalty_paid_at: new Date().toISOString() }
          : v
      ));
    } catch (error) {
      console.error('Error marking penalty as paid:', error);
      alert('Nepavyko pažymėti mokesčio kaip apmokėto');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedViolations.length === 0) {
      alert('Pasirinkite bent vieną pažeidimą');
      return;
    }

    const actionText = {
      'mark_completed': 'pažymėti kaip atliktus',
      'mark_penalty_paid': 'pažymėti mokesčius kaip apmokėtus',
      'recalculate_penalties': 'perskaičiuoti mokesčius',
      'delete': 'ištrinti'
    }[action];

    if (!confirm(`Ar tikrai norite ${actionText} ${selectedViolations.length} pažeidimų?`)) {
      return;
    }

    try {
      setIsBulkActionLoading(true);
      
      if (action === 'delete') {
        // Delete violations one by one
        await Promise.all(
          selectedViolations.map(id => violationAPI.violations.delete(id))
        );
        setViolations(prev => prev.filter(v => !selectedViolations.includes(v.id)));
      } else {
        // Use bulk action API
        await violationAPI.violations.bulkAction({
          action,
          violation_ids: selectedViolations
        });
        
        // Refresh data after bulk action
        const response = await violationAPI.violations.getAll();
        setViolations(response.data);
      }
      
      setSelectedViolations([]);
      alert(`Sėkmingai ${actionText} ${selectedViolations.length} pažeidimų`);
      
    } catch (error) {
      console.error(`Error performing bulk action ${action}:`, error);
      alert(`Nepavyko ${actionText} pažeidimų`);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  // Get status badge component
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { 
        text: 'Neatlikta', 
        className: 'bg-orange-100 text-orange-800',
        icon: Clock
      },
      'completed': { 
        text: 'Išpirkta', 
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  // Get penalty status badge component
  const getPenaltyStatusBadge = (status: string) => {
    const statusConfig = {
      'unpaid': { 
        text: 'Neapmokėta', 
        className: 'bg-red-100 text-red-800',
        icon: DollarSign
      },
      'paid': { 
        text: 'Apmokėta', 
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Mokinys',
      data: 'student_name',
      render: (data: any) => data || '-'
    },
    {
      title: 'Kategorija',
      data: 'category',
      render: (data: any) => data || '-'
    },
    {
      title: 'Tipas',
      data: 'violation_type',
      render: (data: any) => data || '-'
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
      title: 'Suma',
      data: 'amount',
      render: (data: any, row: Violation) => {
        return `${data || 0} ${row.currency || 'EUR'}`;
      }
    },
    {
      title: 'Statusas',
      data: 'status',
      render: (data: any) => getStatusBadge(data)
    },
    {
      title: 'Mokestis',
      data: 'penalty_status',
      render: (data: any) => getPenaltyStatusBadge(data)
    },
    {
      title: 'Mokestis (€)',
      data: 'penalty_amount',
      render: (data: any) => `${data || 0}`
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
      render: (data: any, row: Violation) => (
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleEdit(row.id)} 
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors" 
            title="Redaguoti"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          {row.status === 'pending' && (
            <button 
              onClick={() => handleMarkCompleted(row.id)} 
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors" 
              title="Pažymėti kaip atlikta"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          
          {row.penalty_status === 'unpaid' && row.penalty_amount > 0 && (
            <button 
              onClick={() => handleMarkPenaltyPaid(row.id)} 
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors" 
              title="Pažymėti mokestį kaip apmokėtą"
            >
              <DollarSign className="w-4 h-4" />
            </button>
          )}
          
          <button 
            onClick={() => handleDelete(row.id)} 
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors" 
            title="Ištrinti"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Calculate statistics
  const stats = {
    total: violations.length,
    pending: violations.filter(v => v.status === 'pending').length,
    completed: violations.filter(v => v.status === 'completed').length,
    unpaid: violations.filter(v => v.penalty_status === 'unpaid').length,
    paid: violations.filter(v => v.penalty_status === 'paid').length,
    totalPenalty: violations.reduce((sum, v) => sum + (v.penalty_amount || 0), 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kraunama...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Klaida</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Skolų valdymas</h1>
            <p className="text-gray-600">
              Peržiūrėkite ir valdykite mokinių pažeidimus ir skolas
            </p>
          </div>
          <Link 
            href="/violations"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Grįžti atgal
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Viso</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Neatlikta</p>
              <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Išpirkta</p>
              <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Neapmokėta</p>
              <p className="text-xl font-bold text-gray-900">{stats.unpaid}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Apmokėta</p>
              <p className="text-xl font-bold text-gray-900">{stats.paid}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Mokestis</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalPenalty.toFixed(2)}€</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedViolations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-800">
                Pasirinkta {selectedViolations.length} pažeidimų
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('mark_completed')}
                disabled={isBulkActionLoading}
                className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-300 rounded hover:bg-green-200 disabled:opacity-50"
              >
                Pažymėti kaip atliktus
              </button>
              <button
                onClick={() => handleBulkAction('mark_penalty_paid')}
                disabled={isBulkActionLoading}
                className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-300 rounded hover:bg-green-200 disabled:opacity-50"
              >
                Pažymėti mokesčius
              </button>
              <button
                onClick={() => handleBulkAction('recalculate_penalties')}
                disabled={isBulkActionLoading}
                className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                Perskaičiuoti
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={isBulkActionLoading}
                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 disabled:opacity-50"
              >
                Ištrinti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {violations.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Pažeidimų nėra
          </h3>
          <p className="text-gray-600">
            Kol kas pažeidimų sąrašas tuščias.
          </p>
        </div>
      ) : (
        <ReactDataTable
          data={violations}
          columns={columns}
          title="Pažeidimų sąrašas"
          itemsPerPage={50}
          showFilters={true}
          filterableColumns={['student_name', 'category', 'violation_type', 'description']}
          selectable={true}
          onSelectionChange={setSelectedViolations}
        />
      )}
    </div>
  );
}
