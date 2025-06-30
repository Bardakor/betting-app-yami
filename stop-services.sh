#!/bin/bash

echo "🛑 Stopping Betting Platform Services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to kill process on port
kill_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null; then
        echo -e "${YELLOW}Stopping service on port $1${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 1
        if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null; then
            echo -e "${RED}Failed to stop service on port $1${NC}"
        else
            echo -e "${GREEN}✅ Stopped service on port $1${NC}"
        fi
    else
        echo -e "${GREEN}✅ Port $1 already free${NC}"
    fi
}

# Stop all services
kill_port 3000  # Frontend
kill_port 3001  # Main Service  
kill_port 3002  # Fixtures Service
kill_port 3003  # Odds Service

echo -e "${GREEN}🏁 All services stopped!${NC}" 