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

### 6.5 Next-step guidance
- recommended next service timing
- optional follow-up action note

---

## 7. Render structure
Locked block order:

1. vendor header
2. service summary
3. work completed
4. evidence block
5. observations and findings
6. inaccessible or unworked items
7. recommended next actions
8. next service timing
9. contact and rebook CTA
10. footer and disclaimer

---

## 8. Block definitions

## 8.1 Service summary
Must answer in the first screen:

- who serviced
- where
- when
- what the visit covered

## 8.2 Work completed
Must show structured scope, not only prose.

Format requirement:

- short bullet or row list
- clear completed or partial labeling

## 8.3 Evidence block
Must include:

- selected before and after evidence
- captioned context

Locked rule:
Do not dump every photo by default.
Curate for customer readability.

## 8.4 Observations and findings
Must differentiate:

- general observations
- deficiencies
- follow-up recommendations

Locked rule:
Severity must be visible but not alarmist.

## 8.5 Inaccessible or unworked items
This block is mandatory if applicable.

It exists to prevent:

- future disputes
- false assumptions of full coverage

## 8.6 Recommended next actions
Must answer:

- what should be addressed
- why
- how urgent it is

## 8.7 Next service timing
Must give a concrete next timing recommendation, not vague language.

Example style:

- recommended next service window
- reason for that interval

## 8.8 CTA
The brief must contain:

- vendor contact name
- reply or call path
- rebook invitation

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

## 10.3 No-login delivery
The customer-facing brief must be deliverable through:

- email body link to HTML
- attached or linked PDF

No portal login required.

---

## 11. Quality bar
Axis 1 is unacceptable if:

1. it reads like raw technician notes
2. the customer cannot tell what was done
3. inaccessible areas are hidden
4. findings are vague
5. next action is unclear
6. rebook CTA is weak or missing

---

## 12. MVP exclusions
Not required for MVP:

- customer accounts
- job history timeline portal
- customer self-serve dashboard
- complex approval workflow

