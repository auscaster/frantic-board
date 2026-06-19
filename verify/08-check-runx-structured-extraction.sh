#!/usr/bin/env bash
# Usage: ./verify/08-check-runx-structured-extraction.sh <skill-dir>
# Verifies the machine floor for bounty 22: runx skill for structured extraction.
# Checks that the skill package includes SKILL.md with extraction guidance,
# X.yaml with an extraction tool definition and structured output schema.
set -euo pipefail

DIR="${1:?usage: $0 <skill-dir>}"
fail() { echo "FAIL: $1" >&2; exit 1; }

[ -d "$DIR" ] || fail "skill dir not found: $DIR"
[ -f "$DIR/SKILL.md" ] || fail "missing SKILL.md"
[ -f "$DIR/X.yaml" ] || fail "missing X.yaml"

# SKILL.md must mention structured extraction and provide guidance on edge cases
rg -qi "structured extraction|extract structured|schema|output format" "$DIR/SKILL.md" \
  || fail "SKILL.md missing structured extraction keyword or output format guidance"

rg -qi "timeout|rate limit|error|retry|fallback" "$DIR/SKILL.md" \
  || fail "SKILL.md lacks execution/governance edge-case guidance"

# X.yaml must contain an extraction tool (tool type 'http' or 'extraction')
rg -q "runx.tool.manifest.v1" "$DIR/X.yaml" \
  || fail "X.yaml missing runx tool manifest v1"

rg -qi "type:.*http|type:.*extraction" "$DIR/X.yaml" \
  || fail "X.yaml missing extraction-related tool type"

# Optional: check for structured output schema (e.g., output: schema)
if rg -qi "output:\s*\n.*schema" "$DIR/X.yaml"; then
  echo "INFO: structured output schema found in X.yaml"
else
  echo "WARNING: no structured output schema defined in X.yaml"
fi

# X.yaml must have catalog and harness blocks as per bounty 05 baseline
rg -q "catalog:" "$DIR/X.yaml" || fail "X.yaml missing catalog block"
rg -q "harness:" "$DIR/X.yaml" || fail "X.yaml missing harness block"

echo "PASS: skill package has structured extraction shape and operating guidance"