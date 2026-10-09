# Sourcey Docs for GitHub REST API

This directory contains documentation generated with [Sourcey](https://sourcey.com) for the [GitHub REST API](https://github.com/github/rest-api-description).

## What's included

- `github-rest-api-docs/` — Static HTML documentation site built with `sourcey build` from the official GitHub REST API OpenAPI 3.0 spec.
- `evidence.json` — Machine-readable evidence file naming the library, source spec, adapter, and page list.

## How to reproduce

```bash
# Download the official GitHub REST API OpenAPI spec
curl -sL https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json -o api.github.com.json

# Build docs with Sourcey
sourcey build api.github.com.json -o github-rest-api-docs
```

## Live preview

The generated site is self-contained static HTML. Serve `github-rest-api-docs/` with any static file server:

```bash
npx serve github-rest-api-docs
# or
python -m http.server -d github-rest-api-docs
```

## Evidence

- **Library**: GitHub REST API (`github/rest-api-description`)
- **Spec version**: 2026-09-14 (commit `5c01d68e9b6f06803a2c377855b310f7f2279def`)
- **Operations documented**: 1,229
- **Schemas documented**: 975
- **Sourcey version**: 3.6.5
- **Adapter**: `openapi`

Built on 2026-09-14.
