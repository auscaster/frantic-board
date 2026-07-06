#!/usr/bin/env python3
"""runx skill: integration doctor - diagnoses integration issues."""
import json
import sys
import urllib.request
import urllib.error
import ssl
import argparse
from typing import Dict, List, Any, Optional


class IntegrationDoctor:
    """Main class for diagnosing integrations."""

    def __init__(self, config: Dict[str, Any]):
        """Initialize with configuration."""
        self.config = config
        self.results: List[Dict[str, Any]] = []

    @staticmethod
    def load_config(path: str) -> Dict[str, Any]:
        """Load configuration from JSON file."""
        with open(path, 'r') as f:
            return json.load(f)

    def check_http_endpoint(self, name: str, url: str, timeout: int = 10) -> Dict[str, Any]:
        """Check an HTTP endpoint availability."""
        result = {
            'name': name,
            'type': 'http',
            'url': url,
            'status': 'unknown',
            'status_code': None,
            'error': None
        }
        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            req = urllib.request.Request(url, method='GET')
            with urllib.request.urlopen(req, context=ctx, timeout=timeout) as response:
                result['status_code'] = response.status
                result['status'] = 'up' if 200 <= response.status < 400 else 'degraded'
        except urllib.error.HTTPError as e:
            result['status_code'] = e.code
            result['status'] = 'degraded' if 400 <= e.code < 500 else 'down'
            result['error'] = str(e)
        except Exception as e:
            result['status'] = 'down'
            result['error'] = str(e)
        return result

    def run_checks(self) -> List[Dict[str, Any]]:
        """Run all checks defined in config."""
        checks = self.config.get('checks', [])
        for check in checks:
            check_type = check.get('type', '')
            if check_type == 'http':
                result = self.check_http_endpoint(
                    name=check['name'],
                    url=check['url'],
                    timeout=check.get('timeout', 10)
                )
                self.results.append(result)
            else:
                self.results.append({
                    'name': check.get('name', 'unknown'),
                    'type': check_type,
                    'status': 'error',
                    'error': f'Unsupported check type: {check_type}'
                })
        return self.results

    def generate_report(self) -> Dict[str, Any]:
        """Generate a summary report."""
        total = len(self.results)
        up = sum(1 for r in self.results if r['status'] == 'up')
        degraded = sum(1 for r in self.results if r['status'] == 'degraded')
        down = sum(1 for r in self.results if r['status'] == 'down')
        errors = sum(1 for r in self.results if r['status'] == 'error')
        overall = 'healthy' if down == 0 and errors == 0 else ('degraded' if degraded > 0 else 'critical')
        return {
            'overall_status': overall,
            'total_checks': total,
            'up': up,
            'degraded': degraded,
            'down': down,
            'errors': errors,
            'checks': self.results
        }


def main():
    parser = argparse.ArgumentParser(description='Integration Doctor - Diagnose integration health')
    parser.add_argument('-c', '--config', required=True, help='Path to config JSON file')
    parser.add_argument('-o', '--output', help='Output file for report (default stdout)')
    args = parser.parse_args()

    try:
        config = IntegrationDoctor.load_config(args.config)
    except Exception as e:
        print(f"Error loading config: {e}", file=sys.stderr)
        sys.exit(1)

    doctor = IntegrationDoctor(config)
    doctor.run_checks()
    report = doctor.generate_report()

    output = json.dumps(report, indent=2)
    if args.output:
        with open(args.output, 'w') as f:
            f.write(output)
        print(f"Report written to {args.output}")
    else:
        print(output)

    if report['overall_status'] != 'healthy':
        sys.exit(1)


if __name__ == '__main__':
    main()
