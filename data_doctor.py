#!/usr/bin/env python3
"""
Data Doctor - runx skill for validating and fixing CSV data.
Frantic bounty #91.
"""

import argparse
import csv
import sys
from collections import defaultdict
from pathlib import Path


def analyze_csv(filepath, delimiter=',', fix=False, output=None):
    """Analyze a CSV file for common data issues and optionally fix them."""
    issues = []
    rows = []
    expected_columns = None
    line_num = 0

    with open(filepath, 'r', newline='', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=delimiter)
        header = next(reader, None)
        if header is None:
            return ['Empty file']
        expected_columns = len(header)
        rows.append(header)

        for line in reader:
            line_num += 1
            rows.append(line)
            # Check row length
            if len(line) != expected_columns:
                issues.append(f'Row {line_num + 1}: Expected {expected_columns} columns, got {len(line)}')
            # Check for missing values
            for idx, val in enumerate(line):
                if val.strip() == '':
                    col_name = header[idx] if idx < len(header) else f'Column {idx}'
                    issues.append(f'Row {line_num + 1}: Missing value in column "{col_name}"')

    # Check for duplicates
    seen = defaultdict(list)
    for idx, row in enumerate(rows[1:], start=2):
        row_tuple = tuple(row)
        seen[row_tuple].append(idx)

    for row_tuple, positions in seen.items():
        if len(positions) > 1:
            issues.append(f'Duplicate rows found at lines: {positions}')

    # Print issues
    if issues:
        print(f'Found {len(issues)} issue(s):')
        for issue in issues:
            print(f'  - {issue}')
    else:
        print('No issues found.')

    # If fix requested, write corrected version
    if fix and issues:
        # Attempt to fix: fill missing values with 'N/A', pad/trim rows
        fixed_rows = [header]
        for line in rows[1:]:
            fixed = list(line)
            # Pad if short
            while len(fixed) < expected_columns:
                fixed.append('')
            # Truncate if long
            fixed = fixed[:expected_columns]
            # Fill empty
            for i in range(len(fixed)):
                if fixed[i].strip() == '':
                    fixed[i] = 'N/A'
            fixed_rows.append(fixed)

        # Remove duplicates (keep first occurrence)
        seen_fixed = set()
        unique_rows = [fixed_rows[0]]
        for row in fixed_rows[1:]:
            row_tuple = tuple(row)
            if row_tuple not in seen_fixed:
                seen_fixed.add(row_tuple)
                unique_rows.append(row)

        output_path = output or filepath.with_stem(filepath.stem + '_fixed')
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f, delimiter=delimiter)
            writer.writerows(unique_rows)
        print(f'Fixed file written to {output_path}')
    elif fix and not issues:
        print('No issues to fix.')


def main():
    parser = argparse.ArgumentParser(description='Data Doctor: validate/fix CSV files.')
    parser.add_argument('file', type=str, help='Path to CSV file')
    parser.add_argument('-d', '--delimiter', default=',', help='CSV delimiter (default: comma)')
    parser.add_argument('--fix', action='store_true', help='Automatically fix issues and write new file')
    parser.add_argument('-o', '--output', type=str, help='Output file path (default: input_fixed.csv)')
    args = parser.parse_args()

    filepath = Path(args.file)
    if not filepath.exists():
        print(f'Error: file {filepath} does not exist.')
        sys.exit(1)

    analyze_csv(filepath, args.delimiter, args.fix, args.output)


if __name__ == '__main__':
    main()
