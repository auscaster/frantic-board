#!/usr/bin/env node
/* Usage: node scripts/test-delivery-artifact-linter.mjs */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const linter = fileURLToPath(new URL("./delivery-artifact-linter.mjs", import.meta.url));
const fixtureRoot = new URL("../fixtures/delivery-artifact-linter/", import.meta.url);

const files = {
  "/public.html": { type: "text/html", body: await readFile(new URL("public.html", fixtureRoot)) },
  "/evidence-valid.json": { type: "application/json", body: await readFile(new URL("evidence-valid.json", fixtureRoot)) },
  "/evidence-invalid.json": { type: "application/json", body: await readFile(new URL("evidence-invalid.json", fixtureRoot)) },
  "/report.md": { type: "text/markdown", body: await readFile(new URL("report.md", fixtureRoot)) },
};

const server = createServer((request, response) => {
  const file = files[request.url];
  if (!file) {
    response.writeHead(404, { "content-type": "application/json" });
    response.end('{"error":"not found"}');
    return;
  }
  response.writeHead(200, { "content-type": file.type });
  response.end(file.body);
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;

async function run(args) {
  const child = spawn(process.execPath, [linter, ...args], { cwd: root });
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  const status = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", resolve);
  });
  assert.doesNotThrow(() => JSON.parse(stdout), stdout || stderr);
  return { status, output: JSON.parse(stdout) };
}

try {
  const valid = await run([
    "--bounty-url", "https://gofrantic.com/bounties/p-d39bbc04d4",
    "--bounty-json", "fixtures/delivery-artifact-linter/bounty-41.json",
    `public_url=${base}/public.html`,
    `pr_url=${base}/public.html`,
    `evidence_json=${base}/evidence-valid.json`,
    "receipt_ref=runx:receipt:fixture-valid-001",
    `report=${base}/report.md`,
  ]);
  assert.equal(valid.status, 0);
  assert.equal(valid.output.ok, true);
  assert.deepEqual(valid.output.bounty.required_artifacts, ["evidence_json", "pr_url", "public_url", "receipt_ref", "report"]);

  const invalid = await run([
    "--bounty-url", "https://gofrantic.com/bounties/p-d239b77dd1",
    "--bounty-json", "fixtures/delivery-artifact-linter/bounty-29.json",
    `public_url=${base}/dead`,
    `evidence_json=${base}/evidence-invalid.json`,
    "receipt_ref=not-a-receipt",
    `report=${base}/report.md`,
  ]);
  assert.equal(invalid.status, 1);
  assert.equal(invalid.output.ok, false);
  const codes = new Set(invalid.output.errors.map(({ code }) => code));
  for (const code of [
    "REQUIRED_ARTIFACT_MISSING",
    "ARTIFACT_URL_UNREACHABLE",
    "EVIDENCE_JSON_INVALID",
    "RECEIPT_REF_INVALID",
    "PACKAGE_NAME_MISMATCH",
  ]) {
    assert(codes.has(code), `invalid fixture did not catch ${code}`);
  }

  console.log(JSON.stringify({
    ok: true,
    valid_case: { exit_code: valid.status, errors: valid.output.errors.length },
    invalid_case: { exit_code: invalid.status, error_codes: [...codes].sort() },
  }, null, 2));
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
