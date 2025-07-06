#!/bin/bash

echo "🚀 Starting Elite Betting Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to check if a command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}Error: $1 is not installed. Please install $1 and try again.${NC}"
        exit 1
    fi
}

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

# Function to check service health
check_service() {
    local port=$1
    local service_name=$2
    if curl -s http://localhost:$port/health > /dev/null 2>&1 || curl -s http://localhost:$port > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⏳ $service_name is starting...${NC}"
        return 1
    fi
}

echo "🔍 Checking prerequisites..."
check_command node
check_command npm
check_command curl

echo -e "${CYAN}📦 Installing dependencies...${NC}"

# Install root dependencies
if [ ! -d node_modules ] || [ package.json -nt node_modules ]; then
    npm install
    echo -e "${GREEN}Root dependencies installed${NC}"
else
    echo -e "${GREEN}Root dependencies already up to date${NC}"
fi

# Install API Gateway dependencies
echo -e "${CYAN}Installing API Gateway dependencies...${NC}"
cd backend/api-gateway
if [ ! -d node_modules ] || [ package.json -nt node_modules ]; then
    npm install
    echo -e "${GREEN}API Gateway dependencies installed${NC}"
else
    echo -e "${GREEN}API Gateway dependencies already up to date${NC}"
fi
cd ../..

# Install backend dependencies
echo -e "${CYAN}Installing backend dependencies...${NC}"
for service in main-service fixtures-service odds-service wallet-service bet-service result-service; do
    echo -e "${BLUE}Installing $service dependencies...${NC}"
    cd backend/$service
    if [ ! -d node_modules ] || [ package.json -nt node_modules ]; then
        npm install
        echo -e "${GREEN}$service dependencies installed${NC}"
    else
        echo -e "${GREEN}$service dependencies already up to date${NC}"
    fi
    cd ../..
done

# Install frontend dependencies
echo -e "${CYAN}Installing frontend dependencies...${NC}"
cd frontend
if [ ! -d node_modules ] || [ package.json -nt node_modules ]; then
    npm install
    echo -e "${GREEN}Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}Frontend dependencies already up to date${NC}"
fi
cd ..

echo -e "${RED}🧹 Cleaning up existing processes...${NC}"
# Kill existing processes on all ports
ports=(3000 3001 3002 3003 3004 3005 3006 8000)
for port in "${ports[@]}"; do
    kill_port $port
done

# Create logs directory
mkdir -p logs

echo -e "${GREEN}🚀 Starting backend microservices...${NC}"

# Start API Gateway (Port 8000)
echo -e "${PURPLE}🌐 Starting API Gateway on port 8000...${NC}"
cd backend/api-gateway
npm start > ../../logs/gateway.log 2>&1 &
GATEWAY_PID=$!
cd ../..

sleep 2

# Start Main Service (Port 3001)
echo -e "${GREEN}🔑 Starting Main Service on port 3001...${NC}"
cd backend/main-service
npm start > ../../logs/main.log 2>&1 &
MAIN_PID=$!
cd ../..

sleep 2

# Start Fixtures Service (Port 3002)
echo -e "${GREEN}📡 Starting Fixtures Service on port 3002...${NC}"
cd backend/fixtures-service
npm start > ../../logs/fixtures.log 2>&1 &
FIXTURES_PID=$!
cd ../..

sleep 2

# Start Odds Service (Port 3003)
echo -e "${GREEN}🎲 Starting Odds Service on port 3003...${NC}"
cd backend/odds-service
npm start > ../../logs/odds.log 2>&1 &
ODDS_PID=$!
cd ../..

sleep 2

# Start Wallet Service (Port 3004)
echo -e "${GREEN}🏦 Starting Wallet Service on port 3004...${NC}"
cd backend/wallet-service
npm start > ../../logs/wallet.log 2>&1 &
WALLET_PID=$!
cd ../..

sleep 2

# Start Bet Service (Port 3005)
echo -e "${GREEN}🎯 Starting Bet Service on port 3005...${NC}"
cd backend/bet-service
npm start > ../../logs/bet.log 2>&1 &
BET_PID=$!
cd ../..

sleep 2

# Start Result Service (Port 3006)
echo -e "${GREEN}🏁 Starting Result Service on port 3006...${NC}"
cd backend/result-service
npm start > ../../logs/result.log 2>&1 &
RESULT_PID=$!
cd ../..

