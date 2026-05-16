# Axis 1 Final Beta Agent Prompts

Use these prompts with separate agents. Do not let the same agent both fix and grade the same run.

## Shared Setup

You are testing Axis 1 in `C:\Development\Owner\hood`.

Product contract:
- Axis 1 is a hood/kitchen exhaust cleaning closeout tool.
- Vendor input produces two outputs: customer link and evidence PDF.
- Customer link must be fast, premium, and honest.
- Evidence PDF must be deeper, retained-record quality, and useful for claim defense.
- The tool must never claim work as completed just because a photo exists.
- Only selected Work items may appear in Photos, Notes, customer link, and PDF.
- Photo proof must be separated from written crew record.
- `Blocked`, `Condition found`, and `Not done` must not inherit completed-work proof language.
- AI photo assist is a draft classifier. The vendor must be able to confirm, change role, move to another selected item, or remove.

Routes:
- Mobile/desktop tool: `http://localhost:3010/axis-1/tool`
- Customer samples:
  - `http://localhost:3010/p/sample-hood-cleaning`
  - `http://localhost:3010/p/sample-clean-closeout`
  - `http://localhost:3010/p/sample-condition-review`
- Sample console: `http://localhost:3010/exports/axis-1-packet?branding=applied&scenario=exception`

For photo-heavy link/PDF tests, use H2 beta packet store:
- Start Spring with `HOOD_AXIS1_TEST_PACKET_STORE_ENABLED=true`.
- Point the frontend at it with `NEXT_PUBLIC_AXIS1_TEST_PACKET_STORE_URL=http://localhost:8080`, or set browser localStorage key `hood.axis1.test-packet-store-url` to `http://localhost:8080` in every browser context used for clean-link testing.
- If Spring is running on another local port, use that port instead.
- Expected generated link shape: `/p/local?packetId=...`, not a huge URL.

Save outputs:
- Put screenshots, generated links, PDFs, console logs, and notes under `output/axis1-final-beta/<agent-name>/`.
- Save a final markdown report in that folder.
- Do not modify production code unless explicitly assigned to a fix pass.

## Prompt A: Beta Lock Test

Run a release-lock QA pass. Be strict. Your goal is to decide whether Axis 1 is safe to sell as a beta to hood cleaning vendors after account/storage/history are added.

Test matrix:
1. Clean completed job with photos:
   - Hood/filter completed
   - Rooftop fan completed
   - Grease path completed
   - Label/sticker completed
   - Multiple before/after/detail/label photos
2. Clean completed job with limited photos:
   - Completed statuses
   - Some selected areas have no photos
   - Verify written-record wording, not fake photo proof
3. Blocked access:
   - Duct/access route blocked
   - Other selected areas completed
   - Photos may show access panel/blocked condition
   - Verify no completion claim for blocked area
4. Condition found:
   - Fan belt/hinge/electrical/grease condition found
   - Include condition photos
   - Verify “what customer needs to do” and revisit language
5. Not done / not part of visit:
   - Select at least one item as not done
   - Add unrelated or extra photos
   - Verify it does not appear as completed or proof
6. Unselected work leakage:
   - Upload photos that look like duct/fan/label while those Work items are unselected
   - Verify they do not appear in Notes/link/PDF as worked items
7. Photo assist correction:
   - Run AI photo assist
   - Confirm one suggestion
   - Change one role
   - Move one photo to another selected Work item
   - Remove one photo
   - Verify final output follows vendor decisions, not AI draft
8. Output delivery:
   - Generate Customer link
   - Generate Evidence PDF
   - Open link in a clean browser context
   - Save full-page screenshots of customer link and PDF view
   - Check mobile and desktop widths for overflow

Review questions:
- Is mobile input clear for a tired field vendor?
- Is desktop better than a stretched mobile flow?
- Does the tool prevent accidental overclaiming?
- Does customer copy feel premium and trustworthy?
- Does PDF feel like a retained evidence record?
- Does condition/blocked wording support claim defense?
- Does the output naturally drive revisit/rebook when appropriate?
- Would a vendor pay $79/month after account, save/restore, history, and hosted delivery are added?

Report format:
- Verdict: Ship beta / Do not ship beta
- Score: 0-100
- P0 blockers
- P1 must-fix before beta
- P2 improvements
- Scenario table
- Screenshots/PDF paths
- Customer persona review: 10 customers, mixed restaurant operators/managers/franchise/admin
- Vendor persona review: 20 vendors, unweighted, mixed solo techs/dispatch/owner/operators
- Final product judgment

## Prompt B: Unstructured Vendor Poke Test

Act like a real vendor with no product context. Do not follow the happy path. Try to break trust and usability by clicking naturally and impatiently.

Behavior:
- Use new/random hood-cleaning-like photos. Internet image search is allowed for local QA only.
- Try odd order of operations.
- Skip steps.
- Change statuses after photos are attached.
- Upload too many photos.
- Upload irrelevant photos.
- Move photos repeatedly.
- Remove photos.
- Go back and forth between Work, Photos, Notes, Info, Output.
- Use short/long customer names and addresses.
- Try blocked/condition/not-done combinations.
- Try to create a PDF/link before the record is ready.
- Try desktop and mobile widths.

Look for:
- Confusing labels
- Buttons that do not clearly say what happens
- Hidden state changes
- Claims that sound stronger than the evidence
- AI suggestions that feel authoritative before vendor confirmation
- Selected Work leakage
- Output mismatch between tool, customer link, and PDF
- Layout overflow, clipped text, broken image rendering, awkward mobile cards
- PDF pages that feel thin, repetitive, or legally risky
- Customer copy that does not help with payment/revisit/rebook/claim defense

Report format:
- First 15 minutes: what confused you?
- Bugs found with repro steps
- Trust-contract failures
- Output screenshots/PDF paths
- Product-market judgment
- Top 10 fixes ranked by sales impact
- Anything that felt surprisingly good
