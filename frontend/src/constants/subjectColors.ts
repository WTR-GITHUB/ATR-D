// /home/master/DIENYNAS/frontend/src/constants/subjectColors.ts

// Dalykų spalvų konstantos A-DIENYNAS sistemoje
// Naudojamos tvarkaraščio komponentuose dalykų vizualiniam atskyrimui
// Kiekvienas dalykas turi savo unikalią spalvą pagal kategoriją

/**
 * Dalykų spalvų konfigūracija pagal kategorijas
 * Spalvos parinktos iš pastelinės paletės, pritaikytos studentų poreikiams
 */
export const SUBJECT_COLORS = {
  /**
   * AKADEMINIAI DALYKAI - Unikalūs pasteliniai atspalviai ir Šiltosios pastelinės spalvos
   * Pagrindiniai mokslai, reikalaujantys rimtumo ir koncentracijos
   */
  'Matematika': {
    background: 'bg-amber-200',            // Gintarinė spalva - elegantiška ir rami
    border: 'border-amber-600',            // Tamsesnis gintarinis atspalvis
    text: 'text-amber-800',                // Tamsus tekstas skaitomumui
    hex: {
      background: '#fde68a',              // Amber-200 HEX kodas
      border: '#d97706',                  // Amber-600 atspalvis
      text: '#92400e'                     // Amber-800 atspalvis
    }
  },
  'Lietuvių literatūra': {
    background: 'bg-yellow-200',          // Geltona spalva - klasikinė ir šviesi
    border: 'border-yellow-600',          // Tamsesnis geltonas atspalvis
    text: 'text-yellow-800',               // Tamsus tekstas
    hex: {
      background: '#fef08a',              // Yellow-200 HEX kodas
      border: '#ca8a04',                   // Yellow-600 atspalvis
      text: '#854d0e'                      // Yellow-800 atspalvis
    }
  },
  'Lietuvių gramatika': {
    background: 'bg-orange-200',          // Oranžinė spalva - švelni ir rami
    border: 'border-orange-600',          // Tamsesnis oranžinis atspalvis
    text: 'text-orange-800',              // Tamsus tekstas
    hex: {
      background: '#fed7aa',              // Orange-200 HEX kodas
      border: '#ea580c',                  // Orange-600 atspalvis
      text: '#9a3412'                     // Orange-800 atspalvis
    }
  },
  'Anglų kalba': {
    background: 'bg-sky-200',             // Dangaus spalva - šviesi ir atvira
    border: 'border-sky-600',             // Tamsesnis dangaus atspalvis
    text: 'text-sky-800',                 // Tamsus tekstas
    hex: {
      background: '#bae6fd',              // Dangaus HEX kodas
      border: '#0284c7',                  // Mėlynas atspalvis
      text: '#0c4a6e'                     // Tamsus mėlynas atspalvis
    }
  },
  'Biologija': {
    background: 'bg-green-200',           // Žalia spalva - gamtos spalva
    border: 'border-green-600',          // Tamsesnis žalias atspalvis
    text: 'text-green-800',               // Tamsus tekstas
    hex: {
      background: '#bbf7d0',              // Green-200 HEX kodas
      border: '#16a34a',                  // Green-600 atspalvis
      text: '#166534'                     // Green-800 atspalvis
    }
  },
  'Chemija': {
    background: 'bg-purple-200',          // Purpurinė spalva - minkšta ir rami
    border: 'border-purple-600',          // Tamsesnis purpurinis atspalvis
    text: 'text-purple-800',              // Tamsus tekstas
    hex: {
      background: '#e9d5ff',              // Purple-200 HEX kodas
      border: '#9333ea',                  // Purple-600 atspalvis
      text: '#581c87'                     // Purple-800 atspalvis
    }
  },
  'Fizika': {
    background: 'bg-indigo-200',           // Indigo spalva - mėlyna su violetiniu atspalviu
    border: 'border-indigo-600',           // Tamsesnis indigo atspalvis
    text: 'text-indigo-800',              // Tamsus tekstas
    hex: {
      background: '#c7d2fe',              // Indigo-200 HEX kodas
      border: '#4f46e5',                  // Indigo-600 atspalvis
      text: '#312e81'                     // Indigo-800 atspalvis
    }
  },
  'Informacinės technologijos': {
    background: 'bg-blue-200',            // Mėlyna spalva - šviesi ir technologinė
    border: 'border-blue-600',            // Tamsesnis mėlynas atspalvis
    text: 'text-blue-800',                // Tamsus tekstas
    hex: {
      background: '#bfdbfe',              // Blue-200 HEX kodas
      border: '#2563eb',                  // Blue-600 atspalvis
      text: '#1e3a8a'                     // Blue-800 atspalvis
    }
  },

  /**
   * KALBOS - Šaltosios pastelinės spalvos
   * Visos kalbos naudoja mėlynos spalvų paletę
   */
  'Prancūzų kalba': {
    background: 'bg-blue-200',             // Pastelinė mėlyna
    border: 'border-blue-600',            // Tamsesnis mėlynas atspalvis
    text: 'text-blue-800',                // Tamsus tekstas
    hex: {
      background: '#bfdbfe',              // Mėlynas HEX kodas
      border: '#2563eb',                  // Blue atspalvis
      text: '#1e3a8a'                     // Tamsus mėlynas atspalvis
    }
  },
  'Rusų kalba': {
    background: 'bg-indigo-200',          // Pastelinė indigo
    border: 'border-indigo-600',          // Tamsesnis indigo atspalvis
    text: 'text-indigo-800',              // Tamsus tekstas
    hex: {
      background: '#c7d2fe',              // Indigo HEX kodas
      border: '#4f46e5',                  // Indigo atspalvis
      text: '#312e81'                     // Tamsus indigo atspalvis
    }
  },
  'Ispanų kalba': {
    background: 'bg-violet-200',          // Pastelinė violetinė
    border: 'border-violet-600',          // Tamsesnis violetinis atspalvis
    text: 'text-violet-800',              // Tamsus tekstas
    hex: {
      background: '#ddd6fe',              // Violetinė HEX kodas
      border: '#7c3aed',                  // Violet atspalvis
      text: '#4c1d95'                     // Tamsus violetinis atspalvis
    }
  },
  'Vokiečių kalba': {
    background: 'bg-purple-200',          // Pastelinė purpurinė
    border: 'border-purple-600',          // Tamsesnis purpurinis atspalvis
    text: 'text-purple-800',              // Tamsus tekstas
    hex: {
      background: '#e9d5ff',              // Purpurinė HEX kodas
      border: '#9333ea',                  // Purple atspalvis
      text: '#581c87'                     // Tamsus purpurinis atspalvis
    }
  },

  /**
   * KŪRYBINIAI IR PRAKTINIAI DALYKAI - Papildomos švelniųjų atspalvių spalvos
   * Dalykai, kurie reikalauja kūrybiškumo ir praktinių įgūdžių
   */
  'Dailė': {
    background: 'bg-sage-200',             // Šalavijų spalva - gamtos ir kūrybos
    border: 'border-sage-600',            // Tamsesnis šalavijų atspalvis
    text: 'text-sage-800',                // Tamsus tekstas
    hex: {
      background: '#c9e4ca',              // Šalavijų HEX kodas
      border: '#68d391',                  // Green atspalvis
      text: '#22543d'                     // Tamsus žalias atspalvis
    }
  },
  'MUZIKA': {
    background: 'bg-lilac-200',           // Alyvinė spalva - muzikos ir harmonijos
    border: 'border-lilac-600',           // Tamsesnis alyvinis atspalvis
    text: 'text-lilac-800',               // Tamsus tekstas
    hex: {
      background: '#dda0dd',              // Alyvinė HEX kodas
      border: '#c084fc',                  // Purple atspalvis
      text: '#6b21a8'                     // Tamsus purpurinis atspalvis
    }
  },
  'Kinas': {
    background: 'bg-powder-blue-200',     // Pudros mėlyna - kino ir vaizdo
    border: 'border-powder-blue-600',     // Tamsesnis pudros mėlynas atspalvis
    text: 'text-powder-blue-800',         // Tamsus tekstas
    hex: {
      background: '#b6d7ff',              // Pudros mėlyna HEX kodas
      border: '#3b82f6',                  // Blue atspalvis
      text: '#1e40af'                     // Tamsus mėlynas atspalvis
    }
  },
  'Kuravimasis': {
    background: 'bg-seafoam-200',         // Jūros putos - vandens ir ramybės
    border: 'border-seafoam-600',         // Tamsesnis jūros putų atspalvis
    text: 'text-seafoam-800',             // Tamsus tekstas
    hex: {
      background: '#93e9be',              // Jūros putos HEX kodas
      border: '#10b981',                  // Emerald atspalvis
      text: '#064e3b'                     // Tamsus žalias atspalvis
    }
  },
  'Etika': {
    background: 'bg-aqua-200',             // Vandens spalva - švarumas ir dorovė
    border: 'border-aqua-600',            // Tamsesnis vandens atspalvis
    text: 'text-aqua-800',                // Tamsus tekstas
    hex: {
      background: '#7fdbff',              // Vandens HEX kodas
      border: '#06b6d4',                  // Cyan atspalvis
      text: '#164e63'                     // Tamsus cyan atspalvis
    }
  },
  'Kūno kultūra': {
    background: 'bg-turquoise-200',       // Turkio spalva - energija ir judėjimas
    border: 'border-turquoise-600',       // Tamsesnis turkio atspalvis
    text: 'text-turquoise-800',           // Tamsus tekstas
    hex: {
      background: '#afeeee',              // Turkio HEX kodas
      border: '#14b8a6',                  // Teal atspalvis
      text: '#134e4a'                     // Tamsus teal atspalvis
    }
  },
  'Maisto gamyba': {
    background: 'bg-pistachio-200',      // Pistacijų spalva - maistas ir gamta
    border: 'border-pistachio-600',      // Tamsesnis pistacijų atspalvis
    text: 'text-pistachio-800',          // Tamsus tekstas
    hex: {
      background: '#93c572',              // Pistacijų HEX kodas
      border: '#84cc16',                  // Lime atspalvis
      text: '#365314'                     // Tamsus žalias atspalvis
    }
  },
  'Technologijos vaikinams.': {
    background: 'bg-mint-200',           // Mėtų spalva - technologijos ir gamta
    border: 'border-mint-600',            // Tamsesnis mėtų atspalvis
    text: 'text-mint-800',                // Tamsus tekstas
    hex: {
      background: '#aaffc3',              // Mėtų HEX kodas
      border: '#22c55e',                  // Green atspalvis
      text: '#14532d'                     // Tamsus žalias atspalvis
    }
  },
  'Spalvų psichologija': {
    background: 'bg-cotton-candy-200',   // Vatos cukraus spalva - spalvų ir psichologijos
    border: 'border-cotton-candy-600',    // Tamsesnis vatos cukraus atspalvis
    text: 'text-cotton-candy-800',        // Tamsus tekstas
    hex: {
      background: '#ffb7ce',              // Vatos cukraus HEX kodas
      border: '#ec4899',                  // Pink atspalvis
      text: '#831843'                     // Tamsus rožinis atspalvis
    }
  },
  'VIDUDIENIO RATAS': {
    background: 'bg-dusty-rose-200',      // Dulkėtos rožės spalva - ramybė ir bendruomenė
    border: 'border-dusty-rose-600',      // Tamsesnis dulkėtos rožės atspalvis
    text: 'text-dusty-rose-800',          // Tamsus tekstas
    hex: {
      background: '#dcae96',              // Dulkėtos rožės HEX kodas
      border: '#f97316',                  // Orange atspalvis
      text: '#9a3412'                     // Tamsus oranžinis atspalvis
    }
  },
  'TRIVIA ŽAIDIMAI': {
    background: 'bg-mauve-200',           // Violetinai rožinė spalva - žaidimai ir linksmybės
    border: 'border-mauve-600',           // Tamsesnis violetinai rožinis atspalvis
    text: 'text-mauve-800',               // Tamsus tekstas
    hex: {
      background: '#e0b4d6',              // Violetinai rožinė HEX kodas
      border: '#d946ef',                  // Fuchsia atspalvis
      text: '#86198f'                     // Tamsus fuchsia atspalvis
    }
  },
  "Band'as": {
    background: 'bg-blush-200',           // Rausvumo spalva - muzikos grupė
    border: 'border-blush-600',           // Tamsesnis rausvumo atspalvis
    text: 'text-blush-800',               // Tamsus tekstas
    hex: {
      background: '#de5d83',              // Rausvumo HEX kodas
      border: '#e11d48',                  // Rose atspalvis
      text: '#881337'                     // Tamsus rožinis atspalvis
    }
  },
  'Ekskursija': {
    background: 'bg-honeydew-200',        // Medaus rasos spalva - kelionės ir atradimai
    border: 'border-honeydew-600',        // Tamsesnis medaus rasos atspalvis
    text: 'text-honeydew-800',            // Tamsus tekstas
    hex: {
      background: '#f0fff0',              // Medaus rasos HEX kodas
      border: '#84cc16',                  // Lime atspalvis
      text: '#365314'                     // Tamsus žalias atspalvis
    }
  }
} as const;

