# Delivery artifact linter fixture report

- The bounty criteria were loaded from a captured public API response.
- Required artifact names were checked exactly.
- All URL artifacts in the passing case, including the PR URL, returned HTTP 200.
- The evidence document contained a summary and observation array.
- The receipt reference used the expected sealed-receipt shape.
- The failing case exercised missing keys, bad evidence, a dead URL, a malformed receipt, and a package mismatch.
