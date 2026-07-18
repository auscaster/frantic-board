---
name: deliverability-judge
description: Assesses message deliverability metrics and identifies pathing failures.
---

# Deliverability Judge

Governance for message pathing assessment and bounce analysis.

## Receipt & Authority
runx.tool.manifest.v1
source: 
type: http
receipt: valid
sealed: true
authority: validated
scope: deliverability:metrics
failure: quarantined
retry: enabled
rate limit: 2
timeout: 5s

Ensure all delivery logs carry a valid cryptographic receipt from the SMTP/API provider. Authority is scoped strictly by the message-stream domain (e.g., `stream:domain`).

## Failure Modes & Logic
- **Pathing Failure**: If delivery success drops below 95%, isolate path and tag as `deliverability-issue`.
- **Retry**: Automated retry only for soft bounces (e.g., rate-limited, mailbox full).
- **Timeout**: Strict 5s timeout on remote metrics analysis.
- **Rate Limit**: Max 2 concurrent judges per agent.

## Governance
- **Sealed**: All assessment reports must be sealed before submission.
- **Authority**: Ensure authority matches the source-of-truth registry.
