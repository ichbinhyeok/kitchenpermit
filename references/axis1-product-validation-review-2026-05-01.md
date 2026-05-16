# Axis 1 Product Validation Review - 2026-05-01

This review tests whether Axis 1 currently feels like a useful Hood Closeout
Proof Link product, not just whether the rule engine calculates the right
branch.

Status: simulated validation, not external market proof.

## Scope

Tested surfaces:

- vendor builder: `/axis-1/tool`
- clean customer link: `/p/sample-clean-closeout`
- blocked access customer link: `/p/sample-blocked-access`
- condition review customer link: `/p/sample-condition-review`
- photo upload review using local synthetic messy fixtures
- real field-like Wikimedia Commons kitchen exhaust and grease-filter photos

Evidence generated:

- `references/axis1-validation-artifacts/2026-05-01/browser-scan.json`
- `references/axis1-validation-artifacts/2026-05-01/tool-mobile.png`
- `references/axis1-validation-artifacts/2026-05-01/clean-mobile.png`
- `references/axis1-validation-artifacts/2026-05-01/blocked-mobile.png`
- `references/axis1-validation-artifacts/2026-05-01/condition-mobile.png`
- `references/axis1-validation-artifacts/2026-05-01/tool-messy-upload-desktop.png`
- `references/axis1-validation-artifacts/2026-05-01/tool-messy-confirmed-desktop.png`
- `references/axis1-validation-artifacts/2026-05-01/field-photo-set/manifest.json`
- `references/axis1-validation-artifacts/2026-05-01/vendor-real-field-set-live-ui.json`
- `references/axis1-validation-artifacts/2026-05-01/vendor-real-field-set-live-ui.png`

## Dataset Reality

Current repo data is not a true vendor evaluation set.

Existing local photos:

- `frontend/public/axis1-test-photos`: small Wikimedia-based development fixture set
- `frontend/public/axis1-test-photos/web-fixtures`: 29 rough web QA images
- `frontend/public/axis1-test-photos/local-scrape`: 181 local-only rough scrape images
- `frontend/public/axis1-test-photos/messy-synthetic`: 8 generated stress fixtures
- `references/axis1-validation-artifacts/2026-05-01/field-photo-set`: 12
  field-like Wikimedia Commons kitchen exhaust, duct, fan, grease, and filter
  photos renamed to phone-style `IMG_0001.jpg` filenames

Conclusion:

The current dataset is enough for engine safety, UI flow, rough Photo Assist
stress testing, and an initial live Gemini reality check. It is still not enough
to claim real-world vendor usefulness or production AI slot accuracy.

Needed next:

- 20-30 real or real-like job folders
- each folder should include raw phone filenames, duplicates, poor lighting,
  partial before/after coverage, blocked access, and condition photos
- each folder needs a human-labeled expected result and expected photo slots

## Licensing Note

Local testing does not automatically make arbitrary copied images risk-free.
The practical issue is not just public display. Product validation often creates
copies, stores them in a repo, sends them to AI providers, shares screenshots,
or later reuses them in demos. That can move the use beyond a private scratch
test.

Working rule for Axis 1 fixtures:

- use public-domain, permissively licensed, or vendor-permitted photos when
  they are kept in the repo
- keep rough scrape sets local-only and gitignored
- never use scraped third-party photos as marketing, product defaults, or
  commercial sample artifacts
- keep a manifest with source, license, and intended use

References:

- U.S. Copyright Office fair use FAQ: https://www.copyright.gov/help/faq/faq-fairuse.html
- U.S. Copyright Office fair use overview: https://www.copyright.gov/fair-use/more-info.html
- Creative Commons FAQ: https://creativecommons.org/about/faq/

This is product-risk guidance, not legal advice.

## Browser QA Summary

Automated scan covered desktop 1440x1000 and mobile 390x844.

Passes:

- all tested routes returned HTTP 200
- no page runtime errors
- no measured page-level horizontal overflow
- customer pages did not match the blocked compliance/authority overclaim terms
- customer images did not expose missing `alt` attributes in this scan
- tool page upload controls now expose accessible names

Warnings:

- mobile clean and condition pages still emitted a Next.js development-mode LCP
  image warning for `ai-hood-after.jpg`; the rendered hero image has
  `loading="eager"`, so this is tracked as performance polish, not a product
  blocker
- mobile customer links are long and repeat the result/action/coverage truth in
  several cards; safe, but slightly heavy
- mobile CTA labels are shortened in the hero, for example `Reply for access`
  and `Request quote`; the meaning remains clear, but the locked CTA language is
  more precise

## Messy Photo Upload Stress Test

Generated 8 local-only synthetic messy fixtures:

