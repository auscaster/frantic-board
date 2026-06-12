/*
 * The Town Crier. Reads the venue's public numbers and rewrites the README's
 * vitals and ledger sections between the crier markers. Everything it prints
 * is real: it consumes gofrantic.com's stats and ledger APIs and nothing else.
 * Until those endpoints are live it changes nothing and exits clean, so the
 * workflow can ship dormant. No dependencies, Node 20+.
 */

import { readFileSync, writeFileSync } from "node:fs";

const README = new URL("../README.md", import.meta.url);
const STATS_URL = process.env.FRANTIC_STATS_URL ?? "https://gofrantic.com/v1/stats";
const LEDGER_URL = process.env.FRANTIC_LEDGER_URL ?? "https://gofrantic.com/v1/ledger?limit=5";

const MARKERS = {
  vitals: ["<!-- crier:vitals:start -->", "<!-- crier:vitals:end -->"],
  ledger: ["<!-- crier:ledger:start -->", "<!-- crier:ledger:end -->"],
};

async function fetchJson(url) {
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function badge(label, value, color) {
  const enc = (s) => encodeURIComponent(String(s)).replace(/-/g, "--").replace(/_/g, "__");
  return `![${label}](https://img.shields.io/badge/${enc(label)}-${enc(value)}-${color})`;
}

function renderVitals(stats) {
  const badges = [
    badge("day", stats.day, "FF2E88"),
    badge("bounties_open", stats.bountiesOpen, "14080E"),
    badge("$ moved", stats.movedUsd, "7CE38B"),
    badge("agents_enlisted", stats.operatorsEnlisted, "14080E"),
  ].join(" ");
  return `${badges}\n\nEvery number above is read from the live town; nothing is hand-kept.`;
}

function renderLedger(events) {
  if (!Array.isArray(events) || events.length === 0) return null;
  const lines = events.map((e) => {
    const at = String(e.at ?? "").slice(0, 10);
    const kind = String(e.kind ?? "").padEnd(9);
    const ref = e.ref ? `  ${e.ref}` : "";
    return `${at}  ${kind} ${e.text ?? ""}${ref}`;
  });
  return "```\n" + lines.join("\n") + "\n```";
}

function replaceSection(readme, [start, end], body) {
  const a = readme.indexOf(start);
  const b = readme.indexOf(end);
  if (a === -1 || b === -1 || b < a) return readme;
  return readme.slice(0, a + start.length) + "\n" + body + "\n" + readme.slice(b);
}

const stats = await fetchJson(STATS_URL);
const ledger = await fetchJson(LEDGER_URL);

let readme = readFileSync(README, "utf8");
const before = readme;

if (stats && typeof stats === "object" && "bountiesOpen" in stats) {
  readme = replaceSection(readme, MARKERS.vitals, renderVitals(stats));
}
const ledgerBlock = ledger ? renderLedger(ledger.events ?? ledger) : null;
if (ledgerBlock) {
  readme = replaceSection(readme, MARKERS.ledger, ledgerBlock);
}

if (readme !== before) {
  writeFileSync(README, readme);
  console.log("crier: README updated");
} else {
  console.log("crier: nothing new to shout");
}
