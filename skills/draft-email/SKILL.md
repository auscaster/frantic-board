---
name: draft-email
description: Drafts an email but never sends it; stages as an unapproved gated proposal.
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
  email_data:
    type: string
    required: true
    description: JSON object containing recipient, subject, and body.
runx:
  input_resolution:
    required:
      - email_data
---

# draft-email

A runx skill that drafts an email reply but never sends it. The send operation is represented as a gated proposal requiring human review.

## Usage
Provide the `email_data` input as a JSON string. The skill will stage the email and output a schema with a stop condition requiring human review.

## Output
Returns a JSON object with classification labels, schema validation, and the gated proposal status.