- low-light rotated hood photo
- blurry duplicate filter photo A
- blurry duplicate filter photo B
- cropped grease path photo
- overexposed rooftop fan photo
- grease bucket photo
- clean filter with ambiguous filename
- misleading `blocked_area_cleaned_questionmark` filename

Observed result in vendor builder:

- bulk upload succeeded
- 8 photos became AI-suggested or overflow candidates
- 0 photos were vendor-confirmed before action
- UI explicitly said suggestions do not count as proof coverage until confirmed
- `Confirm roles` moved the flow to result selection
- before selecting a result, the customer draft stayed locked
- no live Gemini call was needed for this test

Important observation:

The deterministic fallback can place some messy or misleading filenames into
plausible slots by upload order or keyword. That is acceptable only because the
state remains pending. This confirms the product boundary is doing real work:
AI/mock suggestions must remain assistive until vendor confirmation.

## Gold-Set Harness

Added:

- `references/axis1-photo-assist-gold-set.schema.json`
- `references/axis1-photo-assist-gold-set.json`
- `scripts/axis1-evaluate-photo-assist-gold-set.cjs`

Current gold set:

- 3 cases
- 21 photos
- clean baseline fixtures
- blocked/condition baseline fixtures
- synthetic messy phone batch

Latest mock fallback result:

- strict slot accuracy: 61.9%
- accepted safe-slot accuracy: 95.2%
- review-flag agreement: 90.5%
- reason safety: 100%
- pending-decision safety: 100%
- missing fixtures: 0

Report:

- `references/axis1-validation-artifacts/2026-05-01/photo-assist-gold-set-report.md`
- `references/axis1-validation-artifacts/2026-05-01/photo-assist-gold-set-report.json`

Interpretation:

The filename-based mock fallback is now conservative enough for local testing:
it stays pending, avoids overclaim language, and flags high-risk cues such as
dirty, blocked, grease, duct, before, and ambiguous filenames for vendor review.

Strict slot accuracy remains limited because mock fallback cannot inspect image
content. This is intentional. The gap becomes the measurement target for Gemini:
Gemini should improve visual slot suggestions without weakening the vendor
confirmation boundary.

## Gemini Live Phone Filename Smoke

Added:

- `scripts/axis1-evaluate-photo-assist-gemini-live.cjs`
- `references/axis1-validation-artifacts/2026-05-01/gemini-live-phone-filename-smoke.md`
- `references/axis1-validation-artifacts/2026-05-01/gemini-live-phone-filename-smoke.json`
- `references/axis1-validation-artifacts/2026-05-01/vendor-live-gemini-ui-smoke-after-thinking-fix.json`
- `references/axis1-validation-artifacts/2026-05-01/vendor-live-gemini-after-thinking-fix.png`
- `references/axis1-validation-artifacts/2026-05-01/vendor-risky-suggestion-review-queue.json`
- `references/axis1-validation-artifacts/2026-05-01/vendor-risky-suggestion-review-queue.png`

Run:

- live Gemini UI smoke with 4 uploaded photos
- generic phone-style names included
- one unrelated receipt/document image included
- one risky blocked/question filename included

Latest Gemini live result:

- provider: Gemini `gemini-2.5-flash`
- response mode: live
- warning: none after the thinking-token fix
- reason safety: 100%
- pending-decision safety: 100%
- unrelated/null handling: `IMG_8420.jpg` returned `suggestedSlotId: null`,
  `confidence: 0.1`, and `needsVendorReview: true`
- useful visual recognition: `IMG_7421.jpg` returned `hood-before` at `0.9`
  confidence from image content despite a generic filename
- risky result: `blocked_area_cleaned_questionmark.jpg` was visually suggested
  as `hood-after`, so the UI now keeps blocked/question/unclear suggestions in
  the review queue instead of auto-placing them as cleaned/after proof

Important read:

Gemini can materially improve numeric phone filename sorting, but it is not safe
to let the visual suggestion place risky blocked/question photos directly into a
cleaned/after slot. The correct product behavior is:

- generic but visually clear photos may be placed as `AI suggested`
- unrelated photos stay in `Needs vendor review`
- blocked/question/unclear photos stay in `Needs vendor review` even if Gemini
  proposes a slot
- no suggestion counts as proof coverage until vendor confirmation

Implementation note:

- Gemini 2.5 Flash was truncating JSON because default thinking tokens consumed
  the output budget. The adapter now sets `thinkingConfig.thinkingBudget = 0`
  for this short structured-output task.
- The Gemini parser now accepts both `{ "suggestions": [...] }` and top-level
  `[...]` JSON responses.
- The adapter emits a warning if Gemini output cannot be parsed and filename
  fallback suggestions are used.

