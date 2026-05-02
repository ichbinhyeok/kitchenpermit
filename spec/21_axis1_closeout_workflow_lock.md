# 21 Axis 1 Job Truth Record Pivot Lock

## 1. Status

This document supersedes the earlier "5-step hood lifecycle workflow" framing.

The previous direction was useful as research language, but it is not the
correct product shape for Axis 1. It made the tool feel like a full hood
operations system or a forced workflow wizard. That is too heavy for the first
Axis 1 wedge and too easy to implement as "the old customer report tool with
more sections."

Axis 1 is now locked as:

`Minimal-input Hood Job Truth Record -> Closeout Output Fanout`

In plain English:

`Turn messy crew photos, notes, and area status into one defensible job truth record, then generate the customer handoff, evidence PDF, invoice/payment support, and next action copy from that record.`

This is a pivot from customer-output-first to job-truth-first.

Latest UX lock:

```text
Declare -> Package -> Send
```

This is documented in detail in `spec/23_axis1_declare_package_send_plan.md`.
`Photos -> Review -> Outputs` is now treated as an implementation stepping
stone, not the final product mental model.

---

## 2. Product Boundary

### 2.1 What Axis 1 Is

Axis 1 is a hood job closeout tool.

It is used when a vendor needs to turn a finished or near-finished job into a
safe, useful record.

The primary product object is not the customer link or PDF. The primary product
object is the structured job truth record.

The job truth record answers:

- what happened on this job
- what was in scope
- what was completed
- what was blocked, not completed, separate, or not this visit
- what proof exists
- which proof is photo-supported
- which proof is written-only
- what is safe to tell the customer
- what should stay vendor-only
- what should happen next

### 2.2 What Axis 1 Is Not

Axis 1 is not:

- a full hood operations system
- a CRM
- a scheduling platform
- a quote management system
- a dispatch system
- an invoice platform
- a compliance certificate generator
- a generic report builder
- a photo gallery
- a forced `Risk -> Scope -> Proof -> Confirm/Pay -> Next` wizard

Future products may move into broader lifecycle operations. Axis 1 should not
start there.

### 2.3 Core Wedge

The strongest wedge is the job closeout moment:

- the crew has finished or sent photos
- the office needs to explain what happened
- the vendor needs a defensible customer-facing record
- invoice/payment support may be needed
- blocked, condition, or missing-proof cases need safer wording
- next cleaning, revisit, or quote follow-up should be created without extra writing

This is closer to "closeout proof automation" than "hood lifecycle operations."

---

## 3. Paid Wedge Decision

### 3.1 Are Steps 3 / 4 / 5 Enough?

Yes, but only if they are framed as job truth automation, not as three separate
output features.

The paid wedge is:

```text
crew proof + job truth record
-> customer confirmation
-> evidence document
-> invoice/payment support
-> next job action
```

This is enough to be useful because it sits at the moment where vendors already
feel time, trust, and money pressure:

- the crew has messy photos or notes
- the office must explain what happened
- the customer may question whether full exhaust work was performed
- the invoice needs proof context
- blocked or incomplete areas need safe wording
- revisit, quote, or next cleaning follow-up should not be forgotten

The wedge is not "make a nicer customer report." It is "make the job facts
defensible once, then reuse them everywhere."

### 3.2 Why Not Lead With Full Lifecycle Operations?

Full hood lifecycle operations may be a later product, but it is too broad for
Axis 1.

If Axis 1 leads with lifecycle operations, vendors will expect:

- quoting
- dispatch
- scheduling
- customer management
- crew assignment
- invoice creation
- payment collection
- recurring service management
- stored job history

That puts the product in competition with field-service management systems
before the proof wedge is validated.

Axis 1 should instead win a narrower moment:

`the job is done or nearly done; turn the field reality into defensible outputs.`

### 3.3 Role Of 1 / 2 From The Lifecycle Map

The research language identified:

1. pre-quote risk
2. scope lock
3. crew proof
4. customer confirmation / payment
5. next cleaning / follow-up

Do not translate that directly into five required product steps.

Steps 1 and 2 are real pains, but they are not likely to be the main reason a
vendor opens Axis 1 at first.

Use them as optional context:

- `Risk note` when access, heavy grease, condition, price, or expectation risk
  affects proof, payment, or follow-up.
- `Scope check` when the default visit scope is wrong or an area was blocked,
  separate, not completed, or condition-only.

Steps 3 / 4 / 5 are the main closeout wedge.

### 3.4 External Signal Re-Check

The latest product decision is consistent with external signals:

- A restaurant-owner thread shows customers pushing back on incomplete hood work,
  roof access, cleanup quality, pictures, insurance/fire-department context, and
  whether the vendor actually completed the full job. Source:
  https://www.reddit.com/r/restaurantowners/comments/1qbt8aa/hood_cleaning_service_rant/
- A cleaning-business thread shows operators discussing proof-of-work photos,
  attaching before/after context to invoices, same-day reporting, and avoiding
  lost photo threads. Source:
  https://www.reddit.com/r/cleaningbusiness/comments/1rvuj35/how_do_you_prove_to_clients_the_work_was_actually/
