// frontend/src/types/jquery.d.ts
declare module 'jquery' {
  interface JQuery {
    DataTable(options?: Record<string, unknown>): {
      table: () => { node: () => HTMLElement | null };
      destroy: () => void;
      api: () => {
        columns: () => {
          every: (callback: (this: { header: () => HTMLElement; search: (value?: string) => unknown }) => void) => void;
        };
      };
    };
  }
}

declare module 'datatables.net-dt' {
  // DataTables module declaration
} 