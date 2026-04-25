# 10 Implementation Plan

## 1. Purpose
This file turns the locked hood strategy into an execution plan for:

- `Next.js frontend`
- `Spring Boot API backend`

It defines:

- build order
- package shape
- route ownership
- data and persistence recommendations
- migration milestones
- explicit non-goals

Locked rule:
This plan is for `paid utility first`, not for maximum feature surface.

---

## 2. Build strategy

## 2.1 Core principle
Build hood as:

- a public product frontend
- a packet and commerce backend
- an outbound analysis backend

That means:

- browser pages live in Next.js
- domain truth lives in Spring Boot
- public elegance does not change backend ownership
- customer login is still not required for MVP

## 2.2 What ships first
The migration should ship in this order:

1. lock stack and migration docs
2. scaffold the Next frontend shell
3. migrate public pages
4. migrate the order-start flow onto the new frontend
5. expose packet preview contracts
6. connect outbound analysis views to backend APIs
7. retire public JTE pages

Why this order:

- visual quality has to improve early
- public routes are the most obvious source of drift
- the backend domain can keep progressing while frontend migration happens
- packet/export work should use stable backend data contracts, not placeholder copy

## 2.3 Manual-first where quality matters
For Axis 2 MVP, quality still beats automation breadth.

Locked rule:
The first Austin Axis 2 path may be `manual-assisted and ops-reviewed`,
as long as the commercial artifact is real and repeatable.

Do not overbuild multi-metro automation before one paid-quality path exists.

---

## 3. Recommended technical implementation

## 3.1 Frontend stack
- frontend framework: Next.js App Router
- language: TypeScript
- styling: Tailwind CSS
- UI primitives: shadcn/ui
- motion: Framer Motion
- icons: Lucide

Rules:

- use server components by default
- use client components only where interaction is real
- do not use Next API routes as the primary business backend

## 3.2 Backend stack
- backend: Spring Boot REST API
- persistence: SQLite-first
- object storage: Cloudflare R2 for normalized report photos and future PDF artifacts
- migrations: versioned SQL migrations
- ORM: Spring Data JPA
- exports: backend-owned PDF/export pipeline

Why:

- hood has enough linked entities that CSV is the wrong source of truth
- SQLite is enough for early paid links, setup records, and delivery tokens on one server
- photos and PDFs should not live inside the SQL database
- the backend is the system of record for revenue and delivery

## 3.3 PDF and export
Render flow should support:

- frontend packet previews in Next
- backend-owned export truth
- PDF as a deliverable artifact
- CSV export only where operationally useful for Axis 2

Locked rule:
Do not make the frontend the source of truth for export state.

---

## 4. Repository structure

Recommended repository shape:

```text
/hood
  /frontend
    /src/app
    /src/components
    /src/lib
    /public
    package.json
    next.config.ts
  /spec
  /src/main/java/owner/hood
    /application
    /config
    /domain
    /infrastructure
    /web
  /src/main/resources
  /src/test/java
  build.gradle
```

Repository rules:

- the current root remains the backend
- the new frontend lives under `/frontend`
- do not move the backend into a new directory during the first migration wave

---

## 5. Frontend route plan

## 5.1 Public routes
Recommended first frontend routes:

- `GET /`
- `GET /axis-1`
- `GET /axis-2`
- `GET /samples`
- `GET /samples/axis-1`
- `GET /samples/axis-2`
- `GET /pricing`
- `GET /start`
- `GET /start/submitted`

## 5.2 Later frontend routes
Expected next browser routes:

- delivery preview routes
- order-confirmation routes
- internal ops routes if the ops UI moves into Next later

Locked rule:
All new browser-facing product routes should be created in Next.

---

## 6. Backend API plan

## 6.1 Public and commerce APIs
Recommended first backend paths:

- `GET /api/public/site-config`
- `POST /api/public/inquiries`
- `GET /api/public/pricing`
- `GET /api/public/samples/axis-1`
- `GET /api/public/samples/axis-2`

## 6.2 Axis 1 APIs
- `GET /api/axis1/jobs/{id}`
- `GET /api/axis1/previews/{id}`
- `GET /api/axis1/deliveries/{token}`

## 6.3 Axis 2 APIs
- `POST /api/axis2/signals/import`
- `GET /api/axis2/projects`
- `POST /api/axis2/batches`
- `GET /api/axis2/batches/{id}`
- `GET /api/axis2/previews/{id}`

## 6.4 Commercial APIs
- `POST /api/commercial/inquiries`
- `POST /api/commercial/orders`
- `GET /api/commercial/orders/{id}`
- `PATCH /api/commercial/orders/{id}/status`

## 6.5 Outbound APIs
- `GET /api/outbound/prospects`
- `GET /api/outbound/campaigns`
- `GET /api/outbound/results`

Locked rule:
The frontend may orchestrate UX flows, but Spring keeps ownership of these workflows.

---

## 7. Data and storage phases

## 7.1 Phase-one persistence targets
The first schema should cover:

