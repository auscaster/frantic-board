#!/usr/bin/env bash
# Usage: ./verify/08-check-markdown-links.sh <markdown-file>
# Verifies that all relative/local links inside a markdown file point to existing files/directories.
set -euo pipefail

FILE="${1:?usage: $0 <markdown-file>}"
fail() { echo "FAIL: $1" >&2; exit 1; }

[ -f "$FILE" ] || fail "file not found: $FILE"
DIR=$(dirname "$FILE")

has_errors=0

# Find all links of the form [text](url) or ![alt](url)
# We use grep to output only the matches, one per line.
while read -r line; do
  [ -n "$line" ] || continue

  # Extract the url part between ( and )
  url=$(printf '%s' "$line" | sed -E 's/^\!?\[[^]]*\]\((.*)\)$/\1/')

  # Skip external URLs, mailto, tel, and local anchor hashes
  if [[ "$url" =~ ^(https?|mailto|tel): ]] || [[ "$url" == \#* ]]; then
    continue
  fi

  # Strip query parameters and hash anchors
  url="${url%%\?*}"
  url="${url%%#*}"

  [ -n "$url" ] || continue

  # URL Decode (convert %XX to character)
  decoded_url=$(printf '%b' "${url//%/\\x}")

  resolved_path="$DIR/$decoded_url"

  if [ ! -e "$resolved_path" ]; then
    echo "FAIL: Broken link \"$line\" -> path does not exist: \"$resolved_path\"" >&2
    has_errors=1
  fi
done < <(grep -oE '\!?\[[^]]*\]\([^)]+\)' "$FILE" || true)

if [ "$has_errors" -ne 0 ]; then
  exit 1
fi

echo "PASS: All local markdown links exist."
exit 0