Cost note:

This validation intentionally used small live calls. The latest useful UI smoke
used 4 photos; additional one-photo debug calls confirmed the thinking-token
truncation fix.

## Real Field-Like Photo Set

Added:

- `references/axis1-validation-artifacts/2026-05-01/field-photo-set/raw`
- `references/axis1-validation-artifacts/2026-05-01/field-photo-set/manifest.json`
- `references/axis1-validation-artifacts/2026-05-01/vendor-real-field-set-live-ui.json`
- `references/axis1-validation-artifacts/2026-05-01/vendor-real-field-set-live-ui.png`
- `references/axis1-validation-artifacts/2026-05-01/vendor-real-field-set-replay-after-threshold-v2.json`
- `references/axis1-validation-artifacts/2026-05-01/vendor-real-field-set-replay-after-threshold-v2.png`

Set:

- 12 kitchen exhaust, duct, rooftop fan, grease bucket, and hood filter photos
- all renamed to phone-style filenames such as `IMG_0007.jpg`
- source titles and license metadata retained in `manifest.json`
- one live Gemini UI call through the real builder upload path

Latest live Gemini result:

- provider: Gemini `gemini-2.5-flash`
- request size: 12 photos
- response status: 200
- warning: none
- suggestions returned: 12
- pending vendor decisions: 12
- forbidden reason terms: 0
- UI proof warning visible: yes
- vendor confirmed count before action: 0

Useful recognition examples:

- greasy hood interior: `hood-before`, `0.95`
- before/after duct image: `hood-after`, `0.95`
- rooftop fan cleaning: `rooftop-fan`, `0.9`
- grease bucket: `grease-containment`, `0.85`
- clean and dirty hood filters: `filter-bank`, `0.9`

Product finding:

Gemini handled generic phone filenames well when the visual content was clear.
The important UX behavior is that crowded or ambiguous sets still require
vendor cleanup: the UI displayed `Needs vendor review` for 8 of the 12 photos
because several photos were ambiguous, low-confidence, or competing for already
filled proof slots.

Tuning applied:

- the low-confidence review threshold was raised from `0.72` to `0.8`
- borderline field photos around `0.75-0.78` now stay in review instead of
  being quietly treated as easy slot suggestions

Interpretation:

This improves the vendor workflow without weakening the product boundary. AI is
useful for sorting, but the vendor still has to confirm, edit, or leave out
photos before proof coverage can move into the customer link.

## Upload And Provider Guardrails

Current controls:

- builder bulk upload accepts up to 16 image files in one batch
- Photo Assist API rejects requests over 16 photos
- Gemini live adapter sends at most 12 photos per request
- Photo Assist API rejects oversized preview data URLs before provider work
- client sends a smaller AI-only preview copy instead of the larger proof/PDF
  preview image
- unrecognized or unrelated images should be `suggestedSlotId: null`,
  low-confidence, and `needsVendorReview: true`

This means excessive or irrelevant photos are allowed to be reviewed by the
vendor, but they do not become confirmed proof coverage without vendor action.

## Vendor Demo Readiness QA

Tested a no-cost Playwright route-mocked Photo Assist flow with phone-style
filenames:

- `IMG_7421.jpg` mocked as a confident `hood-after` suggestion
- `IMG_8420.jpg` mocked as an unrelated receipt/document with
  `suggestedSlotId: null`

Artifacts:

- `references/axis1-validation-artifacts/2026-05-01/vendor-flow-null-photo-review-queue.png`
- `references/axis1-validation-artifacts/2026-05-01/vendor-flow-null-photo-left-out.png`

Observed and fixed:

- unrelated `null` suggestions are no longer left inside an upload-order slot
- safe non-null suggestions can move into the suggested slot, but remain
  `AI suggested` until vendor confirmation
- unplaced or unrelated photos now appear in an explicit `Needs vendor review`
  queue on the photo step
- vendors can assign a role or choose `Leave out` for wrong/duplicate/unclear
  photos
- after `Leave out`, the unrelated receipt row is removed, `Extra` returns to
  0, and the pending count reflects only the remaining AI suggestion
- risky blocked/question suggestions are routed to `Needs vendor review` even
  when Gemini proposes an after/cleaned-looking slot

Product read:

This is the right boundary for demo use. The tool helps the vendor clean up a
messy phone folder without pretending AI proved anything. The vendor still has
to confirm the photo role before it can support the customer proof link.

## Input And Edit Flow QA

Artifacts:

- `references/axis1-validation-artifacts/2026-05-01/vendor-validation-input-edit-after-fix.json`
- `references/axis1-validation-artifacts/2026-05-01/vendor-validation-input-edit-report-step-after-fix.png`

