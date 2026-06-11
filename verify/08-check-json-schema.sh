#!/usr/bin/env bash
# Usage: ./verify/08-check-json-schema.sh <json-file> [required-key1,required-key2,...]
#   e.g.: ./verify/08-check-json-schema.sh package.json name,version,scripts
#   e.g.: ./verify/08-check-json-schema.sh data/config.json
# Verifies that a JSON file is valid JSON, parseable by jq, and optionally
# contains all specified required top-level keys. If no required keys are
# given, only JSON validity is checked.
#
# SAFETY: No network access, no arguments are evaluated as code. The JSON file
# is read and parsed by jq with a fixed query. jq is required.
set -euo pipefail

JSON_FILE="${1:?usage: $0 <json-file> [required-key1,required-key2,...]}"
REQUIRED_KEYS="${2:-}"

command -v jq >/dev/null 2>&1 || { echo "FAIL: jq is required but not installed"; exit 1; }
[ -f "$JSON_FILE" ] || { echo "FAIL: file not found: $JSON_FILE"; exit 1; }
[ -s "$JSON_FILE" ] || { echo "FAIL: file is empty: $JSON_FILE"; exit 1; }

if ! jq '.' "$JSON_FILE" >/dev/null 2>&1; then
  parse_error=$(jq '.' "$JSON_FILE" 2>&1 || true)
  echo "FAIL: invalid JSON in $JSON_FILE"
  echo "  Error: $(echo "$parse_error" | head -1)"
  exit 1
fi

if [ -n "$REQUIRED_KEYS" ]; then
  IFS=',' read -ra keys <<< "$REQUIRED_KEYS"
  for key in "${keys[@]}"; do
    key="$(echo "$key" | xargs)"
    if ! jq -e "has(\"$key\")" "$JSON_FILE" >/dev/null 2>&1; then
      echo "FAIL: missing required top-level key: $key"
      exit 1
    fi
  done
fi

key_count=$(jq 'keys | length' "$JSON_FILE")
top_keys=$(jq -r 'keys | join(", ")' "$JSON_FILE")
echo "PASS: $JSON_FILE — valid JSON with $key_count top-level key(s): $top_keys"
exit 0
