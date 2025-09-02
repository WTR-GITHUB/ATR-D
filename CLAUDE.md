# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**A-DIENYNAS** is a modern student diary and learning management system with a Django REST API backend and Next.js frontend. The system manages five user types: students, parents, curators, mentors, and administrators, providing comprehensive educational process management through Docker containerization.

## Architecture

### Backend (Django)
- **Location**: `/backend/`
- **Framework**: Django 5.2.4 with Django REST Framework
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: JWT tokens via django-simple-jwt
- **Apps**: `users`, `crm`, `schedule`, `curriculum`, `grades`, `plans`
- **Entry Point**: `backend/manage.py`
- **Settings**: `backend/core/settings.py`
- **Main URLs**: `backend/core/urls.py` with API endpoints at `/api/{app}/`

### Frontend (Next.js)
- **Location**: `/frontend/`
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **HTTP Client**: Axios
- **API Proxy**: `/api/:path*` → `http://localhost:8000/api/:path*`

### Infrastructure
- **Docker**: Multi-container setup with docker-compose.yml
- **Services**: PostgreSQL, Redis, Django backend, Next.js frontend, Nginx reverse proxy
- **Network**: Isolated Docker network (172.20.0.0/16)
- **Volumes**: Persistent data for database, Redis, static files, media files

## Development Commands

### Backend Development
```bash
# Django management commands (run in backend container or with proper Python environment)
python manage.py migrate                    # Run database migrations
python manage.py collectstatic --noinput    # Collect static files
python manage.py createsuperuser            # Create admin user
python manage.py runserver 0.0.0.0:8000    # Run development server
python manage.py shell                      # Django shell
python manage.py makemigrations             # Create new migrations

# Production deployment with Gunicorn
gunicorn core.wsgi:application --config gunicorn.conf.py

# Via Docker (recommended for development)
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py collectstatic --noinput
docker compose exec backend python manage.py createsuperuser

# Production deployment
DEBUG=False docker compose up -d            # Deploy with Gunicorn
DEBUG=True docker compose up -d             # Deploy with Django dev server
```

### Frontend Development
```bash
# In frontend directory or container
npm run dev           # Development server with Turbopack
npm run build         # Production build
npm run start         # Production server
npm run lint          # ESLint checks
```

### Docker Operations
```bash
# Full system deployment
docker compose up -d                        # Start all services
docker compose down                         # Stop all services
docker compose build --no-cache             # Rebuild all images
docker compose logs -f                      # View logs
docker compose ps                           # Check service status

# Individual service management
docker compose up -d postgres redis         # Start only database services
docker compose restart backend              # Restart specific service
docker compose exec backend bash            # Shell into container
```

### Deployment & Maintenance
```bash
# Deployment (automated scripts)
./scripts/deploy.sh                         # Full deployment
./scripts/backup.sh                         # Create system backup
./scripts/restore.sh <backup_date>          # Restore from backup
./scripts/maintenance.sh --all              # System maintenance
./scripts/setup-cron.sh                     # Setup automated tasks

# Health checks
curl http://localhost:8000/api/health/      # Backend health check
curl http://localhost:3000/                 # Frontend health check
curl http://localhost/                      # Nginx proxy check
```

## Key Configuration Files

### Environment Configuration
- `env.docker` - Docker environment variables (database credentials, API keys)
- `backend/core/settings.py` - Django settings with environment variable integration
- `frontend/next.config.js` - Next.js configuration with API proxy

### Docker Configuration
- `docker-compose.yml` - Main orchestration file
- `docker/backend/Dockerfile` - Backend container (Python 3.12 + Gunicorn)
- `docker/frontend/Dockerfile` - Frontend container definition  
- `docker/nginx/` - Nginx reverse proxy configuration
- `docker/postgres/init.sql` - Database initialization
- `requirements.txt` - Python dependencies (includes Gunicorn 21.2.0)

