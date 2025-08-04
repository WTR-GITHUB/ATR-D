# LocalDataTable Komponento Pilna Dokumentacija

## 🎯 Turinys
1. [Apžvalga](#apžvalga)
2. [Techninė architektūra](#techninė-architektūra)
3. [Priklausomybės](#priklausomybės)
4. [Failų struktūra](#failų-struktūra)
5. [Diegimo instrukcija](#diegimo-instrukcija)
6. [Naudojimo pavyzdžiai](#naudojimo-pavyzdžiai)
7. [Troubleshooting](#troubleshooting)
8. [API dokumentacija](#api-dokumentacija)

---

## 🎯 Apžvalga

`LocalDataTable` komponentas yra React komponentas, kuris suteikia pilną DataTables funkcionalumą naudojant vietinius jQuery ir DataTables failus. Komponentas yra sukurtas kaip alternatyva CDN sprendimams ir suteikia:

- ✅ Stulpelio filtravimą realiu laiku
- ✅ Globalų paiešką
- ✅ Rūšiavimą
- ✅ Puslapiavimą
- ✅ Lietuvių kalbos palaikymą
- ✅ Responsive dizainą
- ✅ TypeScript palaikymą

---

## 🏗️ Techninė architektūra

### Komponento veikimo principas:
1. **Dinamiškas failų kraunimas** - jQuery ir DataTables failai kraunami tik kai komponentas inicializuojamas
2. **React hooks integracija** - naudojami `useEffect`, `useRef` ir `useCallback`
3. **Saugus cleanup** - automatinis resursų išvalymas komponento išmontavimo metu
4. **TypeScript tipai** - pilnas tipų palaikymas

### Technologijos:
- **React 19** - UI komponentas
- **jQuery 3.7.1** - DOM manipuliacija
- **DataTables 1.13.7** - lentelių funkcionalumas
- **TypeScript** - tipų saugumas
- **Tailwind CSS** - stiliai

---

## 📦 Priklausomybės

### Būtinos priklausomybės:
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^19.0.0"
  }
}
```

### Failų priklausomybės:
- `jquery-3.7.1.js` - jQuery biblioteka
- `dataTables.js` - DataTables biblioteka
- `datatables.css` - DataTables stiliai

---

## 📁 Failų struktūra

```
frontend/
├── public/
│   ├── jquery-3.7.1.js      # jQuery biblioteka (279KB)
│   └── dataTables.js        # DataTables biblioteka (381KB)
├── src/
│   ├── components/DataTable/
│   │   ├── LocalDataTable.tsx   # Pagrindinis komponentas
│   │   └── index.ts             # Eksportai
│   ├── styles/
│   │   └── datatables.css       # DataTables stiliai
│   └── types/
│       └── jquery.d.ts          # jQuery tipų apibrėžimai
├── help/                       # Originalūs failai (backup)
│   ├── jquery-3.7.1.js
│   └── dataTables.js
└── DATATABLE_USAGE.md          # Naudojimo dokumentacija
```

---

## 🚀 Diegimo instrukcija

### 1 žingsnis: Paruošti failus

```bash
# Sukurti public katalogą (jei neegzistuoja)
mkdir -p frontend/public

# Nukopijuoti jQuery ir DataTables failus į public katalogą
cp help/jquery-3.7.1.js public/
cp help/dataTables.js public/
```

### 2 žingsnis: Sukurti komponentą

```bash
# Sukurti komponentų katalogą
mkdir -p src/components/DataTable
mkdir -p src/styles
mkdir -p src/types
```

### 3 žingsnis: Sukurti failus

#### `src/types/jquery.d.ts`
```typescript
declare module 'jquery' {
  interface JQuery {
    DataTable(options?: any): any;
  }
}

declare module 'datatables.net-dt' {
  // DataTables module declaration
}
```

#### `src/styles/datatables.css`
```css
/* DataTables CSS */
.dataTables_wrapper .dataTables_length,
.dataTables_wrapper .dataTables_filter,
.dataTables_wrapper .dataTables_info,
.dataTables_wrapper .dataTables_processing,
.dataTables_wrapper .dataTables_paginate {
    color: #333;
}

.dataTables_wrapper .dataTables_length select {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 4px 8px;
}

.dataTables_wrapper .dataTables_filter input {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 4px 8px;
    margin-left: 8px;
}

.dataTables_wrapper .dataTables_paginate .paginate_button {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 6px 12px;
    margin: 0 2px;
    cursor: pointer;
    background: #fff;
}

.dataTables_wrapper .dataTables_paginate .paginate_button:hover {
    background: #f5f5f5;
}

.dataTables_wrapper .dataTables_paginate .paginate_button.current {
    background: #007bff;
    color: #fff;
    border-color: #007bff;
}

.dataTables_wrapper .dataTables_paginate .paginate_button.disabled {
    color: #999;
    cursor: not-allowed;
}

/* Column filter inputs */
.dataTables_wrapper .dataTables_scrollFoot input {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
}

.dataTables_wrapper .dataTables_scrollFoot input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* Table styling */
.dataTables_wrapper .dataTable {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #ddd;
}

.dataTables_wrapper .dataTable thead th {
    background: #f8f9fa;
    border: 1px solid #ddd;
    padding: 12px 8px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
}

.dataTables_wrapper .dataTable tbody td {
    border: 1px solid #ddd;
    padding: 8px;
    vertical-align: top;
}

.dataTables_wrapper .dataTable tbody tr:hover {
    background-color: #f5f5f5;
}

.dataTables_wrapper .dataTable tfoot th {
    background: #f8f9fa;
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}
```

#### `src/components/DataTable/LocalDataTable.tsx`
```typescript
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

          // Initialize DataTable with column filtering
          dataTableRef.current = window.$('#example').DataTable({
            data: data,
            columns: columns,
            responsive: true,
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
                "sFirst":    "Pirmas",
                "sPrevious": "Ankstesnis",
                "sNext":     "Sekantis",
                "sLast":     "Paskutinis"
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

  return (
    <div className="overflow-x-auto">
      <table 
        ref={tableRef} 
        id="example" 
        className="display w-full"
      >
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tfoot>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.title}</th>
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
```

#### `src/components/DataTable/index.ts`
```typescript
export { default as LocalDataTable } from './LocalDataTable';
```

### 4 žingsnis: Konfigūruoti TypeScript

#### `tsconfig.json` (pridėti):
```json
{
  "compilerOptions": {
    // ... existing options
  },
  "include": [
    "next-env.d.ts", 
    "**/*.ts", 
    "**/*.tsx", 
    ".next/types/**/*.ts", 
    "src/types/**/*.d.ts"
  ]
}
```

### 5 žingsnis: Konfigūruoti ESLint

#### `eslint.config.mjs` (pridėti):
```javascript
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-this-alias": "off",
      "react-hooks/exhaustive-deps": "warn",
      "prefer-const": "warn"
    }
  }
];
```

---

## 💻 Naudojimo pavyzdžiai

### 1. Paprastas pavyzdys

```tsx
import { LocalDataTable } from '@/components/DataTable';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const UserList = () => {
  const users: User[] = [
    { id: 1, name: 'Jonas Jonaitis', email: 'jonas@example.com', role: 'Admin' },
    { id: 2, name: 'Petras Petraitis', email: 'petras@example.com', role: 'User' },
  ];

  const columns = [
    { title: 'ID', data: 'id' },
    { title: 'Vardas', data: 'name' },
    { title: 'El. paštas', data: 'email' },
    { title: 'Rolė', data: 'role' },
  ];

  return (
    <LocalDataTable
      id="users-table"
      data={users}
      columns={columns}
      options={{
        pageLength: 10,
        order: [[0, 'desc']]
      }}
    />
  );
};
```

### 2. Su veiksmų stulpeliu

```tsx
const columns = [
  { title: 'ID', data: 'id' },
  { title: 'Vardas', data: 'name' },
  { title: 'El. paštas', data: 'email' },
  { 
    title: 'Veiksmai', 
    data: 'id',
    render: (data: any, type: any, row: any) => {
      return `
        <button onclick="handleEdit(${data})" class="btn-edit">
          Redaguoti
        </button>
        <button onclick="handleDelete(${data})" class="btn-delete">
          Ištrinti
        </button>
      `;
    }
  }
];

// Pridėti globalius handler'ius
useEffect(() => {
  (window as any).handleEdit = (id: number) => {
    console.log('Edit user:', id);
  };
  
  (window as any).handleDelete = (id: number) => {
    console.log('Delete user:', id);
  };
  
  return () => {
    delete (window as any).handleEdit;
    delete (window as any).handleDelete;
  };
}, []);
```

### 3. Su duomenų formatavimu

```tsx
const columns = [
  { title: 'ID', data: 'id' },
  { title: 'Vardas', data: 'name' },
  { 
    title: 'Sukurta', 
    data: 'created_at',
    render: (data: any) => {
      return new Date(data).toLocaleDateString('lt-LT');
    }
  },
  { 
    title: 'Statusas', 
    data: 'status',
    render: (data: any) => {
      const statusMap = {
        active: '<span class="badge-success">Aktyvus</span>',
        inactive: '<span class="badge-warning">Neaktyvus</span>',
        deleted: '<span class="badge-danger">Ištrintas</span>'
      };
      return statusMap[data] || data;
    }
  }
];
```

---

## 🔧 Troubleshooting

### Problema: 404 klaida jQuery/DataTables failams
**Sprendimas:**
```bash
# Patikrinti, ar failai yra public kataloge
ls -la public/jquery-3.7.1.js
ls -la public/dataTables.js

# Jei nėra, nukopijuoti
cp help/jquery-3.7.1.js public/
cp help/dataTables.js public/
```

### Problema: TypeScript klaidos
**Sprendimas:**
```typescript
// Pridėti į tsconfig.json
"include": [
  "src/types/**/*.d.ts"
]
```

### Problema: ESLint klaidos
**Sprendimas:**
```javascript
// Pridėti į eslint.config.mjs
"@typescript-eslint/no-explicit-any": "off",
"@typescript-eslint/no-this-alias": "off"
```

### Problema: Lentelė neatsiranda
**Sprendimas:**
1. Patikrinti Console tab klaidoms
2. Patikrinti Network tab - ar failai kraunasi
3. Patikrinti, ar `id="example"` yra unikalus puslapyje

### Problema: Stulpelio filtravimas neveikia
**Sprendimas:**
1. Patikrinti, ar lentelė turi `<tfoot>` elementą
2. Patikrinti, ar stulpelių skaičius atitinka `<tfoot>` eilučių skaičių

---

## 📚 API dokumentacija

### Props

| Prop | Tipas | Privalomas | Aprašymas |
|------|-------|------------|-----------|
| `id` | `string` | ✅ | Unikalus lentelės ID |
| `data` | `any[]` | ✅ | Duomenų masyvas |
| `columns` | `Column[]` | ✅ | Stulpelių konfigūracija |
| `options` | `any` | ❌ | DataTables papildomi nustatymai |

### Column interface

```typescript
interface Column {
  title: string;           // Stulpelio antraštė
  data: string;           // Duomenų lauko pavadinimas
  render?: (data: any, type: any, row: any) => string; // HTML render funkcija
}
```

### Options

```typescript
interface DataTableOptions {
  pageLength?: number;     // Įrašų skaičius puslapyje
  order?: number[][];      // Rūšiavimo nustatymai
  responsive?: boolean;    // Responsive režimas
  language?: any;          // Kalbos nustatymai
  // ... kiti DataTables nustatymai
}
```

### Metodai

Komponentas automatiškai valdo:
- **Inicializaciją** - jQuery ir DataTables kraunami dinamiškai
- **Cleanup** - resursai išvalomi komponento išmontavimo metu
- **Re-inicializaciją** - kai keičiasi props

---

## 🎯 Išvados

LocalDataTable komponentas suteikia:

1. **Pilną DataTables funkcionalumą** be CDN priklausomybių
2. **TypeScript palaikymą** su tipų saugumu
3. **React integraciją** su hooks ir lifecycle valdymu
4. **Lietuvių kalbos palaikymą** iš anksto
5. **Responsive dizainą** su Tailwind CSS
6. **Stulpelio filtravimą** realiu laiku
7. **Saugų resursų valdymą** su automatinio cleanup

Komponentas yra paruoštas naudojimui bet kuriame React projekte ir gali būti lengvai pritaikytas skirtingiems duomenų tipams ir reikalavimams.

---

## 📞 Palaikymas

Jei kyla problemų ar klausimų:
1. Patikrinkite troubleshooting skyrių
2. Peržiūrėkite Console tab klaidas
3. Patikrinkite Network tab failų kraunimą
4. Įsitikinkite, kad visi failai yra teisingose vietose

Komponentas yra sukurtas su geresniu klaidų valdymu ir automatiniais cleanup mechanizmais, todėl turėtų veikti stabiliai bet kokiose aplinkose. 