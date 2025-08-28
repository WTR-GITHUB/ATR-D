#!/bin/bash
# scripts/deploy.sh

# A-DIENYNAS Docker deployment script
# CHANGE: Created deployment script for Docker container management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Check if Docker is running
check_docker() {
    log "Checking Docker status..."
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker first."
        exit 1
    fi
    success "Docker is running"
}

# Check if Docker Compose is available
check_docker_compose() {
    log "Checking Docker Compose..."
    if ! docker compose version > /dev/null 2>&1; then
        error "Docker Compose is not available. Please install Docker Compose first."
        exit 1
    fi
    success "Docker Compose is available"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p logs/nginx
    mkdir -p backups/database
    mkdir -p backups/uploads
    mkdir -p backups/logs
    mkdir -p docker/nginx/ssl
    
    success "Directories created successfully"
}

# Set proper permissions
set_permissions() {
    log "Setting proper permissions..."
    
    if [ -f ".env.docker" ]; then
        chmod 600 .env.docker
        success "Environment file permissions set"
    else
        warning "No .env.docker file found. Please create one based on .env.docker.example"
    fi
    
    chmod 755 scripts/*.sh
    chmod 644 docker/nginx/sites-enabled/*
    
    success "Permissions set successfully"
}

# Stop existing containers
stop_containers() {
    log "Stopping existing containers..."
    
    if docker compose ps --quiet | grep -q .; then
        docker compose down
        success "Existing containers stopped"
    else
        log "No running containers found"
    fi
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    docker compose build --no-cache
    
    if [ $? -eq 0 ]; then
        success "Docker images built successfully"
    else
        error "Failed to build Docker images"
        exit 1
    fi
}

# Start containers
start_containers() {
    log "Starting containers..."
    
    docker compose up -d
    
    if [ $? -eq 0 ]; then
        success "Containers started successfully"
    else
        error "Failed to start containers"
        exit 1
    fi
}

# Wait for containers to be ready
wait_for_containers() {
    log "Waiting for containers to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker compose ps | grep -q "Up"; then
            success "Containers are ready"
            return 0
        fi
        
        log "Waiting for containers... (attempt $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    error "Containers failed to start within expected time"
    docker compose logs
    exit 1
}

# Check container status
check_container_status() {
    log "Checking container status..."
    
    docker compose ps
    
    # Check if all containers are running
    local running_containers=$(docker compose ps --filter "status=running" --quiet | wc -l)
    local total_containers=$(docker compose ps --quiet | wc -l)
    
    if [ "$running_containers" -eq "$total_containers" ]; then
        success "All containers are running"
    else
        error "Some containers are not running properly"
        docker compose logs
        exit 1
    fi
}

# Run Django migrations
run_migrations() {
    log "Running Django migrations..."
    
    if docker compose exec -T backend python manage.py migrate; then
        success "Migrations completed successfully"
    else
        error "Failed to run migrations"
        exit 1
    fi
}

# Create superuser if needed
create_superuser() {
    log "Checking if superuser exists..."
    
    if docker compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    print('Creating superuser...')
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists.')
"; then
        success "Superuser check completed"
    else
        warning "Failed to check/create superuser"
    fi
}

# Collect static files
collect_static() {
    log "Collecting static files..."
    
    if docker compose exec -T backend python manage.py collectstatic --noinput; then
        success "Static files collected successfully"
    else
        error "Failed to collect static files"
        exit 1
    fi
}

# Test API endpoints
test_api() {
    log "Testing API endpoints..."
    
    # Wait a bit more for services to be fully ready
    sleep 5
    
    # Test backend health
    if curl -f http://localhost:8000/api/ > /dev/null 2>&1; then
        success "Backend API is responding"
    else
        warning "Backend API is not responding yet"
    fi
    
    # Test frontend
    if curl -f http://localhost:3000/ > /dev/null 2>&1; then
        success "Frontend is responding"
    else
        warning "Frontend is not responding yet"
    fi
    
    # Test nginx proxy
    if curl -f http://localhost/ > /dev/null 2>&1; then
        success "Nginx proxy is working"
    else
        warning "Nginx proxy is not working yet"
    fi
}

# Display deployment summary
show_summary() {
    echo ""
    echo "=========================================="
    echo "           DEPLOYMENT SUMMARY"
    echo "=========================================="
    echo ""
    echo "🌐 Frontend:     http://localhost:3000"
    echo "🔧 Backend API:  http://localhost:8000"
    echo "🗄️ Database:     localhost:5432"
    echo "📡 Nginx Proxy:  http://localhost"
    echo ""
    echo "📊 Container Status:"
    docker compose ps
    echo ""
    echo "📝 Recent Logs:"
    docker compose logs --tail=10
    echo ""
    echo "✅ Deployment completed successfully!"
    echo ""
    echo "🔧 Useful commands:"
    echo "  View logs:     docker compose logs -f"
    echo "  Stop:          docker compose down"
    echo "  Restart:       docker compose restart"
    echo "  Status:        docker compose ps"
    echo "  Shell:         docker compose exec backend python manage.py shell"
    echo ""
}

# Main deployment function
main() {
    echo "🚀 Starting A-DIENYNAS Docker deployment..."
    echo ""
    
    check_docker
    check_docker_compose
    create_directories
    set_permissions
    stop_containers
    build_images
    start_containers
    wait_for_containers
    check_container_status
    run_migrations
    create_superuser
    collect_static
    test_api
    show_summary
}

# Run main function
main "$@"
