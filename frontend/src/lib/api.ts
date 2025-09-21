// frontend/src/lib/api.ts
import axios from 'axios';

// API base configuration optimized for hybrid development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// CHANGE: Helper for token refresh - use internal API route in hybrid mode
const getTokenRefreshUrl = () => {
  // In hybrid development mode, use Next.js internal proxy for token refresh
  // This avoids CORS and proxy issues
  if (typeof window !== 'undefined' && window.location.hostname === 'dienynas.mokyklaatradimai.lt') {
    return '/api/users/token/refresh/'; // Use Next.js rewrite proxy
  }
  return `${API_BASE_URL}/users/token/refresh/`; // Direct backend call
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and current role
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // CHANGE: Pridėti current role header jei yra
    const currentRole = localStorage.getItem('current_role');
    if (currentRole) {
      config.headers['X-Current-Role'] = currentRole;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and role validation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // CHANGE: Handle 401 (Unauthorized) - token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // CHANGE: Use smart token refresh URL for hybrid development mode
          const refreshUrl = getTokenRefreshUrl();
          
          const response = await axios.post(refreshUrl, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch {
        // CHANGE: Clear all auth data on refresh failure
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('current_role');
        localStorage.removeItem('auth-storage');
        window.location.href = '/auth/login';
      }
    }

    // CHANGE: Handle 403 (Forbidden) - role validation issue
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh user data and role
      try {
        const userResponse = await api.get('/users/me/');
        const user = userResponse.data;
        
        // Update current role if missing or invalid
        const currentRole = localStorage.getItem('current_role');
        if (!currentRole || !user.roles?.includes(currentRole)) {
          // Set to default role or first available role
          const newRole = user.default_role || user.roles?.[0];
          if (newRole) {
            localStorage.setItem('current_role', newRole);
            originalRequest.headers['X-Current-Role'] = newRole;
          }
        }
        
        return api(originalRequest);
      } catch {
        // If user data fetch fails, redirect to login
        localStorage.clear();
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/users/token/', credentials),
  refresh: (refreshToken: string) =>
    api.post('/users/token/refresh/', { refresh: refreshToken }),
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