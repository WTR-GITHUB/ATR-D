#!/bin/bash
# /home/master/A-DIENYNAS/scripts/deploy.sh
# A-DIENYNAS Deployment Script
# CHANGE: Created deployment script for system deployment
# PURPOSE: Automated deployment of A-DIENYNAS system
# UPDATES: Initial setup with health checks and error handling

set -e

# Configuration
PROJECT_NAME="A-DIENYNAS"
LOG_FILE="./logs/deploy.log"
HEALTH_CHECK_TIMEOUT=120
WAIT_INTERVAL=5

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check Docker version
    DOCKER_VERSION=$(docker --version)
    log "✅ Docker: $DOCKER_VERSION"
    
    # Check Docker Compose version
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        log "✅ Docker Compose: $COMPOSE_VERSION"
    elif docker compose version &> /dev/null; then
        COMPOSE_VERSION=$(docker compose version)
        log "✅ Docker Compose: $COMPOSE_VERSION"
    else
        error "Docker Compose is not installed."
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f "env.docker" ]; then
        error "Environment file 'env.docker' not found. Please create it first."
        exit 1
    fi
    
    log "✅ Prerequisites check passed"
}

# Create necessary directories
create_directories() {
    log "📁 Creating necessary directories..."
    
    mkdir -p logs/nginx
    mkdir -p logs/backend
    mkdir -p logs/frontend
    mkdir -p backups/database
    mkdir -p backups/uploads
    mkdir -p backups/logs
    mkdir -p backups/redis
    mkdir -p backups/config
    
    log "✅ Directories created successfully"
}

