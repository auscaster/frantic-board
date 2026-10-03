#!/usr/bin/env bash
# Usage: ./verify/134-check-ausca-browser-session.sh <evidence.json> <report.md> <receipt_ref>
# Verifies the machine floor for bounty 134: Run an Ausca Browser Session end to end and report the process.
set -euo pipefail

EVIDENCE="${1:?usage: $0 <evidence.json> <report.md> <receipt_ref>}"
REPORT="${2:?usage: $0 <evidence.json> <report.md> <receipt_ref>}"
RECEIPT="${3:?usage: $0 <evidence.json> <report.md> <receipt_ref>}"

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

tmp_evidence=""
if printf '%s' "$EVIDENCE" | grep -Eq '^https?://'; then
  tmp_evidence=$(mktemp)
  trap 'rm -f "$tmp_evidence"' EXIT
  curl -sL --proto '=http,https' --max-time 20 "$EVIDENCE" -o "$tmp_evidence"
  EVIDENCE="$tmp_evidence"
fi

[ -f "$EVIDENCE" ] || fail "evidence.json not found: $EVIDENCE"

node - "$EVIDENCE" <<'NODE'
const fs = require("fs");
const filePath = process.argv[2];

let data;
try {
  data = JSON.parse(fs.readFileSync(filePath, "utf8"));
} catch (err) {
  throw new Error("evidence_json is not valid JSON: " + err.message);
}

if (!data.summary || typeof data.summary !== "string") {
  throw new Error("evidence_json missing 'summary' string");
}

if (data.summary.trim().length < 80) {
  throw new Error(`evidence_json summary too short (${data.summary.trim().length} chars, expected >= 80)`);
}

if (!Array.isArray(data.observations)) {
  throw new Error("evidence_json missing 'observations' array");
}

if (data.observations.length < 8) {
  throw new Error(`evidence_json observations has ${data.observations.length} items, expected >= 8`);
}

for (let i = 0; i < data.observations.length; i++) {
  const item = data.observations[i];
  if (!item || (typeof item !== "object" && typeof item !== "string")) {
    throw new Error(`invalid observation entry at index ${i}`);
  }
}
NODE

tmp_report=""
if printf '%s' "$REPORT" | grep -Eq '^https?://'; then
  tmp_report=$(mktemp)
  trap 'rm -f "$tmp_evidence" "$tmp_report"' EXIT
  curl -sL --proto '=http,https' --max-time 20 "$REPORT" -o "$tmp_report"
  REPORT="$tmp_report"
fi

[ -f "$REPORT" ] || fail "report.md not found: $REPORT"

bullets=$(grep -Ec '^[[:space:]]*[-*][[:space:]]+' "$REPORT" || true)
[ "$bullets" -ge 8 ] || fail "report requires at least 8 bullet points, found $bullets"

grep -Eiq '(issue|niggle|mismatch|error|bug|fail|latency|delay|problem)' "$REPORT" \
  || fail "report lacks identified issues, niggles, or mismatches"

grep -Eiq '(recommend|suggest|improve|proposal|change)' "$REPORT" \
  || fail "report lacks concrete proposed changes or recommendations"

grep -Eiq '(browser|cdp|lease)' "$REPORT" \
  || fail "report lacks browser session, CDP, or lease references"

if printf '%s' "$RECEIPT" | grep -Eq '^https?://(runx\.ai|gofrantic\.com)/r/[a-zA-Z0-9_-]{8,64}$'; then
  :
elif printf '%s' "$RECEIPT" | grep -Eq '^runx:receipt:sha256:[a-f0-9]{64}$'; then
  :
elif printf '%s' "$RECEIPT" | grep -Eq '^frantic:receipt:'; then
  :
elif printf '%s' "$RECEIPT" | grep -Eq '^https?://'; then
  :
else
  fail "receipt_ref does not match expected runx or frantic receipt format: $RECEIPT"
fi

echo "PASS: Ausca Browser Session evidence packet, report, and receipt reference verified"
