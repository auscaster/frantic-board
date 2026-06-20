# Dependency Advisory Graph Skill

## Overview
This report validates the implementation of the `dependency-advisory-graph` runx skill.

## 1. Skill Delivery
- **Source Code**: Published to https://github.com/codeboost-tr/dependency-advisory-graph-skill
- **Functionality**: Reads a dependency manifest (e.g. package.json) and checks exact package versions against advisory mappings.
- **Output**: Emits a `fix-prioritized advisory packet` containing:
  - package name
  - installed version
  - advisory id
  - evidence URL
  - severity
  - fix version (if applicable)
  - confidence

## 2. Receipt Format
The skill correctly appends the runx graph receipt in the payload, e.g. `runx:receipt:graph:1234...`

## 3. False Positive Handling
The script evaluates the strict exact version parsing to avoid emitting warnings for fixed or unaffected package versions. Clean manifests return empty `findings`.

