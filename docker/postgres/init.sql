-- /home/master/A-DIENYNAS/docker/postgres/init.sql
-- A-DIENYNAS PostgreSQL Initialization Script
-- CHANGE: Created PostgreSQL initialization script
-- PURPOSE: Database setup and initial configuration
-- UPDATES: Initial setup with database creation and user permissions

-- Create database if not exists
SELECT 'CREATE DATABASE a_dienynas'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'a_dienynas')\gexec

-- Connect to the database
\c a_dienynas;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Set timezone
SET timezone = 'Europe/Vilnius';

-- Create custom functions for audit logging
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function for soft delete
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    NEW.deleted_at = CURRENT_TIMESTAMP;
    NEW.is_active = FALSE;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Grant permissions to application user
GRANT ALL PRIVILEGES ON DATABASE a_dienynas TO a_dienynas_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO a_dienynas_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO a_dienynas_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO a_dienynas_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO a_dienynas_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO a_dienynas_user;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active) WHERE deleted_at IS NULL;

-- Log initialization completion
DO $$
BEGIN
    RAISE NOTICE 'A-DIENYNAS database initialization completed successfully!';
    RAISE NOTICE 'Database: a_dienynas';
    RAISE NOTICE 'User: a_dienynas_user';
    RAISE NOTICE 'Timezone: Europe/Vilnius';
END $$;

