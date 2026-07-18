import { readFileSync, existsSync } from 'fs';

const patterns = [
  { type: 'aws-access-key', regex: /(?<![a-zA-Z0-9])(AKIA|ASIA)[A-Z0-9]{16}(?![a-zA-Z0-9])/g },
  { type: 'github-token', regex: /(?:ghp_|gho_|ghu_|ghs_|ghr_)[a-zA-Z0-9]{36,}/g },
  { type: 'jwt-token', regex: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g },
  { type: 'private-key-header', regex: /-----BEGIN (?:RSA|DSA|EC|PGP|OPENSSH|PRIVATE) (?:PRIVATE KEY|KEY BLOCK)-----/g },
  { type: 'slack-token', regex: /x(?:ox[abpore]|app)[a-zA-Z0-9-]{10,}/g },
  { type: 'stripe-live-key', regex: /(?:sk_live|pk_live|rk_live|whsec)_[a-zA-Z0-9]+/g },
  { type: 'google-service-account', regex: /"type":\s*"service_account"/g },
  { type: 'password-assignment', regex: /(?:password|passwd|pwd|secret)\s*[:=]\s*['"]?(?!['"]?\s*$)(?!["']?test['"]?)(?!["']?password['"]?)(?!["']?YOUR_)[^"';\s]{4,}/gi },
  { type: 'conn-string', regex: /(?:mongodb(?:\+srv)?|postgresql?|mysql|redis):\/\/[a-zA-Z0-9]+:[a-zA-Z0-9]+@/g },
  { type: 'npm-auth-token', regex: /\/\/registry\.npmjs\.org\/:_authToken=[a-zA-Z0-9-]+/g },
  { type: 'generic-api-key', regex: /(?:api[-_]?key|api[-_]?secret|apikey)\s*[:=]\s*['"]?(?!['"]?\s*$)(?!['"]?YOUR_)[^"';\s]{8,}/gi },
  { type: 'private-key-body', regex: /^[a-zA-Z0-9+/]{60,}={0,2}$/gm },
];

const knownTestKeys = [
  'AKIAIOSFODNN7EXAMPLE', 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  'YOUR_API_KEY_HERE', 'YOUR_API_SECRET', 'YOUR_AWS_SECRET',
  '<replace-with-your-token>', '<your-token>', '<api-key>',
];

function isKnownTestKey(value) {
  return knownTestKeys.some(k => value.includes(k));
}

function parseDiff(diffText) {
  const findings = [];
  const lines = diffText.split('\n');
  let currentFile = 'unknown';

  for (const line of lines) {
    const fileMatch = line.match(/^\+\+\+ (?:b\/)?(.*)/);
    if (fileMatch) {
      currentFile = fileMatch[1];
      continue;
    }

    if (line.startsWith('+') && !line.startsWith('+++')) {
      const content = line.substring(1);
      for (const p of patterns) {
        let match;
        p.regex.lastIndex = 0;
        while ((match = p.regex.exec(content)) !== null) {
          const raw = content.substring(0, 80);
          if (isKnownTestKey(match[0])) continue;
          const location = currentFile !== 'unknown' ? `${currentFile}:${lines.indexOf(line) + 1}` : `line ${lines.indexOf(line) + 1}`;
          findings.push({ type: p.type, location });
        }
      }
    }
  }

  const seen = new Set();
  return findings.filter(f => {
    const key = `${f.type}:${f.location}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildRedactionProposal(findings) {
  if (findings.length === 0) return null;
  const byLocation = {};
  for (const f of findings) {
    if (!byLocation[f.location]) byLocation[f.location] = [];
    byLocation[f.location].push(f.type);
  }
  return {
    description: `Gated redaction proposal: ${findings.length} secret(s) detected across ${Object.keys(byLocation).length} location(s)`,
    locations: Object.entries(byLocation).map(([loc, types]) => ({
      location: loc,
      types,
      recommended_action: 'review and remove hardcoded credential',
      replace_with: types.length === 1 ? `\${${types[0]}}` : '${credential_ref}',
    })),
    policy: 'this skill edits no files and scrubs no live content; proposal is advisory for downstream redact-pii',
  };
}

function scanDiff(diffText) {
  const findings = parseDiff(diffText);
  const block = findings.length > 0;
  return {
    findings,
    redaction_proposal: buildRedactionProposal(findings),
    block,
  };
}

function readStdin() {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      let data = '';
      process.stdin.setEncoding('utf-8');
      process.stdin.on('data', chunk => { data += chunk; });
      process.stdin.on('end', () => resolve(data));
    } else {
      resolve('');
    }
  });
}

async function main() {
  const diffInput = process.env.RUNX_INPUT_DIFF || '';
  const diffPath = process.env.RUNX_INPUT_DIFF_PATH || '';
  const stdinContent = await readStdin();
  let diff = diffInput;

  if (diffPath && existsSync(diffPath)) {
    diff = readFileSync(diffPath, 'utf-8');
  } else if (!diff && stdinContent) {
    diff = stdinContent;
  }

  if (!diff) {
    console.log(JSON.stringify({ error: 'no diff input provided', findings: [], redaction_proposal: null, block: false }));
    process.exit(2);
  }

  const result = scanDiff(diff);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.block ? 1 : 0);
}

main().catch(err => {
  console.log(JSON.stringify({ error: err.message, findings: [], redaction_proposal: null, block: false }));
  process.exit(2);
});
