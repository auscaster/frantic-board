#!/usr/bin/env node
/*
 * Usage:
 *   node scripts/delivery-artifact-linter.mjs --bounty-url <url> \
 *     --artifact public_url=<url> --artifact evidence_json=<url> \
 *     --artifact receipt_ref=<ref> --artifact report=<url>
 *
 * Dependency-free Frantic delivery preflight for Node 20+.
 */

import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const SCHEMA_VERSION = "frantic.delivery-artifact-lint.v1";
const RECEIPT_PATTERN = /^(?:runx|frantic):receipt:[A-Za-z0-9][A-Za-z0-9._:-]{5,}$/;
const URL_ARTIFACT_PATTERN = /(?:^|_)(?:url|json|yaml|md|report)$/;

function usage() {
  return [
    "Usage: node scripts/delivery-artifact-linter.mjs --bounty-url <url> [options] <name=value>...",
    "",
    "Options:",
    "  --artifact <name=value>  Proposed artifact reference (repeatable)",
    "  --bounty-json <path>      Use a captured public bounty API response",
    "  --timeout-ms <number>     Network timeout per URL (default: 8000)",
    "  --help                    Show this help",
  ].join("\n");
}

function parseArgs(argv) {
  const options = { artifactRefs: [], timeoutMs: 8_000 };
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--help" || value === "-h") options.help = true;
    else if (value === "--bounty-url") options.bountyUrl = argv[++index];
    else if (value === "--bounty-json") options.bountyJson = argv[++index];
    else if (value === "--artifact") options.artifactRefs.push(argv[++index]);
    else if (value === "--timeout-ms") options.timeoutMs = Number(argv[++index]);
    else if (value.startsWith("--")) throw new Error(`unknown option: ${value}`);
    else positional.push(value);
  }

  if (!options.bountyUrl && positional[0] && !positional[0].includes("=")) {
    options.bountyUrl = positional.shift();
  }
  options.artifactRefs.push(...positional);

  if (!options.help && !options.bountyUrl) throw new Error("--bounty-url is required");
  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs < 100) {
    throw new Error("--timeout-ms must be a number of at least 100");
  }
  return options;
}

function parseArtifactRefs(refs) {
  const artifacts = {};
  const errors = [];

  for (const ref of refs) {
    if (typeof ref !== "string" || !ref.includes("=")) {
      errors.push({ code: "ARTIFACT_REF_INVALID", message: `artifact ref must be name=value: ${ref ?? ""}` });
      continue;
    }
    const separator = ref.indexOf("=");
    const name = ref.slice(0, separator).trim();
    const value = ref.slice(separator + 1).trim();
    if (!name || !value) {
      errors.push({ code: "ARTIFACT_REF_INVALID", message: `artifact ref must have a non-empty name and value: ${ref}` });
      continue;
    }
    if (Object.hasOwn(artifacts, name)) {
      errors.push({ code: "ARTIFACT_REF_DUPLICATE", message: `artifact ref is duplicated: ${name}` });
      continue;
    }
    artifacts[name] = value;
  }

  return {
    artifacts: Object.fromEntries(Object.entries(artifacts).sort(([a], [b]) => a.localeCompare(b))),
    errors,
  };
}

function normalizeBountyApiUrl(input) {
  const url = new URL(input);
  if (url.hostname === "gofrantic.com" && url.pathname.startsWith("/bounties/")) {
    url.pathname = `/v1${url.pathname}`;
    url.search = "";
    url.hash = "";
  }
  return url.href;
}