/**
 * Dalykų spalvų tipų apibrėžimas TypeScript
 */
export type SubjectName = keyof typeof SUBJECT_COLORS;

/**
 * Dalykų spalvų konfigūracijos tipas
 */
export type SubjectColorConfig = {
  background: string;
  border: string;
  text: string;
  hex: {
    background: string;
    border: string;
    text: string;
  };
};

/**
 * Gauti dalyko spalvų konfigūraciją pagal dalyko pavadinimą
 * @param subjectName - Dalyko pavadinimas
 * @returns Dalyko spalvų konfigūracijos objektas
 * 
 * Naudojimas:
 * const colors = getSubjectColors('Matematika');
 * const className = `${colors.background} ${colors.border} ${colors.text}`;
 */
/**
 * Konvertuoja HEX spalvą į Tailwind klases
 * @param hexColor - HEX spalvos kodas (pvz., #fecaca)
 * @returns SubjectColorConfig objektas su Tailwind klasėmis
 */
export const hexToTailwindColors = (hexColor: string): SubjectColorConfig => {
  // CHANGE: Naudojame tikrai egzistuojančias Tailwind spalvas vietoj arbitrary values
  // HEX spalvų mapping'as į standartines Tailwind spalvas
  const hexToTailwindMap: Record<string, { background: string; border: string; text: string }> = {
    '#fecaca': { background: 'bg-red-200', border: 'border-red-600', text: 'text-red-800' }, // Matematika
    '#fef08a': { background: 'bg-yellow-200', border: 'border-yellow-600', text: 'text-yellow-800' }, // Lietuvių literatūra
    '#fed7aa': { background: 'bg-orange-200', border: 'border-orange-600', text: 'text-orange-800' }, // Lietuvių gramatika
    '#bfdbfe': { background: 'bg-blue-200', border: 'border-blue-600', text: 'text-blue-800' }, // Anglų kalba
    '#bbf7d0': { background: 'bg-green-200', border: 'border-green-600', text: 'text-green-800' }, // Biologija
    '#e9d5ff': { background: 'bg-purple-200', border: 'border-purple-600', text: 'text-purple-800' }, // Chemija
    '#c7d2fe': { background: 'bg-indigo-200', border: 'border-indigo-600', text: 'text-indigo-800' }, // Fizika
    '#ccfbf1': { background: 'bg-teal-200', border: 'border-teal-600', text: 'text-teal-800' }, // Informacinės technologijos
    '#bae6fd': { background: 'bg-sky-200', border: 'border-sky-600', text: 'text-sky-800' }, // Prancūzų kalba
    '#a5f3fc': { background: 'bg-cyan-200', border: 'border-cyan-600', text: 'text-cyan-800' }, // Rusų kalba
    '#ddd6fe': { background: 'bg-violet-200', border: 'border-violet-600', text: 'text-violet-800' }, // Ispanų kalba
    '#f5d0fe': { background: 'bg-fuchsia-200', border: 'border-fuchsia-600', text: 'text-fuchsia-800' }, // Vokiečių kalba
    '#fce7f3': { background: 'bg-pink-200', border: 'border-pink-600', text: 'text-pink-800' }, // Dailė
    '#fecdd3': { background: 'bg-rose-200', border: 'border-rose-600', text: 'text-rose-800' }, // MUZIKA
    '#a7f3d0': { background: 'bg-emerald-200', border: 'border-emerald-600', text: 'text-emerald-800' }, // Kinas
    '#d9f99d': { background: 'bg-lime-200', border: 'border-lime-600', text: 'text-lime-800' }, // Kūrybinis rašymas
    '#e2e8f0': { background: 'bg-slate-200', border: 'border-slate-600', text: 'text-slate-800' }, // Etika
    '#fde68a': { background: 'bg-amber-200', border: 'border-amber-600', text: 'text-amber-800' }, // Kūno kultūra
    '#e7e5e4': { background: 'bg-stone-200', border: 'border-stone-600', text: 'text-stone-800' }, // Maisto gamyba
    '#e4e4e7': { background: 'bg-zinc-200', border: 'border-zinc-600', text: 'text-zinc-800' }, // Technologijos vaikinams
    '#e5e5e5': { background: 'bg-neutral-200', border: 'border-neutral-600', text: 'text-neutral-800' } // Spalvų psichologija
  };
  
  const tailwindColors = hexToTailwindMap[hexColor] || hexToTailwindMap['#fecaca']; // fallback į raudoną
  
  const result = {
    background: tailwindColors.background,
    border: tailwindColors.border,
    text: tailwindColors.text,
    hex: {
      background: hexColor,
      border: hexColor,
      text: hexColor
    }
  };
  
  return result;
};

