# 00 Strategy

## 1. One-line thesis
`hood` is a B2B product for commercial kitchen exhaust vendors.

It sells two independent product lines:

- `Axis 1`: existing-customer communication packet
- `Axis 2`: new-sales opportunity list plus the first-touch packet used against that list

The broader product worldview also includes:

- `Axis 2.5`: selling the right, slot, or exclusivity on qualified demand after Axis 2 is validated
- `Axis 3`: a future B2C recovery layer that reuses selected Axis 2 segments after a time gap

Locked scope rule:
The current MVP revenue lines are still `Axis 1` and `Axis 2`.

The project wins if a small hood vendor says:

`this helps me close, explain, and rebook work better than the loose docs and ad hoc lists I use now`

---

## 2. Why this vertical works

### 2.1 Axis 1 has real money logic
Hood vendors repeatedly need to explain:

- what was done
- what was not done
- what was observed
- what should happen next

That explanation affects:

- trust
- rebook rate
- acceptance of follow-up work
- reduction of disputes and confusion

So Axis 1 is not a "nice report".
It is a revenue and retention artifact.

Locked competitive view:
Axis 1 should absorb the compliance and proof discipline seen in real hood-cleaning reports,
but win by being more readable, more sendable, and more revenue-linked than the incumbent
after-service report and photo-dump pattern.

### 2.2 Axis 2 has real outbound logic
Hood vendors do better when outreach is tied to a live signal:

- restaurant remodel
- finish-out
- change of use to food service
- opening-like activation
- kitchen equipment or hood-relevant commercial work

Axis 2 therefore is not generic lead gen.
It is signal-led outbound.

---

## 3. Direct customer and non-customer

### 3.1 Direct customer
The direct customer is the `hood vendor`.

Primary profile:

- local or regional operator
- owner-led or small-office-led
- weak documentation stack
- weak sales enablement stack
- wants actual revenue, not software theory

### 3.2 End reader but not buyer
The restaurant owner, manager, or operator is an end reader of Axis 1 and a target of Axis 2 outreach, but is not the direct customer of this product.

### 3.3 Deprioritized customer
- large national chains with mature portals
- enterprise field-service orgs with strong internal tooling
- broad janitorial or generic cleaning firms without a focused hood offer

---

## 4. Product axes

## 4.1 Axis 1
`Service Completion Brief`

Purpose:

- prove work clearly
- document observed issues
- drive rebook and follow-up acceptance

### 4.2 Axis 2
`Sales List + First-Touch Packet`

Purpose:

- give the vendor live prospects with real timing signals
- help the vendor turn those signals into usable first outreach

Important hierarchy:

- list = main hook
- packet = conversion aid

### 4.3 Relationship between axes
Axis 1 and Axis 2 can be sold together, but they are not one product.

Rules:

- both are main products
- either can be sold alone
- outbound weighting does not define product hierarchy

### 4.4 Axis 2.5
`Right / Slot / Exclusivity Layer`

Purpose:

- raise margin after Axis 2 quality is proven
- shift from "here is a list" to "here is the right to receive or control qualified demand"

Locked rule:
Axis 2.5 is a future commercial layer, not a current MVP build target.

### 4.5 Axis 3
`Future B2C Recovery Layer`

Purpose:

- recover selected demand on a separate B2C domain
- build long-term trust and compounding lead assets

Locked rules:

- Axis 3 is not the MVP cash engine
- Axis 2 inventory is used for B2B first
- only selected segments may later be reused for B2C after a time gap

### 4.6 Scope boundary
The product worldview includes Axis 2.5 and Axis 3,
but the current implementation scope stays centered on Axis 1 and Axis 2.

---

## 5. Market scope

### 5.1 Locked geographic position
`Austin-first` is locked.
`Austin-only` is rejected.

### 5.2 Operational geography by layer

#### Axis 1 sales geography
Axis 1 can be sold across the broader Texas target market from the beginning because it does not require a city-specific public-signal pipeline to function.

#### Axis 2 fulfillment geography
Axis 2 can only be sold where the signal pipeline is active and passes QA.

#### Axis 2 offer gating
The `Axis 2 first` outbound angle can only be used by default when the vendor service area overlaps an `active Axis 2 coverage metro`.

