#!/usr/bin/env python3
"""
Docs Doctor - A skill to analyze documentation health.
Scans markdown files for common issues: broken links, missing alt text, heading structure, and more.
"""

import os
import re
import sys
from urllib.parse import urlparse
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError


def find_markdown_files(root_dir='.'):
    """Recursively find all .md files."""
    md_files = []
    for dirpath, _, filenames in os.walk(root_dir):
        for f in filenames:
            if f.endswith('.md'):
                md_files.append(os.path.join(dirpath, f))
    return md_files


def extract_links(content):
    """Extract markdown links: [text](url) and ![alt](url)."""
    # Matches both image and regular links
    pattern = r'!?\[([^\]]*)\]\(([^)]+)\)'
    return re.findall(pattern, content)


def is_external(url):
    """Check if URL is external (starts with http)."""
    return url.startswith('http://') or url.startswith('https://')


def check_link(url, timeout=5):
    """Check if an external link is reachable."""
    if not is_external(url):
        return True, None  # Skip relative/internal links
    try:
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urlopen(req, timeout=timeout)
        return True, None
    except HTTPError as e:
        return False, f'HTTP {e.code}'
    except URLError as e:
        return False, f'{e.reason}'
    except Exception as e:
        return False, str(e)


def check_heading_order(content):
    """Check that headings are in proper order (no jumps)."""
    heading_pattern = r'^(#{1,6})\s+(.+)$'
    matches = re.finditer(heading_pattern, content, re.MULTILINE)
    prev_level = 0
    issues = []
    for match in matches:
        level = len(match.group(1))
        if prev_level and level > prev_level + 1:
            issues.append(f'Heading level jump from {prev_level} to {level}: "{match.group(2).strip()}"')
        prev_level = level
    return issues


def check_alt_text(content):
    """Check that images have alt text."""
    pattern = r'!\[([^\]]*)\]\([^)]+\)'
    matches = re.findall(pattern, content)
    issues = []
    for alt, url in extract_links(content):
        if alt.strip() == '':
            issues.append(f'Image missing alt text: {url}')
    return issues


def check_code_fences(content):
    """Check for unclosed code fences."""
    count = content.count('```')
    if count % 2 != 0:
        return ['Unclosed code fence detected.']
    return []


def analyze_file(filepath):
    """Analyze a single markdown file and return issues."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    issues = []
    issues.extend(check_heading_order(content))
    issues.extend(check_alt_text(content))
    issues.extend(check_code_fences(content))
    # Check external links
    for _, url in extract_links(content):
        if is_external(url):
            ok, err = check_link(url)
            if not ok:
                issues.append(f'Broken link: {url} ({err})')
    return issues


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else '.'
    md_files = find_markdown_files(root)
    if not md_files:
        print('No markdown files found.')
        sys.exit(0)
    all_issues = {}
    for f in md_files:
        issues = analyze_file(f)
        if issues:
            all_issues[f] = issues
    if all_issues:
        print(f'Found issues in {len(all_issues)} file(s):\n')
        for filepath, issues in all_issues.items():
            print(f'{filepath}:')
            for issue in issues:
                print(f'  - {issue}')
            print()
    else:
        print('No issues found. Documentation looks healthy!')


if __name__ == '__main__':
    main()
