// frontend/src/lib/api.ts
import axios from 'axios';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // CHANGE: Fixed token refresh URL to match backend endpoint structure
          // Backend has /api/users/token/refresh/, not /api/token/refresh/
          const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
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
  getAll: (params?: any) => api.get('/users/users/', { params }),
  getById: (id: number) => api.get(`/users/users/${id}/`),
  create: (userData: any) => api.post('/users/users/', userData),
  update: (id: number, userData: any) => api.put(`/users/users/${id}/`, userData),
  delete: (id: number) => api.delete(`/users/users/${id}/`),
};

// CRM API - santykių valdymas
export const crmAPI = {
  // Student-Parent relationships
  studentParents: {
    getAll: () => api.get('/crm/student-parents/'),
    create: (data: any) => api.post('/crm/student-parents/', data),
    update: (id: number, data: any) => api.put(`/crm/student-parents/${id}/`, data),
    delete: (id: number) => api.delete(`/crm/student-parents/${id}/`),
  },
  
  // Student-Curator relationships
  studentCurators: {
    getAll: () => api.get('/crm/student-curators/'),
    create: (data: any) => api.post('/crm/student-curators/', data),
    update: (id: number, data: any) => api.put(`/crm/student-curators/${id}/`, data),
    delete: (id: number) => api.delete(`/crm/student-curators/${id}/`),
  },
  
  // Student-Subject-Level relationships
  studentSubjectLevels: {
    getAll: () => api.get('/crm/student-subject-levels/'),
    create: (data: any) => api.post('/crm/student-subject-levels/', data),
    update: (id: number, data: any) => api.put(`/crm/student-subject-levels/${id}/`, data),
    delete: (id: number) => api.delete(`/crm/student-subject-levels/${id}/`),
  },
  
  // Mentor-Subject relationships
  mentorSubjects: {
    getAll: () => api.get('/crm/mentor-subjects/'),
    create: (data: any) => api.post('/crm/mentor-subjects/', data),
    update: (id: number, data: any) => api.put(`/crm/mentor-subjects/${id}/`, data),
    delete: (id: number) => api.delete(`/crm/mentor-subjects/${id}/`),
  },
};

// Curriculum API - dalykų ir pamokų valdymas
export const curriculumAPI = {
  // Subjects
  subjects: {
    getAll: () => api.get('/curriculum/subjects/'),
    create: (subjectData: any) => api.post('/curriculum/subjects/', subjectData),
    update: (id: number, subjectData: any) => api.put(`/curriculum/subjects/${id}/`, subjectData),
    delete: (id: number) => api.delete(`/curriculum/subjects/${id}/`),
  },
  
  // Levels
  levels: {
    getAll: () => api.get('/curriculum/levels/'),
    create: (levelData: any) => api.post('/curriculum/levels/', levelData),
    update: (id: number, levelData: any) => api.put(`/curriculum/levels/${id}/`, levelData),
    delete: (id: number) => api.delete(`/curriculum/levels/${id}/`),
  },
  
  // Lessons
  lessons: {
    getAll: () => api.get('/curriculum/lessons/'),
    getById: (id: number) => api.get(`/curriculum/lessons/${id}/`),
    create: (lessonData: any) => api.post('/curriculum/lessons/', lessonData),
    update: (id: number, lessonData: any) => api.put(`/curriculum/lessons/${id}/`, lessonData),
    delete: (id: number) => api.delete(`/curriculum/lessons/${id}/`),
  },
  
  // Skills
  skills: {
    getAll: (params?: any) => api.get('/curriculum/skills/', { params }),
    create: (skillData: any) => api.post('/curriculum/skills/', skillData),
    update: (id: number, skillData: any) => api.put(`/curriculum/skills/${id}/`, skillData),
    delete: (id: number) => api.delete(`/curriculum/skills/${id}/`),
  },
  
  // Competencies
  competencies: {
    getAll: (params?: any) => api.get('/curriculum/competencies/', { params }),
    create: (competencyData: any) => api.post('/curriculum/competencies/', competencyData),
    update: (id: number, competencyData: any) => api.put(`/curriculum/competencies/${id}/`, competencyData),
    delete: (id: number) => api.delete(`/curriculum/competencies/${id}/`),
  },
  
  // Competency Achievements
  competencyAtcheves: {
    getAll: (params?: any) => api.get('/curriculum/competency-atcheves/', { params }),
    create: (data: any) => api.post('/curriculum/competency-atcheves/', data),
    update: (id: number, data: any) => api.put(`/curriculum/competency-atcheves/${id}/`, data),
    delete: (id: number) => api.delete(`/curriculum/competency-atcheves/${id}/`),
  },
  
  // Virtues
  virtues: {
    getAll: () => api.get('/curriculum/virtues/'),
    create: (virtueData: any) => api.post('/curriculum/virtues/', virtueData),
    update: (id: number, virtueData: any) => api.put(`/curriculum/virtues/${id}/`, virtueData),
    delete: (id: number) => api.delete(`/curriculum/virtues/${id}/`),
  },
  
  // Objectives
  objectives: {
    getAll: () => api.get('/curriculum/objectives/'),
    create: (objectiveData: any) => api.post('/curriculum/objectives/', objectiveData),
    update: (id: number, objectiveData: any) => api.put(`/curriculum/objectives/${id}/`, objectiveData),
    delete: (id: number) => api.delete(`/curriculum/objectives/${id}/`),
  },
  
  // Components
  components: {
    getAll: () => api.get('/curriculum/components/'),
    create: (componentData: any) => api.post('/curriculum/components/', componentData),
    update: (id: number, componentData: any) => api.put(`/curriculum/components/${id}/`, componentData),
    delete: (id: number) => api.delete(`/curriculum/components/${id}/`),
  },
};

