// /home/vilkas/atradimai/dienynas/frontend/src/app/violations/analytics/page.tsx

// Detalių pažeidimų analizės puslapis su išplėstiniais grafikais ir statistikomis
// Rodo tendencijas, mokinių statistikas, kategorijų analizę ir laiko eilutes
// CHANGE: Sukurtas detalių analizės puslapis su multiple chart types ir advanced filtering

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { violationAPI } from '@/lib/api';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
  ComposedChart
} from 'recharts';
import { ViolationStats, ViolationCategoryStats, Violation } from '@/lib/types';

export default function ViolationAnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ViolationStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<ViolationCategoryStats[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Fetch data
  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, selectedYear, selectedMonth, selectedWeek]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: any = { period: selectedPeriod };
      if (selectedPeriod === 'year') params.year = selectedYear;
      if (selectedPeriod === 'month') params.year = selectedYear;
      if (selectedPeriod === 'month') params.month = selectedMonth;
      if (selectedPeriod === 'week') params.week = selectedWeek;

      // Fetch all data in parallel
      const [statsResponse, categoryResponse, violationsResponse] = await Promise.all([
        violationAPI.stats.getGeneral(params),
        violationAPI.stats.getCategory(params),
        violationAPI.violations.getAll(params)
      ]);

      setStats(statsResponse.data);
      setCategoryStats(categoryResponse.data);
      setViolations(violationsResponse.data);

    } catch (err: unknown) {
      console.error('Error fetching analytics data:', err);
      setError('Nepavyko užkrauti analizės duomenų');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare data for charts
  const pieChartData = categoryStats.map(cat => ({
    name: cat.category_name,
    value: cat.total_count,
    color: getCategoryColor(cat.color_type),
    completed: cat.completed_count,
    pending: cat.pending_count
  }));

  const barChartData = categoryStats.map(cat => ({
    category: cat.category_name,
    total: cat.total_count,
    completed: cat.completed_count,
    pending: cat.pending_count,
    completionRate: cat.completion_rate,
    penaltyAmount: cat.penalty_amount
  }));

  // Monthly trends data
  const monthlyTrendsData = generateMonthlyTrends(violations);

  // Student statistics
  const studentStats = generateStudentStats(violations);

  // Time series data
  const timeSeriesData = generateTimeSeriesData(violations);

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

  // Generate monthly trends data
  function generateMonthlyTrends(violations: Violation[]) {
    const months = ['Sau', 'Vas', 'Kov', 'Bal', 'Geg', 'Bir', 'Lie', 'Rgp', 'Rgs', 'Spa', 'Lap', 'Grd'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthViolations = violations.filter(v => {
        const date = new Date(v.created_at);
        return date.getFullYear() === currentYear && date.getMonth() === index;
      });
      
      return {
        month,
        total: monthViolations.length,
        completed: monthViolations.filter(v => v.status === 'completed').length,
        pending: monthViolations.filter(v => v.status === 'pending').length,
        penaltyAmount: monthViolations.reduce((sum, v) => sum + (v.penalty_amount || 0), 0)
      };
    });
  }

  // Generate student statistics
  function generateStudentStats(violations: Violation[]) {
    const studentMap = new Map();
    
    violations.forEach(violation => {
      const studentId = violation.student;
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          name: violation.student_name,
          total: 0,
          completed: 0,
          pending: 0,
          penaltyAmount: 0
        });
      }
      
      const student = studentMap.get(studentId);
      student.total++;
      if (violation.status === 'completed') student.completed++;
      if (violation.status === 'pending') student.pending++;
      student.penaltyAmount += violation.penalty_amount || 0;
    });
    
    return Array.from(studentMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10 students
  }

  // Generate time series data
  function generateTimeSeriesData(violations: Violation[]) {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        day: date.getDate(),
        month: date.getMonth() + 1,
        total: 0,
        completed: 0,
        pending: 0
      };
    });
    
    violations.forEach(violation => {
      const violationDate = new Date(violation.created_at).toISOString().split('T')[0];
      const dayData = last30Days.find(d => d.date === violationDate);
      if (dayData) {
        dayData.total++;
        if (violation.status === 'completed') dayData.completed++;
        if (violation.status === 'pending') dayData.pending++;
      }
    });
    
    return last30Days;
  }

  // Custom tooltips
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kraunama analizė...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Detali analizė</h1>
            <p className="text-gray-600">
              Išsamūs pažeidimų ir skolų analizės duomenys
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchAnalyticsData}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atnaujinti
            </button>
            <Link 
              href="/violations"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Grįžti atgal
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrai:</span>
          </div>
          
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

          {selectedPeriod === 'year' && (
            <select 
              className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}

          {selectedPeriod === 'month' && (
            <>
              <select 
                className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select 
                className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {new Date(0, month - 1).toLocaleString('lt-LT', { month: 'long' })}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Viso pažeidimų</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_violations}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.completion_rate.toFixed(1)}% išpirkimo rodiklis
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bendras mokestis</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_penalty_amount.toFixed(2)}€</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.penalty_payment_rate.toFixed(1)}% apmokėjimo rodiklis
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Neatlikta</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pending_violations}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {((stats.pending_violations / stats.total_violations) * 100).toFixed(1)}% nuo visų
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingDown className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Išpirkta</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed_violations}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {((stats.completed_violations / stats.total_violations) * 100).toFixed(1)}% nuo visų
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Category Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Pažeidimų pasiskirstymas pagal kategorijas</h3>
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
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
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
        </div>

        {/* Completion Status Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Išpirkimo statistika pagal kategorijas</h3>
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
        </div>
      </div>

      {/* Time Series and Student Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Mėnesio tendencijos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Viso" />
              <Line type="monotone" dataKey="completed" stroke="#22c55e" name="Išpirkta" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Top Students */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Daugiausiai pažeidimų turintys mokiniai</h3>
          <div className="space-y-3">
            {studentStats.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">
                      {student.completed} išpirkta, {student.pending} neatlikta
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{student.total}</p>
                  <p className="text-sm text-gray-500">{student.penaltyAmount.toFixed(2)}€</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 30-Day Trend */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Paskutinių 30 dienų tendencijos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="total" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Viso" />
            <Area type="monotone" dataKey="completed" stackId="2" stroke="#22c55e" fill="#22c55e" name="Išpirkta" />
            <Area type="monotone" dataKey="pending" stackId="2" stroke="#f97316" fill="#f97316" name="Neatlikta" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Category Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Detali kategorijų analizė</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategorija
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Viso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Išpirkta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Neatlikta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Išpirkimo %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mokestis (€)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vidutinis mokestis
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
                    {item.completion_rate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.penalty_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.total_count > 0 ? (item.penalty_amount / item.total_count).toFixed(2) : '0.00'}€
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
