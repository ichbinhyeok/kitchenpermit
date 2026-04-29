# 19 Axis 1 Adaptive Record Plan

## 1. Purpose

Axis 1 must produce a premium customer link and PDF even when the vendor does
not provide a perfect photo set.

The product should not degrade into a weak-looking packet when the input is
thin. Instead, it should adapt the record format while staying honest about the
record basis.

Rule:
Weak input changes the evidence format, not the product quality.

---

## 2. Output Strategy

The customer-facing packet must keep:

- professional layout
- vendor branding when enabled
- clear service result
- clear next action
- clean PDF / service record formatting
- scope and limitation language

The packet may change:

- title
- section order
- photo emphasis
- comparison widgets
- record-basis wording
- coverage notes

Rule:
Never preserve a strong photo-proof layout by overclaiming what the photos show.

---

## 3. Record Types

Axis 1 should support these internal record types:

```ts
type Axis1RecordType =
  | "photo_proof_packet"
  | "after_cleaning_record"
  | "photo_supported_service_record"
  | "service_closeout_record"
  | "access_issue_record";
```

Customer-facing labels:

| Internal type | Customer label |
| --- | --- |
| `photo_proof_packet` | Photo Proof Packet |
| `after_cleaning_record` | After-Cleaning Service Record |
| `photo_supported_service_record` | Photo-Supported Service Record |
| `service_closeout_record` | Service Closeout Record |
| `access_issue_record` | Access Issue Record |

Rule:
Internal strength can vary. Customer-facing presentation should remain calm,
formal, and useful.

---

## 4. Record Type Selection

The builder should compute photo coverage after upload:

- total photo count
- hood before count
- hood after count
- filter / track photo count
- plenum / duct access photo count
- rooftop fan photo count
- grease path / containment photo count
- blocked / inaccessible photo count
- unclear or low-quality photo count

Suggested selection:

1. Use `photo_proof_packet` when before / after photos and multiple exhaust path
   components are represented.
2. Use `after_cleaning_record` when after photos exist but before comparison is
   absent or unreliable.
3. Use `photo_supported_service_record` when photos exist but coverage is
   partial.
4. Use `service_closeout_record` when no field photos are attached.
5. Use `access_issue_record` when the main customer value is documenting a
   blocked or inaccessible area.

Rule:
The vendor can override the suggested record type only within safe options
allowed by the attached evidence and confirmed service result.

---

## 5. Vendor Flow

The vendor-side flow should feel like a closeout checklist, not report writing.

### 5.1 Upload

Primary action:

- Drop today's job photos

Secondary action:

- Continue without photos

The product must allow no-photo and after-only cases.

### 5.2 Confirm Proof

AI or deterministic sorting should map photos into evidence slots:

- hood before
- hood after
- filters / track
- plenum / duct access
- rooftop fan / discharge
- grease path / containment
- blocked / inaccessible
- label / sticker
- other

Vendor actions:

- Looks right
- Fix roles
- Add more photos
- Exclude photo

### 5.3 Confirm Result

The vendor must explicitly confirm one result:

- Completed
- Completed with access note
- Access blocked
- Follow-up recommended

Rule:
AI may suggest a result, but the vendor must confirm the final service result.

### 5.4 Send

The builder generates:

- `/p/*` customer link
- `/exports/*` PDF service record

The customer action should be one primary action, not a menu of equal priorities.

---

## 6. AI Boundary

AI is useful for:

- photo role classification
- before / after / issue suggestions
- blocked or inaccessible visual hints
- low-quality photo warnings
- record type suggestion
- customer action suggestion

AI must not:

- confirm cleaning completion
- claim code compliance
- claim fire inspection coverage
- guarantee the full duct path was cleaned
- decide customer liability or vendor liability
- write unrestricted customer-facing legal or compliance language

Rule:
Customer-facing copy should come from templates. AI should produce structured
evidence suggestions.

---

## 7. Language Rules

Avoid weak or alarming customer-facing labels:

- Limited proof
- Missing photos
- Weak evidence
- No proof
- Incomplete packet

Use formal record language:

- Attached field photos
- Record basis
- Photo coverage note
- Service provider closeout
- Areas represented in this record
- Not photographed in this record

Rule:
Coverage gaps should read like professional scope notes, not product failures.

---

