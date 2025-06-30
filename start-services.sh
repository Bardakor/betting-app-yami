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
kill_port 3004
kill_port 3005
kill_port 3006
kill_port 3000

# Create logs directory if it doesn't exist
mkdir -p logs

# Start Main Service (Port 3001)
echo -e "${GREEN}🔑 Starting Main Service on port 3001...${NC}"
cd backend/main-service
npm start > ../../logs/main.log 2>&1 &
cd ../..

sleep 3

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

# Start Wallet Service (Port 3004)
echo -e "${GREEN}🏦 Starting Wallet Service on port 3004...${NC}"
cd backend/wallet-service
npm start > ../../logs/wallet.log 2>&1 &
cd ../..

sleep 3

# Start Bet Service (Port 3005)
echo -e "${GREEN}🎯 Starting Bet Service on port 3005...${NC}"
cd backend/bet-service
npm start > ../../logs/bet.log 2>&1 &
cd ../..

sleep 3

# Start Result Service (Port 3006)
echo -e "${GREEN}🏁 Starting Result Service on port 3006...${NC}"
cd backend/result-service
npm start > ../../logs/result.log 2>&1 &
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

if check_port 3001; then
    echo -e "${GREEN}✅ Main Service: Running${NC}"
else
    echo -e "${RED}❌ Main Service: Failed${NC}"
fi

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

if check_port 3004; then
    echo -e "${GREEN}✅ Wallet Service: Running${NC}"
else
    echo -e "${RED}❌ Wallet Service: Failed${NC}"
fi

if check_port 3005; then
    echo -e "${GREEN}✅ Bet Service: Running${NC}"
else
    echo -e "${RED}❌ Bet Service: Failed${NC}"
fi

if check_port 3006; then
    echo -e "${GREEN}✅ Result Service: Running${NC}"
else
    echo -e "${RED}❌ Result Service: Failed${NC}"
fi

if check_port 3000; then
    echo -e "${GREEN}✅ Frontend: Running${NC}"
else
    echo -e "${RED}❌ Frontend: Failed${NC}"
fi

echo ""
echo -e "${GREEN}🌐 Elite Betting Platform Started!${NC}"
echo -e "${YELLOW}Frontend: http://localhost:3000${NC}"
echo ""
echo -e "${GREEN}🔧 Backend Services:${NC}"
echo -e "${YELLOW}Main Service: http://localhost:3001${NC}"
echo -e "${YELLOW}Fixtures Service: http://localhost:3002${NC}"
echo -e "${YELLOW}Odds Service: http://localhost:3003${NC}"
echo -e "${YELLOW}Wallet Service: http://localhost:3004${NC}"
echo -e "${YELLOW}Bet Service: http://localhost:3005${NC}"
echo -e "${YELLOW}Result Service: http://localhost:3006${NC}"
echo ""
echo -e "${GREEN}🎮 Admin Access:${NC}"
echo -e "${YELLOW}Login: admin@admin.com${NC}"
echo -e "${YELLOW}Password: admin123${NC}"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo "  tail -f logs/main.log"
echo "  tail -f logs/fixtures.log"
echo "  tail -f logs/odds.log"
echo "  tail -f logs/wallet.log"
echo "  tail -f logs/bet.log"
echo "  tail -f logs/result.log"
echo "  tail -f logs/frontend.log"
echo ""
echo -e "${YELLOW}To stop all services: ./stop-services.sh${NC}" 