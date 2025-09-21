// frontend/src/constants/scheduleColors.ts

// Spalvų konstantos A-DIENYNAS tvarkaraščio komponentams
// Naudojamos WeeklyScheduleCalendar, LessonCard ir kituose tvarkaraščio komponentuose
// Spalvos nustatomos pagal GlobalSchedule.plan_status lauką

/**
 * Tvarkaraščio statusų spalvų konfigūracija
 * Kiekvienas statusas turi savo spalvų schemą pagal UX dizaino reikalavimus
 */
export const SCHEDULE_STATUS_COLORS = {
  /**
   * SUPLANUOTA STATUSAS (planned)
   * Naudojama: Kai pamoka suplanuota, bet dar nepradėta
   * Vizualinis stilius: Baltas fonas su žaliu rėmeliu - rodo, kad pamoka paruošta
   * Spalvų kodai:
   * - Fono spalva: #ffffff (balta)
   * - Rėmelio spalva: #a7f3d0 (emerald-200)
   * - Teksto spalva: #000000 (juoda)
   */
  planned: {
    background: 'bg-white',           // Balto fono klasė
    border: 'border-emerald-200',     // Žalio rėmelio klasė
    text: 'text-black',              // Juodo teksto klasė
    description: 'Suplanuota',        // Statuso aprašymas lietuvių kalba
    hex: {
      background: '#ffffff',         // Balto fono HEX kodas
      border: '#a7f3d0',             // Žalio rėmelio HEX kodas
      text: '#000000'                // Juodo teksto HEX kodas
    }
  },

  /**
   * VYKSTA STATUSAS (in_progress)
   * Naudojama: Kai pamoka vykdoma (mentorius pradėjo veiklą)
   * Vizualinis stilius: Žalias fonas su juodu tekstu - rodo aktyvų procesą
   * Spalvų kodai:
   * - Fono spalva: #a7f3d0 (emerald-200)
   * - Teksto spalva: #000000 (juoda)
   */
  in_progress: {
    background: 'bg-emerald-200',     // Žalio fono klasė
    border: 'border-emerald-200',     // Žalio rėmelio klasė (sutampa su fonu)
    text: 'text-black',              // Juodo teksto klasė
    description: 'Vyksta',           // Statuso aprašymas lietuvių kalba
    hex: {
      background: '#a7f3d0',         // Žalio fono HEX kodas
      border: '#a7f3d0',             // Žalio rėmelio HEX kodas
      text: '#000000'                // Juodo teksto HEX kodas
    }
  },

  /**
   * BAIGTA STATUSAS (completed)
   * Naudojama: Kai pamoka baigta (mentorius užbaigė veiklą)
   * Vizualinis stilius: Pilkas fonas su juodu tekstu - rodo užbaigtą procesą
   * Spalvų kodai:
   * - Fono spalva: #e5e7eb (gray-200)
   * - Rėmelio spalva: #e5e7eb (gray-200)
   * - Teksto spalva: #000000 (juoda)
   */
  completed: {
    background: 'bg-gray-200',        // Pilko fono klasė
    border: 'border-gray-200',        // Pilko rėmelio klasė
    text: 'text-black',              // Juodo teksto klasė
    description: 'Baigta',           // Statuso aprašymas lietuvių kalba
    hex: {
      background: '#e5e7eb',         // Pilko fono HEX kodas
      border: '#e5e7eb',             // Pilko rėmelio HEX kodas
      text: '#000000'                // Juodo teksto HEX kodas
    }
  }
} as const;

/**
 * Spalvų tipų apibrėžimas TypeScript
 * Naudojamas tipų saugumui komponentuose
 */
export type ScheduleStatus = keyof typeof SCHEDULE_STATUS_COLORS;

/**
 * Spalvų konfigūracijos tipas
 * Naudojamas funkcijų parametrams ir grąžinimo tipams
 */
export type ScheduleColorConfig = {
  background: string;
  border: string;
  text: string;
  description: string;
  hex: {
    background: string;
    border: string;
    text: string;
  };
};

/**
 * Gauti spalvų konfigūraciją pagal statusą
 * @param status - GlobalSchedule.plan_status reikšmė
 * @returns Spalvų konfigūracijos objektas
 * 
 * Naudojimas:
 * const colors = getScheduleColors('planned');
 * const className = `${colors.background} ${colors.border} ${colors.text}`;
 */
export const getScheduleColors = (status: ScheduleStatus): ScheduleColorConfig => {
  return SCHEDULE_STATUS_COLORS[status] || SCHEDULE_STATUS_COLORS.planned;
};

/**
 * Gauti CSS klasių eilutę pagal statusą
 * @param status - GlobalSchedule.plan_status reikšmė
 * @returns CSS klasių eilutė su spalvomis
 * 
 * Naudojimas:
 * const className = getScheduleColorClasses('in_progress');
 * // Grąžina: "bg-emerald-200 border-emerald-200 text-black"
 */
export const getScheduleColorClasses = (status: ScheduleStatus): string => {
  const colors = getScheduleColors(status);
  return `${colors.background} ${colors.border} ${colors.text}`;
};

/**
 * Gauti statuso aprašymą lietuvių kalba
 * @param status - GlobalSchedule.plan_status reikšmė
 * @returns Statuso aprašymas lietuvių kalba
 * 
 * Naudojimas:
 * const description = getScheduleStatusDescription('planned');
 * // Grąžina: "Suplanuota"
 */
export const getScheduleStatusDescription = (status: ScheduleStatus): string => {
  return getScheduleColors(status).description;
};

/**
 * Spalvų konstantos naudojamos:
 * 1. WeeklyScheduleCalendar.tsx - LessonCard komponente
 * 2. StudentScheduleCalendar.tsx - studentų tvarkaraštyje
 * 3. VeiklosPageClient.tsx - mentorių veiklų puslapyje
 * 4. Kituose tvarkaraščio komponentuose
 * 
 * Spalvų keitimas:
 * - Keisti konstantas šiame faile
 * - Visi komponentai automatiškai atnaujins spalvas
 * - HEX kodai naudojami dizaino dokumentacijai
 */