## 8. Output Behavior By Case

### 8.1 Strong photo set

Use the current premium proof packet pattern:

- first-screen result
- before / after proof
- system path coverage
- blocked item when present
- PDF service record

### 8.2 After-only photos

Use an after-cleaning record:

- hide before / after comparison widgets
- emphasize attached after-cleaning photos
- keep service result and next action prominent
- include a record-basis note that no before comparison is included

### 8.3 Hood-only photos

Use a photo-supported service record:

- show hood photos confidently
- avoid implying full photo coverage of fan or duct access
- keep system scope separate from photo coverage
- add formal notes for areas not photographed in this record

### 8.4 No photos

Use a service closeout record:

- remove proof gallery
- emphasize service summary, scope, closeout, next action, and PDF
- avoid "photo proof" language
- allow the vendor to send a professional written record

### 8.5 Blocked or inaccessible area

Use an access issue record:

- make the open item and customer action primary
- include blocked photos if attached
- if blocked photos are absent, use written access-note formatting
- separate completed work from the unresolved access item

---

## 9. Missing Coverage Handling

The builder should detect coverage gaps and keep them available for internal
review and formal notes:

- no before photo
- no after photo
- no duct access photo
- no rooftop fan photo
- no blocked-area photo despite access-blocked result
- no photos attached

Rule:
Coverage gaps should not create empty visual slots in the customer packet.
Show only useful sections and move record-basis notes into formal copy.

---

## 10. Thirty-Person Review

The following review assumes equal weight across personas.

### 10.1 Hood vendor owner

Positive: The plan protects premium presentation even when the crew forgets
photos.

Concern: The tool must not make the vendor think weak inputs are equally strong
evidence.

Required change: Show the vendor a private record-basis warning before send.

### 10.2 Field technician

Positive: Upload-first works with real field behavior.

Concern: Technicians may not know which area a photo represents after a long
night route.

Required change: Role fixing must be tap-based and fast.

### 10.3 Dispatch coordinator

Positive: Written closeout mode prevents support gaps when photos are absent.

Concern: Repeated customer / site entry will kill repeat use.

Required change: Save vendor defaults and repeat customer/site profiles.

### 10.4 Restaurant owner

Positive: A polished service record is still valuable without perfect photos.

Concern: If the first screen says too much about photo coverage, the customer
may focus on gaps.

Required change: First screen should stay result/action-first.

### 10.5 Restaurant GM

Positive: One next action reduces back-and-forth.

Concern: "Record type" wording may be too abstract.

Required change: Use simple customer titles and keep internal record logic
hidden.

### 10.6 Franchise facilities manager

Positive: Record-basis notes help internal filing.

Concern: Multiple store chains need consistent report metadata.

Required change: Report ID, location, date, technician, and vendor contact must
be mandatory or defaulted.

### 10.7 Insurance reviewer

Positive: A formal service record can support claim documentation better than
loose photos.

Concern: It must not imply official inspection or compliance approval.

Required change: Keep service evidence / service record language and avoid
certificate language.

### 10.8 Landlord / property manager

Positive: Access issue record is useful when tenant action is required.

Concern: Responsibility can still be unclear.

Required change: Customer action must name the next operational step without
assigning legal fault.

### 10.9 Fire-safety compliance reviewer

Positive: The AI boundary is correctly conservative.

Concern: "Exhaust system path" can overread as full-system verification.

Required change: Separate "service scope" from "photo coverage" in all modes.

### 10.10 SaaS UX designer

Positive: Adaptive record type is the right product abstraction.

Concern: Exposing too many modes will confuse vendors.

Required change: The UI should say "We picked the best format" rather than make
record type feel like a required decision.

### 10.11 Mobile UX designer

Positive: Upload-first and tap confirmation are mobile-friendly.

Concern: Drag-and-drop is weak on mobile.

Required change: Mobile role fixes should use bottom sheet selectors, not only
dragging.

### 10.12 Enterprise product designer

Positive: Professional record language is stronger than apologetic language.

Concern: Empty states can still look like missing product.

Required change: Do not render empty proof slots in the output.

### 10.13 AI product manager

Positive: AI as evidence organizer is the right boundary.

Concern: Record type recommendations need transparent reasons for vendors.

Required change: Show "why this format" privately in the builder.

