#!/bin/bash

echo "🧹 Cleaning up previous processes..."

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

# Also check MongoDB port 27017
pid=$(lsof -ti tcp:27017)
if [ ! -z "$pid" ]; then
  echo "MongoDB port 27017 is already in use by process $pid"
fi

# Wait again to ensure ports are free
sleep 1

echo "🐳 Starting MongoDB with Docker Compose..."

# Stop any existing Docker containers
docker-compose down 2>/dev/null

# Start MongoDB and Mongo Express
docker-compose up -d

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if docker-compose exec -T mongodb mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is ready!"
    break
  fi
  
  echo "⏳ MongoDB not ready yet... ($((attempt + 1))/$max_attempts)"
  sleep 2
  attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ MongoDB failed to start after $max_attempts attempts"
  echo "🔍 Checking Docker logs..."
  docker-compose logs mongodb
  exit 1
fi

echo "🌐 MongoDB running on: http://localhost:27017"
echo "🖥️  Mongo Express running on: http://localhost:8081"
echo ""
echo "🚀 Starting application services..."

# Start all services
npm run dev