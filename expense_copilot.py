#!/usr/bin/env python3
"""
Expense Copilot - runx skill for managing expenses.
"""

import csv
import sys
from typing import List, Dict


def load_expenses(file_path: str) -> List[Dict]:
    """Load expenses from a CSV file."""
    expenses = []
    try:
        with open(file_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Normalize keys (lowercase, strip)
                normalized = {k.strip().lower(): v.strip() for k, v in row.items()}
                if 'amount' in normalized:
                    try:
                        normalized['amount'] = float(normalized['amount'])
                    except ValueError:
                        normalized['amount'] = 0.0
                expenses.append(normalized)
    except FileNotFoundError:
        print(f"Error: File {file_path} not found.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error loading expenses: {e}", file=sys.stderr)
        sys.exit(1)
    return expenses


def categorize_expenses(expenses: List[Dict]) -> Dict[str, float]:
    """Group expenses by category and sum amounts."""
    categories = {}
    for e in expenses:
        cat = e.get('category', 'uncategorized')
        categories[cat] = categories.get(cat, 0.0) + e.get('amount', 0.0)
    return categories


def generate_report(expenses: List[Dict]) -> str:
    """Generate a text report of expenses."""
    total = sum(e.get('amount', 0.0) for e in expenses)
    categories = categorize_expenses(expenses)
    lines = []
    lines.append("Expense Report")
    lines.append("==============")
    lines.append(f"Total expenses: ${total:.2f}")
    lines.append(f"Number of transactions: {len(expenses)}")
    lines.append("")
    lines.append("Breakdown by category:")
    for cat, amt in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        percentage = (amt / total * 100) if total > 0 else 0
        lines.append(f"  {cat}: ${amt:.2f} ({percentage:.1f}%)")
    lines.append("")
    lines.append("Top 5 largest expenses:")
    sorted_expenses = sorted(expenses, key=lambda x: x.get('amount', 0), reverse=True)[:5]
    for i, e in enumerate(sorted_expenses, 1):
        date = e.get('date', 'N/A')
        desc = e.get('description', 'No description')
        amt = e.get('amount', 0)
        lines.append(f"  {i}. {date} - {desc}: ${amt:.2f}")
    return "\n".join(lines)


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Expense Copilot - analyze your expenses.')
    parser.add_argument('file', help='Path to CSV expense file')
    args = parser.parse_args()

    expenses = load_expenses(args.file)
    report = generate_report(expenses)
    print(report)


if __name__ == '__main__':
    main()
