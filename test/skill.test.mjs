import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import { verifySkillPostingCopy } from "../src/skill.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const passMd = readFileSync(
  join(root, "fixtures/skill-posting/pass/SKILL.md"),
  "utf8",
);
const failMd = readFileSync(
  join(root, "fixtures/skill-posting/fail/SKILL.md"),
  "utf8",
);
const checkedUrl =
  "https://raw.githubusercontent.com/auscaster/frantic-board/main/fixtures/skill-posting/pass/SKILL.md";

test("pass fixture names post_bounty, get_posting, fund_bounty", () => {
  const { ok, findings } = verifySkillPostingCopy(passMd, checkedUrl);
  assert.equal(ok, true);
  assert.equal(findings.required_tools.post_bounty, true);
  assert.equal(findings.required_tools.get_posting, true);
  assert.equal(findings.required_tools.fund_bounty, true);
});

test("pass fixture confirms house screening before funding", () => {
  const { findings } = verifySkillPostingCopy(passMd, checkedUrl);
  assert.equal(findings.screening_before_funding, true);
});

test("report includes checked URL and line references", () => {
  const { report, findings } = verifySkillPostingCopy(passMd, checkedUrl);
  assert.match(report, /Checked URL: https:\/\//);
  assert.ok(findings.checked_lines.length >= 3);
  assert.ok(findings.checked_headings.some((h) => /screening/i.test(h.heading)));
});

test("fail fixture is rejected", () => {
  const { ok, findings } = verifySkillPostingCopy(failMd, checkedUrl);
  assert.equal(ok, false);
  assert.equal(findings.required_tools.post_bounty, true);
  assert.equal(findings.screening_before_funding, false);
});

test("missing URL fails verification", () => {
  const { ok } = verifySkillPostingCopy(passMd, "");
  assert.equal(ok, false);
});
