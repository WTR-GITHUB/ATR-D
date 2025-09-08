#!/bin/bash

# /home/master/DIENYNAS/scripts/backup_dienynas.sh

# A-DIENYNAS web application backup script
# Creates daily backups of database, Docker volumes, and application files
# Designed to run once per day via cron job
# CHANGE: Created comprehensive backup script for A-DIENYNAS system with database, Docker, and file backups

# Configuration
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="dienynas_backup_${DATE}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Logging
LOG_FILE="/var/log/dienynas_backup.log"
echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting A-DIENYNAS backup: ${BACKUP_NAME}" >> ${LOG_FILE}

# Create backup directory
mkdir -p "${BACKUP_PATH}"

# 1. Database backup
echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting database backup..." >> ${LOG_FILE}
mkdir -p "${BACKUP_PATH}/database"

# PostgreSQL backup
docker compose exec -T postgres pg_dump -U a_dienynas_user -d a_dienynas > "${BACKUP_PATH}/database/postgres_backup.sql" 2>> ${LOG_FILE}
if [ $? -eq 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Database backup completed successfully" >> ${LOG_FILE}
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ERROR: Database backup failed" >> ${LOG_FILE}
fi

# 2. Docker volumes backup
echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting Docker volumes backup..." >> ${LOG_FILE}
mkdir -p "${BACKUP_PATH}/docker"

# Backup Docker volumes
docker run --rm -v dienynas_postgres_data:/data -v dienynas_redis_data:/redis_data -v "${BACKUP_PATH}/docker":/backup alpine tar czf /backup/docker_volumes.tar.gz -C /data . -C /redis_data . 2>> ${LOG_FILE}
if [ $? -eq 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Docker volumes backup completed successfully" >> ${LOG_FILE}
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ERROR: Docker volumes backup failed" >> ${LOG_FILE}
fi

# 3. Application files backup
echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting application files backup..." >> ${LOG_FILE}
mkdir -p "${BACKUP_PATH}/application"

# Backup backend files (excluding virtual environment and cache)
tar --exclude='venv' --exclude='__pycache__' --exclude='*.pyc' --exclude='.git' \
    -czf "${BACKUP_PATH}/application/backend.tar.gz" -C /home/master/DIENYNAS backend/ 2>> ${LOG_FILE}

# Backup frontend files (excluding node_modules and build cache)
tar --exclude='node_modules' --exclude='.next' --exclude='.git' \
    -czf "${BACKUP_PATH}/application/frontend.tar.gz" -C /home/master/DIENYNAS frontend/ 2>> ${LOG_FILE}

# Backup configuration files
tar -czf "${BACKUP_PATH}/application/config.tar.gz" -C /home/master/DIENYNAS \
    docker-compose.yml .env requirements.txt 2>> ${LOG_FILE}

if [ $? -eq 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Application files backup completed successfully" >> ${LOG_FILE}
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ERROR: Application files backup failed" >> ${LOG_FILE}
fi

# 4. Create backup manifest
echo "$(date '+%Y-%m-%d %H:%M:%S') - Creating backup manifest..." >> ${LOG_FILE}
cat > "${BACKUP_PATH}/backup_manifest.txt" << EOF
A-DIENYNAS Backup Manifest
========================
Backup Date: $(date '+%Y-%m-%d %H:%M:%S')
Backup Name: ${BACKUP_NAME}
Server: $(hostname)
Docker Compose Status: $(docker compose ps --format json | jq -r '.[] | "\(.Name): \(.State)"' 2>/dev/null || echo "Unable to get status")

Backup Contents:
- database/postgres_backup.sql (PostgreSQL database dump)
- docker/docker_volumes.tar.gz (Docker volumes backup)
- application/backend.tar.gz (Backend application files)
- application/frontend.tar.gz (Frontend application files)
- application/config.tar.gz (Configuration files)

Backup Size: $(du -sh "${BACKUP_PATH}" | cut -f1)
EOF

# 5. Compress entire backup
echo "$(date '+%Y-%m-%d %H:%M:%S') - Compressing backup..." >> ${LOG_FILE}
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}/" 2>> ${LOG_FILE}
if [ $? -eq 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Backup compressed successfully" >> ${LOG_FILE}
    # Remove uncompressed directory
    rm -rf "${BACKUP_NAME}"
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ERROR: Backup compression failed" >> ${LOG_FILE}
fi

# 6. Cleanup old backups (keep last 7 days)
echo "$(date '+%Y-%m-%d %H:%M:%S') - Cleaning up old backups..." >> ${LOG_FILE}
find "${BACKUP_DIR}" -name "dienynas_backup_*.tar.gz" -type f -mtime +7 -delete 2>> ${LOG_FILE}

# 7. Final status
BACKUP_SIZE=$(du -sh "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" 2>/dev/null | cut -f1 || echo "Unknown")
echo "$(date '+%Y-%m-%d %H:%M:%S') - Backup completed: ${BACKUP_NAME}.tar.gz (${BACKUP_SIZE})" >> ${LOG_FILE}

# 8. Send notification (optional - requires mailutils or similar)
# echo "A-DIENYNAS backup completed: ${BACKUP_NAME}.tar.gz (${BACKUP_SIZE})" | mail -s "Backup Status" admin@example.com

exit 0
