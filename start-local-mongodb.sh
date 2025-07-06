#!/bin/bash

DB_PATH="$(pwd)/mongodb-data"
mkdir -p "$DB_PATH"

# Stop and remove existing MongoDB container if it exists
docker stop betting-mongodb 2>/dev/null
docker rm betting-mongodb 2>/dev/null

# Start MongoDB without authentication with persistent volume
echo "Starting MongoDB without authentication (data dir: $DB_PATH)..."
docker run --name betting-mongodb -d \
  -p 27017:27017 \
  -v "$DB_PATH":/data/db \
  -v $(pwd)/setup-local-mongodb.js:/docker-entrypoint-initdb.d/setup-local-mongodb.js:ro \
  mongo:latest --noauth

# Wait for MongoDB to start
echo "Waiting for MongoDB to start..."
sleep 5

echo "MongoDB started successfully!"
echo "Connect to MongoDB at: mongodb://localhost:27017"
echo "Databases created: betting_main, betting_bets, betting_wallet, betting_results" 