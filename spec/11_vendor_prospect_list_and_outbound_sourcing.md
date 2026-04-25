# 11 Vendor Prospect List and Outbound Sourcing

## 1. Purpose
This file locks the sourcing and qualification rules for the `vendor prospect list`.

This list is not the same thing as the Axis 2 sales-opportunity list.

The project needs both:

1. `Axis 2 opportunity list`
   - restaurant or food-service opportunities that we sell to hood vendors
2. `vendor prospect list`
   - hood vendors that we prospect to sell hood itself

Locked rule:
These two list systems must never be collapsed into one fuzzy concept.

---

## 2. One-line definition
The vendor prospect list is the list of hood vendors that hood may contact through outbound to sell:

- Axis 1 setup
- Axis 2 paid batch
- bundle offers

It is the acquisition list for the hood business itself.

---

## 3. MVP role
The vendor prospect list exists to support one clear motion:

`find qualified hood vendors -> segment them -> choose the right offer angle -> hand off to Smartlead -> analyze results`

Locked rule:
The vendor prospect list is an outbound operating asset, not a public product.

---

## 4. Distinction from Axis 2 inventory

## 4.1 Axis 2 inventory
Axis 2 inventory is:

- trigger-led
- food-service opportunity data
- freshness-sensitive
- sold to vendors

## 4.2 Vendor prospect inventory
Vendor prospect inventory is:

- hood vendor company data
- service-area and contact-path data
- used by us to sell hood

## 4.3 Locked difference
Axis 2 asks:

- which restaurant or food-service opportunity should a vendor pursue now?

Vendor prospecting asks:

- which hood vendor is worth contacting now, with which offer angle?

---

## 5. Primary ICP for vendor prospecting

## 5.1 Target vendor profile
Default MVP target vendors:

- local or regional hood vendors
- owner-led or small-office-led operators
- weak or inconsistent customer-facing documentation
- weak or nonexistent sales-enablement assets
- visible service area in Austin metro, San Antonio metro, or DFW

Launch-volume expansion target vendors:

- same vendor profile as above
- visible service area in any explicit US metro
- usable email or owner route for cold-email handoff
- not positioned as an enterprise software buyer or mature national chain

## 5.2 Why this ICP is locked
These vendors are more likely to:

- feel the pain of weak service packets
- understand the value of a sharper first-touch sales packet
- buy practical revenue utility instead of evaluating software architecture

## 5.3 Lower-priority profiles
- manager-led operators with weaker owner access
- vendors with only generic intake paths
- larger regionals where the service area still overlaps the target metros

## 5.4 Excluded or deprioritized profiles
- national chains with mature internal systems
- franchise-heavy brands with weak local authority
- generic cleaning firms without a focused hood offer
- institution-heavy firms with weak restaurant relevance
- businesses with no real service-area clarity

---

## 6. Metro targeting rules

## 6.1 Default vendor prospecting range
Use the following markets for MVP outbound:

- `DFW`
- `Austin metro`
- `San Antonio metro`

Houston is not part of the default vendor-prospecting mix in MVP.

## 6.2 Default traffic weighting
For new-send vendor prospecting, use:

- `DFW: 40%`
- `Austin metro: 30%`
- `San Antonio metro: 30%`

## 6.3 Why this is locked
This mix supports:

- enough vendor volume for outbound
- geographic spread
- separation between vendor-targeting range and Axis 2 active-coverage range

## 6.4 Coverage honesty rule
Vendor targeting geography does not grant permission to claim active Axis 2 coverage.

Locked rule:
Only vendors whose service area overlaps an active Axis 2 coverage metro may receive default `Axis 2 first` positioning.

## 6.5 One-month new-vendor launch rule
If the launch plan uses `30 new vendors/day` for at least one month, the required send-ready pool is:

- `900 send-ready vendor prospects`
- `1,500-2,000 raw or enrichment candidates`

The MVP three-metro range is not enough to support that volume while preserving list quality.

Locked rule:
For one-month new-vendor launch volume, vendor sourcing may expand beyond DFW, Austin, and San Antonio, but all non-active-coverage metros must default to `Axis 1 first`.

Houston and other deferred Axis 2 markets may be sourced only under this Axis 1-first expansion rule.

## 6.6 Expansion market posture
Expansion market sourcing should prioritize local and regional operators in:

- Texas core and Texas reserve markets
- nearby Sunbelt metros
- broader US metros with visible hood-cleaning service pages

Locked rule:
Expansion geography does not imply Axis 2 inventory coverage.

---

## 7. Source families for vendor prospect sourcing

## 7.1 Primary sources
- vendor websites
- service-area pages
- metro landing pages on vendor sites
- public business contact pages

## 7.2 Secondary sources
- official city or regional reference lists where available
- public business directories
- maps or local listing surfaces used only for verification or enrichment

## 7.3 Supporting signals
- visible owner path
- visible documentation weakness
- visible customer type fit
- visible service offering match

## 7.4 Locked source rule
The vendor prospect list should be built from traceable public sources.

Every prospect row should preserve at least one source URL that explains why that vendor was included.

---

## 8. Required fields

## 8.1 Minimum required fields
Each vendor prospect should store:

