// /home/master/DIENYNAS/frontend/src/constants/scheduleColorsIndex.ts

// Spalvų konstantų indeksas A-DIENYNAS sistemoje
// Eksportuoja visas spalvų konstantas vienoje vietoje
// Naudojamas komponentuose, kurie reikalauja abiejų spalvų schemų

// Mentorių spalvų konstantos (originalios)
export {
  SCHEDULE_STATUS_COLORS,
  getScheduleColors,
  getScheduleColorClasses,
  getScheduleStatusDescription,
  type ScheduleStatus,
  type ScheduleColorConfig
} from './scheduleColors';

// Studentų spalvų konstantos (naujos)
export {
  STUDENT_SCHEDULE_STATUS_COLORS,
  getStudentScheduleColors,
  getStudentScheduleColorClasses,
  getStudentScheduleStatusDescription,
  type StudentScheduleStatus,
  type StudentScheduleColorConfig
} from './scheduleStudentColors';

// Dalykų spalvų konstantos (naujos)
export {
  SUBJECT_COLORS,
  getSubjectColors,
  getSubjectColorClasses,
  type SubjectName,
  type SubjectColorConfig
} from './subjectColors';


