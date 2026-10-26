# Bounty #140 — Nitrosend email report

Status: script delivered; live send pending credentials.

## Script
- `scripts/nitrosend-email.mjs` is 30 lines.
- Uses `@nitrosend/sdk` and `nitrosend.emails.send`.
- Reads `NITROSEND_API_KEY`, `NITROSEND_FROM`, and `NITROSEND_TO`.

## Local check
- `node --check scripts/nitrosend-email.mjs` passed.
- `bash verify/140-check-nitrosend-email.sh` passed.

## Live run
- Command: `NITROSEND_API_KEY=... NITROSEND_FROM=... NITROSEND_TO=... node scripts/nitrosend-email.mjs`
- Result: pending; record the response id or error here after running with real credentials.