export const getSubjectColors = (subjectName: string, subjectColor?: string): SubjectColorConfig => {
  // CHANGE: Jei pateikta subjectColor iš backend'o, naudojame ją
  if (subjectColor) {
    return hexToTailwindColors(subjectColor);
  }
  
  // CHANGE: Jei dalykas neturi apibrėžtos spalvos, naudojame standartines Tailwind spalvas
  const subjectColors = SUBJECT_COLORS[subjectName as SubjectName];
  if (subjectColors) {
    return subjectColors;
  }
  
  // CHANGE: Fallback spalvos naudojant tikrai egzistuojančias Tailwind spalvas
  const fallbackColors = {
    'Matematika': { background: 'bg-red-200', border: 'border-red-600', text: 'text-red-800', hex: { background: '#fecaca', border: '#dc2626', text: '#991b1b' } },
    'Lietuvių literatūra': { background: 'bg-yellow-200', border: 'border-yellow-600', text: 'text-yellow-800', hex: { background: '#fef08a', border: '#ca8a04', text: '#854d0e' } },
    'Lietuvių gramatika': { background: 'bg-orange-200', border: 'border-orange-600', text: 'text-orange-800', hex: { background: '#fed7aa', border: '#ea580c', text: '#9a3412' } },
    'Anglų kalba': { background: 'bg-blue-200', border: 'border-blue-600', text: 'text-blue-800', hex: { background: '#bfdbfe', border: '#2563eb', text: '#1e3a8a' } },
    'Biologija': { background: 'bg-green-200', border: 'border-green-600', text: 'text-green-800', hex: { background: '#bbf7d0', border: '#16a34a', text: '#166534' } },
    'Chemija': { background: 'bg-purple-200', border: 'border-purple-600', text: 'text-purple-800', hex: { background: '#e9d5ff', border: '#9333ea', text: '#581c87' } },
    'Fizika': { background: 'bg-indigo-200', border: 'border-indigo-600', text: 'text-indigo-800', hex: { background: '#c7d2fe', border: '#4f46e5', text: '#312e81' } },
    'Informacinės technologijos': { background: 'bg-teal-200', border: 'border-teal-600', text: 'text-teal-800', hex: { background: '#ccfbf1', border: '#0d9488', text: '#134e4a' } },
    // CHANGE: Pridėtos papildomos spalvos iš jūsų sąrašo
    'Prancūzų kalba': { background: 'bg-sky-200', border: 'border-sky-600', text: 'text-sky-800', hex: { background: '#bae6fd', border: '#0284c7', text: '#0c4a6e' } },
    'Rusų kalba': { background: 'bg-cyan-200', border: 'border-cyan-600', text: 'text-cyan-800', hex: { background: '#a5f3fc', border: '#0891b2', text: '#164e63' } },
    'Ispanų kalba': { background: 'bg-violet-200', border: 'border-violet-600', text: 'text-violet-800', hex: { background: '#ddd6fe', border: '#7c3aed', text: '#4c1d95' } },
    'Vokiečių kalba': { background: 'bg-fuchsia-200', border: 'border-fuchsia-600', text: 'text-fuchsia-800', hex: { background: '#f5d0fe', border: '#c026d3', text: '#86198f' } },
    'Dailė': { background: 'bg-pink-200', border: 'border-pink-600', text: 'text-pink-800', hex: { background: '#fce7f3', border: '#db2777', text: '#9d174d' } },
    'Muzika': { background: 'bg-rose-200', border: 'border-rose-600', text: 'text-rose-800', hex: { background: '#fecdd3', border: '#e11d48', text: '#9f1239' } },
    'Kinas': { background: 'bg-emerald-200', border: 'border-emerald-600', text: 'text-emerald-800', hex: { background: '#a7f3d0', border: '#059669', text: '#064e3b' } },
    'Kūrybinis rašymas': { background: 'bg-lime-200', border: 'border-lime-600', text: 'text-lime-800', hex: { background: '#d9f99d', border: '#65a30d', text: '#365314' } },
    'Etika': { background: 'bg-slate-200', border: 'border-slate-600', text: 'text-slate-800', hex: { background: '#e2e8f0', border: '#475569', text: '#1e293b' } },
    'Kūno kultūra': { background: 'bg-amber-200', border: 'border-amber-600', text: 'text-amber-800', hex: { background: '#fde68a', border: '#d97706', text: '#92400e' } },
    'Maisto gamyba': { background: 'bg-stone-200', border: 'border-stone-600', text: 'text-stone-800', hex: { background: '#e7e5e4', border: '#78716c', text: '#292524' } },
    'Technologijos vaikinams': { background: 'bg-zinc-200', border: 'border-zinc-600', text: 'text-zinc-800', hex: { background: '#e4e4e7', border: '#52525b', text: '#27272a' } },
    'Spalvų psichologija': { background: 'bg-neutral-200', border: 'border-neutral-600', text: 'text-neutral-800', hex: { background: '#e5e5e5', border: '#525252', text: '#262626' } }
  };
  
  return fallbackColors[subjectName as keyof typeof fallbackColors] || fallbackColors['Matematika'];
};

