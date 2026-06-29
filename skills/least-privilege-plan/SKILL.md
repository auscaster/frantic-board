---
name: least-privilege-plan
description: Emits a least-privilege plan from run history without mutating grants.
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
  run_history:
    type: string
    required: true
    description: JSON array of past execution actions and scopes.
  declared_policy:
    type: string
    required: true
    description: JSON object representing the declared permission policy.
runx:
  input_resolution:
    required:
      - run_history
      - declared_policy
---

# least-privilege-plan

A read-only runx skill that evaluates agent execution history against a declared policy to propose grant reductions, revocations, and scope optimizations.

## Usage
Provide the `run_history` (JSON array) and `declared_policy` (JSON object).

## Output
Returns a structured JSON plan containing `keep`, `reduce`, `revoke`, and `needs_human_review` recommendations.
