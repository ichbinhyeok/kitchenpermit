# 16 Axis 1 Vendor Proof Packet Content Lock

## 1. Purpose
This document locks the product-grade content contract for Axis 1.

Axis 1 is not a prettier inspection form.
Axis 1 is not primarily a customer-facing report product.
Axis 1 is the vendor-side proof packet generator that turns minimal field input
into defensible outputs a hood vendor can use to get paid, reduce disputes,
justify scope, and keep the next service moving.

Locked product sentence:
`Minimal vendor input in, defensible hood job proof packet out.`

The customer link and PDF are generated outputs. The product's first source of
truth is the vendor job record: what was claimed, what was photographed, what was
not photographed, what was blocked, what needs customer action, and what should
happen next.

---

## 2. What is already locked

### 2.1 Product role
Axis 1 is the existing-customer product.

It sells because it helps the vendor:

- avoid writing a report from scratch after a night route
- organize raw phone photos into named hood, duct, fan, roof, grease, and access
  proof
- avoid overclaiming completion when photos or access are missing
- defend price against cheap hood-wiper comparisons
- defend blocked access, incomplete scope, pre-existing conditions, and cleanup
  disputes
- attach a concise proof summary to invoice, payment, rebook, revisit, or quote
  follow-up
- look like a more organized premium operator without adopting a full FSM

It is not sold first as:

- CRM
- customer portal
- generic report generator
- compliance theatre
- job-history software
- manual checklist software
- AI completion judge

### 2.2 Primary output
The primary product object is the structured vendor job record / proof packet.
The primary customer-facing output is the hosted customer link.

Locked interpretation:

- the job record is the content truth
- the link is the customer-readable closeout surface
- the PDF is the retained record, attachment, archive, and print copy
- invoice, payment, quote, and rebook messages may be generated from the same
  job record
- the two outputs share content and brand identity, but do not need to be
  pixel-identical

Rule:
Do not optimize only for a beautiful customer document. Optimize for the vendor
being able to safely send, attach, charge, rebook, and defend the job with almost
no extra typing.

### 2.3 Free versus paid boundary
The free builder proves the packet shape.
The paid unlock makes it operationally usable.

Free:

- neutral customer report preview
- local photo preview
- local print/save PDF
- no-login
- no server persistence

Paid/setup:

- vendor branding
- customer link generation
- server persistence
- saved history
- direct vendor CTA
- cross-browser reopen
- branded PDF/export

### 2.4 Infrastructure boundary
Hosted customer links require server storage.

Locked MVP storage:

- SQLite for report metadata, tokens, status, and JSON
- Cloudflare R2 for normalized report photos and future PDF artifacts
- CSV only for import/export and manual ops exchange

---

## 3. Content job
Every Axis 1 proof packet must answer five vendor questions fast before it
answers the customer reader.

Vendor questions:

1. What can we safely claim was done?
2. What proof supports that claim?
3. What is missing, blocked, not applicable, or only written down?
4. What customer action, payment action, quote path, or rebook path should this
   create?
5. Is there anything risky about sending this as completed?

The generated customer link/PDF must then answer five customer questions fast.

1. What happened today?
2. What system or area does this report cover?
3. What proof supports the work?
4. What stayed open, blocked, or outside scope?
5. What should the customer do next?

If a customer needs to call the vendor just to understand the report, the report
failed.

If a vendor needs to manually compose the proof packet from scratch, the product
failed.

---

## 4. Reader model

### 4.1 Vendor user
The vendor user is busy.

They should not need to write a report.
They should upload the photos they have, confirm the result, review only the
ambiguous or risky items, and change only the lines that sound wrong.

Their mental model is:

`photos in -> system organizes -> I confirm the few risky things -> send/save/get paid/rebook`

They should not be asked to manually build Quote Guard, Crew Proof, Payment
Defense, or Rebook sections. Those are internal interpretations generated from
the same minimal input.

### 4.2 Customer reader
The customer reader is not a hood technician.

They need:

- clear service result
- plain-English next step
- enough proof to trust the work
- visible explanation for inaccessible or unworked areas
- a record they can keep for kitchen/service files

### 4.3 Facilities or office reviewer
The lower report must still be useful for someone reviewing records later.

They need:

- component status matrix
- coverage checklist
- photo references
- label or notice status
- retained archive note
- cleaning versus repair versus fire-suppression scope separation

---

## 5. Report content hierarchy

The customer link should lead with the human-readable layer, then support it
with operational proof. This hierarchy applies to generated customer output, not
the whole product identity.

Locked order:

1. vendor identity
2. service result
3. site, system, date, and authorized-by facts
4. customer summary
5. customer action
6. next service window and basis
7. component status matrix
8. photo coverage checklist
9. curated photo proof
10. recorded conditions or exceptions
11. inaccessible or unworked scope
12. label, acknowledgement, archive, and record trail
13. vendor contact or rebook CTA

Do not lead with a long checklist.
Do not lead with a photo dump.
Do not lead with legal or compliance language.

Vendor-side builder hierarchy is different:

1. job/site basics when not already known
2. photos or written record basis
3. AI photo organization suggestions
4. risky gaps and ambiguous items only
5. result confirmation
6. generated outputs: customer link, PDF, invoice proof, quote/revisit copy,
   next-service copy

---

## 6. First-screen lock
The first visible screen must be understandable in under 10 seconds.

It must show:

- completed, partial, or exception service result
- customer/site identity
- system identity
- next customer action
- next service timing
- proof status

It should not show:

- internal technician shorthand
- long deficiency paragraphs
- raw notes
- unstructured galleries
- multiple competing CTAs

---

## 7. Standard job content
For a normal completed job, the report should stay short and confident.

