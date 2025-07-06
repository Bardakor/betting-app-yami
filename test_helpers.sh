#!/bin/bash

# Test script for demo helper functions

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Helper functions
safe_json_format() {
    local json_data="$1"
    if [ -n "$json_data" ] && [ "$json_data" != "null" ] && [ "$json_data" != "" ]; then
        echo "$json_data" | jq . 2>/dev/null || echo "$json_data"
    else
        echo -e "${PURPLE}   (Empty or invalid response)${NC}"
    fi
}

safe_extract_field() {
    local json_data="$1"
    local field="$2"
    if [ -n "$json_data" ] && [ "$json_data" != "null" ] && [ "$json_data" != "" ]; then
        echo "$json_data" | jq -r ".$field" 2>/dev/null || echo ""
    else
        echo ""
    fi
}

echo "Testing helper functions..."

# Test 1: Valid JSON
echo -e "\n${BLUE}Test 1: Valid JSON${NC}"
test_json='{"token": "abc123", "user": {"id": "user123"}}'
echo "Input: $test_json"
echo "safe_json_format output:"
safe_json_format "$test_json"
echo "Token extraction: $(safe_extract_field "$test_json" "token")"
echo "User ID extraction: $(safe_extract_field "$test_json" "user.id")"

# Test 2: Empty response
echo -e "\n${BLUE}Test 2: Empty response${NC}"
test_empty=""
echo "Input: (empty)"
echo "safe_json_format output:"
safe_json_format "$test_empty"
echo "Token extraction: '$(safe_extract_field "$test_empty" "token")'"

# Test 3: Invalid JSON
echo -e "\n${BLUE}Test 3: Invalid JSON${NC}"
test_invalid="This is not JSON"
echo "Input: $test_invalid"
echo "safe_json_format output:"
safe_json_format "$test_invalid"
echo "Token extraction: '$(safe_extract_field "$test_invalid" "token")'"

# Test 4: Null response
echo -e "\n${BLUE}Test 4: Null response${NC}"
test_null="null"
echo "Input: $test_null"
echo "safe_json_format output:"
safe_json_format "$test_null"
echo "Token extraction: '$(safe_extract_field "$test_null" "token")'"

echo -e "\n${GREEN}✅ All tests completed!${NC}"
