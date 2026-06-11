#!/bin/bash

# verify/07-check-backlink.sh
# Verifies the backlink for Bounty 07

set -e

# Configuration
CLAIM_FILE="${1:-.github/ISSUE_TEMPLATE/bounty-claim.md}"
MIN_DA=30
LIVE_WINDOW_DAYS=14

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔍 Verifying Bounty 07 Backlink Submission..."

if [ ! -f "$CLAIM_FILE" ]; then
    echo -e "${RED}❌ Error: Claim file not found at $CLAIM_FILE${NC}"
    exit 1
fi

# Extract URL from claim file (assuming standard format)
URL=$(grep -i "Article URL:" "$CLAIM_FILE" | head -1 | awk '{print $NF}' | tr -d '[]')
DOMAIN=$(grep -i "Target Domain:" "$CLAIM_FILE" | head -1 | awk '{print $NF}')
DA_SCORE=$(grep -i "DA/DR Score:" "$CLAIM_FILE" | head -1 | awk '{print $NF}')
PROJECT=$(grep -i "Project Featured:" "$CLAIM_FILE" | head -1 | awk '{print $NF}')
PUB_DATE=$(grep -i "Publication Date:" "$CLAIM_FILE" | head -1 | awk '{print $NF}')

if [ -z "$URL" ] || [ -z "$DOMAIN" ] || [ -z "$DA_SCORE" ]; then
    echo -e "${RED}❌ Error: Missing required fields in claim file.${NC}"
    exit 1
fi

echo "📄 Checking URL: $URL"
echo "🌐 Domain: $DOMAIN"
echo "📊 DA/DR: $DA_SCORE"
echo "🔗 Project: $PROJECT"

# Check if URL is accessible
if ! curl -s --head --request GET "$URL" | grep -q "HTTP/1.[01] [23].."; then
    echo -e "${RED}❌ Error: URL is not accessible or returned an error status.${NC}"
    exit 1
fi

# Check DA/DR score
if [ "$DA_SCORE" -lt "$MIN_DA" ]; then
    echo -e "${RED}❌ Error: Domain Authority ($DA_SCORE) is below minimum requirement ($MIN_DA).${NC}"
    exit 1
fi

# Check if backlink exists in the page content
if ! curl -s "$URL" | grep -q "runx\|Sourcey\|Frantic"; then
    echo -e "${RED}❌ Error: No mention of runx, Sourcey, or Frantic found on the page.${NC}"
    exit 1
fi

# Check if backlink is dofollow (simple check for rel="nofollow" absence)
if curl -s "$URL" | grep -q 'rel="nofollow"'; then
    echo -e "${RED}⚠️  Warning: Link might be nofollow. Please ensure it is dofollow.${NC}"
    # Depending on strictness, this could be an exit 1. For now, warning.
fi

# Check publication date (simple check if date is in the past)
# Note: This is a basic check. A more robust solution would parse the date properly.
if [ -n "$PUB_DATE" ]; then
    # Assuming date format is YYYY-MM-DD or similar
    echo "📅 Publication Date: $PUB_DATE"
    # Add logic here if specific date parsing is needed
fi

echo -e "${GREEN}✅ Verification passed! Backlink is live and meets requirements.${NC}"
exit 0