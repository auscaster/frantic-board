#!/usr/bin/env bash
# Usage: ./verify/09-check-sourcey-docs.sh [docs-path]
#   Default docs-path is docs/sourcey/README.md
# Verifies that Sourcey documentation exists, contains required sections,
# and references the expected commands and links.
set -euo pipefail

DOCS="${1:-docs/sourcey/README.md}"

fail() { echo "FAIL: $1" >&2; exit 1; }

[ -f "$DOCS" ] || fail "Documentation file not found: $DOCS"

# Check required sections using grep
required=(
  "npm install -g sourcey"
  "npx sourcey init"
  "sourcey build"
  "sourcey.com/docs"
)

for pattern in "${required[@]}"; do
  if ! grep -qiF "$pattern" "$DOCS"; then
    fail "Missing required content: '$pattern'"
  fi
done

# Check that the file is valid Markdown (basic: contains at least one heading)
if ! grep -qE '^#' "$DOCS"; then
  fail "Documentation does not contain any Markdown headings"
fi

echo "PASS: Sourcey documentation exists, contains required commands and links"
