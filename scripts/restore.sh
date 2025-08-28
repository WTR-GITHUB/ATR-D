#!/bin/bash
# scripts/restore.sh

# A-DIENYNAS Docker restore script
# CHANGE: Created restore script for restoring from backups

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
RESTORE_DATE=""

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

# Check if backup date is provided
if [ $# -eq 0 ]; then
    echo "❌ Usage: $0 <backup_date>"
    echo "Example: $0 20250101_120000"
    echo ""
    echo "Available backups:"
    if [ -d "$BACKUP_DIR/database" ]; then
        echo "Database backups:"
        ls -la "$BACKUP_DIR/database"/*.sql.gz 2>/dev/null | awk '{print $9}' | sed 's/.*backup_//' | sed 's/\.sql\.gz//' | sort -r
    fi
    if [ -d "$BACKUP_DIR/uploads" ]; then
        echo "Uploads backups:"
        ls -la "$BACKUP_DIR/uploads"/*.tar.gz 2>/dev/null | awk '{print $9}' | sed 's/.*backup_//' | sed 's/\.tar\.gz//' | sort -r
    fi
    exit 1
fi

RESTORE_DATE=$1

# Check if Docker is running
check_docker() {
    log "Checking Docker status..."
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker first."
        exit 1
    fi
    success "Docker is running"
}

# Check if containers are running
check_containers() {
    log "Checking container status..."
    
    if ! docker compose ps --quiet | grep -q .; then
        error "No containers are running. Please start the application first."
        exit 1
    fi
    
    success "Containers are running"
}

# Check if backup files exist
check_backup_files() {
    log "Checking backup files for date: $RESTORE_DATE"
    
    local missing_files=()
    
    # Check database backup
    if [ ! -f "$BACKUP_DIR/database/backup_$RESTORE_DATE.sql.gz" ]; then
        missing_files+=("Database backup: backup_$RESTORE_DATE.sql.gz")
    fi
    
    # Check uploads backup
    if [ ! -f "$BACKUP_DIR/uploads/backup_$RESTORE_DATE.tar.gz" ]; then
        missing_files+=("Uploads backup: backup_$RESTORE_DATE.tar.gz")
    fi
    
    # Check logs backup
    if [ ! -f "$BACKUP_DIR/logs/backup_$RESTORE_DATE.tar.gz" ]; then
        missing_files+=("Logs backup: backup_$RESTORE_DATE.tar.gz")
    fi
    
    # Check configs backup
    if [ ! -f "$BACKUP_DIR/configs/backup_$RESTORE_DATE.tar.gz" ]; then
        missing_files+=("Configs backup: backup_$RESTORE_DATE.tar.gz")
    fi
    
    # Check volumes backup
    if [ ! -f "$BACKUP_DIR/volumes/backup_$RESTORE_DATE.tar.gz" ]; then
        missing_files+=("Volumes backup: backup_$RESTORE_DATE.tar.gz")
    fi
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        warning "Some backup files are missing:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        echo ""
        read -p "Do you want to continue with available backups? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Restore cancelled by user"
            exit 1
        fi
    fi
    
    success "Backup files check completed"
}

# Create backup before restore
create_pre_restore_backup() {
    log "Creating backup before restore..."
    
    local pre_restore_date=$(date +%Y%m%d_%H%M%S)
    local pre_restore_dir="$BACKUP_DIR/pre_restore_$RESTORE_DATE"
    
    mkdir -p "$pre_restore_dir"
    
    # Database backup
    if docker compose exec -T postgres pg_dump -U a_dienynas_user a_dienynas > "$pre_restore_dir/backup_$pre_restore_date.sql" 2>/dev/null; then
        gzip "$pre_restore_dir/backup_$pre_restore_date.sql"
        success "Pre-restore database backup created: backup_$pre_restore_date.sql.gz"
    else
        warning "Failed to create pre-restore database backup"
    fi
    
    # Uploads backup
    if [ -d "./media" ] && [ "$(ls -A ./media)" ]; then
        if tar -czf "$pre_restore_dir/backup_$pre_restore_date.tar.gz" -C . media/; then
            success "Pre-restore uploads backup created: backup_$pre_restore_date.tar.gz"
        else
            warning "Failed to create pre-restore uploads backup"
        fi
    fi
    
    success "Pre-restore backup completed"
}

# Stop applications
stop_applications() {
    log "Stopping applications..."
    
    docker compose stop backend frontend
    
    if [ $? -eq 0 ]; then
        success "Applications stopped successfully"
    else
        error "Failed to stop applications"
        exit 1
    fi
}

# Restore database
restore_database() {
    log "Restoring database from backup: $RESTORE_DATE"
    
    local db_backup_file="$BACKUP_DIR/database/backup_$RESTORE_DATE.sql.gz"
    
    if [ -f "$db_backup_file" ]; then
        # Decompress and restore
        if gunzip -c "$db_backup_file" | docker compose exec -T postgres psql -U a_dienynas_user -d a_dienynas; then
            success "Database restored successfully from: $db_backup_file"
        else
            error "Failed to restore database"
            exit 1
        fi
    else
        warning "Database backup file not found: $db_backup_file"
    fi
}

# Restore uploads
restore_uploads() {
    log "Restoring uploads from backup: $RESTORE_DATE"
    
    local uploads_backup_file="$BACKUP_DIR/uploads/backup_$RESTORE_DATE.tar.gz"
    
    if [ -f "$uploads_backup_file" ]; then
        # Remove existing media directory
        if [ -d "./media" ]; then
            rm -rf ./media
            log "Removed existing media directory"
        fi
        
        # Restore from backup
        if tar -xzf "$uploads_backup_file"; then
            success "Uploads restored successfully from: $uploads_backup_file"
        else
            error "Failed to restore uploads"
            exit 1
        fi
    else
        warning "Uploads backup file not found: $uploads_backup_file"
    fi
}

# Restore logs
restore_logs() {
    log "Restoring logs from backup: $RESTORE_DATE"
    
    local logs_backup_file="$BACKUP_DIR/logs/backup_$RESTORE_DATE.tar.gz"
    
    if [ -f "$logs_backup_file" ]; then
        # Remove existing logs directory
        if [ -d "./logs" ]; then
            rm -rf ./logs
            log "Removed existing logs directory"
        fi
        
        # Restore from backup
        if tar -xzf "$logs_backup_file"; then
            success "Logs restored successfully from: $logs_backup_file"
        else
            error "Failed to restore logs"
            exit 1
        fi
    else
        warning "Logs backup file not found: $logs_backup_file"
    fi
}

# Restore configurations
restore_configs() {
    log "Restoring configurations from backup: $RESTORE_DATE"
    
    local configs_backup_file="$BACKUP_DIR/configs/backup_$RESTORE_DATE.tar.gz"
    
    if [ -f "$configs_backup_file" ]; then
        # Create temporary directory for extraction
        local temp_config_dir="/tmp/a-dienynas-configs-restore-$RESTORE_DATE"
        mkdir -p "$temp_config_dir"
        
        # Extract configurations
        if tar -xzf "$configs_backup_file" -C "$temp_config_dir"; then
            # Restore specific config files
            if [ -f "$temp_config_dir/.env.docker" ]; then
                cp "$temp_config_dir/.env.docker" .env.docker.restored
                log "Environment file restored to .env.docker.restored"
            fi
            
            if [ -f "$temp_config_dir/docker-compose.yml" ]; then
                cp "$temp_config_dir/docker-compose.yml" docker-compose.yml.restored
                log "Docker Compose file restored to docker-compose.yml.restored"
            fi
            
            if [ -d "$temp_config_dir/docker" ]; then
                cp -r "$temp_config_dir/docker" docker.restored
                log "Docker configurations restored to docker.restored/"
            fi
            
            success "Configurations restored successfully from: $configs_backup_file"
        else
            error "Failed to restore configurations"
            exit 1
        fi
        
        # Clean up temporary directory
        rm -rf "$temp_config_dir"
    else
        warning "Configurations backup file not found: $configs_backup_file"
    fi
}

# Restore volumes
restore_volumes() {
    log "Restoring volumes from backup: $RESTORE_DATE"
    
    local volumes_backup_file="$BACKUP_DIR/volumes/backup_$RESTORE_DATE.tar.gz"
    
    if [ -f "$volumes_backup_file" ]; then
        # Create temporary directory for extraction
        local temp_volume_dir="/tmp/a-dienynas-volumes-restore-$RESTORE_DATE"
        mkdir -p "$temp_volume_dir"
        
        # Extract volumes
        if tar -xzf "$volumes_backup_file" -C "$temp_volume_dir"; then
            # Get list of volumes
            local volumes=$(docker volume ls --format "{{.Name}}" | grep "a-dienynas")
            
            if [ -n "$volumes" ]; then
                for volume in $volumes; do
                    if [ -d "$temp_volume_dir/$volume" ]; then
                        log "Restoring volume: $volume"
                        
                        # Use docker run to restore volume data
                        docker run --rm -v "$volume:/data" -v "$temp_volume_dir/$volume:/backup" \
                            alpine sh -c "rm -rf /data/* && tar -xzf /backup/data.tar.gz -C /data"
                    fi
                done
                
                success "Volumes restored successfully from: $volumes_backup_file"
            else
                warning "No Docker volumes found to restore"
            fi
        else
            error "Failed to restore volumes"
            exit 1
        fi
        
        # Clean up temporary directory
        rm -rf "$temp_volume_dir"
    else
        warning "Volumes backup file not found: $volumes_backup_file"
    fi
}

# Start applications
start_applications() {
    log "Starting applications..."
    
    docker compose start backend frontend
    
    if [ $? -eq 0 ]; then
        success "Applications started successfully"
    else
        error "Failed to start applications"
        exit 1
    fi
}

# Wait for applications to be ready
wait_for_applications() {
    log "Waiting for applications to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker compose ps | grep -q "Up"; then
            success "Applications are ready"
            return 0
        fi
        
        log "Waiting for applications... (attempt $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    error "Applications failed to start within expected time"
    docker compose logs
    exit 1
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

# Test applications
test_applications() {
    log "Testing applications..."
    
    # Wait a bit for services to be fully ready
    sleep 10
    
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

# Display restore summary
show_summary() {
    echo ""
    echo "=========================================="
    echo "           RESTORE SUMMARY"
    echo "=========================================="
    echo ""
    echo "🔄 Restore completed from backup: $RESTORE_DATE"
    echo "📁 Backup location: $BACKUP_DIR"
    echo "📅 Restore date: $(date)"
    echo ""
    echo "📦 Restored components:"
    echo "  🗄️ Database: $(if [ -f "$BACKUP_DIR/database/backup_$RESTORE_DATE.sql.gz" ]; then echo "✅"; else echo "❌"; fi)"
    echo "  📁 Uploads: $(if [ -f "$BACKUP_DIR/uploads/backup_$RESTORE_DATE.tar.gz" ]; then echo "✅"; else echo "❌"; fi)"
    echo "  📝 Logs: $(if [ -f "$BACKUP_DIR/logs/backup_$RESTORE_DATE.tar.gz" ]; then echo "✅"; else echo "❌"; fi)"
    echo "  ⚙️ Configs: $(if [ -f "$BACKUP_DIR/configs/backup_$RESTORE_DATE.tar.gz" ]; then echo "✅"; else echo "❌"; fi)"
    echo "  💾 Volumes: $(if [ -f "$BACKUP_DIR/volumes/backup_$RESTORE_DATE.tar.gz" ]; then echo "✅"; else echo "❌"; fi)"
    echo ""
    echo "📊 Container Status:"
    docker compose ps
    echo ""
    echo "✅ Restore completed successfully!"
    echo ""
    echo "🔧 Next steps:"
    echo "  1. Verify all data is restored correctly"
    echo "  2. Test application functionality"
    echo "  3. Update any configuration files if needed"
    echo "  4. Remove .restored files if everything works"
    echo ""
}

# Main restore function
main() {
    echo "🔄 Starting A-DIENYNAS restore from backup: $RESTORE_DATE"
    echo ""
    
    check_docker
    check_containers
    check_backup_files
    create_pre_restore_backup
    stop_applications
    restore_database
    restore_uploads
    restore_logs
    restore_configs
    restore_volumes
    start_applications
    wait_for_applications
    run_migrations
    collect_static
    test_applications
    show_summary
}

# Run main function
main "$@"
