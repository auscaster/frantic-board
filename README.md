# SBOM Maker Skill for runx

Generates a Software Bill of Materials (SBOM) in CycloneDX or SPDX format from a Node.js project's `package.json`.

## Usage

```bash
node sbom-maker.js [--format cyclonedx|spdx] [--output FILE] [PROJECT_DIR]
```

- `--format`: Output format (default: cyclonedx)
- `--output`: Write to file instead of stdout
- `PROJECT_DIR`: Directory containing `package.json` (default: current directory)

## Example

```bash
node sbom-maker.js --format spdx --output bom.spdx.json ./my-project
```

## Production Readiness

This script is self-contained with no external dependencies beyond Node.js built-ins. It handles errors gracefully and supports both CycloneDX 1.4 and SPDX 2.3 formats. For production use, consider integrating with package manager tools like `npm` or `yarn` for more accurate version resolution.