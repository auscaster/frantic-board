#!/bin/bash

# Verify a bounty delivery and generate evidence report
# Usage: ./verify_bounty.sh <bounty_id> <delivery_artifact>

set -euo pipefail

if [ $# -ne 2 ]; then
    echo "Usage: $0 <bounty_id> <delivery_artifact>"
    exit 1
fi

BOUNTY_ID=$1
DELIVERY_ARTIFACT=$2

# Verify the bounty exists and is funded
if ! runx verify frantic:bounty:${BOUNTY_ID}; then
    echo "Error: Bounty #${BOUNTY_ID} is not valid or funded"
    exit 1
fi

# Generate delivery evidence report
../verify/delivery_evidence_report.sh "${BOUNTY_ID}" "${DELIVERY_ARTIFACT}"

# Verify the delivery artifact
if [ ! -f "${DELIVERY_ARTIFACT}" ]; then
    echo "Error: Delivery artifact not found: ${DELIVERY_ARTIFACT}"
    exit 1
fi

# Additional verification steps would go here
# For example, checking file size, format, or content

echo "Bounty #${BOUNTY_ID} delivery verified successfully"