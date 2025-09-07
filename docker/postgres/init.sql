-- A-DIENYNAS PostgreSQL Initialization Script
-- Creates database and user for A-DIENYNAS system

-- Create database
CREATE DATABASE a_dienynas;

-- Create user with correct password from .env
CREATE USER a_dienynas_user WITH PASSWORD 'P05Tgr355-+-5l4pt4z0d15';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE a_dienynas TO a_dienynas_user;

-- Connect to the database and grant schema privileges
\c a_dienynas;
GRANT ALL ON SCHEMA public TO a_dienynas_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO a_dienynas_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO a_dienynas_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO a_dienynas_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO a_dienynas_user;
