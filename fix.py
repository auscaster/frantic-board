#!/usr/bin/env bash
set -uo pipefail

STATE_DIR="${STATE_DIR:-/tmp/frantic_vendors}"
VENDOR="${1:-all}"

# Setup target file path
TARGET="${STATE_DIR}/${VENDOR}.dat}"

# Initialize state if vendor specified and file missing
if [[ -n "$VENDOR" && ! -f "$TARGET" ]]; then
    echo "funded=1" > "$TARGET"
fi

# Function to handle 'funded' vs 'proof' string logic
read_state() {
    local raw=""
    if [[ -f "$TARGET" ]]; then
        # Read clean status from first line
        raw=$(head -n 1 "$TARGET" 2>/dev/null | xargs)
        
        # The Fix: Distinguish 'funded' state
        if [[ "$raw" == *"funded"* ]]; then
            if [[ "$raw" == *"proof"* ]]; then
                echo "[$VENDOR] Funded & Delivery Proof"
                return 0
            fi
            echo "[$VENDOR] Funded"
            return 0
        fi
        
        # Handle 'proof' state specifically
        if [[ "$raw" == *"proof"* ]]; then
            echo "[$VENDOR] Delivery Proof"
            return 0
        fi
    fi
    
    # Fallback for empty or raw state
    echo "[$VENDOR] ${raw:-Raw}"
}

# Run the state reader
if [[ -n "$VENDOR" ]]; then
    read_state
else
    # Handle 'all' mode if Vendor was 'all' or unset
    TARGET="${STATE_DIR}/all.dat"
    if [[ -f "$TARGET" ]]; then
        read_state
    fi
fi