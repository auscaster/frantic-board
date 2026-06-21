# Governed validation

This wrapper runs the committed delivery artifact linter fixtures in-process,
with read-only authority and no network access, and emits a sealed runx receipt.

```bash
runx harness evidence/delivery-artifact-linter --json
runx skill evidence/delivery-artifact-linter --input mode=full --json
```

The happy-path case proves the valid packet exits `0`. The negative case proves
one packet exits `1` while identifying missing fields, unreachable URLs, invalid
evidence JSON, a malformed receipt, and a package-name mismatch.