### Application Structure
```
backend/
├── core/           # Django project configuration
│   ├── settings.py # Django settings
│   ├── urls.py     # URL routing
│   └── wsgi.py     # WSGI application
├── users/          # User management
├── crm/           # Customer relationship management
├── schedule/      # Timetable management
├── curriculum/    # Educational content
├── grades/        # Grade management
├── plans/         # Educational planning
├── gunicorn.conf.py # Gunicorn production configuration
├── entrypoint.sh   # Container startup script
└── manage.py      # Django CLI entry point

frontend/
├── src/app/       # Next.js App Router pages
├── src/components/# Reusable UI components
├── src/lib/       # Utility functions and configurations
├── public/        # Static assets
└── package.json   # Dependencies and scripts
```

## Data Models & Relationships

The system implements complex educational data modeling with:
- **Users**: Custom user model with role-based permissions
- **Students/Parents**: Hierarchical relationships
- **Mentors**: Subject teaching assignments
- **Curriculum**: Competencies, skills, virtues, lessons structure
- **Schedule**: Period-based timetable system
- **Grades**: Achievement levels and progress tracking
- **Plans**: Individual educational plan management

## Common Development Tasks

### Adding New Features
1. Backend: Create/modify models in appropriate app, run `makemigrations` and `migrate`
2. Frontend: Add components in `src/components/`, pages in `src/app/`
3. API Integration: Use Axios client with proxy configuration to connect frontend to backend
4. Test changes using Docker Compose development environment

### Database Operations
- Database migrations are automatically run during container startup via entrypoint scripts
- Use Django ORM for database operations
- PostgreSQL is used in production, SQLite for local development
- Database backups are automated via `scripts/backup.sh`

### Debugging & Monitoring
- Application logs: `./logs/backend/`, `./logs/frontend/`, `./logs/nginx/`
- Container logs: `docker compose logs <service-name>`
- Health check endpoints available for all services
- Maintenance scripts provide system status and resource monitoring

## Security Considerations

- JWT authentication with configurable token expiration
- CORS properly configured for frontend-backend communication
- Environment variables for sensitive configuration
- Docker network isolation
- Rate limiting and security headers via Nginx
- Non-root container execution for security

## Production Deployment with Gunicorn

### WSGI Server Configuration
The backend uses **Gunicorn** as the production WSGI server for optimal performance and reliability:

#### Gunicorn Features
- **Multi-worker processing**: `workers = CPU cores * 2 + 1`
- **Connection handling**: 1000 concurrent connections per worker
- **Request limits**: 1000 requests per worker with jitter
- **Timeouts**: 30-second request timeout, 2-second keepalive
- **Logging**: Structured access and error logs
- **Process management**: Automatic worker restart and preload

#### Configuration Files
- `backend/gunicorn.conf.py` - Production server configuration
- `backend/entrypoint.sh` - Smart startup script (dev vs prod)
- `backend/core/wsgi.py` - Django WSGI application

#### Environment-based Deployment
```bash
# Development mode (Django dev server)
DEBUG=True docker compose up -d

# Production mode (Gunicorn)
DEBUG=False docker compose up -d
```

#### Production Monitoring
- **Access logs**: `/app/logs/gunicorn-access.log`
- **Error logs**: `/app/logs/gunicorn-error.log`
- **Health checks**: Automated container health monitoring
- **Process info**: PID file at `/tmp/gunicorn.pid`

#### Performance Optimization
- **Worker management**: Automatic scaling based on CPU cores
- **Memory efficiency**: Preload application for reduced memory usage
- **Connection pooling**: Persistent database connections
- **Static file serving**: Offloaded to Nginx for better performance

## Notes for Development

- The system uses PostgreSQL in production but can fall back to SQLite for local development
- Static files are served by Nginx in production, handled by Django in development
- **Backend deployment**: Automatically switches between Django dev server and Gunicorn based on DEBUG setting
- The project includes comprehensive backup and restore mechanisms
- All deployment operations are automated through shell scripts
- Health checks are implemented for all services to ensure system reliability
- **Gunicorn integration**: Production-ready WSGI server with optimal configuration for containerized deployment