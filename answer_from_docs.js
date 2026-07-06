#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Default documents directory (configurable via env or hardcoded)
const DOCS_DIR = process.env.DOCS_DIR || path.join(__dirname, 'docs');

// Simple inverted index for search
let index = {};
let loaded = false;

function loadDocs() {
  if (loaded) return;
  loaded = true;

  if (!fs.existsSync(DOCS_DIR)) {
    console.error('Docs directory not found:', DOCS_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
  for (const file of files) {
    const content = fs.readFileSync(path.join(DOCS_DIR, file), 'utf8');
    const words = content.toLowerCase().split(/\W+/);
    for (const word of words) {
      if (!word) continue;
      if (!index[word]) index[word] = [];
      index[word].push({ file, content });
    }
  }
}

function answerFromDocs(query) {
  loadDocs();

  if (!query) {
    return 'Please provide a query.';
  }

  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w);
  if (queryWords.length === 0) {
    return 'No valid words in query.';
  }

  // Score document snippets based on word matches
  const scores = {};
  for (const word of queryWords) {
    if (!index[word]) continue;
    for (const entry of index[word]) {
      const key = entry.file;
      if (!scores[key]) scores[key] = { file: key, score: 0, snippet: '' };
      scores[key].score += 1;
      // Get a snippet of context around the match
      const regex = new RegExp(`(.{0,100})${escapeRegex(word)}(.{0,100})`, 'i');
      const match = regex.exec(entry.content);
      if (match) {
        scores[key].snippet = match[0];
      }
    }
  }

  if (Object.keys(scores).length === 0) {
    return 'No relevant documentation found.';
  }

  // Sort by score descending
  const sorted = Object.values(scores).sort((a, b) => b.score - a.score);
  const best = sorted[0];
  return `From ${best.file}:\n${best.snippet || 'No snippet available.'}`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Main entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const query = args.join(' ');
  if (!query) {
    console.error('Usage: node answer_from_docs.js "<your question>"');
    process.exit(1);
  }
  console.log(answerFromDocs(query));
}

module.exports = { answerFromDocs };
