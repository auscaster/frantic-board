#!/usr/bin/env bash
# Usage: ./verify/04-check-dataset.sh <dataset.csv>
# Verifies bounty 04: header, row count, URL liveness, no dup domains, enums.
#
# SAFETY: this script fetches SUBMITTED URLs — an SSRF surface. Run it ONLY in
# a disposable sandbox with no secrets and egress that blocks private ranges
# (169.254.0.0/16, 127.0.0.0/8, 10/8, 172.16/12, 192.168/16, ::1, fd00::/8).
# Never run it on a host with cloud credentials or internal network reach.
# The curl below refuses non-public hosts as a first line, but the sandbox is
# the real defense — see README.md "How we verify".
set -euo pipefail

CSV="${1:?usage: $0 <csv-path>}"
EXPECTED_HEADER='name,url,category,payment_rail,custody_model,agents_or_operators_paid,status'

fail() { echo "FAIL: $1" >&2; exit 1; }

[ -f "$CSV" ] || fail "file not found: $CSV"

header="$(head -n1 "$CSV" | tr -d '\r')"
[ "$header" = "$EXPECTED_HEADER" ] || fail "header mismatch: got '$header'"

rows=$(($(wc -l < "$CSV") - 1))
[ "$rows" -ge 20 ] || fail "need >=20 data rows, got $rows"

dup=$(tail -n +2 "$CSV" | awk -F',' '{print $2}' | sed -E 's#https?://##; s#/.*##; s#^www\.##' | sort | uniq -d | head -1)
[ -z "$dup" ] || fail "duplicate domain: $dup"

bad_enum=$(tail -n +2 "$CSV" | awk -F',' '
  $3 !~ /^(marketplace|bounty-board|task-network|other)$/ {print NR": category "$3; exit}
  $4 !~ /^(fiat|stablecoin|both)$/ {print NR": payment_rail "$4; exit}
  $5 !~ /^(platform-custody|wallet-to-wallet|unclear)$/ {print NR": custody_model "$5; exit}
  $7 !~ /^(live|beta|dead)$/ {print NR": status "$7; exit}
')
[ -z "$bad_enum" ] || fail "bad enum at data row $bad_enum"

echo "checking URLs..."
while IFS=',' read -r _ url _; do
  host=$(printf '%s' "$url" | sed -E 's#^https?://##; s#/.*##; s#:.*##')
  case "$host" in
    localhost|127.*|10.*|192.168.*|169.254.*|172.1[6-9].*|172.2[0-9].*|172.3[0-1].*|[::1]|"")
      echo; fail "refusing private/loopback host: $host" ;;
  esac
  # --proto restricts to http(s); the sandbox is the real boundary.
  code=$(curl -s -o /dev/null -w '%{http_code}' -L --proto '=http,https' --max-time 15 "$url" || echo 000)
  case "$code" in
    2*|3*) printf '.' ;;
    *) echo; fail "url not live ($code): $url" ;;
  esac
done < <(tail -n +2 "$CSV")

echo
echo "PASS: $rows rows, all URLs live, schema clean"
