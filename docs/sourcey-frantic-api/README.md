# Frantic public API documentation

This directory contains a reproducible Sourcey build of Frantic's public
OpenAPI document. The generated site gives maintainers and integrators a
navigable endpoint inventory, schemas, and copyable request examples without
changing the application runtime.

## Source and pinning

- Project: `auscaster/frantic-board`
- License: MIT
- Public specification: `https://gofrantic.com/openapi.json`
- Repository revision used for this snapshot:
  `6cc52004d4388372c793978b0300505e13d41edb`
- Sourcey: exactly `3.6.5` through `package-lock.json`
- Snapshot date: `2026-07-14`

The committed `openapi.json` is the build input. This keeps the generated
output reviewable and reproducible even if the live API changes later.

The live snapshot contained one dangling schema reference at
`POST /v1/funding`: `#/components/schemas/JsonOk` was referenced but not
declared. The committed snapshot defines `JsonOk` with the same open object
shape already used by `#/components/responses/JsonOk`. No endpoint, field, or
security requirement was changed. `npm run verify` also rejects any remaining
unresolved schema reference.

## Build and verify

```bash
npm ci
npm run check
```

`npm run check` validates the OpenAPI snapshot, partitions every path exactly
once into five navigable API sections, regenerates `site/`, and then checks the
generated page count, Frantic identity, endpoint content, unresolved schema
references, and API operation inventory. The snapshot currently contains 59
operations across 37 paths.

## Publishing

The generated `site/` directory is committed so it can be served directly from
this repository after merge. The Sourcey configuration uses the upstream
`auscaster/frantic-board` path for assets and canonical navigation; fork and
preview URLs are not the publication target.

## Refreshing the snapshot

When the public API changes, replace `openapi.json` with a fresh response from
the public specification URL, update the repository revision and snapshot date
above, then run `npm run check`. Review the resulting endpoint additions and
removals before committing the regenerated site.
