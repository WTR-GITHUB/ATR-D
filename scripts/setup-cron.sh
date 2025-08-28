#!/bin/bash
# /home/master/A-DIENYNAS/scripts/setup-cron.sh
# A-DIENYNAS Cron Setup Script
# CHANGE: Created cron setup script for automated backups
# PURPOSE: Setup automated cron jobs for system maintenance
# UPDATES: Initial setup with daily and weekly backup schedules

set -e

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CRON_USER="$USER"
BACKUP_SCRIPT="$PROJECT_DIR/scripts/backup.sh"
MAINTENANCE_SCRIPT="$PROJECT_DIR/scripts/maintenance.sh"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Check if scripts exist
check_scripts() {
    if [ ! -f "$BACKUP_SCRIPT" ]; then
        error "Backup script not found: $BACKUP_SCRIPT"
        exit 1
    fi
    
    if [ ! -f "$MAINTENANCE_SCRIPT" ]; then
        error "Maintenance script not found: $MAINTENANCE_SCRIPT"
        exit 1
    fi
    
    # Make scripts executable
    chmod +x "$BACKUP_SCRIPT"
    chmod +x "$MAINTENANCE_SCRIPT"
    
    log "✅ Scripts found and made executable"
}

# Create cron entries
create_cron_entries() {
    log "📅 Creating cron entries..."
    
    # Create temporary cron file
    local temp_cron=$(mktemp)
    
    # Get current crontab
    crontab -l 2>/dev/null > "$temp_cron" || true
    
    # Remove existing A-DIENYNAS entries
    sed -i '/# A-DIENYNAS/d' "$temp_cron"
    sed -i '/.*backup\.sh/d' "$temp_cron"
    sed -i '/.*maintenance\.sh/d' "$temp_cron"
    
    # Add new A-DIENYNAS entries
    cat >> "$temp_cron" << EOF

# A-DIENYNAS Automated Tasks
# Daily backup at 02:00 AM
0 2 * * * $BACKUP_SCRIPT >> $PROJECT_DIR/logs/cron_backup.log 2>&1

# Weekly maintenance at 03:00 AM on Sundays
0 3 * * 0 $MAINTENANCE_SCRIPT --all --report >> $PROJECT_DIR/logs/cron_maintenance.log 2>&1

# Daily system status check at 08:00 AM
0 8 * * * $MAINTENANCE_SCRIPT --status >> $PROJECT_DIR/logs/cron_status.log 2>&1

# Cleanup old logs at 04:00 AM daily
0 4 * * * find $PROJECT_DIR/logs -name "*.log" -mtime +7 -delete 2>/dev/null || true

# Cleanup old backups at 05:00 AM daily (keep last 7 days)
0 5 * * * find $PROJECT_DIR/backups -name "backup_*" -mtime +7 -delete 2>/dev/null || true
EOF

    # Install new crontab
    if crontab "$temp_cron"; then
        log "✅ Cron entries created successfully"
    else
        error "Failed to create cron entries"
        exit 1
    fi
    
    # Clean up temporary file
    rm "$temp_cron"
}

# Show current cron entries
show_cron_entries() {
    log "📋 Current cron entries for A-DIENYNAS:"
    echo ""
    
    if crontab -l 2>/dev/null | grep -A 20 "A-DIENYNAS"; then
        crontab -l 2>/dev/null | grep -A 20 "A-DIENYNAS"
    else
        warn "No A-DIENYNAS cron entries found"
    fi
    
    echo ""
}

# Test cron setup
test_cron_setup() {
    log "🧪 Testing cron setup..."
    
    # Check if cron service is running
    if systemctl is-active --quiet cron; then
        log "✅ Cron service is running"
    else
        warn "Cron service is not running. Starting it..."
        sudo systemctl start cron
        sudo systemctl enable cron
    fi
    
    # Check if user has cron access
    if crontab -l >/dev/null 2>&1; then
        log "✅ User has cron access"
    else
        error "User does not have cron access"
        exit 1
    fi
    
    # Check if scripts are executable
    if [ -x "$BACKUP_SCRIPT" ] && [ -x "$MAINTENANCE_SCRIPT" ]; then
        log "✅ Scripts are executable"
    else
        error "Scripts are not executable"
        exit 1
    fi
}

# Create log directories
create_log_directories() {
    log "📁 Creating log directories..."
    
    mkdir -p "$PROJECT_DIR/logs"
    mkdir -p "$PROJECT_DIR/backups"
    
    # Create log files if they don't exist
    touch "$PROJECT_DIR/logs/cron_backup.log"
    touch "$PROJECT_DIR/logs/cron_maintenance.log"
    touch "$PROJECT_DIR/logs/cron_status.log"
    
    # Set permissions
    chmod 644 "$PROJECT_DIR/logs/cron_*.log"
    
    log "✅ Log directories and files created"
}

# Show usage
show_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --install     Install cron jobs (default)"
    echo "  --remove      Remove all A-DIENYNAS cron jobs"
    echo "  --show        Show current cron jobs"
    echo "  --test        Test cron setup"
    echo "  -h, --help    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Install cron jobs"
    echo "  $0 --show            # Show current cron jobs"
    echo "  $0 --remove          # Remove cron jobs"
}

# Remove cron entries
remove_cron_entries() {
    log "🗑️  Removing A-DIENYNAS cron entries..."
    
    # Create temporary cron file
    local temp_cron=$(mktemp)
    
    # Get current crontab
    crontab -l 2>/dev/null > "$temp_cron" || true
    
    # Remove existing A-DIENYNAS entries
    sed -i '/# A-DIENYNAS/d' "$temp_cron"
    sed -i '/.*backup\.sh/d' "$temp_cron"
    sed -i '/.*maintenance\.sh/d' "$temp_cron"
    
    # Install cleaned crontab
    if crontab "$temp_cron"; then
        log "✅ Cron entries removed successfully"
    else
        error "Failed to remove cron entries"
        exit 1
    fi
    
    # Clean up temporary file
    rm "$temp_cron"
}

# Main function
main() {
    local action="install"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --install)
                action="install"
                shift
                ;;
            --remove)
                action="remove"
                shift
                ;;
            --show)
                action="show"
                shift
                ;;
            --test)
                action="test"
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                error "Unknown argument: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Log start
    log "🔧 Starting A-DIENYNAS cron setup..."
    log "Project directory: $PROJECT_DIR"
    log "Action: $action"
    
    # Perform requested action
    case $action in
        "install")
            check_scripts
            test_cron_setup
            create_log_directories
            create_cron_entries
            show_cron_entries
            log "✅ Cron setup completed successfully!"
            ;;
        "remove")
            remove_cron_entries
            log "✅ Cron entries removed successfully!"
            ;;
        "show")
            show_cron_entries
            ;;
        "test")
            test_cron_setup
            log "✅ Cron setup test completed successfully!"
            ;;
    esac
    
    # Show next steps
    if [ "$action" = "install" ]; then
        echo ""
        echo -e "${GREEN}🎉 Cron setup completed!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Verify cron jobs: crontab -l"
        echo "2. Check cron service: sudo systemctl status cron"
        echo "3. Monitor logs: tail -f $PROJECT_DIR/logs/cron_*.log"
        echo "4. Test backup: $BACKUP_SCRIPT"
        echo ""
        echo "Cron jobs will run automatically:"
        echo "- Daily backup: 02:00 AM"
        echo "- Weekly maintenance: 03:00 AM (Sundays)"
        echo "- Daily status check: 08:00 AM"
        echo "- Daily cleanup: 04:00 AM and 05:00 AM"
    fi
}

# Run main function
main "$@"

