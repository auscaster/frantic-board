#!/usr/bin/env bash
# Usage: ./verify/08-check-delivery-artifact-linter.sh
# Verifies the delivery artifact linter pass/fail fixtures.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT/scripts/delivery-artifact-linter.mjs"
FIXTURES="$ROOT/verify/fixtures/delivery-artifact-linter"

fail() { echo "FAIL: $1" >&2; exit 1; }

command -v node >/dev/null 2>&1 || fail "node is required"
[ -f "$SCRIPT" ] || fail "missing linter script"

node "$SCRIPT" \
  --bounty "$FIXTURES/bounty-41.json" \
  --artifacts-file "$FIXTURES/pass-artifacts.json" \
  --no-network \
  > /tmp/frantic-delivery-artifact-linter-pass.json

if node "$SCRIPT" \
  --bounty "$FIXTURES/bounty-37-runx-skill.json" \
  --artifacts-file "$FIXTURES/fail-artifacts.json" \
  --no-network \
  > /tmp/frantic-delivery-artifact-linter-fail.json; then
  fail "failing fixture unexpectedly passed"
fi

node -e "const fs=require('fs'); const pass=JSON.parse(fs.readFileSync('/tmp/frantic-delivery-artifact-linter-pass.json','utf8')); if (!pass.ok) process.exit(1); const fail=JSON.parse(fs.readFileSync('/tmp/frantic-delivery-artifact-linter-fail.json','utf8')); if (fail.ok || fail.errors.length < 4) process.exit(1);"

echo "PASS: delivery artifact linter distinguishes pass/fail fixtures"
