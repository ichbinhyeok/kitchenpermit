# 09 UI System and Page Skeleton

## 1. Purpose
This file locks the `shared UI system` and the `default page skeletons` for the hood MVP.

The goal is to prevent implementation drift during coding.

This file exists so the product does not regress into:

- generic public brochure pages
- old-fashioned information pages
- dashboard-first SaaS layouts
- one-off ad hoc component styling

Locked rule:
This file defines the implementation-facing UI baseline.
It should be treated as the default visual contract for MVP pages.

---

## 2. System principles

## 2.1 Product truth
hood is:

- page-first
- packet-first
- public-first
- no-login
- render-first

It is not:

- dashboard-first
- workspace-first
- seat-management software
- analytics-console software

## 2.2 Design truth
Beauty should come from:

- hierarchy
- density discipline
- strong typography
- panel structure
- evidence visibility
- document seriousness

Not from:

- decorative effects
- visual novelty for its own sake
- oversized gradient marketing tricks
- soft card spam

---

## 3. Shared design tokens

## 3.1 Color system
Use a restrained industrial palette.

### Base tokens
- `--color-bg`: warm off-white / paper tone
- `--color-surface`: white
- `--color-surface-muted`: very light warm gray
- `--color-border`: cool gray with visible contrast
- `--color-text`: near-black / charcoal
- `--color-text-muted`: medium neutral gray

### Brand tokens
- `--color-accent`: strong industrial orange
- `--color-accent-strong`: deeper burnt orange for emphasis
- `--color-alert`: clear warning red
- `--color-success`: dark green used sparingly

### Usage rules
- accent color is for CTA, status emphasis, and key highlights
- alert red is for findings, urgency, deficiency, and caution states
- do not use many simultaneous brand colors
- do not use blue as the dominant product-signature color

## 3.2 Typography system
The type system should be compact, serious, and readable.

### Heading style
- high contrast
- bold
- compact line height
- little decorative flourish

### Body style
- readable but not oversized
- shorter paragraphs
- stronger contrast than typical brochure sites

### Label style
- uppercase or semi-uppercase is allowed in small doses
- useful for section framing, packet labels, and utility metadata

### Locked rule
Packet and operational surfaces should feel more like a premium deliverable than a blog article.

## 3.3 Spacing system
Use a consistent spacing rhythm.

Recommended base rhythm:

- `4`
- `8`
- `12`
- `16`
- `24`
- `32`
- `48`
- `64`

Usage rules:

- public pages should breathe, but not float
- packet pages should be denser than public marketing pages
- intake pages should sit between the two

## 3.4 Radius and shadow
Use restrained rounding.

### Radius
- default panel radius: small to medium
- document surfaces may use even tighter radius or none

### Shadow
- use minimal shadows
- prefer border and tone separation over floating-card depth

Locked rule:
Panels should feel grounded and precise, not soft and airy.

## 3.5 Border system
Borders are first-class in hood.

Use:

- visible panel borders
- structured table dividers
- packet section dividers
- section top rules where helpful

Avoid:

- invisible boundaries
- shadow-only separation
- card-on-card haze

---

## 4. Surface modes

## 4.1 Marketing surface
Used for:

- home
- Axis 1 detail
- Axis 2 detail
- pricing

Characteristics:

- stronger headlines
- more visual breathing room
- large but not empty sections
- visible proof blocks

## 4.2 Commercial workflow surface
Used for:

- vendor intake
- sample interaction areas
- order-start flow

Characteristics:

- stronger form grouping
- more obvious step hierarchy
- more utility framing
- higher density than the home page

## 4.3 Packet surface
Used for:

- service completion brief preview
- first-touch packet preview
- PDF-exportable document screens

Characteristics:

- strongest structure
- smallest decorative allowance
- highest trust requirement
- print-like discipline

Locked rule:
These surfaces share tokens, but not the exact same composition language.

---

## 5. Shared layout primitives

## 5.1 Global frame
Default public page frame:

1. top nav
2. hero or page header
3. main content sections
4. footer

Rules:

- navigation should be simple and public-facing
- no dashboard shell chrome
- no avatar or workspace controls on public pages

## 5.2 Page container
Use a centered container with strong desktop alignment.

Rules:

- desktop width should feel premium and editorial
- do not stretch content edge-to-edge
- packet previews can use a slightly wider content presentation if needed

## 5.3 Section framing
Every major section should have one or more of:

- clear heading
- short supporting explanation
- bordered panel group
- sample evidence or structured content block

Avoid:

- long text-only sections
- sections that blend together with no hierarchy

## 5.4 Panel primitive
The panel is the core hood component.

Default panel characteristics:

- visible border
- restrained radius
- surface background
- compact padding
- optional utility header

Panel use cases:

- product blocks
- pricing cards
- packet blocks
- findings sections
- form groups
- preview modules

## 5.5 Utility header primitive
Useful for:

- packet block labels
- feature block labels
- section identifiers
- protocol or artifact labels

Rules:

- use sparingly
- should signal seriousness, not cosplay
- avoid overusing fake system jargon

---

## 6. Shared component rules

