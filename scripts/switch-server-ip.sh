#!/bin/bash

# /scripts/switch-server-ip.sh
# A-DIENYNAS Server IP Switch Script
# PURPOSE: Easily switch between different server IP configurations
# USAGE: ./scripts/switch-server-ip.sh <target-ip>

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server IP configurations
CURRENT_IP="192.168.88.167"
FUTURE_IP="192.168.192.168"

# Function to display usage
usage() {
    echo -e "${BLUE}A-DIENYNAS Server IP Switch Script${NC}"
    echo ""
    echo "Usage: $0 <target-ip>"
    echo ""
    echo "Available target IPs:"
    echo "  current    - Switch to current server IP (${CURRENT_IP})"
    echo "  future     - Switch to future server IP (${FUTURE_IP})"
    echo "  <custom-ip> - Switch to custom IP address"
    echo ""
    echo "Examples:"
    echo "  $0 current"
    echo "  $0 future" 
    echo "  $0 192.168.1.100"
    exit 1
}

# Function to update environment file
update_env_file() {
    local target_ip="$1"
    local env_file=".env"
    
    echo -e "${YELLOW}Updating environment configuration...${NC}"
    
    # Backup current .env
    cp "$env_file" "${env_file}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Update NEXT_PUBLIC_API_URL
    sed -i "s|NEXT_PUBLIC_API_URL=http://[0-9.]\+/api|NEXT_PUBLIC_API_URL=http://${target_ip}/api|g" "$env_file"
    
    # Update ALLOWED_HOSTS - preserve all IPs but ensure target IP is included
    if ! grep -q "$target_ip" "$env_file"; then
        sed -i "s|ALLOWED_HOSTS=\([^,]*\)|ALLOWED_HOSTS=\1,${target_ip}|" "$env_file"
    fi
    
    # Update CORS_ALLOWED_ORIGINS - preserve all origins but ensure target IP is included  
    if ! grep -q "http://${target_ip}:3000" "$env_file"; then
        sed -i "s|CORS_ALLOWED_ORIGINS=\(.*\)|CORS_ALLOWED_ORIGINS=\1,http://${target_ip}:3000|" "$env_file"
    fi
    
    echo -e "${GREEN}✓ Environment file updated${NC}"
}

# Function to display current configuration
show_current_config() {
    echo -e "${BLUE}Current Configuration:${NC}"
    echo -e "API URL: ${YELLOW}$(grep NEXT_PUBLIC_API_URL .env | cut -d'=' -f2)${NC}"
    echo -e "Allowed Hosts: ${YELLOW}$(grep ALLOWED_HOSTS .env | cut -d'=' -f2)${NC}"
    echo ""
}

# Main execution
main() {
    if [ $# -eq 0 ]; then
        usage
    fi
    
    local target="$1"
    local target_ip=""
    
    # Determine target IP
    case "$target" in
        "current")
            target_ip="$CURRENT_IP"
            ;;
        "future")
            target_ip="$FUTURE_IP"
            ;;
        *)
            # Validate IP format
            if [[ "$target" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
                target_ip="$target"
            else
                echo -e "${RED}Error: Invalid IP address format: $target${NC}"
                echo ""
                usage
            fi
            ;;
    esac
    
    echo -e "${BLUE}A-DIENYNAS Server IP Configuration Switch${NC}"
    echo -e "Target IP: ${GREEN}$target_ip${NC}"
    echo ""
    
    # Show current configuration
    show_current_config
    
    # Confirm the change
    read -p "$(echo -e ${YELLOW}Continue with IP switch? [y/N]: ${NC})" -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Operation cancelled${NC}"
        exit 0
    fi
    
    # Update configuration
    update_env_file "$target_ip"
    
    # Show new configuration
    echo ""
    echo -e "${GREEN}Configuration updated successfully!${NC}"
    show_current_config
    
    # Restart services reminder
    echo -e "${YELLOW}Important: Restart Docker containers to apply changes:${NC}"
    echo "  docker compose down && docker compose up -d"
    echo ""
    echo -e "${BLUE}Access URLs:${NC}"
    echo -e "  Web: ${GREEN}http://${target_ip}${NC}"
    echo -e "  API: ${GREEN}http://${target_ip}/api${NC}"
}

# Run main function
main "$@"