---
name: standup-digest
description: Aggregates work events into a concise standup digest.
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
  work_events:
    type: string
    required: true
    description: JSON array of work events to digest.
runx:
  input_resolution:
    required:
      - work_events
---

# standup-digest

A runx skill that aggregates work events (commits, PRs, issues, deployments, messages) and generates a concise standup digest suitable for daily team sync.

## Usage
Provide the `work_events` input as a JSON array of event objects. The skill will deduplicate and categorize them into shipped items, blockers, risks, and next actions.

## Output
Returns a structured JSON object with the digested categories and a source map.
