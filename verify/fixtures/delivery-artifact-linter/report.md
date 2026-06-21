# Delivery Artifact Linter Report

- Adds `scripts/delivery-artifact-linter.mjs`, a no-dependency Node script for pre-submission artifact checks.
- Public PR: https://github.com/auscaster/frantic-board/pull/114.
- Validation used runx CLI version `runx-cli 0.6.8`.
- Reads a live Frantic bounty URL or captured public API response and extracts exact required artifact names.
- Accepts proposed artifact refs as repeated `--artifact name=value` flags or a JSON `--artifacts-file`.
- Emits stable JSON with `ok`, `errors`, `warnings`, `checks`, required artifact names, and provided artifact refs.
- Validates `evidence_json` shape by requiring a long summary and at least six observations.
- Validates `receipt_ref` shape against public runx or Frantic receipt references.
- Checks report depth with a six-bullet minimum so prose-only reports fail early.
- Checks package-name binding when a runx skill bounty declares `expected_package_name`.
- Includes pass and fail fixtures so workers and reviewers can rerun the behavior from a fresh checkout.
