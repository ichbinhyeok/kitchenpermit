# 03 Axis 1 Service Completion Brief

## 1. Product role
Axis 1 is the existing-customer communication product.

It is not a generic report generator.
It is a productized service artifact that should help a hood vendor:

- prove work
- explain findings
- reduce confusion
- rebook service
- create room for follow-up work

---

## 2. Audience

### 2.1 Buyer
Hood vendor

### 2.2 Reader
Restaurant owner, manager, or operator

### 2.3 Internal user
Vendor office staff who need a clean outward-facing artifact without dumping raw technician notes into customer communication

---

## 3. Commercial promise
The vendor should feel:

`I can send this to a customer today without rewriting it`

The customer should feel:

`I understand what happened, what matters, and what to do next`

Immediate revenue lock:
Axis 1 is not sold first as records software or customer-management software.
It is sold first as a same-day service report that:

- reduces explanation calls
- makes premium work feel premium
- keeps blocked or incomplete areas defensible
- gives the customer one clear next step

Small-vendor premiumization lock:
The product should let a small hood vendor look organized like a larger premium operator without
forcing them to buy or maintain a full customer portal.

The packet should package what the vendor already has to send anyway:

- what was cleaned
- which components were covered
- which photos prove the work
- which section remained blocked or open
- which label or notice was posted
- what the customer should do next
- what should stay in the customer's kitchen service records

The value is speed plus polish:
the vendor enters or selects the job facts once, and the customer receives a report that feels
structured, branded, and serious.

---

## 4. Locked MVP rule
Axis 1 must be product-grade at launch.

That means:

- not just a template mock
- not just a PDF shell
- not just a photo gallery

It must render a clear, customer-usable brief from structured data.

---

## 5. Setup fields
Axis 1 setup uses the shared `VendorSetupProfile`, plus the following product-specific optional fields:

- standard greeting line
- standard closing line
- standard next-service explanation
- disclaimer text
- default severity language style
- preferred CTA label
- technician certification or registration display fields
- emergency or after-hours phone
- service-label or site-notice policy text
- default review or feedback link

---

## 6. Required job input

### 6.1 Visit basics
- site name
- site address
- service date
- crew label
- contact or manager name

### 6.2 Work scope
- what systems or areas were serviced
- what was completed
- what was partial
- what was not completed
- what was inaccessible

### 6.3 Observations
- visible condition notes
- deficiencies
- follow-up recommendations

### 6.4 Evidence
- before photos
- after photos
- optional reference photos

Locked evidence rule:
Photo proof should be tied to named system sections, not dumped as an unstructured gallery.

### 6.5 Compliance and record detail
- one packet = one system identifier
- service result status
- authorized by or site contact
- technician name
- technician certification or registration number if applicable
- service label or site notice status
- label or notice identifier when applicable
- recommended cleaning frequency basis
- whether AHJ or authority notification is required
- sign-off or acknowledgement path
- accessible scope basis
- areas represented as cleaned versus inaccessible
- deficiency record status
- record-retention note

### 6.6 Next-step guidance
- recommended next service timing
- optional follow-up action note
- optional repair or maintenance recommendation

---

## 7. Render structure
Locked block order:

1. vendor header
2. system identity and service result
3. customer summary
4. work completed
5. route or section map
6. component status matrix
7. photo coverage checklist
8. evidence block
9. structured observations, deficiencies, and recommendations
10. inaccessible or unworked items
11. recommended next actions
12. next service timing and interval basis
13. sign-off, label, acknowledgement, and delivery record
14. footer and disclaimer

Locked render rule:
The first screen must work for a busy owner or manager.
The lower document must still hold enough detail for office follow-up, facilities review, and
inspection defense.

---

## 8. Block definitions

## 8.1 System identity and service result
Must answer early in the packet:

- which system this packet covers
- who serviced
- where
- when
- whether service was completed, partial, or exception-based

Locked rule:
Axis 1 should remain `one packet / one system`.
Multi-system sites should create multiple packets, not one blended artifact.

## 8.2 Customer summary
Must answer in the first screen:

- what was completed
- what needs attention
- what the customer should do next
- when the next service is recommended

Locked rule:
This layer should read in plain English before the packet drops into denser operational detail.

## 8.3 Work completed
Must show structured scope, not only prose.

Format requirement:

- short bullet or row list
- clear completed or partial labeling
- reviewed or recorded states only when the wording is customer-readable

## 8.4 Route or section map
Must show the hood-to-duct-to-fan path or equivalent section structure.

Why:

- proves packet discipline
- makes photo proof easier to understand
- creates cleaner follow-up discussion for access and repair items

## 8.5 Evidence block
Must include:

- selected before and after evidence
- captioned context
- system-section reference
- enough coverage to defend the work performed
- rooftop fan and grease-containment context when available
- access-panel or blocked-access proof when an exception exists
- service-label or site-notice proof when available

Locked rule:
Do not dump every photo by default.
Curate for customer readability.

Differentiate between:

- customer-facing curated proof
- internal full archive retained separately

## 8.5.1 Component status matrix
The packet must include a compact matrix that looks like what a serious hood company would track:

- component
- status
- proof reference
- plain-language note

Minimum components:

