#!/usr/bin/env bash
# Usage: ./verify/05-check-runx-skill-package.sh <skill-dir>
# Verifies the machine floor for bounty 05.
set -euo pipefail

DIR="${1:?usage: $0 <skill-dir>}"
fail() { echo "FAIL: $1" >&2; exit 1; }

[ -d "$DIR" ] || fail "skill dir not found: $DIR"
[ -f "$DIR/SKILL.md" ] || fail "missing SKILL.md"
[ -f "$DIR/X.yaml" ] || fail "missing X.yaml"

rg -q "runx.tool.manifest.v1|source:[[:space:]]*type:[[:space:]]*http|type:[[:space:]]*http" "$DIR" \
  || fail "no governed HTTP tool/front reference found"
rg -q "catalog:" "$DIR/X.yaml" || fail "X.yaml missing catalog block"
rg -q "harness:" "$DIR/X.yaml" || fail "X.yaml missing harness block"
rg -q "receipt|sealed|authority|scope|failure|retry|rate limit|timeout" "$DIR/SKILL.md" \
  || fail "SKILL.md lacks execution/governance edge-case guidance"

echo "PASS: skill package has governed HTTP shape, harness, and operating guidance"
