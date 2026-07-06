#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('title', {
    alias: 't',
    type: 'string',
    description: 'Title of the postmortem',
    demandOption: true
  })
  .option('date', {
    alias: 'd',
    type: 'string',
    description: 'Date of the incident (YYYY-MM-DD)',
    default: new Date().toISOString().slice(0, 10)
  })
  .option('summary', {
    alias: 's',
    type: 'string',
    description: 'Brief summary of the incident',
    demandOption: true
  })
  .option('timeline', {
    alias: 'l',
    type: 'string',
    description: 'Comma-separated list of timeline events (time - event)',
    demandOption: true
  })
  .option('rootCause', {
    alias: 'r',
    type: 'string',
    description: 'Root cause of the incident',
    demandOption: true
  })
  .option('actionItems', {
    alias: 'a',
    type: 'string',
    description: 'Comma-separated list of action items',
    demandOption: true
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Output file path (default: postmortem-<title>.md)',
    default: ''
  })
  .help()
  .argv;

const title = argv.title;
const date = argv.date;
const summary = argv.summary;
const timeline = argv.timeline.split(',').map(item => item.trim());
const rootCause = argv.rootCause;
const actionItems = argv.actionItems.split(',').map(item => item.trim());

const outputPath = argv.output || `postmortem-${title.replace(/\s+/g, '-').toLowerCase()}.md`;

const template = `# Postmortem: ${title}

**Date**: ${date}
**Author**: ${process.env.USER || 'unknown'}

## Summary

${summary}

## Timeline

${timeline.map(event => `- ${event}`).join('\n')}

## Root Cause

${rootCause}

## Action Items

${actionItems.map((item, index) => `${index + 1}. ${item}`).join('\n')}

## Lessons Learned

<!-- Add lessons learned here -->

## Appendix

<!-- Add any additional information -->
`;

fs.writeFileSync(path.resolve(outputPath), template, 'utf8');
console.log(`Postmortem generated: ${outputPath}`);
