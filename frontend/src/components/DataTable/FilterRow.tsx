// frontend/src/components/DataTable/FilterRow.tsx
'use client';

import React from 'react';

interface FilterRowProps {
  columns: {
    title: string;
    data: string;
  }[];
  onFilterChange: (columnIndex: number, value: string) => void;
}

const FilterRow: React.FC<FilterRowProps> = ({ columns, onFilterChange }) => {
  return (
    <div className="filter-container" style={{
      marginBottom: '16px',
      padding: '16px',
      background: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="filter-row" style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        {columns.map((column, index) => (
          <div key={index} style={{ flex: 1, minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '4px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#495057'
            }}>
              {column.title}
            </label>
            <input
              type="text"
              placeholder={`Ieškoti ${column.title}`}
              onChange={(e) => onFilterChange(index, e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                padding: '8px 12px',
                fontSize: '14px',
                background: '#fff',
                color: '#495057',
                boxSizing: 'border-box'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterRow; 