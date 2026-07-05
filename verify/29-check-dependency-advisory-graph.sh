#!/usr/bin/env bash
# Usage: ./verify/29-check-dependency-advisory-graph.sh <graph.json>
#   e.g.: ./verify/29-check-dependency-advisory-graph.sh my-graph.json
#
# Verifies the MACHINE FLOOR of bounty 29: the graph file is valid JSON,
# contains a "type" field with value "dependency-advisory-graph", has a "nodes"
# array with at least 3 entries, has an "edges" array where every edge's
# "source" and "target" refer to existing node "id"s, and the graph has a
# "metadata" block with "title" and "generated_at" (ISO 8601).
#
# SAFETY: this script reads a LOCAL JSON file only — no network access,
# no SSRF surface. Run it in a sandbox for consistency but it is safe.
set -euo pipefail

GRAPH="${1:?usage: $0 <graph.json>}"

fail() { echo "FAIL: $1" >&2; exit 1; }
pass() { echo "PASS: $1"; exit 0; }

[ -f "$GRAPH" ] || fail "graph file not found: $GRAPH"

node -e "
const fs = require('fs');
const path = process.argv[1];
let data;
try {
  data = JSON.parse(fs.readFileSync(path, 'utf8'));
} catch(e) {
  console.error('FAIL: invalid JSON — ' + e.message);
  process.exit(1);
}

// Check required top-level fields
if (data.type !== 'dependency-advisory-graph') {
  console.error('FAIL: type must be "dependency-advisory-graph", got ' + JSON.stringify(data.type));
  process.exit(1);
}

if (!Array.isArray(data.nodes)) {
  console.error('FAIL: missing or non-array nodes');
  process.exit(1);
}
if (data.nodes.length < 3) {
  console.error('FAIL: nodes array has fewer than 3 entries (' + data.nodes.length + ')');
  process.exit(1);
}

if (!Array.isArray(data.edges)) {
  console.error('FAIL: missing or non-array edges');
  process.exit(1);
}

// Build set of node IDs
const nodeIds = new Set(data.nodes.map(n => n.id));
if ([...nodeIds].some(id => id === undefined || id === null)) {
  console.error('FAIL: a node is missing the id field');
  process.exit(1);
}

// Verify each edge
for (let i = 0; i < data.edges.length; i++) {
  const edge = data.edges[i];
  if (!edge.source || !edge.target) {
    console.error('FAIL: edge ' + i + ' missing source or target');
    process.exit(1);
  }
  if (!nodeIds.has(edge.source)) {
    console.error('FAIL: edge ' + i + ' references unknown source node id: ' + edge.source);
    process.exit(1);
  }
  if (!nodeIds.has(edge.target)) {
    console.error('FAIL: edge ' + i + ' references unknown target node id: ' + edge.target);
    process.exit(1);
  }
}

// Check metadata
if (!data.metadata || !data.metadata.title) {
  console.error('FAIL: missing metadata.title');
  process.exit(1);
}
if (!data.metadata.generated_at || !/^\d{4}-\d{2}-\d{2}T/.test(data.metadata.generated_at)) {
  console.error('FAIL: missing or invalid metadata.generated_at (must be ISO 8601)');
  process.exit(1);
}

console.log('PASS: graph passes all machine-floor checks — type, nodes, edges, and metadata valid');
" "$GRAPH"
