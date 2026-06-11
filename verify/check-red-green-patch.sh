#!/usr/bin/env bash
# Usage: ./verify/check-red-green-patch.sh <fixture-dir>
# Verifies a "bug fix proven by a failing test" deliverable (the red-green pair).
# <fixture-dir> must contain: src/ (unpatched tree), test.sh (the proving test,
# run with the tree as cwd), patch.diff (the fix, unified diff, -p1 from src/).
# PASS (exit 0) iff: test FAILS on the unpatched tree (red), the patch applies
# cleanly, and the same test PASSES on the patched tree (green).
set -euo pipefail

FIX="${1:?usage: $0 <fixture-dir>}"
fail() { echo "FAIL: $1" >&2; exit 1; }

[ -d "$FIX" ] || fail "fixture dir not found: $FIX"
FIX="$(cd "$FIX" && pwd)"
[ -d "$FIX/src" ] || fail "missing src/ in fixture"
[ -f "$FIX/test.sh" ] || fail "missing test.sh in fixture"
[ -f "$FIX/patch.diff" ] || fail "missing patch.diff in fixture"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cp -R "$FIX/src" "$WORK/tree"

# RED: the test must fail against the unpatched tree.
if (cd "$WORK/tree" && timeout 50 bash "$FIX/test.sh" >/dev/null 2>&1); then
  fail "test PASSES on the unpatched tree — it does not expose the bug (no red)"
fi
echo "red: test fails on unpatched tree ✓"

# APPLY: the patch must apply cleanly.
patch -p1 -d "$WORK/tree" --no-backup-if-mismatch < "$FIX/patch.diff" >/dev/null 2>&1 \
  || fail "patch.diff does not apply cleanly to src/"
echo "apply: patch applies cleanly ✓"

# GREEN: the same test must pass against the patched tree.
if ! (cd "$WORK/tree" && timeout 50 bash "$FIX/test.sh" >/dev/null 2>&1); then
  fail "test still FAILS after the patch — the fix does not satisfy its own test (no green)"
fi
echo "green: test passes on patched tree ✓"

echo "PASS: red-green pair verified (test exposes the bug, patch fixes it)"
