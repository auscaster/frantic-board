# Delivery artifact linter report

- Added `scripts/delivery-artifact-linter.mjs`, a dependency-free Node.js 20+ command-line linter for proposed Frantic delivery packets.
- The linter loads either a live public bounty URL or a captured API response and extracts the bounty's exact required artifact names.
- It rejects missing or duplicate artifact references, malformed and unreachable URLs, malformed receipt references, invalid `evidence_json`, and exact-package mismatches.
- Its output is stable JSON: a valid packet exits `0`, while a packet containing delivery errors exits `1` and returns machine-readable error codes.
- Added committed fixtures for bounty 41 and a second package-name bounty, covering both a clean packet and five distinct failure classes without external network dependence.
- Added `scripts/test-delivery-artifact-linter.mjs`; `node scripts/test-delivery-artifact-linter.mjs` proves the valid and invalid outcomes from a fresh checkout.
- Added a governed runx validation wrapper with read-only workspace authority and explicit fail-closed behavior for unsupported input.
- GitHub Actions run [27933774019](https://github.com/jjuyjuju/frantic-board/actions/runs/27933774019) passed both harness cases using `runx-cli 0.6.8`.
- The successful harness execution is sealed as `runx:receipt:sha256:d8882825eb33f5de705b77814ef587c30554ffadc2e298eae1b673ff162e279a`.
- Independent `runx verify` output reports valid digest, content address, and production-mode Ed25519 signature; the receipt, public verification key, and verdict are committed beside this report.
- Usage and a copy-paste command are documented in the repository README.
- The implementation is proposed in [PR #113](https://github.com/auscaster/frantic-board/pull/113).
