# 08 Design Direction

## 1. Purpose
This file locks the visual direction of the hood MVP.

It exists to prevent two common failures:

1. the product looking like a `2010 information site` or `government blog`
2. the product drifting into `generic SaaS dashboard` aesthetics that do not match the actual product shape

Locked rule:
This file defines `direction`, not final copy.
We may rewrite labels, headings, and page wording later.
We are locking the taste, hierarchy, and composition language now so implementation does not regress.

---

## 2. What the product should feel like
hood should feel like:

- industrial
- operator-grade
- document-led
- commercially serious
- revenue-linked
- clean and structured
- premium through discipline, not through decorative flair

The product should make a hood vendor feel:

- this understands my business
- this makes me look more professional
- this helps me sell and rebook
- this is a real tool, not a generic marketing page

---

## 3. Locked design references

### 3.1 Primary visual reference
Use this set as the primary taste reference:

- [primary reference set](C:/Development/Owner/hood/references/design/primary)

What is useful in this set:

- industrial seriousness
- strong typography
- restrained palette
- document-like composition
- higher perceived product quality than a default brochure site

### 3.2 Secondary visual reference
Use this set only as a secondary reference:

- [secondary reference set](C:/Development/Owner/hood/references/design/secondary)

What is useful in this set:

- clearer public-site navigation rhythm
- cleaner public page segmentation
- usable intake-page discipline

### 3.3 Rejected reference direction
Do not use this set as the main direction:

- [rejected reference set](C:/Development/Owner/hood/references/design/rejected)

Why it is rejected as the main direction:

- too dashboard-like
- too login-SaaS-like
- too close to analytics or billing software
- mismatched to the current no-login, page-and-packet-first product

### 3.4 Reference usage boundary
The reference sets are pinned as `taste references`.

They are allowed to influence:

- visual tone
- page density
- section framing
- panel hierarchy
- packet composition logic
- public-page information structure

They are not allowed to dictate:

- final wording
- product naming
- navigation labels
- pricing language
- fictional product concepts that do not exist in hood

Locked rule:
The hood implementation may look inspired by the references,
but it must still read as its own product.

---

## 4. Non-copy rule
The references are for:

- tone
- structure
- density
- hierarchy
- industrial visual language

They are not for:

- direct layout copying
- direct copy reuse
- exact component cloning
- exact navigation reproduction

Locked rule:
We borrow the `design logic`, not the exact UI.

## 4.1 Copy isolation rule
When implementing from the references:

- do not reuse their headings verbatim
- do not reuse their CTA text verbatim
- do not reuse their pricing model verbatim
- do not inherit fictional enterprise-platform language
- do not inherit dashboard chrome on public pages

Allowed reuse is limited to:

- layout rhythm
- block hierarchy
- surface tone
- spacing logic
- border and panel treatment

---

## 5. Core visual identity

## 5.1 Palette
The MVP should use:

- warm off-white or paper-like base
- charcoal / graphite / iron neutrals
- one strong signal orange
- one alert red for findings, urgency, and warnings

Avoid:

- default blue-heavy corporate UI
- purple-on-white startup palettes
- overly colorful dashboard palettes
- flat grayscale with no visual signal

## 5.2 Typography
Typography should be:

- bold in headings
- compact but readable in body
- strong enough to carry industrial seriousness
- clean enough for packet and PDF rendering

Avoid:

- tiny body text with weak contrast
- blog-like oversized paragraph rhythm
- overly playful typography

## 5.3 Density
The product should not feel airy in a lifestyle-brand way.

It should use:

- deliberate spacing
- visible section boundaries
- information-dense panels where appropriate
- tables, lists, and evidence blocks that feel operational

Avoid:

- loose brochure spacing everywhere
- long floating paragraphs with weak anchors
- giant empty hero sections without concrete product proof

## 5.4 Borders and surfaces
The MVP should prefer:

- crisp panel edges
- strong dividers
- restrained radius
- minimal shadow

Avoid:

- soft rounded startup cards everywhere
- glassmorphism
- floating translucent panels

---

## 6. Anti-patterns to reject

### 6.1 Government-blog failure mode
Do not ship pages that feel like:

- plain information bulletin
- municipal resource page
- policy FAQ page with no product confidence
- default Bootstrap documentation skin

Typical symptoms:

- weak hero
- too much plain text
- blue-link-heavy layout
- generic section headings
- no strong panel system
- no visual evidence of a premium deliverable

### 6.2 Generic SaaS failure mode
Do not ship pages that feel like:

- dashboard shell first
- analytics console
- billing and seats product
- API pricing software

Typical symptoms:

- top nav with dashboard, analytics, billing as primary
- seat-based product framing
- uptime, API, telemetry, and platform language
- user avatar and workspace chrome on public pages

---

## 7. Surface-specific direction

## 7.1 Home page
The home page should feel like:

- a sharp niche B2B product
- industrial operations software translated into public marketing
- document and packet quality made visible

The home page should emphasize:

- Axis 1 and Axis 2 clearly
- real packet previews
- operational credibility
- commercial seriousness

The home page should not feel like:

- a generic agency site
- a generic compliance blog
- a login app landing shell

Primary references:

