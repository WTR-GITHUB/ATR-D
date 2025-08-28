#!/bin/bash
# scripts/maintenance.sh

# A-DIENYNAS Docker maintenance script
# CHANGE: Created maintenance script for system monitoring and health checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOG_FILE="./logs/maintenance.log"
ALERT_EMAIL="admin@example.com"
DISK_THRESHOLD=80
MEMORY_THRESHOLD=80
CPU_THRESHOLD=80

# Logging function
log() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${BLUE}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

error() {
    local message="[ERROR] $1"
    echo -e "${RED}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

success() {
    local message="[SUCCESS] $1"
    echo -e "${GREEN}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

warning() {
    local message="[WARNING] $1"
    echo -e "${YELLOW}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Check Docker status
check_docker() {
    log "Checking Docker status..."
    
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running"
        return 1
    fi
    
    local docker_version=$(docker --version)
    local compose_version=$(docker compose version)
    
    success "Docker is running"
    log "Docker version: $docker_version"
    log "Docker Compose version: $compose_version"
    
    return 0
}

# Check container status
check_containers() {
    log "Checking container status..."
    
    if ! docker compose ps --quiet | grep -q .; then
        error "No containers are running"
        return 1
    fi
    
    local total_containers=$(docker compose ps --quiet | wc -l)
    local running_containers=$(docker compose ps --filter "status=running" --quiet | wc -l)
    local stopped_containers=$(docker compose ps --filter "status=exited" --quiet | wc -l)
    local restarting_containers=$(docker compose ps --filter "status=restarting" --quiet | wc -l)
    
    log "Container summary:"
    log "  Total: $total_containers"
    log "  Running: $running_containers"
    log "  Stopped: $stopped_containers"
    log "  Restarting: $restarting_containers"
    
    if [ "$running_containers" -eq "$total_containers" ]; then
        success "All containers are running"
    else
        warning "Some containers are not running properly"
        
        # Show container details
        docker compose ps
        
        # Show logs for problematic containers
        if [ "$stopped_containers" -gt 0 ]; then
            log "Logs for stopped containers:"
            docker compose logs --tail=20 $(docker compose ps --filter "status=exited" --format "{{.Name}}")
        fi
        
        if [ "$restarting_containers" -gt 0 ]; then
            log "Logs for restarting containers:"
            docker compose logs --tail=20 $(docker compose ps --filter "status=restarting" --format "{{.Name}}")
        fi
    fi
    
    return 0
}

# Check container health
check_container_health() {
    log "Checking container health..."
    
    local unhealthy_containers=0
    
    # Check each container's health status
    while IFS= read -r container; do
        if [ -n "$container" ]; then
            local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-healthcheck")
            
            if [ "$health_status" = "healthy" ]; then
                success "Container $container is healthy"
            elif [ "$health_status" = "unhealthy" ]; then
                error "Container $container is unhealthy"
                ((unhealthy_containers++))
                
                # Show health check logs
                log "Health check logs for $container:"
                docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' "$container" 2>/dev/null || echo "No health check logs available"
            else
                log "Container $container has no health check or status: $health_status"
            fi
        fi
    done < <(docker compose ps --quiet)
    
    if [ "$unhealthy_containers" -eq 0 ]; then
        success "All containers are healthy"
    else
        warning "$unhealthy_containers container(s) are unhealthy"
    fi
    
    return 0
}

# Check resource usage
check_resources() {
    log "Checking resource usage..."
    
    # Container resource usage
    log "Container resource usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    # System resource usage
    log "System resource usage:"
    
    # CPU usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    log "CPU usage: ${cpu_usage}%"
    
    if (( $(echo "$cpu_usage > $CPU_THRESHOLD" | bc -l) )); then
        warning "CPU usage is high: ${cpu_usage}%"
    fi
    
    # Memory usage
    local memory_info=$(free -h | grep Mem)
    local total_memory=$(echo "$memory_info" | awk '{print $2}')
    local used_memory=$(echo "$memory_info" | awk '{print $3}')
    local memory_percent=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    
    log "Memory usage: $used_memory / $total_memory (${memory_percent}%)"
    
    if (( $(echo "$memory_percent > $MEMORY_THRESHOLD" | bc -l) )); then
        warning "Memory usage is high: ${memory_percent}%"
    fi
    
    # Disk usage
    log "Disk usage:"
    df -h | grep -E '^/dev/'
    
    # Check for high disk usage
    while IFS= read -r line; do
        local filesystem=$(echo "$line" | awk '{print $1}')
        local usage_percent=$(echo "$line" | awk '{print $5}' | sed 's/%//')
        local mount_point=$(echo "$line" | awk '{print $6}')
        
        if [ "$usage_percent" -gt "$DISK_THRESHOLD" ]; then
            warning "Disk usage is high on $filesystem ($mount_point): ${usage_percent}%"
        fi
    done < <(df | grep -E '^/dev/' | awk '{print $1, $5, $6}')
    
    return 0
}

# Check network connectivity
check_network() {
    log "Checking network connectivity..."
    
    # Check if containers can reach each other
    local containers=("postgres" "redis" "backend" "frontend" "nginx")
    
    for container in "${containers[@]}"; do
        if docker compose ps --quiet "$container" | grep -q .; then
            if docker compose exec "$container" ping -c 1 postgres > /dev/null 2>&1; then
                success "Container $container can reach postgres"
            else
                warning "Container $container cannot reach postgres"
            fi
        fi
    done
    
    # Check external connectivity
    if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        success "External connectivity is working"
    else
        warning "External connectivity issues detected"
    fi
    
    # Check DNS resolution
    if nslookup google.com > /dev/null 2>&1; then
        success "DNS resolution is working"
    else
        warning "DNS resolution issues detected"
    fi
    
    return 0
}

# Check application endpoints
check_endpoints() {
    log "Checking application endpoints..."
    
    local endpoints=(
        "http://localhost:8000/api/"
        "http://localhost:3000/"
        "http://localhost/"
    )
    
    local endpoint_names=(
        "Backend API"
        "Frontend"
        "Nginx Proxy"
    )
    
    for i in "${!endpoints[@]}"; do
        local endpoint="${endpoints[$i]}"
        local name="${endpoint_names[$i]}"
        
        if curl -f -s "$endpoint" > /dev/null 2>&1; then
            success "$name is responding at $endpoint"
        else
            error "$name is not responding at $endpoint"
        fi
    done
    
    return 0
}

# Check logs for errors
check_logs() {
    log "Checking logs for errors..."
    
    local error_count=0
    
    # Check recent logs for errors
    log "Recent error logs:"
    
    # Backend errors
    if docker compose logs --tail=50 backend 2>/dev/null | grep -i "error\|exception\|traceback" > /dev/null; then
        log "Backend errors found:"
        docker compose logs --tail=50 backend 2>/dev/null | grep -i "error\|exception\|traceback" | tail -5
        ((error_count++))
    fi
    
    # Frontend errors
    if docker compose logs --tail=50 frontend 2>/dev/null | grep -i "error\|exception\|traceback" > /dev/null; then
        log "Frontend errors found:"
        docker compose logs --tail=50 frontend 2>/dev/null | grep -i "error\|exception\|traceback" | tail -5
        ((error_count++))
    fi
    
    # Nginx errors
    if docker compose logs --tail=50 nginx 2>/dev/null | grep -i "error\|exception\|traceback" > /dev/null; then
        log "Nginx errors found:"
        docker compose logs --tail=50 nginx 2>/dev/null | grep -i "error\|exception\|traceback" | tail -5
        ((error_count++))
    fi
    
    if [ "$error_count" -eq 0 ]; then
        success "No recent errors found in logs"
    else
        warning "$error_count service(s) have recent errors"
    fi
    
    return 0
}

# Check backup status
check_backups() {
    log "Checking backup status..."
    
    if [ -d "./backups" ]; then
        local latest_backup=$(find ./backups -name "backup_info_*.txt" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
        
        if [ -n "$latest_backup" ]; then
            local backup_date=$(echo "$latest_backup" | sed 's/.*backup_info_//' | sed 's/\.txt//')
            local backup_age=$(( ($(date +%s) - $(date -d "$backup_date" +%s)) / 86400 ))
            
            log "Latest backup: $backup_date (${backup_age} days ago)"
            
            if [ "$backup_age" -le 1 ]; then
                success "Backup is recent (${backup_age} day ago)"
            elif [ "$backup_age" -le 3 ]; then
                warning "Backup is getting old (${backup_age} days ago)"
            else
                error "Backup is very old (${backup_age} days ago)"
            fi
        else
            warning "No backup information files found"
        fi
        
        # Check backup directory size
        local backup_size=$(du -sh ./backups 2>/dev/null | cut -f1)
        log "Backup directory size: $backup_size"
    else
        warning "Backup directory not found"
    fi
    
    return 0
}

# Check SSL certificates (if applicable)
check_ssl() {
    log "Checking SSL certificates..."
    
    if [ -f "/etc/letsencrypt/live" ]; then
        local domains=$(find /etc/letsencrypt/live -maxdepth 1 -type d -name "*" | grep -v "live" | sed 's/.*\///')
        
        for domain in $domains; do
            local cert_file="/etc/letsencrypt/live/$domain/cert.pem"
            if [ -f "$cert_file" ]; then
                local expiry_date=$(openssl x509 -enddate -noout -in "$cert_file" | cut -d= -f2)
                local expiry_timestamp=$(date -d "$expiry_date" +%s)
                local current_timestamp=$(date +%s)
                local days_until_expiry=$(( ($expiry_timestamp - $current_timestamp) / 86400 ))
                
                if [ "$days_until_expiry" -gt 30 ]; then
                    success "SSL certificate for $domain expires in ${days_until_expiry} days"
                elif [ "$days_until_expiry" -gt 7 ]; then
                    warning "SSL certificate for $domain expires in ${days_until_expiry} days"
                else
                    error "SSL certificate for $domain expires in ${days_until_expiry} days"
                fi
            fi
        done
    else
        log "No Let's Encrypt certificates found"
    fi
    
    return 0
}

# Generate maintenance report
generate_report() {
    log "Generating maintenance report..."
    
    local report_file="./logs/maintenance_report_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$report_file" << EOF
A-DIENYNAS Maintenance Report
=============================

Report Date: $(date)
System: $(uname -a)
Docker Version: $(docker --version)
Docker Compose Version: $(docker compose version)

Container Status:
$(docker compose ps --format "table {{.Name}}\t{{.State}}\t{{.Status}}\t{{.Ports}}")

Resource Usage:
$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}")

System Resources:
$(free -h)
$(df -h)

Recent Logs:
$(docker compose logs --tail=20)

EOF

    success "Maintenance report generated: $report_file"
    
    return 0
}

# Send alerts if needed
send_alerts() {
    log "Checking if alerts need to be sent..."
    
    local alerts=()
    
    # Check for critical issues
    if ! docker info > /dev/null 2>&1; then
        alerts+=("Docker is not running")
    fi
    
    if [ "$(docker compose ps --filter 'status=running' --quiet | wc -l)" -eq 0 ]; then
        alerts+=("No containers are running")
    fi
    
    # Check resource thresholds
    local memory_percent=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    if (( $(echo "$memory_percent > $MEMORY_THRESHOLD" | bc -l) )); then
        alerts+=("Memory usage is high: ${memory_percent}%")
    fi
    
    if [ ${#alerts[@]} -gt 0 ]; then
        warning "Sending alerts for critical issues:"
        for alert in "${alerts[@]}"; do
            echo "  - $alert"
        done
        
        # Here you could implement actual alert sending (email, Slack, etc.)
        # For now, just log the alerts
        log "Alerts would be sent to: $ALERT_EMAIL"
    else
        success "No critical issues detected, no alerts needed"
    fi
    
    return 0
}

# Main maintenance function
main() {
    echo "🔧 Starting A-DIENYNAS maintenance check..."
    echo ""
    
    local start_time=$(date +%s)
    
    # Run all checks
    check_docker
    check_containers
    check_container_health
    check_resources
    check_network
    check_endpoints
    check_logs
    check_backups
    check_ssl
    generate_report
    send_alerts
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo "=========================================="
    echo "           MAINTENANCE SUMMARY"
    echo "=========================================="
    echo ""
    echo "✅ Maintenance check completed in ${duration} seconds"
    echo "📁 Log file: $LOG_FILE"
    echo "📊 Container status: $(docker compose ps --filter 'status=running' --quiet | wc -l)/$(docker compose ps --quiet | wc -l) running"
    echo ""
    echo "🔧 Next steps:"
    echo "  1. Review the maintenance report"
    echo "  2. Address any warnings or errors"
    echo "  3. Schedule regular maintenance checks"
    echo "  4. Monitor system performance"
    echo ""
}

# Run main function
main "$@"
