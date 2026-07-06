# SBOM Maker

A runx skill to generate Software Bill of Materials (SBOM) in CycloneDX format.

## Usage

```bash
python3 sbom_maker.py /path/to/project -o sbom.json
```

Currently supports:
- Python projects with `requirements.txt`
- Node.js projects with `package.json`

## Output

CycloneDX JSON SBOM file.
