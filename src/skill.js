/**
 * Verify vendor-door SKILL.md operator copy for Frantic bounty postings.
 * Checks required tool names and that house screening precedes funding.
 */

const REQUIRED_TOOLS = ["post_bounty", "get_posting", "fund_bounty"];

const SCREENING_RE = /house\s+screening|screening/i;
const FUNDING_RE = /\bfund(?:_bounty|ing)\b/i;

/**
 * @param {string} markdown - SKILL.md body
 * @param {string} [checkedUrl] - URL where the SKILL.md was fetched
 */
export function verifySkillPostingCopy(markdown, checkedUrl = "") {
  const lines = markdown.split(/\r?\n/);
  const findings = {
    checked_url: checkedUrl,
    required_tools: {},
    screening_before_funding: false,
    checked_headings: [],
    checked_lines: [],
  };

  for (const tool of REQUIRED_TOOLS) {
    const idx = lines.findIndex((line) => line.includes(tool));
    findings.required_tools[tool] = idx >= 0;
    if (idx >= 0) {
      findings.checked_lines.push({ line: idx + 1, text: lines[idx].trim() });
    }
  }

  const screeningIdx = lines.findIndex((line) => SCREENING_RE.test(line));
  const fundingIdx = lines.findIndex((line) => FUNDING_RE.test(line));
  findings.screening_before_funding =
    screeningIdx >= 0 && fundingIdx >= 0 && screeningIdx < fundingIdx;

  if (screeningIdx >= 0) {
    findings.checked_headings.push({
      line: screeningIdx + 1,
      heading: lines[screeningIdx].trim(),
    });
  }
  if (fundingIdx >= 0) {
    findings.checked_headings.push({
      line: fundingIdx + 1,
      heading: lines[fundingIdx].trim(),
    });
  }

  const missing = REQUIRED_TOOLS.filter((t) => !findings.required_tools[t]);
  const ok =
    missing.length === 0 &&
    findings.screening_before_funding &&
    Boolean(checkedUrl);

  return {
    ok,
    report: formatReport(findings, missing),
    findings,
  };
}

function formatReport(findings, missing) {
  const parts = [
    "# SKILL posting copy verification",
    "",
    `Checked URL: ${findings.checked_url || "(missing)"}`,
    "",
    "## Required tools",
    ...REQUIRED_TOOLS.map(
      (t) =>
        `- ${t}: ${findings.required_tools[t] ? "present" : "MISSING"}`,
    ),
    "",
    "## House screening before funding",
    `- screening precedes funding: ${findings.screening_before_funding ? "yes" : "no"}`,
    "",
    "## Checked headings / lines",
    ...findings.checked_headings.map(
      (h) => `- line ${h.line}: ${h.heading}`,
    ),
    ...findings.checked_lines.map((l) => `- line ${l.line}: ${l.text}`),
  ];

  if (missing.length) {
    parts.push("", `Missing tools: ${missing.join(", ")}`);
  }

  return parts.join("\n");
}
