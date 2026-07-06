#!/usr/bin/env python3
"""
runx skill: docs doctor
Checks documentation files for common issues: broken links, missing referenced files, etc.
"""
import os
import re
import sys

def find_markdown_files(root_dir):
    md_files = []
    for dirpath, _, filenames in os.walk(root_dir):
        for f in filenames:
            if f.endswith('.md'):
                md_files.append(os.path.join(dirpath, f))
    return md_files

def extract_links(md_content):
    # Find markdown links: [text](url) and reference-style links
    links = re.findall(r'\!?\[[^\]]+\]\(([^)]+)\)', md_content)
    return links

def check_links(filepath, links, root_dir):
    issues = []
    for link in links:
        # Skip external links (http, https, ftp)
        if link.startswith(('http://', 'https://', 'ftp://')):
            continue
        # Handle anchors only (e.g., #section)
        if link.startswith('#'):
            # Check if anchor exists in same file
            anchor = link[1:].lower()
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                # Find header ids: GFM style or # header
                headers = re.findall(r'^#{1,6}\s+(.*)', content, re.MULTILINE)
                header_ids = [re.sub(r'[^a-zA-Z0-9\- ]', '', h).lower().replace(' ', '-') for h in headers]
                if anchor not in header_ids:
                    issues.append(f"Missing anchor '{link}' in {filepath}")
            continue
        # Relative file path
        base_dir = os.path.dirname(filepath)
        target_path = os.path.join(base_dir, link)
        # Remove fragment
        target_path = target_path.split('#')[0]
        if not os.path.exists(target_path):
            issues.append(f"Broken link '{link}' in {filepath} -> {target_path} not found")
    return issues

def main():
    root_dir = sys.argv[1] if len(sys.argv) > 1 else '.'
    md_files = find_markdown_files(root_dir)
    all_issues = []
    for md in md_files:
        with open(md, 'r', encoding='utf-8') as f:
            content = f.read()
        links = extract_links(content)
        issues = check_links(md, links, root_dir)
        all_issues.extend(issues)
    if all_issues:
        print("Issues found:")
        for issue in all_issues:
            print(f"  - {issue}")
        sys.exit(1)
    else:
        print("All documentation checks passed.")
        sys.exit(0)

if __name__ == "__main__":
    main()
