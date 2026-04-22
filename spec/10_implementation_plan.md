# 10 Implementation Plan

## 1. Purpose
This file turns the locked hood strategy and UI specs into an execution plan.

It defines:

- build order
- package shape
- route shape
- data and persistence recommendations
- delivery milestones
- explicit non-goals

Locked rule:
This plan is for `paid utility first`, not for maximum feature surface.

---

## 2. Build strategy

## 2.1 Core principle
Build hood as a `public product + packet engine + internal ops tool`.

That means:

- public pages are customer-facing
- packet rendering is product-critical
- internal ops screens may exist for our own workflow
- customer login is still not required for MVP

## 2.2 What ships first
The MVP should ship in this order:

1. shared app shell and design system
2. Axis 1 paid-ready render path
3. Axis 2 Austin paid-ready batch path
4. pricing, sample, and intake public flow
5. Smartlead handoff and outbound analysis loop

Why this order:

- the product needs visual confidence early
- Axis 1 is the fastest path to one real paid artifact
- Axis 2 needs more data and ops rigor, so it comes after the shared foundations
- pricing and intake should use real artifact structure, not placeholder marketing

## 2.3 Manual-first where quality matters
For Axis 2 MVP, quality beats automation breadth.

Locked rule:
The first Austin Axis 2 path may be `manual-assisted and ops-reviewed`,
as long as the commercial artifact is real and repeatable.

Do not overbuild full multi-metro automation before one paid-quality Austin path exists.

---

## 3. Recommended technical implementation

## 3.1 Application stack
- backend: Spring Boot MVC
- templates: JTE
- styling: Tailwind CSS + daisyUI + typography plugin
- partial interactions: htmx
- tiny client state: Alpine.js
- icons: Heroicons

## 3.2 Persistence recommendation
Recommended default:

- relational data: PostgreSQL
- schema migration: Flyway
- file or image assets in local dev: filesystem storage
- file or image assets in deployable environments: object-storage-ready abstraction

Why:

- hood has enough linked entities that flat files are the wrong default
- a real paid workflow needs reliable relational persistence
- Flyway keeps the new project disciplined from day one

## 3.3 PDF and export
Render flow should support:

- HTML as canonical
- PDF as export
- CSV export only where operationally useful for Axis 2

Locked rule:
The product should still read coherently without CSV.

---

## 4. Package structure

Recommended package shape:

```text
com.owner.hood
  ├─ web
  │   ├─ publicsite
  │   ├─ delivery
  │   ├─ intake
  │   ├─ ops
  │   └─ common
  ├─ application
  │   ├─ vendor
  │   ├─ axis1
  │   ├─ axis2
  │   ├─ outbound
  │   ├─ delivery
  │   └─ pricing
  ├─ domain
  │   ├─ vendor
  │   ├─ axis1
  │   ├─ axis2
  │   ├─ commercial
  │   └─ outbound
  ├─ infrastructure
  │   ├─ persistence
  │   ├─ storage
  │   ├─ pdf
  │   ├─ export
  │   └─ smartlead
  └─ config
```

Package rules:

- keep public-site and ops controllers separate
- keep Axis 1 and Axis 2 application services separate
- keep render logic close to product-axis services, not embedded in controllers

---

## 5. Route plan

## 5.1 Public routes
Recommended first public routes:

- `GET /`
- `GET /axis-1`
- `GET /axis-2`
- `GET /samples`
- `GET /samples/axis-1`
- `GET /samples/axis-2`
- `GET /pricing`
- `GET /start`
- `POST /start`
- `GET /start/submitted`

## 5.2 Delivery routes
Recommended delivery routes:

- `GET /deliver/axis-1/{token}`
- `GET /deliver/axis-2/{token}`
- `GET /deliver/packet/{token}/pdf`

Rules:

- delivery is tokenized
- no customer account is required
- delivery records must still be stored internally

## 5.3 Internal ops routes
These are not public product routes.
They are internal workflow routes for us.

Recommended first ops routes:

- `GET /ops/vendors`
- `GET /ops/vendors/new`
- `GET /ops/axis-1/jobs/new`
- `GET /ops/axis-1/jobs/{id}`
- `GET /ops/axis-2/signals/import`
- `GET /ops/axis-2/projects`
- `GET /ops/axis-2/batches/new`
- `GET /ops/outbound/prospects`
- `GET /ops/outbound/campaigns`

Locked rule:
No customer login does not mean no internal ops surface.

---

## 6. Data and storage phases

## 6.1 Phase-one persistence targets
The first schema should cover:

- vendor organization
- vendor contact
- vendor setup profile
- vendor service area
- Axis 1 job, work item, finding, asset, render
- opportunity project, signal, contact
- Axis 2 batch, batch item, render
- outbound campaign, message, result snapshot
- delivery record
- commercial quote

## 6.2 Asset storage
Store:

- vendor logos
- packet evidence images
- exported PDFs

Rules:

- do not hardwire the app to one local folder path without abstraction
- store file metadata in the relational database

## 6.3 Source capture
Axis 2 records must preserve:

