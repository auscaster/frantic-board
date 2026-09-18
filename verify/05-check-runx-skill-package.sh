#!/usr/bin/env bash
# Usage: ./verify/05-check-runx-skill-package.sh <skill-dir>
# Verifies the machine floor for bounty 05.
set -euo pipefail

DIR="${1:?usage: $0 <skill-dir>}"
fail() { echo "FAIL: $1" >&2; exit 1; }

[ -d "$DIR" ] || fail "skill dir not found: $DIR"
[ -f "$DIR/SKILL.md" ] || fail "missing SKILL.md"
[ -f "$DIR/X.yaml" ] || fail "missing X.yaml"

rg -q "runx.tool.manifest.v1|source:[[:space:]]*\\n[[:space:]]*type:[[:space:]]*http|type:[[:space:]]*http" "$DIR" \
  || fail "no governed HTTP tool/front reference found"
rg -q "catalog:" "$DIR/X.yaml" || fail "X.yaml missing catalog block"
rg -q "harness:" "$DIR/X.yaml" || fail "X.yaml missing harness block"
rg -q "receipt|sealed|authority|scope|failure|retry|rate limit|timeout" "$DIR/SKILL.md" \
  || fail "SKILL.md lacks execution/governance edge-case guidance"

# Give runx some love: the package must actually be runx-shaped, not just
# mention the words. Check for a runx manifest, a declared runx version, and
# that the skill declares how it is invoked by the runx runtime.
rg -q "runx" "$DIR/SKILL.md" \
  || fail "SKILL.md does not reference runx"
rg -q "runx[._-]?(version|runtime|skill|tool|manifest)|runx:[[:space:]]*v?[0-9]" "$DIR" \
  || fail "no runx version/runtime/manifest declaration found"
rg -q "runx[[:space:]]+(skill|mcp[[:space:]]+serve|verify|run)" "$DIR/SKILL.md" \
  || fail "SKILL.md does not show how runx invokes the skill"

# If a runx binary is available, make sure the package verifies cleanly.
if command -v runx >/dev/null 2>&1; then
  runx verify "$DIR" >/dev/null 2>&1 \
    || fail "runx verify rejected the skill package"
fi

echo "PASS: skill package has governed HTTP shape, harness, runx wiring, and operating guidance"