#!/bin/bash
# Test Chain Connection Script
# Verifies that the chain WebSocket endpoint is reachable

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get wsUrl from .papi/polkadot-api.json
PAPI_CONFIG=".papi/polkadot-api.json"
WS_URL=$(jq -r '.entries.qfn.wsUrl' "$PAPI_CONFIG" 2>/dev/null || echo "")

if [ -z "$WS_URL" ]; then
    echo -e "${YELLOW}⚠${NC}  Could not read wsUrl from $PAPI_CONFIG"
    WS_URL="wss://test.qfnetwork.xyz"
    echo "   Using default: $WS_URL"
fi

echo "🔗 Testing connection to: $WS_URL"
echo ""

# Test using wscat if available
if command -v wscat &> /dev/null; then
    echo "Testing with wscat..."
    if timeout 5s wscat -c "$WS_URL" -x '{"id":1,"jsonrpc":"2.0","method":"system_health","params":[]}' 2>&1 | grep -q "health"; then
        echo -e "${GREEN}✅ Connection successful!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Connection failed${NC}"
        exit 1
    fi
fi

# Test using websocat if available
if command -v websocat &> /dev/null; then
    echo "Testing with websocat..."
    if echo '{"id":1,"jsonrpc":"2.0","method":"system_health","params":[]}' | timeout 5s websocat -n "$WS_URL" 2>&1 | grep -q "health"; then
        echo -e "${GREEN}✅ Connection successful!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Connection failed${NC}"
        exit 1
    fi
fi

# Fallback: Test using curl for http/https
HTTP_URL=$(echo "$WS_URL" | sed 's/wss:/https:/g' | sed 's/ws:/http:/g')
echo "Testing HTTP endpoint: $HTTP_URL"

if curl -s -X POST -H "Content-Type: application/json" -d '{"id":1,"jsonrpc":"2.0","method":"system_health","params":[]}' "$HTTP_URL" | grep -q "health"; then
    echo -e "${GREEN}✅ HTTP endpoint reachable${NC}"
    echo -e "${YELLOW}Note: WebSocket not directly tested (install wscat or websocat)${NC}"
    exit 0
else
    echo -e "${RED}❌ Cannot reach chain${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check internet connection"
    echo "  2. Verify chain URL: $WS_URL"
    echo "  3. Install wscat: npm install -g wscat"
    echo "  4. Check if chain is operational"
    exit 1
fi