sleep 3

# Start Frontend (Port 3000)
echo -e "${GREEN}🎨 Starting Frontend on port 3000...${NC}"
cd frontend

# Create or update environment file
if [ ! -f .env.local ]; then
    echo -e "${CYAN}Creating environment configuration...${NC}"
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME="Elite Betting Platform"
NEXT_PUBLIC_APP_DESCRIPTION="Elite betting platform with microservices architecture"
EOF
    echo -e "${GREEN}Environment file created${NC}"
fi

npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Save PIDs for cleanup
mkdir -p .pids
echo $GATEWAY_PID > .pids/gateway.pid
echo $MAIN_PID > .pids/main.pid
echo $FIXTURES_PID > .pids/fixtures.pid
echo $ODDS_PID > .pids/odds.pid
echo $WALLET_PID > .pids/wallet.pid
echo $BET_PID > .pids/bet.pid
echo $RESULT_PID > .pids/result.pid
echo $FRONTEND_PID > .pids/frontend.pid

echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 5

# Check service status
echo -e "${CYAN}🔍 Checking service status...${NC}"

for i in {1..15}; do
    all_ready=true
    
    if ! check_service 8000 "API Gateway"; then all_ready=false; fi
    if ! check_service 3001 "Main Service"; then all_ready=false; fi
    if ! check_service 3002 "Fixtures Service"; then all_ready=false; fi
    if ! check_service 3003 "Odds Service"; then all_ready=false; fi
    if ! check_service 3004 "Wallet Service"; then all_ready=false; fi
    if ! check_service 3005 "Bet Service"; then all_ready=false; fi
    if ! check_service 3006 "Result Service"; then all_ready=false; fi
    if ! check_service 3000 "Frontend"; then all_ready=false; fi
    
    if $all_ready; then
        break
    fi
    
    if [ $i -eq 15 ]; then
        echo -e "${YELLOW}Some services may still be starting. Check logs in logs/ if needed.${NC}"
        break
    fi
    
    sleep 3
done

echo ""
echo -e "${GREEN}🎉 Elite Betting Platform is running!${NC}"
echo ""
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}           ACCESS POINTS${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${CYAN}🎨 Frontend Application: ${YELLOW}http://localhost:3000${NC}"
echo -e "${CYAN}🌐 API Gateway: ${YELLOW}http://localhost:8000${NC}"
echo -e "${CYAN}📚 API Documentation: ${YELLOW}http://localhost:8000/docs${NC}"
echo -e "${CYAN}🧪 API Test Interface: ${YELLOW}file://$(pwd)/api-test-interface.html${NC}"
echo ""
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}        INDIVIDUAL SERVICES${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}🔑 Main Service: ${YELLOW}http://localhost:3001${NC}"
echo -e "${GREEN}📡 Fixtures Service: ${YELLOW}http://localhost:3002${NC}"
echo -e "${GREEN}🎲 Odds Service: ${YELLOW}http://localhost:3003${NC}"
echo -e "${GREEN}🏦 Wallet Service: ${YELLOW}http://localhost:3004${NC}"
echo -e "${GREEN}🎯 Bet Service: ${YELLOW}http://localhost:3005${NC}"
echo -e "${GREEN}🏁 Result Service: ${YELLOW}http://localhost:3006${NC}"
echo ""
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}          MANAGEMENT${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}📊 View logs: ${YELLOW}tail -f logs/*.log${NC}"
echo -e "${BLUE}🔄 Stop all services: ${YELLOW}bash stop_all.sh${NC}"
echo -e "${BLUE}🧹 Clean all: ${YELLOW}bash clean_all.sh${NC}"
echo ""
echo -e "${GREEN}🎮 Admin Access:${NC}"
echo -e "${YELLOW}Login: admin@admin.com${NC}"
echo -e "${YELLOW}Password: admin123${NC}"
echo ""
echo -e "${CYAN}Frontend is starting... Please wait 10-15 seconds then visit:${NC}"
echo -e "${YELLOW}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop this script (services will continue running)${NC}"
echo -e "${BLUE}Use 'bash stop_all.sh' to stop all services${NC}"

# Trap Ctrl+C
trap 'echo ""; echo -e "${YELLOW}Services are still running. Use \"bash stop_all.sh\" to stop them.${NC}"; exit 0' INT

# Keep script running
while true; do 
    sleep 1
done
