#!/usr/bin/env python3
"""Postmortem Maker: Generate structured postmortem reports from incident data."""

import argparse
import sys
from datetime import datetime
from pathlib import Path


def load_template(template_path: str) -> str:
    """Load the markdown template from file."""
    try:
        with open(template_path, 'r') as f:
            return f.read()
    except FileNotFoundError:
        print(f"Error: Template file '{template_path}' not found.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error reading template: {e}", file=sys.stderr)
        sys.exit(1)


def fill_template(template: str, **kwargs) -> str:
    """Replace placeholders in template with values."""
    try:
        return template.format(**kwargs)
    except KeyError as e:
        print(f"Error: Missing placeholder {e} in arguments.", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Generate a postmortem report.")
    parser.add_argument("--title", required=True, help="Title of the incident")
    parser.add_argument("--date", default=datetime.now().strftime("%Y-%m-%d"),
                        help="Date of incident (YYYY-MM-DD)")
    parser.add_argument("--author", required=True, help="Author of the postmortem")
    parser.add_argument("--summary", required=True, help="Brief summary of the incident")
    parser.add_argument("--impact", required=True, help="Impact description")
    parser.add_argument("--root-cause", required=True, help="Root cause analysis")
    parser.add_argument("--timeline", required=True, help="Timeline of events")
    parser.add_argument("--action-items", required=True, help="Action items to prevent recurrence")
    parser.add_argument("--output", default="postmortem.md", help="Output file path")
    parser.add_argument("--template", default="template.md", help="Path to template file")

    args = parser.parse_args()

    template = load_template(args.template)
    filled = fill_template(template,
                           title=args.title,
                           date=args.date,
                           author=args.author,
                           summary=args.summary,
                           impact=args.impact,
                           root_cause=args.root_cause,
                           timeline=args.timeline,
                           action_items=args.action_items)

    output_path = Path(args.output)
    try:
        with open(output_path, 'w') as f:
            f.write(filled)
        print(f"Postmortem saved to {output_path}")
    except Exception as e:
        print(f"Error writing output file: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
