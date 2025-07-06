#!/bin/bash

echo "🧹 Cleaning Yami Betting Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to ask for confirmation
confirm() {
    read -r -p "${1:-Are you sure? [y/N]} " response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            true
            ;;
        *)
            false
            ;;
    esac
}

echo -e "${YELLOW}This will stop all services and clean up all processes, logs, and dependencies.${NC}"
if ! confirm "Do you want to continue? [y/N]"; then
    echo -e "${BLUE}Cleanup cancelled.${NC}"
    exit 0
fi

# Stop all services first
echo -e "${CYAN}Stopping all services...${NC}"
bash stop_all.sh

echo -e "${CYAN}Cleaning up processes and ports...${NC}"

# Kill any remaining node processes
pkill -f "node" 2>/dev/null || true
pkill -f "npm" 2>/dev/null || true
pkill -f "next" 2>/dev/null || true

# Force kill on all our ports
ports=(3000 3001 3002 3003 3004 3005 3006 8000)
for port in "${ports[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        echo -e "${YELLOW}Force killing process on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done

# Clean logs
if confirm "Clean all log files? [y/N]"; then
    echo -e "${CYAN}Cleaning logs...${NC}"
    rm -rf logs/*
    echo -e "${GREEN}✅ Logs cleaned${NC}"
fi

# Clean node_modules
if confirm "Clean all node_modules? (This will require reinstalling dependencies) [y/N]"; then
    echo -e "${CYAN}Cleaning node_modules...${NC}"
    
    # Root
    rm -rf node_modules
    
    # Backend services
    for service in api-gateway main-service fixtures-service odds-service wallet-service bet-service result-service; do
        if [ -d "backend/$service" ]; then
            rm -rf "backend/$service/node_modules"
            echo -e "${GREEN}✅ Cleaned backend/$service/node_modules${NC}"
        fi
    done
    
    # Frontend
    rm -rf frontend/node_modules
    echo -e "${GREEN}✅ Cleaned frontend/node_modules${NC}"
    
    echo -e "${GREEN}✅ All node_modules cleaned${NC}"
fi

# Clean package-lock files
if confirm "Clean all package-lock.json files? [y/N]"; then
    echo -e "${CYAN}Cleaning package-lock.json files...${NC}"
    
    find . -name "package-lock.json" -delete
    echo -e "${GREEN}✅ Package-lock files cleaned${NC}"
fi

# Clean Next.js cache
if [ -d "frontend/.next" ]; then
    if confirm "Clean Next.js build cache? [y/N]"; then
        echo -e "${CYAN}Cleaning Next.js cache...${NC}"
        rm -rf frontend/.next
        echo -e "${GREEN}✅ Next.js cache cleaned${NC}"
    fi
fi

# Clean PID files
if [ -d ".pids" ]; then
    echo -e "${CYAN}Cleaning PID files...${NC}"
    rm -rf .pids
    echo -e "${GREEN}✅ PID files cleaned${NC}"
fi

# Clean environment files (optional)
if confirm "Clean environment files (.env.local)? [y/N]"; then
    echo -e "${CYAN}Cleaning environment files...${NC}"
    find . -name ".env.local" -delete
    echo -e "${GREEN}✅ Environment files cleaned${NC}"
fi

# Final port check
echo -e "${CYAN}Final verification...${NC}"
sleep 2

any_running=false
for port in "${ports[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        echo -e "${RED}❌ Port $port is still in use${NC}"
        any_running=true
    fi
done

if ! $any_running; then
    echo -e "${GREEN}✅ All ports are clean${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Cleanup completed!${NC}"
echo ""
echo -e "${BLUE}To start the platform again:${NC}"
echo -e "${YELLOW}bash start_all.sh${NC}"
echo ""
echo -e "${BLUE}To install dependencies only:${NC}"
echo -e "${YELLOW}npm run install:all${NC}"
