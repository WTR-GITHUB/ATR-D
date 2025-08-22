# ATTENDANCE STATISTICS SYSTEM - Implementation Plan

## PROJECT OVERVIEW

**A-DIENYNAS** attendance statistics system for tracking student lesson participation and attendance metrics. The system automatically calculates statistics for each student by subject and level, with nightly batch processing to ensure data accuracy and performance.

## SYSTEM ARCHITECTURE

### Core Components
- **StudentAttendanceStats Model** - stores calculated statistics in grades app
- **Calculation Services** - business logic for statistics computation
- **Management Commands** - CLI tools for manual and automated processing
- **API Endpoints** - REST API for frontend integration
- **Cron Jobs** - automated nightly processing
- **Frontend Integration** - display statistics in mentor dashboards

### Data Flow
1. **Input Sources**: IMUPlan (attendance_status), GlobalSchedule (plan_status)
2. **Processing**: Nightly batch calculation (02:00 AM)
3. **Storage**: StudentAttendanceStats table with aggregated data
4. **Output**: API endpoints for frontend consumption

## IMPLEMENTATION PLAN

### ETAPAS 1: Create StudentAttendanceStats Model

**Files to modify:**
- `backend/grades/models.py` - add new model
- `backend/grades/admin.py` - register model in admin
- `backend/grades/migrations/` - create database migration

**Actions:**
- Create `StudentAttendanceStats` model with fields:
  - `student`, `subject`, `level` (Foreign Keys)
  - `total_lessons_assigned`, `lessons_completed`
  - `attendance_present`, `attendance_absent`, `attendance_excused`
  - `last_calculation`, `calculation_date`
- Add `Meta` class with `unique_together`
- Create `__str__` method

**Estimated time:** 30 minutes

### ETAPAS 2: Create Statistics Calculation Logic

**Files to modify:**
- `backend/grades/services.py` - create new file with calculation logic
- `backend/grades/utils.py` - create helper functions

**Actions:**
- Create `calculate_student_attendance_stats()` function
- Create `calculate_all_students_stats()` function
- Create `update_planned_lessons_stats()` function
- Create `update_completed_lessons_stats()` function
- Add error handling and logging

**Estimated time:** 45 minutes

### ETAPAS 3: Create Django Management Command

**Files to modify:**
- `backend/grades/management/commands/__init__.py` - create
- `backend/grades/management/commands/calculate_attendance_stats.py` - create

**Actions:**
- Create `calculate_attendance_stats` management command
- Add arguments: `--all`, `--student`, `--subject`, `--level`
- Integrate with services.py functions
- Add progress bar and logging

**Estimated time:** 30 minutes

### ETAPAS 4: Create API Endpoints for Statistics Management

**Files to modify:**
- `backend/grades/views.py` - add new views
- `backend/grades/urls.py` - add URL patterns
- `backend/grades/serializers.py` - create serializers

**Actions:**
- Create `StudentAttendanceStatsViewSet`
- Add `GET /api/grades/student-stats/` endpoint
- Add `POST /api/grades/student-stats/recalculate/` endpoint
- Add filtering by student, subject, level

**Estimated time:** 45 minutes

### ETAPAS 5: Create Cron Job for Nightly Execution

**Files to modify:**
- `backend/core/settings.py` - add cron job configuration
- `backend/core/cron.py` - create cron job file
- `backend/core/management/commands/run_cron_jobs.py` - create

**Actions:**
- Create cron job configuration
- Set execution time to 02:00 AM (no load period)
- Add logging and monitoring
- Create manual trigger command

**Estimated time:** 30 minutes

### ETAPAS 6: Integrate with Existing Frontend Components

**Files to modify:**
- `frontend/src/app/dashboard/mentors/activities/page.tsx` - add statistics display
- `frontend/src/app/dashboard/mentors/plans/assign/page.tsx` - add statistics display
- `frontend/src/hooks/useAttendanceStats.ts` - create new hook

**Actions:**
- Create `useAttendanceStats` hook for data fetching
- Add statistics display in StudentRow component
- Add statistics display in activities page
- Add statistics display in plans page

**Estimated time:** 60 minutes

### ETAPAS 7: Create Testing and Documentation

**Files to modify:**
- `backend/grades/tests.py` - add tests
- `DOC/ATTENDANCE_STATS_SYSTEM.md` - create documentation
- `backend/grades/README.md` - update

**Actions:**
- Create unit tests for models
- Create integration tests for API endpoints
- Create tests for management commands
- Create system usage documentation

**Estimated time:** 45 minutes

### ETAPAS 8: Database Migration and Deployment

**Files to modify:**
- `backend/grades/migrations/` - create migration
- `requirements.txt` - add additional packages if needed

