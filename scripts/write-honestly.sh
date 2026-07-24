#!/bin/bash
set -euo pipefail

usage() {
    echo "Usage: $0 <receipt-url>"
    echo "Example: $0 https://gofrantic.com/r/ae31b532"
    exit 1
}

if [ $# -ne 1 ]; then
    echo "Error: Receipt URL is required."
    usage
fi

RECEIPT_URL="$1"

# Validate receipt URL format
if [[ ! "$RECEIPT_URL" =~ ^https://gofrantic\.com/r/[a-f0-9]{8}$ ]]; then
    echo "Error: Invalid receipt URL. Must match https://gofrantic.com/r/<8-hex-digits>"
    exit 2
fi

# Check if receipt is accessible (simulate verification)
if ! curl -sfI "$RECEIPT_URL" > /dev/null 2>&1; then
    echo "Error: Receipt URL is not reachable or invalid."
    exit 3
fi

echo "Receipt verified. Please write honestly about your Frantic run."
echo "Enter your write-up (Ctrl+D to finish):"

WRITEUP=$(cat)
if [ -z "$WRITEUP" ]; then
    echo "Error: Write-up cannot be empty."
    exit 4
fi

# Extract receipt hash for filename
HASH=$(echo "$RECEIPT_URL" | grep -oP '[a-f0-9]{8}')
FILENAME="assets/receipt-${HASH}.txt"

# Ensure assets directory exists
mkdir -p assets

echo "$WRITEUP" > "$FILENAME"
echo "Write-up saved to $FILENAME"

# Output the submission metadata (mirrors the outbox format)
echo "Submission complete."
