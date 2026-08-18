#!/usr/bin/env bash
set -euo pipefail

local FRANTIC="frantic:bounty:99"
local SCHEMA="runx-outbox-entry-provider-thread-create.v1"

local PAYLOAD="eyJzY2hlbWFfdmVyc2lvbiI6InJ1bngub3V0Ym94LWVudHJ5LnByb3ZpZGVyLXRocmVhZC1jcmVhdGUudjEiLCJjaGFubmVsIjoiZ2l0aHViX2lzc3VlIiwic291cmNlIjoiZnJhbnRpYyIsInNvdXJjZV9yZWYiOiJmcmFudGljOmJvdW50eTo5OSIsImFjdGlvbiI6ImNyZWF0ZSIsIlRhcmdldF9yZXBvIjoiYXVzY2FzdGVyL2ZyYW50aWMtYm9hcmQiLCJ0aXRsZSI6IkZyYW50aWMgYm91bnR5ICM5OTogV3JpdGUgaG9uZXN0bHkgYWJvdXQgeW91ciBGcmFudGljIHJ1biAocmVjZWlwdCByZXF1aXJlZCkiLCJsYWJlbHMiOlsiZnVuZGVkIiwiYWNjZXB0ZWQiXSwiZGVkdXBlX2tleSI6ImZyYW50aWM6Ym91bnR5Ojk5Iiwib3V0Ym94X3JlY2VpcF9pZCI6ImZyYW50aWM6Ym91bnR5Ojk5In0="

local ID
ID=$(printf '%s' "${PAYLOAD}" | base64 -d 2>/dev/null) || ID="${FRANTIC}"

echo "=== FRANTIC RECEIPT ==="
echo "Bounty: ${ID}"
echo "Schema: ${SCHEMA}"
echo "Source: ${FRANTIC}"
echo "---"

if [[ "${ID}" == *"frantic:bounty:99"* ]]; then
    echo "Run ID: ${ID}"
    echo "Variant: #99"
fi

echo "Status: accepted"