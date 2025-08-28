#!/bin/bash
# /home/master/A-DIENYNAS/scripts/restore.sh
# A-DIENYNAS Restore Script
# CHANGE: Created restore script for system recovery
# PURPOSE: Restore system from backup files
# UPDATES: Initial setup with validation and safety checks

set -e

# Configuration
BACKUP_DIR="./backups"
LOG_FILE="./logs/restore.log"

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

# Show usage
show_usage() {
    echo "Usage: $0 <backup_date> [options]"
    echo ""
    echo "Arguments:"
    echo "  backup_date    Backup date in format YYYYMMDD_HHMMSS"
    echo ""
    echo "Options:"
    echo "  --database     Restore only database"
    echo "  --uploads      Restore only uploads"
    echo "  --logs         Restore only logs"
    echo "  --config       Restore only configuration"
    echo "  --redis        Restore only Redis"
    echo "  --all          Restore everything (default)"
    echo "  --dry-run      Show what would be restored without doing it"
    echo ""
    echo "Examples:"
    echo "  $0 20250125_143000              # Restore everything from specific backup"
    echo "  $0 20250125_143000 --database   # Restore only database"
    echo "  $0 20250125_143000 --dry-run    # Show what would be restored"
    echo ""
    echo "Available backups:"
    list_available_backups
}

# List available backups
list_available_backups() {
    echo "Available backups in $BACKUP_DIR:"
    echo ""
    
    if [ -d "$BACKUP_DIR" ]; then
        for info_file in "$BACKUP_DIR"/backup_info_*.txt; do
            if [ -f "$info_file" ]; then
                backup_date=$(basename "$info_file" | sed 's/backup_info_\(.*\)\.txt/\1/')
                backup_time=$(grep "Backup Date:" "$info_file" | head -1 | cut -d: -f2- | xargs)
                echo "  $backup_date - $backup_time"
            fi
        done
    else
        echo "  No backup directory found"
    fi
}

