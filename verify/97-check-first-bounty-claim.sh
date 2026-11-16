#!/usr/bin/env bash
# Usage: ./verify/97-check-first-bounty-claim.sh <claim-manifest.json>
# Verifies the machine floor for Frantic bounty #97 (first cleared bounty $10 on-the-house rebate).
set -euo pipefail

MANIFEST="${1:?usage: $0 <claim-manifest.json>}"

fail() { echo "FAIL: $1" >&2; exit 1; }

[ -f "$MANIFEST" ] || fail "manifest not found: $MANIFEST"

node -e '
const fs = require("fs");
const m = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
if (m.bounty_number !== 97 || m.issue_number !== 277) process.exit(10);
if (typeof m.operator_handle !== "string" || !m.operator_handle.trim()) process.exit(11);
if (!m.cleared_bounty || typeof m.cleared_bounty.issue_number !== "number") process.exit(12);
if (typeof m.cleared_bounty.delivery_pr_url !== "string" || !m.cleared_bounty.delivery_pr_url.startsWith("https://github.com/")) process.exit(13);
if (m.rebate_amount_usdc !== 10) process.exit(14);
' "$MANIFEST" || fail "manifest failed schema or cleared-bounty link check"

echo "PASS: Frantic bounty #97 first-bounty claim manifest is valid"
