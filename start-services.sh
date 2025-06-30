#!/bin/bash

echo "🚀 Starting Betting Platform Services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null
}

# Function to kill process on port
kill_port() {
    if check_port $1; then
        echo -e "${YELLOW}Killing existing process on port $1${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Kill existing processes
echo "🔄 Cleaning up existing processes..."
kill_port 3001
kill_port 3002
kill_port 3003
kill_port 3000

# Start Fixtures Service (Port 3002)
echo -e "${GREEN}📡 Starting Fixtures Service on port 3002...${NC}"
cd backend/fixtures-service
npm start > ../../logs/fixtures.log 2>&1 &
cd ../..

sleep 3

# Start Odds Service (Port 3003)  
echo -e "${GREEN}🎲 Starting Odds Service on port 3003...${NC}"
cd backend/odds-service
npm start > ../../logs/odds.log 2>&1 &
cd ../..

sleep 3

# Start Frontend (Port 3000)
echo -e "${GREEN}🎨 Starting Frontend on port 3000...${NC}"
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
cd ..

sleep 5

# Check services
echo -e "${YELLOW}🔍 Checking service status...${NC}"

if check_port 3002; then
    echo -e "${GREEN}✅ Fixtures Service: Running${NC}"
else
    echo -e "${RED}❌ Fixtures Service: Failed${NC}"
fi

if check_port 3003; then
    echo -e "${GREEN}✅ Odds Service: Running${NC}"
else
    echo -e "${RED}❌ Odds Service: Failed${NC}"
fi

if check_port 3000; then
    echo -e "${GREEN}✅ Frontend: Running${NC}"
else
    echo -e "${RED}❌ Frontend: Failed${NC}"
fi

echo ""
echo -e "${GREEN}🌐 Services started! Access the application at:${NC}"
echo -e "${YELLOW}Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}Test Page: test-live-matches.html${NC}"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo "  tail -f logs/fixtures.log"
echo "  tail -f logs/odds.log" 
echo "  tail -f logs/frontend.log"
echo ""
echo -e "${YELLOW}To stop all services: ./stop-services.sh${NC}" 