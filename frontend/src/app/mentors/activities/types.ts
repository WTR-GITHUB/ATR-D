// frontend/src/app/mentors/activities/types.ts

// Veiklos modulio tipų aprašai
// Šis failas centralizuojami visus TypeScript tipus, naudojamus Veiklos puslapyje
// CHANGE: Pašalinti plan_status, started_at, completed_at iš IMUPlan interface - perkelta į GlobalSchedule
// CHANGE: Atnaujintas AttendanceStatus tipas leisti null reikšmes - reikalinga lankomumo būsenos išvalymui

// Lankomumo statusai - null leidžia išvalyti lankomumo būseną
export type AttendanceStatus = 'present' | 'absent' | 'left' | 'excused'; // CHANGE: Pakeista 'late' į 'left'

// Aktyvumo lygiai
export type ActivityLevel = 'high' | 'medium' | 'low';

// Užduočių atlikimo lygiai
export type TaskCompletion = 'completed' | 'partially' | 'not_started';

// Supratimo lygiai
export type Understanding = 'excellent' | 'good' | 'fair' | 'poor';

// Mokinio duomenų tipas
export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  attendance_status: AttendanceStatus;
  activity_level: ActivityLevel;
  task_completion: TaskCompletion;
  understanding: Understanding;
  notes: string;
  tasks_completed: number;
  total_tasks: number;
}

// Dalyko informacija
export interface Subject {
  id: number;
  name: string;
  description?: string;
}

// Pamokos duomenys
export interface Lesson {
  id: number;
  title: string;
  topic: string;
  subject: Subject;
  content: string;
  objectives: string[];
  components: string[];
  focus: string[];
  skills: number[];
  virtues: string[];
  levels: string[];
  slenkstinis: string;
  bazinis: string;
  pagrindinis: string;
  aukstesnysis: string;
  competency_atcheves: number[];
  mentor: string;
  created_at: string;
  updated_at: string;
}

// Mokinio vertinimo tipas
export interface StudentEvaluation {
  student_id: number;
  attendance_status: AttendanceStatus;
  activity_level: ActivityLevel;
  task_completion: TaskCompletion;
  understanding: Understanding;
  notes: string;
  tasks_completed: number;
  total_tasks: number;
}

// Lankomumo statistikos tipas
export interface AttendanceStats {
  total_students: number;
  present_count: number;
  absent_count: number;
  left_count: number; // CHANGE: Pakeista 'late_count' į 'left_count'
  excused_count: number;
  attendance_percentage: number;
}

// Veiklos statistikos tipas
export interface PerformanceStats {
  high_activity_count: number;
  medium_activity_count: number;
  low_activity_count: number;
  completed_tasks_count: number;
  excellent_understanding_count: number;
  needs_attention_count: number;
}

// Filtravimo tipai
export type FilterBy = 'all' | 'present' | 'absent' | 'left' | 'excused'; // CHANGE: Pakeista 'late' į 'left'

// Mokinių sąrašo būsena
export interface StudentsListState {
  searchQuery: string;
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
  global_schedule: number | {
    id: number;
    date: string;
    weekday: string;
    subject: {
      id: number;
      name: string;
    };
    level: {
      id: number;
      name: string;
    };
    period: {
      id: number;
      name: string;
      starttime: string;
      endtime: string;
    };
    classroom: {
      id: number;
      name: string;
    };
    plan_status: string;
    user: {
      id: number;
      first_name: string;
      last_name: string;
    };
  };
  lesson: number | null | {
    id: number;
    title: string;
    topic: string;
    subject: {
      id: number;
      name: string;
    };
    mentor: {
      id: number;
      first_name: string;
      last_name: string;
    };
  };
  lesson_title: string | null;
  lesson_subject: string | null;
  
  // REFAKTORINIMAS: Lankomumo statusas paliekamas IMUPlan
  attendance_status: AttendanceStatus;
  attendance_status_display: string;
  
  notes: string;
  created_at: string;
  updated_at: string;
}

// Globalaus tvarkaraščio duomenys
export interface GlobalSchedule {
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
  // REFAKTORINIMAS: Pridėti planų valdymo laukai
  plan_status: 'planned' | 'in_progress' | 'completed';
  plan_status_display: string;
  started_at?: string;
  completed_at?: string;
}
