# 06 Acceptance Matrix

## 1. Purpose
This file defines the minimum ship bar for the hood MVP.

The MVP ships only when it is:

- structurally coherent
- commercially honest
- render-complete
- usable for a paid workflow

---

## 2. Strategy acceptance

### Pass conditions
- the project is clearly framed as vendor-facing B2B
- Axis 1 and Axis 2 are both represented as independent mains
- Austin-first but not Austin-only is reflected in the docs and build
- Texas multi-metro logic exists in the model and outbound assumptions

### Fail conditions
- the project reads like a generic hood blog
- the product still assumes Austin-only revenue
- Axis 2 is described as packet-only

---

## 3. Architecture acceptance

### Pass conditions
- browser-facing product pages are owned by `Next.js`
- Spring Boot owns APIs, data persistence, delivery records, and export truth
- new public work is not added to `JTE`
- the frontend-backend boundary is visible in the repository and build flow

### Fail conditions
- public pages still depend on a permanent JTE strategy
- business truth is duplicated between frontend and backend
- the migration leaves route ownership ambiguous

---

## 4. Axis 1 acceptance

### Pass conditions
- one vendor setup can be stored
- one Axis 1 job can be entered with structured data
- one Service Completion Brief preview exists
- the same brief exports to PDF
- the brief includes scope, evidence, findings, next actions, and CTA
- inaccessible or unworked areas are visible when present
- the customer link is treated as the primary premium output
- the PDF is treated as a tighter document copy, not a pixel-identical web screenshot
- the report answers: what happened, what system is covered, what proof exists,
  what stayed open, and what the customer should do next
- photo proof is curated and tied to named sections instead of shown as a raw gallery
- the first screen can be understood by a restaurant owner or manager without calling back

### Fail conditions
- the output is mostly raw notes
- the output is photo-only
- no clear next action exists
- no rebook or contact CTA exists
- the report implies blocked or inaccessible areas were cleaned
- the PDF prints builder chrome, drawers, toasts, or navigation
- the customer link and PDF roles are unclear to the vendor

---

## 5. Axis 2 acceptance

### Pass conditions
- opportunity signals can be stored with source, date, and score
- raw signals can be clustered into canonical opportunity projects
- exclusion rules are enforceable
- a 10-item trial batch can be created
- the batch is built from canonical projects, not duplicate raw rows
- batch items show trigger reason and hood relevance
- the first-touch packet preview exists
- the packet exports to PDF
- the batch can be delivered without login

### Fail conditions
- batch rows are generic business leads
- trigger explanations are missing
- freshness is not visible
- unsupported metros are not separated from active metros

---

## 6. Data acceptance

### Pass conditions
- Austin sources are documented and modeled
- source records preserve source URLs
- source records can map into a canonical deduped project layer
- scoring dimensions are stored on each signal
- final eligibility status is stored

### Locked batch QA gate
For paid trial inventory:

- `food_service_certainty_score >= 60`
- `hood_relevance_score >= 60`
- `freshness_score >= 85`
- `final_score >= 70`

### Fail conditions
- source provenance is missing
- signals cannot be audited later
- stale records enter a paid batch by default

---

## 7. Outbound acceptance

### Pass conditions
- vendor prospect records exist
- campaigns can be marked Axis 1 first or Axis 2 first
- Smartlead is the locked execution provider for cold email
- total daily send planning supports a ramp to `40/day` only after stability
- the stable send model supports `16 new / 24 follow-up`
- default metro mix reflects Austin metro, San Antonio metro, and DFW
- Axis 2 first positioning is gated by active coverage overlap
- outbound results can be analyzed by campaign, angle, and reply quality
- website CTA supports sample or reply

### Fail conditions
- no follow-up logic exists
- no segment-specific angle exists
- `40/day` is treated as an automatic day-1 assumption
- no results-analysis path exists after sending
- pricing is entirely hidden

---

## 8. Commercial honesty acceptance

### Pass conditions
- public pricing is shown as `starting at`
- Houston is not marketed as live Axis 2 coverage before activation
- sample masking rules are enforced
- demo watermark rules are enforced

### Fail conditions
- free demo gives away the full paid list
- unsupported geography is sold as active
- packet setup and list sale are described in misleading ways

---

## 9. Manual commerce acceptance

### Pass conditions
- a public inquiry can be turned into an internal commercial record
- an operator can record quote or order value
- payment status and fulfillment status are tracked separately
- Axis 1 and Axis 2 line items stay distinct inside the commercial flow
- delivered artifacts can be tied back to what was sold

### Fail conditions
- payment truth still lives only in inbox memory
- fulfillment starts with no order record
- a delivered packet or batch cannot be tied back to the sale
- Axis 1 and Axis 2 are merged into one fuzzy commercial item

---

## 10. Frontend migration acceptance

### Pass conditions
- the Next frontend builds successfully
- all MVP public routes exist in Next
- public metadata is controlled in Next
- public route cutover can happen without breaking the backend domain flow

### Fail conditions
- public route parity is missing
- the frontend cannot build for deployment
- the migration leaves the product in a half-owned browser state

---

## 11. MVP ship gate
The hood MVP is considered ready to enter real sales only when all of the following are true:

1. the anchor and spec set agree with each other
2. the locked frontend-backend architecture is reflected in the codebase
3. Axis 1 has one paid-ready preview and export path
4. Axis 2 has one paid-ready batch and packet path
5. pricing surface exists
6. no-login delivery exists
7. outbound assumptions no longer rely on Austin-only volume
8. outbound execution is externalized to Smartlead
9. outbound results can be read back into hood for analysis