// Plans API - ugdymo planų valdymas
export const plansAPI = {
  // IMU Plans
  imuPlans: {
    getAll: (params?: any) => api.get('/plans/imu-plans/', { params }),
    getById: (id: number) => api.get(`/plans/imu-plans/${id}/`),
    create: (planData: any) => api.post('/plans/imu-plans/', planData),
    update: (id: number, planData: any) => api.put(`/plans/imu-plans/${id}/`, planData),
    delete: (id: number) => api.delete(`/plans/imu-plans/${id}/`),
    // Additional endpoints
    bulkCreate: (data: any) => api.post('/plans/imu-plans/bulk_create_from_sequence/', data),
    updateAttendance: (id: number, attendanceData: any) => api.post(`/plans/imu-plans/${id}/update_attendance/`, attendanceData),
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
    getAll: (params?: any) => api.get('/plans/lesson-sequences/', { params }),
    getById: (id: number) => api.get(`/plans/lesson-sequences/${id}/`),
    create: (sequenceData: any) => api.post('/plans/lesson-sequences/', sequenceData),
    update: (id: number, sequenceData: any) => api.put(`/plans/lesson-sequences/${id}/`, sequenceData),
    delete: (id: number) => api.delete(`/plans/lesson-sequences/${id}/`),
    duplicate: (id: number) => api.post(`/plans/lesson-sequences/${id}/duplicate/`),
  },
};

// Schedule API - tvarkaraščio valdymas
export const scheduleAPI = {
  // Periods
  periods: {
    getAll: () => api.get('/schedule/periods/'),
    create: (periodData: any) => api.post('/schedule/periods/', periodData),
    update: (id: number, periodData: any) => api.put(`/schedule/periods/${id}/`, periodData),
    delete: (id: number) => api.delete(`/schedule/periods/${id}/`),
  },
  
  // Classrooms
  classrooms: {
    getAll: () => api.get('/schedule/classrooms/'),
    create: (classroomData: any) => api.post('/schedule/classrooms/', classroomData),
    update: (id: number, classroomData: any) => api.put(`/schedule/classrooms/${id}/`, classroomData),
    delete: (id: number) => api.delete(`/schedule/classrooms/${id}/`),
  },
  
  // Global Schedule
  globalSchedule: {
    getAll: () => api.get('/schedule/schedules/'),
    getById: (id: number) => api.get(`/schedule/schedules/${id}/`),
    create: (scheduleData: any) => api.post('/schedule/schedules/', scheduleData),
    update: (id: number, scheduleData: any) => api.put(`/schedule/schedules/${id}/`, scheduleData),
    delete: (id: number) => api.delete(`/schedule/schedules/${id}/`),
    // Additional schedule endpoints
    getWeekly: (weekStart: string) => api.get(`/schedule/schedules/weekly/?week_start=${weekStart}`),
    getDaily: (date: string) => api.get(`/schedule/schedules/daily/?date=${date}`),
    getConflicts: () => api.get('/schedule/schedules/conflicts/'),
    getMentorSubjects: () => api.get('/schedule/schedules/mentor-subjects/'),
  },
};

// Grades API - pažymių valdymas
export const gradesAPI = {
  getAll: () => api.get('/grades/grades/'),
  getById: (id: number) => api.get(`/grades/grades/${id}/`),
  create: (gradeData: any) => api.post('/grades/grades/', gradeData),
  update: (id: number, gradeData: any) => api.put(`/grades/grades/${id}/`, gradeData),
  delete: (id: number) => api.delete(`/grades/grades/${id}/`),
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

export default api; 