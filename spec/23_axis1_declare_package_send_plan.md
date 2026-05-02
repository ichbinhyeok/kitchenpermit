# 23 Axis 1 Declare Package Send Plan

## 1. Decision

Axis 1 vNext is locked around:

```text
Declare -> Package -> Send
```

This supersedes both weaker shapes:

```text
Photos -> Review -> Outputs
Risk -> Scope -> Proof -> Confirm/Pay -> Next
```

`Photos -> Review -> Outputs` was directionally better than the old 5-step
workflow, but it still overweights photo classification and can make the
product feel like a report/PDF builder with photo assist bolted on.

The product should feel like:

```text
I say what happened.
Axis 1 packages the closeout.
I send/save/get paid.
```

Photos are evidence inputs. They are not the workflow.

---

## 2. Product Thesis

Hood vendors do not want to write reports after a job. They want to:

- answer "what did you actually do?"
- avoid overclaiming inaccessible or unproven work
- defend invoice/payment
- explain blocked access or narrow scope
- create a revisit, quote, payment, or next-cleaning follow-up
- avoid digging through text threads and camera rolls

Axis 1 wins if a vendor can create a trustworthy closeout packet in about two
minutes with one outcome declaration, optional photos, and only exception edits.

The paid object is not AI photo classification. The paid object is the
customer-safe closeout packet and output fanout generated from one job truth
record.

---

## 3. UX Principle

The vendor should think they are editing the closeout preview.

Internally, the system updates a structured source of truth:

```text
raw inputs
-> AI/rule suggestions
-> Axis1JobTruthRecord
-> output fanout
```

The UI must not expose "job truth record" as customer/vendor-facing product
language. That phrase is an internal engineering and product boundary.

---

## 4. Main Flow

### 4.1 Declare

Primary question:

```text
What happened on this job?
```

Primary choices:

- Completed
- Blocked / no access
- Condition found
- Partial / separate visit

Secondary inputs:

- optional short note
- optional photos
- optional voice/note later

Rules:

- no long form before value
- no manual photo classification task
- no risk/scope setup step
- final outcome must be vendor-confirmed, not AI-confirmed

### 4.2 Package

Axis 1 creates a customer-like closeout packet preview with editable claim
cards.

Each customer-visible factual claim maps to one structured statement:

- area
- status
- proof basis
- claim strength
- customer wording
- vendor-only warning if needed

Claim cards expose only simple decisions:

- Completed
- Completed from note
- Blocked / no access
- Not completed
- Condition only
- Not part of this visit

Photo evidence is shown as an evidence tray:

- attached to claim
- saved in packet, not claimed
- needs one decision only when it changes a customer-visible claim or next
  action

Uncertain photos should not become a mandatory classification backlog.

### 4.3 Send

The same `Axis1JobTruthRecord` fans out into:

- customer link
- evidence PDF
- invoice proof note
- payment message
- revisit message
- quote/follow-up message
- next cleaning reminder

Each output has:

- ready
- needs review
- not applicable

The vendor should not manually write or reconcile these outputs.

---

## 5. Source Of Truth

Implementation should introduce and then progressively route Axis 1 through an
explicit internal record.

Minimum shape:

```ts
type Axis1JobTruthRecord = {
  outcome: Axis1OutcomeTruth;
  areaLedger: Axis1AreaTruth[];
  claimStatements: Axis1ClaimStatement[];
  photoEvidence: Axis1PhotoEvidence[];
  customerSafeSummary: Axis1CustomerSafeSummary;
  vendorOnlyWarnings: Axis1VendorWarning[];
  outputReadiness: Axis1OutputReadiness[];
  nextAction: Axis1NextAction;
};
```

Minimum area ledger:

- hood / filters
- duct / access
- rooftop fan
- grease path / containment
- label / notice

Allowed area states:

- completed with photo
- completed from notes
- blocked / no access
- not completed
- condition noted
- separate / not this visit
- unclear / needs review

Minimum claim strength:

- no claim
- vendor written record
- photo attached area record
- vendor-confirmed photo-supported
- vendor-confirmed before/after pair

Rules:

- AI suggestion is not proof.
- Attached photo is not a completed claim.
- Before/after is not claimed unless the vendor confirms the pair.
- Unconfirmed or low-confidence photos may be saved in the packet, but not used
  to strengthen a claim.
- Customer copy must never leak vendor-only warnings.

---

