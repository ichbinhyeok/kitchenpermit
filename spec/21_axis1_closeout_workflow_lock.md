# 21 Axis 1 Vendor Proof Packet Workflow Lock

## 1. Why This Document Exists

This document is the handoff lock for the next Axis 1 build session.

Axis 1 must not drift into:

- a prettier inspection form
- a generic PDF/report builder
- an NFPA or compliance certificate generator
- a full field-service management platform
- a photo gallery with nicer styling
- a manual quote / crew / payment checklist system

Axis 1 is locked as:

`Minimal-input Hood Job Proof Packet`

The product turns messy phone photos and a few vendor confirmations into one
structured job proof packet. From that packet, Axis 1 generates:

- customer link
- evidence PDF
- invoice / payment proof summary
- follow-up quote or revisit copy
- next-service / rebook copy
- vendor-only missing-proof and risky-claim warnings

Important pivot:
The goal is not to make vendors fill out Quote Guard, Crew Proof, Payment
Defense, and Rebook forms manually. The goal is to generate those useful
outputs from the smallest possible input set.

---

## 2. Locked Product Definition

### 2.1 Buyer and Reader

The paying customer is the hood / kitchen exhaust cleaning vendor.

The restaurant owner, facility manager, landlord, insurance reviewer, or
internal office reviewer may receive generated outputs, but the product is
optimized first for the vendor's money, time, and risk.

Vendor success means:

- less report writing after field work
- fewer unpaid or disputed jobs
- clearer price defense against cheap canopy-only work
- safer claims when roof, fan, duct, access, grease path, cleanup, or photos are
  missing
- faster invoice, quote, revisit, and rebook follow-up

### 2.2 Product Sentence

`Turn hood job photos and one result confirmation into a vendor-defensible proof packet that can generate a customer link, evidence PDF, invoice proof, follow-up quote or revisit copy, and next-service prompt.`

### 2.3 Short Names

Preferred:

- Hood Job Proof Packet
- Hood Closeout Proof Packet
- Kitchen Exhaust Job Record
- Vendor Proof Packet

Avoid:

- report builder
- PDF generator
- inspection certificate
- compliance generator
- AI compliance report
- customer delight report
- manual field-service checklist

### 2.4 Core Workflow

```text
Vendor minimal input
-> photo assist suggestions
-> vendor confirms only risky / ambiguous items
-> closeout engine
-> outcome type, evidence basis, claim level, proof coverage
-> vendor send-readiness and risk warnings
-> structured job proof packet
-> generated outputs:
   - customer link
   - evidence PDF
   - invoice/payment proof summary
   - quote/revisit copy
   - next-service/rebook copy
```

Rules:

- Every generated output must come from the same engine-backed job record.
- AI may organize photos and flag uncertainty.
- AI must not confirm completion, select the final job result, decide
  compliance, or create stronger claims than the evidence supports.
- The vendor should confirm the final result once, then outputs should fan out
  automatically.

---

## 3. Output Hierarchy

### 3.1 Primary Product Object

The structured job proof packet is the primary product object.

It must answer for the vendor:

- What can we safely claim?
- What photos or written notes support it?
- What is missing, blocked, not in scope, or not photographed?
- What would be risky to send as completed?
- What should this generate for invoice, payment, revisit, quote, or rebook?

The packet should feel automatic. The vendor should not have to manually compose
separate artifacts.

### 3.2 Customer-Facing Output

The hosted customer link is the primary customer-facing surface.

It must answer in the first 5-10 seconds:

- What was completed?
- What proof supports the result?
- What was blocked, inaccessible, not completed, or only recorded?
- What should the customer do next?
- Can the customer save a PDF record?

### 3.3 Document Output

The PDF is the retained document copy.

It is for:

- archive
- attachment
- manager review
- landlord / insurance / corporate documentation requests
- print copy

It is not:

- an official inspection
- an NFPA approval
- a fire suppression service record
- a code compliance guarantee
- the whole product identity

### 3.4 Operational Generated Outputs

The same job record should also produce:

- invoice/payment proof summary
- follow-up quote copy
- revisit request copy
- next-service/rebook copy
- internal warning summary for missing proof, blocked access, condition-only
  records, or risky completion claims

Rule:
Do not add these as heavy manual sections. They should be auto-generated from
photos, confirmed result, coverage state, and closeout engine rules.

---

## 4. Current Implementation State

Relevant files:

