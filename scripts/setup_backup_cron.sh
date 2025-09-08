#!/bin/bash

# /home/master/DIENYNAS/scripts/setup_backup_cron.sh

# Setup cron job for A-DIENYNAS daily backup
# Runs backup script every day at 2:00 AM (EEST timezone)
# CHANGE: Created cron setup script for automated daily backups

# Add cron job for daily backup at 1:00 AM
(crontab -l 2>/dev/null; echo "0 1 * * * /home/master/DIENYNAS/scripts/backup_dienynas.sh >> /var/log/dienynas_backup.log 2>&1") | crontab -

echo "Cron job added for daily backup at 1:00 AM"
echo "Backup script: /home/master/DIENYNAS/scripts/backup_dienynas.sh"
echo "Log file: /var/log/dienynas_backup.log"
echo ""
echo "To view current cron jobs: crontab -l"
echo "To test backup manually: sudo /home/master/DIENYNAS/scripts/backup_dienynas.sh"
