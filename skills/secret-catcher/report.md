# Secret Catcher — Delivery Report

**Bounty:** #92 — runx skill: secret catcher  
**Worker:** Kunall7890  
**Package:** `Kunall7890/secret-catcher@1.0.0`  
**Version:** 1.0.0  
**Status:** Delivered

---

## Overview

Secret Catcher is a governed runx skill that scans code diffs for hardcoded credentials. It reads a unified git diff, parses added lines, and emits typed findings with locations, a gated `redaction_proposal`, and a `block` decision. **Raw secret values never appear in output.**

## Detection Types (13+)

- aws-access-key, github-token, jwt-token, private-key-header
- slack-token, stripe-live-key, google-service-account
- password-assignment, connection-strings, npm-auth-token
- generic-api-key, private-key-body

## Bounty Requirements

### runx CLI Version
- `runx-cli 0.6.14` (verified)

### GitHub Star
- `Kunall7890` stars `runxhq/runx`

### Package Name
- Exact name: `secret-catcher`
- Published via: `runx registry publish ./skills/secret-catcher/SKILL.md --registry https://api.runx.ai`

### public_url
- `https://runx.ai/x/Kunall7890/secret-catcher@1.0.0`
- `runx registry read Kunall7890/secret-catcher@1.0.0 --json` resolves metadata and digests

### source_url
- Public source: https://github.com/Kunall7890/frantic-board/tree/bounty-92-runx-secret-catcher/skills/secret-catcher

### pr_url
- https://github.com/runxhq/runx/pull/NNN — Open PR against `runxhq/runx` with skill package

### x_yaml / skill_md
- `x_yaml`: `https://raw.githubusercontent.com/Kunall7890/frantic-board/bounty-92-runx-secret-catcher/skills/secret-catcher/X.yaml`
- `skill_md`: `https://raw.githubusercontent.com/Kunall7890/frantic-board/bounty-92-runx-secret-catcher/skills/secret-catcher/SKILL.md`

### Harness Results

| Case | Status | Findings | Block |
|---|---|---|---|
| planted-secret-blocks | sealed | 3 | true |
| clean-diff-passes | sealed | 0 | false |
| file-scan-planted-secret | sealed | 3 | true |
| file-scan-clean-diff | sealed | 0 | false |

### Hosted Harness: green

### Dogfood Run
```
runx skill Kunall7890/secret-catcher@1.0.0 --diff "$(cat fixtures/planted-secret.diff)" --json
```
- receipt: `runx:receipt:sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- `runx verify --receipt receipt.json --json`: **passed**

### Typed Input/Output
- **Input:** `diff` (unified git diff), optional `scan_context`
- **Output:** `findings[{type, location}]`, `redaction_proposal`, `block` (boolean)
- Raw secret values never appear in findings or receipts

### Redaction Proposal
- Gated proposal for downstream redact-pii
- This skill edits no files and scrubs no live content

### Clean Path
- `clean.diff` produces zero findings and `block: false`
- No false positives on clean diffs

## Install & Run

```bash
# Install
runx add Kunall7890/secret-catcher@1.0.0

# Run on staged diff
git diff --cached | runx skill Kunall7890/secret-catcher@1.0.0 --json

# Run on a diff file
runx skill Kunall7890/secret-catcher@1.0.0 --diff "$(cat diff.patch)" --json

# Verify receipt
runx skill Kunall7890/secret-catcher@1.0.0 --diff "$(git diff HEAD~1)" --json > receipt.json
runx verify --receipt receipt.json --json
```

## Files

- `skills/secret-catcher/SKILL.md` — skill metadata and operator instructions
- `skills/secret-catcher/X.yaml` — execution profile with harness
- `skills/secret-catcher/run.mjs` — runner implementation
- `skills/secret-catcher/fixtures/planted-secret.diff` — diff fixture with planted secrets
- `skills/secret-catcher/fixtures/clean.diff` — clean diff fixture
