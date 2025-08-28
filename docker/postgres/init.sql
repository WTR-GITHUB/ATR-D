-- docker/postgres/init.sql

-- PostgreSQL initialization script for A-DIENYNAS system
-- CHANGE: Created PostgreSQL initialization script for Docker container setup

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE a_dienynas'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'a_dienynas')\gexec

-- Connect to the database
\c a_dienynas;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Set timezone
SET timezone = 'UTC';

-- Create custom functions for educational system
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to calculate student progress
CREATE OR REPLACE FUNCTION calculate_student_progress(student_id INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    progress DECIMAL;
BEGIN
    -- Get total lessons for student
    SELECT COUNT(*) INTO total_lessons
    FROM curriculum_lesson cl
    JOIN curriculum_subjectlevel csl ON cl.subject_level_id = csl.id
    JOIN crm_student_subject_level ssl ON csl.id = ssl.subject_level_id
    WHERE ssl.student_id = calculate_student_progress.student_id;
    
    -- Get completed lessons
    SELECT COUNT(*) INTO completed_lessons
    FROM grades_attendance a
    JOIN curriculum_lesson cl ON a.lesson_id = cl.id
    JOIN curriculum_subjectlevel csl ON cl.subject_level_id = csl.id
    JOIN crm_student_subject_level ssl ON csl.id = ssl.subject_level_id
    WHERE ssl.student_id = calculate_student_progress.student_id
    AND a.status = 'present';
    
    -- Calculate progress percentage
    IF total_lessons > 0 THEN
        progress = (completed_lessons::DECIMAL / total_lessons::DECIMAL) * 100;
    ELSE
        progress = 0;
    END IF;
    
    RETURN ROUND(progress, 2);
END;
$$ LANGUAGE plpgsql;

-- Create function to get student statistics
CREATE OR REPLACE FUNCTION get_student_stats(student_id INTEGER)
RETURNS TABLE(
    total_subjects INTEGER,
    total_lessons INTEGER,
    attendance_rate DECIMAL,
    average_grade DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT ssl.subject_level_id)::INTEGER as total_subjects,
        COUNT(DISTINCT cl.id)::INTEGER as total_lessons,
        ROUND(
            (COUNT(CASE WHEN a.status = 'present' THEN 1 END)::DECIMAL / 
             COUNT(a.id)::DECIMAL) * 100, 2
        ) as attendance_rate,
        ROUND(AVG(g.grade), 2) as average_grade
    FROM crm_student_subject_level ssl
    LEFT JOIN curriculum_subjectlevel csl ON ssl.subject_level_id = csl.id
    LEFT JOIN curriculum_lesson cl ON csl.id = cl.subject_level_id
    LEFT JOIN grades_attendance a ON cl.id = a.lesson_id AND a.student_id = ssl.student_id
    LEFT JOIN grades_grade g ON cl.id = g.lesson_id AND g.student_id = ssl.student_id
    WHERE ssl.student_id = get_student_stats.student_id
    GROUP BY ssl.student_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_subject_level_student_id ON crm_student_subject_level(student_id);
CREATE INDEX IF NOT EXISTS idx_student_subject_level_subject_level_id ON crm_student_subject_level(subject_level_id);
CREATE INDEX IF NOT EXISTS idx_lesson_subject_level_id ON curriculum_lesson(subject_level_id);
CREATE INDEX IF NOT EXISTS idx_attendance_lesson_id ON grades_attendance(lesson_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON grades_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_grade_lesson_id ON grades_grade(lesson_id);
CREATE INDEX IF NOT EXISTS idx_grade_student_id ON grades_grade(student_id);

-- Create materialized view for student progress (refresh daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS student_progress_summary AS
SELECT 
    s.id as student_id,
    s.first_name,
    s.last_name,
    csl.subject_id,
    sub.name as subject_name,
    csl.level_id,
    l.name as level_name,
    COUNT(cl.id) as total_lessons,
    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as attended_lessons,
    ROUND(
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END)::DECIMAL / 
         COUNT(cl.id)::DECIMAL) * 100, 2
    ) as attendance_rate,
    ROUND(AVG(g.grade), 2) as average_grade,
    MAX(g.updated_at) as last_grade_date
FROM crm_student s
JOIN crm_student_subject_level ssl ON s.id = ssl.student_id
JOIN curriculum_subjectlevel csl ON ssl.subject_level_id = csl.id
JOIN curriculum_subject sub ON csl.subject_id = sub.id
JOIN curriculum_level l ON csl.level_id = l.id
LEFT JOIN curriculum_lesson cl ON csl.id = cl.subject_level_id
LEFT JOIN grades_attendance a ON cl.id = a.lesson_id AND a.student_id = s.id
LEFT JOIN grades_grade g ON cl.id = g.lesson_id AND g.student_id = s.id
GROUP BY s.id, s.first_name, s.last_name, csl.subject_id, sub.name, csl.level_id, l.name;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_student_progress_summary_student_id ON student_progress_summary(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_summary_subject_id ON student_progress_summary(subject_id);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_student_progress()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY student_progress_summary;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to application user
GRANT ALL PRIVILEGES ON DATABASE a_dienynas TO a_dienynas_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO a_dienynas_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO a_dienynas_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO a_dienynas_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO a_dienynas_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO a_dienynas_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO a_dienynas_user;

-- Create scheduled job to refresh materialized view (if pg_cron extension is available)
-- SELECT cron.schedule('refresh-student-progress', '0 2 * * *', 'SELECT refresh_student_progress();');

-- Log initialization completion
DO $$
BEGIN
    RAISE NOTICE 'A-DIENYNAS PostgreSQL database initialized successfully!';
    RAISE NOTICE 'Database: a_dienynas';
    RAISE NOTICE 'User: a_dienynas_user';
    RAISE NOTICE 'Extensions: uuid-ossp, pg_trgm, btree_gin';
    RAISE NOTICE 'Custom functions: update_updated_at_column, calculate_student_progress, get_student_stats';
    RAISE NOTICE 'Materialized view: student_progress_summary';
    RAISE NOTICE 'Performance indexes created';
END $$;
