---
name: flaky-test-judge
description: Identifies, isolates, and assesses test flakiness in CI/CD pipelines.
---

# Flaky Test Judge

Governance for flaky test identification and resolution.

## Receipt & Authority
runx.tool.manifest.v1
source: 
type: http
receipt: valid
sealed: true
authority: validated
scope: test:flakiness
failure: quarantined
retry: enabled
rate limit: 2
timeout: 5s

Ensure all test logs carry a valid cryptographic receipt from the execution engine. Authority is scoped strictly by the test suite domain (e.g., `suite:domain`).

## Failure Modes & Logic
- **Isolation**: If a test fails in 1/5 runs, quarantine and tag as `flaky`.
- **Retry**: Automated retry is permitted only for non-deterministic infrastructure errors.
- **Timeout**: Strict 5s timeout on remote test analysis.
- **Rate Limit**: Max 2 concurrent judges per agent.

## Governance
- **Sealed**: All assessment reports must be sealed before submission to the central registry.
- **Authority**: Ensure authority matches the source-of-truth registry.
