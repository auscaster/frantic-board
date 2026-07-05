import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const patterns = [
  { name: 'aws-access-key', regex: /(?<![a-zA-Z0-9])(AKIA|ASIA)[A-Z0-9]{16}(?![a-zA-Z0-9])/g, severity: 'critical', category: 'AWS' },
  { name: 'aws-secret-key', regex: /(?:aws[-_]?(?:secret|access)[-_]?key|AWS[-_]?(?:SECRET|ACCESS)[-_]?KEY|secret[-_]?access[-_]?key|SECRET[-_]?ACCESS[-_]?KEY).{0,20}['":=\s]{0,5}[a-zA-Z0-9\/+=]{20,}/g, severity: 'critical', category: 'AWS' },
  { name: 'github-token', regex: /(?:ghp_|gho_|ghu_|ghs_|ghr_)[a-zA-Z0-9]{36,}/g, severity: 'critical', category: 'GitHub' },
  { name: 'jwt-token', regex: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, severity: 'high', category: 'JWT' },
  { name: 'private-key-header', regex: /-----BEGIN (?:RSA|DSA|EC|PGP|OPENSSH|PRIVATE) (?:PRIVATE KEY|KEY BLOCK)-----/g, severity: 'critical', category: 'Private Key' },
  { name: 'slack-token', regex: /x(?:ox[abpore]|app)[a-zA-Z0-9-]{10,}/g, severity: 'high', category: 'Slack' },
  { name: 'stripe-live-key', regex: /(?:sk_live|pk_live|rk_live|whsec)_[a-zA-Z0-9]+/g, severity: 'critical', category: 'Stripe' },
  { name: 'google-service-account', regex: /"type":\s*"service_account"/g, severity: 'critical', category: 'Google Cloud' },
  { name: 'heroku-api-key', regex: /(?:heroku|HEROKU).*(?:api[-_]?key|API[-_]?KEY|token|TOKEN)\s*[:=]\s*[a-zA-Z0-9-]+/g, severity: 'high', category: 'Heroku' },
  { name: 'password-assignment', regex: /(?:password|passwd|pwd|secret)\s*[:=]\s*['"]?(?!['"]?\s*$)(?!["']?test['"]?)(?!["']?password['"]?)(?!["']?YOUR_)[^"';\s]{4,}/gi, severity: 'medium', category: 'Password' },
  { name: 'conn-string-mongo', regex: /mongodb(?:\+srv)?:\/\/[a-zA-Z0-9]+:[a-zA-Z0-9]+@/g, severity: 'high', category: 'Connection String' },
  { name: 'conn-string-postgres', regex: /postgresql?:\/\/[a-zA-Z0-9]+:[a-zA-Z0-9]+@/g, severity: 'high', category: 'Connection String' },
  { name: 'conn-string-mysql', regex: /mysql:\/\/[a-zA-Z0-9]+:[a-zA-Z0-9]+@/g, severity: 'high', category: 'Connection String' },
  { name: 'conn-string-redis', regex: /redis:\/\/[^:@\s]+:[^@\s]+@/g, severity: 'high', category: 'Connection String' },
  { name: 'npm-auth-token', regex: /\/\/registry\.npmjs\.org\/:_authToken=[a-zA-Z0-9-]+/g, severity: 'high', category: 'npm' },
  { name: 'docker-config-auth', regex: /"auths":\s*\{[^}]+"[^"]+":\s*\{[^}]+"auth"/g, severity: 'medium', category: 'Docker' },
  { name: 'azure-pat', regex: /(?:ado|azure)\s*pat\s*[:=]\s*[a-zA-Z0-9]{20,}/gi, severity: 'high', category: 'Azure' },
  { name: 'datadog-key', regex: /(?:dd_api_key|dd_app_key)\s*[:=]\s*[a-zA-Z0-9]{20,}/gi, severity: 'high', category: 'Datadog' },
  { name: 'sendgrid-key', regex: /SG\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/g, severity: 'high', category: 'SendGrid' },
  { name: 'twilio-sid', regex: /TWILIO_ACCOUNT_SID\s*[:=]\s*AC[a-zA-Z0-9]{32}/g, severity: 'high', category: 'Twilio' },
  { name: 'twilio-token', regex: /TWILIO_AUTH_TOKEN\s*[:=]\s*[a-zA-Z0-9]{32}/g, severity: 'high', category: 'Twilio' },
  { name: 'generic-api-key', regex: /(?:api[-_]?key|api[-_]?secret|apikey)\s*[:=]\s*['"]?(?!['"]?\s*$)(?!['"]?YOUR_)[^"';\s]{8,}/gi, severity: 'high', category: 'API Key' },
  { name: 'generic-token', regex: /(?:_|-)(?:token|bearer|auth)\s*[:=]\s*['"]?(?!['"]?\s*$)(?!['"]?YOUR_)(?!['"]?test)(?!gh[pousr]_|sk_live|pk_live|rk_live|xox[baproe]|SG\.)[a-zA-Z0-9_\-.]{16,}/gi, severity: 'medium', category: 'Token' },
  { name: 'slack-webhook', regex: /https:\/\/hooks\.slack\.com\/services\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+/g, severity: 'high', category: 'Slack' },
  { name: 'generic-webhook', regex: /https:\/\/[a-zA-Z0-9-]+\.webhook\.office\.com\/webhookb2\/[a-zA-Z0-9-]+\/IncomingWebhook\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+/g, severity: 'high', category: 'Webhook' },
];

const knownTestKeys = [
  'AKIAIOSFODNN7EXAMPLE', 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  'AKIAI44QH8DHBEXAMPLE', 'YOUR_API_KEY_HERE', 'YOUR_API_SECRET',
  'YOUR_AWS_SECRET', 'your-access-key', 'your-secret-key',
  '<replace-with-your-token>', '<your-token>', '<api-key>',
  'EXAMPLEKEY', 'example',
];

const excludeDirs = new Set(['.git', 'node_modules', 'vendor', '.venv', '__pycache__', 'dist', 'build', '.next']);

const binaryExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.pdf', '.zip', '.tar', '.gz', '.bin', '.exe', '.dll', '.so', '.dylib', '.ttf', '.woff', '.eot']);

function isKnownTestKey(value) {
  return knownTestKeys.some(k => value.includes(k));
}

function isBinary(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (binaryExts.has(ext)) return true;
  try {
    const buf = readFileSync(filePath);
    const sample = buf.slice(0, 8192);
    for (let i = 0; i < sample.length; i++) {
      if (sample[i] === 0) return true;
    }
  } catch { }
  return false;
}

function scanContent(content, sourceLabel, severityFilter) {
  const findings = [];
  const lines = content.split('\n');

  for (const p of patterns) {
    if (severityFilter !== 'all') {
      const sevOrder = { low: 0, medium: 1, high: 2, critical: 3 };
      if (sevOrder[p.severity] < sevOrder[severityFilter]) continue;
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match;
      p.regex.lastIndex = 0;
      while ((match = p.regex.exec(line)) !== null) {
        const value = match[0];
        if (isKnownTestKey(value)) continue;
        findings.push({
          pattern: p.name,
          category: p.category,
          severity: p.severity,
          source: sourceLabel,
          line: i + 1,
          column: match.index + 1,
          snippet: line.trim().substring(0, 120),
        });
      }
    }
  }

  const sevRank = { critical: 3, high: 2, medium: 1, low: 0 };
  findings.sort((a, b) => sevRank[b.severity] - sevRank[a.severity]);

  const deduped = [];
  const seenLines = new Set();
  for (const f of findings) {
    const key = `${f.source}:${f.line}`;
    if (seenLines.has(key)) continue;
    seenLines.add(key);
    deduped.push(f);
  }

  return deduped;
}

function scanFile(filePath, severityFilter) {
  if (isBinary(filePath)) return [];
  try {
    const content = readFileSync(filePath, 'utf-8');
    return scanContent(content, filePath, severityFilter);
  } catch (e) {
    return [{ pattern: 'read-error', category: 'Error', severity: 'low', source: filePath, line: 0, column: 0, snippet: `Cannot read file: ${e.message}` }];
  }
}

function scanDirectory(dirPath, severityFilter) {
  const allFindings = [];
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (excludeDirs.has(entry.name)) continue;
        allFindings.push(...scanDirectory(fullPath, severityFilter));
      } else if (entry.isFile()) {
        allFindings.push(...scanFile(fullPath, severityFilter));
      }
    }
  } catch (e) {
    allFindings.push({ pattern: 'scan-error', category: 'Error', severity: 'low', source: dirPath, line: 0, column: 0, snippet: `Cannot scan directory: ${e.message}` });
  }
  return allFindings;
}

function generateSummary(findings) {
  const bySeverity = {};
  const byCategory = {};
  for (const f of findings) {
    if (!f.severity) continue;
    bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
    byCategory[f.category] = (byCategory[f.category] || 0) + 1;
  }
  return {
    total: findings.filter(f => f.severity).length,
    errors: findings.filter(f => f.pattern === 'read-error' || f.pattern === 'scan-error').length,
    by_severity: bySeverity,
    by_category: byCategory,
  };
}

async function main() {
  const source = process.env.RUNX_INPUT_SOURCE || '';
  const path = process.env.RUNX_INPUT_PATH || '';
  const format = process.env.RUNX_INPUT_FORMAT || 'json';
  const severity = process.env.RUNX_INPUT_SEVERITY || 'all';
  const stdinContent = await readStdin();

  let findings;

  if (path) {
    if (!existsSync(path)) {
      const result = { error: `Path not found: ${path}`, findings: [], summary: { total: 0, errors: 1, by_severity: {}, by_category: {} } };
      writeOutput(format, result);
      process.exit(2);
    }
    const stat = statSync(path);
    if (stat.isDirectory()) {
      findings = scanDirectory(path, severity);
    } else {
      findings = scanFile(path, severity);
    }
  } else if (source) {
    findings = scanContent(source, '<inline>', severity);
  } else if (stdinContent) {
    findings = scanContent(stdinContent, '<stdin>', severity);
  } else {
    const result = { error: 'No input provided. Use --source, --path, or pipe content to stdin.', findings: [], summary: { total: 0, errors: 1, by_severity: {}, by_category: {} } };
    writeOutput(format, result);
    process.exit(2);
  }

  const realFindings = findings.filter(f => f.severity !== 'low' || f.pattern !== 'read-error');
  const summary = generateSummary(findings);
  const secretsFound = realFindings.length > 0;

  const result = { findings: realFindings, summary };
  writeOutput(format, result);

  process.exit(secretsFound ? 1 : 0);
}

function writeOutput(format, result) {
  if (format === 'report') {
    console.log('=== Secret Catcher Report ===\n');
    console.log(`Scan result: ${result.findings.length > 0 ? 'SECRETS FOUND' : 'CLEAN'}`);
    console.log(`Total findings: ${result.summary.total}`);
    if (result.summary.errors) console.log(`Errors: ${result.summary.errors}`);
    console.log('');
    if (result.summary.by_severity && Object.keys(result.summary.by_severity).length > 0) {
      console.log('By severity:');
      for (const [sev, count] of Object.entries(result.summary.by_severity)) {
        console.log(`  ${sev}: ${count}`);
      }
      console.log('');
    }
    if (result.findings.length > 0) {
      console.log('Findings:');
      for (const f of result.findings) {
        console.log(`  [${f.severity}] ${f.category}: ${f.pattern}`);
        console.log(`    File: ${f.source}:${f.line}:${f.column}`);
        console.log(`    Snippet: ${f.snippet}`);
        console.log('');
      }
    }
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

function readStdin() {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      let data = '';
      process.stdin.setEncoding('utf-8');
      process.stdin.on('data', chunk => { data += chunk; });
      process.stdin.on('end', () => resolve(data.trim()));
    } else {
      resolve('');
    }
  });
}

main().catch(err => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(2);
});
