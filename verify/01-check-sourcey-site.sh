#!/usr/bin/env bash
# Usage: ./verify/01-check-sourcey-site.sh <published-url> <source-repo-url> <friction-report.md>
# Verifies the machine floor for bounty 01.
set -euo pipefail

URL="${1:?usage: $0 <published-url> <source-repo-url> <friction-report.md>}"
REPO="${2:?usage: $0 <published-url> <source-repo-url> <friction-report.md>}"
REPORT="${3:?usage: $0 <published-url> <source-repo-url> <friction-report.md>}"

fail() { echo "FAIL: $1" >&2; exit 1; }

host=$(printf '%s' "$URL" | sed -E 's#^https?://##; s#/.*##; s#:.*##; s#^www\.##')
case "$host" in
  localhost|127.*|10.*|192.168.*|169.254.*|172.1[6-9].*|172.2[0-9].*|172.3[0-1].*|"")
    fail "refusing private/loopback host: $host" ;;
  *.vercel.app|*.netlify.app|*.github.io|*.pages.dev|*.surge.sh)
    fail "free-host subdomain, not a registered domain: $host" ;;
esac

html=$(mktemp)
trap 'rm -f "$html"' EXIT
code=$(curl -s -o "$html" -w '%{http_code}' -L --proto '=http,https' --max-time 20 "$URL" || echo 000)
[ "$code" = "200" ] || fail "site not live (HTTP $code): $URL"
grep -iq "sourcey" "$html" || fail "no visible Sourcey attribution or marker found"

case "$REPO" in
  https://github.com/*/*)
    api=$(printf '%s' "$REPO" | sed -E 's#https://github.com/([^/]+)/([^/]+).*#https://api.github.com/repos/\\1/\\2#')
    repo_json=$(curl -sL --max-time 20 "$api")
    default_branch=$(printf '%s' "$repo_json" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s); process.stdout.write(j.default_branch || "");})' 2>/dev/null || true)
    [ -n "$default_branch" ] || fail "GitHub repo not readable: $REPO"
    tree_json=$(curl -sL --max-time 20 "$api/git/trees/$default_branch?recursive=1")
    file_count=$(printf '%s' "$tree_json" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s); const files=(j.tree||[]).filter(x=>x.type==="blob").length; process.stdout.write(String(files));})' 2>/dev/null || echo 0)
    [ "${file_count:-0}" -ge 10 ] || fail "source repo needs >=10 files, got ${file_count:-0}: $REPO"
    ;;
  *)
    fail "source repo must be a public GitHub repo URL for this verifier: $REPO" ;;
esac

[ -f "$REPORT" ] || fail "friction report not found: $REPORT"
bullets=$(grep -Ec '^[[:space:]]*[-*][[:space:]]+' "$REPORT" || true)
[ "$bullets" -ge 10 ] || fail "friction report needs >=10 bullets, got $bullets"
grep -Eiq '(`[^`]+`|https?://|error|failed|command|docs?)' "$REPORT" || fail "report lacks concrete commands, errors, or doc URLs"
grep -Eiq '(npm install -g sourcey|npx sourcey init|sourcey.com/docs|sourcey build|sourcey init)' "$REPORT" || fail "report does not name the Sourcey install command or docs URL"

echo "PASS: Sourcey site is live, attributed, repo is public, and report is concrete"