- `frontend/src/components/axis1/packet-builder.tsx`
  - vendor input tool
  - local photo upload / role placement
  - result selection
  - customer link preview / PDF preview
  - currently blocks output until a job result is selected

- `frontend/src/components/axis1/customer-web-packet.tsx`
  - customer-facing web packet
  - should remain customer-readable
  - should not become the product's only center of gravity

- `frontend/src/components/axis1/packet-document.tsx`
  - PDF / service record rendering surface
  - should remain document-like and not become the primary product

- `frontend/src/lib/axis1-packet-builder.ts`
  - builds base packet data from form values
  - should be progressively subordinated to engine output

- `frontend/src/lib/axis1-field-photos.ts`
  - photo slots, adaptive record type, coverage helper

- `frontend/src/lib/axis1-closeout-engine.ts`
  - rule-based closeout engine
  - should become the authority for outcome, evidence basis, claim level, proof
    coverage, generated output readiness, CTA, and vendor warnings

- `frontend/src/lib/axis1-local-packet-store.ts`
  - browser-local packet persistence for the free/local preview
  - not a hosted production link model

Existing no-input lock must stay:

- output is blocked before a result is selected
- direct `?step=report` entry should not produce fake completed output
- sample defaults must not create phantom blocked/open items

---

## 5. Engine Policies

### 5.1 Outcome Cases

Current cases:

```ts
type Axis1CloseoutCase =
  | "needs_outcome"
  | "clean_closeout"
  | "access_exception"
  | "condition_review";
```

Needed next cases or states:

- `partial`
- `not_in_scope`
- `condition_only`
- mixed access + condition

### 5.2 Evidence Basis

Current basis:

- `no_photos`
  - output reads as written service record
  - no photo-proof claims

- `partial_photos`
  - output can mention attached photos
  - avoid before/after proof claims unless core before and after are present
  - describe photos as partial field support only

- `photo_record`
  - before/after core photos are attached
  - can use photo-supported service record language

### 5.3 Claim Level

Current claim levels:

- `written_record`
- `partial_photo_record`
- `photo_supported_record`

Needed:

- expose claim level more clearly in the report step
- show customer-friendly proof coverage in the customer link hero
- keep claim-limit language in PDF/document copy
- add vendor-only warnings when the claim is stronger than the proof basis

### 5.4 Compliance Safety

Never generate or imply:

- NFPA compliance approval
- fire marshal acceptance
- AHJ approval
- official inspection pass/fail
- fire suppression inspection coverage
- AI-verified cleaning completeness
- code compliance certificate

Safe language:

- service closeout record
- job proof packet
- field photos support the record
- recorded condition
- inaccessible area
- not completed area
- claim limit
- responsibility boundary

---

## 6. Product Gaps Identified by Review

### 6.1 Current Center Is Too Customer-Output Heavy

The current UI flow reads as:

```text
Photos -> Result -> Send customer link / Save evidence PDF
```

That is simple, but it can make Axis 1 feel like a customer report generator.
Vendor research points to a stronger buying reason:

```text
Photos -> Proof packet -> Get paid / defend scope / quote follow-up / rebook
```

The customer link and PDF stay important, but they are outputs of the packet,
not the product identity.

### 6.2 Missing Workflow After Proof

The current product is strong at proof and documentation. It is weaker at what
happens next for the vendor:

- pay invoice
- schedule next cleaning
- request revisit
- request quote
- leave review
- acknowledge receipt
- defend price
- defend missing or blocked proof
- attach concise proof to invoice/payment request

### 6.3 Missing First-Class CTA Model

Needed:

```ts
type Axis1CloseoutCtaKind =
  | "pay_invoice"
  | "schedule_next_cleaning"
  | "leave_review"
  | "reply_after_clearing_access"
  | "request_revisit"
  | "request_quote"
  | "confirm_next_service"
  | "confirm_received"
  | "download_pdf"
  | "attach_to_invoice"
  | "send_follow_up_quote"
  | "mark_customer_action_needed";
```

### 6.4 Missing Generated Output Model

Needed:

```ts
type Axis1GeneratedOutputKind =
  | "customer_link"
  | "evidence_pdf"
  | "invoice_proof_summary"
  | "follow_up_quote_copy"
  | "revisit_copy"
  | "next_service_copy"
  | "internal_risk_summary";

type Axis1GeneratedOutput = {
  kind: Axis1GeneratedOutputKind;
  label: string;
  readiness: "ready" | "needs_review" | "not_applicable";
  reason?: string;
  copy?: string;
};
```