- [hood_operational_systems_for_exhaust_vendors](C:/Development/Owner/hood/references/design/primary/hood_operational_systems_for_exhaust_vendors)
- [home_page_desktop](C:/Development/Owner/hood/references/design/secondary/home_page_desktop)

Borrow from these references:

- industrial headline confidence
- asymmetrical hero composition
- concrete section breaks
- clear Axis 1 / Axis 2 split below the hero

Do not inherit:

- audit or portal framing
- dashboard nav assumptions
- fictional enterprise-software claims

## 7.2 Axis detail pages
Axis pages should feel more specific and more evidence-heavy than the home page.

They should use:

- cleaner hierarchy
- stronger section labeling
- sample content blocks
- practical tables or packet excerpts

Primary references:

- [axis_1_professional_service_packets](C:/Development/Owner/hood/references/design/primary/axis_1_professional_service_packets)
- [axis_2_revenue_intelligence_outbound_packets](C:/Development/Owner/hood/references/design/primary/axis_2_revenue_intelligence_outbound_packets)

Secondary references:

- [axis_1_service_packets_desktop](C:/Development/Owner/hood/references/design/secondary/axis_1_service_packets_desktop)
- [axis_2_sales_intelligence_desktop](C:/Development/Owner/hood/references/design/secondary/axis_2_sales_intelligence_desktop)

Borrow from these references:

- technical-page discipline
- dense but readable section framing
- visual block rhythm for proof, fields, and structured value

Do not inherit:

- telemetry theater
- infrastructure jargon
- abstract platform framing

## 7.3 Sample packet preview
This is the most important visual surface.

The packet preview must feel:

- sendable
- printable
- premium
- defensible
- useful

It should feel like a real business artifact, not a styled mockup.

Avoid:

- fake telemetry panels
- abstract technical schematics that do not map to hood vendor reality
- overdesigned sci-fi industrial motifs

Primary references:

- [sample_deliverable_preview](C:/Development/Owner/hood/references/design/primary/sample_deliverable_preview)
- [sample_packet_preview_desktop](C:/Development/Owner/hood/references/design/secondary/sample_packet_preview_desktop)

Borrow from these references:

- packet framing
- strong document margins
- panelized evidence sections
- printable, sendable visual seriousness

Transform before implementation:

- replace fictional industrial metrics with real hood-vendor fields
- replace system-protocol language with service-summary and outreach language
- keep the high-trust document feel

## 7.4 Pricing page
Pricing should feel:

- clear
- direct
- commercially honest
- not enterprise theater

It should reflect the actual product model:

- Axis 1 setup
- Axis 2 setup
- bundle
- paid batch of 10
- starting at pricing

Avoid:

- seat-based SaaS pricing
- uptime or API-style value props
- custom enterprise platform language as the default frame

Primary references:

- [pricing_deployment](C:/Development/Owner/hood/references/design/primary/pricing_deployment)
- [pricing_plans_desktop](C:/Development/Owner/hood/references/design/secondary/pricing_plans_desktop)

Borrow from these references:

- crisp plan-card comparison
- strong price hierarchy
- restrained CTA treatment

Do not inherit:

- monthly seat framing
- license or uptime framing
- enterprise theater language
- custom tier logic that hides the actual MVP sales model

## 7.5 Vendor intake
Intake should feel:

- serious
- structured
- light enough to complete
- like the start of a real order, not a generic contact form

The intake surface may borrow disciplined panel logic from industrial forms,
but should still be understandable to a small hood vendor without enterprise-software training.

Primary references:

- [vendor_intake_portal](C:/Development/Owner/hood/references/design/primary/vendor_intake_portal)
- [vendor_intake_form_desktop](C:/Development/Owner/hood/references/design/secondary/vendor_intake_form_desktop)

Borrow from these references:

- strong step framing
- serious order-start feeling
- disciplined form grouping
- asset-upload visibility

Do not inherit:

- enterprise verification theatrics
- fake secure-operations language
- unnecessary operator jargon

---

## 8. Page-shape rule
The MVP is not a dashboard-first application.

The default page set is:

1. home
2. Axis 1 detail
3. Axis 2 detail
4. sample packet preview
5. pricing
6. vendor intake / order start

Locked rule:
Public page and packet quality outrank any imagined future workspace shell.

---

## 9. Implementation guidance
When implementing the UI:

- start from the industrial reference set
- simplify it into a cleaner, more modern, less enterprise-theatrical product language
- remove portal or dashboard implications from public surfaces
- make packet and sample pages more real and less fictional
- keep the visual confidence high even when copy changes later

## 9.1 Page-by-page reference workflow
Before implementing any major page:

1. open the mapped primary reference
2. inspect the mapped secondary reference only if needed
3. extract the page's hierarchy, density, and panel logic
4. rewrite all copy and labels for hood's actual product model
5. remove any dashboard, portal, billing, or enterprise-platform implications

Locked rule:
No page should be implemented from a blank slate if a locked reference already exists for its visual direction.

Locked rule:
We fix taste early.
We do not wait until the product is built and then try to "polish" a weak visual foundation.

---

## 10. Final lock
The hood MVP design direction is:

- industrial, not bureaucratic
- modern, not trendy
- structured, not bland
- document-first, not dashboard-first
- operator-grade, not generic SaaS
- premium through clarity, hierarchy, and evidence

This direction is locked for MVP implementation.
