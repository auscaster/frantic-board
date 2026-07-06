#!/usr/bin/env python3
"""SBOM Maker - Generate CycloneDX SBOM from project dependencies."""

import argparse
import json
import os
import sys
from datetime import datetime
from typing import Any, Dict, List, Optional

def parse_requirements(filepath: str) -> List[Dict[str, str]]:
    """Parse a requirements.txt file and return list of package dicts."""
    packages = []
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or line.startswith('--'):
                continue
            # Handle lines like package==version or package>=version
            if '==' in line:
                name, version = line.split('==', 1)
            elif '>=' in line:
                name, version = line.split('>=', 1)
            else:
                name = line.split()[0]
                version = '*'
            packages.append({'name': name, 'version': version})
    return packages

def parse_package_json(filepath: str) -> List[Dict[str, str]]:
    """Parse package.json dependencies."""
    with open(filepath, 'r') as f:
        data = json.load(f)
    deps = data.get('dependencies', {})
    packages = [{'name': k, 'version': v.lstrip('^~')} for k, v in deps.items()]
    return packages

def build_sbom(components: List[Dict[str, str]], format: str = 'cyclonedx') -> Dict[str, Any]:
    """Build a CycloneDX SBOM JSON object."""
    if format == 'cyclonedx':
        return {
            'bomFormat': 'CycloneDX',
            'specVersion': '1.4',
            'serialNumber': f'urn:uuid:{datetime.utcnow().timestamp()}',
            'version': 1,
            'metadata': {
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'tools': [{'name': 'sbom_maker', 'version': '1.0.0'}]
            },
            'components': [
                {
                    'type': 'library',
                    'name': comp['name'],
                    'version': comp['version'],
                    'purl': f'pkg:pypi/{comp["name"]}@{comp["version"]}' if comp['version'] != '*' else f'pkg:pypi/{comp["name"]}'
                }
                for comp in components
            ]
        }
    else:
        raise ValueError(f'Unsupported format: {format}')

def detect_package_manager(path: str) -> Optional[str]:
    """Detect package manager based on lock files or config files."""
    if os.path.isfile(os.path.join(path, 'package.json')):
        return 'npm'
    if os.path.isfile(os.path.join(path, 'requirements.txt')):
        return 'pip'
    if os.path.isfile(os.path.join(path, 'pyproject.toml')):
        return 'pip'
    return None

def generate_sbom(path: str, output: str, format: str = 'cyclonedx') -> None:
    """Generate SBOM for project at given path."""
    pm = detect_package_manager(path)
    if not pm:
        print('Error: Could not detect package manager. Supported: npm, pip.', file=sys.stderr)
        sys.exit(1)

    if pm == 'npm':
        comps = parse_package_json(os.path.join(path, 'package.json'))
    elif pm == 'pip':
        req_path = os.path.join(path, 'requirements.txt')
        if os.path.isfile(req_path):
            comps = parse_requirements(req_path)
        else:
            print('Error: Found pyproject.toml but no requirements.txt. Parsing pyproject.toml not implemented yet.', file=sys.stderr)
            sys.exit(1)
    else:
        print('Error: Unsupported package manager.', file=sys.stderr)
        sys.exit(1)

    sbom = build_sbom(comps, format)
    with open(output, 'w') as f:
        json.dump(sbom, f, indent=2)
    print(f'SBOM written to {output}')

def main():
    parser = argparse.ArgumentParser(description='Generate SBOM for a project.')
    parser.add_argument('path', help='Path to project directory')
    parser.add_argument('-o', '--output', default='sbom.json', help='Output file (default: sbom.json)')
    parser.add_argument('-f', '--format', default='cyclonedx', choices=['cyclonedx'], help='SBOM format')
    args = parser.parse_args()

    if not os.path.isdir(args.path):
        print(f'Error: {args.path} is not a directory.', file=sys.stderr)
        sys.exit(1)

    generate_sbom(args.path, args.output, args.format)

if __name__ == '__main__':
    main()
