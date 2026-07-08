#!/usr/bin/env bash
# Local CI mirror for bounty #93 — run before opening PR when workflow scope is unavailable.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npm test
bash ./verify/08-check-skill-posting-copy.sh ./fixtures/skill-posting/pass/SKILL.md
if bash ./verify/08-check-skill-posting-copy.sh ./fixtures/skill-posting/fail/SKILL.md; then
  echo "expected fail fixture to be rejected" >&2
  exit 1
fi
echo "PASS: all local CI checks"
