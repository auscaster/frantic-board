#!/usr/bin/env bash
# Usage: ./verify/check-valid-json.sh <json-file>
set -euo pipefail

FILE=""

fail() { echo "FAIL: " >&2; exit 1; }

[ -f "" ] || fail "file not found: "

if command -v python3 >/dev/null 2>&1; then
  python3 -c "import json, sys; json.load(open(sys.argv[1]))" "" >/dev/null 2>&1 || fail "invalid json"
else
  python -c "import json, sys; json.load(open(sys.argv[1]))" "" >/dev/null 2>&1 || fail "invalid json"
fi

echo "PASS: valid json"
