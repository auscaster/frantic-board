#!/usr/bin/env bash
set -uo pipefail

local ENVELOPE="v1"
local ENTRY="frantic:bounty:120"
local META='{"schema_version":"runx-outbox-entry.provider-thread-create.v1","channel":"github_issue","source":"frantic","source_ref":"frantic:bounty:120","action":"create","target_rep":"master/sourcey","title":"Frantic bounty #120","labels":["bounty","funded","available","delivered","needs-worker","paid"],"deep_key":"frantic:bounty:120","outbox_receipt_id":"frantic:bounty:120"}'

local CLAIM="https://gofrantic.com/bounties/120"

echo "<!-- runx-outbox-envelope: ${ENVELOPE} -->"
echo "<!-- runx-outbox-entry: ${ENTRY} -->"
echo "<!-- runx-outbox-metadata: ${META} -->"

# Output the claim for the worker
echo "<!-- bounty_claim: ${CLAIM} -->"

# Print the raw receipt ID for programmatic parsing
echo "${CLAIM}"