#!/bin/bash
# scripts/backup.sh

# A-DIENYNAS Docker backup script
# CHANGE: Created comprehensive backup script for Docker containers and data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7
COMPRESSION_LEVEL=6

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

# Check if containers are running
check_containers() {
    log "Checking container status..."
    
    if ! docker compose ps --quiet | grep -q .; then
        error "No containers are running. Please start the application first."
        exit 1
    fi
    
    success "Containers are running"
}

# Create backup directories
create_backup_dirs() {
    log "Creating backup directories..."
    
    mkdir -p "$BACKUP_DIR/database"
    mkdir -p "$BACKUP_DIR/uploads"
    mkdir -p "$BACKUP_DIR/logs"
    mkdir -p "$BACKUP_DIR/configs"
    mkdir -p "$BACKUP_DIR/volumes"
    
    success "Backup directories created"
}

# Backup database
backup_database() {
    log "Backing up database..."
    
    local db_backup_file="$BACKUP_DIR/database/backup_$DATE.sql"
    
    if docker compose exec -T postgres pg_dump -U a_dienynas_user a_dienynas > "$db_backup_file"; then
        # Compress the backup
        gzip -$COMPRESSION_LEVEL "$db_backup_file"
        success "Database backed up: ${db_backup_file}.gz"
        
        # Get backup size
        local size=$(du -h "${db_backup_file}.gz" | cut -f1)
        log "Database backup size: $size"
    else
        error "Failed to backup database"
        exit 1
    fi
}

# Backup uploads/media files
backup_uploads() {
    log "Backing up uploads/media files..."
    
    local uploads_backup_file="$BACKUP_DIR/uploads/backup_$DATE.tar.gz"
    
    if [ -d "./media" ] && [ "$(ls -A ./media)" ]; then
        if tar -czf "$uploads_backup_file" -C . media/; then
            success "Uploads backed up: $uploads_backup_file"
            
            # Get backup size
            local size=$(du -h "$uploads_backup_file" | cut -f1)
            log "Uploads backup size: $size"
        else
            error "Failed to backup uploads"
            exit 1
        fi
    else
        warning "No uploads directory found or directory is empty"
    fi
}

# Backup logs
backup_logs() {
    log "Backing up logs..."
    
    local logs_backup_file="$BACKUP_DIR/logs/backup_$DATE.tar.gz"
    
    if [ -d "./logs" ] && [ "$(ls -A ./logs)" ]; then
        if tar -czf "$logs_backup_file" -C . logs/; then
            success "Logs backed up: $logs_backup_file"
            
            # Get backup size
            local size=$(du -h "$logs_backup_file" | cut -f1)
            log "Logs backup size: $size"
        else
            error "Failed to backup logs"
            exit 1
        fi
    else
        warning "No logs directory found or directory is empty"
    fi
}

# Backup configuration files
backup_configs() {
    log "Backing up configuration files..."
    
    local configs_backup_file="$BACKUP_DIR/configs/backup_$DATE.tar.gz"
    
    # Create temporary config backup
    local temp_config_dir="/tmp/a-dienynas-configs-$DATE"
    mkdir -p "$temp_config_dir"
    
    # Copy important config files
    if [ -f ".env.docker" ]; then
        cp .env.docker "$temp_config_dir/"
    fi
    if [ -f "docker-compose.yml" ]; then
        cp docker-compose.yml "$temp_config_dir/"
    fi
    if [ -d "docker" ]; then
        cp -r docker "$temp_config_dir/"
    fi
    
    # Create config backup archive
    if tar -czf "$configs_backup_file" -C "$temp_config_dir" .; then
        success "Configurations backed up: $configs_backup_file"
        
        # Get backup size
        local size=$(du -h "$configs_backup_file" | cut -f1)
        log "Configs backup size: $size"
    else
        error "Failed to backup configurations"
        exit 1
    fi
    
    # Clean up temporary directory
    rm -rf "$temp_config_dir"
}

# Backup Docker volumes
backup_volumes() {
    log "Backing up Docker volumes..."
    
    local volumes_backup_file="$BACKUP_DIR/volumes/backup_$DATE.tar.gz"
    
    # Get list of volumes
    local volumes=$(docker volume ls --format "{{.Name}}" | grep "a-dienynas")
    
    if [ -n "$volumes" ]; then
        # Create temporary volume backup
        local temp_volume_dir="/tmp/a-dienynas-volumes-$DATE"
        mkdir -p "$temp_volume_dir"
        
        # Backup each volume
        for volume in $volumes; do
            log "Backing up volume: $volume"
            
            # Create volume backup directory
            local volume_backup_dir="$temp_volume_dir/$volume"
            mkdir -p "$volume_backup_dir"
            
            # Use docker run to backup volume data
            docker run --rm -v "$volume:/data" -v "$volume_backup_dir:/backup" \
                alpine tar -czf "/backup/data.tar.gz" -C /data .
        done
        
        # Create volumes backup archive
        if tar -czf "$volumes_backup_file" -C "$temp_volume_dir" .; then
            success "Volumes backed up: $volumes_backup_file"
            
            # Get backup size
            local size=$(du -h "$volumes_backup_file" | cut -f1)
            log "Volumes backup size: $size"
        else
            error "Failed to backup volumes"
            exit 1
        fi
        
        # Clean up temporary directory
        rm -rf "$temp_volume_dir"
    else
        warning "No Docker volumes found"
    fi
}

