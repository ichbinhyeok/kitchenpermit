# 07 Technical Stack

## 1. Decision
The hood MVP will use:

- `Frontend`: Next.js App Router + TypeScript
- `UI foundation`: Tailwind CSS
- `Component layer`: shadcn/ui registry + Radix primitives
- `Forms`: React Hook Form + Zod
- `Tables`: TanStack Table
- `Advanced accessibility layer`: React Aria (selective use)
- `Feedback`: Sonner
- `Motion`: Framer Motion
- `Icons`: Lucide
- `Backend`: Spring Boot REST API
- `Persistence`: SQLite-first structured storage + versioned schema migrations
- `Object storage`: Cloudflare R2 for normalized report photos and future PDF artifacts
- `Outbound execution`: Smartlead
- `Exports`: backend-owned HTML/PDF export pipeline

This is the locked default stack for MVP.

Cost lock:
The MVP should not start with MySQL or PostgreSQL unless operational pressure
proves that a server database is needed. SQLite is enough for early customer
report links, vendor setup records, delivery tokens, and outbound analysis
metadata when the app runs on one controlled server.

The product is no longer locked to `Spring MVC + JTE` as the browser-facing UI stack.

---

## 2. Why the frontend moves to Next.js

### 2.1 The product bottleneck is design quality
hood is not struggling because the product concept is unclear.

The current bottleneck is:

- public-page polish
- modern section composition
- reusable high-quality UI blocks
- rapid iteration on product-grade visual language

For this problem, `Next.js + React ecosystem` is materially stronger than `JTE`.

### 2.2 The browser-facing product surface is larger than a simple brochure
hood needs more than a static info site.

It needs:

- public product pages
- masked sample pages
- order-start flow
- future packet previews
- future internal browser UI if needed

This is a better fit for a modern frontend system than for continuing to scale server templates.

### 2.3 AI leverage is higher in the React/Next ecosystem
The practical output quality of modern UI generation is better in:

- `Next.js`
- `React`
- `Tailwind`
- `shadcn/ui`

That matters here because visual quality is a real business constraint, not a cosmetic afterthought.

### 2.4 Locked conclusion
The browser-facing product should move to:

`Next.js as the frontend application`

This is a product-quality decision, not a trend decision.

---

## 3. Why Spring Boot stays

### 3.1 Domain and revenue logic still belong on the backend
Spring Boot remains the right home for:

- vendor and service-area data
- Axis 1 job data
- Axis 2 signals, dedupe, scoring, and batch assembly
- commercial quote and order records
- delivery records
- outbound result ingestion and analysis
- packet assembly logic
- PDF and export workflows

### 3.2 Operator fit still matters
The operator already knows `Spring Boot`.

That lowers risk for:

- schema design
- data modeling
- API implementation
- batch processing
- deployment on the current Oracle server flow

### 3.3 Locked conclusion
The backend remains:

`Spring Boot REST API`

Spring is not the design problem.
Spring should stop owning the public UI and keep owning the business system.

---

## 4. Frontend rules

## 4.1 Route ownership
All browser-facing product pages should move to `Next.js`.

That includes:

- public landing pages
- samples
- pricing
- order-start flow
- future delivery views
- future internal ops UI if it later moves out of server templates

Locked rule:
Do not build new browser-facing pages in `JTE`.

## 4.2 App Router
Use `Next.js App Router`.

Why:

- cleaner route ownership
- better layout composition
- metadata support
- strong fit for marketing + product pages

## 4.3 Rendering posture
Default to:

- server components by default
- client components only where interaction is real

Locked rule:
Do not turn the frontend into an all-client bundle without reason.

## 4.4 UI stack
The locked frontend UI stack is:

- `Tailwind CSS`
- `shadcn/ui`
- `Radix`
- `React Hook Form + Zod`
- `TanStack Table`
- `React Aria` for advanced collection or picker cases
- `Sonner`
- `Framer Motion`
- `Lucide`

Rules:

- use shadcn for primitives and registry-backed scaffolding, not for generic copy-paste dashboards
- use Radix as the default primitive layer for overlays, tabs, menus, toggles, and switches
- use React Hook Form + Zod for all serious intake and generator forms
- use TanStack Table for list-heavy internal views instead of hand-rolled sortable tables
- use React Aria only where we need stronger accessibility or collection behavior than shadcn/Radix gives us
- use Sonner for toast feedback instead of custom toast implementations
- use motion sparingly and intentionally
- keep the visual system sharp, editorial, and product-grade

## 4.5 Toolkit adoption rules
From this point forward, the frontend should stop hand-building common interaction primitives unless there is a strong design reason.

Default mapping:

