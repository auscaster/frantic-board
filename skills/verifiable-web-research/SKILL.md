---
name: verifiable-web-research
description: Perform governed web research with receipt-sealed HTTP fetches and verifiable output.
runx:
  category: research
  tools:
    - name: frantic.http_fetch
      schema: runx.tool.manifest.v1
      source:
        type: http
        url: "{url}"
        method: GET
---

# Verifiable Web Research

Fetch and verify web content through a governed HTTP tool that produces sealed receipts.
This skill retrieves publicly accessible web pages, extracts structured content, and
attaches a cryptographic receipt proving the fetch was executed under policy bounds.
No authority is granted for downstream mutations; any action based on this research
requires its own receipt and authority gate.

## What this skill does

`verifiable-web-research` performs a governed HTTP fetch of a public URL, extracts
the page content (markdown or structured text), and returns a typed research packet
with a sealed receipt proving execution under the skill's policy scopes.

The skill uses the governed HTTP tool `frantic.http_fetch` defined by the
`runx.tool.manifest.v1` schema. The tool's `source` declares `type: http` and
bounds the fetch to the skill's declared scopes.

## When to use this skill

- An agent needs to fetch and verify the content of a public web page.
- A workflow requires a provable record that research was performed at a specific time.
- Content validation against a known source is needed with a receipt as proof.

## When not to use this skill

- For fetching content behind authentication or paywalls.
- To perform actions like posting or submitting without a downstream action gate.
- When the target URL is a private or internal service.

## Procedure

1. Identify the target `url` (must be a public HTTP(S) URL).
2. Fetch the page content via the governed HTTP tool.
3. Validate the response (status code, content presence).
4. Normalize the data into a typed research packet.
5. Seal the receipt and return the consolidated research output.

## Edge cases and stop conditions

- **Invalid URL:** The skill should return `failure` with a clear error message.
- **Non-200 Status:** If the fetch returns a non-successful status, the skill should report
  a `failure` and not proceed.
- **Rate Limiting:** If the API returns 429, the skill should report a retryable failure
  and implement exponential backoff with a maximum retry count.
- **Timeout:** If the HTTP fetch is unreachable or exceeds the timeout, report a timeout
  and mark the artifact as `needs_retry`.
- **Scope Enforcement:** All fetches are bounded by the skill's declared scopes.
  Requests outside the allowed scope are rejected before execution.
- **Receipt Sealing:** Every successful fetch produces a sealed receipt. If receipt
  sealing fails, the operation is treated as a partial failure and the raw artifact
  is returned without a receipt guarantee.
- **Authority Gates:** This skill is read-only. Any mutation based on the fetched
  content requires a separate authority gate and its own receipt.
