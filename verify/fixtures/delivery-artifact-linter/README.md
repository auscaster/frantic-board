# Delivery Artifact Linter Fixtures

These fixtures exercise `scripts/delivery-artifact-linter.mjs`, a preflight helper
for Frantic deliveries.

Run the passing case from a fresh checkout:

```bash
node scripts/delivery-artifact-linter.mjs \
  --bounty verify/fixtures/delivery-artifact-linter/bounty-41.json \
  --artifacts-file verify/fixtures/delivery-artifact-linter/pass-artifacts.json \
  --no-network
```

Run the failing case:

```bash
node scripts/delivery-artifact-linter.mjs \
  --bounty verify/fixtures/delivery-artifact-linter/bounty-37-runx-skill.json \
  --artifacts-file verify/fixtures/delivery-artifact-linter/fail-artifacts.json \
  --no-network
```

The failing fixture catches at least four mistakes:

- missing required artifact keys for a runx skill bounty
- an unreadable local `pr_url` reference
- malformed `evidence_json`
- malformed `receipt_ref`
- a `public_url` package-name mismatch against `least-privilege-plan`

Use it on a live bounty and proposed delivery:

```bash
node scripts/delivery-artifact-linter.mjs \
  --bounty https://gofrantic.com/v1/bounties/41 \
  --artifact public_url=https://github.com/auscaster/frantic-board/pull/123 \
  --artifact pr_url=https://github.com/auscaster/frantic-board/pull/123 \
  --artifact evidence_json=https://raw.githubusercontent.com/OWNER/REPO/COMMIT/verify/fixtures/delivery-artifact-linter/valid-evidence.json \
  --artifact receipt_ref=runx:receipt:sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa \
  --artifact report=https://raw.githubusercontent.com/OWNER/REPO/COMMIT/verify/fixtures/delivery-artifact-linter/report.md
```
