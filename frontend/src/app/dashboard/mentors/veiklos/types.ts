// frontend/src/app/dashboard/mentors/veiklos/types.ts

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

// Callback funkcijų tipai
export type AttendanceChangeHandler = (studentId: number, status: AttendanceStatus) => void;
export type EvaluationChangeHandler = (studentId: number, evaluation: StudentEvaluation) => void;
export type DateChangeHandler = (date: string) => void;
export type SubjectChangeHandler = (subject: Subject) => void;
export type LessonChangeHandler = (lesson: Lesson | null) => void;
