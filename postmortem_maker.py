#!/usr/bin/env python3
"""
Postmortem Maker - A CLI tool to generate postmortem documents.
Usage: python postmortem_maker.py [--title TITLE] [--date DATE] [--author AUTHOR]
"""

import argparse
import datetime

def generate_postmortem(title, date, author):
    template = f"""# Postmortem: {title}

**Date:** {date}
**Author:** {author}

## Summary

[Brief summary of the incident]

## Timeline

- **Start Time:** [YYYY-MM-DD HH:MM UTC]
- **Detection:** [How it was detected]
- **Resolution:** [How it was resolved]

## Root Cause

[Detailed root cause analysis]

## Impact

- **Affected Users:** [Number of users affected]
- **Downtime:** [Duration of downtime]

## Action Items

- [ ] Action item 1
- [ ] Action item 2

## Lessons Learned

[What went well, what could be improved]
"""
    return template

def main():
    parser = argparse.ArgumentParser(description='Generate a postmortem document.')
    parser.add_argument('--title', default='Incident', help='Title of the postmortem')
    parser.add_argument('--date', default=datetime.date.today().isoformat(), help='Date of the postmortem (YYYY-MM-DD)')
    parser.add_argument('--author', default='Unknown', help='Author of the postmortem')
    parser.add_argument('--output', '-o', help='Output file (default: stdout)')
    args = parser.parse_args()

    postmortem = generate_postmortem(args.title, args.date, args.author)

    if args.output:
        with open(args.output, 'w') as f:
            f.write(postmortem)
        print(f"Postmortem written to {args.output}")
    else:
        print(postmortem)

if __name__ == '__main__':
    main()
