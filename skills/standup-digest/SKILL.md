# Standup Digest from Work Events

A runx skill that aggregates work events (commits, PRs, issues, deployments, messages) and generates a concise standup digest suitable for daily team sync.

## Usage

```bash
runx skill standup-digest --source <event-source-url> --since <ISO8601 datetime>
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `source` | URL (string) | Yes | — | URL of the work event feed (JSON array of events) |
| `since` | ISO8601 string | No | last 24h | Include events after this timestamp |
| `team` | string (comma-separated) | No | `null` | Filter events for specific team members |
| `format` | enum: `markdown`, `plain`, `json` | No | `markdown` | Output format of the digest |

### Output

- **markdown/plain**: Human-readable digest with sections: Highlights, Changes, Blockers, Metrics.
- **json**: Structured JSON object with the same sections.

### Examples

```bash
runx skill standup-digest --source https://api.example.com/events?since=2025-01-20T00:00:00Z --team "alice,bob"
```

## Execution & Governance

- **Receipt**: Every invocation produces a sealed receipt (`runx receipt`) containing the input parameters, raw event count, digest hash, and output format. The receipt can be verified with `runx verify`.
- **Sealed**: The digest content is hashed (SHA-256) and included in the receipt; any modification invalidates the receipt.
- **Authority**: The skill must be executed under a runx identity with the `skills:standup-digest:execute` scope.
- **Scope**: Network access is restricted to the specified `source` URL only (allow-list). No outbound traffic to other hosts.
- **Failure modes**:
  - `source` unreachable → retry up to 3 times with exponential backoff (1s, 2s, 4s), then fail with a descriptive error.
  - Malformed event data → fail with error listing the first invalid field.
  - Rate limit (HTTP 429) → honor `Retry-After` header, wait and retry once; second 429 → fail.
  - Timeout: each HTTP fetch has a 30-second timeout; total skill execution times out after 120 seconds.

## Catalog

This skill is listed in the runx catalog under `category: standup`. See X.yaml for full catalog metadata.

## Harness

The skill runs inside a governed harness with controlled egress and resource limits. Harness configuration is defined in X.yaml.
