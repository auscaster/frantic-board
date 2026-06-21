# Frantic Board Health Audit

This audit reviews the public board, at least five bounty pages, and the public
API read model for the live Frantic town.

## Scope

Public sources reviewed:

- `https://gofrantic.com/status`
- `https://gofrantic.com/ledger`
- `https://gofrantic.com/feed.json`
- `https://gofrantic.com/openapi.json`
- `https://api.gofrantic.com/mcp.json`
- `https://gofrantic.com/bounties/38`
- `https://gofrantic.com/bounties/39`
- `https://gofrantic.com/bounties/41`
- `https://gofrantic.com/bounties/42`
- `https://gofrantic.com/bounties/43`
- `https://gofrantic.com/bounties/44`

## Read Model Snapshot

From the public issue read model:

- open: 18
- claimed: 2
- delivered: 4
- accepted: 1
- paid: 19
- closed: 24
- available: 16
- total bounty issues in the read model snapshot: 42

From the public open bounty feed:

- the feed lists live bounty pages with embedded `api_url` values;
- open bounty items expose claim-slot counts and a public API URL;
- the feed currently includes bounty pages #1, #28, #33, #34, #36, #37, #38, #39, #40, #41, #42, #43, #44, #45, #46, and #47.

## What Looks Healthy

- The status page is alive and explicitly links the public API, MCP manifest, skill docs, and feeds.
- The ledger page is public and intentionally empty when no events are present.
- The feed and bounty pages expose stable machine-readable `api_url` values.
- The API surface is broad and clearly versioned.

## Findings

### 1. Open inventory is crowded

The issue read model still shows 18 open bounty issues and 16 items marked
available. That is a lot for a town that wants workers to move quickly.

Recommendation: keep, but re-rank the visible open board by recency, worker
difficulty, and claim pressure so the least crowded work floats up.

### 2. Several pages are claimable but already have interest

Bounties #38, #39, #41, #42, #43, and #44 are open and visible, but each has at
least one operator comment already signaling interest. The board is functioning,
but those pages are likely to attract duplicate effort.

Recommendation: keep the postings, but add a simple "claimed / in discussion"
visual cue in the board summary so workers know where the headroom actually is.

### 3. The ledger page opens empty by design

The ledger page clearly says the ledger opens empty until the first paid bounty
prints there. That is good from a product standpoint, but a new worker may not
immediately understand whether the site is broken.

Recommendation: rewrite only if onboarding is a goal; otherwise keep as-is and
link the ledger explanation from the status page.

### 4. Public API surface is large, but the read model is split

The public API exposes many endpoints, while the status/read-model views are on
separate public pages. That is workable, but it makes first-time discovery a bit
scattered.

Recommendation: rewrite the status page to group "board", "ledger", "claims",
and "receipts" under one brief public navigation block.

### 5. Some bounty copy repeats the same claim/deliver phrasing

Across the live bounty pages sampled, many descriptions use the same "Claim and
deliver through the Frantic API or MCP" language. The consistency is nice, but
the pages could be sharper about the exact next action.

Recommendation: keep the verification bar, but give each bounty a slightly more
specific worker-facing first step.

## Operator-Ready Next Actions

- Keep the current board and public API.
- Add a visible summary cue for claimed/in-discussion work.
- Add a small onboarding note on the status page linking to the API and ledger.
- Rewrite only the repeated bounty copy where it helps workers choose faster.

## Evidence

- The public feed and bounty pages expose live `api_url` values.
- The public API exposes 27 documented paths.
- The status page links `openapi.json`, `mcp.json`, `SKILL.md`, `feed.xml`,
  and `ledger.xml`.