### 10.14 AI engineer

Positive: Structured outputs are feasible and cheap.

Concern: Confidence scores can be misleading.

Required change: Use rule-based review triggers in addition to model
confidence.

### 10.15 QA engineer

Positive: The plan defines real edge cases.

Concern: Output branching can regress PDF layout.

Required change: Add fixtures for strong, after-only, hood-only, no-photo, and
blocked-only cases.

### 10.16 Frontend engineer

Positive: The plan can fit the existing packet data model.

Concern: Too many conditional sections can create brittle UI.

Required change: Centralize record type behavior in one formatter layer.

### 10.17 Backend engineer

Positive: The structured model is practical.

Concern: Current local photo storage is not enough for real delivery.

Required change: Paid path needs hosted image storage, retention rules, and
stable packet records.

### 10.18 Security / privacy reviewer

Positive: The plan recognizes photos as sensitive data.

Concern: AI image transfer and retention need clear policy.

Required change: Add deletion, retention, and third-party AI processing
language before paid use.

### 10.19 Legal reviewer

Positive: The wording rules lower overclaim risk.

Concern: Vendor override could still create risky claims.

Required change: Lock official inspection, compliance, and certification terms
behind blocked copy rules.

### 10.20 Customer support lead

Positive: One-action output should reduce explanation calls.

Concern: If photo coverage notes are too hidden, customers may still ask.

Required change: Put record-basis notes in a visible but secondary section.

### 10.21 Sales operator

Positive: "Works even when photos are imperfect" is a strong sales angle.

Concern: Do not sell it as AI magic.

Required change: Sell as faster closeout and cleaner customer proof, with AI as
supporting automation.

### 10.22 Pricing strategist

Positive: Adaptive records increase perceived reliability.

Concern: AI alone will not justify price.

Required change: Price around branding, hosted links, PDF records, history, and
faster customer communication.

### 10.23 Growth marketer

Positive: The before / after strong sample is still needed for demos.

Concern: Demos should not hide that weaker inputs still produce usable records.

Required change: Add sample variants after the main strong sample is locked.

### 10.24 Cold-email recipient

Positive: A strong sample link can earn attention.

Concern: "AI" may feel generic.

Required change: Email should show the final customer artifact first, not the
builder.

### 10.25 Small business owner

Positive: No-photo flow reduces fear of using the tool.

Concern: Too many safety notes may feel bureaucratic.

Required change: Keep vendor workflow plain and operational.

### 10.26 Mid-market service company

Positive: Standardized records can improve brand consistency.

Concern: Multi-crew usage needs saved templates and permissions.

Required change: Future paid version should support crew defaults and reusable
company settings.

### 10.27 Mixed-service vendor

Positive: The record-type concept can extend beyond hood cleaning.

Concern: Current labels are hood-specific.

Required change: Keep the architecture generic enough for additional service
verticals later.

### 10.28 Data analyst

Positive: The plan creates useful correction data.

Concern: If corrections are not logged, AI improvement stalls.

Required change: Store AI suggestion versus vendor-confirmed final values.

### 10.29 Founder / CEO reviewer

Positive: The plan protects the core promise: premium output with low input.

Concern: Scope creep is real.

Required change: Ship first with deterministic fallback and one AI model path,
then add more modes only after QA fixtures pass.

### 10.30 Skeptical buyer

Positive: A professional record is clearly better than texting loose photos.

Concern: The value depends on whether it saves real customer explanation time.

Required change: Pilot messaging should ask vendors to measure fewer reply
loops or faster customer closeout, not claim unproven reductions.

---

## 11. Review Verdict

Score: 8.6 / 10.

The direction is strong because it separates product quality from evidence
strength. This protects the premium packet while avoiding overclaiming when
photos are incomplete.

The plan reaches 9+ only if these items are implemented:

1. record type behavior is centralized
2. missing coverage never creates ugly customer-facing empty slots
3. vendor result confirmation is mandatory
4. AI suggestions and vendor confirmations are stored separately
5. strong, after-only, hood-only, no-photo, and blocked-only fixtures are tested
6. customer-facing copy never says certificate, compliance, inspection approval,
   or full-system verification unless the vendor has a separate official basis

Rule:
The winning product is not an AI photo sorter. It is a premium closeout record
system that adapts to the evidence available.
