#!/usr/bin/env bash
set -euo pipefail

SCRIPT="scripts/nitrosend-email.mjs"
REPORT="reports/140-nitrosend-email.md"

fail() { echo "FAIL: $1" >&2; exit 1; }

[ -f "$SCRIPT" ] || fail "missing $SCRIPT"
lines=$(wc -l < "$SCRIPT" | tr -d ' ')
[ "$lines" -le 30 ] || fail "$SCRIPT has $lines lines (max 30)"
grep -q "Nitrosend" "$SCRIPT" || fail "$SCRIPT does not mention Nitrosend"
grep -q "NITROSEND_API_KEY" "$SCRIPT" || fail "$SCRIPT does not read NITROSEND_API_KEY"
grep -q "emails.send" "$SCRIPT" || fail "$SCRIPT does not call emails.send"
[ -f "$REPORT" ] || fail "missing $REPORT"
grep -Eiq "nitrosend|email" "$REPORT" || fail "$REPORT does not describe the email run"

echo "PASS: Nitrosend email script is present, <=30 lines, and report exists"
