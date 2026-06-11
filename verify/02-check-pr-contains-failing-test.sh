#!/usr/bin/env bash
# Usage: ./verify/02-check-pr-contains-failing-test.sh <patch-file>
# Verifies that a PR diff/patch touches at least one test file and at least one non-test file.
set -euo pipefail

PATCH="${1:?usage: $0 <patch-file>}"

fail() { echo "FAIL: $1" >&2; exit 1; }

[ -f "$PATCH" ] || fail "patch file not found: $PATCH"

FILES=$(grep -E "^diff --git " "$PATCH" | awk '{print $3}' | sed "s/^a\///") || true

[ -n "$FILES" ] || fail "No files changed in patch"

HAS_TEST=0
HAS_CODE=0

for file in $FILES; do
  if [[ "$file" == *"test"* ]] || [[ "$file" == *".spec."* ]]; then
    HAS_TEST=1
  else
    HAS_CODE=1
  fi
done

if [ "$HAS_TEST" -eq 0 ]; then
  fail "PR does not contain changes to any test file"
fi

if [ "$HAS_CODE" -eq 0 ]; then
  fail "PR only touches test files; does not contain an actual fix (non-test code)"
fi

echo "PASS: PR touches both test and non-test code"

