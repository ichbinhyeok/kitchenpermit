# One-Month New-Vendor Launch Plan

## Required Volume

If outbound sends 30 new vendors per day for 30 days:

- Live send requirement: 900 vendors.
- Working pre-verification send-ready target: 1,000 vendors.
- Minimum reserve after verification: 300 additional vendors.
- Raw/enrichment pool target: 1,800-2,500 vendors.

## Why The Market Scope Must Expand

The initial MVP metro set is DFW, Austin, and San Antonio. That is enough for a focused product proof, but not enough for a full month of 30 new vendors/day while keeping quality high.

The list engine should therefore operate with two different geography concepts:

- Active Axis 2 coverage: currently Austin only.
- Vendor acquisition geography: any explicit US metro if the vendor is a real hood or kitchen exhaust operator.

## Offer Rules

- Austin active-overlap vendors can receive Axis 2-first positioning.
- All other metros default to Axis 1-first.
- Do not imply live restaurant lead coverage in any metro that is not active Axis 2 coverage.

## Sourcing Targets

Launch target:

- Texas core and reserve: 200-250 send-ready.
- Sunbelt expansion: 300-400 send-ready.
- Broader US local hood vendors: 350-450 send-ready.

Raw pool target:

- Source at least 1,800 candidates.
- Expect 40-60% to survive email/contact/source/fit filters and later email verification.

Current locked seed:

- 628 send-ready vendors are available across the Texas MVP seed and US expansion batches 001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023, 024, 025, 026, 027, 028, 029, 030, 031, 032, 033, 034, 035, 036, 037, 038, 039, 040, 041, 042, 043, 044, 045, 046, 047, 048, 049, 050, 051, and 052.
- 103 candidates are in enrichment before the enrichment pass is applied: 12 Texas rows plus 91 national strong-fit rows from `us-expansion-needs-enrichment-batch-001.tsv`, `us-expansion-needs-enrichment-batch-002.tsv`, `us-expansion-needs-enrichment-batch-003.tsv`, `us-expansion-needs-enrichment-batch-004.tsv`, `us-expansion-needs-enrichment-batch-005.tsv`, `us-expansion-needs-enrichment-batch-006.tsv`, `us-expansion-needs-enrichment-batch-007.tsv`, `us-expansion-needs-enrichment-batch-008.tsv`, `us-expansion-needs-enrichment-batch-009.tsv`, `us-expansion-needs-enrichment-batch-010.tsv`, `us-expansion-needs-enrichment-batch-011.tsv`, `us-expansion-needs-enrichment-batch-012.tsv`, `us-expansion-needs-enrichment-batch-013.tsv`, `us-expansion-needs-enrichment-batch-014.tsv`, `us-expansion-needs-enrichment-batch-015.tsv`, `us-expansion-needs-enrichment-batch-016.tsv`, `us-expansion-needs-enrichment-batch-017.tsv`, `us-expansion-needs-enrichment-batch-018.tsv`, `us-expansion-needs-enrichment-batch-019.tsv`, `us-expansion-needs-enrichment-batch-020.tsv`, `us-expansion-needs-enrichment-batch-021.tsv`, `us-expansion-needs-enrichment-batch-022.tsv`, `us-expansion-needs-enrichment-batch-023.tsv`, `us-expansion-needs-enrichment-batch-024.tsv`, `us-expansion-needs-enrichment-batch-025.tsv`, `us-expansion-needs-enrichment-batch-026.tsv`, and `us-expansion-needs-enrichment-batch-027.tsv`.
- `texas-mvp-enrichment-batch-001.tsv` is locked and promotes 6 of those 12 Texas research rows to `ACTIVE`, leaving 6 still in research.
- `texas-mvp-enrichment-batch-002.tsv` is locked and promotes 3 more of the remaining 6 Texas research rows to `ACTIVE`, leaving 3 still in research.
- `texas-mvp-enrichment-batch-003.tsv` is locked and promotes Kitchen Guard of Austin to `ACTIVE`, leaving 2 still in research.
- `texas-mvp-enrichment-batch-004.tsv` is locked as a research-hardening pass for the last 2 rows. It improves contact quality without promoting them because neither row has a public email yet.
- `us-expansion-enrichment-batch-001.tsv` is locked and promotes Mountaineer Hood and Exhaust Cleaning, LLC from national research to `ACTIVE` using the official public inbox published on the contact page.
- `us-expansion-enrichment-batch-002.tsv` is locked and promotes Velocity Hood Cleaning plus McCleaners Restaurant Services from national research to `ACTIVE` using official public inboxes exposed in official page HTML and schema markup.
- `us-expansion-enrichment-batch-003.tsv` is locked and promotes Rogue Hood & Fire plus Western States Exhaust Cleaning from national research to `ACTIVE` using public inboxes surfaced from page HTML and contact pages.
- `us-expansion-enrichment-batch-004.tsv` is locked and promotes Super Hood Cleaning, Elite Hood Cleaning Service, and Houston Hood Cleaning from national research to `ACTIVE` using public inboxes surfaced from same-domain JS, official service-area pages, and official privacy/contact pages.
- `us-expansion-enrichment-batch-005.tsv` is locked and promotes Florida Hood Cleaning, R & R Hood Cleaning Specialists, SafeKex L.L.C., and TD Hood Cleaning Service LLC from national research to `ACTIVE` using official contact-page inboxes and first-party schema markup.
- Effective post-enrichment inventory is 650 send-ready vendors, and the remaining minimum gap is 350 vendors before the 1,000-vendor pre-verification target has no list risk.

## Tiering

- `A`: local hood-first operators with stronger pure-play, owner-led, and small-team signals.
- `B`: hood-adjacent mixed operators that still fit hood's motion, or otherwise usable non-A vendors.

## Daily Send Mix

For 30 new vendors/day:

- 20-24 Axis 1-first vendors from expansion markets.
- 6-10 Austin or active-overlap vendors eligible for Axis 2-first.

The exact split should be adjusted after bounce rate and positive reply rate are known.

## Quality Gates

- Every row needs a traceable source URL.
- Every send-ready row needs a usable email.
- Generic janitorial, pressure washing, or facility-cleaning companies must be rejected unless the source page clearly names commercial kitchen exhaust, hood cleaning, vent hood cleaning, or NFPA 96.
- Franchise or national-chain rows should be deprioritized unless a local decision-maker path is visible.
- Bounce rate above 3% should stop sends from that source family until revalidated.
