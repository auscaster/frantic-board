#!/usr/bin/env bash
# Usage: ./verify/61-check-ci-failure-skill.sh <skill-dir>
# Verifies the machine floor for bounty 61: CI failure triage and classification skill.
set -euo pipefail

DIR="${1:?usage: $0 <skill-dir>}"
fail() { echo "FAIL: $1" >&2; exit 1; }

[ -d "$DIR" ] || fail "skill dir not found: $DIR"
[ -f "$DIR/SKILL.md" ] || fail "missing SKILL.md"
[ -f "$DIR/X.yaml" ] || fail "missing X.yaml"

# Check SKILL.md mentions CI failure triage/classification
grep -qiE "ci[ -]?fail|triage|classif" "$DIR/SKILL.md" || fail "SKILL.md does not reference CI failure triage or classification"

# Check X.yaml has required blocks
grep -q "catalog:" "$DIR/X.yaml" || fail "X.yaml missing catalog block"
grep -q "harness:" "$DIR/X.yaml" || fail "X.yaml missing harness block"

# Check for a classification mapping or script (optional, but recommended)
if [ -f "$DIR/classify.yaml" ] || [ -f "$DIR/classify.py" ] || [ -f "$DIR/classify.sh" ]; then
  echo "  classification artifact found"
fi

# Ensure no unsafe network patterns (SSRF etc.) – if the skill calls external APIs, it must use runx governed tools
if grep -qrE "curl|wget|requests|fetch" "$DIR" 2>/dev/null; then
  # If it does network calls, require runx tool manifest
  grep -q "runx.tool.manifest.v1" "$DIR/X.yaml" 2>/dev/null || echo "WARNING: network calls detected but no governed tool reference found; REVIEW: must use runx governed tools"
fi

echo "PASS: CI failure triage skill package structure is valid"
