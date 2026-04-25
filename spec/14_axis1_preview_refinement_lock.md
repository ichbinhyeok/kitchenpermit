# 14 Axis 1 Preview Refinement Lock

## 1. Purpose
This file locks the next refinement pass for the current Axis 1 frontend surfaces.

The generator input flow is intentionally deferred.
This file covers only:

- `/samples/axis-1`
- `/exports/axis-1-packet`
- the shared packet document surface
- PDF/export presentation quality

Locked rule:
Do not widen scope back into the generator workflow yet.
First make the public-facing packet surfaces feel commercially credible.

---

## 2. Page roles

### 2.1 `/exports/axis-1-packet`
This page is the `cold-email first click`.

Its job is:

- show the artifact immediately
- prove what the vendor's customer would receive
- create reply intent

It is not:

- the SEO explainer
- a long product education page
- the future input tool

### 2.2 `/samples/axis-1`
This page is the `SEO and public explainer sample`.

Its job is:

- explain what the packet is
- explain why vendors care
- show the masked document layer

It is not:

- the cold-email landing page
- the future order tool

### 2.3 Shared packet document
The packet document is the `actual product-looking artifact`.

Its job is:

- feel sendable
- feel printable
- feel defensible
- feel useful to both vendor and customer

It should remain more document-like than app-like.

---

## 3. What stays locked
Keep these decisions:

- packet-first trust
- one packet / one system framing
- branded vs neutral state split
- exception vs clean-close state split
- structured deficiency handling
- route map + photo proof + close-out record
- web-product shell outside, operating document inside

These are the right foundations.

---

## 3.1 Industry absorption lock
The product should absorb the strongest recurring expectations seen in official forms and large
vendor positioning:

- one packet / one system
- visible technician and company credentials
- service result plus label or site-notice status
- inaccessible or uncleaned areas with reasons
- structured deficiency reporting
- recommended cleaning frequency with a basis
- before and after proof for the full system, not only the hood face
- sign-off and retained record posture

This keeps the packet commercially believable.

## 3.2 Differentiation lock
The product should not stop at parity with incumbent after-service reports.

Our differentiation should stay visible in four places:

- owner-readable first-screen summary
- curated proof instead of bloated photo dumps
- built-in rebook and follow-up acceptance cues
- premium brand presentation without losing operational seriousness

Why:

- incumbents often have proof and compliance language
- they are still weak at clarity, hierarchy, and product feel

Immediate sales lock:
Axis 1 should be positioned first as a customer-understandable same-day service report.
It should not lead with history, portal, or operations-memory promises.
Those can arrive later as retention layers, but the immediate commercial hook is:

- fewer explanation calls
- clearer blocked-access defense
- more premium customer handoff
- cleaner same-day proof of work

## 3.3 Field-readiness lock
Axis 1 must not read like a generic pretty report.
It must read like it understands kitchen exhaust cleaning work.

The visible sample must include:

- accessible scope language
- system-section references from hood to duct to fan
- service label or exception notice status
- a distinction between customer curated proof and internal full archive
- blocked or inaccessible access handling
- deficiency rows that can lead to a quote, revisit, or watch item
- next service timing with an interval basis
- explicit separation between exhaust cleaning, repairs, and fire-suppression inspection

The sample should avoid:

- implying inaccessible sections were cleaned
- treating photos as decoration
- using generic "issue found" language
- turning the document into a compliance-looking form with no customer clarity
- hiding repair/deficiency opportunities below vague copy

Locked commercial interpretation:
The vendor buys this because it reduces explanation work and makes the visit easier to defend.
The customer accepts it because it says what happened, what stayed open, and what to do next.

## 3.4 Small-vendor premiumization lock
The strongest buyer is likely a small or mid-sized hood vendor that already does the work but does
not have polished reporting software.

The product should make that vendor look like a premium operator by default.

Locked experience:

- the vendor should feel they are sending the same facts they already collect, only faster and cleaner
- the customer should feel the vendor is organized, documented, and serious
- the report should not feel like a cheap template or a government form
- the field checklist layer should make the vendor look operationally mature without exposing raw
  technician mess

The artifact must include:

- component status matrix
- photo coverage checklist
- interval/frequency basis
- label or notice status
- acknowledgement and record trail

This is the product wedge:
`small vendor effort in, premium company artifact out`.

Placement lock:
The checklist layer must appear before the long photo evidence section.
Reason:
vendors should understand immediately that this is not only a prettier photo report; it is the
structured operating record they normally lack.

---

## 4. Current product judgment
The current state is no longer a weak mockup.

It is now:

- commercially credible enough to show vendors
- strong enough for cold-email proof
- directionally correct as a product-grade packet

It is not yet fully locked because four things still need refinement:

1. page-role clarity
2. PDF discipline
3. density control
4. richer modern interaction primitives

---

## 4.1 Competitive interpretation
Large vendors are already selling:

- before and after photos
- after-service reports
- customer portals
- recurring scheduling
- deficiency visibility

That means the product does not win by merely having a report.
It wins by making the report:

