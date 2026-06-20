---
name: runx-verify-report
description: Verifies runx receipts and generates a validity report.
source:
  type: cli-tool
  command: node
  args:
    - run.mjs
  timeout_seconds: 30
  sandbox:
    profile: readonly
    cwd_policy: skill-directory
inputs:
  receipt:
    type: string
    required: true
    description: JSON string of the runx receipt.
runx:
  input_resolution:
    required:
      - receipt
---

# runx-verify-report

A read-only runx skill that parses runx cryptographic receipts to verify their schema and seal state, outputting a verification report.

## Usage
Provide the `receipt` as a JSON string.

## Output
Returns `is_valid` boolean, a human-readable `report`, and the `receipt_id`.