- `Button, card, input, textarea, separator, badge`: shadcn/ui
- `Dialog, sheet, popover, tooltip, dropdown, tabs, toggle group, switch`: Radix-backed shadcn primitives
- `Complex form state, validation, dirty state, error surfacing`: React Hook Form + Zod
- `Large sortable/filterable tables`: TanStack Table
- `High-friction accessible controls` such as combobox, listbox, complex select, or virtualized collection: React Aria when Radix-backed shadcn components become too brittle
- `Toast and transient feedback`: Sonner
- `Motion and layout transitions`: Framer Motion

Locked rule:
Do not keep expanding the custom one-off UI layer for solved problems like dialogs, tabs, switches, selects, or toasts.

## 4.6 Current recommendation on drawers
Do not lock `Vaul` as a default dependency right now.

Reason:

- the public repo currently marks itself as unmaintained
- hood is not drawer-first
- Radix-backed sheet/dialog patterns are sufficient for the current product shape

If we later need a mobile-first drawer with stronger gesture behavior, we can re-evaluate then.

---

## 5. Backend rules

## 5.1 API-first boundary
The backend should expose stable JSON APIs for product workflows.

Recommended path shape:

- `/api/public/*`
- `/api/axis1/*`
- `/api/axis2/*`
- `/api/commercial/*`
- `/api/outbound/*`
- `/api/delivery/*`

## 5.2 No frontend business logic drift
Next.js may format, present, and orchestrate UI flows.

It should not become the system of record for:

- quote truth
- order truth
- paid batch truth
- outbound result truth
- scoring truth

Those stay in Spring.

## 5.3 Packet authority
Packet data assembly authority stays in the backend.

Clarification:

- packet preview UI can be rendered by Next
- packet data contract and export truth stay in Spring

---

## 6. Transitional JTE rule
`JTE` is no longer a product frontend choice.

During migration, JTE may temporarily remain only for:

- existing pages that have not yet been migrated
- backend-private export helpers if needed

Locked rule:
No new investment should go into expanding JTE as the long-term frontend.

Target state:

- browser UI in Next.js
- business system in Spring Boot
- JTE removed after parity or retained only as a temporary migration helper

---

## 7. What we are not using as the primary path

### 7.1 JTE as the long-term public frontend
Not used as the future default.

Reason:

- weaker component ecosystem
- weaker modern landing-page leverage
- higher hand-crafted UI cost

### 7.2 htmx and Alpine as the primary interaction model
Not used as the new default.

Reason:

- the project is moving to a dedicated frontend application
- React state and component composition now own browser interactivity

### 7.3 daisyUI as the main component language
Not used as the locked component layer.

Reason:

- hood needs a more tailored and premium feel
- shadcn primitives give cleaner control

### 7.4 Next API Routes or Server Actions as the business backend
Not used as the system-of-record backend.

Reason:

- Spring already owns the domain
- duplicating backend truth in Next would create drift

---

## 8. Deployment posture
Recommended runtime shape:

- `frontend`: Next.js container
- `backend`: Spring Boot container
- `reverse proxy`: Nginx or Caddy

Deployment model:

- GitHub Actions builds images
- images are pushed to the registry
- the Oracle server pulls and restarts with Docker Compose

Locked rule:
Keep deployment operationally simple, but do not collapse frontend and backend responsibilities back into one server-rendered template app.

---

## 9. When the stack should change again
Changing away from this stack becomes reasonable only if:

- the frontend becomes extremely static and no longer benefits from Next
- the backend leaves the JVM ecosystem for a clear operational reason
- export generation moves to a dedicated rendering service for scale
- write volume, concurrent editing, team access, or reporting needs outgrow
  a single SQLite file

Until then, this is the locked stack.

---

## 9.1 Low-cost storage lock
The MVP storage posture is:

- `SQLite`: primary structured database for report metadata, share tokens,
  vendor setup records, delivery status, and outbound/result analysis
- `Cloudflare R2`: object storage for normalized report photos and future
  generated PDF artifacts
- `CSV`: import/export and manual research exchange format only

CSV is not the source of truth for customer report links.

Why:

- customer links need revoke/expiry/status behavior
- report records need stable IDs and share tokens
- photos should not be stored in the SQL database
- early volume does not justify MySQL/PostgreSQL operations

Upgrade trigger:
Move from SQLite to PostgreSQL only when one of these becomes true:

- multiple backend instances need concurrent writes
- customer history becomes a core paid feature
- reporting queries become too heavy for the single-file database
- backup/restore and audit requirements exceed the simple SQLite model

Object storage rule:
Store only browser-normalized, compressed report images by default. Avoid storing
raw original field photos unless a paid archive feature explicitly requires it.

---

## 10. Final lock
The hood MVP stack is:

- `Frontend`: Next.js App Router + TypeScript
- `UI foundation`: Tailwind CSS
- `Component layer`: shadcn/ui
- `Motion`: Framer Motion
- `Icons`: Lucide
- `Backend`: Spring Boot REST API
- `Database`: SQLite-first
- `Object storage`: Cloudflare R2
- `Migrations`: versioned SQL migrations
- `Outbound provider`: Smartlead

This stack is locked for the migration and MVP implementation path.