- A restaurant-owner guide from a fire district lists written reports,
  deficiencies, recommendations, certificates, before/after photos, and regular
  cleaning cadence as part of the expected hood-cleaning context. Source:
  https://www.marysvillefiredistrict.org/files/3c9d641ba/MFD%2BRestaurant%2BOwners%2BGuide%2Bto%2BExhaust%2BHood%2BCleaning.pdf

Takeaway:

The strongest first product is not a full operations platform. It is a fast,
defensible closeout record that connects proof, payment context, and follow-up.

---

## 4. Correct Pivot

### 4.1 Old Center Of Gravity

```text
photos / light input
-> customer link / PDF
```

This made Axis 1 feel like a customer report or PDF generator.

### 4.2 Wrong New Center Of Gravity

```text
risk
-> scope
-> proof
-> confirm/pay
-> next
```

This looks strategic, but it risks becoming a heavy operations workflow. It also
pushes quote-before-work and pre-job scope work into a tool vendors may only
open after the job.

### 4.3 Locked Center Of Gravity

```text
minimal vendor input
-> job truth record
-> output fanout
```

The job truth record is the source of truth. Outputs are generated from it.

Outputs include:

- customer handoff link
- evidence PDF
- invoice proof summary
- payment-support copy
- revisit request copy
- follow-up quote copy
- next-service / rebook copy
- vendor-only risk and missing-proof check

The vendor should not manually compose these outputs.

---

## 5. Main UX Shape

Axis 1 should not be a five-step lifecycle wizard.

The main flow should feel like:

```text
1. Declare what happened.
2. Package the closeout.
3. Send/save/get paid.
```

or even more simply:

```text
Declare -> Package -> Send
```

The exact UI can use tabs, cards, or a guided page, but the product must not
make Risk and Scope feel like mandatory standalone operational modules.

### 5.1 Required Primary Work

The vendor must be able to finish a normal job with very little input:

1. Pick the job result.
2. Accept or adjust area status.
3. Add photos if they exist, or proceed as written proof.
4. Review generated outputs only when something is risky or wrong.

Photos should not become a required sorting step. They are optional evidence
inputs that can attach to claims, stay saved without being claimed, or trigger a
single vendor decision only when the answer changes customer-visible wording or
next action.

### 5.2 Area Coverage Ledger

The area ledger is the heart of the job truth record.

Minimum areas:

- hood / filters
- duct / access path
- rooftop fan
- grease path / containment
- label / notice

Each area can be:

- completed + photo
- completed from notes
- blocked / no access
- not completed
- condition noted
- separate / not this visit

Changing an area status must update every output.

### 5.3 Proof Basis

Photos are optional proof, not the product entry point.

Supported proof bases:

- photo-supported
- written service record
- partial photo support
- blocked/access proof
- condition-only record

AI may suggest photo roles and flag gaps. AI must not decide completion.

AI suggestions are not proof and do not create before/after claims by
themselves. Before/after proof requires vendor-confirmed pairing.

---

## 6. Risk And Scope Policy

### 6.1 Risk Is Optional Context

Pre-quote or pre-job risk is real, but it is not the core Axis 1 user action.

Risk should appear only as lightweight context when it affects:

- the safety of a completion claim
- invoice/payment support
- quote follow-up
- revisit need
- customer expectation wording
- vendor-only warning

Examples:

- access risk
- heavy grease / initial clean
- fan or duct condition
- scope unclear
- price / expectation risk

Risk should not be the first required step unless the user explicitly starts
from a risk-heavy case.

### 6.2 Scope Is A Safety Control

Scope is important, but not as a standalone pre-job workflow.

Axis 1 should default scope from visit type and expose quick correction when:

- the visit type is wrong
- an area was blocked
- an area was separate
- an area was not completed
- an area has a condition note
- AI/photo evidence creates uncertainty

Scope should be edited inline through the area coverage ledger.

### 6.3 Rejected IA

Do not make the main IA:

```text
Risk -> Scope -> Proof -> Confirm/Pay -> Next
```

That framing is allowed as an internal lifecycle map, but it should not be the
default product navigation.

---

## 7. Data Model Direction

The implementation should move toward an explicit job truth record.

Suggested shape:

```ts
type Axis1JobTruthRecord = {
  jobBasics: {
    siteName: string;
    serviceDate: string;
    location?: string;
    crewLabel?: string;
  };
  outcome: {
    type: "completed" | "blocked_access" | "condition_noted" | "partial" | "needs_result";
    confirmedByVendor: boolean;
  };
  areaLedger: Axis1AreaTruth[];
  proofBasis: {
    type:
      | "photo_supported"
      | "partial_photos"
      | "written_record"
      | "access_issue"
      | "condition_record";
    photosAttached: number;
    missingProofWarnings: string[];
  };
  optionalContext: {
    riskFlags: Axis1RiskFlag[];
    scopeNotes: string[];
  };
  vendorOnlyChecks: Axis1VendorCheck[];
  outputReadiness: Axis1OutputReadiness[];
  nextAction: Axis1NextAction;
};

type Axis1AreaTruth = {
  area: "hood_filters" | "duct_access" | "rooftop_fan" | "grease_path" | "label_notice";
  status:
    | "completed_with_photo"
    | "completed_from_notes"
    | "blocked_no_access"
    | "not_completed"
    | "condition_noted"
    | "separate_not_this_visit";
  proof: "photo" | "written" | "none" | "unclear";
  customerVisible: boolean;
  vendorOnlyReason?: string;
};
```

