#!/bin/bash
# /home/master/A-DIENYNAS/scripts/backup.sh
# A-DIENYNAS Backup Script
# CHANGE: Created comprehensive backup script for system backup
# PURPOSE: Automated backup of database, uploads, and logs
# UPDATES: Initial setup with retention policy and error handling

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="a-dienynas-postgres"
REDIS_CONTAINER="a-dienynas-redis"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}
LOG_FILE="./logs/backup.log"

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
        warn "Some containers are not running. Backup may fail."
    fi
}

# Create backup directories
create_directories() {
    log "Creating backup directories..."
    mkdir -p "$BACKUP_DIR/database"
    mkdir -p "$BACKUP_DIR/uploads"
    mkdir -p "$BACKUP_DIR/logs"
    mkdir -p "$BACKUP_DIR/redis"
    mkdir -p "$BACKUP_DIR/config"
}

# Database backup
backup_database() {
    log "Starting database backup..."
    
    if docker compose ps postgres | grep -q "Up"; then
        # Create database backup with timestamp
        BACKUP_FILE="$BACKUP_DIR/database/backup_db_$DATE.sql"
        
        if docker compose exec -T postgres pg_dump -U a_dienynas_user a_dienynas > "$BACKUP_FILE"; then
            # Compress the backup
            gzip "$BACKUP_FILE"
            log "Database backup completed: ${BACKUP_FILE}.gz"
            
            # Verify backup file
            if [ -f "${BACKUP_FILE}.gz" ]; then
                BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
                log "Database backup size: $BACKUP_SIZE"
            fi
        else
            error "Database backup failed!"
            return 1
        fi
    else
        warn "PostgreSQL container is not running. Skipping database backup."
    fi
}

# Redis backup
backup_redis() {
    log "Starting Redis backup..."
    
    if docker compose ps redis | grep -q "Up"; then
        BACKUP_FILE="$BACKUP_DIR/redis/backup_redis_$DATE.rdb"
        
        # Create Redis backup
        if docker compose exec redis redis-cli --rdb /data/dump.rdb; then
            if docker cp "$REDIS_CONTAINER:/data/dump.rdb" "$BACKUP_FILE"; then
                # Compress the backup
                gzip "$BACKUP_FILE"
                log "Redis backup completed: ${BACKUP_FILE}.gz"
                
                # Clean up temporary dump
                docker compose exec redis rm -f /data/dump.rdb
            else
                error "Failed to copy Redis backup from container"
            fi
        else
            error "Redis backup failed!"
        fi
    else
        warn "Redis container is not running. Skipping Redis backup."
    fi
}

# Uploads backup
backup_uploads() {
    log "Starting uploads backup..."
    
    if [ -d "./media" ]; then
        BACKUP_FILE="$BACKUP_DIR/uploads/backup_uploads_$DATE.tar.gz"
        
        if tar -czf "$BACKUP_FILE" -C . media/; then
            log "Uploads backup completed: $BACKUP_FILE"
            
            # Verify backup file
            if [ -f "$BACKUP_FILE" ]; then
                BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
                log "Uploads backup size: $BACKUP_SIZE"
            fi
        else
            error "Uploads backup failed!"
            return 1
        fi
    else
        warn "Media directory not found. Skipping uploads backup."
    fi
}

# Logs backup
backup_logs() {
    log "Starting logs backup..."
    
    if [ -d "./logs" ]; then
        BACKUP_FILE="$BACKUP_DIR/logs/backup_logs_$DATE.tar.gz"
        
        if tar -czf "$BACKUP_FILE" -C . logs/; then
            log "Logs backup completed: $BACKUP_FILE"
            
            # Verify backup file
            if [ -f "$BACKUP_FILE" ]; then
                BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
                log "Logs backup size: $BACKUP_SIZE"
            fi
        else
            error "Logs backup failed!"
            return 1
        fi
    else
        warn "Logs directory not found. Skipping logs backup."
    fi
}

# Configuration backup
backup_config() {
    log "Starting configuration backup..."
    
    BACKUP_FILE="$BACKUP_DIR/config/backup_config_$DATE.tar.gz"
    
    # Backup important configuration files
    if tar -czf "$BACKUP_FILE" \
        docker-compose.yml \
        env.docker \
        docker/nginx/nginx.conf \
        docker/nginx/sites-enabled/ \
        docker/backend/Dockerfile \
        docker/frontend/Dockerfile \
        docker/postgres/init.sql \
        scripts/; then
        
        log "Configuration backup completed: $BACKUP_FILE"
        
        # Verify backup file
        if [ -f "$BACKUP_FILE" ]; then
            BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
            log "Configuration backup size: $BACKUP_SIZE"
        fi
    else
        error "Configuration backup failed!"
        return 1
    fi
}

# Create backup information file
create_backup_info() {
    log "Creating backup information file..."
    
    INFO_FILE="$BACKUP_DIR/backup_info_$DATE.txt"
    
    cat > "$INFO_FILE" << EOF
A-DIENYNAS Backup Information
============================
Backup Date: $(date)
Backup Time: $(date +%H:%M:%S)
System: $(uname -a)
Docker Version: $(docker --version)
Docker Compose Version: $(docker compose version)

Container Status:
$(docker compose ps --format "table {{.Name}}\t{{.State}}\t{{.Ports}}")

Backup Files:
- Database: backup_db_$DATE.sql.gz
- Redis: backup_redis_$DATE.rdb.gz
- Uploads: backup_uploads_$DATE.tar.gz
- Logs: backup_logs_$DATE.tar.gz
- Configuration: backup_config_$DATE.tar.gz

Backup Sizes:
$(du -h "$BACKUP_DIR"/*/backup_*_$DATE.* 2>/dev/null | sort -k2)

Total Backup Size:
$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)

Backup completed successfully!
EOF

    log "Backup information saved to: $INFO_FILE"
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
    
    # Remove old database backups
    find "$BACKUP_DIR/database" -name "backup_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # Remove old Redis backups
    find "$BACKUP_DIR/redis" -name "backup_redis_*.rdb.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # Remove old uploads backups
    find "$BACKUP_DIR/uploads" -name "backup_uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # Remove old logs backups
    find "$BACKUP_DIR/logs" -name "backup_logs_*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # Remove old config backups
    find "$BACKUP_DIR/config" -name "backup_config_*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # Remove old info files
    find "$BACKUP_DIR" -name "backup_info_*.txt" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    log "Old backups cleaned up successfully"
}

# Main backup function
main() {
    log "🚀 Starting A-DIENYNAS backup process..."
    log "Backup directory: $BACKUP_DIR"
    log "Retention period: $RETENTION_DAYS days"
    
    # Pre-backup checks
    check_docker
    check_containers
    
    # Create directories
    create_directories
    
    # Perform backups
    backup_database
    backup_redis
    backup_uploads
    backup_logs
    backup_config
    
    # Create backup info
    create_backup_info
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Final summary
    TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
    log "✅ Backup completed successfully!"
    log "📁 Backup location: $BACKUP_DIR"
    log "💾 Total backup size: $TOTAL_SIZE"
    log "🗓️  Backup date: $DATE"
    
    # Log completion
    echo "$(date): Backup completed successfully. Total size: $TOTAL_SIZE" >> "$LOG_FILE"
}

# Run main function
main "$@"