- `display_name`
- `website_url`
- `primary_metro`
- `metro_scope`
- `service_area_text`
- `service_area_overlap_status`
- `size_band`
- `ownership_style`
- `owner_contact_status`
- `documentation_maturity`
- `axis1_angle_fit`
- `axis2_angle_fit`
- `segmentation_label`
- `source_url`
- `notes`

## 8.2 Contact-path fields
At minimum, store:

- `contact_name` when available
- `role_title`
- `email`
- `phone`
- `contact_confidence`
- `contact_source_url`

## 8.3 Recommended fields
- `specialties`
- `brand_notes`
- `sample_request_status`
- `first_contacted_at`
- `last_contacted_at`
- `campaign_status`

---

## 9. Qualification logic

## 9.1 Core qualification questions
Every prospect should be explainable through these questions:

1. is this actually a hood vendor?
2. do they clearly serve one of our target metros?
3. is there a usable contact path?
4. are they likely to benefit more from Axis 1, Axis 2, or both?
5. can we justify the first message in one sentence?

## 9.2 Qualification rules
A prospect is good enough for MVP outbound when:

- the company clearly appears to offer hood or kitchen exhaust services
- the service area overlaps a target metro or an explicit expansion metro
- a usable contact route exists
- the angle can be classified as Axis 1 first, Axis 2 first, or mixed

## 9.3 Exclusion rules
Exclude or pause when:

1. the business fit is ambiguous
2. service area is too vague to classify
3. no usable contact route exists
4. enterprise maturity makes the offer look obviously mismatched
5. the record cannot be defended with a source URL

---

## 10. Segmentation and angle selection

## 10.1 Segmentation labels
Use:

- `growth_oriented`
- `stability_oriented`
- `mixed`

## 10.2 Growth-oriented vendor
Use when signals suggest:

- clear growth ambition
- visible multi-metro or aggressive service-area positioning
- stronger likely interest in new business

Default angle:

- `Axis 2 first`
  - only when active coverage overlap exists

## 10.3 Stability-oriented vendor
Use when signals suggest:

- established operator
- existing customer base
- likely need for documentation and service presentation

Default angle:

- `Axis 1 first`

## 10.4 Mixed vendor
Use when both angles are plausible.

Default rule:
Choose the stronger initial hook based on service area overlap, owner path, and visible documentation weakness.

---

## 11. Outbound assembly flow
Default outbound workflow:

1. source vendor prospect
2. verify hood-service fit
3. verify service-area overlap
4. enrich usable contact path
5. assign segment
6. assign primary offer axis
7. export or hand off to Smartlead
8. sync or import reply outcomes
9. analyze by angle, metro, and segment

Locked rule:
hood owns everything up to and after send execution.
Smartlead owns the actual send execution in MVP.

---

## 12. Volume and hygiene rules

## 12.1 Send-volume context
The stable target is still:

- `40/day total`
- default stable mix `16 new / 24 follow-up`

But vendor-list quality outranks raw send count.

If outbound intentionally runs `30 new vendors/day` with no follow-up allocation for the first month, the list system must hold at least:

- `900 send-ready prospects`
- `30-45 days of extra reserve`
- enough raw candidates to replace bounces, bad-fit rows, and non-responding markets

## 12.2 Prospect burning rule
Do not burn high-fit prospects through weak one-shot outreach.

Follow-up discipline is required.

## 12.3 Reverification rule
Vendor companies are more stable than Axis 2 opportunity records,
but contact paths can decay.

Locked rule:
If a contact path is weak, stale, or repeatedly bounces, the prospect record must be downgraded or re-enriched before reuse.

---

## 13. Website and sample interaction
The public site should support vendor acquisition through:

- sample requests
- pricing review
- reply-based conversation

The vendor prospect list and the public site should reinforce each other:

- outbound points vendors to a sample or reply path
- the site provides enough clarity to convert interest

Locked rule:
The public site is part of the vendor acquisition motion, not a separate branding vanity layer.

---

## 14. Results analysis
After sending, analyze:

- sends
- deliveries
- bounces
- positive replies
- sample requests
- paid batch orders
- angle performance by Axis 1 first vs Axis 2 first
- metro performance
- segment performance

## 14.1 What the analysis is for
The analysis loop exists to improve:

- vendor-list quality
- angle selection
- metro weighting
- contact-path sourcing

Locked rule:
The vendor prospect list is not complete when sourced.
It becomes useful only when sourcing and results analysis are connected.

---

## 15. Acceptance bar
The vendor prospect sourcing system is acceptable for MVP when:

1. one usable prospect pool exists across Austin metro, San Antonio, and DFW
2. prospects preserve traceable source URLs
3. segment and primary offer angle are stored
4. Smartlead handoff can be produced from prospect records
5. reply and conversion outcomes can be analyzed back against the prospect source

It is unacceptable when:

1. the list is just a generic business directory
2. service-area overlap is not stored
3. no angle-selection logic exists
4. no source URL can explain why a vendor was included
5. results cannot be tied back to prospect quality

---

## 16. Final lock
hood requires two different list systems:

1. the `Axis 2 opportunity list` that vendors buy
2. the `vendor prospect list` that hood uses for outbound

The second list is now explicitly locked as a first-class MVP operating asset.
