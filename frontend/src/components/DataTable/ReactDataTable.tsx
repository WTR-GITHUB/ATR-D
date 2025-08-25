// frontend/src/components/DataTable/ReactDataTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface Column {
  title: string;
  data: string;
  render?: (data: any, row: any) => React.ReactNode;
}

interface ReactDataTableProps {
  data: any[];
  columns: Column[];
  title?: string;
  itemsPerPage?: number;
  showFilters?: boolean;
  filterableColumns?: string[];
  customHeader?: React.ReactNode;
}

const ReactDataTable: React.FC<ReactDataTableProps> = ({ 
  data, 
  columns, 
  title = "Duomenų lentelė",
  itemsPerPage = 100,
  showFilters = true,
  filterableColumns,
  customHeader
}) => {
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtruoti duomenis
  const filteredData = useMemo(() => {
    return data.filter(row => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key];
        if (!filterValue) return true;
        
        const cellValue = row[key];
        if (cellValue === null || cellValue === undefined) return false;
        
        return cellValue.toString().toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [data, filters]);

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
            <div className="filter-row flex flex-wrap gap-4">
              {columns
                .filter(column => !filterableColumns || filterableColumns.includes(column.data))
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
              
              {/* Išvalyti mygtukas */}
              <div className="flex-shrink-0">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm whitespace-nowrap"
                >
                  Išvalyti
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
                      {column.render ? column.render(row[column.data], row) : row[column.data]}
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