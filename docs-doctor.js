const fs = require('fs');
const path = require('path');

module.exports = async function(context) {
  const { files, config } = context;
  const results = [];

  for (const file of files) {
    if (path.extname(file) !== '.md') continue;

    const content = fs.readFileSync(file, 'utf-8');

    // Check for broken links (simple detection of missing anchor targets)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      const target = match[2];
      if (target.startsWith('http')) continue;
      if (!fs.existsSync(path.join(path.dirname(file), target))) {
        results.push({
          file,
          line: getLineNumber(content, match.index),
          severity: 'warning',
          message: `Broken link to '${target}'`
        });
      }
    }

    // Check for missing top-level heading (H1)
    if (!/^# /m.test(content)) {
      results.push({
        file,
        line: 1,
        severity: 'error',
        message: 'Missing top-level heading (H1)'
      });
    }

    // Check for empty section headings
    const headingRegex = /^#+ .+/gm;
    if (!headingRegex.test(content) && content.trim().length > 0) {
      results.push({
        file,
        line: 1,
        severity: 'warning',
        message: 'No section headings found'
      });
    }
  }

  return { issues: results };
};

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}
