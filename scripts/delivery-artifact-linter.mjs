#!/usr/bin/env node
// Usage: node scripts/delivery-artifact-linter.mjs --bounty <url|file> [--artifact name=value ...] [--artifacts-file file] [--no-network]

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const usage = `Usage:
  node scripts/delivery-artifact-linter.mjs --bounty <url|file> --artifact name=value [--artifact name=value ...]
  node scripts/delivery-artifact-linter.mjs --bounty <url|file> --artifacts-file <json> [--no-network]

The linter prints stable JSON and exits 0 on pass, 1 on failed checks, 2 on usage/runtime errors.`;

const RECEIPT_REF_RE =
  /^(runx:receipt:sha256:[a-f0-9]{64}|runx:receipt:[A-Za-z0-9:_-]+|frantic:receipt:[A-Za-z0-9:_-]+|https:\/\/(?:gofrantic\.com|api\.gofrantic\.com|runx\.ai)\/\S*(?:receipt|receipts)\S*)$/;

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage);
    return 0;
  }
  if (!options.bounty) {
    throw usageError("missing --bounty");
  }

  const artifactMap = new Map();
  for (const artifact of options.artifacts) {
    const parsed = parseArtifactRef(artifact);
    artifactMap.set(parsed.name, parsed.value);
  }
  if (options.artifactsFile) {
    for (const [name, value] of Object.entries(await loadArtifactFile(options.artifactsFile))) {
      artifactMap.set(name, String(value));
    }
  }

  const bountyEnvelope = await loadJsonReference(options.bounty, { checkNetwork: !options.noNetwork });
  const bounty = bountyEnvelope.bounty ?? bountyEnvelope;
  const requiredArtifacts = requiredArtifactNames(bounty);
  const expectedPackage = bounty.criteria?.verification?.expected_package_name ?? null;

  const checks = [];
  const errors = [];
  const warnings = [];

  for (const name of requiredArtifacts) {
    if (!artifactMap.has(name)) {
      errors.push(error("missing_artifact", `${name} is required by the bounty but was not provided`, { name }));
    }
  }

  const providedArtifacts = Object.fromEntries([...artifactMap.entries()].sort(([a], [b]) => a.localeCompare(b)));

  for (const [name, value] of artifactMap) {
    if (isUrlArtifactName(name)) {
      const result = await checkReferenceLive(name, value, { checkNetwork: !options.noNetwork });
      checks.push(result);
      if (!result.ok) errors.push(resultToError(result));
    }
  }

  if (artifactMap.has("evidence_json")) {
    const evidenceCheck = await checkEvidenceJson(artifactMap.get("evidence_json"), {
      checkNetwork: !options.noNetwork,
    });
    checks.push(evidenceCheck);
    for (const detail of evidenceCheck.details.filter((item) => !item.ok)) {
      errors.push(error(detail.id, detail.message, { artifact: "evidence_json" }));
    }
  }

  if (artifactMap.has("receipt_ref")) {
    const value = artifactMap.get("receipt_ref");
    const ok = RECEIPT_REF_RE.test(value);
    checks.push({ id: "receipt_ref_shape", ok, artifact: "receipt_ref", value });
    if (!ok) {
      errors.push(
        error("malformed_receipt_ref", "receipt_ref must be a runx/frantic receipt ref or public receipt URL", {
          value,
        }),
      );
    }
  }

  if (artifactMap.has("report")) {
    const reportCheck = await checkReportDepth(artifactMap.get("report"), { checkNetwork: !options.noNetwork });
    checks.push(reportCheck);
    if (!reportCheck.ok) {
      errors.push(
        error("report_too_shallow", "report should include at least six Markdown bullet points", {
          bullet_count: reportCheck.bullet_count,
        }),
      );
    }
  }

  if (expectedPackage) {
    const packageCheck = checkPackageBinding(expectedPackage, artifactMap);
    checks.push(packageCheck);
    if (!packageCheck.ok) {
      errors.push(
        error("package_name_mismatch", `artifact refs do not bind expected package ${expectedPackage}`, {
          expected_package: expectedPackage,
          inspected_artifacts: packageCheck.inspected_artifacts,
        }),
      );
    }
  }

  for (const [name] of artifactMap) {
    if (!/^[a-z][a-z0-9_]*$/.test(name)) {
      warnings.push({ id: "artifact_name_unusual", message: `artifact name ${name} is not snake_case` });
    }
  }

  const result = {
    schema: "frantic.delivery_artifact_lint.v1",
    ok: errors.length === 0,
    bounty: {
      number: bounty.number ?? null,
      title: bounty.title ?? null,
      source: options.bounty,
      expected_package: expectedPackage,
    },
    required_artifacts: requiredArtifacts,
    provided_artifacts: providedArtifacts,
    errors,
    warnings,
    checks,
  };

  console.log(JSON.stringify(result, null, 2));
  return result.ok ? 0 : 1;
}

function parseArgs(args) {
  const options = {
    artifacts: [],
    artifactsFile: null,
    bounty: null,
    help: false,
    noNetwork: false,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--bounty") {
      options.bounty = takeValue(args, ++index, arg);
    } else if (arg === "--artifact") {
      options.artifacts.push(takeValue(args, ++index, arg));
    } else if (arg === "--artifacts-file") {
      options.artifactsFile = takeValue(args, ++index, arg);
    } else if (arg === "--no-network") {
      options.noNetwork = true;
    } else {
      throw usageError(`unknown argument ${arg}`);
    }
  }
  return options;
}

