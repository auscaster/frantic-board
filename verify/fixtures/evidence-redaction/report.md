# Evidence Redaction Fixture Pack

- Public fixture import path: `verify/fixtures/evidence-redaction/`.
- Public PR: https://github.com/auscaster/frantic-board/pull/115.
- Safe JSON fixtures: `safe-redacted-secret.json`, `safe-redacted-local-path.json`, and `safe-redacted-private-url.json`.
- Unsafe synthetic fixtures: `unsafe-synthetic-secret.json`, `unsafe-local-path.json`, and `unsafe-private-url-email.md`.
- Secret rule: raw `SYNTHETIC_SECRET_DO_NOT_USE_*` values must be replaced with `[REDACTED_SECRET]`.
- Local path rule: user and machine-specific path roots must be replaced with `[LOCAL_PATH]`.
- Private URL rule: non-public dashboards and tokenized internal links must be replaced with `[PRIVATE_URL]`.
- Private email rule: personal or private inboxes must be replaced with `[PRIVATE_EMAIL]`.
- Reviewer action: accept safe fixtures that preserve evidence shape and reject unsafe fixtures until the raw private values are removed.
- Validation command: `node verify/09-check-evidence-redaction-fixtures.mjs`.
- runx evidence command: `runx --version` returned `runx-cli 0.6.8`.