/**
 * Gauti dalyko CSS klasių eilutę pagal dalyko pavadinimą
 * @param subjectName - Dalyko pavadinimas
 * @returns CSS klasių eilutė su dalyko spalvomis
 * 
 * Naudojimas:
 * const className = getSubjectColorClasses('Lietuvių literatūra');
 * // Grąžina: "bg-ivory-200 border-ivory-600 text-ivory-800"
 */
export const getSubjectColorClasses = (subjectName: string): string => {
  const colors = getSubjectColors(subjectName);
  return `${colors.background} ${colors.border} ${colors.text}`;
};

/**
 * Dalykų spalvų konstantos naudojamos:
 * 1. StudentWeeklyScheduleCalendar.tsx - dalykų vizualiniam atskyrimui
 * 2. WeeklyScheduleCalendar.tsx - mentorių tvarkaraštyje
 * 3. Kituose tvarkaraščio komponentuose
 * 
 * Spalvų kategorijos:
 * - Akademiniai dalykai: Unikalūs pasteliniai atspalviai ir šiltosios spalvos
 * - Kalbos: Šaltosios pastelinės spalvos (mėlynos paletės)
 * - Kūrybiniai/praktiniai: Papildomos švelniųjų atspalvių spalvos
 * 
 * Spalvų keitimas:
 * - Keisti konstantas šiame faile
 * - Visi komponentai automatiškai atnaujins spalvas
 * - HEX kodai naudojami dizaino dokumentacijai
 */