async function fetchWithTimeout(url, { fetchImpl, timeoutMs }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, {
      headers: { accept: "application/json, text/plain, */*" },
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function loadBounty(options, fetchImpl) {
  if (options.bountyJson) {
    const text = await readFile(options.bountyJson, "utf8");
    return { document: JSON.parse(text), source: `file:${options.bountyJson}` };
  }

  const apiUrl = normalizeBountyApiUrl(options.bountyUrl);
  const response = await fetchWithTimeout(apiUrl, { fetchImpl, timeoutMs: options.timeoutMs });
  if (!response.ok) throw new Error(`bounty URL returned HTTP ${response.status}: ${apiUrl}`);
  return { document: await response.json(), source: apiUrl };
}

function unwrapBounty(document) {
  return document?.bounty ?? document?.posting ?? document;
}

function requiredArtifactNames(bounty) {
  const direct = bounty?.requiredArtifacts
    ?? bounty?.required_artifacts
    ?? bounty?.criteria?.artifacts
    ?? bounty?.verification?.artifacts;
  if (Array.isArray(direct)) return [...new Set(direct.map(String))].sort();

  const description = String(bounty?.description ?? bounty?.note ?? "");
  const artifactLine = description.match(/Artifacts:\s*([^\n]+)/i)?.[1] ?? "";
  return [...artifactLine.matchAll(/`([A-Za-z][A-Za-z0-9_]*)`/g)]
    .map((match) => match[1])
    .filter((name, index, all) => all.indexOf(name) === index)
    .sort();
}

function expectedPackageName(bounty) {
  const description = String(bounty?.description ?? bounty?.note ?? "");
  const patterns = [
    /exact package name is\s+[`'"]?([A-Za-z0-9][A-Za-z0-9._-]*)/i,
    /package name(?: must be| is)\s+[`'"]?([A-Za-z0-9][A-Za-z0-9._-]*)/i,
  ];
  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) return match[1].replace(/[.,;:]+$/, "");
  }
  return null;
}

function evidenceShapeErrors(evidence) {
  const errors = [];
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
    return ["root must be a JSON object"];
  }
  if (!(typeof evidence.summary === "string" || (evidence.summary && typeof evidence.summary === "object"))) {
    errors.push("summary must be a string or object");
  }
  if (!Array.isArray(evidence.observations)) errors.push("observations must be an array");
  else if (evidence.observations.length === 0) errors.push("observations must not be empty");
  return errors;
}

function collectPackageValues(value, path = [], output = []) {
  if (!value || typeof value !== "object") return output;
  for (const [key, child] of Object.entries(value)) {
    const nextPath = [...path, key];
    if (typeof child === "string" && /^(?:package(?:_?name)?|registry_?ref)$/i.test(key)) {
      output.push({ path: nextPath.join("."), value: child });
    } else if (child && typeof child === "object") {
      collectPackageValues(child, nextPath, output);
    }
  }
  return output;
}

function checkResult(id, ok, message, details = undefined) {
  const result = { id, ok, message };
  if (details !== undefined) result.details = details;
  return result;
}

function artifactLooksLikeUrl(name, value) {
  return URL_ARTIFACT_PATTERN.test(name) || /^https?:\/\//i.test(value);
}

async function inspectArtifactUrl(name, value, options, fetchImpl) {
  let url;
  try {
    url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) throw new Error("unsupported protocol");
  } catch {
    return { check: checkResult("ARTIFACT_URL_INVALID", false, `${name} is not an HTTP(S) URL`, { artifact: name, value }) };
  }

  try {
    const response = await fetchWithTimeout(url, { fetchImpl, timeoutMs: options.timeoutMs });
    if (!response.ok) {
      return { check: checkResult("ARTIFACT_URL_UNREACHABLE", false, `${name} returned HTTP ${response.status}`, { artifact: name, url: value, status: response.status }) };
    }
    const text = name === "evidence_json" ? await response.text() : null;
    if (text === null) await response.body?.cancel();
    return {
      check: checkResult("ARTIFACT_URL_REACHABLE", true, `${name} is reachable`, { artifact: name, url: value, status: response.status }),
      text,
    };
  } catch (error) {
    return { check: checkResult("ARTIFACT_URL_UNREACHABLE", false, `${name} could not be fetched`, { artifact: name, url: value, error: error.message }) };
  }
}

