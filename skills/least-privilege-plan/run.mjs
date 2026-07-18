const historyRaw = process.env.RUNX_INPUT_RUN_HISTORY || "[]";
const policyRaw = process.env.RUNX_INPUT_DECLARED_POLICY || "{}";

let history = [];
let policy = {};

try {
  history = JSON.parse(historyRaw);
  policy = JSON.parse(policyRaw);
} catch (e) {
  process.stderr.write("Invalid JSON in input\n");
  process.exit(64);
}

const keep = [];
const reduce = [];
const revoke = [];
const needs_human_review = [];

const usedScopes = new Set(history.map(h => h.scope).filter(Boolean));
const allScopes = Object.keys(policy.scopes || {});

for (const scope of allScopes) {
  if (usedScopes.has(scope)) {
    if (policy.scopes[scope] === "over_broad") {
      reduce.push({ scope, reason: "Used but appears overly broad based on policy" });
    } else {
      keep.push({ scope, reason: "Actively used in recent run history" });
    }
  } else {
    revoke.push({ scope, reason: "Unused in recorded run history" });
  }
}

if (history.some(h => h.requires_review)) {
  needs_human_review.push({ reason: "Sensitive actions detected in history" });
}

process.stdout.write(JSON.stringify({ keep, reduce, revoke, needs_human_review }) + '\n');