function takeValue(args, index, flag) {
  const value = args[index];
  if (!value || value.startsWith("--")) throw usageError(`${flag} requires a value`);
  return value;
}

function parseArtifactRef(raw) {
  const separator = raw.indexOf("=");
  if (separator < 1) throw usageError(`artifact ref must be name=value, got ${raw}`);
  return {
    name: raw.slice(0, separator).trim(),
    value: raw.slice(separator + 1).trim(),
  };
}

async function loadArtifactFile(file) {
  const parsed = JSON.parse(await readTextReference(file, { checkNetwork: false }));
  if (Array.isArray(parsed)) {
    return Object.fromEntries(parsed.map((item) => [item.name, item.value]));
  }
  if (parsed && typeof parsed === "object") return parsed;
  throw new Error("artifacts file must be a JSON object or array of {name,value}");
}

function requiredArtifactNames(bounty) {
  const names = bounty.requiredArtifacts ?? bounty.required_artifacts ?? bounty.criteria?.artifacts ?? [];
  return [...new Set(names)].sort();
}

function isUrlArtifactName(name) {
  return name.endsWith("_url") || name === "public_url" || name === "report" || name === "evidence_json";
}

async function checkReferenceLive(name, value, options) {
  if (isReceiptOnly(name)) {
    return { id: "reference_live", ok: true, artifact: name, skipped: "receipt ref is checked separately" };
  }
  try {
    const resolved = resolveReference(value);
    if (resolved.kind === "file") {
      return { id: "reference_live", ok: existsSync(resolved.path), artifact: name, mode: "file", value };
    }
    if (!["http:", "https:"].includes(resolved.url.protocol)) {
      return { id: "reference_live", ok: false, artifact: name, mode: "url", value, reason: "unsupported protocol" };
    }
    if (!options.checkNetwork) {
      return { id: "reference_live", ok: true, artifact: name, mode: "network", value, skipped: "network disabled" };
    }
    const response = await fetchWithTimeout(resolved.url.href, { method: "GET" });
    return {
      id: "reference_live",
      ok: response.ok,
      artifact: name,
      mode: "network",
      status: response.status,
      value,
    };
  } catch (err) {
    return { id: "reference_live", ok: false, artifact: name, value, reason: err.message };
  }
}

function isReceiptOnly(name) {
  return name === "receipt_ref";
}

async function checkEvidenceJson(reference, options) {
  const details = [];
  try {
    const evidence = JSON.parse(await readTextReference(reference, options));
    details.push({
      id: "evidence_summary",
      ok: typeof evidence.summary === "string" && evidence.summary.length >= 80,
      message: "evidence_json.summary must be at least 80 characters",
    });
    details.push({
      id: "evidence_observations",
      ok: Array.isArray(evidence.observations) && evidence.observations.length >= 6,
      message: "evidence_json.observations must contain at least six items",
    });
  } catch (err) {
    details.push({ id: "bad_evidence_json", ok: false, message: `evidence_json could not be parsed: ${err.message}` });
  }
  return { id: "evidence_json_shape", ok: details.every((item) => item.ok), artifact: "evidence_json", details };
}

async function checkReportDepth(reference, options) {
  const text = await readTextReference(reference, options);
  const bulletCount = text.split(/\r?\n/).filter((line) => /^\s*[-*]\s+\S/.test(line)).length;
  return { id: "report_depth", ok: bulletCount >= 6, artifact: "report", bullet_count: bulletCount };
}

function checkPackageBinding(expectedPackage, artifactMap) {
  const inspectedNames = ["public_url", "source_url", "x_yaml", "skill_md", "pr_url"].filter((name) => artifactMap.has(name));
  const inspectedValues = inspectedNames.map((name) => artifactMap.get(name));
  return {
    id: "package_binding",
    ok: inspectedValues.some((value) => value.includes(expectedPackage)),
    expected_package: expectedPackage,
    inspected_artifacts: inspectedNames,
  };
}

async function loadJsonReference(reference, options) {
  return JSON.parse(await readTextReference(reference, options));
}

async function readTextReference(reference, options) {
  const resolved = resolveReference(reference);
  if (resolved.kind === "file") {
    return readFile(resolved.path, "utf8");
  }
  if (!options.checkNetwork) {
    throw new Error(`network disabled for ${reference}`);
  }
  const response = await fetchWithTimeout(resolved.url.href, { method: "GET" });
  if (!response.ok) throw new Error(`${reference} returned HTTP ${response.status}`);
  return response.text();
}

function resolveReference(reference) {
  if (/^https?:\/\//.test(reference)) {
    return { kind: "url", url: new URL(reference) };
  }
  if (reference.startsWith("file://")) {
    return { kind: "file", path: fileURLToPath(reference) };
  }
  return { kind: "file", path: path.resolve(process.cwd(), reference) };
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(url, { ...init, signal: controller.signal, redirect: "follow" });
  } finally {
    clearTimeout(timeout);
  }
}

function resultToError(result) {
  return error("dead_or_unreadable_url", `${result.artifact} did not resolve as a live public reference`, result);
}

function error(id, message, detail = {}) {
  return { ...detail, id, message };
}

function usageError(message) {
  const err = new Error(`${message}\n\n${usage}`);
  err.usage = true;
  return err;
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((err) => {
    console.error(err.usage ? err.message : `delivery-artifact-linter: ${err.message}`);
    process.exitCode = err.usage ? 2 : 2;
  });
