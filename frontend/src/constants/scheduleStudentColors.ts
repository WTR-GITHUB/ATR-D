// /home/master/DIENYNAS/frontend/src/constants/scheduleStudentColors.ts

// Studentų tvarkaraščio spalvų konstantos A-DIENYNAS sistemoje
// Naudojamos StudentWeeklyScheduleCalendar komponente
// Skiriasi nuo mentorių spalvų - studentams reikia kitokio vizualinio stiliaus

/**
 * Studentų tvarkaraščio statusų spalvų konfigūracija
 * Kiekvienas statusas turi savo spalvų schemą, pritaikytą studentų poreikiams
 * Studentams svarbu greitai suprasti pamokos būseną ir jos svarbą
 */
export const STUDENT_SCHEDULE_STATUS_COLORS = {
  /**
   * SUPLANUOTA STATUSAS (planned)
   * Naudojama: Kai pamoka suplanuota, bet dar nepradėta
   * Studentų vizualinis stilius: Šviesiai mėlynas fonas - rodo artėjančią pamoką
   * Spalvų kodai:
   * - Fono spalva: #dbeafe (blue-100)
   * - Rėmelio spalva: #3b82f6 (blue-500)
   * - Teksto spalva: #1e40af (blue-800)
   */
  planned: {
    background: 'bg-blue-100',           // Šviesiai mėlyno fono klasė
    border: 'border-blue-500',          // Mėlyno rėmelio klasė
    text: 'text-blue-800',              // Tamsiai mėlyno teksto klasė
    description: 'Suplanuota',          // Statuso aprašymas lietuvių kalba
    hex: {
      background: '#dbeafe',           // Šviesiai mėlyno fono HEX kodas
      border: '#3b82f6',               // Mėlyno rėmelio HEX kodas
      text: '#1e40af'                  // Tamsiai mėlyno teksto HEX kodas
    }
  },

  /**
   * VYKSTA STATUSAS (in_progress)
   * Naudojama: Kai pamoka vykdoma (mentorius pradėjo veiklą)
   * Studentų vizualinis stilius: Ryškiai žalias fonas - rodo aktyvų mokymąsi
   * Spalvų kodai:
   * - Fono spalva: #86efac (green-300)
   * - Rėmelio spalva: #16a34a (green-600)
   * - Teksto spalva: #14532d (green-900)
   */
  in_progress: {
    background: 'bg-green-300',         // Žalio fono klasė
    border: 'border-green-600',        // Tamsiai žalio rėmelio klasė
    text: 'text-green-900',            // Tamsiai žalio teksto klasė
    description: 'Vyksta',             // Statuso aprašymas lietuvių kalba
    hex: {
      background: '#86efac',           // Žalio fono HEX kodas
      border: '#16a34a',               // Tamsiai žalio rėmelio HEX kodas
      text: '#14532d'                  // Tamsiai žalio teksto HEX kodas
    }
  },

  /**
   * BAIGTA STATUSAS (completed)
   * Naudojama: Kai pamoka baigta (mentorius užbaigė veiklą)
   * Studentų vizualinis stilius: Šviesiai pilkas fonas - rodo užbaigtą pamoką
   * Spalvų kodai:
   * - Fono spalva: #f3f4f6 (gray-100)
   * - Rėmelio spalva: #6b7280 (gray-500)
   * - Teksto spalva: #374151 (gray-700)
   */
  completed: {
    background: 'bg-gray-100',          // Šviesiai pilko fono klasė
    border: 'border-gray-500',          // Pilko rėmelio klasė
    text: 'text-gray-700',             // Tamsiai pilko teksto klasė
    description: 'Baigta',             // Statuso aprašymas lietuvių kalba
    hex: {
      background: '#f3f4f6',           // Šviesiai pilko fono HEX kodas
      border: '#6b7280',               // Pilko rėmelio HEX kodas
      text: '#374151'                  // Tamsiai pilko teksto HEX kodas
    }
  },

  /**
   * NĖRA IMUPLAN STATUSAS (no_imu_plan)
   * Naudojama: Kai nėra jokių IMUPlan įrašų tame slote
   * Studentų vizualinis stilius: Šviesiai oranžinis fonas - rodo, kad trūksta duomenų
   * Spalvų kodai:
   * - Fono spalva: #fed7aa (orange-200)
   * - Rėmelio spalva: #ea580c (orange-600)
   * - Teksto spalva: #9a3412 (orange-800)
   */
  no_imu_plan: {
    background: 'bg-orange-200',        // Šviesiai oranžinio fono klasė
    border: 'border-orange-600',        // Oranžinio rėmelio klasė
    text: 'text-orange-800',           // Tamsiai oranžinio teksto klasė
    description: 'Nėra IMUPlan',       // Statuso aprašymas lietuvių kalba
    hex: {
      background: '#fed7aa',           // Šviesiai oranžinio fono HEX kodas
      border: '#ea580c',               // Oranžinio rėmelio HEX kodas
      text: '#9a3412'                  // Tamsiai oranžinio teksto HEX kodas
    }
  }
} as const;

