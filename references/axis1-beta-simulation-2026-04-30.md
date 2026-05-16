# Axis 1 Beta Simulation - 2026-04-30

This is a simulated beta review, not a recruited external user study.

Reviewed product surface:

- vendor tool: `/axis-1/tool`
- clean customer output: `/p/sample-clean-closeout`
- blocked access customer output: `/p/sample-blocked-access`
- condition review customer output: `/p/sample-condition-review`
- P0 engine matrix in `frontend/src/lib/axis1-closeout-engine.test.ts`

Product under test:

`Hood Closeout Proof Link`

Primary acceptance question:

Can a vendor create a customer-ready closeout proof link with minimal input, and can a customer understand the result, proof coverage, next action, and PDF record role without confusing the output with a compliance certificate, repair claim, or generic PDF report?

## Branch Behavior Confirmed

The engine changes wording by branch.

| Branch | Result wording | Proof wording | Primary CTA | Boundary wording |
| --- | --- | --- | --- | --- |
| Clean + strong photos | Service completed | Photo coverage limited to attached field photos and service areas shown | Pay invoice | Payment, review, and next-service actions are separate from the completed service result |
| Clean + no photos | Service completed | Written service record; no field-photo proof attached | Pay invoice | Written record, not photo proof |
| Blocked access | Service completed + area needs action | Written or partial access record | Reply after clearing access | Inaccessible areas are listed separately and not presented as cleaned |
| Condition review | Service completed + condition recorded | Written or photo-supported condition record | Request follow-up quote | Recorded conditions and follow-up paths are separate from cleaning closeout |
| Missing before/after | Service completed | Partial-photo support only | Pay invoice or relevant branch CTA | No before/after proof claim |
| Result not selected | No customer-facing result generated | Waiting for result | Confirm received disabled/local fallback | No output before result selection |

## Vendor Simulated Beta - 20 Reviewers

| # | Reviewer profile | Pass? | Observation |
| --- | --- | --- | --- |
| V01 | Owner-operator, 2 trucks | Pass | Clean output feels faster than writing an email and sends customer toward payment. |
| V02 | Night crew lead | Pass | Photo role flow reads as sorting proof, not writing a report. |
| V03 | Office dispatcher | Pass | Result-before-output lock prevents sending untouched sample data. |
| V04 | Small vendor owner with weak photo habits | Pass | No-photo clean still produces a usable written service record. |
| V05 | Vendor with frequent blocked access | Pass | Blocked access branch protects them from implying inaccessible work was cleaned. |
| V06 | Vendor doing many restaurant chains | Pass | First screen gives result, coverage, action, and PDF record quickly. |
| V07 | Vendor worried about liability | Pass | No certificate, code, pass/fail, or authority language appears in tested outputs. |
| V08 | Vendor using invoice links | Pass | Clean branch supports invoice URL as primary CTA without payment integration. |
| V09 | Vendor relying on Google reviews | Pass | Review CTA is present but secondary, not competing with payment. |
| V10 | Vendor selling follow-up work | Pass after fix | Condition branch now reads as recorded condition, not blocked access. |
| V11 | Vendor with mobile upload workflow | Pass | Bulk photo and role review model matches phone-batch workflow. |
| V12 | Vendor with after-only photos | Pass | After-only does not claim before/after proof. |
| V13 | Vendor with missing service label photo | Pass | Missing label is explicit coverage state, not hidden. |
| V14 | Vendor with sealed panels | Pass | Concealed path is not presented as cleaned. |
| V15 | Vendor with unsafe access events | Pass | Unsafe access gets a customer action without blaming the vendor for impossible work. |
| V16 | Vendor who wants branded delivery | Scope gap | Branded hosted link remains setup/paid scope, not local preview. |
| V17 | Vendor needing saved history | Scope gap | Saved history requires hosted storage; not part of current local tool. |
| V18 | Vendor wanting Jobber/QuickBooks | Scope gap | Deep integration is correctly out of scope; URL fields are enough for first pass. |
| V19 | Vendor comparing PDF vs link | Pass | Customer link is primary; PDF is framed as archive/submission/print copy. |
| V20 | Vendor sales-minded owner | Pass | Clean/blocked/condition samples show different value stories without extra writing. |

