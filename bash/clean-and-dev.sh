#!/bin/bash

# Kill all node, nodemon, and next dev processes
pkill -f "node.*src/index.js" 2>/dev/null
pkill -f "nodemon" 2>/dev/null
pkill -f "next dev" 2>/dev/null

# Wait a moment for processes to terminate
sleep 2

# Free up ports 3000-3006
for port in {3000..3006}; do
  pid=$(lsof -ti tcp:$port)
  if [ ! -z "$pid" ]; then
    echo "Killing process $pid on port $port"
    kill -9 $pid
  fi
done

# Wait again to ensure ports are free
sleep 1

# Start all services
npm run dev 