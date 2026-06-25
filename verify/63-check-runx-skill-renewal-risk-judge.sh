#!/usr/bin/env bash
# Usage: ./verify/63-check-runx-skill-renewal-risk-judge.sh <skill-dir>
# Verifies the machine floor for bounty 63: runx skill 'renewal risk judge'
# Checks that the skill directory contains SKILL.md and X.yaml with correct
# naming, governed HTTP tool/harness/catalog blocks, and guidance matching
# the 'renewal risk judge' domain.
set -euo pipefail

DIR="${1:?usage: $0 <skill-dir>}"
fail() { echo "FAIL: $1" >&2; exit 1; }

[ -d "$DIR" ] || fail "skill dir not found: $DIR"
[ -f "$DIR/SKILL.md" ] || fail "missing SKILL.md"
[ -f "$DIR/X.yaml" ] || fail "missing X.yaml"

# Skill name must reference 'renewal risk judge'
NAME_CHECK=$(head -1 "$DIR/SKILL.md" | grep -i 'renewal risk judge' || true)
[ -n "$NAME_CHECK" ] || fail "SKILL.md first line does not mention 'renewal risk judge'"

# Must contain governed HTTP tool/front reference
rg -q "runx.tool.manifest.v1|source:[[:space:]]*\\n[[:space:]]*type:[[:space:]]*http|type:[[:space:]]*http" "$DIR" \
  || fail "no governed HTTP tool/front reference found"

# X.yaml must have catalog and harness blocks
rg -q "catalog:" "$DIR/X.yaml" || fail "X.yaml missing catalog block"
rg -q "harness:" "$DIR/X.yaml" || fail "X.yaml missing harness block"

# SKILL.md must contain guidance related to risk judgment (renewal context)
rg -q -i "risk|judge|renewal|probability|fraud|decision|score|model" "$DIR/SKILL.md" \
  || fail "SKILL.md lacks risk/renewal/judge-related guidance"

# Also check for execution/governance edge-case guidance (general runx skill requirement)
rg -q "receipt|sealed|authority|scope|failure|retry|rate limit|timeout" "$DIR/SKILL.md" \
  || fail "SKILL.md lacks execution/governance edge-case guidance"

echo "PASS: skill package 'renewal risk judge' has correct name, governed HTTP shape, harness, catalog, and relevant guidance"