Vendor result:

- Pass: 17 / 20
- Scope gap but not product failure: 3 / 20
- Critical content failure after fixes: 0 / 20

## Customer Simulated Beta - 20 Reviewers

| # | Reviewer profile | Pass? | Observation |
| --- | --- | --- | --- |
| C01 | Restaurant owner, clean visit | Pass | Understands service completed and payment is next. |
| C02 | Restaurant GM, clean visit | Pass | Proof coverage and PDF record are visible in first screen. |
| C03 | Franchise facilities coordinator | Pass | PDF record role is clear as file/archive copy. |
| C04 | Kitchen manager, no-photo clean | Pass | Written record wording does not pretend photos exist. |
| C05 | Restaurant owner, blocked access | Pass | Blocked area is not presented as cleaned. |
| C06 | Property manager, blocked access | Pass | Next step is clear: clear access and reply/request revisit. |
| C07 | Customer skeptical of partial photos | Pass | Partial coverage is stated without saying weak/missing proof. |
| C08 | Customer seeing sealed panel | Pass | Concealed area remains outside completed claim. |
| C09 | Customer seeing unsafe access | Pass | Action is operational, not legal blame. |
| C10 | Customer seeing condition review | Pass after fix | Now reads as one condition recorded, not a blocked area. |
| C11 | Customer asked for quote | Pass | Request follow-up quote is primary on condition branch. |
| C12 | Customer not ready for quote | Pass | Confirm next service remains secondary. |
| C13 | Corporate reviewer | Pass | Service scope and proof coverage are scan-friendly. |
| C14 | Insurance file reviewer | Pass | PDF record copy is visible without authority overclaim. |
| C15 | Landlord reviewer | Pass | Inaccessible/not-completed area remains separate. |
| C16 | Customer on mobile | Pass | Mobile command area exposes primary action, photos, and PDF record. |
| C17 | Customer annoyed by long reports | Pass | First screen answers result/action before details. |
| C18 | Customer confused by vendor jargon | Pass | Customer-facing copy avoids technician shorthand in first screen. |
| C19 | Customer looking for official acceptance | Pass | Output does not claim authority approval or pass/fail. |
| C20 | Customer comparing link vs PDF | Pass | Link is the readable handoff; PDF is the record copy. |

Customer result:

- Pass: 19 / 20
- Pass after wording fix: 1 / 20
- Critical content failure after fixes: 0 / 20

## Issues Found During Simulation

### Fixed: Clean branch over-mentioned conditions

Before:

Clean first-screen safety copy included recorded condition language even when the job was clean.

Why it mattered:

A customer could infer there was a condition item when the visit was clean.

Fix:

Clean branch claim-limit copy now says payment, review, and next-service actions are separate from the completed service result.

### Fixed: Condition branch looked like blocked access

Before:

Condition review first screen used `1 area needs your action`, which looked too much like blocked access.

Why it mattered:

Condition review should not imply an inaccessible or uncleaned area.

Fix:

Condition review first screen now says `1 condition recorded`.

### Fixed: Primary CTA was too low in tall first screens

Before:

On blocked and condition variants, the primary CTA could sit below the first viewport.

Why it mattered:

The product promise is not just proof; it should move the customer toward payment, review, rebook, revisit, or quote.

Fix:

Primary CTA and PDF record action now sit directly below the first metric strip.

## Remaining Non-Content Scope

These are intentionally not locked by this beta simulation:

- real hosted token links
- server persistence
- R2 photo storage
- branded vendor setup
- saved history
- cross-device reopen
- deep payment/job-system integrations

## Verdict

Content/tool beta simulation status:

`Locked for local preview and content product behavior.`

Not locked:

`Hosted delivery and operating infrastructure.`

The content product is now defensible across clean, no-photo, partial-photo, blocked access, condition review, and result-not-selected branches.
