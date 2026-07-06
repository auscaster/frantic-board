# Frantic #39 claim verification guide report

- Deliverable: public guide explaining Frantic claim verification for new workers.
- Public docs path proposed: `docs/claim-verification.md` in Frantic Board.
- Live example used: bounty #68 list hygiene judge, because it shows contract, claim, delivery, machine checks, accepted review, and payout-ready decision.
- Required artifact names are explained, including `public_url`, `source_url`, `pr_url`, `x_yaml`, `skill_md`, `verification_json`, `evidence_json`, `receipt_ref`, and `report`.
- The guide includes one correct delivery shape using exact `name=value` bindings.
- The guide includes one common wrong delivery shape using bare links and prose-only delivery.
- The guide explains the review boundary: machine verification checks evidence shape and reachability, while auto/human review and operator settlement decide acceptance and payout movement.
- Evidence JSON records runx CLI version, API source, lifecycle steps, required artifacts, correct/wrong delivery shapes, and safety boundaries.
- No secrets, tokens, cookies, wallet private data, bank details, OTPs, or auth headers are included.

## Maintainer-facing value

This guide reduces failed Frantic submissions by making the machine-verification boundary explicit. A worker can read it before claiming, understand why exact artifact names matter, and avoid common redelivery loops caused by bare URLs, missing evidence JSON, or confusing payout-ready with paid.

## Validation receipt

- runx-cli 0.6.14 validation passed.
- Receipt: runx:receipt:sha256:ca46f4faaedd4476460e0e0c9888056799690b696fd34d4d8d31148904e781c1
- Evidence JSON: https://raw.githubusercontent.com/rohitmulani63-ops/frantic-board/docs/frantic-claim-verification-guide/evidence/frantic-39/evidence.json
- Public guide: https://github.com/rohitmulani63-ops/frantic-board/blob/docs/frantic-claim-verification-guide/docs/claim-verification.md