### 6.5 Missing Proof Coverage Indicator

Recommended proof areas:

- Hood before
- Hood after
- Filter bank / tracks
- Access condition
- Rooftop fan
- Grease path / containment
- Service label / notice

State labels:

- captured
- not captured
- not applicable
- partial
- open

Rule:
Missing photos are not failure. They are explicit record state.

### 6.6 Missing Vendor Send-Readiness Warnings

The builder should privately warn the vendor when completion claims are stronger
than proof coverage.

Examples:

- `Fan proof missing. Confirm fan work was completed, not in scope, or blocked.`
- `Duct/access proof missing. Do not imply concealed path photo coverage.`
- `No field photos attached. This will generate a written service record.`
- `Condition-only record selected. No cleaning completion should be claimed.`

Customer/PDF copy should stay calmer:

- `Rooftop fan photo is not attached to this record.`
- `Duct/access coverage is recorded by service note only.`

---

## 7. P0 Implementation Plan

### P0-1. Reframe Builder Copy

Change product language so the vendor understands the job:

- `Start the closeout` -> `Build job proof packet`
- `Customer message` -> `Generated outputs`
- `Send` -> `Send / save / get paid`
- `Evidence PDF` remains document output, not the product identity

### P0-2. Add Structured CTA Model

Add CTA output to `Axis1CloseoutEngineResult`.

Example mapping:

- clean: Pay invoice, schedule next cleaning, leave review, download PDF
- blocked access: reply after clearing access, request revisit, download PDF
- condition review: request follow-up quote, confirm next service, download PDF
- partial/written record: confirm received, reply with questions, download PDF

### P0-3. Add Generated Output Readiness

Expose readiness for:

- customer link
- evidence PDF
- invoice proof summary
- follow-up quote copy
- revisit copy
- next-service copy
- internal risk summary

### P0-4. Add Link Field Draft

First pass fields:

```ts
type Axis1CloseoutLinks = {
  invoiceUrl?: string;
  paymentDueLabel?: string;
  reviewUrl?: string;
  nextServiceRequestUrl?: string;
  followUpQuoteUrl?: string;
  replyUrl?: string;
  quoteUrl?: string;
  customerPortalUrl?: string;
};
```

Do not add Stripe, QuickBooks, Jobber, ServiceTitan, or other deep integration
in this pass.

### P0-5. Add Proof Coverage Summary

Use `axis1-field-photos.ts` as the basis.

The engine should return:

```ts
type Axis1ProofCoverageItem = {
  id: string;
  label: string;
  state: "captured" | "not_captured" | "not_applicable" | "open";
  required: boolean;
  proofId?: string;
};

type Axis1ProofCoverageSummary = {
  capturedCount: number;
  recommendedCount: number;
  requiredOpenCount: number;
  label: string;
  items: Axis1ProofCoverageItem[];
};
```

Coverage must not imply compliance.

### P0-6. Inject Engine Output Into Packet Data

`applyAxis1CloseoutEngineToPacket()` should become the central adapter for:

- evidence basis
- claim limit
- responsibility boundary
- customer next action
- CTA set
- proof coverage label
- generated output cards
- vendor send-readiness warnings

Do not add separate UI-only derivations that disagree with the engine.

### P0-7. Update Report Step

The vendor should see:

- record type / claim level
- proof coverage
- primary customer CTA
- any claim downgrade
- generated invoice/payment, quote/revisit, and rebook copy readiness
- vendor-only warnings

The tool should not force the vendor into a heavy form.

---

## 8. Case Matrix

At minimum, document or test these cases:

- no input
- clean + no photos
- clean + after only
- clean + before/after
- clean + all recommended photos
- blocked-storage + no photos
- blocked-storage + access photo only
- sealed-panel + partial photos
- unsafe-access + no photos
- not-cleaned + partial photos
- panel-signage + no photos
- condition + quote
- condition + monitor
- condition + record-only
- condition + no photos
- access + condition mixed
- missing before
- missing after
- all optional marked not applicable
- service label not captured

Each case should assert:

- `canGeneratePacket`
- `caseType`
- `evidenceBasis`
- `claimLevel`
- `customerActionType`
- primary CTA
- generated output readiness
- proof coverage label
- vendor warning state
- `claimLimitCopy`
- `responsibilityCopy`
- no compliance overclaim

