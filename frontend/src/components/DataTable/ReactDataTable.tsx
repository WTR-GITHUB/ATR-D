// frontend/src/components/DataTable/ReactDataTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface Column {
  title: string;
  data: string;
  render?: (data: unknown, row: unknown) => React.ReactNode;
}

interface ReactDataTableProps {
  data: Record<string, unknown>[];
  columns: Column[];
  title?: string;
  itemsPerPage?: number;
  showFilters?: boolean;
  filterableColumns?: string[];
  filterableColumnIndexes?: number[]; // CHANGE: Pridėti galimybę nurodyti stulpelių indeksus
  customHeader?: React.ReactNode;
  customFilters?: { [key: string]: React.ReactNode };
  onFiltersChange?: (filters: { [key: string]: string }, customFilters: { [key: string]: unknown }) => void;
  onClearFilters?: () => void;
}

const ReactDataTable: React.FC<ReactDataTableProps> = ({ 
  data, 
  columns, 
  title = "Duomenų lentelė",
  itemsPerPage = 100,
  showFilters = true,
  filterableColumns,
  filterableColumnIndexes,
  customHeader,
  customFilters,
  onFiltersChange,
  onClearFilters
}) => {
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  // const [customFilterValues, setCustomFilterValues] = useState<{ [key: string]: unknown }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtruoti duomenis
  const filteredData = useMemo(() => {
    return data.filter(row => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key];
        if (!filterValue) return true;
        
        // Rasti stulpelį pagal key
        const column = columns.find(col => col.data === key);
        if (!column) return true;
        
        // CHANGE: Visada naudoti originalų duomenų lauką filtravimui, o ne render rezultatą
        // Render funkcija skirta tik vaizdavimui, ne filtravimui
        let cellValue = row[key];
        
        // Specialus filtravimas nested objektams
        if (key === 'lesson_title') {
          cellValue = (row as { lesson?: { title?: string } }).lesson?.title || '';
        }
        else if (key === 'subject_name') {
          cellValue = (row as { global_schedule?: { subject?: { name?: string } } }).global_schedule?.subject?.name || '';
        }
        else if (key === 'level_name') {
          cellValue = (row as { global_schedule?: { level?: { name?: string } } }).global_schedule?.level?.name || '';
        }
        else if (key === 'classroom_name') {
          cellValue = (row as { global_schedule?: { classroom?: { name?: string } } }).global_schedule?.classroom?.name || '';
        }
        
        if (cellValue === null || cellValue === undefined) return false;
        
        // Specialus filtravimas skaičiams (mokesčio stulpelis)
        if (key === 'penalty_amount' && column.render) {
          const originalValue = row[key];
          const numericValue = parseFloat(String(originalValue)) || 0;
          const filterNumeric = parseFloat(filterValue);
          
          if (!isNaN(filterNumeric)) {
            return Math.abs(numericValue - filterNumeric) < 0.01; // Tolerancija 0.01
          }
        }
        
        // Specialus filtravimas statusams - filtruoti pagal originalų lauką, ne render rezultatą
        if ((key === 'status' || key === 'penalty_status') && column.render) {
          const originalValue = row[key];
          return originalValue && originalValue.toString().toLowerCase().includes(filterValue.toLowerCase());
        }
        
        return cellValue.toString().toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [data, filters, columns]);

  // Rūšiuoti duomenis
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Puslapiavimas
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Filtravimo funkcija
  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
    setCurrentPage(1); // Grįžti į pirmą puslapį
  };

  // Išvalyti filtrus
  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
    // Notify parent components to reset their custom filters
    if (onFiltersChange) {
      onFiltersChange({}, {});
    }
    // Call parent's clear filters function to reset switches
    if (onClearFilters) {
      onClearFilters();
    }
  };

  // Rūšiavimo funkcija
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Puslapiavimo funkcijos
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Custom header */}
        {customHeader && (
          <div className="mb-4">
            {customHeader}
          </div>
        )}
        {/* Filtravimo laukeliai */}
        {showFilters && (
          <div className="filter-container mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="filter-row flex flex-wrap gap-4 items-center justify-center">
              {columns
                .filter((column, index) => {
                  // CHANGE: Pirmiausia tikrinti filterableColumnIndexes, tada filterableColumns
                  if (filterableColumnIndexes) {
                    return filterableColumnIndexes.includes(index);
                  }
                  return !filterableColumns || filterableColumns.includes(column.data);
                })
                .map((column, index) => (
                <div key={index} className="w-[150px]">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {column.title}
                  </label>
                  <input
                    type="text"
                    placeholder={`Ieškoti ${column.title}`}
                    value={filters[column.data] || ''}
                    onChange={(e) => handleFilterChange(column.data, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              ))}
              
              {/* Custom filtrai */}
              {customFilters && Object.entries(customFilters).map(([key, filterComponent]) => (
                <div key={key} className="w-[175px]">
                  <div className="min-h-[42px] flex items-center justify-center">
                    {filterComponent}
                  </div>
                </div>
              ))}
              
              {/* Išvalyti mygtukas */}
              <div className="w-[150px]">
                <div className="h-6 mb-1"></div> {/* Tuščia eilutė label lygiavimui */}
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm font-medium"
                >
                  Išvalyti filtrus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lentelė */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(column.data)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{column.title}</span>
                      {sortColumn === column.data && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="border border-gray-200 px-4 py-3 text-sm text-gray-900"
                    >
                      {column.render ? column.render(row[column.data], row) : String(row[column.data] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Puslapiavimas */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Rodomi įrašai nuo {startIndex + 1} iki {Math.min(endIndex, sortedData.length)} iš {sortedData.length}
              {Object.values(filters).some(f => f) && (
                <span className="ml-2 text-gray-500">
                  (atrinkta iš {data.length} įrašų)
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ‹
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              {totalPages > 5 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ›
              </button>
            </div>
          </div>
        )}

        {/* Statistika */}
        <div className="mt-4 text-sm text-gray-600">
          Iš viso: {sortedData.length} įrašų
          {Object.values(filters).some(f => f) && (
            <span className="ml-2">
              (filtruota iš {data.length} įrašų)
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReactDataTable; 