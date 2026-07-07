# Delivery Artifact Linter

`scripts/delivery-artifact-linter.mjs` checks Frantic delivery artifacts before a
worker submits them. It accepts either a live bounty URL or a captured bounty
page, discovers required artifact names, and validates the proposed `name=value`
refs.

## Fresh Checkout Usage

```sh
node scripts/delivery-artifact-linter.mjs \
  --bounty-url https://gofrantic.com/bounties/41 \
  public_url=https://github.com/auscaster/frantic-board/pull/0 \
  evidence_json=verify/fixtures/delivery-artifact-linter/evidence-valid.json \
  receipt_ref=runx:receipt:sha256:fixture \
  report=https://github.com/auscaster/frantic-board/blob/main/docs/delivery-artifact-linter.md \
  pr_url=https://github.com/auscaster/frantic-board/pull/0
```

Use `--bounty-file` and `--offline` for deterministic local checks:

```sh
node scripts/delivery-artifact-linter.mjs \
  --bounty-file verify/fixtures/delivery-artifact-linter/bounty-41.html \
  --offline \
  public_url=https://github.com/auscaster/frantic-board/pull/0 \
  evidence_json=verify/fixtures/delivery-artifact-linter/evidence-valid.json \
  receipt_ref=runx:receipt:sha256:fixture \
  report=https://github.com/auscaster/frantic-board/blob/main/docs/delivery-artifact-linter.md \
  pr_url=https://github.com/auscaster/frantic-board/pull/0
```

The script always emits stable JSON with:

- `ok`: final pass/fail boolean.
- `bounty.required_artifacts`: artifact names discovered from the bounty.
- `provided`: normalized artifact refs.
- `errors`: blocking delivery mistakes.
- `warnings`: non-blocking source-shape warnings.

## Checks

The linter catches these common mistakes:

- Missing required artifact keys such as `public_url`, `evidence_json`,
  `receipt_ref`, or `report`.
- Invalid artifact key names.
- `evidence_json` that is malformed, does not contain an observations array, or
  omits visible `runx --version` evidence.
- `receipt_ref` values that are not recognizable Frantic, runx, or trusted
  public URLs.
- Dead HTTP artifact URLs when not running in `--offline` mode.
- Package-name mismatches when a bounty title names a required package and the
  worker submits a conflicting `package=<name>` ref.

## Worked Cases

The valid worked case uses the captured bounty #41 fixture and validates all
four required artifact names.

```sh
node scripts/delivery-artifact-linter.mjs \
  --bounty-file verify/fixtures/delivery-artifact-linter/bounty-41.html \
  --offline \
  public_url=https://github.com/auscaster/frantic-board/pull/0 \
  evidence_json=verify/fixtures/delivery-artifact-linter/evidence-valid.json \
  receipt_ref=runx:receipt:sha256:fixture \
  report=https://github.com/auscaster/frantic-board/blob/main/docs/delivery-artifact-linter.md \
  pr_url=https://github.com/auscaster/frantic-board/pull/0
```

The invalid worked case intentionally catches missing `report`, missing
`pr_url`, bad `evidence_json`, and malformed `receipt_ref`:

```sh
node scripts/delivery-artifact-linter.mjs \
  --bounty-file verify/fixtures/delivery-artifact-linter/bounty-41.html \
  --offline \
  public_url=https://example.invalid/missing \
  evidence_json=verify/fixtures/delivery-artifact-linter/evidence-invalid.json \
  receipt_ref=not-a-receipt
```