# Set file permissions
set_permissions() {
    log "🔐 Setting file permissions..."
    
    # Set environment file permissions
    chmod 600 env.docker
    
    # Set script permissions
    chmod +x scripts/*.sh
    
    # Set nginx config permissions
    chmod 644 docker/nginx/sites-enabled/*
    
    log "✅ Permissions set successfully"
}

# Stop existing containers
stop_containers() {
    log "🛑 Stopping existing containers..."
    
    if docker compose ps | grep -q "Up"; then
        docker compose down
        log "✅ Existing containers stopped"
    else
        log "ℹ️  No running containers found"
    fi
}

# Build Docker images
build_images() {
    log "🔨 Building Docker images..."
    
    # Build all images with no cache
    if docker compose build --no-cache; then
        log "✅ Docker images built successfully"
    else
        error "Failed to build Docker images"
        exit 1
    fi
}

# Start containers
start_containers() {
    log "🚀 Starting containers..."
    
    # Start containers in detached mode
    if docker compose up -d; then
        log "✅ Containers started successfully"
    else
        error "Failed to start containers"
        exit 1
    fi
}

# Wait for services to be ready
wait_for_services() {
    log "⏳ Waiting for services to be ready..."
    
    local timeout=$HEALTH_CHECK_TIMEOUT
    local elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        # Check if all containers are running
        if docker compose ps | grep -q "Up" && ! docker compose ps | grep -q "Exit\|Error"; then
            log "✅ All containers are running"
            break
        fi
        
        # Check for failed containers
        if docker compose ps | grep -q "Exit\|Error"; then
            error "Some containers failed to start"
            docker compose logs
            exit 1
        fi
        
        log "⏳ Waiting for containers to be ready... ($elapsed/$timeout seconds)"
        sleep $WAIT_INTERVAL
        elapsed=$((elapsed + WAIT_INTERVAL))
    done
    
    if [ $elapsed -ge $timeout ]; then
        error "Timeout waiting for services to be ready"
        docker compose logs
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    log "🗄️ Running database migrations..."
    
    # Wait a bit more for database to be fully ready
    sleep 10
    
    if docker compose exec -T backend python manage.py migrate --noinput; then
        log "✅ Database migrations completed"
    else
        error "Database migrations failed"
        docker compose logs backend
        exit 1
    fi
}

# Create superuser
create_superuser() {
    log "👤 Creating superuser..."
    
    # Check if superuser already exists
    if docker compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if User.objects.filter(is_superuser=True).exists():
    print('Superuser already exists')
    exit(0)
else:
    exit(1)
"; then
        log "ℹ️  Superuser already exists"
    else
        # Create superuser
        if docker compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
print('Superuser created: admin/admin123')
"; then
            log "✅ Superuser created successfully"
            log "👤 Username: admin"
            log "🔑 Password: admin123"
            log "📧 Email: admin@example.com"
        else
            warn "Failed to create superuser"
        fi
    fi
}

# Collect static files
collect_static() {
    log "📦 Collecting static files..."
    
    if docker compose exec -T backend python manage.py collectstatic --noinput; then
        log "✅ Static files collected successfully"
    else
        error "Failed to collect static files"
        exit 1
    fi
}

# Health check
health_check() {
    log "🏥 Performing health check..."
    
    # Check container status
    log "📊 Container status:"
    docker compose ps
    
    # Check service health
    local services=("postgres" "redis" "backend" "frontend" "nginx")
    
    for service in "${services[@]}"; do
        if docker compose ps "$service" | grep -q "Up"; then
            log "✅ $service is running"
        else
            error "$service is not running"
            return 1
        fi
    done
    
    # Test backend API
    log "🔍 Testing backend API..."
    if curl -f http://localhost:8000/api/health/ > /dev/null 2>&1; then
        log "✅ Backend API is responding"
    else
        warn "Backend API health check failed"
    fi
    
    # Test frontend
    log "🔍 Testing frontend..."
    if curl -f http://localhost:3000/ > /dev/null 2>&1; then
        log "✅ Frontend is responding"
    else
        warn "Frontend health check failed"
    fi
    
    # Test nginx proxy
    log "🔍 Testing nginx proxy..."
    if curl -f http://localhost/ > /dev/null 2>&1; then
        log "✅ Nginx proxy is working"
    else
        warn "Nginx proxy health check failed"
    fi
    
    log "✅ Health check completed"
}

# Show deployment summary
show_summary() {
    log "🎉 Deployment completed successfully!"
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}    A-DIENYNAS DEPLOYMENT      ${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo -e "${BLUE}🌐 Frontend:${NC} http://localhost:3000"
    echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:8000"
    echo -e "${BLUE}🗄️  Database:${NC} localhost:5432"
    echo -e "${BLUE}🔴 Redis:${NC} localhost:6379"
    echo -e "${BLUE}🌍 Nginx Proxy:${NC} http://localhost"
    echo ""
    echo -e "${BLUE}👤 Admin Access:${NC}"
    echo -e "   Username: admin"
    echo -e "   Password: admin123"
    echo -e "   Email: admin@example.com"
    echo ""
    echo -e "${BLUE}📁 Logs:${NC} ./logs/"
    echo -e "${BLUE}💾 Backups:${NC} ./backups/"
    echo ""
    echo -e "${BLUE}🔧 Useful Commands:${NC}"
    echo -e "   View logs: docker compose logs -f"
    echo -e "   Stop: docker compose down"
    echo -e "   Restart: docker compose restart"
    echo -e "   Backup: ./scripts/backup.sh"
    echo -e "   Restore: ./scripts/restore.sh"
    echo ""
}

# Main deployment function
main() {
    log "🚀 Starting $PROJECT_NAME deployment..."
    
    # Create log directory
    mkdir -p logs
    
    # Log deployment start
    echo "$(date): Deployment started" >> "$LOG_FILE"
    
    # Run deployment steps
    check_prerequisites
    create_directories
    set_permissions
    stop_containers
    build_images
    start_containers
    wait_for_services
    run_migrations
    create_superuser
    collect_static
    health_check
    
    # Show summary
    show_summary
    
    # Log deployment completion
    echo "$(date): Deployment completed successfully" >> "$LOG_FILE"
    
    log "✅ Deployment completed successfully!"
}

# Run main function
main "$@"

