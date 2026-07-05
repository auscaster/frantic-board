---
name: secret-catcher
description: Scan files, stdin, or text content for hardcoded secrets, API keys, tokens, and credentials using regex pattern matching.
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
  source:
    type: string
    required: false
    description: Text content to scan for secrets. If omitted, reads from RUNX_INPUT_SOURCE_PATH or stdin.
  path:
    type: string
    required: false
    description: File or directory path to scan (overrides source).
  format:
    type: string
    required: false
    default: json
    description: Output format (json, text, or report).
  severity:
    type: string
    required: false
    default: all
    description: Minimum severity level (low, medium, high, critical, all).
runx:
  input_resolution:
    optional:
      - source
      - path
      - format
      - severity
  artifacts:
    named_emits:
      findings: findings
      summary: summary
---

Scan content for hardcoded credentials before they reach production.

## Overview

Secret Catcher is a governed runx skill that detects hardcoded secrets,
API keys, tokens, passwords, and other credentials in text content,
files, or piped input. It uses composable regex patterns organized by
provider and credential type, with severity scoring and context-aware
filtering to reduce false positives.

Use it as a pre-commit gate, a CI pipeline step, or an ad-hoc audit
tool — all under runx governance with sealed receipts.

## Secret Categories Detected

| Category | Examples | Severity |
|---|---|---|
| AWS Keys | `AKIA*`, `ASIA*` access key + secret pair | critical |
| GitHub Tokens | `ghp_*`, `gho_*`, `ghu_*`, `ghs_*`, `ghr_*` | critical |
| Generic API Keys | `api_key`, `apikey`, `api-secret` patterns | high |
| JWT Tokens | `eyJ*` base64url-encoded JSON Web Tokens | high |
| Private Keys | RSA, DSA, EC, PGP, SSH private key headers | critical |
| Slack Tokens | `xoxb-*`, `xoxa-*`, `xoxp-*`, `xoxe-*` | high |
| Stripe Keys | `sk_live_*`, `pk_live_*`, `rk_live_*` | critical |
| Google Service Account | `"type": "service_account"` JSON blocks | critical |
| Heroku API Keys | `heroku.*key` patterns | high |
| Password Fields | `password =`, `passwd =`, `pwd =` assignments | medium |
| Connection Strings | `mongodb+srv://`, `postgresql://` with credentials | high |
| npm/Gem Auth Tokens | `_authToken=`, `//registry.npmjs.org/:_authToken` | high |
| Docker Config Auth | `"auths":` entries with base64 credentials | medium |
| SSH Keys (content) | SSH private key bodies | critical |
| Azure/ADO PAT | Azure DevOps Personal Access Tokens | high |
| Datadog Keys | `dd_api_*`, `dd_app_key_*` | high |
| SendGrid Keys | `SG.*` API key pattern | high |
| Twilio Credentials | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | high |

## Usage

```bash
# Scan inline text
runx skill ./skills/secret-catcher --source "text with AKIAIOSFODNN7EXAMPLE key"

# Scan a file
runx skill ./skills/secret-catcher --path /path/to/file.env

# Scan a directory recursively
runx skill ./skills/secret-catcher --path /path/to/project

# Pipe content
cat config.json | runx skill ./skills/secret-catcher

# Text report format
runx skill ./skills/secret-catcher --path .env --format report
```

## Exit Codes

| Code | Meaning |
|---|---|
| 0 | No secrets detected (or scan completed successfully with no findings) |
| 1 | Secrets detected (findings were found and reported) |
| 2 | Scan error (invalid input, path not found, etc.) |

## Governance

This skill operates under runx's readonly sandbox profile. It reads
files from the declared workspace but never writes, modifies, or
exfiltrates content. All scan results are captured in the sealed
receipt for audit trail.

## False Positive Mitigation

- Common test keys and example values are ignored (e.g., `AKIAIOSFODNN7EXAMPLE`, `sk_test_*`)
- Keys inside markdown code blocks and documentation files are flagged at lower severity
- Binary files are skipped automatically
- Paths matching `.git/`, `node_modules/`, `vendor/` are excluded
