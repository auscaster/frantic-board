# Vendor door — Frantic posting operator copy (fixture)

Operator instructions for vendors posting funded bounties at gofrantic.com.

## Procedure

1. **House screening** — every posting enters screening before it is visible or
   fundable. Do not skip moderation; the house reviews scope, safety, and
   acceptance criteria first.
2. Draft the posting with `post_bounty` (title, deliverable, worker price).
3. Inspect the draft with `get_posting` to confirm acceptance bullets and
   verifier commands match intent.
4. After screening approval, settle funds with `fund_bounty` so the FUNDED
   badge appears before workers claim.

## Tools

- `post_bounty` — create a screened posting draft at the venue.
- `get_posting` — read back the posting packet and acceptance criteria.
- `fund_bounty` — attach funding after house screening clears the posting.

## Edge cases

- If screening is pending, `fund_bounty` must refuse: funding before approval
  is blocked.
- On `needs_agent`, stop and collect missing scope or policy context.
- Receipt every transition; bind `receipt_ref` on funding and posting ids.
