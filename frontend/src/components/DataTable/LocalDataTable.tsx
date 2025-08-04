'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import '@/styles/datatables.css';

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
              this.api()
                .columns()
                .every(function (this: any) {
                  const column = this;
                  const title = column.footer().textContent;

                  // Create input element
                  const input = document.createElement('input');
                  input.placeholder = title;
                  input.style.cssText = `
                    width: 100%;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    padding: 4px 8px;
                    font-size: 12px;
                    background: #fff;
                    color: #495057;
                  `;
                  column.footer().replaceChildren(input);

                  // Event listener for user input
                  input.addEventListener('keyup', () => {
                    if (column.search() !== input.value) {
                      column.search(input.value).draw();
                    }
                  });
                });
            },
            ...options
          });
          initializedRef.current = true;
          
          // Apply styles after initialization
          setTimeout(() => {
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
                  'vertical-align': 'top'
                });
                
                // Force apply styles to headers
                window.$(table).find('thead th').css({
                  'background-color': '#f8f9fa',
                  'border': '1px solid #dee2e6',
                  'padding': '12px',
                  'font-weight': '600',
                  'text-align': 'left',
                  'color': '#495057',
                  'font-size': '14px',
                  'cursor': 'pointer',
                  'position': 'relative'
                });
                
                // Force apply styles to data cells
                window.$(table).find('tbody td').css({
                  'border': '1px solid #dee2e6',
                  'padding': '12px',
                  'text-align': 'left',
                  'vertical-align': 'top',
                  'color': '#212529',
                  'font-size': '14px',
                  'background-color': '#fff'
                });
                
                // Force apply styles to footer cells
                window.$(table).find('tfoot th').css({
                  'background-color': '#f8f9fa',
                  'border': '1px solid #dee2e6',
                  'padding': '8px',
                  'text-align': 'left',
                  'color': '#6c757d',
                  'font-size': '12px'
                });
              }
            }
          }, 100);
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
  }, [data, columns, options, destroyDataTable]);

  // Apply styles whenever data changes
  useEffect(() => {
    if (dataTableRef.current && initializedRef.current) {
      const applyStyles = () => {
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
            'vertical-align': 'top'
          });
          
          // Force apply styles to headers
          window.$(table).find('thead th').css({
            'background-color': '#f8f9fa',
            'border': '1px solid #dee2e6',
            'padding': '12px',
            'font-weight': '600',
            'text-align': 'left',
            'color': '#495057',
            'font-size': '14px',
            'cursor': 'pointer',
            'position': 'relative'
          });
          
          // Force apply styles to data cells
          window.$(table).find('tbody td').css({
            'border': '1px solid #dee2e6',
            'padding': '12px',
            'text-align': 'left',
            'vertical-align': 'top',
            'color': '#212529',
            'font-size': '14px',
            'background-color': '#fff'
          });
          
          // Force apply styles to footer cells
          window.$(table).find('tfoot th').css({
            'background-color': '#f8f9fa',
            'border': '1px solid #dee2e6',
            'padding': '8px',
            'text-align': 'left',
            'color': '#6c757d',
            'font-size': '12px'
          });
        }
      };

      // Apply styles after a short delay to ensure table is rendered
      setTimeout(applyStyles, 200);
    }
  }, [data]);

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
        <tfoot>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index}
                style={{
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  padding: '8px',
                  textAlign: 'left',
                  color: '#6c757d',
                  fontSize: '12px'
                }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </tfoot>
        <tbody>
          {/* DataTables will populate this automatically */}
        </tbody>
      </table>
    </div>
  );
};

export default LocalDataTable; 