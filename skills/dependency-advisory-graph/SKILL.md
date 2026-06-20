---
name: dependency-advisory-graph
description: A runx graph skill that accepts a dependency manifest and emits a fix-prioritized advisory packet with a graph receipt.
---

# Dependency Advisory Graph Skill

This skill analyzes a dependency manifest (e.g. package.json) and outputs a list of advisories mapping installed versions to known vulnerabilities.

## Usage
Run `python skill.py <path_to_manifest>` to emit the advisory packet.

