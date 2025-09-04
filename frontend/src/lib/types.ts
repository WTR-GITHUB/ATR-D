// frontend/src/lib/types.ts
// A-DIENYNAS Frontend Types
// CHANGE: Fixed AttendanceStats interface and other type issues
// PURPOSE: TypeScript type definitions for frontend
// UPDATES: Fixed AttendanceStats.total property and other type mismatches

// User types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  roles: UserRole[]; // Pakeista iš role į roles
  default_role?: UserRole; // Numatytoji rolė prisijungimo metu
  birth_date?: string;
  phone_number?: string;
  contract_number?: string;
  is_active: boolean;
  last_login?: string;
  date_joined: string;
}

export type UserRole = 'manager' | 'student' | 'parent' | 'curator' | 'mentor';

// Subject types
export interface Subject {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Level types
export interface Level {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Topic types
export interface Topic {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Objective types
export interface Objective {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Component types
export interface Component {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Skill types
export interface Skill {
  id: number;
  code: string;
  name: string;
  description?: string;
  subject?: number;
  subject_name?: string;
}

// Competency types
export interface Competency {
  id: number;
  name: string;
  description?: string;
}

export interface CompetencyAtcheve {
  id: number;
  subject?: number;
  subject_name?: string;
  competency: number;
  competency_name: string;
  virtues: number[];
  virtues_names: string[];
  todos: string;
}

// Virtue types
export interface Virtue {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Focus types
export interface Focus {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Lesson types
export interface Lesson {
  id: number;
  title: string;
  subject?: Subject;
  subject_name?: string;
  levels: Level[];
  levels_names?: string[];
  mentor?: User;
  mentor_name?: string;
  description?: string;
  assessment_criteria?: string;
  topic?: Topic;
  topic_name?: string;
  objectives: Objective[];
  objectives_names?: string[];
  components: Component[];
  components_names?: string[];
  skills: Skill[];
  skills_names?: string[];
  competencies: Competency[];
  competencies_names?: string[];
  virtues: Virtue[];
  virtues_names?: string[];
  focus: Focus[];
  focus_names?: string[];
  slenkstinis?: string;
  bazinis?: string;
  pagrindinis?: string;
  aukstesnysis?: string;
  created_at: string;
  updated_at: string;
}

// Grade types
export interface Grade {
  id: number;
  student: User;
  lesson: Lesson;
  mentor: User;
  percentage: number;
  notes?: string;
  grade_letter: string;
  grade_description: string;
  created_at: string;
  updated_at: string;
}

// Relationship types
export interface StudentParent {
  id: number;
  student: User;
  parent: User;
  created_at: string;
  updated_at: string;
}

export interface StudentCurator {
  id: number;
  student: User;
  curator: User;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentSubjectLevel {
  id: number;
  student: User;
  subject: Subject;
  level: Level;
  created_at: string;
  updated_at: string;
}

export interface MentorSubject {
  id: number;
  mentor: User;
  subject: Subject;
  created_at: string;
  updated_at: string;
}

// Schedule types
export interface Period {
  id: number;
  name?: string;
  starttime: string;
  endtime: string;
  duration: number;
  created_at: string;
  updated_at: string;
}

export interface Classroom {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface GlobalSchedule {
  id: number;
  date: string;
  weekday: string;
  period: Period;
  classroom: Classroom;
  subject: Subject;
  level: Level;
  lesson?: Lesson;  // Neprivalomas
  user: User;
  created_at: string;
  updated_at: string;
}

// Attendance types - FIXED: Added missing properties
export interface AttendanceStats {
  present_count: number;
  absent_count: number;
  excused_count: number;
  late_count: number;
  total_students: number;
  total: number; // Added missing total property
  // ADDED: Missing properties used in StudentStats component
  present: number;
  absent: number;
  excused: number;
  left: number; // Paliko (pakeista iš late)
}

export interface Attendance {
  id: number;
  student: User;
  lesson: Lesson;
  status: 'present' | 'absent' | 'excused' | 'late';
  marked_by: User;
  marked_at: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  roles: UserRole[]; // Pakeista iš role į roles
  birth_date?: string;
  phone_number?: string;
  contract_number?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'date' | 'tel';
  required?: boolean;
  options?: { value: string; label: string }[];
}

// Dashboard types
export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalParents: number;
  totalCurators: number;
  totalMentors: number;
  totalSubjects: number;
  totalLevels: number;
}

// Performance types - ADDED: Missing interface for StudentStats component
export interface PerformanceStats {
  needsAttention: number;
  highPerformers: number;
  totalFeedback: number;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

// Table types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => any;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: any;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Violation types
export interface ViolationCategory {
  id: number;
  name: string;
  description: string;
  color_type: ViolationColorType;
  color_type_display: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ViolationColorType = 
  | 'DEFAULT' 
  | 'RED' 
  | 'BLUE' 
  | 'YELLOW' 
  | 'ORANGE' 
  | 'PURPLE' 
  | 'GREEN' 
  | 'DARK_GREEN' 
  | 'AMBER' 
  | 'DARK_RED';

export interface ViolationType {
  id: number;
  name: string;
  category: number;
  category_name: string;
  category_color_type: ViolationColorType;
  default_amount?: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ViolationRange {
  id: number;
  name: string;
  min_violations: number;
  max_violations?: number;
  penalty_amount: number;
  range_display: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Violation {
  id: number;
  student: number;
  student_name: string;
  student_email: string;
  category: string;
  violation_type: string;
  description: string;
  amount: number;
  currency: string;
  status: ViolationStatus;
  status_display: string;
  penalty_status: PenaltyStatus;
  penalty_status_display: string;
  created_at: string;
  task_completed_at?: string;
  penalty_paid_at?: string;
  updated_at: string;
  violation_count: number;
  penalty_amount: number;
  created_by?: number;
  created_by_name?: string;
  notes: string;
  is_fully_paid: boolean;
  is_overdue: boolean;
}

export type ViolationStatus = 'pending' | 'completed';
export type PenaltyStatus = 'unpaid' | 'paid';

export interface ViolationCreateData {
  student: number;
  category: string;
  violation_type: string;
  description: string;
  amount: number;
  currency: string;
  notes?: string;
}

export interface ViolationUpdateData {
  category?: string;
  violation_type?: string;
  description?: string;
  amount?: number;
  currency?: string;
  status?: ViolationStatus;
  penalty_status?: PenaltyStatus;
  notes?: string;
}

export interface ViolationBulkAction {
  action: 'mark_completed' | 'mark_penalty_paid' | 'recalculate_penalties' | 'delete';
  violation_ids: number[];
}

export interface ViolationStats {
  total_violations: number;
  completed_violations: number;
  pending_violations: number;
  total_penalty_amount: number;
  paid_penalty_amount: number;
  unpaid_penalty_amount: number;
  completion_rate: number;
  penalty_payment_rate: number;
  category_stats: Record<string, CategoryStats>;
  monthly_stats: Record<string, MonthlyStats>;
}

export interface CategoryStats {
  total: number;
  completed: number;
  pending: number;
  color_type: ViolationColorType;
  penalty_amount: number;
}

export interface MonthlyStats {
  total: number;
  completed: number;
  penalty_amount: number;
}

export interface ViolationCategoryStats {
  category_name: string;
  color_type: ViolationColorType;
  total_count: number;
  completed_count: number;
  pending_count: number;
  completion_rate: number;
  total_amount: number;
  penalty_amount: number;
}

// Violation form types
export interface ViolationFormData {
  students: number[];
  category: string;
  violation_type: string;
  description: string;
  amount: number;
  currency: string;
  notes?: string;
}

// Violation filter types
export interface ViolationFilters {
  status?: ViolationStatus;
  penalty_status?: PenaltyStatus;
  category?: string;
  student?: number;
  created_by?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// Violation table types
export interface ViolationTableColumn {
  key: keyof Violation;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: Violation) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Violation color mapping
export interface ViolationColorMap {
  [key: string]: {
    bg: string;
    border: string;
    color: string;
  };
} 