#!/bin/bash
# /home/master/A-DIENYNAS/scripts/maintenance.sh
# A-DIENYNAS Maintenance Script
# CHANGE: Created maintenance script for system monitoring
# PURPOSE: System monitoring, maintenance, and health checks
# UPDATES: Initial setup with comprehensive monitoring features

set -e

# Configuration
PROJECT_NAME="A-DIENYNAS"
LOG_FILE="./logs/maintenance.log"
REPORT_FILE="./logs/maintenance_report_$(date +%Y%m%d_%H%M%S).txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

# Show usage
show_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --status       Show system status (default)"
    echo "  --health       Perform health checks"
    echo "  --logs         Show recent logs"
    echo "  --resources    Show resource usage"
    echo "  --cleanup      Clean up old logs and containers"
    echo "  --backup       Create backup before maintenance"
    echo "  --all          Run all maintenance tasks"
    echo "  --report       Generate detailed report"
    echo "  -h, --help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Show system status"
    echo "  $0 --health          # Perform health checks"
    echo "  $0 --all --report    # Run all tasks with report"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Show system status
show_status() {
    log "📊 System Status Check"
    echo ""
    
    # Container status
    echo -e "${CYAN}=== Container Status ===${NC}"
    if docker compose ps; then
        echo ""
    else
        error "Failed to get container status"
        return 1
    fi
    
    # Service health
    echo -e "${CYAN}=== Service Health ===${NC}"
    local services=("postgres" "redis" "backend" "frontend" "nginx")
    
    for service in "${services[@]}"; do
        if docker compose ps "$service" | grep -q "Up"; then
            echo -e "${GREEN}✅ $service: Running${NC}"
        else
            echo -e "${RED}❌ $service: Not Running${NC}"
        fi
    done
    
    echo ""
}

# Perform health checks
perform_health_checks() {
    log "🏥 Performing Health Checks"
    echo ""
    
    # Test backend API
    echo -e "${CYAN}=== Backend API Health ===${NC}"
    if curl -f http://localhost:8000/api/health/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend API: Healthy${NC}"
    else
        echo -e "${RED}❌ Backend API: Unhealthy${NC}"
    fi
    
    # Test frontend
    echo -e "${CYAN}=== Frontend Health ===${NC}"
    if curl -f http://localhost:3000/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend: Healthy${NC}"
    else
        echo -e "${RED}❌ Frontend: Unhealthy${NC}"
    fi
    
    # Test nginx proxy
    echo -e "${CYAN}=== Nginx Proxy Health ===${NC}"
    if curl -f http://localhost/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Nginx Proxy: Healthy${NC}"
    else
        echo -e "${RED}❌ Nginx Proxy: Unhealthy${NC}"
    fi
    
    # Test database connection
    echo -e "${CYAN}=== Database Health ===${NC}"
    if docker compose exec -T postgres pg_isready -U a_dienynas_user -d a_dienynas > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database: Healthy${NC}"
    else
        echo -e "${RED}❌ Database: Unhealthy${NC}"
    fi
    
    # Test Redis connection
    echo -e "${CYAN}=== Redis Health ===${NC}"
    if docker compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis: Healthy${NC}"
    else
        echo -e "${RED}❌ Redis: Unhealthy${NC}"
    fi
    
    echo ""
}

# Show recent logs
show_logs() {
    log "📝 Recent Logs"
    echo ""
    
    echo -e "${CYAN}=== Recent Container Logs ===${NC}"
    docker compose logs --tail=20 --timestamps
    
    echo ""
    echo -e "${CYAN}=== Recent Error Logs ===${NC}"
    docker compose logs --tail=50 | grep -i "error\|exception\|traceback" || echo "No errors found"
    
    echo ""
}

# Show resource usage
show_resources() {
    log "💾 Resource Usage"
    echo ""
    
    # Container resource usage
    echo -e "${CYAN}=== Container Resource Usage ===${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    echo ""
    
    # System resource usage
    echo -e "${CYAN}=== System Resource Usage ===${NC}"
    echo -e "${BLUE}Memory Usage:${NC}"
    free -h
    
    echo ""
    echo -e "${BLUE}Disk Usage:${NC}"
    df -h
    
    echo ""
    echo -e "${BLUE}Docker Disk Usage:${NC}"
    docker system df
    
    echo ""
}

