# Delivery Artifact Linter Fixtures

These fixtures exercise `scripts/delivery-artifact-linter.mjs` without reaching
the live Frantic site.

Run the passing fixture:

```sh
node scripts/delivery-artifact-linter.mjs \
  --bounty-file verify/fixtures/delivery-artifact-linter/bounty-41.html \
  --offline \
  public_url=https://github.com/auscaster/frantic-board/pull/0 \
  evidence_json=verify/fixtures/delivery-artifact-linter/evidence-valid.json \
  receipt_ref=runx:receipt:sha256:fixture \
  report=https://github.com/auscaster/frantic-board/blob/main/verify/fixtures/delivery-artifact-linter/README.md \
  pr_url=https://github.com/auscaster/frantic-board/pull/0
```

Run the failing fixture:

```sh
node scripts/delivery-artifact-linter.mjs \
  --bounty-file verify/fixtures/delivery-artifact-linter/bounty-41.html \
  --offline \
  public_url=https://example.invalid/missing \
  evidence_json=verify/fixtures/delivery-artifact-linter/evidence-invalid.json \
  receipt_ref=not-a-receipt
```

The failing command should report missing `report`, malformed `receipt_ref`,
missing `pr_url`, and invalid `evidence_json` observations.