Observed and fixed:

- vendor-edited result copy now survives the closeout engine adapter
- vendor-edited customer action copy now appears in the customer proof preview
- no-photo clean still stays a written service record with no field-photo proof
- `Validation Diner`, `Dallas, TX`, and `Night manager` are visible in the
  customer proof link hero
- the builder `Closeout status` card no longer repeats the customer action line
- the customer action section no longer repeats the same action sentence as both
  title and body

Latest check:

- edited property visible: pass
- edited city visible: pass
- edited reviewed-by visible: pass
- edited result sentence visible: pass
- edited customer action visible: pass
- no-photo written-record boundary visible: pass
- prohibited overclaim text: none found

## Persona Review

Scores are simulated product judgment, 0-10.

| Persona | Score | Read |
| --- | ---: | --- |
| Owner-operator, 2 trucks | 8 | Clean link is clearly better than raw text photos and moves toward payment. |
| Night crew lead | 7 | Photo batch flow matches phone workflow, but the review step still requires care. |
| Dispatcher | 8 | Result-before-output lock and CTA summary reduce accidental customer sends. |
| Vendor with weak photo habits | 8 | No-photo clean still has a usable written record instead of a failed packet. |
| Vendor with blocked access disputes | 9 | Blocked branch protects the vendor from implying inaccessible work was cleaned. |
| Vendor worried about liability | 8 | Compliance/official/inspection language is avoided in tested customer pages. |
| Restaurant owner, clean job | 8 | First screen answers completed/result/payment quickly. |
| Restaurant GM, blocked access | 8 | Understands access must be cleared before a revisit or closure. |
| Facilities reviewer | 7 | Coverage and PDF record are useful, but the mobile page is long. |
| Skeptical customer | 7 | Product is honest about partial coverage, but repeated sections can feel dense. |
| AI product reviewer | 8 | AI boundary is well designed: suggestion only, vendor confirmation required. |
| Growth/sales reviewer | 7 | Pain is real, but payment/review/rebook conversion still needs external proof. |

Overall simulated score:

- vendor usefulness: 7.8 / 10
- customer clarity: 8.0 / 10
- trust and claim safety: 8.6 / 10
- mobile usability: 7.3 / 10
- AI boundary safety: 8.8 / 10
- real-market evidence: 4.0 / 10

## Product Verdict

Axis 1 is no longer just an engine or PDF generator. It currently behaves like a
customer-ready proof link product with a real philosophy:

- do not overclaim
- make missing proof explicit without making the vendor look bad
- separate blocked access from completed cleaning
- separate condition review from repair or inspection
- move the customer toward payment, review, rebook, revisit, or quote
- keep AI as a vendor-side organizer only

The product shape is defensible.

The unproven part is real-world pull:

- whether vendors can build a link fast enough after a night job
- whether customers act faster than they do with raw photo texts
- whether real job folders fit the slot model
- whether Gemini improves sorting enough to justify cost
- whether mobile length feels premium or heavy to actual customers

## P0 Validation Gaps

1. Build a real job-folder gold set.
   Target: 20-30 folders, 8-20 photos each, human-labeled outcome and slot map.

2. Run a blind customer comprehension test.
   Ask non-builders to answer in 10 seconds: Was service completed? What proof
   exists? Is anything blocked or recorded? What should they do next?

3. Run one real vendor workflow test.
   One vendor is enough for the next stage. Give them a recent raw photo folder
   and time whether they can make a sendable link in under 2 minutes.

4. Track conversion proof later.
   Hosted version needs events for link opened, CTA clicked, PDF downloaded,
   review clicked, and quote/revisit clicked.

## P1 Product Improvements

1. Tighten mobile first-screen repetition.
   The hero is clear but duplicates result, proof coverage, PDF role, and next
   action several times before the bottom-line section.

2. Align shortened mobile CTA labels with locked CTA language.
   `Reply for access` and `Request quote` are understandable, but the product
   lock is more precise: `Reply after clearing access` and `Request follow-up
   quote`.

3. Add fixture provenance enforcement.
   Any repo-committed fixture should have source/license metadata. Local scrape
   and messy synthetic outputs should stay ignored.

## P2 Polish

1. Investigate the residual Next.js development-mode LCP warning on clean and
   condition mobile sample pages.

2. Consider a compact mobile summary mode after the link has enough trust in
   production data.

## Next Recommended Work

Do not add more AI behavior yet.

The next best work is validation infrastructure:

1. keep the generated messy fixtures local-only
2. add a gold-set schema
3. expand from synthetic fixtures to real job folders
4. run mock and Gemini against the same labeled subset
5. compare accuracy and review flags before tuning UI or model prompts