- vendor organization
- vendor contact
- vendor setup profile
- vendor service area
- commercial lead
- commercial quote
- commercial order
- commercial order line
- payment record
- Axis 1 job, work item, finding, asset, render
- opportunity project, signal, contact
- Axis 2 batch, batch item, render
- outbound campaign, message, result snapshot
- delivery record

## 7.2 Asset storage
Store:

- vendor logos
- packet evidence images
- exported PDFs

Rules:

- do not hardwire the app to one local folder path without abstraction
- store file metadata in the relational database
- use Cloudflare R2 as the target object store for hosted customer-link assets
- local disk storage is a development fallback only

## 7.3 Source capture
Axis 2 records must preserve:

- source name
- source URL
- trigger date
- scoring snapshot
- eligibility status
- canonical project linkage

---

## 8. Frontend implementation plan

## 8.1 App structure
Recommended Next structure:

```text
frontend/src/app
  /(marketing)/page.tsx
  /(marketing)/axis-1/page.tsx
  /(marketing)/axis-2/page.tsx
  /(marketing)/pricing/page.tsx
  /(marketing)/samples/page.tsx
  /(marketing)/samples/axis-1/page.tsx
  /(marketing)/samples/axis-2/page.tsx
  /(marketing)/start/page.tsx
  /(marketing)/start/submitted/page.tsx
```

## 8.2 Shared frontend layers
Build in this order:

1. tokens and globals
2. layout shell
3. shared sections and panels
4. marketing pages
5. sample and pricing pages
6. start flow
7. packet preview surfaces

## 8.3 Frontend data posture
Start with a pragmatic split:

- static copy can live in the frontend
- operational truth comes from Spring APIs

Locked rule:
Do not block migration on a premature CMS abstraction.

---

## 9. Delivery milestones

## M0. Architecture lock
Deliverables:

- stack doc updated
- migration doc added
- implementation plan updated
- acceptance matrix updated

Ship bar:

- no ambiguity remains about frontend ownership

## M1. Frontend scaffold
Deliverables:

- Next app in `/frontend`
- global layout
- global theme
- shared nav and footer
- homepage route

Ship bar:

- frontend builds locally
- homepage tone matches the locked direction more closely than the old JTE shell

## M2. Public route parity
Deliverables:

- Axis 1 page
- Axis 2 page
- samples pages
- pricing page
- start page
- submitted page

Ship bar:

- all public MVP routes exist in Next

## M3. Order-start API path
Deliverables:

- backend inquiry endpoint
- frontend form wiring
- confirmation state
- manual-commerce handoff preserved

Ship bar:

- a real vendor can start the process through the new frontend

## M4. Packet preview and delivery contract
Deliverables:

- Axis 1 preview route in Next
- Axis 2 preview route in Next
- backend preview payloads
- export and PDF linkage

Ship bar:

- packet preview trust no longer depends on public JTE templates

## M5. Outbound analysis UI
Deliverables:

- result-analysis surface
- campaign and angle summaries
- list-quality signal visibility

Ship bar:

- hood can evaluate which list or angle is working after sends occur

## M6. Public JTE retirement
Deliverables:

- retire public-site controllers
- retire public JTE templates
- remove old public CSS pipeline if unused

Ship bar:

- Spring no longer serves browser-facing marketing pages

---

## 10. Sprint order

## Sprint 1
- M0
- M1

## Sprint 2
- finish M1
- finish M2

## Sprint 3
- finish M3
- start M4

## Sprint 4
- finish M4
- start M5

## Sprint 5
- finish M5
- start M6 cleanup

## Sprint 6
- QA pass
- cutover review
- cleanup of transitional JTE public assets

Locked rule:
Do not let frontend migration stall Axis 1 and Axis 2 backend truth.

---

## 11. Testing plan

## 11.1 Frontend checks
At minimum, verify:

- Next production build passes
- every public route renders
- key CTAs and forms behave correctly
- metadata exists for public pages

## 11.2 Backend checks
At minimum, test:

1. one vendor setup can be saved
2. one Axis 1 job can render a preview payload and export artifact
3. one Axis 2 paid batch of 10 can be assembled from canonical projects
4. unsupported metros cannot be sold as active Axis 2 inventory
5. inquiry creation works
6. delivery token lookup works without login

---

## 12. Explicit non-goals for MVP
Do not build these in MVP:

- customer login workspace
- permanent public JTE shell
- duplicated business logic in Next API routes
- automated billing system
- full self-serve checkout
- Axis 2.5 rights or exclusivity engine
- Axis 3 B2C recovery surface
- Houston Axis 2 activation
- multi-metro full automation before Austin works

---

## 13. Immediate P0 work
These are the first tasks to execute next:

1. add the Next frontend workspace
2. implement the shared frontend shell
3. migrate the homepage
4. migrate the public product pages
5. define the inquiry API contract
6. move the order-start flow behind the new frontend

Why this is P0:

- it locks visual quality early
- it gives the migration a real spine
- it removes the biggest current product-quality bottleneck first

---

## 14. Final lock
The hood MVP implementation plan is:

- frontend first for public quality
- backend truth remains in Spring
- public route parity before cleanup
- packet preview and commerce wiring after the shell is stable
- public JTE retirement after Next parity

This build order is locked unless a later business constraint clearly forces a change.