/**
 * Studentų spalvų tipų apibrėžimas TypeScript
 * Naudojamas tipų saugumui komponentuose
 */
export type StudentScheduleStatus = keyof typeof STUDENT_SCHEDULE_STATUS_COLORS;

/**
 * Studentų spalvų konfigūracijos tipas
 * Naudojamas funkcijų parametrams ir grąžinimo tipams
 */
export type StudentScheduleColorConfig = {
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
 * Gauti studentų spalvų konfigūraciją pagal statusą
 * @param status - GlobalSchedule.plan_status reikšmė
 * @returns Studentų spalvų konfigūracijos objektas
 * 
 * Naudojimas:
 * const colors = getStudentScheduleColors('planned');
 * const className = `${colors.background} ${colors.border} ${colors.text}`;
 */
export const getStudentScheduleColors = (status: StudentScheduleStatus): StudentScheduleColorConfig => {
  return STUDENT_SCHEDULE_STATUS_COLORS[status] || STUDENT_SCHEDULE_STATUS_COLORS.planned;
};

/**
 * Gauti studentų CSS klasių eilutę pagal statusą
 * @param status - GlobalSchedule.plan_status reikšmė
 * @returns CSS klasių eilutė su studentų spalvomis
 * 
 * Naudojimas:
 * const className = getStudentScheduleColorClasses('in_progress');
 * // Grąžina: "bg-green-300 border-green-600 text-green-900"
 */
export const getStudentScheduleColorClasses = (status: StudentScheduleStatus): string => {
  const colors = getStudentScheduleColors(status);
  return `${colors.background} ${colors.border} ${colors.text}`;
};

/**
 * Gauti studentų statuso aprašymą lietuvių kalba
 * @param status - GlobalSchedule.plan_status reikšmė
 * @returns Statuso aprašymas lietuvių kalba
 * 
 * Naudojimas:
 * const description = getStudentScheduleStatusDescription('planned');
 * // Grąžina: "Suplanuota"
 */
export const getStudentScheduleStatusDescription = (status: StudentScheduleStatus): string => {
  return getStudentScheduleColors(status).description;
};

/**
 * Studentų spalvų konstantos naudojamos:
 * 1. StudentWeeklyScheduleCalendar.tsx - studentų savaitės tvarkaraštyje
 * 2. StudentScheduleCalendar.tsx - studentų tvarkaraštyje
 * 3. Kituose studentų tvarkaraščio komponentuose
 * 
 * Spalvų keitimas:
 * - Keisti konstantas šiame faile
 * - Visi studentų komponentai automatiškai atnaujins spalvas
 * - HEX kodai naudojami dizaino dokumentacijai
 * 
 * Skirtumas nuo mentorių spalvų:
 * - Studentams naudojamos šviesesnės, minkštesnės spalvos
 * - Didesnis kontrastas teksto skaitomumui
 * - Spalvos pritaikytos studentų amžiui ir poreikiams
 */
