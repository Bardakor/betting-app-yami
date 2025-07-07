#!/bin/bash

echo "🚀 Starting Mini Betting Platform..."

# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
for port in 3000 3001 3002 3003 3004; do
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
done

# Wait a moment for ports to be released
sleep 2

echo "🚀 Starting services..."

# Start services in background
cd backend/main-service && PORT=3001 npm run dev &
MAIN_PID=$!

cd ../betting-service && PORT=3002 npm run dev &
BETTING_PID=$!

cd ../fixtures-service && PORT=3003 npm run dev &
FIXTURES_PID=$!

cd ../../frontend && PORT=3000 npm start &
FRONTEND_PID=$!

echo "✅ Services started:"
echo "   📱 Frontend: http://localhost:3000"
echo "   🔐 Main Service: http://localhost:3001"
echo "   🎰 Betting Service: http://localhost:3002"
echo "   ⚽ Fixtures Service: http://localhost:3003"
echo ""
echo "📋 PIDs: Main=$MAIN_PID, Betting=$BETTING_PID, Fixtures=$FIXTURES_PID, Frontend=$FRONTEND_PID"
echo ""
echo "💡 Press Ctrl+C to stop all services"

# Wait for user to stop
wait
