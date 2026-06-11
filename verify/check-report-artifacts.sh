#!/usr/bin/env bash
# Usage: ./verify/check-report-artifacts.sh <report.md> [min-bullets]
# Verifies a written field-report deliverable (e.g. bounty 01's install-friction
# report): at least <min-bullets> (default 10) DISTINCT bullet points, and every
# bullet must quote at least one real artifact in `backticks` (an exact command,
# error string, file path, or URL). Duplicate bullets are rejected.
set -euo pipefail

REPORT="${1:?usage: $0 <report.md> [min-bullets]}"
MIN="${2:-10}"
fail() { echo "FAIL: $1" >&2; exit 1; }

[ -f "$REPORT" ] || fail "report not found: $REPORT"

# Collect bullet blocks: a block starts at a line whose first non-space char is
# "-" or "*" followed by a space, and runs until the next bullet or blank line.
total=0; no_artifact=0
declare -A seen; dup=0
while IFS= read -r block; do
  [ -n "$block" ] || continue
  total=$((total+1))
  norm="$(printf '%s' "$block" | tr -s ' ' | tr '[:upper:]' '[:lower:]')"
  if [ -n "${seen[$norm]:-}" ]; then dup=$((dup+1)); else seen[$norm]=1; fi
  case "$block" in
    *'`'*'`'*) : ;;
    *) no_artifact=$((no_artifact+1)) ;;
  esac
done < <(awk '
  /^[[:space:]]*[-*][[:space:]]/ { if (buf != "") print buf; buf = $0; inb = 1; next }
  /^[[:space:]]*$/               { if (buf != "") print buf; buf = ""; inb = 0; next }
  inb                            { buf = buf " " $0; next }
  END                            { if (buf != "") print buf }
' "$REPORT")

distinct=$((total - dup))
echo "bullets: $total total, $distinct distinct, $no_artifact without a backtick-quoted artifact"

[ "$total" -ge 1 ] || fail "no bullet points found"
[ "$dup" -eq 0 ] || fail "$dup duplicate bullet(s) — every bullet must be distinct"
[ "$distinct" -ge "$MIN" ] || fail "need >=$MIN distinct bullets, got $distinct"
[ "$no_artifact" -eq 0 ] || fail "$no_artifact bullet(s) quote no artifact — each bullet must contain an exact command, error, path, or URL in backticks"

echo "PASS: $distinct distinct bullets, every one quoting a real artifact"