# Create backup information file
create_backup_info() {
    log "Creating backup information file..."
    
    local backup_info_file="$BACKUP_DIR/backup_info_$DATE.txt"
    
    cat > "$backup_info_file" << EOF
A-DIENYNAS Backup Information
=============================

Backup Date: $(date)
Backup Timestamp: $DATE
System: $(uname -a)
Docker Version: $(docker --version)
Docker Compose Version: $(docker compose version)

Container Status:
$(docker compose ps --format "table {{.Name}}\t{{.State}}\t{{.Ports}}")

Backup Files:
- Database: backup_$DATE.sql.gz
- Uploads: backup_$DATE.tar.gz
- Logs: backup_$DATE.tar.gz
- Configs: backup_$DATE.tar.gz
- Volumes: backup_$DATE.tar.gz

Backup Sizes:
$(du -h "$BACKUP_DIR"/*/backup_$DATE.* 2>/dev/null | sort -h)

Total Backup Size:
$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)

Notes:
- This backup was created automatically by the backup script
- Retention period: $RETENTION_DAYS days
- Compression level: $COMPRESSION_LEVEL
- Backup location: $BACKUP_DIR

EOF

    success "Backup information file created: $backup_info_file"
}

# Clean old backups
clean_old_backups() {
    log "Cleaning old backups (older than $RETENTION_DAYS days)..."
    
    local cleaned_count=0
    
    # Clean database backups
    local old_db_backups=$(find "$BACKUP_DIR/database" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS 2>/dev/null | wc -l)
    if [ "$old_db_backups" -gt 0 ]; then
        find "$BACKUP_DIR/database" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null
        cleaned_count=$((cleaned_count + old_db_backups))
    fi
    
    # Clean uploads backups
    local old_uploads_backups=$(find "$BACKUP_DIR/uploads" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS 2>/dev/null | wc -l)
    if [ "$old_uploads_backups" -gt 0 ]; then
        find "$BACKUP_DIR/uploads" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null
        cleaned_count=$((cleaned_count + old_uploads_backups))
    fi
    
    # Clean logs backups
    local old_logs_backups=$(find "$BACKUP_DIR/logs" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS 2>/dev/null | wc -l)
    if [ "$old_logs_backups" -gt 0 ]; then
        find "$BACKUP_DIR/logs" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null
        cleaned_count=$((cleaned_count + old_logs_backups))
    fi
    
    # Clean configs backups
    local old_configs_backups=$(find "$BACKUP_DIR/configs" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS 2>/dev/null | wc -l)
    if [ "$old_configs_backups" -gt 0 ]; then
        find "$BACKUP_DIR/configs" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null
        cleaned_count=$((cleaned_count + old_configs_backups))
    fi
    
    # Clean volumes backups
    local old_volumes_backups=$(find "$BACKUP_DIR/volumes" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS 2>/dev/null | wc -l)
    if [ "$old_volumes_backups" -gt 0 ]; then
        find "$BACKUP_DIR/volumes" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null
        cleaned_count=$((cleaned_count + old_volumes_backups))
    fi
    
    # Clean old backup info files
    local old_info_files=$(find "$BACKUP_DIR" -name "backup_info_*.txt" -mtime +$RETENTION_DAYS 2>/dev/null | wc -l)
    if [ "$old_info_files" -gt 0 ]; then
        find "$BACKUP_DIR" -name "backup_info_*.txt" -mtime +$RETENTION_DAYS -delete 2>/dev/null
        cleaned_count=$((cleaned_count + old_info_files))
    fi
    
    if [ "$cleaned_count" -gt 0 ]; then
        success "Cleaned $cleaned_count old backup files"
    else
        log "No old backup files to clean"
    fi
}

# Display backup summary
show_summary() {
    echo ""
    echo "=========================================="
    echo "           BACKUP SUMMARY"
    echo "=========================================="
    echo ""
    echo "📁 Backup location: $BACKUP_DIR"
    echo "📅 Backup date: $(date)"
    echo "🆔 Backup ID: $DATE"
    echo ""
    echo "📦 Backup files created:"
    echo "  🗄️ Database: backup_$DATE.sql.gz"
    echo "  📁 Uploads: backup_$DATE.tar.gz"
    echo "  📝 Logs: backup_$DATE.tar.gz"
    echo "  ⚙️ Configs: backup_$DATE.tar.gz"
    echo "  💾 Volumes: backup_$DATE.tar.gz"
    echo "  📋 Info: backup_info_$DATE.txt"
    echo ""
    echo "💾 Total backup size:"
    du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1
    echo ""
    echo "🧹 Retention period: $RETENTION_DAYS days"
    echo "✅ Backup completed successfully!"
    echo ""
}

# Main backup function
main() {
    echo "💾 Starting A-DIENYNAS backup process..."
    echo ""
    
    check_docker
    check_containers
    create_backup_dirs
    backup_database
    backup_uploads
    backup_logs
    backup_configs
    backup_volumes
    create_backup_info
    clean_old_backups
    show_summary
}

# Run main function
main "$@"
