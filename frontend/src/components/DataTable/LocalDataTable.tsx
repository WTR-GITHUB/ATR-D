// frontend/src/components/DataTable/LocalDataTable.tsx
'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import '@/styles/datatables.css';
import FilterRow from './FilterRow';

interface LocalDataTableProps {
  id: string;
  data: any[];
  columns: {
    title: string;
    data: string;
    render?: (data: any, type: any, row: any) => string;
  }[];
  options?: any;
}

declare global {
  interface Window {
    $: any;
    DataTable: any;
  }
}

const LocalDataTable: React.FC<LocalDataTableProps> = ({ 
  id, 
  data, 
  columns, 
  options = {} 
}) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const dataTableRef = useRef<any>(null);
  const initializedRef = useRef(false);

  const applyStyles = useCallback(() => {
    if (dataTableRef.current) {
      const table = dataTableRef.current.table().node();
      if (table) {
        // Force apply styles to table
        window.$(table).css({
          'border': '1px solid #dee2e6',
          'border-collapse': 'collapse',
          'width': '100%',
          'background-color': '#fff'
        });
        
        // Force apply styles to all cells
        window.$(table).find('th, td').css({
          'border': '1px solid #dee2e6',
          'padding': '12px',
          'text-align': 'left',
          'vertical-align': 'top',
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          'font-size': '14px',
          'line-height': '1.5',
          'color': '#212529'
        });
        
        // Force apply styles to all rows
        window.$(table).find('tbody tr').css({
          'border-bottom': '1px solid #dee2e6',
          'background-color': '#fff'
        });
        
        // Apply alternating row colors
        window.$(table).find('tbody tr:nth-child(even)').css({
          'background-color': '#f8f9fa'
        });
        
        // Apply hover effect
        window.$(table).find('tbody tr').hover(
          function(this: any) { window.$(this).css('background-color', '#e9ecef'); },
          function(this: any) { 
            const index = window.$(this).index();
            const bgColor = index % 2 === 0 ? '#fff' : '#f8f9fa';
            window.$(this).css('background-color', bgColor);
          }
        );
        
        // Force apply styles to headers
        window.$(table).find('thead th').css({
          'background-color': '#f8f9fa',
          'font-weight': '600',
          'border-bottom': '2px solid #dee2e6'
        });
      }
    }
  }, []);

  const destroyDataTable = useCallback(() => {
    if (dataTableRef.current && initializedRef.current) {
      try {
        dataTableRef.current.destroy();
      } catch (error) {
        console.error('Error destroying DataTable:', error);
      }
      dataTableRef.current = null;
      initializedRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Load jQuery and DataTables from local files
    const loadLibraries = async () => {
      if (typeof window !== 'undefined' && !window.$) {
        // Load jQuery
        const jqueryScript = document.createElement('script');
        jqueryScript.src = '/jquery-3.7.1.js';
        document.head.appendChild(jqueryScript);

        // Load DataTables after jQuery
        jqueryScript.onload = () => {
          const dataTablesScript = document.createElement('script');
          dataTablesScript.src = '/dataTables.js';
          document.head.appendChild(dataTablesScript);

          dataTablesScript.onload = () => {
            initializeDataTable();
          };
        };
      } else if (window.$ && window.DataTable) {
        initializeDataTable();
      }
    };

    const initializeDataTable = () => {
      if (tableRef.current && !initializedRef.current && window.$ && window.DataTable) {
        try {
          // Destroy existing instance if any
          if (dataTableRef.current) {
            dataTableRef.current.destroy();
            dataTableRef.current = null;
          }

          // Initialize DataTable with simple configuration
          dataTableRef.current = window.$(`#${id}`).DataTable({
            data: data,
            columns: columns,
            responsive: true,
            pageLength: 10,
            order: [[0, 'asc']],
            language: {
              "sProcessing":     "Apdorojama...",
              "sLengthMenu":     "Rodyti _MENU_ įrašų",
              "sZeroRecords":    "Įrašų nerasta",
              "sInfo":           "Rodomi įrašai nuo _START_ iki _END_ iš _TOTAL_",
              "sInfoEmpty":      "Rodomi įrašai nuo 0 iki 0 iš 0",
              "sInfoFiltered":   "(atrinkta iš _MAX_ įrašų)",
              "sInfoPostFix":    "",
              "sSearch":         "Ieškoti:",
              "sUrl":            "",
              "oPaginate": {
                "sFirst":    "«",
                "sPrevious": "‹",
                "sNext":     "›",
                "sLast":     "»"
              },
              "oAria": {
                "sSortAscending":  ": rūšiuoti didėjimo tvarka",
                "sSortDescending": ": rūšiuoti mažėjimo tvarka"
              }
            },
            initComplete: function (this: any) {
              // Create filter container above table
              const tableWrapper = window.$(`#${id}`).closest('.dataTables_wrapper');
              const filterContainer = window.$('<div class="filter-container" style="margin-bottom: 16px; padding: 16px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; position: relative; z-index: 10;"></div>');
              const filterRow = window.$('<div class="filter-row" style="display: flex; gap: 16px; flex-wrap: wrap;"></div>');
              
              this.api()
                .columns()
                .every(function (this: any) {
                  const column = this;
                  const title = column.header().textContent;

                  // Create filter input
                  const filterDiv = window.$('<div style="flex: 1; min-width: 200px;"></div>');
                  const label = window.$(`<label style="display: block; margin-bottom: 4px; font-size: 12px; font-weight: 600; color: #495057;">${title}</label>`);
                  const input = window.$('<input type="text" />');
                  
                  input.css({
                    'width': '100%',
                    'border': '1px solid #dee2e6',
                    'border-radius': '4px',
                    'padding': '8px 12px',
                    'font-size': '14px',
                    'background': '#fff',
                    'color': '#495057',
                    'box-sizing': 'border-box'
                  });
                  
                  input.attr('placeholder', `Ieškoti ${title}`);
                  
                  filterDiv.append(label).append(input);
                  filterRow.append(filterDiv);
                  
                  // Event listener for user input
                  input.on('keyup change', function(this: any) {
                    if (column.search() !== this.value) {
                      column.search(this.value).draw();
                    }
                  });
                });
              
              filterContainer.append(filterRow);
              
              // Insert filter container before the table wrapper
              tableWrapper.before(filterContainer);
              
              // Force show the filter container
              filterContainer.show();
              console.log('Filter container created:', filterContainer.length);
              
              // Alternative: Insert directly into the parent container
              const parentContainer = tableWrapper.parent();
              if (parentContainer.length) {
                parentContainer.prepend(filterContainer);
                console.log('Filter container inserted into parent');
              }
            },
            ...options
          });
          
          initializedRef.current = true;
          
          // Apply styles after initialization
          applyStyles();
          
          // Re-apply styles after any data changes
          dataTableRef.current.on('draw.dt', applyStyles);
          
        } catch (error) {
          console.error('Error initializing DataTable:', error);
        }
      }
    };

    loadLibraries();

    // Cleanup on unmount
    return () => {
      destroyDataTable();
    };
  }, [data, columns, options, destroyDataTable, applyStyles]);

  // Apply styles whenever data changes
  useEffect(() => {
    if (dataTableRef.current && initializedRef.current) {
      applyStyles();
    }
  }, [data, applyStyles]);

  return (
    <div className="overflow-x-auto">
      <table 
        ref={tableRef} 
        id={id} 
        className="display w-full"
        style={{
          border: '1px solid #dee2e6',
          borderCollapse: 'collapse',
          width: '100%',
          backgroundColor: '#fff'
        }}
      >
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index}
                style={{
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  padding: '12px',
                  fontWeight: '600',
                  textAlign: 'left',
                  color: '#495057',
                  fontSize: '14px',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {column.title}
                <span style={{ float: 'right', marginLeft: '5px', color: '#6c757d' }}>↕</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* DataTables will populate this automatically */}
        </tbody>
      </table>
    </div>
  );
};

export default LocalDataTable; 