#!/usr/bin/env bash
# Usage: ./verify/132-check-ausca-document-analysis.sh <evidence.json> <report.md> <receipt_ref>
# Verifies the machine floor for bounty 132: Run Ausca Document Analysis end to end and report the process.
set -euo pipefail

EVIDENCE="${1:?usage: $0 <evidence.json> <report.md> <receipt_ref>}"
REPORT="${2:?usage: $0 <evidence.json> <report.md> <receipt_ref>}"
RECEIPT="${3:?usage: $0 <evidence.json> <report.md> <receipt_ref>}"

fail() { echo "FAIL: $1" >&2; exit 1; }

# Handle evidence if given as URL
tmp_evidence=""
if printf '%s' "$EVIDENCE" | grep -Eq '^https?://'; then
  tmp_evidence=$(mktemp)
  trap 'rm -f "$tmp_evidence"' EXIT
  curl -sL --proto '=http,https' --max-time 20 "$EVIDENCE" -o "$tmp_evidence"
  EVIDENCE="$tmp_evidence"
fi

[ -f "$EVIDENCE" ] || fail "evidence.json not found: $EVIDENCE"

# Verify evidence.json with node
node - "$EVIDENCE" <<'NODE'
const fs = require("fs");
const path = process.argv[2];
let data;
try {
  data = JSON.parse(fs.readFileSync(path, "utf8"));
} catch (e) {
  throw new Error("evidence_json is not valid JSON: " + e.message);
}

// Check summary length >= 80 chars
if (!data.summary || typeof data.summary !== "string") {
  throw new Error("evidence_json missing 'summary' string");
}
if (data.summary.trim().length < 80) {
  throw new Error(`evidence_json summary too short (${data.summary.trim().length} chars, expected >= 80)`);
}

// Check observations array >= 8 entries
if (!Array.isArray(data.observations)) {
  throw new Error("evidence_json missing 'observations' array");
}
if (data.observations.length < 8) {
  throw new Error(`evidence_json observations has ${data.observations.length} items, expected >= 8`);
}

// Validate observation fields (each should note step/timing or details)
for (let i = 0; i < data.observations.length; i++) {
  const obs = data.observations[i];
  if (!obs || (typeof obs !== "object" && typeof obs !== "string")) {
    throw new Error(`invalid observation entry at index ${i}`);
  }
}
NODE

# Handle report if given as URL
tmp_report=""
if printf '%s' "$REPORT" | grep -Eq '^https?://'; then
  tmp_report=$(mktemp)
  trap 'rm -f "$tmp_evidence" "$tmp_report"' EXIT
  curl -sL --proto '=http,https' --max-time 20 "$REPORT" -o "$tmp_report"
  REPORT="$tmp_report"
fi

[ -f "$REPORT" ] || fail "report.md not found: $REPORT"

# Check report depth: minimum 8 bullet items
bullets=$(grep -Ec '^[[:space:]]*[-*][[:space:]]+' "$REPORT" || true)
[ "$bullets" -ge 8 ] || fail "report requires at least 8 bullet points, found $bullets"

# Check that report contains concrete findings/issues/niggles/mismatches
grep -Eiq '(issue|niggle|mismatch|error|bug|fail|latency|delay|problem)' "$REPORT" \
  || fail "report lacks identified issues, niggles, or mismatches"

# Check that report names recommendations/suggestions
grep -Eiq '(recommend|suggest|improve|proposal|change)' "$REPORT" \
  || fail "report lacks concrete proposed changes or recommendations"

# Check that report mentions Document Analysis / analyze-document / artifact operations
grep -Eiq '(document|analysis|analyze-document|artifact|feature|pdf|image)' "$REPORT" \
  || fail "report lacks Document Analysis, analyze-document, or artifact references"

# Validate receipt_ref shape
# Expected: https://runx.ai/r/<digest> or runx:receipt:sha256:<hash> or frantic:receipt:<id> or public URL
if printf '%s' "$RECEIPT" | grep -Eq '^https?://runx\.ai/r/[a-f0-9]{32,64}$'; then
  : # valid runx URL
elif printf '%s' "$RECEIPT" | grep -Eq '^https?://gofrantic\.com/r/[a-f0-9]{8,64}$'; then
  : # valid frantic URL
elif printf '%s' "$RECEIPT" | grep -Eq '^runx:receipt:sha256:[a-f0-9]{64}$'; then
  : # valid runx URI
elif printf '%s' "$RECEIPT" | grep -Eq '^frantic:receipt:'; then
  : # valid frantic receipt URI
elif printf '%s' "$RECEIPT" | grep -Eq '^https?://'; then
  : # other public URL reference
else
  fail "receipt_ref does not match expected runx/frantic receipt format: $RECEIPT"
fi

echo "PASS: Ausca Document Analysis evidence packet, report, and receipt reference verified"