# Clean up old resources
cleanup_resources() {
    log "🧹 Cleaning Up Resources"
    echo ""
    
    # Clean up old containers
    echo -e "${CYAN}=== Cleaning Up Containers ===${NC}"
    local stopped_containers=$(docker container ls -a -q -f status=exited)
    if [ -n "$stopped_containers" ]; then
        echo "Removing stopped containers..."
        docker container rm "$stopped_containers" 2>/dev/null || true
        echo "✅ Stopped containers cleaned up"
    else
        echo "ℹ️  No stopped containers found"
    fi
    
    # Clean up old images
    echo -e "${CYAN}=== Cleaning Up Images ===${NC}"
    local dangling_images=$(docker images -f "dangling=true" -q)
    if [ -n "$dangling_images" ]; then
        echo "Removing dangling images..."
        docker rmi "$dangling_images" 2>/dev/null || true
        echo "✅ Dangling images cleaned up"
    else
        echo "ℹ️  No dangling images found"
    fi
    
    # Clean up old volumes
    echo -e "${CYAN}=== Cleaning Up Volumes ===${NC}"
    local unused_volumes=$(docker volume ls -q -f dangling=true)
    if [ -n "$unused_volumes" ]; then
        echo "Removing unused volumes..."
        docker volume rm "$unused_volumes" 2>/dev/null || true
        echo "✅ Unused volumes cleaned up"
    else
        echo "ℹ️  No unused volumes found"
    fi
    
    # Clean up old networks
    echo -e "${CYAN}=== Cleaning Up Networks ===${NC}"
    local unused_networks=$(docker network ls -q -f dangling=true)
    if [ -n "$unused_networks" ]; then
        echo "Removing unused networks..."
        docker network rm "$unused_networks" 2>/dev/null || true
        echo "✅ Unused networks cleaned up"
    else
        echo "ℹ️  No unused networks found"
    fi
    
    # Clean up old logs (keep last 7 days)
    echo -e "${CYAN}=== Cleaning Up Old Logs ===${NC}"
    if [ -d "./logs" ]; then
        find ./logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
        echo "✅ Old log files cleaned up"
    fi
    
    echo ""
}

# Create backup before maintenance
create_backup() {
    log "💾 Creating Backup Before Maintenance"
    echo ""
    
    if [ -f "./scripts/backup.sh" ]; then
        if ./scripts/backup.sh; then
            echo "✅ Backup created successfully"
        else
            warn "Backup creation failed"
        fi
    else
        warn "Backup script not found"
    fi
    
    echo ""
}

# Generate detailed report
generate_report() {
    log "📋 Generating Detailed Report"
    echo ""
    
    # Create report file
    cat > "$REPORT_FILE" << EOF
A-DIENYNAS Maintenance Report
============================
Generated: $(date)
System: $(uname -a)
Docker Version: $(docker --version)
Docker Compose Version: $(docker compose version)

Container Status:
$(docker compose ps)

Resource Usage:
$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}")

System Resources:
Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')
Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')

Recent Logs:
$(docker compose logs --tail=50 --timestamps)

Health Check Results:
$(curl -s http://localhost:8000/api/health/ 2>/dev/null || echo "Backend API not accessible")
$(curl -s http://localhost:3000/ > /dev/null 2>&1 && echo "Frontend accessible" || echo "Frontend not accessible")
$(curl -s http://localhost/ > /dev/null 2>&1 && echo "Nginx proxy accessible" || echo "Nginx proxy not accessible")

Maintenance completed successfully!
EOF

    echo "✅ Detailed report generated: $REPORT_FILE"
    echo ""
}

# Main maintenance function
main() {
    local action="status"
    local create_report="false"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --status)
                action="status"
                shift
                ;;
            --health)
                action="health"
                shift
                ;;
            --logs)
                action="logs"
                shift
                ;;
            --resources)
                action="resources"
                shift
                ;;
            --cleanup)
                action="cleanup"
                shift
                ;;
            --backup)
                action="backup"
                shift
                ;;
            --all)
                action="all"
                shift
                ;;
            --report)
                create_report="true"
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
    log "🔧 Starting A-DIENYNAS maintenance..."
    
    # Create log directory
    mkdir -p logs
    
    # Pre-maintenance checks
    check_docker
    
    # Perform requested action
    case $action in
        "status")
            show_status
            ;;
        "health")
            perform_health_checks
            ;;
        "logs")
            show_logs
            ;;
        "resources")
            show_resources
            ;;
        "cleanup")
            cleanup_resources
            ;;
        "backup")
            create_backup
            ;;
        "all")
            show_status
            perform_health_checks
            show_logs
            show_resources
            cleanup_resources
            ;;
    esac
    
    # Generate report if requested
    if [ "$create_report" = "true" ]; then
        generate_report
    fi
    
    # Log completion
    log "✅ Maintenance completed successfully!"
    
    if [ "$create_report" = "true" ]; then
        log "📋 Report generated: $REPORT_FILE"
    fi
}

# Run main function
main "$@"

