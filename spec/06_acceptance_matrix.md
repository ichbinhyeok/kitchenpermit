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

## 3. Axis 1 acceptance

### Pass conditions
- one vendor setup can be stored
- one Axis 1 job can be entered with structured data
- one Service Completion Brief renders to HTML
- the same brief exports to PDF
- the brief includes scope, evidence, findings, next actions, and CTA
- inaccessible or unworked areas are visible when present

### Fail conditions
- the output is mostly raw notes
- the output is photo-only
- no clear next action exists
- no rebook or contact CTA exists

---

## 4. Axis 2 acceptance

### Pass conditions
- opportunity signals can be stored with source, date, and score
- raw signals can be clustered into canonical opportunity projects
- exclusion rules are enforceable
- a 10-item trial batch can be created
- the batch is built from canonical projects, not duplicate raw rows
- batch items show trigger reason and hood relevance
- the first-touch packet renders to HTML
- the packet exports to PDF
- the batch can be delivered without login

### Fail conditions
- batch rows are generic business leads
- trigger explanations are missing
- freshness is not visible
- unsupported metros are not separated from active metros

---

## 5. Data acceptance

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

## 6. Outbound acceptance

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

## 7. Commercial honesty acceptance

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

## 8. MVP ship gate
The hood MVP is considered ready to enter real sales only when all of the following are true:

1. the anchor and spec set agree with each other
2. Axis 1 has one paid-ready render path
3. Axis 2 has one paid-ready batch path
4. pricing surface exists
5. no-login delivery exists
6. outbound assumptions no longer rely on Austin-only volume
7. outbound execution is externalized to Smartlead
8. outbound results can be read back into hood for analysis