- easier to understand
- easier to forward internally
- easier to act on
- stronger as a premium trust artifact

---

## 5. Priority improvements

## 5.1 P0: PDF must be a document, not a printed web screen
The exported PDF must read as a real packet.

Required rules:

- preview chrome must not print
- page breaks must happen at document-card or document-section logic, not arbitrary viewport cuts
- typography and spacing in print must be slightly tighter than on web
- the PDF path should support a future compressed 4 to 6 page variant

Why:

- vendors will judge the product on the exported artifact
- a cut or awkwardly paginated PDF destroys trust fast

## 5.2 P0: Cold-email page must stay short
`/exports/axis-1-packet` should become even more decisive.

Required posture:

- short explanation above the fold
- strong branded-setup CTA
- packet visible immediately
- no SEO-style educational drift

Why:

- cold-email traffic is low patience
- the first click must answer "what would my customer get?"

## 5.3 P0: SEO sample must explain without diluting the packet
`/samples/axis-1` should keep the explanation layer, but the packet must stay the hero artifact.

Required posture:

- explanation outside the document
- document shown as the main proof object
- no long text sections before packet trust appears

Why:

- SEO visitors need explanation
- but the artifact is still the trust engine

## 5.4 P1: Packet terminology must get slightly more human
Some labels are still more operator-facing than customer-facing.

Refinement targets:

- prefer plain-English customer phrases before internal shorthand
- keep codes and system references as secondary support
- make action language more direct

Why:

- customers read the packet too
- the vendor pays for clarity, not for internal jargon

Absorb but translate:

- keep technically meaningful fields in the packet
- put customer language first
- push code-like identifiers into secondary support positions

## 5.5 P1: Density should tighten, not inflate
The packet should feel high-trust and premium, but not spacious in a lifestyle-brand way.

Refinement targets:

- slightly tighter vertical rhythm in dense sections
- stronger visual grouping in metadata rows
- more disciplined section endings

Why:

- operational documents gain trust from control
- loose spacing makes the artifact feel more like a landing page than a record

Locked contrast:
Do not imitate the giant photo-dump PDF pattern seen in some incumbent reports.
The packet should feel deliberate, edited, and high-signal.

## 5.6 P1: Shared primitives should stop being hand-built
The current UI layer still relies too much on custom wrappers.

Refinement targets:

- move standard controls to shadcn/Radix-backed primitives
- standardize toggle, tabs, dialog, tooltip, separator, and toast behavior
- reduce custom interaction styling for solved UI patterns

Why:

- this is one of the main reasons the frontend can still feel slightly hand-made
- React/Next gives us a stronger ecosystem; we should use it

## 5.7 P1: Exception language should be domain-real but customer-readable
The builder and preview should stop using generic "follow-up item" language.

Required posture:

- builder input can use domain-shaped categories
- packet output should prefer plain language like `recorded condition`, `clear access`, or
  `section remained open`
- rooftop, access, containment, and belt or panel issues should feel like real field categories,
  not vague catch-alls

Why:

- vendors need to feel the tool understands the work
- customers still need to understand the report without calling back

---

## 6. Toolkit lock for the next frontend phase
The next implementation phase should actively use the following:

- `shadcn/ui` for base primitives and registry-backed components
- `Radix` for underlying accessible overlay and control behavior
- `React Hook Form + Zod` for all serious forms once the generator input surface begins
- `TanStack Table` for vendor list, lead list, and future backoffice table views
- `React Aria` only for advanced select, list, collection, or accessibility-heavy cases
- `Sonner` for non-blocking product feedback
- `Framer Motion` for controlled layout and reveal transitions

Implementation rule:
Do not keep solving common component behavior with custom JSX and CSS if the library layer already solves it better.

---

## 7. Specific keep / adjust calls

### 7.1 Keep

- the packet as a large central artifact
- the branded vs neutral state
- the exception vs clean state
- the customer-facing close block
- the system route + proof photo logic
- the close-out and scope-note ending
- the idea that the document should be defensible for facilities or inspection review

### 7.2 Adjust

- preview controls should feel more like product controls and less like stacked custom cards
- status chips should become more systemized
- metadata rows should become more unified
- sample-page explanation panels should become tighter and more editorial
- sample and preview copy should state more clearly that this is not just a compliance sheet; it is
  also a customer-trust and rebook artifact

### 7.3 Avoid

- dashboard chrome
- analytics theater
- government-form stiffness
- random custom micro-components for every small interaction
- generic "after service report" sameness
- huge uncurated photo galleries as the main value claim

---

## 8. Deferred on purpose
These are explicitly deferred:

- generator input page
- backend-powered live packet assembly
- PDF compression presets
- branded vendor onboarding automation

Reason:

- current priority is to make the visible packet surfaces commercially sharp first

---

## 9. Final lock
The next refinement pass is not about adding more product scope.

It is about making the current Axis 1 public surfaces feel:

- more trustworthy
- more modern
- more library-backed
- more print-disciplined
- more commercially convincing

This refinement direction is locked until the current packet surfaces are visually and structurally settled.
