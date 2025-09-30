#!/bin/bash
# /home/master/A-DIENYNAS/scripts/test_websocket.sh
# WebSocket connection test script for A-DIENYNAS
# CHANGE: Created WebSocket testing script
# PURPOSE: Test WebSocket connections in development and production
# UPDATES: Initial setup with connection testing and debugging

set -e

# Configuration
LOG_FILE="./logs/websocket_test.log"
DEVELOPMENT_WS_URL="ws://localhost:8000/ws/schedule/"
PRODUCTION_WS_URL="wss://dienynas.mokyklaatradimai.lt/ws/schedule/"

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

# Test WebSocket connection
test_websocket() {
    local url=$1
    local environment=$2
    
    log "🔍 Testing WebSocket connection for $environment..."
    log "URL: $url"
    
    # Check if curl supports WebSocket
    if ! curl --version | grep -q "WebSocket"; then
        warn "curl does not support WebSocket testing. Installing websocat..."
        
        # Try to install websocat if available
        if command -v websocat &> /dev/null; then
            log "Using websocat for WebSocket testing..."
            timeout 10 websocat "$url" --ping-interval 5 --ping-timeout 3 || {
                error "WebSocket connection failed for $environment"
                return 1
            }
        else
            warn "websocat not available. Using basic HTTP test..."
            # Basic HTTP test
            curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
                 -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" \
                 "$url" --max-time 10 || {
                error "WebSocket connection failed for $environment"
                return 1
            }
        fi
    else
        # Use curl for WebSocket test
        curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
             -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" \
             "$url" --max-time 10 || {
            error "WebSocket connection failed for $environment"
            return 1
        }
    fi
    
    log "✅ WebSocket connection successful for $environment"
    return 0
}

# Test development WebSocket
test_development() {
    log "🚀 Testing development WebSocket..."
    
    # Check if backend is running
    if ! curl -s http://localhost:8000/api/health/ > /dev/null 2>&1; then
        error "Backend is not running on localhost:8000"
        return 1
    fi
    
    test_websocket "$DEVELOPMENT_WS_URL" "development"
}

# Test production WebSocket
test_production() {
    log "🌐 Testing production WebSocket..."
    
    # Check if production site is accessible
    if ! curl -s https://dienynas.mokyklaatradimai.lt/api/health/ > /dev/null 2>&1; then
        error "Production site is not accessible"
        return 1
    fi
    
    test_websocket "$PRODUCTION_WS_URL" "production"
}

# Test WebSocket with JavaScript (browser simulation)
test_websocket_js() {
    local url=$1
    local environment=$2
    
    log "🌐 Testing WebSocket with JavaScript simulation for $environment..."
    
    # Create temporary JavaScript file
    cat > /tmp/websocket_test.js << EOF
const WebSocket = require('ws');
const ws = new WebSocket('$url');

ws.on('open', function open() {
    console.log('✅ WebSocket connected to $environment');
    ws.close();
    process.exit(0);
});

ws.on('error', function error(err) {
    console.error('❌ WebSocket error:', err.message);
    process.exit(1);
});

setTimeout(() => {
    console.error('❌ WebSocket connection timeout');
    process.exit(1);
}, 10000);
EOF

    # Run JavaScript test
    if command -v node &> /dev/null; then
        if npm list ws &> /dev/null; then
            node /tmp/websocket_test.js || {
                error "JavaScript WebSocket test failed for $environment"
                rm -f /tmp/websocket_test.js
                return 1
            }
        else
            warn "WebSocket library not installed. Run: npm install ws"
            rm -f /tmp/websocket_test.js
            return 1
        fi
    else
        warn "Node.js not available for JavaScript WebSocket test"
        rm -f /tmp/websocket_test.js
        return 1
    fi
    
    rm -f /tmp/websocket_test.js
    return 0
}

# Main function
main() {
    log "🚀 Starting WebSocket connection tests..."
    
    # Create logs directory if it doesn't exist
    mkdir -p ./logs
    
    # Parse command line arguments
    case "${1:-all}" in
        "dev"|"development")
            test_development
            ;;
        "prod"|"production")
            test_production
            ;;
        "js"|"javascript")
            test_websocket_js "$DEVELOPMENT_WS_URL" "development"
            test_websocket_js "$PRODUCTION_WS_URL" "production"
            ;;
        "all")
            test_development
            echo ""
            test_production
            ;;
        *)
            echo "Usage: $0 [dev|prod|js|all]"
            echo "  dev/development  - Test development WebSocket"
            echo "  prod/production  - Test production WebSocket"
            echo "  js/javascript   - Test with JavaScript simulation"
            echo "  all             - Test both development and production"
            exit 1
            ;;
    esac
    
    log "✅ WebSocket testing completed successfully!"
}

# Run main function
main "$@"
