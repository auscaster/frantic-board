#!/usr/bin/env python3
"""
runx skill: integration doctor
Diagnostic tool to validate integration configurations.
Usage: python integration_doctor.py [--config path]
"""

import argparse
import json
import sys
from typing import Any, Dict, List


def load_config(path: str) -> Dict[str, Any]:
    """Load configuration from a JSON file."""
    try:
        with open(path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Config file not found: {path}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in config file: {e}", file=sys.stderr)
        sys.exit(1)


def check_endpoint(url: str, timeout: int = 5) -> bool:
    """Check if an endpoint is reachable via HTTP."""
    import requests
    try:
        resp = requests.get(url, timeout=timeout)
        return resp.status_code < 500
    except requests.RequestException:
        return False


def validate_integration(integration: Dict[str, Any]) -> List[str]:
    """Validate a single integration entry."""
    issues = []
    name = integration.get('name', 'unnamed')
    endpoint = integration.get('endpoint')
    if not endpoint:
        issues.append(f"{name}: missing endpoint")
        return issues
    if not endpoint.startswith(('http://', 'https://')):
        issues.append(f"{name}: invalid endpoint URL (must start with http or https)")
    else:
        if not check_endpoint(endpoint):
            issues.append(f"{name}: endpoint not reachable: {endpoint}")
    # Check required fields
    for field in ['auth_type', 'api_key']:
        if field not in integration:
            issues.append(f"{name}: missing required field '{field}'")
    return issues


def run_doctor(config: Dict[str, Any]) -> int:
    """Run all integration checks. Returns exit code (0=success, 1=issues found)."""
    integrations = config.get('integrations', [])
    if not integrations:
        print("No integrations configured.")
        return 0

    all_issues = []
    for integration in integrations:
        issues = validate_integration(integration)
        all_issues.extend(issues)

    if all_issues:
        print("Integration Doctor found issues:")
        for issue in all_issues:
            print(f"  - {issue}")
        return 1
    else:
        print("All integrations look healthy.")
        return 0


def main() -> None:
    parser = argparse.ArgumentParser(description='runx skill: integration doctor')
    parser.add_argument('--config', default='integrations.json',
                        help='Path to integration config file (default: integrations.json)')
    args = parser.parse_args()

    config = load_config(args.config)
    exit_code = run_doctor(config)
    sys.exit(exit_code)


if __name__ == '__main__':
    main()