- hood canopy
- baffle filters
- plenum or reachable duct path
- access panel or blocked access
- rooftop fan or hinge line
- grease containment or drip path

Why:
Small vendors often have the work and photos, but not a polished structure.
This matrix turns ordinary job facts into a premium-looking operating record.

## 8.5.2 Photo coverage checklist
The packet must show that proof coverage exists before the customer asks.

Minimum coverage:

- before hood interior
- after hood interior
- filter bank reset
- access condition
- rooftop fan area
- grease removed or containment path
- service label or exception notice
- full raw archive retained

Locked rule:
This is a coverage checklist, not a photo dump.
The customer sees enough to trust the service while the vendor retains the full archive.

## 8.6 Observations and findings
Must differentiate:

- general observations
- deficiencies
- follow-up recommendations

Locked rule:
Severity must be visible but not alarmist.

Deficiency coverage should be capable of expressing at least these recurring categories:

- blocked access
- non-conforming or missing filters
- hinge or access-panel problems
- grease containment or roof condition issues
- leaks or liquid-tight issues
- fan, louver, belt, or pulley issues
- wash-system or operational issues

### 8.6.1 Exception taxonomy v2
Axis 1 should treat most jobs as standard close-outs and only expand packet depth when an exception
or recorded condition exists.

The minimum grouped taxonomy is:

- `Access / incomplete cleaning`
- `Rooftop / condition review`

The minimum MVP options under those groups are:

- storage block
- sealed panel
- panel or signage issue
- unsafe access
- section left open / not cleaned
- fan hinge or curb condition
- belt or pulley condition
- liquid-tight concern
- grease containment or drip-path review

Locked rule:
The builder should capture these as quick selections first, not long free-text writing.
The packet should then translate them into customer-readable language automatically.

## 8.7 Inaccessible or unworked items
This block is mandatory if applicable.

It exists to prevent:

- future disputes
- false assumptions of full coverage

Locked rule:
If a section is not cleaned, inspected, or photo-documented, the reason should be visible in common
language.

Field-readiness lock:
The packet must not imply that concealed, blocked, or inaccessible portions were cleaned.
Use explicit language such as:

- accessible sections cleaned
- access blocked
- not represented as cleaned
- repair or separate trade not included

This is not legal drafting.
It is operational clarity that prevents customer confusion and protects the vendor from overclaiming.

## 8.8 Recommended next actions
Must answer:

- what should be addressed
- why
- how urgent it is
- who should respond next when that is clear

## 8.9 Next service timing
Must give a concrete next timing recommendation, not vague language.

Example style:

- recommended next service window
- reason for that interval

## 8.10 Sign-off, label, and delivery record
Must contain:

- technician identity
- vendor company identity
- service label or site-notice status
- signature or acknowledgement block
- delivery path or record note
- what should be kept with kitchen service records
- whether the full photo archive is retained separately
- whether a deficiency record exists
- whether fire suppression inspection or repair work is outside scope
- site contact or on-site acknowledgement status
- customer action and vendor action
- record location

Locked rule:
This block should make the packet feel official without turning it into a dead government form.

## 8.11 CTA
The brief must contain:

- vendor contact name
- reply or call path
- rebook invitation

Differentiate from incumbents:

- not only "call us if needed"
- also point toward rebook, repair follow-up, or access-clearing next step

---

## 9. Internal versus external split
MVP lock:

- customer-facing brief is a first-class output
- internal deficiency notes can exist in the same job record
- raw internal notes are not automatically rendered to the customer-facing document

Locked commercial rule:
The internal deficiency layer is not sold as a standalone SKU in MVP.

---

## 10. Rendering rules

## 10.1 HTML
HTML is the canonical version.

Requirements:

- mobile-readable
- printable
- strong visual hierarchy
- direct photo viewing

## 10.2 PDF
PDF is the export artifact.

Requirements:

- same narrative order as HTML
- stable pagination
- vendor branding preserved
- photo proof remains legible
- sign-off and inaccessible-item logic do not break across pages

## 10.3 No-login delivery
The customer-facing brief must be deliverable through:

- email body link to HTML
- attached or linked PDF

No portal login required.

---

## 10.4 Field realism lock
The MVP report must feel like it understands kitchen exhaust work, not generic field service.

Required industry-shaped content:

- hood, filter, plenum, duct, fan, access, and grease-containment vocabulary
- before and after proof tied to named sections
- access or incomplete-cleaning language
- service label or notice status
- recommended interval basis
- deficiency categories that vendors actually quote or revisit
- clear separation between cleaning, repair, and fire-suppression inspection

The first screen should answer the customer.
The lower document should help the vendor, facilities reviewer, landlord, or AHJ-facing record trail.

Locked rule:
Do not lead with compliance theatre.
Lead with a clear service result, then preserve enough structured detail to make the report defensible.

---

## 11. Quality bar
Axis 1 is unacceptable if:

1. it reads like raw technician notes
2. the customer cannot tell what was done
3. inaccessible areas are hidden
4. findings are vague
5. next action is unclear
6. rebook CTA is weak or missing
7. the packet looks like a generic compliance form with no brand value
8. the packet looks like a marketing brochure with weak operational proof

---

## 12. MVP exclusions
Not required for MVP:

- customer accounts
- job history timeline portal
- customer self-serve dashboard
- complex approval workflow