**Actions:**
- Create database migration
- Add database indexes for performance
- Verify migration in development environment
- Prepare deployment instructions

**Estimated time:** 15 minutes

## TECHNICAL SPECIFICATIONS

### Database Schema
```sql
CREATE TABLE grades_studentattendancestats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    level_id INTEGER NOT NULL,
    total_lessons_assigned INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    attendance_present INTEGER DEFAULT 0,
    attendance_absent INTEGER DEFAULT 0,
    attendance_excused INTEGER DEFAULT 0,
    last_calculation DATETIME,
    calculation_date DATE,
    UNIQUE(student_id, subject_id, level_id)
);
```

### API Endpoints
- `GET /api/grades/student-stats/` - List all statistics with filtering
- `GET /api/grades/student-stats/{id}/` - Get specific statistics record
- `POST /api/grades/student-stats/recalculate/` - Trigger manual recalculation
- `GET /api/grades/student-stats/student/{student_id}/` - Get statistics for specific student

### Cron Job Configuration
```bash
# Execute at 02:00 AM daily
0 2 * * * cd /path/to/project && python manage.py calculate_attendance_stats --all
```

## CALCULATION LOGIC

### Planned Lessons Statistics
- Count all IMUPlan records for student + subject + level
- Set `total_lessons_assigned` to total count
- Set `lessons_completed` to 0 (not yet completed)
- Set attendance counts to 0

### Completed Lessons Statistics
- Filter IMUPlan records where `global_schedule.plan_status = 'completed'`
- Count by attendance_status:
  - `present` + `late` → `attendance_present`
  - `absent` → `attendance_absent`
  - `excused` → `attendance_excused`
- Set `lessons_completed` to completed count

### Data Aggregation
- Group by student, subject, and level combination
- Calculate totals across all IMUPlan records
- Update statistics table with calculated values
- Set `calculation_date` to current date

## ERROR HANDLING

### Calculation Errors
- Log all calculation errors with context
- Continue processing other students if one fails
- Provide detailed error messages for debugging
- Implement retry mechanism for failed calculations

### Data Validation
- Validate foreign key relationships
- Check for data consistency
- Handle missing or corrupted data gracefully
- Implement data integrity checks

## PERFORMANCE CONSIDERATIONS

### Database Optimization
- Add indexes on frequently queried fields
- Use bulk operations for mass updates
- Implement database connection pooling
- Monitor query performance

### Batch Processing
- Process students in chunks to avoid memory issues
- Implement progress tracking for long operations
- Use background tasks for heavy calculations
- Implement caching for frequently accessed data

## MONITORING AND LOGGING

### System Monitoring
- Track calculation execution time
- Monitor database performance
- Log system resource usage
- Alert on calculation failures

### Audit Trail
- Log all calculation operations
- Track data changes over time
- Maintain calculation history
- Provide rollback capabilities

## DEPLOYMENT CHECKLIST

### Pre-deployment
- [ ] All tests passing
- [ ] Database migration tested
- [ ] API endpoints verified
- [ ] Cron job configured
- [ ] Error handling implemented
- [ ] Logging configured

### Deployment Steps
1. Deploy backend changes
2. Run database migration
3. Configure cron job
4. Test API endpoints
5. Deploy frontend changes
6. Verify system functionality

### Post-deployment
- [ ] Monitor system performance
- [ ] Verify cron job execution
- [ ] Check error logs
- [ ] Validate data accuracy
- [ ] Monitor API response times

## MAINTENANCE AND UPDATES

### Regular Maintenance
- Monitor calculation performance
- Review and optimize queries
- Update calculation logic as needed
- Clean up old log files

### Future Enhancements
- Real-time statistics updates
- Advanced reporting features
- Data export capabilities
- Integration with external systems

## TOTAL IMPLEMENTATION TIME

**Estimated total time: 4 hours**

- Model creation: 30 min
- Calculation logic: 45 min
- Management commands: 30 min
- API endpoints: 45 min
- Cron job setup: 30 min
- Frontend integration: 60 min
- Testing and docs: 45 min
- Database migration: 15 min

## DEPENDENCIES

### Backend Dependencies
- Django 5.2.4+
- Django REST Framework 3.16.0+
- Existing apps: users, curriculum, plans, schedule

### Frontend Dependencies
- Next.js 15+
- React 19+
- Existing hooks and components

### System Requirements
- Cron job support
- Database with transaction support
- Sufficient disk space for logs
- Monitoring and alerting system

---

**Document created:** 2025-01-XX  
**Last updated:** 2025-01-XX  
**Status:** Planning Phase  
**Next step:** Awaiting implementation approval
