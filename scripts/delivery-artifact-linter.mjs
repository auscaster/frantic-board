#!/usr/bin/env node
/**
 * Usage:
 *   node scripts/delivery-artifact-linter.mjs --bounty-url <url> name=value ...
 *   node scripts/delivery-artifact-linter.mjs --bounty-file <html-or-json> name=value ...
 *
 * Emits stable JSON:
 *   { "ok": true|false, "bounty": {...}, "provided": {...}, "errors": [], "warnings": [] }
 */
import fs from "node:fs/promises";

const DEFAULT_TIMEOUT_MS = 10_000;
const RECEIPT_RE =
  /^(frantic|runx):[A-Za-z0-9:_./@+-]+$|^https:\/\/(?:gofrantic\.com|github\.com|runx\.ai)\/\S+$/;

function usage() {
  return [
    "Usage:",
    "  node scripts/delivery-artifact-linter.mjs --bounty-url <url> name=value ...",
    "  node scripts/delivery-artifact-linter.mjs --bounty-file <html-or-json> name=value ...",
    "",
    "Options:",
    "  --offline       Do not check remote artifact URLs.",
    "  --json          Reserved; JSON is always emitted.",
  ].join("\n");
}

function parseArgs(argv) {
  const parsed = { refs: {}, offline: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
    } else if (arg === "--offline") {
      parsed.offline = true;
    } else if (arg === "--json") {
      continue;
    } else if (arg === "--bounty-url") {
      parsed.bountyUrl = argv[++i];
    } else if (arg === "--bounty-file") {
      parsed.bountyFile = argv[++i];
    } else if (arg.includes("=")) {
      const idx = arg.indexOf("=");
      const key = arg.slice(0, idx).trim();
      const value = arg.slice(idx + 1).trim();
      if (key) parsed.refs[key] = value;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  if (!parsed.help && Boolean(parsed.bountyUrl) === Boolean(parsed.bountyFile)) {
    throw new Error("provide exactly one of --bounty-url or --bounty-file");
  }
  return parsed;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "frantic-delivery-artifact-linter/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function decodeEntities(text) {
  return text
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function parseBounty(source, fallbackUrl = "") {
  const trimmed = source.trim();
  if (trimmed.startsWith("{")) {
    const data = JSON.parse(trimmed);
    return normalizeBounty({
      title: data.title,
      url: data.url || data.bounty_url || fallbackUrl,
      description: data.description || "",
      requiredArtifacts: data.required_artifacts || data.requiredArtifacts || [],
    });
  }

  const jsonLd = [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => {
      try {
        return JSON.parse(decodeEntities(match[1]));
      } catch {
        return null;
      }
    })
    .find((item) => item && item["@type"] === "JobPosting");

  const title = jsonLd?.title || source.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1] || "";
  const description = jsonLd?.description || "";
  const requiredArtifacts = [
    ...source.matchAll(/<span class="mono"[^>]*>([a-zA-Z0-9_-]+)=&lt;value&gt;<\/span>/g),
  ].map((match) => match[1]);

  return normalizeBounty({
    title: decodeEntities(title.replace(/<[^>]+>/g, "")).trim(),
    url: jsonLd?.url || fallbackUrl,
    description,
    requiredArtifacts,
  });
}

function normalizeBounty(bounty) {
  const fromDescription = [
    ...String(bounty.description || "").matchAll(/(?:^|\s)([a-zA-Z0-9_-]+)=<value>/g),
  ].map((match) => match[1]);
  const requiredArtifacts = [...new Set([...(bounty.requiredArtifacts || []), ...fromDescription])];
  return {
    title: bounty.title || "",
    url: bounty.url || "",
    requiredArtifacts,
  };
}

function validateEvidenceJson(value) {
  const parsed = JSON.parse(value);
  const observations = parsed.observations;
  if (!Array.isArray(observations)) {
    throw new Error("evidence_json.observations must be an array");
  }
  if (observations.length === 0) {
    throw new Error("evidence_json.observations must not be empty");
  }
  const versionText = JSON.stringify(observations);
  if (!/runx-cli 0\.(?:[6-9]|[1-9]\d+)\.\d+|runx --version/i.test(versionText)) {
    throw new Error("evidence_json.observations must include runx --version output");
  }
  return parsed;
}

async function readEvidence(value, offline) {
  if (value.trim().startsWith("{")) return value;
  if (/^https?:\/\//.test(value)) {
    if (offline) {
      throw new Error("evidence_json URL cannot be validated while --offline is set");
    }
    return await fetchText(value);
  }
  return await fs.readFile(value, "utf8");
}

function looksLikeRequiredPackageMismatch(bounty, refs) {
  const requiredPackage = bounty.title.match(/\b([a-z0-9][a-z0-9._-]{2,})\b package/i)?.[1];
  if (!requiredPackage || !refs.package) return null;
  return refs.package === requiredPackage
    ? null
    : `package mismatch: expected ${requiredPackage}, got ${refs.package}`;
}

async function checkUrlReachable(key, value, offline) {
  if (!/^https?:\/\//.test(value)) return null;
  if (offline) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    const res = await fetch(value, {
      method: "HEAD",
      signal: controller.signal,
      headers: { "user-agent": "frantic-delivery-artifact-linter/1.0" },
    }).catch(async () => {
      return fetch(value, {
        signal: controller.signal,
        headers: { "user-agent": "frantic-delivery-artifact-linter/1.0" },
      });
    });
    clearTimeout(timer);
    if (!res.ok) return `${key} URL is not reachable: HTTP ${res.status}`;
    return null;
  } catch (error) {
    return `${key} URL is not reachable: ${error.message}`;
  }
}

async function lint(parsed) {
  const source = parsed.bountyUrl
    ? await fetchText(parsed.bountyUrl)
    : await fs.readFile(parsed.bountyFile, "utf8");
  const bounty = parseBounty(source, parsed.bountyUrl);
  const errors = [];
  const warnings = [];

  if (bounty.requiredArtifacts.length === 0) {
    warnings.push("no required artifact names discovered from bounty source");
  }

  for (const name of bounty.requiredArtifacts) {
    if (!Object.hasOwn(parsed.refs, name) || parsed.refs[name] === "") {
      errors.push(`missing required artifact: ${name}`);
    }
  }

  for (const key of Object.keys(parsed.refs).sort()) {
    if (!/^[a-z][a-z0-9_-]*$/.test(key)) {
      errors.push(`artifact key has unstable shape: ${key}`);
    }
  }

  if (Object.hasOwn(parsed.refs, "evidence_json")) {
    try {
      const evidenceText = await readEvidence(parsed.refs.evidence_json, parsed.offline);
      validateEvidenceJson(evidenceText);
    } catch (error) {
      errors.push(`bad evidence_json: ${error.message}`);
    }
  }

  if (Object.hasOwn(parsed.refs, "receipt_ref") && !RECEIPT_RE.test(parsed.refs.receipt_ref)) {
    errors.push("malformed receipt_ref");
  }

  const packageMismatch = looksLikeRequiredPackageMismatch(bounty, parsed.refs);
  if (packageMismatch) errors.push(packageMismatch);

  const urlErrors = await Promise.all(
    Object.entries(parsed.refs).map(([key, value]) => checkUrlReachable(key, value, parsed.offline)),
  );
  errors.push(...urlErrors.filter(Boolean));

  return {
    ok: errors.length === 0,
    bounty: {
      title: bounty.title,
      url: bounty.url,
      required_artifacts: bounty.requiredArtifacts,
    },
    provided: Object.fromEntries(Object.keys(parsed.refs).sort().map((key) => [key, parsed.refs[key]])),
    errors,
    warnings,
  };
}

async function main() {
  try {
    const parsed = parseArgs(process.argv.slice(2));
    if (parsed.help) {
      console.log(usage());
      return;
    }
    const result = await lint(parsed);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ok ? 0 : 1;
  } catch (error) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          errors: [error.message],
          usage: usage(),
        },
        null,
        2,
      ),
    );
    process.exitCode = 2;
  }
}

main();
