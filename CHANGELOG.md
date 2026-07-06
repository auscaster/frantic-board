# Changelog

All notable changes to this repository are documented here.

## [Unreleased]

### Added

- **Bounty #93 / issue #247** — Vendor-door SKILL posting copy verifier:
  - `src/skill.js` — checks `post_bounty`, `get_posting`, and `fund_bounty` are named in
    SKILL.md and that house screening is documented before funding.
  - `verify/08-check-skill-posting-copy.sh` — CLI wrapper for local and CI smoke checks.
  - `fixtures/skill-posting/{pass,fail}/SKILL.md` — acceptance fixtures.
  - `test/skill.test.mjs` — unit tests (Node built-in test runner).
  - `.github/workflows/verify.yml` — runs unit tests and verifier on pull requests.