## 6. Photo Policy

Axis 1 should not promise that AI can fully understand hood work from messy
phone photos.

The product stance:

```text
Photos help support the packet.
The vendor declares what happened.
Axis 1 keeps the claims honest.
```

Photo Assist may:

- group obvious evidence
- suggest likely area
- suggest likely before/after/condition tone
- flag uncertainty
- save extra evidence without claiming it

Photo Assist must not:

- decide job completion
- decide area completion
- decide claim strength
- create customer-visible claims from uncertain evidence
- force the vendor through photo-by-photo review

The best default for ambiguous photos is:

```text
Saved in packet, not claimed.
```

This avoids two bad experiences:

- "Why did the AI claim the wrong thing?"
- "Why do I have to classify every photo?"

---

## 7. One-Question Policy

Ask the vendor only when the answer changes:

- a customer-visible completion claim
- a blocked/not-completed/condition statement
- proof strength used for invoice/payment support
- revisit, quote, payment, or next-service action

Do not ask just because:

- a photo is ambiguous
- a photo cannot be slotted
- before/after order is uncertain
- an evidence photo is extra

Those photos can stay saved, not claimed.

---

## 8. Output Rules

Customer link:

- explains what happened in plain English
- separates completed, blocked, condition, and not-part-of-visit areas
- never says photo attached unless a photo is actually attached to that claim

Evidence PDF:

- document-format record
- not an official inspection, NFPA certificate, fire marshal approval, or code
  pass/fail
- uses the same statements as the customer link

Invoice/payment proof:

- ready when claim strength is clear enough
- needs review when important areas are written-only, blocked, unclear, or
  condition-only

Revisit output:

- ready only when an area is blocked/no-access or not completed

Quote/follow-up output:

- ready only when a condition area exists

Next cleaning reminder:

- ready after ordinary completed work
- needs review when unresolved blocked access or incomplete work remains

---

## 9. Implementation Plan

### Phase 1: Contract And Documentation

- Update strategy and Axis 1 docs to lock `Declare -> Package -> Send`.
- Document photo policy, one-question policy, and claim strength.
- Add test contracts for no-photo, blocked, condition, narrow-scope, and
  ambiguous-photo cases.

### Phase 2: JobTruthRecord Boundary

- Add a pure `axis1-job-truth` module.
- Normalize existing form/engine state into `Axis1JobTruthRecord`.
- Derive output readiness from area states and claim strength.
- Assert invariants that prevent customer overclaims.

### Phase 3: Engine Fanout

- Make generated outputs inspect the record before producing copy.
- Keep customer link, PDF, invoice/payment, revisit/quote, and next-service
  output readiness downstream of the same statement IDs.
- Remove duplicated output-specific case logic where it can contradict the
  record.

### Phase 4: UI Shell

- Replace main path labeling with `Declare`, `Package`, `Send`.
- Keep photos as optional evidence intake, not a photo-sorting task.
- Show claim cards in the package preview.
- Move extra/ambiguous photos into "saved, not claimed" evidence tray.
- Keep risk and scope as inline exception controls only.

### Phase 5: Deep QA

- Browser-test desktop and mobile.
- Run persona-style vendor smoke tests against dirty photo/no-photo cases.
- Test live photo sets as evidence support, not as the authority.
- Verify visible UI details: header overflow, menus, drawers, chips, mobile
  wrapping, disabled/ready states, output copy, PDF/customer preview consistency.

---

## 10. Non-Goals

Do not build in this pass:

- full FSM/CRM/scheduling
- quote management
- payment collection integration
- compliance certificate generation
- photo-by-photo mandatory classification queue
- PDF text editor as the correction model
- risk/scope as top-level workflow modules

---

## 11. Acceptance Criteria

The build is not acceptable unless:

- a cold vendor understands the product in about 10 seconds
- a normal closeout can be completed in about two minutes
- no-photo closeout is a valid written record
- four or more messy photos do not create a mandatory photo review chore
- blocked fan does not silently block duct/access
- filters-only or fan-only jobs do not sound like failed full-scope jobs
- condition records do not claim condition photos unless photos exist
- before/after is never claimed without vendor-confirmed pairing
- every output derives from the same internal record
- customer copy does not leak internal warning language
- the product feels like closeout automation, not report building

If the implementation mainly strengthens the current `Photos -> Review ->
Outputs` path without changing the mental model, it is not enough.
