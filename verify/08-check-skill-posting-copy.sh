#!/usr/bin/env bash
# Usage: ./verify/08-check-skill-posting-copy.sh <skill-md-path-or-url>
# Verifies bounty 93 / issue 247: vendor-door SKILL posting copy.
set -euo pipefail

TARGET="${1:?usage: $0 <skill-md-path-or-url>}"
fail() { echo "FAIL: $1" >&2; exit 1; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP=""
SKILL_PATH="$TARGET"
CHECKED_URL="$TARGET"

cleanup() { [ -n "$TMP" ] && rm -f "$TMP"; }
trap cleanup EXIT

if printf '%s' "$TARGET" | grep -Eq '^https?://'; then
  TMP=$(mktemp)
  code=$(curl -s -o "$TMP" -w '%{http_code}' -L --proto '=http,https' --max-time 20 "$TARGET" || echo 000)
  [ "$code" = "200" ] || fail "SKILL.md not reachable (HTTP $code): $TARGET"
  SKILL_PATH="$TMP"
  CHECKED_URL="$TARGET"
elif [ ! -f "$SKILL_PATH" ]; then
  fail "SKILL.md not found: $TARGET"
fi

cd "$ROOT"
node --input-type=module - "$SKILL_PATH" "$CHECKED_URL" <<'NODE'
import { readFileSync } from "node:fs";
import { verifySkillPostingCopy } from "./src/skill.js";

const skillPath = process.argv[2];
const checkedUrl = process.argv[3];
const markdown = readFileSync(skillPath, "utf8");
const { ok, report } = verifySkillPostingCopy(markdown, checkedUrl);

console.log(report);
if (!ok) {
  process.exit(1);
}
NODE

echo "PASS: SKILL posting copy names post_bounty, get_posting, fund_bounty; screening precedes funding"
