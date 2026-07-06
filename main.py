#!/usr/bin/env python3
"""Compliance Pack - RunX Skill for automated compliance checks."""

import json
import sys
from typing import List, Dict, Any


def load_rules(rules_path: str) -> List[Dict[str, Any]]:
    """Load compliance rules from a JSON file."""
    try:
        with open(rules_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Rules file '{rules_path}' not found.", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in rules file: {e}", file=sys.stderr)
        sys.exit(1)


def check_compliance(target: Dict[str, Any], rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Evaluate target against a list of rules."""
    violations = []
    for rule in rules:
        field = rule.get('field')
        expected = rule.get('expected')
        condition = rule.get('condition', 'eq')  # Default: equality

        actual = target.get(field)
        if condition == 'eq' and actual != expected:
            violations.append({
                'rule': rule.get('name', f"Rule on {field}"),
                'field': field,
                'expected': expected,
                'actual': actual
            })
        elif condition == 'exists' and actual is None:
            violations.append({
                'rule': rule.get('name', f"Rule on {field}"),
                'field': field,
                'expected': 'field must exist',
                'actual': 'missing'
            })
        elif condition == 'gt' and (actual is None or actual <= expected):
            violations.append({
                'rule': rule.get('name', f"Rule on {field}"),
                'field': field,
                'expected': f"greater than {expected}",
                'actual': actual
            })
    return violations


def main():
    if len(sys.argv) != 3:
        print("Usage: python main.py <target.json> <rules.json>")
        sys.exit(1)

    target_path = sys.argv[1]
    rules_path = sys.argv[2]

    try:
        with open(target_path, 'r') as f:
            target = json.load(f)
    except Exception as e:
        print(f"Error loading target: {e}", file=sys.stderr)
        sys.exit(1)

    rules = load_rules(rules_path)
    violations = check_compliance(target, rules)

    if violations:
        print("Compliance violations found:")
        print(json.dumps(violations, indent=2))
        sys.exit(1)
    else:
        print("All compliance checks passed.")
        sys.exit(0)


if __name__ == "__main__":
    main()
