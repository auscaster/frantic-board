import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.RUNX_INPUT_REPO_ROOT ?? '';
function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(64);
}
if (!repoRoot.trim()) fail('repo_root is required');
const guidePath = path.resolve(repoRoot, 'docs/claim-verification.md');
const evidencePath = path.resolve(repoRoot, 'evidence/frantic-claim-verification-evidence.json');
if (!fs.existsSync(guidePath)) fail(`guide missing: ${guidePath}`);
if (!fs.existsSync(evidencePath)) fail(`evidence missing: ${evidencePath}`);
const guide = fs.readFileSync(guidePath, 'utf8');
const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
const requiredGuideTerms = [
  'public_url',
  'evidence_json',
  'receipt_ref',
  'report',
  'POST /v1/claims',
  'POST /v1/deliveries/preflight',
  'POST /v1/deliveries',
  'Machine verification does **not** decide the whole bounty',
  'Payout follows acceptance, not delivery'
];
for (const term of requiredGuideTerms) {
  if (!guide.includes(term)) fail(`guide missing required term: ${term}`);
}
if (evidence.runx_version !== 'runx-cli 0.6.8') fail('evidence runx_version is not runx-cli 0.6.8');
if (!Array.isArray(evidence.observations) || evidence.observations.length < 6) fail('evidence has fewer than 6 observations');
for (const name of ['public_url', 'evidence_json', 'receipt_ref', 'report']) {
  if (!evidence.required_artifacts?.includes(name)) fail(`evidence missing required artifact ${name}`);
}
const categories = new Set(evidence.observations.map((o) => o.category));
for (const category of ['runx_version', 'required_artifacts', 'claim_api', 'delivery_api', 'review_boundary']) {
  if (!categories.has(category)) fail(`evidence missing observation category: ${category}`);
}
process.stdout.write(JSON.stringify({
  ok: true,
  guide: path.relative(repoRoot, guidePath),
  evidence: path.relative(repoRoot, evidencePath),
  runx_version: evidence.runx_version,
  observations: evidence.observations.length,
  required_artifacts: evidence.required_artifacts
}, null, 2) + '\n');