# Validate backup date
validate_backup_date() {
    local backup_date=$1
    
    if [ -z "$backup_date" ]; then
        error "Backup date is required"
        show_usage
        exit 1
    fi
    
    # Check if backup info file exists
    if [ ! -f "$BACKUP_DIR/backup_info_$backup_date.txt" ]; then
        error "Backup not found for date: $backup_date"
        echo ""
        list_available_backups
        exit 1
    fi
    
    log "Backup validation passed for date: $backup_date"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Check if containers are running
check_containers() {
    if ! docker compose ps | grep -q "Up"; then
        warn "Some containers are not running. Restore may fail."
    fi
}

# Confirm restore operation
confirm_restore() {
    local backup_date=$1
    local restore_type=$2
    
    echo ""
    echo -e "${YELLOW}⚠️  WARNING: This will overwrite current data!${NC}"
    echo ""
    echo "Backup date: $backup_date"
    echo "Restore type: $restore_type"
    echo ""
    echo -e "${RED}Are you sure you want to proceed? (yes/no):${NC} "
    read -r confirmation
    
    if [ "$confirmation" != "yes" ]; then
        log "Restore cancelled by user"
        exit 0
    fi
    
    log "Restore confirmed by user"
}

# Restore database
restore_database() {
    local backup_date=$1
    local dry_run=$2
    
    log "Starting database restore from backup: $backup_date"
    
    local backup_file="$BACKUP_DIR/database/backup_db_$backup_date.sql.gz"
    
    if [ ! -f "$backup_file" ]; then
        error "Database backup file not found: $backup_file"
        return 1
    fi
    
    if [ "$dry_run" = "true" ]; then
        log "DRY RUN: Would restore database from $backup_file"
        return 0
    fi
    
    # Stop backend to prevent conflicts
    log "Stopping backend container..."
    docker compose stop backend
    
    # Wait for backend to stop
    sleep 5
    
    # Restore database
    log "Restoring database..."
    if gunzip -c "$backup_file" | docker compose exec -T postgres psql -U a_dienynas_user -d a_dienynas; then
        log "Database restore completed successfully"
    else
        error "Database restore failed!"
        return 1
    fi
    
    # Start backend
    log "Starting backend container..."
    docker compose start backend
    
    log "Database restore completed"
}

# Restore Redis
restore_redis() {
    local backup_date=$1
    local dry_run=$2
    
    log "Starting Redis restore from backup: $backup_date"
    
    local backup_file="$BACKUP_DIR/redis/backup_redis_$backup_date.rdb.gz"
    
    if [ ! -f "$backup_file" ]; then
        warn "Redis backup file not found: $backup_file"
        return 0
    fi
    
    if [ "$dry_run" = "true" ]; then
        log "DRY RUN: Would restore Redis from $backup_file"
        return 0
    fi
    
    # Stop Redis
    log "Stopping Redis container..."
    docker compose stop redis
    
    # Wait for Redis to stop
    sleep 3
    
    # Restore Redis
    log "Restoring Redis..."
    if gunzip -c "$backup_file" | docker cp - redis:/data/dump.rdb; then
        log "Redis restore completed successfully"
    else
        error "Redis restore failed!"
        return 1
    fi
    
    # Start Redis
    log "Starting Redis container..."
    docker compose start redis
    
    log "Redis restore completed"
}

# Restore uploads
restore_uploads() {
    local backup_date=$1
    local dry_run=$2
    
    log "Starting uploads restore from backup: $backup_date"
    
    local backup_file="$BACKUP_DIR/uploads/backup_uploads_$backup_date.tar.gz"
    
    if [ ! -f "$backup_file" ]; then
        warn "Uploads backup file not found: $backup_file"
        return 0
    fi
    
    if [ "$dry_run" = "true" ]; then
        log "DRY RUN: Would restore uploads from $backup_file"
        return 0
    fi
    
    # Stop backend to prevent conflicts
    log "Stopping backend container..."
    docker compose stop backend
    
    # Wait for backend to stop
    sleep 5
    
    # Restore uploads
    log "Restoring uploads..."
    if [ -d "./media" ]; then
        log "Removing existing media directory..."
        rm -rf ./media
    fi
    
    if tar -xzf "$backup_file"; then
        log "Uploads restore completed successfully"
    else
        error "Uploads restore failed!"
        return 1
    fi
    
    # Start backend
    log "Starting backend container..."
    docker compose start backend
    
    log "Uploads restore completed"
}

# Restore logs
restore_logs() {
    local backup_date=$1
    local dry_run=$2
    
    log "Starting logs restore from backup: $backup_date"
    
    local backup_file="$BACKUP_DIR/logs/backup_logs_$backup_date.tar.gz"
    
    if [ ! -f "$backup_file" ]; then
        warn "Logs backup file not found: $backup_file"
        return 0
    fi
    
    if [ "$dry_run" = "true" ]; then
        log "DRY RUN: Would restore logs from $backup_file"
        return 0
    fi
    
    # Restore logs
    log "Restoring logs..."
    if [ -d "./logs" ]; then
        log "Removing existing logs directory..."
        rm -rf ./logs
    fi
    
    if tar -xzf "$backup_file"; then
        log "Logs restore completed successfully"
    else
        error "Logs restore failed!"
        return 1
    fi
    
    log "Logs restore completed"
}

# Restore configuration
restore_config() {
    local backup_date=$1
    local dry_run=$2
    
    log "Starting configuration restore from backup: $backup_date"
    
    local backup_file="$BACKUP_DIR/config/backup_config_$backup_date.tar.gz"
    
    if [ ! -f "$backup_file" ]; then
        warn "Configuration backup file not found: $backup_file"
        return 0
    fi
    
    if [ "$dry_run" = "true" ]; then
        log "DRY RUN: Would restore configuration from $backup_file"
        return 0
    fi
    
    # Create backup of current config
    log "Creating backup of current configuration..."
    local current_backup="current_config_$(date +%Y%m%d_%H%M%S).tar.gz"
    tar -czf "$current_backup" \
        docker-compose.yml \
        env.docker \
        docker/nginx/nginx.conf \
        docker/nginx/sites-enabled/ \
        docker/backend/Dockerfile \
        docker/frontend/Dockerfile \
        docker/postgres/init.sql \
        scripts/ 2>/dev/null || true
    
    log "Current configuration backed up to: $current_backup"
    
    # Restore configuration
    log "Restoring configuration..."
    if tar -xzf "$backup_file"; then
        log "Configuration restore completed successfully"
    else
        error "Configuration restore failed!"
        return 1
    fi
    
    log "Configuration restore completed"
}

# Main restore function
main() {
    local backup_date=""
    local restore_type="all"
    local dry_run="false"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --database)
                restore_type="database"
                shift
                ;;
            --uploads)
                restore_type="uploads"
                shift
                ;;
            --logs)
                restore_type="logs"
                shift
                ;;
            --config)
                restore_type="config"
                shift
                ;;
            --redis)
                restore_type="redis"
                shift
                ;;
            --all)
                restore_type="all"
                shift
                ;;
            --dry-run)
                dry_run="true"
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                if [ -z "$backup_date" ]; then
                    backup_date="$1"
                else
                    error "Unknown argument: $1"
                    show_usage
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # Check if backup date is provided
    if [ -z "$backup_date" ]; then
        error "Backup date is required"
        show_usage
        exit 1
    fi
    
    # Log start
    log "🔄 Starting A-DIENYNAS restore process..."
    log "Backup date: $backup_date"
    log "Restore type: $restore_type"
    log "Dry run: $dry_run"
    
    # Pre-restore checks
    validate_backup_date "$backup_date"
    check_docker
    check_containers
    
    # Confirm restore (unless dry run)
    if [ "$dry_run" = "false" ]; then
        confirm_restore "$backup_date" "$restore_type"
    fi
    
    # Perform restore based on type
    case $restore_type in
        "database")
            restore_database "$backup_date" "$dry_run"
            ;;
        "uploads")
            restore_uploads "$backup_date" "$dry_run"
            ;;
        "logs")
            restore_logs "$backup_date" "$dry_run"
            ;;
        "config")
            restore_config "$backup_date" "$dry_run"
            ;;
        "redis")
            restore_redis "$backup_date" "$dry_run"
            ;;
        "all")
            restore_database "$backup_date" "$dry_run"
            restore_redis "$backup_date" "$dry_run"
            restore_uploads "$backup_date" "$dry_run"
            restore_logs "$backup_date" "$dry_run"
            restore_config "$backup_date" "$dry_run"
            ;;
    esac
    
    # Final summary
    if [ "$dry_run" = "true" ]; then
        log "✅ Dry run completed successfully!"
        log "📋 Review the above output to see what would be restored"
    else
        log "✅ Restore completed successfully!"
        log "🔄 System restored from backup: $backup_date"
        log "🚀 You may need to restart containers: docker compose restart"
    fi
    
    # Log completion
    echo "$(date): Restore completed successfully. Backup date: $backup_date, Type: $restore_type" >> "$LOG_FILE"
}

# Run main function
main "$@"

