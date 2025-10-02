// frontend/src/lib/api.ts
import axios from 'axios';

// API base configuration optimized for hybrid development
// CRITICAL FIX: Use relative URLs in production to avoid redirect loops
// Frontend should use /api/ which gets proxied by Nginx to backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Use relative URL in production - Nginx handles proxy
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');

// CHANGE: Helper for token refresh - use internal API route in hybrid mode
// const getTokenRefreshUrl = () => { // Commented out as not used
//   // In hybrid development mode, use Next.js internal proxy for token refresh
//   // This avoids CORS and proxy issues
//   if (typeof window !== 'undefined' && window.location.hostname === 'dienynas.mokyklaatradimai.lt') {
//     return '/api/users/token/refresh/'; // Use Next.js rewrite proxy
//   }
//   return `${API_BASE_URL}/users/token/refresh/`; // Direct backend call
// };

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // SEC-001: Enable credentials for cookie-based authentication
  withCredentials: true,
});

// SEC-001: Request interceptor updated for cookie-based authentication
api.interceptors.request.use(
  (config) => {
    // SEC-011: Role validation is now handled server-side by RoleValidationMiddleware
    // No need to send X-Current-Role header - backend determines role from JWT token
    // This ensures security by preventing client-side role manipulation
    
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// SEC-001: Response interceptor with automatic token refresh handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (Unauthorized) - attempt token refresh before logout
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Prevent redirect loops - only redirect if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        
        // CRITICAL FIX: Attempt token refresh before logout
        // Use separate fetch to avoid infinite loops with api instance
        try {
          console.log('🔄 Attempting token refresh due to 401 error...');
          
          // CRITICAL FIX: Use separate fetch instead of api instance to prevent loops
          const refreshResponse = await fetch('/api/users/token/refresh/', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
          });
          
          if (refreshResponse.ok) {
            console.log('✅ Token refresh successful, retrying original request');
            // Token refresh successful - retry the original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.log('❌ Token refresh failed:', refreshError);
          // Token refresh failed - proceed with logout
        }

        // Token refresh failed or not attempted - proceed with logout
        try {
          await api.post('/users/logout/');
        } catch {
          // Logout API failed - continue with redirect
        }

        // Direct redirect to login
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    }

    // Handle 403 (Forbidden) - role validation issue
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // ROLE SWITCHING TOKEN LOGIC: Tiesioginis redirect į login
      // Nereikia role refresh - backend'as tikrina ar role egzistuoja token'e
      // Jei 403, tai reiškia kad role nėra token'e arba token'as neteisingas
      
      // ✅ Tiesioginis redirect į login:
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// SEC-001: Authentication API updated for cookie-based authentication
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/users/token/', credentials),
  refresh: () =>
    api.post('/users/token/refresh/'), // SEC-001: No need to pass refresh token - handled by cookies
  logout: () =>
    api.post('/users/logout/'), // SEC-001: New logout endpoint
  me: () => api.get('/users/me/'),
};

// Users API
export const usersAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/users/users/', { params }),
  getById: (id: number) => api.get(`/users/users/${id}/`),
  create: (userData: Record<string, unknown>) => api.post('/users/users/', userData),
  update: (id: number, userData: Record<string, unknown>) => api.put(`/users/users/${id}/`, userData),
  delete: (id: number) => api.delete(`/users/users/${id}/`),
};

// CRM API - santykių valdymas
export const crmAPI = {
  // Student-Parent relationships
  studentParents: {
    getAll: () => api.get('/crm/student-parents/'),
    create: (data: Record<string, unknown>) => api.post('/crm/student-parents/', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/crm/student-parents/${id}/`, data),
    delete: (id: number) => api.delete(`/crm/student-parents/${id}/`),
  },
  
  // Student-Curator relationships
  studentCurators: {
    getAll: () => api.get('/crm/student-curators/'),
    create: (data: Record<string, unknown>) => api.post('/crm/student-curators/', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/crm/student-curators/${id}/`, data),
    delete: (id: number) => api.delete(`/crm/student-curators/${id}/`),
  },
  
  // Student-Subject-Level relationships
  studentSubjectLevels: {
    getAll: () => api.get('/crm/student-subject-levels/'),
    create: (data: Record<string, unknown>) => api.post('/crm/student-subject-levels/', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/crm/student-subject-levels/${id}/`, data),
    delete: (id: number) => api.delete(`/crm/student-subject-levels/${id}/`),
  },
  
  // Mentor-Subject relationships
  mentorSubjects: {
    getAll: () => api.get('/crm/mentor-subjects/'),
    mySubjects: () => api.get('/crm/mentor-subjects/my_subjects/'), // CHANGE: Added mySubjects method for mentor's assigned subjects
    create: (data: Record<string, unknown>) => api.post('/crm/mentor-subjects/', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/crm/mentor-subjects/${id}/`, data),
    delete: (id: number) => api.delete(`/crm/mentor-subjects/${id}/`),
  },
};

