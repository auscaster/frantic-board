#!/usr/bin/env python3
"""SBOM Maker - Generate Software Bill of Materials.

Supports parsing requirements.txt (Python) and package.json (Node.js)
to produce CycloneDX JSON output.
"""

import argparse
import json
import os
import sys
from datetime import datetime


def parse_requirements(file_path):
    """Parse requirements.txt and return list of (name, version)."""
    dependencies = []
    with open(file_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            # Handle extras like package[extra]>=version
            if '>=' in line:
                parts = line.split('>=')
                name = parts[0].strip()
                version = parts[1].strip()
            elif '==' in line:
                parts = line.split('==')
                name = parts[0].strip()
                version = parts[1].strip()
            else:
                name = line
                version = None
            # Remove extras markers for name
            name = name.split('[')[0]
            dependencies.append((name, version))
    return dependencies


def parse_package_json(file_path):
    """Parse package.json and return list of (name, version)."""
    with open(file_path, 'r') as f:
        data = json.load(f)
    dependencies = []
    for key, value in data.get('dependencies', {}).items():
        version = value.lstrip('^~>=<')
        dependencies.append((key, version))
    for key, value in data.get('devDependencies', {}).items():
        version = value.lstrip('^~>=<')
        dependencies.append((key, version))
    return dependencies


def generate_cyclonedx(dependencies, tool_name='sbom_maker', tool_version='1.0.0'):
    """Generate CycloneDX JSON SBOM from list of dependencies."""
    bom = {
        "bomFormat": "CycloneDX",
        "specVersion": "1.4",
        "version": 1,
        "metadata": {
            "timestamp": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
            "tools": [
                {
                    "vendor": "runx",
                    "name": tool_name,
                    "version": tool_version
                }
            ]
        },
        "components": []
    }
    for name, version in dependencies:
        component = {
            "type": "library",
            "name": name,
            "purl": f"pkg:pypi/{name}@{version}" if version else f"pkg:pypi/{name}",
            "bom-ref": name
        }
        if version:
            component["version"] = version
        bom["components"].append(component)
    return bom


def main():
    parser = argparse.ArgumentParser(description='Generate SBOM from dependency files.')
    parser.add_argument('input', help='Path to requirements.txt or package.json')
    parser.add_argument('-o', '--output', help='Output file (default: stdout)')
    args = parser.parse_args()

    if not os.path.isfile(args.input):
        print(f"Error: File '{args.input}' not found.", file=sys.stderr)
        sys.exit(1)

    filename = os.path.basename(args.input)
    if filename == 'requirements.txt':
        deps = parse_requirements(args.input)
    elif filename == 'package.json':
        deps = parse_package_json(args.input)
    else:
        print(f"Unsupported file type: {filename}. Use requirements.txt or package.json.", file=sys.stderr)
        sys.exit(1)

    bom = generate_cyclonedx(deps)
    output = json.dumps(bom, indent=2)

    if args.output:
        with open(args.output, 'w') as f:
            f.write(output)
        print(f"SBOM written to {args.output}")
    else:
        print(output)


if __name__ == '__main__':
    main()
