// /home/vilkas/atradimai/dienynas/frontend/src/app/mentors/violations/page.tsx

// Mentorių pagrindinis pažeidimų/skolų puslapis
// Pateikia greitųjų veiksmų mygtukus ir bendrą mokyklos statistiką
// CHANGE: Nukopijuotas iš curators ir pritaikytas mentors rolės puslapiui

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { violationAPI } from '@/lib/api';
import { 
  AlertTriangle, 
  Plus, 
  Settings, 
  BarChart3, 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  DollarSign,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ViolationFormModal from '@/components/ui/ViolationFormModal';

import { ViolationStats, ViolationCategoryStats } from '@/lib/types';

export default function MentorViolationsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ViolationStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<ViolationCategoryStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch statistics data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setLoadingProgress(0);
        setError(null);

        // CHANGE: Gauname duomenis paraleliai vietoj nuosekliai
        setLoadingProgress(25);
        const [statsResponse, categoryResponse] = await Promise.all([
          violationAPI.stats.getGeneral({
            period: selectedPeriod
          }),
          violationAPI.stats.getCategory({
            period: selectedPeriod
          })
        ]);
        
        setLoadingProgress(75);
        setStats(statsResponse.data);
        setCategoryStats(categoryResponse.data);
        setLoadingProgress(100);

      } catch (err: unknown) {
        console.error('Error fetching violation stats:', err);
        setError('Nepavyko užkrauti statistikos duomenų');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [selectedPeriod]);

  // Prepare data for charts
  const pieChartData = categoryStats.map(cat => ({
    name: cat.category_name,
    value: cat.total_count,
    color: getCategoryColor(cat.color_type)
  }));

  const barChartData = categoryStats.map(cat => ({
    category: cat.category_name,
    total: cat.total_count,
    completed: cat.completed_count,
    pending: cat.pending_count
  }));

  // Get color for category
  function getCategoryColor(colorType: string): string {
    const colorMap: { [key: string]: string } = {
      'RED': '#ef4444',
      'BLUE': '#3b82f6',
      'YELLOW': '#f59e0b',
      'ORANGE': '#f97316',
      'PURPLE': '#8b5cf6',
      'GREEN': '#22c55e',
      'DARK_GREEN': '#16a34a',
      'AMBER': '#f59e0b',
      'DARK_RED': '#dc2626',
      'DEFAULT': '#6b7280'
    };
    return colorMap[colorType] || '#6b7280';
  }

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-blue-600">{`Pažeidimų: ${payload[0].value}`}</p>
          <p className="text-gray-600">{`${((payload[0].value / pieChartData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart
  const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey === 'completed' ? 'Išpirkta' : 'Neišpirkta'}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kraunama pažeidimų statistika...</p>
          <p className="mt-2 text-sm text-gray-500">Prašome palaukti</p>
          
          {/* Progress bar */}
          <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-gray-500">{loadingProgress}%</p>
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
                href="/curators"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Atgal į kuratorių panelę
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Skolų valdymas</h1>
            </div>
            <div className="flex items-center gap-4">
              <select 
                className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="week">Šią savaitę</option>
                <option value="month">Šį mėnesį</option>
                <option value="quarter">Šį ketvirtį</option>
                <option value="year">Šiais metais</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Greitos veiklos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Skirti skolą - Modal button */}
                <button 
                  className="text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full"
                  onClick={() => setIsModalOpen(true)}
                >
                  <div className="flex items-center space-x-3">
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Skirti skolą</span>
                  </div>
                </button>
                
                {/* Skolų valdymas */}
                <Link href="/mentors/violations/management" className="block">
                  <button className="text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full">
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">Skolų valdymas</span>
                    </div>
                  </button>
                </Link>
                
                {/* Detali analizė */}
                <Link href="/mentors/violations/analytics" className="block">
                  <button className="text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium">Detali analizė</span>
                    </div>
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Viso pažeidimų</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total_violations}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Išpirkta</p>
                      <p className="text-3xl font-bold text-green-600">{stats.completed_violations}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Neišpirkta</p>
                      <p className="text-3xl font-bold text-orange-600">{stats.pending_violations}</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Išpirkimo rodiklis</p>
                      <p className="text-3xl font-bold text-blue-600">{(() => {
                        // Patikrinam ar completion_rate egzistuoja ir yra validus
                        const rate = stats.completion_rate;
                        
                        // Jei null, undefined arba tuščias string
                        if (rate == null || rate === undefined || (typeof rate === 'string' && rate === '')) {
                          return '0.0%';
                        }
                        
                        // Konvertuojam į skaičių
                        const numRate = Number(rate);
                        
                        // Patikrinam ar konvertavimas sėkmingas
                        return isNaN(numRate) ? '0.0%' : `${numRate.toFixed(1)}%`;
                      })()}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts */}
          {categoryStats.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Pažeidimų pasiskirstymas pagal kategorijas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {pieChartData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Išpirkimo statistika pagal kategorijas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="category" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip content={<BarTooltip />} />
                      <Legend />
                      <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Išpirkta" />
                      <Bar dataKey="pending" stackId="a" fill="#f97316" name="Neišpirkta" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detailed Statistics Table */}
          {categoryStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detali statistika</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategorija
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Viso pažeidimų
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Išpirkta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Neišpirkta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Išpirkimo %
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mokestis (€)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categoryStats.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.category_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.total_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {item.completed_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                            {item.pending_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(() => {
                              // Patikrinam ar completion_rate egzistuoja ir yra validus
                              const rate = item.completion_rate;
                              
                              // Jei null, undefined arba tuščias string
                              if (rate == null || rate === undefined || (typeof rate === 'string' && rate === '')) {
                                return '0.0%';
                              }
                              
                              // Konvertuojam į skaičių
                              const numRate = Number(rate);
                              
                              // Patikrinam ar konvertavimas sėkmingas
                              return isNaN(numRate) ? '0.0%' : `${numRate.toFixed(1)}%`;
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(() => {
                              // Patikrinam ar penalty_amount egzistuoja ir yra validus
                              const penalty = item.penalty_amount;
                              
                              // Jei null, undefined arba tuščias string
                              if (penalty == null || penalty === undefined || (typeof penalty === 'string' && penalty === '')) {
                                return '0.00€';
                              }
                              
                              // Konvertuojam į skaičių
                              const numPenalty = Number(penalty);
                              
                              // Patikrinam ar konvertavimas sėkmingas
                              return isNaN(numPenalty) ? '0.00€' : `${numPenalty.toFixed(2)}€`;
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Violation Form Modal */}
      <ViolationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Refresh statistics after successful creation
          const fetchStats = async () => {
            try {
              const statsResponse = await violationAPI.stats.getGeneral({
                period: selectedPeriod
              });
              setStats(statsResponse.data);

              const categoryResponse = await violationAPI.stats.getCategory({
                period: selectedPeriod
              });
              setCategoryStats(categoryResponse.data);
            } catch (err) {
              console.error('Error refreshing stats:', err);
            }
          };
          fetchStats();
        }}
      />
    </div>
  );
}