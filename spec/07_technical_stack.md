# 07 Technical Stack

## 1. Decision
The hood MVP will use:

- `Spring Boot MVC`
- `JTE`
- `Tailwind CSS`
- `daisyUI`
- `@tailwindcss/typography`
- `htmx`
- `Alpine.js`
- `Heroicons`

This is the locked default stack for MVP.

We are not choosing this because it is fashionable.
We are choosing it because it matches the product shape:

- server-rendered
- no-login
- HTML-first
- PDF-friendly
- backend-led
- low frontend state complexity

---

## 2. Why Spring Boot + JTE stays

### 2.1 Product fit
The hood product is not a client-heavy SaaS dashboard.

Its first job is:

- render public pages
- render packet outputs
- render batch previews
- deliver HTML and PDF artifacts

This is strongly aligned with server-side rendering.

### 2.2 Existing operator fit
The current operator already has experience with:

- Spring Boot
- JTE

If there is no major product advantage in switching, staying here is correct.

### 2.3 Locked conclusion
There is not enough product benefit to justify moving the MVP to React or Next.

So the locked decision is:

`Spring Boot + JTE remains the backend and rendering base`

---

## 3. Why JTE is not the design problem
JTE is an HTML template engine.
It does not inherently make a product look old or plain.

JTE supports:

- reusable layout composition
- content blocks
- plain HTML control
- server-first rendering

The real issue in past projects was more likely:

- weak design system
- no component library
- too much hand-written CSS
- no clear separation between marketing shell and app shell

Therefore the design fix is not replacing JTE.
The fix is strengthening the UI layer on top of JTE.

---

## 4. Locked UI stack

## 4.1 Tailwind CSS
`Tailwind CSS` is the base styling system.

Why it is locked:

- utility classes are fast to iterate in markup-heavy SSR flows
- strong fit for server-rendered templates
- easy to keep styles close to component markup
- easy to theme with CSS variables

Locked rule:
We use Tailwind as the design system foundation, not as random class soup.

## 4.2 daisyUI
`daisyUI` is the locked component-layer helper on top of Tailwind.

Why it is locked:

- it is built on Tailwind
- it is framework-agnostic
- it does not require a JS bundle
- it reduces repetitive utility-class boilerplate
- it works well in server-rendered projects

How it should be used:

- use for primitives:
  - button
  - input
  - textarea
  - select
  - badge
  - alert
  - card
  - modal
  - tabs
  - table
- customize aggressively with Tailwind utilities and theme tokens

Locked rule:
Do not let daisyUI define the entire visual identity.
Use it for speed on primitives, then layer custom composition on top.

## 4.3 Tailwind Typography
`@tailwindcss/typography` is locked for packet/document surfaces.

Why it is locked:

- hood has packet-like HTML and PDF views
- packet and document layouts are otherwise tedious in raw CSS
- the typography layer gives a clean baseline for prose-like content blocks

Use cases:

- service completion brief
- first-touch packet
- methodology or trust content

---

## 5. Locked interaction stack

## 5.1 htmx
`htmx` is the default interaction layer for server-driven fragments.

Use it for:

- inline partial refresh
- server-returned HTML fragments
- simple filters
- modal body loading
- progressive enhancement

Locked rule:
If a UI interaction can be solved with server-returned HTML, prefer htmx over building a client-side state machine.

## 5.2 Alpine.js
`Alpine.js` is allowed for tiny local state only.

Use it for:

- open or close
- dropdown state
- tabs
- light preview toggles
- small UI behavior where a server roundtrip is unnecessary

Locked rule:
Alpine is a small helper, not the primary application framework.

---

## 6. Icon and asset layer
`Heroicons` is the locked default icon set.

Why:

- simple
- clean
- fits Tailwind-era SaaS aesthetics
- easy to drop into SSR templates

Locked rule:
Use one icon family only.
Do not mix multiple icon systems in MVP.

---

## 7. What we are not using

### 7.1 React or Next
Not used for MVP.

Why:

- too much client complexity for the current product shape
- no meaningful advantage for packet rendering
- higher implementation surface for limited gain

### 7.2 Raw CSS as the default path
Not the default path.

Why:

- too slow
- too easy to become visually inconsistent
- too easy to regress into blunt, unstructured styling

Raw CSS is still allowed for:

- global tokens
- custom layout utilities
- a few signature components

### 7.3 Flowbite as the primary component layer
Not locked as the default.

Reason:
Flowbite is a valid fallback library, but for this project the default should stay lighter and more framework-agnostic at the primitive level.

If a later screen needs more prebuilt component coverage, it can be evaluated then.

---

## 8. CSS architecture rules

### 8.1 Required layers
The CSS system must be organized into:

1. `theme tokens`
2. `base`
3. `component primitives`
4. `surface-specific overrides`

### 8.2 Surface split
Hood should not use one undifferentiated visual shell.

It has at least three visual surfaces:

1. `marketing surface`
2. `commercial workflow surface`
3. `packet surface`

Locked rule:
These surfaces may share tokens and primitives, but should not share the exact same composition language.

Clarification:
The MVP does not assume a login-dashboard shell.
The second surface is the public commercial workflow layer:

- pricing
- sample preview
- vendor intake
- order-start flow

### 8.3 Brand rule
The design should not default to purple-on-white generic startup UI.

Use:

- strong typography
- warmer or more industrial neutrals
- clear accent colors
- visible hierarchy
- card and panel composition with intentional density

---

## 9. When the stack should change
Changing away from Spring Boot + JTE becomes reasonable only if the product shifts to:

- authenticated multi-user workspace
- heavy client-side state
- drag-and-drop list operations
- inbox-like realtime application behavior
- spreadsheet-like interactive editing

Until then, the default stack stays locked.

---

## 10. Final lock
The hood MVP stack is:

- `Backend`: Spring Boot MVC
- `Templates`: JTE
- `CSS foundation`: Tailwind CSS
- `Component helper`: daisyUI
- `Document styling`: Tailwind Typography
- `Server-driven interactions`: htmx
- `Tiny local state`: Alpine.js
- `Icons`: Heroicons

This stack is locked for MVP unless a later requirement clearly forces a change.
