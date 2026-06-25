---
name: agency-charter-validator
description: Validates agency charters against standardized constraints and regulatory frameworks.
---

# Agency Charter Validator

Guidance for validating agency charters and detecting compliance deviations.

## Receipt & Authority
runx.tool.manifest.v1
source: 
type: http
receipt: valid
sealed: true
authority: validated
scope: agency:domain
failure: handled
retry: enabled
rate limit: 2
timeout: 5s
Ensure all charter submissions carry a valid cryptographic receipt from the regulatory body. Authority is scoped strictly by the charter domain (e.g., `agency:domain`).
## Failure Modes & Retry Logic
- **Scope Failure**: If a charter falls outside the approved regulatory scope, flag for manual review.
- **Retry**: On transient network errors, implement backoff up to 3 attempts.
- **Timeout**: Strict 5s timeout on remote validation calls.
- **Rate Limit**: Max 2 concurrent validations per agent.

## Governance
- **Sealed**: All charters must be sealed before filing.
- **Authority**: Ensure authority matches the source-of-truth registry.
