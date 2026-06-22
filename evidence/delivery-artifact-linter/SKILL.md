---
name: delivery-linter-validation
description: Run the committed pass and fail fixtures for the Frantic delivery artifact linter and return their stable JSON result.
source:
  type: cli-tool
  command: node
  args:
    - evidence/delivery-artifact-linter/run.mjs
  timeout_seconds: 45
  sandbox:
    profile: readonly
    cwd_policy: workspace
inputs:
  mode:
    type: string
    required: true
    description: Use full to execute both committed fixture classes.
runx:
  category: ops
  input_resolution:
    required:
      - mode
---

# Delivery linter validation

Use this governed validation wrapper to run the repository's committed linter
fixtures under runx. `mode=full` executes both the passing packet and a failing
packet that contains five distinct delivery mistakes.

The runner has read-only authority. It starts only a loopback fixture server,
does not read secrets, and does not make external network requests. A sealed
receipt therefore records exactly which committed validation command ran.

Failure behavior is closed: missing or unsupported input exits non-zero, as do
test failures, timeouts, malformed JSON output, or an unexpected linter result.
