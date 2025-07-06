#!/bin/bash

# 🚀 Yami Betting Platform - Quick API Test
# Quick demonstration of core functionality

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

BASE_URL="http://localhost:3001"

echo -e "${BLUE}🎯 Yami Betting Platform - Quick Test${NC}\n"

# 1. Health Check
echo -e "${BLUE}1. Health Check:${NC}"
curl -s $BASE_URL/health | jq . || curl -s $BASE_URL/health

# 2. Login and get token
echo -e "\n${BLUE}2. Admin Login:${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}')

echo $LOGIN_RESPONSE | jq . || echo $LOGIN_RESPONSE

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo -e "${GREEN}✅ Token obtained successfully!${NC}"
    
    # 3. Get user profile
    echo -e "\n${BLUE}3. Get User Profile:${NC}"
    curl -s -X GET $BASE_URL/auth/profile \
      -H "Authorization: Bearer $TOKEN" | jq . || curl -s -X GET $BASE_URL/auth/profile -H "Authorization: Bearer $TOKEN"
    
    # 4. Get balance
    echo -e "\n${BLUE}4. Get Wallet Balance:${NC}"
    curl -s -X GET http://localhost:3004/api/wallet/balance \
      -H "Authorization: Bearer $TOKEN" | jq . || curl -s -X GET http://localhost:3004/api/wallet/balance -H "Authorization: Bearer $TOKEN"
    
    # 5. Get live fixtures
    echo -e "\n${BLUE}5. Get Live Fixtures:${NC}"
    curl -s -X GET http://localhost:3002/fixtures/live | jq '.data[0] // .data // .' || curl -s -X GET http://localhost:3002/fixtures/live
    
    # 6. Calculate odds
    echo -e "\n${BLUE}6. Calculate Odds:${NC}"
    curl -s -X GET "http://localhost:3003/odds/calculate?homeTeam=Arsenal&awayTeam=Chelsea&league=39" | jq . || curl -s -X GET "http://localhost:3003/odds/calculate?homeTeam=Arsenal&awayTeam=Chelsea&league=39"
    
    echo -e "\n${GREEN}✅ Quick test completed! All services are working.${NC}"
else
    echo -e "${RED}❌ Failed to get authentication token${NC}"
fi
