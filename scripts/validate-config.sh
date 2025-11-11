#!/bin/bash
# Configuration Validation Script
# Validates polkadot-config.json before workflow generation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default config file
CONFIG_FILE="${1:-polkadot-config.json}"

echo "🔍 Validating Polkadot dApp configuration..."
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ Error: jq is not installed${NC}"
    echo "Install with: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ Config file not found: $CONFIG_FILE${NC}"
    exit 1
fi

# Check if file is valid JSON
if ! jq empty "$CONFIG_FILE" 2>/dev/null; then
    echo -e "${RED}❌ Invalid JSON syntax in $CONFIG_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Valid JSON syntax"

# Check required fields
check_field() {
    local field=$1
    local description=$2

    if ! jq -e "$field" "$CONFIG_FILE" > /dev/null 2>&1; then
        echo -e "${RED}❌ Missing required field: $description ($field)${NC}"
        return 1
    fi
    echo -e "${GREEN}✓${NC} Found: $description"
    return 0
}

# Validate version
check_field '.version' 'Schema version' || exit 1
VERSION=$(jq -r '.version' "$CONFIG_FILE")
if [ "$VERSION" != "1.0" ]; then
    echo -e "${RED}❌ Invalid version: $VERSION (expected '1.0')${NC}"
    exit 1
fi

# Validate project fields
check_field '.project.name' 'Project name' || exit 1
check_field '.project.chain' 'Chain' || exit 1

PROJECT_NAME=$(jq -r '.project.name' "$CONFIG_FILE")
CHAIN=$(jq -r '.project.chain' "$CONFIG_FILE")

# Validate project name format (kebab-case)
if ! echo "$PROJECT_NAME" | grep -qE '^[a-z0-9-]+$'; then
    echo -e "${RED}❌ Invalid project name: $PROJECT_NAME${NC}"
    echo "   Project name must be kebab-case (lowercase letters, numbers, hyphens only)"
    exit 1
fi

# Validate project name length
if [ ${#PROJECT_NAME} -lt 3 ] || [ ${#PROJECT_NAME} -gt 50 ]; then
    echo -e "${RED}❌ Project name must be 3-50 characters${NC}"
    exit 1
fi

# Validate chain (Phase 1: QFN only)
if [ "$CHAIN" != "qfn" ]; then
    echo -e "${RED}❌ Invalid chain: $CHAIN${NC}"
    echo "   Phase 1 only supports 'qfn'"
    exit 1
fi

# Check features
check_field '.features' 'Features' || exit 1

# Check if at least one feature is enabled
ASSETS_ENABLED=$(jq -r '.features.assets.enabled // false' "$CONFIG_FILE")
BALANCES_ENABLED=$(jq -r '.features.balances.enabled // false' "$CONFIG_FILE")

if [ "$ASSETS_ENABLED" != "true" ] && [ "$BALANCES_ENABLED" != "true" ]; then
    echo -e "${RED}❌ At least one feature must be enabled${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} At least one feature enabled"

# Validate assets feature
if [ "$ASSETS_ENABLED" == "true" ]; then
    if ! jq -e '.features.assets.operations' "$CONFIG_FILE" > /dev/null 2>&1; then
        echo -e "${RED}❌ Assets feature enabled but no operations specified${NC}"
        exit 1
    fi

    OPERATIONS_COUNT=$(jq '.features.assets.operations | length' "$CONFIG_FILE")
    if [ "$OPERATIONS_COUNT" -lt 1 ]; then
        echo -e "${RED}❌ Assets feature requires at least one operation${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓${NC} Assets feature: $OPERATIONS_COUNT operations"

    # Validate operation names
    VALID_OPS=("create" "mint" "transfer" "destroy" "freeze" "thaw" "burn")
    while IFS= read -r op; do
        if [[ ! " ${VALID_OPS[@]} " =~ " ${op} " ]]; then
            echo -e "${RED}❌ Invalid asset operation: $op${NC}"
            echo "   Valid operations: ${VALID_OPS[*]}"
            exit 1
        fi
    done < <(jq -r '.features.assets.operations[]' "$CONFIG_FILE")
fi

# Validate balances feature
if [ "$BALANCES_ENABLED" == "true" ]; then
    if ! jq -e '.features.balances.operations' "$CONFIG_FILE" > /dev/null 2>&1; then
        echo -e "${RED}❌ Balances feature enabled but no operations specified${NC}"
        exit 1
    fi

    OPERATIONS_COUNT=$(jq '.features.balances.operations | length' "$CONFIG_FILE")
    if [ "$OPERATIONS_COUNT" -lt 1 ]; then
        echo -e "${RED}❌ Balances feature requires at least one operation${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓${NC} Balances feature: $OPERATIONS_COUNT operations"

    # Validate operation names
    VALID_OPS=("transfer" "transfer_keep_alive" "transfer_all")
    while IFS= read -r op; do
        if [[ ! " ${VALID_OPS[@]} " =~ " ${op} " ]]; then
            echo -e "${RED}❌ Invalid balance operation: $op${NC}"
            echo "   Valid operations: ${VALID_OPS[*]}"
            exit 1
        fi
    done < <(jq -r '.features.balances.operations[]' "$CONFIG_FILE")
fi

# Validate UI configuration (optional but check if present)
if jq -e '.ui.branding.appName' "$CONFIG_FILE" > /dev/null 2>&1; then
    APP_NAME=$(jq -r '.ui.branding.appName' "$CONFIG_FILE")
    if [ ${#APP_NAME} -lt 3 ] || [ ${#APP_NAME} -gt 50 ]; then
        echo -e "${YELLOW}⚠${NC}  App name should be 3-50 characters"
    else
        echo -e "${GREEN}✓${NC} UI branding configured"
    fi
fi

# Validate advanced configuration
if jq -e '.advanced.queryStaleTime' "$CONFIG_FILE" > /dev/null 2>&1; then
    STALE_TIME=$(jq -r '.advanced.queryStaleTime' "$CONFIG_FILE")
    if [ "$STALE_TIME" -lt 1000 ] || [ "$STALE_TIME" -gt 300000 ]; then
        echo -e "${YELLOW}⚠${NC}  queryStaleTime should be 1000-300000 ms"
    fi
fi

if jq -e '.advanced.toastDuration' "$CONFIG_FILE" > /dev/null 2>&1; then
    TOAST_DURATION=$(jq -r '.advanced.toastDuration' "$CONFIG_FILE")
    if [ "$TOAST_DURATION" -lt 5000 ] || [ "$TOAST_DURATION" -gt 60000 ]; then
        echo -e "${YELLOW}⚠${NC}  toastDuration should be 5000-60000 ms"
    fi
fi

echo ""
echo -e "${GREEN}✅ Configuration validation passed!${NC}"
echo ""
echo "Configuration Summary:"
echo "  Project: $PROJECT_NAME"
echo "  Chain: $CHAIN"
echo "  Assets: $ASSETS_ENABLED"
echo "  Balances: $BALANCES_ENABLED"
echo ""

exit 0