export async function lintDelivery(options, { fetchImpl = globalThis.fetch } = {}) {
  const checks = [];
  const parsed = parseArtifactRefs(options.artifactRefs ?? []);
  const artifacts = parsed.artifacts;
  checks.push(...parsed.errors.map((error) => checkResult(error.code, false, error.message)));

  let loaded;
  let bounty;
  try {
    loaded = await loadBounty(options, fetchImpl);
    bounty = unwrapBounty(loaded.document);
    checks.push(checkResult("BOUNTY_LOADED", true, "bounty criteria loaded", { source: loaded.source }));
  } catch (error) {
    checks.push(checkResult("BOUNTY_LOAD_FAILED", false, error.message));
    return buildOutput({ options, artifacts, bounty: null, required: [], expectedPackage: null, checks });
  }

  const required = requiredArtifactNames(bounty);
  const expectedPackage = expectedPackageName(bounty);
  if (required.length === 0) {
    checks.push(checkResult("REQUIRED_ARTIFACTS_UNKNOWN", false, "bounty does not expose required artifact names"));
  }
  for (const name of required) {
    checks.push(Object.hasOwn(artifacts, name)
      ? checkResult("REQUIRED_ARTIFACT_PRESENT", true, `${name} is present`, { artifact: name })
      : checkResult("REQUIRED_ARTIFACT_MISSING", false, `${name} is required but missing`, { artifact: name }));
  }

  let evidence = null;
  const urlArtifacts = Object.entries(artifacts)
    .filter(([name, value]) => name !== "receipt_ref" && artifactLooksLikeUrl(name, value));
  const inspectedUrls = await Promise.all(urlArtifacts.map(async ([name, value]) => ({
    name,
    inspected: await inspectArtifactUrl(name, value, options, fetchImpl),
  })));
  for (const { name, inspected } of inspectedUrls) {
    checks.push(inspected.check);
    if (name === "evidence_json" && inspected.text !== undefined && inspected.text !== null) {
      try {
        evidence = JSON.parse(inspected.text);
        const shapeErrors = evidenceShapeErrors(evidence);
        checks.push(shapeErrors.length === 0
          ? checkResult("EVIDENCE_JSON_VALID", true, "evidence_json has summary and observations")
          : checkResult("EVIDENCE_JSON_INVALID", false, "evidence_json has an invalid shape", { errors: shapeErrors }));
      } catch (error) {
        checks.push(checkResult("EVIDENCE_JSON_INVALID", false, "evidence_json is not valid JSON", { error: error.message }));
      }
    }
  }

  if (Object.hasOwn(artifacts, "receipt_ref")) {
    checks.push(RECEIPT_PATTERN.test(artifacts.receipt_ref)
      ? checkResult("RECEIPT_REF_VALID", true, "receipt_ref has a recognized sealed-receipt shape")
      : checkResult("RECEIPT_REF_INVALID", false, "receipt_ref must start with runx:receipt: or frantic:receipt: and include an id", { value: artifacts.receipt_ref }));
  }

  if (expectedPackage) {
    const packageValues = evidence ? collectPackageValues(evidence) : [];
    const matchingValues = packageValues.filter(({ value }) => value.includes(expectedPackage));
    checks.push(matchingValues.length > 0
      ? checkResult("PACKAGE_NAME_MATCH", true, `evidence_json names the required package ${expectedPackage}`, { matches: matchingValues })
      : checkResult("PACKAGE_NAME_MISMATCH", false, `evidence_json does not name the required package ${expectedPackage}`, { expected: expectedPackage, found: packageValues }));
  }

  return buildOutput({ options, artifacts, bounty, required, expectedPackage, checks });
}

function buildOutput({ options, artifacts, bounty, required, expectedPackage, checks }) {
  const errors = checks
    .filter((check) => !check.ok)
    .map(({ id, message, details }) => ({ code: id, message, ...(details === undefined ? {} : { details }) }));
  return {
    schema_version: SCHEMA_VERSION,
    ok: errors.length === 0,
    bounty: bounty ? {
      input_url: options.bountyUrl,
      number: bounty.number ?? null,
      title: bounty.title ?? null,
      required_artifacts: required,
      expected_package: expectedPackage,
    } : { input_url: options.bountyUrl },
    artifacts,
    checks,
    errors,
  };
}

export async function main(argv = process.argv.slice(2)) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    console.error(usage());
    console.error(`\nError: ${error.message}`);
    process.exitCode = 2;
    return;
  }
  if (options.help) {
    console.log(usage());
    return;
  }

  const result = await lintDelivery(options);
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