The current engine may evolve gradually, but the source of truth must become
the job truth record rather than customer wording or PDF sections.

The implementation should also track claim strength at statement or area level:

```ts
type Axis1ClaimStrength =
  | "no_claim"
  | "vendor_written_record"
  | "photo_attached_area_record"
  | "vendor_confirmed_photo_supported"
  | "vendor_confirmed_before_after_pair";
```

This distinction prevents the product from turning weak or ambiguous evidence
into stronger customer-visible claims.

---

## 8. Output Fanout

Generated outputs must remain downstream of the job truth record.

### 8.1 Customer Handoff

Purpose:

- explain what happened
- avoid overclaiming
- give the customer the next action

It should not expose vendor-only warnings or internal terms.

### 8.2 Evidence PDF

Purpose:

- retained document
- archive
- manager / landlord / insurance / corporate request
- invoice attachment
- print copy

The PDF is not a link replacement. It is a document-format evidence record.

### 8.3 Invoice And Payment Support

Purpose:

- concise invoice proof
- payment request support
- dispute reduction

It must become review-needed when the job is written-only, partial, blocked, or
condition-heavy.

### 8.4 Next Action

Purpose:

- next cleaning reminder
- revisit request
- follow-up quote copy
- monitor condition
- no follow-up needed

Next action should be generated from the job truth record. It should not require
a separate scheduling product.

---

## 9. Case-Adaptive Behavior

Axis 1 must stay light.

Normal clean job:

- default scope
- vendor confirms result
- written proof or photos
- customer handoff, PDF, and next-service copy generated

No-photo job:

- written service record
- no photo implication
- invoice/payment output marked review if claim strength is low

Blocked access:

- affected area marked blocked
- customer copy explains reachable work
- revisit copy becomes ready
- normal rebook copy may need review

Condition found:

- affected area marked condition noted
- follow-up quote or monitor copy becomes ready
- customer completion language stays limited

Wrong photo role:

- vendor can reassign or leave out
- unconfirmed photos do not support claims

Fan-only or filter-only:

- visit type narrows default area ledger
- excluded areas stay out of completion claims

---

## 10. Implementation Guidance

### 10.1 Component Direction

Avoid one giant packet-builder screen where every idea is conditionally glued in.

Prefer modules around the job truth record:

- `JobTruthComposer`
- `AreaCoverageLedger`
- `ProofIntake`
- `OptionalRiskContext`
- `OutputFanout`
- `NextActionPanel`
- `CustomerHandoffPreview`
- `EvidencePdfPreview`

The names can change, but the separation should be real.

### 10.2 Navigation Direction

Acceptable navigation:

- `Truth -> Proof -> Outputs`
- `Job record -> Proof -> Send/save/next`
- single page with a persistent job truth summary and output fanout

Risk and scope can exist as cards or expandable controls inside job truth.

Avoid:

- `Photos -> Result -> Outputs`
- `Photos -> Review -> Outputs` as the final product shape
- `Risk -> Scope -> Proof -> Confirm/Pay -> Next` as mandatory tabs
- a report preview where all source-of-truth edits feel secondary
- a photo role review queue where ordinary closeouts require photo-by-photo
  cleanup

### 10.3 URL And State

Deep links must not show mismatched tabs and content.

If the app supports `?step=...`, every step should either:

- open the corresponding real view, or
- redirect with a clear, intentional state reason

Do not show active `Confirm/Pay` while rendering `Scope` content.

---

## 11. Acceptance Criteria

The next implementation should be judged against these questions:

1. Does the first screen make Axis 1 feel like a job truth record tool rather
   than a customer report builder?
2. Can a vendor finish a normal no-photo job with minimal input?
3. Can a vendor quickly correct hood / duct / fan / grease / label status?
4. Do customer handoff, PDF, invoice/payment support, revisit/quote, and next
   action all derive from the same job truth record?
5. Are Risk and Scope lightweight context controls rather than mandatory
   operations modules?
6. Is PDF treated as evidence document, not as a link clone?
7. Are customer-visible and vendor-only statements separated?
8. Does the product avoid pretending to be a full hood operations platform?
9. Does it follow `Declare -> Package -> Send` rather than photo sorting,
   lifecycle operations, or PDF editing?

If the result is mostly a prettier customer link/PDF screen, it failed.

If the result is a heavy lifecycle wizard, it also failed.

The target is a minimal-input job truth record that fans out into useful closeout
outputs.
