---
name: claim-verification-guide-check
description: Validate the Frantic claim-verification guide and evidence artifacts for bounty #39.
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
  repo_root:
    type: string
    required: true
    description: Absolute path to the frantic-board checkout.
runx:
  category: verification
  input_resolution:
    required:
      - repo_root
---

# claim-verification-guide-check

Validates that the bounty #39 guide and evidence JSON include the required artifact names, lifecycle concepts, review boundary, and runx version observation.
