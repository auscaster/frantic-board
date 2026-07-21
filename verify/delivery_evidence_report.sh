#!/bin/bash

# Generate a public delivery evidence report for a bounty
# Usage: ./delivery_evidence_report.sh <bounty_id> <delivery_artifact>

set -euo pipefail

if [ $# -ne 2 ]; then
    echo "Usage: $0 <bounty_id> <delivery_artifact>"
    exit 1
fi

BOUNTY_ID=$1
DELIVERY_ARTIFACT=$2
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
REPORT_FILE="delivery_evidence_${BOUNTY_ID}.md"

cat > "$REPORT_FILE" <<EOF
# Delivery Evidence Report for Bounty #${BOUNTY_ID}

## Metadata
- **Generated at**: ${TIMESTAMP}
- **Bounty ID**: ${BOUNTY_ID}
- **Delivery Artifact**: ${DELIVERY_ARTIFACT}

## Verification Steps
1. Verify the delivery artifact exists and is accessible
2. Check the artifact against the bounty's acceptance criteria
3. Confirm the artifact was delivered within the bounty's deadline

## Verification Results
[ ] Artifact exists and is accessible
[ ] Artifact meets acceptance criteria
[ ] Artifact delivered on time

## Notes
- This report is generated automatically as part of the bounty verification process
- The verification steps are machine-checkable where possible
- Human judgment may be required for some verification steps

EOF

echo "Delivery evidence report generated: $REPORT_FILE"