- source name
- source URL
- trigger date
- scoring snapshot
- eligibility status
- canonical project linkage

---

## 7. Rendering plan

## 7.1 Shared render surfaces
The app should render three visual modes:

1. public marketing pages
2. commercial workflow pages
3. packet pages

These are already locked in the UI specs and should be reflected in template structure.

## 7.2 JTE structure recommendation

```text
src/main/jte
  ├─ layout
  │   ├─ site.jte
  │   ├─ workflow.jte
  │   └─ packet.jte
  ├─ page
  │   ├─ home.jte
  │   ├─ axis1.jte
  │   ├─ axis2.jte
  │   ├─ pricing.jte
  │   ├─ samples.jte
  │   └─ intake.jte
  ├─ packet
  │   ├─ axis1-brief.jte
  │   └─ axis2-first-touch.jte
  └─ component
      ├─ nav.jte
      ├─ footer.jte
      ├─ panel.jte
      ├─ status-chip.jte
      ├─ pricing-card.jte
      └─ packet-block.jte
```

## 7.3 Render priorities
The first must-have renders are:

1. home page
2. Axis 1 brief HTML
3. Axis 1 brief PDF
4. Axis 2 packet HTML
5. Axis 2 packet PDF
6. pricing page
7. intake page

---

## 8. Delivery milestones

## M0. Project bootstrap
Deliverables:

- Spring Boot app booting
- JTE integrated
- Tailwind build working
- base package structure
- base migrations

Ship bar:

- app boots
- one JTE page renders
- CSS pipeline works

## M1. Shared shell and public skeleton
Deliverables:

- shared tokens
- layout shell
- panel primitives
- top nav and footer
- skeletal home, pricing, samples, intake pages

Ship bar:

- UI matches the locked direction
- no dashboard chrome leaks into public pages

## M2. Axis 1 paid-ready path
Deliverables:

- vendor setup storage
- Axis 1 job entry path
- Axis 1 render service
- HTML brief
- PDF brief
- tokenized delivery

Ship bar:

- one real vendor setup can produce one sendable Axis 1 packet

## M3. Axis 2 Austin paid-ready path
Deliverables:

- signal import path
- canonical project dedupe
- scoring storage
- batch builder
- first-touch packet render
- paid batch assembly path

Ship bar:

- one Austin batch of 10 deduped live opportunities can be built and delivered

## M4. Public commercial path
Deliverables:

- real pricing page
- real sample pages with masking
- real intake flow
- public CTA routing

Ship bar:

- a vendor can understand the offer and start the process without login

## M5. Outbound loop
Deliverables:

- vendor prospect sourcing path
- Smartlead handoff structure
- campaign records
- outbound result sync or import
- result analysis views

Ship bar:

- hood can evaluate which list or angle is working after sends occur

---

## 9. Sprint order

## Sprint 1
- M0
- M1 foundations

## Sprint 2
- finish M1
- start M2 vendor setup and Axis 1 data model

## Sprint 3
- finish M2
- start M3 signal import, dedupe, and scoring storage

## Sprint 4
- finish M3
- start M4 public pricing, samples, and intake

## Sprint 5
- finish M4
- start M5 outbound handoff and analysis

## Sprint 6
- QA pass
- PDF polish
- acceptance gate review

Locked rule:
Do not start multi-metro Axis 2 expansion before Austin M3 is commercially usable.

---

## 10. Testing plan

## 10.1 Required test classes
- controller render tests for public routes
- controller render tests for delivery routes
- domain tests for Axis 2 dedupe and scoring
- service tests for Axis 1 brief assembly
- service tests for Axis 2 packet assembly
- integration tests for token delivery

## 10.2 Critical acceptance tests
At minimum, test:

1. one vendor setup can be saved
2. one Axis 1 job can render to HTML and PDF
3. one Axis 2 paid batch of 10 can be assembled from canonical projects
4. unsupported metros cannot be sold as active Axis 2 inventory
5. public sample masking works
6. delivery token works without login

---

## 11. Explicit non-goals for MVP
Do not build these in MVP:

- customer login workspace
- public dashboard shell
- automated billing system
- full self-serve checkout
- Axis 2.5 rights or exclusivity engine
- Axis 3 B2C recovery surface
- Houston Axis 2 activation
- multi-metro full automation before Austin works

---

## 12. Immediate P0 work
These are the first tasks to execute next:

1. scaffold the Spring Boot + JTE app
2. wire Tailwind build and base layout
3. create database migrations for core entities
4. implement shared panel and packet primitives
5. render home skeleton and pricing skeleton
6. implement vendor setup profile flow
7. implement first Axis 1 render path

Why this is P0:

- it locks visual quality early
- it creates one real product artifact fast
- it gives the project a real execution spine before Axis 2 data complexity expands

---

## 13. Final lock
The hood MVP implementation plan is:

- foundation first
- Axis 1 first paid artifact
- Axis 2 Austin next
- public commercial flow after real artifacts exist
- Smartlead handoff and analysis after the product path is real

This build order is locked unless a later business constraint clearly forces a change.