If that overlap does not exist:

- the vendor can still be prospected
- the default offer must switch to `Axis 1 first`
- the outreach must not imply that live Axis 2 inventory already exists for that vendor's market

### 5.3 Locked metro rollout

#### Commercial prospecting range
- Austin metro
- San Antonio metro
- DFW

#### Axis 2 data rollout order
1. Austin
2. San Antonio
3. DFW
4. Houston only after source QA passes

#### MVP active coverage for Axis 2
At MVP launch, the only guaranteed active Axis 2 coverage metro is:

- Austin

San Antonio and DFW remain prospectable vendor markets, but should not receive default `Axis 2 first` positioning until their coverage status becomes active.

### 5.4 Why Houston is deferred
Houston is commercially relevant, but the MVP should not promise an active Axis 2 pipeline there until source quality, extraction reliability, and freshness can be maintained.

---

## 6. Strategic rules

1. Do not turn this into a generic hood information site.
2. Do not start with login-dependent delivery.
3. Do not start with dashboard-first UX.
4. Do not treat raw CSV export as the whole product.
5. Do not sell unsupported metros as if their signal pipeline is live.
6. Do not let pretty UI outrank list quality or packet quality.
7. Do not collapse Axis 1 and Axis 2 into one fuzzy bundle.
8. Do not make public SEO content the center of the project.
9. Do not build for testing theater; build for paid utility.
10. Do not overfit to Austin city limits when the actual revenue model needs metro and multi-metro coverage.
11. Do not use raw source rows as the commercial sales unit for Axis 2.
12. Do not build outbound sending infrastructure inside the hood MVP.
13. Do not widen the MVP by treating Axis 2.5 or Axis 3 as immediate build scope.

---

## 7. Monetization ladder

### 7.1 Locked public pricing surface
Public pricing should be shown as `starting at`, not as a fully rigid menu.

Default starting prices:

- Axis 1 setup: starting at `$149`
- Axis 2 first-touch packet setup: starting at `$149`
- Axis 1 + Axis 2 packet bundle: starting at `$259`
- Axis 2 paid batch of 10 live prospects: starting at `$149`

### 7.2 Commercial ladder
1. free sample
2. paid batch
3. packet setup
4. repeat batch
5. quoted recurring delivery

Locked rule:
Axis 2 is validated as a `batch product first`.

Expected commercial flow:

- sample
- paid batch
- repeat purchase
- quoted recurring delivery only after repeat usage evidence exists

### 7.3 Locked MVP rule
`Deficiency packet` is not a separate commercial SKU in MVP.
It exists as an internal or supporting sub-artifact inside Axis 1.

---

## 8. Public surface and delivery surface

### 8.1 Public surface
The public site exists to:

- explain Axis 1 and Axis 2
- show samples
- communicate starting prices
- collect reply or sample-request interest

### 8.2 Delivery surface
Actual product delivery is:

- email-first
- push-first
- no-login
- immediately usable

### 8.3 Output defaults
- HTML is the canonical render format
- PDF is the export format
- CSV or spreadsheet export is allowed for Axis 2 as an operational export, not as the canonical product definition

---

## 9. Build sequence

### Phase A. Core setup
- anchor
- strategy
- domain model
- data source rules

### Phase B. Axis 1 production path
- vendor setup profile
- completion brief generator
- HTML and PDF rendering

### Phase C. Axis 2 production path
- signal ingestion
- scoring
- batch builder
- first-touch packet rendering

### Phase D. Public commercial layer
- sample pages
- starting-price surface
- request CTA

### Phase E. Outbound operating layer
- vendor list
- Smartlead campaign handoff
- results analysis workflow
- delivery workflow

---

## 10. MVP definition
The MVP is not "a site that describes the idea".

The MVP is:

- one paid-ready Axis 1 output
- one paid-ready Axis 2 output
- one live outbound motion to vendors
- one list-to-Smartlead handoff path
- one results-analysis path for outbound performance
- one clear no-login delivery workflow

The MVP does not require live Axis 2.5 or Axis 3 execution.

The product is not ready if it only demos well.
It is ready only if the artifact can be sold and used.
