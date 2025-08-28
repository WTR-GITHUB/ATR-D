#!/bin/bash

# /home/master/A-DIENYNAS/scripts/deploy-from-github.sh
# A-DIENYNAS GitHub Deployment Script
# CHANGE: Created automated deployment script for GitHub deployments
# PURPOSE: Automate the deployment process from GitHub
# UPDATES: Initial setup with full deployment automation

set -e  # Stop on any error

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

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Configuration
PROJECT_DIR="/home/master/A-DIENYNAS"
CODE_DIR="/home/master/a-dienynas-code"
GITHUB_REPO="https://github.com/[USERNAME]/a-dienynas.git"
BRANCH="main"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command_exists docker; then
        error "Docker is not installed!"
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        error "Docker Compose is not installed!"
        exit 1
    fi
    
    if ! command_exists git; then
        error "Git is not installed!"
        exit 1
    fi
    
    success "All prerequisites are met"
}

# Function to backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    if [ -d "$PROJECT_DIR" ]; then
        BACKUP_DIR="/home/master/A-DIENYNAS-BACKUP-$(date +%Y%m%d-%H%M%S)"
        log "Backing up to: $BACKUP_DIR"
        cp -r "$PROJECT_DIR" "$BACKUP_DIR"
        success "Backup created: $BACKUP_DIR"
    else
        warning "No existing deployment to backup"
    fi
}

# Function to clone/update from GitHub
update_from_github() {
    log "Updating from GitHub..."
    
    # Update code directory (not Docker config)
    if [ -d "$CODE_DIR" ]; then
        log "Existing code found, updating from GitHub..."
        cd "$CODE_DIR"
        
        # Check if it's a git repository
        if [ ! -d .git ]; then
            log "Initializing git repository..."
            git init
            git remote add origin "$GITHUB_REPO"
        fi
        
        # Check for changes
        if git diff-index --quiet HEAD -- 2>/dev/null; then
            log "No local changes detected"
        else
            warning "Local changes detected, stashing them..."
            git stash
        fi
        
        # Pull latest changes
        git fetch origin
        git reset --hard origin/$BRANCH
        success "Code updated from GitHub"
    else
        log "Cloning new code from GitHub..."
        cd /home/master
        git clone "$GITHUB_REPO" a-dienynas-code
        success "Code cloned from GitHub"
    fi
    
    # Update symbolic link in Docker directory
    log "Updating symbolic link..."
    cd "$PROJECT_DIR"
    
    # Remove old symbolic link if exists
    if [ -L frontend ]; then
        rm frontend
    fi
    
    # Create new symbolic link
    ln -s ../a-dienynas-code/frontend ./frontend
    success "Symbolic link updated"
}

# Function to setup environment
setup_environment() {
    log "Setting up environment..."
    
    cd "$PROJECT_DIR"
    
    # Make scripts executable
    chmod +x scripts/*.sh
    
    # Setup environment variables if needed
    if [ ! -f .env ] && [ -f .env.example ]; then
        log "Setting up environment variables..."
        cp .env.example .env
        warning "Please edit .env file with your configuration"
    fi
    
    # Create necessary directories
    mkdir -p logs/nginx logs/backend logs/frontend
    mkdir -p backups/database backups/uploads
    
    success "Environment setup completed"
}

# Function to stop existing services
stop_services() {
    log "Stopping existing services..."
    
    cd "$PROJECT_DIR"
    
    if docker compose ps | grep -q "Up"; then
        log "Stopping running containers..."
        docker compose down
        success "Services stopped"
    else
        log "No running services found"
    fi
}

# Function to build Docker images
build_images() {
    log "Building Docker images..."
    
    cd "$PROJECT_DIR"
    
    # Build all services
    log "Building backend..."
    docker compose build --no-cache backend
    
    log "Building frontend..."
    docker compose build --no-cache frontend
    
    log "Building nginx..."
    docker compose build --no-cache nginx
    
    success "All Docker images built successfully"
}

# Function to start services
start_services() {
    log "Starting services..."
    
    cd "$PROJECT_DIR"
    
    # Start all services
    docker compose up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check service status
    if docker compose ps | grep -q "healthy"; then
        success "Services started successfully"
    else
        warning "Some services may not be healthy yet"
    fi
}

# Function to verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    cd "$PROJECT_DIR"
    
    # Check container status
    log "Container status:"
    docker compose ps
    
    # Test endpoints
    log "Testing endpoints..."
    
    # Test backend
    if curl -s http://localhost:8000/api/health/ > /dev/null; then
        success "Backend is responding"
    else
        error "Backend is not responding"
    fi
    
    # Test frontend
    if curl -s http://localhost:3000 > /dev/null; then
        success "Frontend is responding"
    else
        error "Frontend is not responding"
    fi
    
    # Test nginx
    if curl -s http://localhost:80 > /dev/null; then
        success "Nginx is responding"
    else
        error "Nginx is not responding"
    fi
    
    # Check ports
    log "Checking open ports..."
    ss -tlnp | grep -E ":(80|3000|8000)" || warning "Some ports may not be open"
}

# Function to setup firewall
setup_firewall() {
    log "Setting up firewall..."
    
    # Check UFW status
    if command_exists ufw; then
        if sudo ufw status | grep -q "Status: active"; then
            log "UFW is active, configuring ports..."
            
            # Allow necessary ports
            sudo ufw allow 80/tcp
            sudo ufw allow 3000/tcp
            sudo ufw allow 8000/tcp
            
            success "Firewall configured"
        else
            log "UFW is not active"
        fi
    else
        warning "UFW not found, please configure firewall manually"
    fi
}

# Function to show deployment info
show_deployment_info() {
    log "Deployment completed successfully!"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Frontend: http://$(hostname -I | awk '{print $1}'):80"
    echo "   Backend:  http://$(hostname -I | awk '{print $1}'):8000"
    echo ""
    echo "🔑 Admin Login:"
    echo "   Email: admin@example.com"
    echo "   Password: admin123"
    echo ""
    echo "📊 Service Status:"
    docker compose ps
    echo ""
    echo "📝 Logs:"
    echo "   docker compose logs -f"
}

# Main deployment function
main() {
    log "Starting A-DIENYNAS deployment from GitHub..."
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Backup current deployment
    backup_current
    
    # Update from GitHub
    update_from_github
    
    # Setup environment
    setup_environment
    
    # Stop existing services
    stop_services
    
    # Build images
    build_images
    
    # Start services
    start_services
    
    # Setup firewall
    setup_firewall
    
    # Verify deployment
    verify_deployment
    
    # Show deployment info
    show_deployment_info
    
    success "Deployment completed successfully!"
}

# Run main function
main "$@"
