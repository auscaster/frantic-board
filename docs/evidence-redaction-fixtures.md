# Evidence Redaction Fixtures Report

This report covers the fixture pack at
`verify/fixtures/evidence-redaction/`. It is intended for Frantic workers,
reviewers, and future verifier tests that need a common evidence-redaction
corpus.

## Redaction Rule

Evidence should keep the reviewable fact while removing the private value:

- `fr_test_token_*` becomes `[REDACTED:TOKEN]`.
- `C:\Users\ExampleOperator\...` becomes `[REDACTED:LOCAL_PATH]`.
- `https://internal.example.invalid/...` becomes `[REDACTED:PRIVATE_URL]`.
- `worker@example.invalid` becomes `[REDACTED:EMAIL]`.

Reviewer action for every unsafe case is `revise`, with the fixture file and
category named in the review note.

## Validation Results

The fixture pack includes six fixtures:

- `safe-health-check.json`: valid JSON with `summary` and `observations`;
  reviewer action `accept`.
- `safe-delivery-linter.json`: valid JSON with `summary` and `observations`;
  reviewer action `accept`.
- `safe-board-health.json`: valid JSON with `summary` and `observations`;
  reviewer action `accept`.
- `unsafe-token.json`: synthetic token sentinel; reviewer action `revise` and
  redact token.
- `unsafe-local-path.txt`: synthetic local path sentinel; reviewer action
  `revise` and redact local path.
- `unsafe-private-url-and-email.json`: synthetic private URL and email
  sentinels; reviewer action `revise` and redact both values.

No fixture contains a live credential, real private customer record, or usable
secret.

## Proposed Verifier Usage

Future verifier tests can:

1. Load `manifest.json`.
2. Assert every `safe: true` fixture parses as JSON and has `summary` plus
   non-empty `observations`.
3. Assert every `safe: false` fixture includes one or more synthetic sentinel
   patterns from `categories`.
4. Require reviewers to return unsafe evidence for revision instead of accepting
   or silently editing the worker's artifact.

## Evidence Observations

- Fixture names: `safe-health-check.json`, `safe-delivery-linter.json`,
  `safe-board-health.json`, `unsafe-token.json`, `unsafe-local-path.txt`,
  `unsafe-private-url-and-email.json`.
- Redaction categories: token, local path, private URL, private email.
- Validation command: `node -e "<fixture validation script>"`.
- runx version observed locally: `runx-cli 0.6.8`.