---

## 9. Acceptance Criteria

### 9.1 Vendor-Facing Acceptance

A hood vendor should feel:

- I can make a usable packet with photos and a few confirmations
- this is better than sending raw photos by text
- this helps us get paid and avoid "what did you do?" disputes
- this helps justify service scope beyond the visible hood
- this protects us when roof, fan, duct, access, cleanup, or photos are missing
- this can move customers toward payment, review, rebook, revisit, or quote

The vendor should not feel:

- this is a full FSM replacement
- this requires too much typing
- this is compliance theater
- this exposes us to overclaims
- this is only a customer-facing report
- I need to manually build multiple operational sections

### 9.2 Customer-Facing Acceptance

A restaurant/facility customer should understand within 5-10 seconds:

- whether the service was completed
- what evidence supports it
- what area stayed open, blocked, inaccessible, or recorded
- what they should do next
- where to save the PDF record

Clean jobs must not look like problem reports.
Blocked jobs must not hide the blocked area.
Condition jobs must not imply repair/inspection work was performed.

### 9.3 Safety Acceptance

The output must not:

- claim NFPA pass/fail
- claim official inspection coverage
- imply fire marshal approval
- imply concealed/inaccessible areas were cleaned
- imply missing photos are hidden
- use AI as authority for compliance or completeness

### 9.4 Engineering Acceptance

For each implementation pass:

- run `npm run lint`
- run `npm run build`
- verify clean / blocked / condition outputs differ
- verify result-before-output lock still works
- verify customer link and PDF share the same content truth
- verify generated outputs derive from the same engine/job record where
  implemented
- verify missing-proof warnings stay vendor-side and do not leak as alarming
  customer copy

---

## 10. Recommended Next-Session Scope

Do next:

1. Reword builder and report-step UI around "job proof packet", not customer
   message/PDF generation.
2. Add structured CTA model to `axis1-closeout-engine.ts`.
3. Add generated output readiness model.
4. Add link field type draft.
5. Add proof coverage summary to engine result.
6. Add vendor send-readiness warnings for risky gaps.
7. Inject CTA, generated outputs, warnings, and proof coverage into packet data.
8. Show proof coverage and primary CTA in `customer-web-packet.tsx` first
   viewport.
9. Show generated outputs, warnings, proof coverage, and primary CTA in
   `packet-builder.tsx` report step.
10. Run lint/build.
11. Browser-check clean, blocked access, condition review, and no-photo flows.

Defer:

- hosted DB/token route
- R2 photo storage
- deep payment integration
- full accounting/FSM integrations
- turning Quote Guard, Crew Proof, Payment Defense, or Rebook into manual forms

---

## 11. Fresh-Session Prompt

```text
Continue Axis 1 work in C:\Development\Owner\hood.

Read first:
- spec/15_axis1_builder_access_model.md
- spec/16_axis1_content_product_lock.md
- spec/19_axis1_adaptive_record_plan.md
- spec/21_axis1_closeout_workflow_lock.md
- spec/22_axis1_ai_photo_assist_provider_lock.md

Product definition:
Axis 1 is not a report builder, PDF generator, compliance certificate, or manual
field-service checklist.

Axis 1 is a minimal-input hood job proof packet generator for hood / kitchen
exhaust cleaning vendors.

Goal:
The vendor uploads field photos and confirms only the few risky or ambiguous
items. The system generates one structured job proof packet, then derives:
- customer link
- evidence PDF
- invoice/payment proof summary
- follow-up quote or revisit copy
- next-service/rebook copy
- vendor-only missing-proof / risky-claim warnings

Rules:
- Keep the vendor workflow minimal.
- Do not make vendors fill separate Quote Guard, Crew Proof, Payment Defense, or
  Rebook forms.
- AI may organize photos and flag uncertainty. It must not confirm completion,
  select final job result, decide claim level, or write customer-facing claims.
- Never use NFPA/pass/fail/fire marshal approval/official inspection certificate
  language.
- Output cannot be generated before result selection.
- Missing proof must be explicit record state.

Done criteria:
- clean, blocked, condition, and no-photo cases have distinct CTA and proof
  coverage behavior.
- report step shows generated output readiness and vendor-only warnings.
- customer first viewport clearly shows result, proof coverage, next action, and
  PDF record without internal warning noise.
```
