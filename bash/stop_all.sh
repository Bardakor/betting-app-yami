#!/bin/bash

echo "🛑 Stopping Yami Betting Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null
}

# Function to kill process on port
kill_port() {
    local port=$1
    local service_name=$2
    if check_port $port; then
        echo -e "${YELLOW}Stopping $service_name on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
        if check_port $port; then
            echo -e "${RED}Failed to stop $service_name${NC}"
        else
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        fi
    else
        echo -e "${BLUE}$service_name was not running${NC}"
    fi
}

# Stop services by PID if available
if [ -d .pids ]; then
    echo -e "${CYAN}Stopping services using saved PIDs...${NC}"
    
    for pidfile in .pids/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            service_name=$(basename "$pidfile" .pid)
            if kill -0 $pid 2>/dev/null; then
                echo -e "${YELLOW}Stopping $service_name (PID: $pid)...${NC}"
                kill -TERM $pid 2>/dev/null || true
                sleep 2
                if kill -0 $pid 2>/dev/null; then
                    kill -KILL $pid 2>/dev/null || true
                fi
                echo -e "${GREEN}✅ $service_name stopped${NC}"
            else
                echo -e "${BLUE}$service_name was not running${NC}"
            fi
            rm -f "$pidfile"
        fi
    done
    
    rmdir .pids 2>/dev/null || true
fi

echo -e "${CYAN}Stopping services by port...${NC}"

# Stop all services by port
kill_port 3000 "Frontend"
kill_port 8000 "API Gateway" 
kill_port 3001 "Main Service"
kill_port 3002 "Fixtures Service"
kill_port 3003 "Odds Service"
kill_port 3004 "Wallet Service"
kill_port 3005 "Bet Service"
kill_port 3006 "Result Service"

# Additional cleanup - kill any node processes that might be related
echo -e "${CYAN}Performing additional cleanup...${NC}"
pkill -f "node.*src/index.js" 2>/dev/null || true
pkill -f "npm.*run.*dev" 2>/dev/null || true
pkill -f "next.*dev" 2>/dev/null || true

sleep 2

# Final verification
echo -e "${CYAN}🔍 Verifying all services are stopped...${NC}"
ports=(3000 3001 3002 3003 3004 3005 3006 8000)
all_stopped=true

for port in "${ports[@]}"; do
    if check_port $port; then
        echo -e "${RED}❌ Port $port is still in use${NC}"
        all_stopped=false
    fi
done

if $all_stopped; then
    echo -e "${GREEN}✅ All services stopped successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Some ports may still be in use. You can manually kill them:${NC}"
    echo -e "${BLUE}lsof -ti:[PORT] | xargs kill -9${NC}"
fi

echo -e "${GREEN}🎉 Yami Betting Platform stopped!${NC}"
