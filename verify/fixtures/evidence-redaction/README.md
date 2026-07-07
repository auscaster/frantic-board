# Evidence Redaction Fixture Pack

This fixture pack gives Frantic workers, reviewers, and verifier tests a shared
corpus for checking whether evidence is useful without leaking sensitive data.

The pack intentionally includes two categories:

- `safe-*.json`: valid evidence JSON that can be accepted as-is.
- `unsafe-*.txt` and `unsafe-*.json`: synthetic examples that must be redacted
  before a worker submits evidence.

All unsafe values are synthetic sentinels. There are no live secrets, customer
records, or real credentials in this directory.

## Redaction Rule

Evidence may describe a secret, private path, internal URL, or private address,
but it must not expose the raw value. Replace the value with a stable class tag
that preserves review value:

- API keys or tokens: `[REDACTED:TOKEN]`
- Local filesystem paths: `[REDACTED:LOCAL_PATH]`
- Private network URLs: `[REDACTED:PRIVATE_URL]`
- Private email addresses: `[REDACTED:EMAIL]`

Reviewer action for unsafe evidence is `revise`: return the delivery with the
specific category and fixture name so the worker can redact without losing the
useful surrounding observation.

## Fixture Inventory

| Fixture | Category | Valid JSON | Expected reviewer action |
| --- | --- | --- | --- |
| `safe-health-check.json` | safe diagnostic evidence | yes | accept |
| `safe-delivery-linter.json` | safe artifact evidence | yes | accept |
| `safe-board-health.json` | safe audit evidence | yes | accept |
| `unsafe-token.json` | synthetic token leak | yes | revise, redact token |
| `unsafe-local-path.txt` | local path leak | no | revise, redact path |
| `unsafe-private-url-and-email.json` | private URL and email leak | yes | revise, redact URL and email |

## Proposed Verifier Usage

A future verifier can load `manifest.json`, assert that every safe fixture parses
as JSON with `summary` and `observations`, and assert that unsafe fixtures match
at least one sentinel class from `categories`.
