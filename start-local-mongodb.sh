#!/bin/bash

# Stop and remove existing MongoDB container if it exists
docker stop betting-mongodb 2>/dev/null
docker rm betting-mongodb 2>/dev/null

# Start MongoDB without authentication
echo "Starting MongoDB without authentication..."
docker run --name betting-mongodb -d \
  -p 27017:27017 \
  -v $(pwd)/setup-local-mongodb.js:/docker-entrypoint-initdb.d/setup-local-mongodb.js:ro \
  mongo:latest --noauth

# Wait for MongoDB to start
echo "Waiting for MongoDB to start..."
sleep 5

echo "MongoDB started successfully!"
echo "Connect to MongoDB at: mongodb://localhost:27017"
echo "Databases created: betting_main, betting_bets, betting_wallet, betting_results" 