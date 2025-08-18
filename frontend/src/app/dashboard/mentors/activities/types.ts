// frontend/src/app/dashboard/mentors/activities/types.ts

// Veiklos modulio tipų aprašai
// Centralizuoti tipų aprašymai, naudojami visuose Veiklos puslapio komponentuose
// Skirta užtikrinti tipo saugumą ir kodo konsistenciją
// CHANGE: Sukurtas centralizuotas tipų aprašų failas Veiklos moduliui

// Lankomumo būsenų tipai
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

// Mokinio duomenų struktūra
export interface StudentAttendance {
  present: number;
  absent: number;
  total: number;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  attendance: StudentAttendance;
  hasRecentFeedback: boolean;
  status: AttendanceStatus;
}

// Dalyko duomenų struktūra
export interface Subject {
  id: number;
  name: string;
  description: string;
}

// Periodo duomenų struktūra
export interface Period {
  id: number;
  name: string;
  starttime: string; // HH:MM formatu
  duration: number;
  endtime: string; // HH:MM formatu
}

// Pamokos duomenų struktūra
export interface Lesson {
  id: number;
  title: string;
  subject: string;
  topic: string;
  subject_id: number;
  time?: string;
  created_at: string;
}

// Tvarkaraščio elementas
export interface ScheduleItem {
  id: number;
  date: string;
  weekday: string;
  period: {
    id: number;
    name: string;
    starttime: string;
    endtime: string;
  };
  classroom: {
    id: number;
    name: string;
    description: string;
  };
  subject: {
    id: number;
    name: string;
    description: string;
  };
  level: {
    id: number;
    name: string;
    description: string;
  };
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Vertinimo kriterijų tipai
export type ActivityLevel = 'high' | 'medium' | 'low' | '';
export type TaskCompletion = 'completed' | 'partial' | 'not_completed' | '';
export type Understanding = 'excellent' | 'good' | 'needs_help' | '';

// Mokinio vertinimo duomenys
export interface StudentEvaluation {
  activity: ActivityLevel;
  taskCompletion: TaskCompletion;
  understanding: Understanding;
  notes: string;
  tasks: string[];
}

// Filtravimo ir rūšiavimo tipai
export type SortBy = 'name' | 'attendance' | 'recent';
export type FilterBy = 'all' | 'present' | 'absent' | 'late' | 'excused';

// Statistikos duomenų struktūros
export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

export interface PerformanceStats {
  highPerformers: number;
  needsAttention: number;
  averageAttendance: number;
  totalFeedback: number;
}

// API atsakymų tipai (ateičiai)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pamokos sesijos duomenys
export interface LessonSession {
  id: string;
  lessonId: number;
  date: string;
  startTime: string;
  endTime?: string;
  studentEvaluations: Record<number, StudentEvaluation>;
  notes: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
}

// Formos būsenų tipai
export interface LessonSelectorState {
  selectedDate: string;
  selectedSubject: Subject;
  selectedLesson: Lesson | null;
}

export interface StudentsListState {
  searchTerm: string;
  sortBy: SortBy;
  filterBy: FilterBy;
  showFilters: boolean;
}

// Detalios pamokos informacijos tipas (iš backend curriculum models)
export interface LessonDetails {
  id: number;
  title: string;
  topic: string;
  subject_name: string;
  content: string; // Mokomoji medžiaga
  objectives: string; // JSON string
  objectives_list: any[]; // Parsed JSON
  components: string; // JSON string  
  components_list: any[]; // Parsed JSON
  focus: string; // JSON string
  focus_list: any[]; // Parsed JSON
  skills_list: number[]; // Gebėjimų ID sąrašas
  virtues_names: string[]; // Dorybių pavadinimai
  levels_names: string[]; // Lygių pavadinimai
  slenkstinis: string; // 54% lygis
  bazinis: string; // 74% lygis
  pagrindinis: string; // 84% lygis
  aukstesnysis: string; // 100% lygis
  competency_atcheve_name: string[];
  competency_atcheves: number[];
  mentor_name: string;
  created_at: string;
  updated_at: string;
}

// IMU planų duomenys (kelios pamokos vienoje veikloje)
export interface IMUPlan {
  id: number;
  student: number;
  student_name: string;
  global_schedule: number;
  lesson: number | null;
  lesson_title: string | null;
  lesson_subject: string | null;
  status: 'planned' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
  status_display: string;
  started_at?: string;
  completed_at?: string;
  notes: string;
  created_at: string;
  updated_at: string;
  global_schedule_date: string;
  global_schedule_time: string;
  global_schedule_classroom: string;
}

// Pasirinktos pamokos būsena
export interface SelectedLessonState {
  globalScheduleId: number | null;
  lessonDetails: LessonDetails | null;
  imuPlans: IMUPlan[];
  isLoading: boolean;
  error: string | null;
}

// Callback funkcijų tipai
export type AttendanceChangeHandler = (studentId: number, status: AttendanceStatus) => void;
export type EvaluationChangeHandler = (studentId: number, evaluation: StudentEvaluation) => void;
export type DateChangeHandler = (date: string) => void;
export type SubjectChangeHandler = (subject: Subject) => void;
export type LessonChangeHandler = (lesson: Lesson | null) => void;
export type ScheduleItemSelectHandler = (item: ScheduleItem | null) => void;
