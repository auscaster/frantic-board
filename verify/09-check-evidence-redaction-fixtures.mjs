#!/usr/bin/env node
// Usage: node verify/09-check-evidence-redaction-fixtures.mjs
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "fixtures/evidence-redaction");
const unsafePatterns = [
  { id: "synthetic_secret", re: /SYNTHETIC_SECRET_DO_NOT_USE_[A-Za-z0-9_]+/ },
  { id: "windows_local_path", re: /C:\\Users\\[^\\]+\\/ },
  { id: "posix_local_path", re: /\/home\/[^/]+\// },
  { id: "private_url", re: /https:\/\/internal\.example\.invalid\/\S+/ },
  { id: "private_email", re: /\b[A-Za-z0-9._%+-]+@example\.invalid\b/ },
];

const safeFiles = [
  "safe-redacted-secret.json",
  "safe-redacted-local-path.json",
  "safe-redacted-private-url.json",
];
const unsafeFiles = [
  "unsafe-synthetic-secret.json",
  "unsafe-local-path.json",
  "unsafe-private-url-email.md",
];

const errors = [];
const observations = [];

for (const file of safeFiles) {
  const parsed = JSON.parse(await readFile(path.join(root, file), "utf8"));
  if (typeof parsed.summary !== "string" || parsed.summary.length < 40) {
    errors.push(`${file}: missing useful summary`);
  }
  if (!Array.isArray(parsed.observations) || parsed.observations.length === 0) {
    errors.push(`${file}: missing observations`);
  }
  observations.push({ file, kind: "safe_json", status: "validated" });
}

for (const file of unsafeFiles) {
  const text = await readFile(path.join(root, file), "utf8");
  const matches = unsafePatterns.filter((pattern) => pattern.re.test(text)).map((pattern) => pattern.id);
  if (matches.length === 0) {
    errors.push(`${file}: expected at least one unsafe synthetic category`);
  }
  observations.push({ file, kind: "unsafe_synthetic", categories: matches });
}

const files = await readdir(root);
if (files.filter((file) => safeFiles.includes(file) || unsafeFiles.includes(file)).length < 6) {
  errors.push("fixture pack must contain at least six named fixtures");
}

const result = {
  schema: "frantic.evidence_redaction_fixture_validation.v1",
  ok: errors.length === 0,
  fixture_root: "verify/fixtures/evidence-redaction",
  observations,
  errors,
};

console.log(JSON.stringify(result, null, 2));
process.exitCode = result.ok ? 0 : 1;
