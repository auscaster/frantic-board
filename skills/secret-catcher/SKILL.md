---
name: secret-catcher
description: Scan a code diff for hardcoded credentials and emit typed findings, a gated redaction proposal, and a block decision. Never exposes raw secret values.
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
  diff:
    type: string
    required: true
    description: Unified git diff content to scan for hardcoded secrets.
  scan_context:
    type: string
    required: false
    description: Optional context hint (e.g. 'pre-commit', 'ci', 'pr-review').
runx:
  input_resolution:
    required:
      - diff
    optional:
      - scan_context
  artifacts:
    named_emits:
      findings: findings
      redaction_proposal: redaction_proposal
      block: block
---

Scan code diffs for leaked credentials before they reach production.

## Overview

Secret Catcher reads a unified git diff, parses the added lines (`+`),
and checks each line against composable regex patterns for known
credential formats. It returns typed findings with file:line locations,
a gated `redaction_proposal` for downstream redact-pii workflows, and
a `block` boolean.

**Never exposes raw secret values.** Findings contain only the
credential *type* and *location* — never the matched string.

## Detected Types

- aws-access-key, github-token, jwt-token, private-key-header
- slack-token, stripe-live-key, google-service-account
- password-assignment, conn-string, npm-auth-token
- generic-api-key, private-key-body

## Usage

```bash
# Pipe a diff
git diff HEAD~1 | runx skill ./skills/secret-catcher --json

# From file
runx skill ./skills/secret-catcher --diff "$(cat diff.patch)" --json

# With context
runx skill ./skills/secret-catcher --diff "$(git diff)" --scan_context pre-commit --json
```

## Output

```json
{
  "findings": [
    { "type": "stripe-live-key", "location": "config/env.example:8" }
  ],
  "redaction_proposal": {
    "description": "...",
    "locations": [{ "location": "config/env.example:8", "types": ["stripe-live-key"], "recommended_action": "review and remove", "replace_with": "${credential_ref}" }],
    "policy": "this skill edits no files and scrubs no live content"
  },
  "block": true
}
```

## Governance

Read-only sandbox. Never edits files or scrubs content. The
`redaction_proposal` is advisory for downstream redact-pii flows.