// Curriculum API - dalykų ir pamokų valdymas
export const curriculumAPI = {
  // Subjects
  subjects: {
    getAll: () => api.get('/curriculum/subjects/'),
    create: (subjectData: Record<string, unknown>) => api.post('/curriculum/subjects/', subjectData),
    update: (id: number, subjectData: Record<string, unknown>) => api.put(`/curriculum/subjects/${id}/`, subjectData),
    delete: (id: number) => api.delete(`/curriculum/subjects/${id}/`),
  },
  
  // Levels
  levels: {
    getAll: () => api.get('/curriculum/levels/'),
    create: (levelData: Record<string, unknown>) => api.post('/curriculum/levels/', levelData),
    update: (id: number, levelData: Record<string, unknown>) => api.put(`/curriculum/levels/${id}/`, levelData),
    delete: (id: number) => api.delete(`/curriculum/levels/${id}/`),
  },
  
  // Lessons
  lessons: {
    getAll: () => api.get('/curriculum/lessons/'),
    getById: (id: number) => api.get(`/curriculum/lessons/${id}/`),
    create: (lessonData: Record<string, unknown>) => api.post('/curriculum/lessons/', lessonData),
    update: (id: number, lessonData: Record<string, unknown>) => api.put(`/curriculum/lessons/${id}/`, lessonData),
    delete: (id: number) => api.delete(`/curriculum/lessons/${id}/`),
  },
  
  // Skills
  skills: {
    getAll: (params?: Record<string, unknown>) => api.get('/curriculum/skills/', { params }),
    create: (skillData: Record<string, unknown>) => api.post('/curriculum/skills/', skillData),
    update: (id: number, skillData: Record<string, unknown>) => api.put(`/curriculum/skills/${id}/`, skillData),
    delete: (id: number) => api.delete(`/curriculum/skills/${id}/`),
  },
  
  // Competencies
  competencies: {
    getAll: (params?: Record<string, unknown>) => api.get('/curriculum/competencies/', { params }),
    create: (competencyData: Record<string, unknown>) => api.post('/curriculum/competencies/', competencyData),
    update: (id: number, competencyData: Record<string, unknown>) => api.put(`/curriculum/competencies/${id}/`, competencyData),
    delete: (id: number) => api.delete(`/curriculum/competencies/${id}/`),
  },
  
  // Competency Achievements
  competencyAtcheves: {
    getAll: (params?: Record<string, unknown>) => api.get('/curriculum/competency-atcheves/', { params }),
    create: (data: Record<string, unknown>) => api.post('/curriculum/competency-atcheves/', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/curriculum/competency-atcheves/${id}/`, data),
    delete: (id: number) => api.delete(`/curriculum/competency-atcheves/${id}/`),
  },
  
  // Virtues
  virtues: {
    getAll: () => api.get('/curriculum/virtues/'),
    create: (virtueData: Record<string, unknown>) => api.post('/curriculum/virtues/', virtueData),
    update: (id: number, virtueData: Record<string, unknown>) => api.put(`/curriculum/virtues/${id}/`, virtueData),
    delete: (id: number) => api.delete(`/curriculum/virtues/${id}/`),
  },
  
  // Objectives
  objectives: {
    getAll: () => api.get('/curriculum/objectives/'),
    create: (objectiveData: Record<string, unknown>) => api.post('/curriculum/objectives/', objectiveData),
    update: (id: number, objectiveData: Record<string, unknown>) => api.put(`/curriculum/objectives/${id}/`, objectiveData),
    delete: (id: number) => api.delete(`/curriculum/objectives/${id}/`),
  },
  
  // Components
  components: {
    getAll: () => api.get('/curriculum/components/'),
    create: (componentData: Record<string, unknown>) => api.post('/curriculum/components/', componentData),
    update: (id: number, componentData: Record<string, unknown>) => api.put(`/curriculum/components/${id}/`, componentData),
    delete: (id: number) => api.delete(`/curriculum/components/${id}/`),
  },
};

// Plans API - ugdymo planų valdymas
export const plansAPI = {
  // IMU Plans
  imuPlans: {
    getAll: (params?: Record<string, unknown>) => api.get('/plans/imu-plans/', { params }),
    getById: (id: number) => api.get(`/plans/imu-plans/${id}/`),
    create: (planData: Record<string, unknown>) => api.post('/plans/imu-plans/', planData),
    update: (id: number, planData: Record<string, unknown>) => api.put(`/plans/imu-plans/${id}/`, planData),
    delete: (id: number) => api.delete(`/plans/imu-plans/${id}/`),
    // Additional endpoints
    bulkCreate: (data: Record<string, unknown>) => api.post('/plans/imu-plans/bulk_create_from_sequence/', data),
    updateAttendance: (id: number, attendanceData: Record<string, unknown>) => api.post(`/plans/imu-plans/${id}/update_attendance/`, attendanceData),
    getAttendanceStats: (studentId: number, subjectId: number) => api.get(`/plans/imu-plans/attendance_stats/?student_id=${studentId}&subject_id=${subjectId}`),
    getBulkAttendanceStats: (subjectId: number, globalScheduleId?: number, lessonId?: number) => {
      const params = new URLSearchParams();
      params.append('subject_id', subjectId.toString());
      if (globalScheduleId) params.append('global_schedule_id', globalScheduleId.toString());
      if (lessonId) params.append('lesson_id', lessonId.toString());
      return api.get(`/plans/imu-plans/bulk_attendance_stats/?${params.toString()}`);
    },
  },
  
  // Lesson Sequences
  lessonSequences: {
    getAll: (params?: Record<string, unknown>) => api.get('/plans/lesson-sequences/', { params }),
    getById: (id: number) => api.get(`/plans/lesson-sequences/${id}/`),
    create: (sequenceData: Record<string, unknown>) => api.post('/plans/lesson-sequences/', sequenceData),
    update: (id: number, sequenceData: Record<string, unknown>) => api.put(`/plans/lesson-sequences/${id}/`, sequenceData),
    delete: (id: number) => api.delete(`/plans/lesson-sequences/${id}/`),
    duplicate: (id: number) => api.post(`/plans/lesson-sequences/${id}/duplicate/`),
  },
};

// Schedule API - tvarkaraščio valdymas
export const scheduleAPI = {
  // Periods
  periods: {
    getAll: () => api.get('/schedule/periods/'),
    create: (periodData: Record<string, unknown>) => api.post('/schedule/periods/', periodData),
    update: (id: number, periodData: Record<string, unknown>) => api.put(`/schedule/periods/${id}/`, periodData),
    delete: (id: number) => api.delete(`/schedule/periods/${id}/`),
  },
  
  // Classrooms
  classrooms: {
    getAll: () => api.get('/schedule/classrooms/'),
    create: (classroomData: Record<string, unknown>) => api.post('/schedule/classrooms/', classroomData),
    update: (id: number, classroomData: Record<string, unknown>) => api.put(`/schedule/classrooms/${id}/`, classroomData),
    delete: (id: number) => api.delete(`/schedule/classrooms/${id}/`),
  },
  
  // Global Schedule
  globalSchedule: {
    getAll: () => api.get('/schedule/schedules/'),
    getById: (id: number) => api.get(`/schedule/schedules/${id}/`),
    create: (scheduleData: Record<string, unknown>) => api.post('/schedule/schedules/', scheduleData),
    update: (id: number, scheduleData: Record<string, unknown>) => api.put(`/schedule/schedules/${id}/`, scheduleData),
    delete: (id: number) => api.delete(`/schedule/schedules/${id}/`),
    // Additional schedule endpoints
    getWeekly: (weekStart: string) => api.get(`/schedule/schedules/weekly/?week_start=${weekStart}`),
    getDaily: (date: string) => api.get(`/schedule/schedules/daily/?date=${date}`),
    getConflicts: () => api.get('/schedule/schedules/conflicts/'),
    getMentorSubjects: () => api.get('/schedule/schedules/mentor-subjects/'),
    getActiveActivities: () => api.get('/schedule/schedules/active_activities/'),
  },
};

// Grades API - pažymių valdymas
export const gradesAPI = {
  getAll: () => api.get('/grades/grades/'),
  getById: (id: number) => api.get(`/grades/grades/${id}/`),
  create: (gradeData: Record<string, unknown>) => api.post('/grades/grades/', gradeData),
  update: (id: number, gradeData: Record<string, unknown>) => api.put(`/grades/grades/${id}/`, gradeData),
  delete: (id: number) => api.delete(`/grades/grades/${id}/`),
};

// Violation API - pažeidimų/skolų valdymas
export const violationAPI = {
  // Violation Categories
  categories: {
    getAll: () => api.get('/violations/categories/'),
    getById: (id: number) => api.get(`/violations/categories/${id}/`),
    create: (categoryData: Record<string, unknown>) => api.post('/violations/categories/', categoryData),
    update: (id: number, categoryData: Record<string, unknown>) => api.put(`/violations/categories/${id}/`, categoryData),
    delete: (id: number) => api.delete(`/violations/categories/${id}/`),
  },
  
  // Violation Types
  types: {
    getAll: () => api.get('/violations/types/'),
    getById: (id: number) => api.get(`/violations/types/${id}/`),
    create: (typeData: Record<string, unknown>) => api.post('/violations/types/', typeData),
    update: (id: number, typeData: Record<string, unknown>) => api.put(`/violations/types/${id}/`, typeData),
    delete: (id: number) => api.delete(`/violations/types/${id}/`),
  },
  
  // Violation Ranges
  ranges: {
    getAll: () => api.get('/violations/ranges/'),
    getById: (id: number) => api.get(`/violations/ranges/${id}/`),
    create: (rangeData: Record<string, unknown>) => api.post('/violations/ranges/', rangeData),
    update: (id: number, rangeData: Record<string, unknown>) => api.put(`/violations/ranges/${id}/`, rangeData),
    delete: (id: number) => api.delete(`/violations/ranges/${id}/`),
  },
  
  // Violations (main CRUD)
  violations: {
    getAll: (params?: Record<string, unknown>) => api.get('/violations/', { params }),
    getById: (id: number) => api.get(`/violations/${id}/`),
    create: (violationData: Record<string, unknown>) => api.post('/violations/', violationData),
    update: (id: number, violationData: Record<string, unknown>) => api.put(`/violations/${id}/`, violationData),
    delete: (id: number) => api.delete(`/violations/${id}/`),
    
    // Bulk actions
    bulkAction: (actionData: Record<string, unknown>) => api.post('/violations/bulk_action/', actionData),
    
    // Individual actions
    markCompleted: (id: number) => api.post(`/violations/${id}/mark_completed/`),
    markPenaltyPaid: (id: number) => api.post(`/violations/${id}/mark_penalty_paid/`),
    recalculatePenalty: (id: number) => api.post(`/violations/${id}/recalculate_penalty/`),
  },
  
  // Statistics
  stats: {
    getGeneral: (params?: Record<string, unknown>) => api.get('/violations/stats/', { params }),
    getCategory: (params?: Record<string, unknown>) => api.get('/violations/category-stats/', { params }),
  },
};

// Legacy API endpoints for backward compatibility (deprecated)
export const studentParentsAPI = crmAPI.studentParents;
export const studentCuratorsAPI = crmAPI.studentCurators;
export const studentSubjectLevelsAPI = crmAPI.studentSubjectLevels;
export const mentorSubjectsAPI = crmAPI.mentorSubjects;
export const lessonsAPI = curriculumAPI.lessons;
export const subjectsAPI = curriculumAPI.subjects;
export const levelsAPI = curriculumAPI.levels;
export const skillsAPI = curriculumAPI.skills;
export const competenciesAPI = curriculumAPI.competencies;
export const competencyAtcheveAPI = curriculumAPI.competencyAtcheves;
export const virtuesAPI = curriculumAPI.virtues;
export const objectivesAPI = curriculumAPI.objectives;
export const componentsAPI = curriculumAPI.components;

// Violation legacy API endpoints for backward compatibility
export const violationCategoriesAPI = violationAPI.categories;
export const violationTypesAPI = violationAPI.types;
export const violationRangesAPI = violationAPI.ranges;
export const violationsAPI = violationAPI.violations;
export const violationStatsAPI = violationAPI.stats;

// Export api instance for direct use
export { api };

export default api; 