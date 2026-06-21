import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { lintDelivery } from "../../scripts/delivery-artifact-linter.mjs";

const mode = process.env.RUNX_INPUT_MODE ?? "";
if (mode !== "full") {
  process.stderr.write("mode must be full\n");
  process.exit(64);
}

const fixtureRoot = new URL("../../fixtures/delivery-artifact-linter/", import.meta.url);
const fixtureBodies = new Map([
  ["/public.html", { type: "text/html", body: await readFile(new URL("public.html", fixtureRoot)) }],
  ["/evidence-valid.json", { type: "application/json", body: await readFile(new URL("evidence-valid.json", fixtureRoot)) }],
  ["/evidence-invalid.json", { type: "application/json", body: await readFile(new URL("evidence-invalid.json", fixtureRoot)) }],
  ["/report.md", { type: "text/markdown", body: await readFile(new URL("report.md", fixtureRoot)) }],
]);

async function fixtureFetch(input) {
  const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const url = new URL(rawUrl);
  const fixture = fixtureBodies.get(url.pathname);
  if (!fixture) return new Response('{"error":"not found"}', { status: 404, headers: { "content-type": "application/json" } });
  return new Response(fixture.body, { status: 200, headers: { "content-type": fixture.type } });
}

const valid = await lintDelivery({
  bountyUrl: "https://gofrantic.com/bounties/p-d39bbc04d4",
  bountyJson: fileURLToPath(new URL("bounty-41.json", fixtureRoot)),
  timeoutMs: 1_000,
  artifactRefs: [
    "public_url=https://fixture.local/public.html",
    "pr_url=https://fixture.local/public.html",
    "evidence_json=https://fixture.local/evidence-valid.json",
    "receipt_ref=runx:receipt:fixture-valid-001",
    "report=https://fixture.local/report.md",
  ],
}, { fetchImpl: fixtureFetch });

const invalid = await lintDelivery({
  bountyUrl: "https://gofrantic.com/bounties/p-d239b77dd1",
  bountyJson: fileURLToPath(new URL("bounty-29.json", fixtureRoot)),
  timeoutMs: 1_000,
  artifactRefs: [
    "public_url=https://fixture.local/dead",
    "evidence_json=https://fixture.local/evidence-invalid.json",
    "receipt_ref=not-a-receipt",
    "report=https://fixture.local/report.md",
  ],
}, { fetchImpl: fixtureFetch });

const errorCodes = [...new Set(invalid.errors.map(({ code }) => code))].sort();
const expectedCodes = [
  "ARTIFACT_URL_UNREACHABLE",
  "EVIDENCE_JSON_INVALID",
  "PACKAGE_NAME_MISMATCH",
  "RECEIPT_REF_INVALID",
  "REQUIRED_ARTIFACT_MISSING",
];

if (!valid.ok || invalid.ok || expectedCodes.some((code) => !errorCodes.includes(code))) {
  process.stderr.write(`${JSON.stringify({ valid, invalid }, null, 2)}\n`);
  process.stderr.write("fixture output did not prove both pass and fail behavior\n");
  process.exit(1);
}

process.stdout.write(`${JSON.stringify({
  ok: true,
  valid_case: { errors: valid.errors.length },
  invalid_case: { error_codes: errorCodes },
})}\n`);