## 6.1 Buttons
Primary buttons:

- use accent background
- strong contrast
- compact but confident size

Secondary buttons:

- outlined or lightly filled
- visible border
- no ghost buttons as the dominant pattern

Rules:

- too many button styles create visual drift
- CTA text should stay direct

## 6.2 Navigation
Public nav should emphasize:

- product understanding
- sample viewing
- pricing
- order-start path

Do not emphasize:

- dashboard
- analytics
- billing
- support center as a core destination

## 6.3 Tables
Tables are core to hood.

Use tables for:

- comparison
- list samples
- packet evidence summaries
- pricing matrices where useful

Rules:

- rows must be readable at a glance
- header contrast should be strong
- avoid weak spreadsheet styling

## 6.4 Forms
Forms should feel serious, not bureaucratic.

Use:

- grouped sections
- visible labels
- clear required-field hierarchy
- explicit upload blocks where needed

Avoid:

- endless single-column fatigue
- hidden labels
- form styling that feels like a government portal

## 6.5 Badges and status chips
Allowed uses:

- active / sample / pending / reviewed
- freshness emphasis
- findings severity
- packet status

Rules:

- they support hierarchy, not decoration
- status color should remain limited and meaningful

## 6.6 Document blocks
Packet pages should heavily use:

- summary blocks
- metadata rows
- evidence panels
- findings cards
- recommendation blocks
- next-step blocks

This is one of the core product languages of hood.

---

## 7. Page skeletons

## 7.1 Home page skeleton
Default order:

1. top nav
2. hero
3. short problem framing
4. Axis 1 / Axis 2 split section
5. sample packet teaser
6. why vendors care
7. pricing snapshot
8. FAQ or trust block
9. footer

Hero rules:

- headline must be forceful and specific
- subcopy must explain the two-axis value fast
- one product image or packet preview is preferred
- avoid giant abstract marketing art

## 7.2 Axis 1 page skeleton
Default order:

1. page header
2. what Axis 1 is
3. why vendors need it
4. packet contents
5. sample excerpt
6. trust / rebook / follow-up value
7. pricing CTA

Required visual blocks:

- sample service summary
- findings or evidence excerpt
- next-step or CTA example

## 7.3 Axis 2 page skeleton
Default order:

1. page header
2. what Axis 2 is
3. why this is not generic lead gen
4. list sample structure
5. first-touch packet sample structure
6. commercial flow
7. pricing CTA

Required visual blocks:

- trigger-led opportunity sample
- contact ladder or fit block
- first-touch framing excerpt

## 7.4 Sample packet preview skeleton
Default order:

1. page header
2. packet-type switch or split view
3. Axis 1 preview block
4. Axis 2 preview block
5. export or request CTA

Rules:

- this page should carry a large part of product trust
- packet blocks must feel print-ready
- packet preview should be more artifact-like than marketing-like

## 7.5 Pricing page skeleton
Default order:

1. page header
2. short commercial framing
3. Axis 1 / Axis 2 / bundle comparison
4. paid batch explanation
5. simple FAQ or honesty notes
6. order-start CTA

Rules:

- keep pricing legible
- do not overcomplicate with enterprise tiers
- starting-at framing should be visually honest

## 7.6 Vendor intake skeleton
Default order:

1. page header
2. vendor identity section
3. service area and product selection
4. brand and asset upload
5. notes and operational context
6. submit / continue CTA

Rules:

- the form should feel like an order-start workflow
- keep section labels explicit
- do not overwhelm the first screen with too many fields

---

## 8. Mobile rules

## 8.1 General
Mobile should preserve seriousness.

Do not reduce the product into:

- giant tap targets with no structure
- stacked fluff cards
- overcompressed weak hierarchy

## 8.2 Home
On mobile:

- hero headline remains strong
- Axis split becomes stacked panels
- packet preview remains visible early

## 8.3 Packet preview
On mobile:

- preserve document feel
- allow vertical reading
- do not destroy section boundaries

## 8.4 Intake
On mobile:

- step grouping becomes even more important
- sticky CTA may be allowed if done cleanly

---

## 9. Explicit anti-drift rules

1. Do not introduce a dashboard shell into public pages.
2. Do not let copy-heavy sections replace packet or proof blocks.
3. Do not design pricing like seat-based SaaS.
4. Do not use decorative gradients as the main source of polish.
5. Do not let packet screens become fake industrial telemetry mockups.
6. Do not use weak default-form styling on intake pages.
7. Do not mix multiple visual personalities across pages.

---

## 10. Implementation order
When coding the UI, build in this order:

1. shared tokens
2. layout shell
3. panel primitives
4. packet primitives
5. home page
6. sample packet preview
7. pricing
8. intake
9. Axis detail pages

Why:

- home and packet surfaces lock the product tone early
- pricing and intake lock commercial seriousness
- detail pages become easier after the shared system exists

---

## 11. Final lock
The hood MVP UI should be implemented with:

- one shared industrial visual system
- three surface modes
- panel-first composition
- packet-first trust design
- public-page clarity
- no dashboard-first assumptions

This UI system and page skeleton are locked for MVP implementation.
