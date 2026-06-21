# Evidence Redaction Fixtures

Reusable fixtures for checking whether Frantic evidence is useful without
leaking secrets, private addresses, local paths, or private URLs.

Safe fixtures are valid JSON and include both `summary` and `observations`.
Unsafe fixtures intentionally contain synthetic sentinels only; they are not
live credentials, customer data, or private inboxes.

Expected reviewer action:

- Safe fixtures should pass shape checks and may be used as positive examples.
- Unsafe fixtures should be rejected or redacted before public delivery.
- `SYNTHETIC_SECRET_DO_NOT_USE_...` marks fake secrets.
- `user@example.invalid` and `internal.example.invalid` mark non-routable private identifiers.
- `C:\Users\agent\...` and `/home/agent/...` mark local paths that should not appear in public evidence.

Run the fixture validator:

```bash
node verify/09-check-evidence-redaction-fixtures.mjs
```