Required content:

- what accessible sections were serviced
- proof coverage status
- customer-readable closeout sentence
- next service window
- retained archive note
- vendor reply or rebook path

Avoid:

- overexplaining routine work
- forcing deficiency fields
- making the customer feel there is a problem when the job is clean

Locked rule:
Most reports should not feel like exception reports.

---

## 8. Exception job content
When an exception exists, the report must be direct without sounding alarmist.

Required content:

- what was completed
- what stayed blocked, inaccessible, open, or outside scope
- why it matters
- what the customer should do next
- whether vendor follow-up, access clearing, repair quote, or watch status is
  appropriate

Preferred language:

- `recorded condition`
- `access remained blocked`
- `not represented as cleaned`
- `customer action needed before next service`
- `separate repair or inspection may be needed`

Avoid:

- vague `issue found`
- alarmist severity wording
- implying repairs are part of cleaning
- implying fire-suppression inspection was completed
- hiding unresolved access below photos

---

## 9. Photo content lock
Photos are proof, not decoration.

Required treatment:

- customer-facing report shows curated proof only
- each shown photo has a role and section reference
- coverage checklist appears before the long proof area
- full raw photo archive is referenced as retained separately
- missing photos are not silently replaced with sample images
- intentionally not captured or not applicable slots stay out of customer proof

Preferred proof roles:

- before hood interior
- after hood interior
- filter bank reset
- access or exception condition
- rooftop fan or hinge line
- grease removed or containment path
- service label or notice

Mobile intake rule:
On phones, assume users pick files from the camera roll or file picker.
Drag behavior is a desktop enhancement, not the primary mobile mental model.

---

## 10. Component matrix lock
The component matrix is a core differentiator.

It should make a small vendor look operationally mature without exposing raw
technician mess.

Minimum rows:

- hood canopy
- baffle filters
- plenum or reachable duct path
- access panel or blocked access
- rooftop fan or hinge line
- grease containment or drip path

Each row should have:

- component
- status
- proof reference
- plain-English note

---

## 11. Customer language rules
The report should use customer-readable language first and technical references
second.

Good pattern:
`Accessible hood interior surfaces were cleaned and wiped. See P-01 and P-02.`

Bad pattern:
`H1 canopy/plenum complete per tech note.`

Required tone:

- direct
- calm
- specific
- defensible
- not legalistic
- not salesy

No raw technician notes should be copied directly into the customer report.

---

## 12. CTA lock
Every report needs one clear next path.

Possible CTA types:

- rebook next cleaning
- clear access before next visit
- request follow-up quote
- reply with questions
- keep report with kitchen service records

Locked rule:
The CTA must match the job state.

Do not show a generic `contact us` CTA when the report knows a more specific
next action.

---

## 13. PDF content lock
PDF is not the premium browsing surface.
PDF is the document copy.

PDF must:

- preserve the same content truth as the customer link
- fit a tighter Letter-style layout
- avoid printing builder chrome, drawers, toasts, headers, or footers
- keep page breaks stable
- keep photos legible
- keep sign-off and exception blocks intact

PDF may:

- use denser columns
- shorten vertical whitespace
- reflow sections differently from the web link

Locked rule:
Do not judge PDF success by whether it looks exactly like the browser preview.
Judge it by whether it feels like a real packet a vendor can attach, archive, or
print.

---

## 14. Content acceptance bar
Axis 1 content is product-grade only if all of these are true:

- a vendor can understand what to send without training
- a restaurant customer can understand the report without calling back
- completed work, partial work, and inaccessible scope are not confused
- photos support named sections instead of acting like a gallery
- the report makes the vendor look more premium, not more bureaucratic
- the CTA is job-specific
- the PDF is a real document copy, not a broken printed webpage
- the free layer proves value without giving away paid branding and persistence
- the vendor can make a usable packet from phone-photo filenames such as
  `IMG_1234`
- AI never marks a component completed solely because a photo resembles that
  component
- missing photos create explicit record state, not hidden failure or fake proof
- the same job record can support customer link, PDF, invoice attachment,
  follow-up quote, and next-service message

### 14.1 Pivot persona checks

The following persona checks are now part of the content lock:

| Persona | Must feel | Must not feel |
| --- | --- | --- |
| Hood vendor owner | This protects margin, payment, and reputation | This is just a prettier customer report |
| Night crew lead | I only confirm the few things the app could not know | I am filling a long office form at 2 a.m. |
| Dispatcher / office admin | I can close the job and send the right artifact quickly | I am rewriting technician notes |
| Price-sensitive restaurant owner | I can see why this was more than a quick canopy wipe | I am being sold a fake compliance certificate |
| Facilities / franchise reviewer | I can retain a clear service record | The vendor is overclaiming inspection approval |
| Insurance / AHJ-adjacent reviewer | The record separates service facts from approvals | The PDF pretends to be an official pass/fail |
| Skeptical buyer | This reduces disputes and unpaid follow-up time | This is a photo album with branding |
| AI skeptic | The vendor stays in control of claims | The AI decides the job was completed |

---

## 15. What is not locked yet
The following are intentionally not final:

- exact paid setup price packaging beyond the current starting-price anchors
- full backend customer-link implementation
- final branded vendor onboarding flow
- full PDF compression presets
- long-term customer history UX
- Axis 2 packet content depth

These should not block the Axis 1 content contract.

---

## 16. Final lock
The Axis 1 content product is locked as:

`vendor job record first, generated outputs second, structured proof always, raw notes never.`

The next implementation work should preserve the minimal-input promise while
making every output more useful for vendor margin protection, dispute defense,
payment, quote/revisit follow-up, and rebooking.
