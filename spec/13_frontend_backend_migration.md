# 13 Frontend-Backend Migration

## 1. Purpose
This file defines how hood moves from:

- `Spring MVC + JTE public pages`

to:

- `Next.js frontend + Spring Boot API backend`

This is a migration execution document, not just a stack preference note.

---

## 2. Target state

## 2.1 Final product boundary
Final ownership is:

- `Next.js`: every browser-facing page
- `Spring Boot`: APIs, domain logic, persistence, exports, delivery records, outbound analysis

That means the final product should read as:

- one frontend application
- one backend application

Not:

- a permanent hybrid of public JTE plus React

## 2.2 Transitional rule
During migration, some JTE pages may temporarily remain.

But this is only a cutover convenience.

Locked rule:
JTE is a migration bridge, not the target architecture.

---

## 3. Repository shape

Recommended repository shape during migration:

```text
/hood
  /frontend
    package.json
    next.config.ts
    tsconfig.json
    src/app
    src/components
    src/lib
    public
  /spec
  /src/main/java
  /src/main/resources
  /src/test/java
  build.gradle
```

Clarification:

- the current repository root remains the Spring backend
- the new Next app lives in `/frontend`
- this avoids unnecessary backend relocation before revenue work is stable

---

## 4. Route ownership

## 4.1 Frontend-owned routes
These routes should move to `Next.js` first:

- `/`
- `/axis-1`
- `/axis-2`
- `/samples`
- `/samples/axis-1`
- `/samples/axis-2`
- `/pricing`
- `/start`
- `/start/submitted`

Next should also own later browser-facing routes such as:

- delivery preview screens
- order confirmation screens
- internal ops screens if they are promoted into the frontend app

## 4.2 Backend-owned routes
Spring Boot should own:

- `/api/public/*`
- `/api/axis1/*`
- `/api/axis2/*`
- `/api/commercial/*`
- `/api/outbound/*`
- `/api/delivery/*`

Recommended binary/download routes may remain backend-owned:

- `/api/delivery/{token}/pdf`
- `/api/export/*`

---

## 5. First API boundary
The first migration does not require every API to exist.

It does require stable backend ownership for:

### 5.1 Public-site config
Useful fields:

- site name
- support email
- pricing snapshot
- metro availability

### 5.2 Order-start flow
Minimum contract:

- create inquiry or lead
- store product interest
- store company and contact details
- return acknowledgment state

### 5.3 Sample and pricing content
This may begin as frontend-owned static content if needed.

Locked rule:
Do not block the frontend migration on turning every sentence into CMS data.

### 5.4 Packet preview data
The backend must eventually provide:

- Axis 1 preview payload
- Axis 2 preview payload
- delivery-token payloads

---

## 6. Migration phases

## Phase 0. Lock the docs
Deliverables:

- technical stack doc updated
- implementation plan updated
- acceptance matrix updated
- migration spec added

Ship bar:

- there is no ambiguity about Next.js owning the frontend target state

## Phase 1. Frontend scaffold
Deliverables:

- `/frontend` Next.js app
- shared layout
- global theme
- navigation
- footer
- home-page route

Ship bar:

- frontend builds locally
- shared design direction is visible

## Phase 2. Public route migration
Deliverables:

- Axis 1 page
- Axis 2 page
- samples pages
- pricing page
- start page
- submitted page

Ship bar:

- all public routes have Next equivalents
- the product no longer depends on public JTE pages for MVP-facing browsing

## Phase 3. Order-start API path
Deliverables:

- backend inquiry endpoint
- frontend submission path
- confirmation state
- mail or manual follow-up handoff preserved

Ship bar:

- a real vendor can start the process through the new frontend

## Phase 4. Packet preview migration
Deliverables:

- Axis 1 preview route in Next
- Axis 2 preview route in Next
- backend preview payloads
- PDF/export linkage defined

Ship bar:

- sample trust surfaces no longer depend on server templates

## Phase 5. Public JTE cutover
Deliverables:

- remove or retire public JTE controllers
- remove JTE public templates
- remove root Tailwind public-page pipeline if unused

Ship bar:

- Spring no longer serves public marketing pages

---

## 7. Transitional code rules

1. Do not add new marketing work to JTE.
2. Do not create duplicate product truth in Next and Spring.
3. Do not migrate backend domain logic into the frontend just because a page moved.
4. Do not block the cutover on perfect ops UI migration.
5. Public-page parity matters more than premature frontend feature breadth.

---

## 8. Deployment shape

## 8.1 Runtime containers
Recommended production runtime:

- `frontend` container running Next.js
- `backend` container running Spring Boot
- `proxy` container routing domain traffic

## 8.2 Local development
Recommended local setup:

- Next dev server on `3000`
- Spring Boot API on `8080`
- frontend calls backend through env-configured base URL or proxy rewrite

## 8.3 Registry and server flow
Locked deployment model:

- GitHub Actions builds and pushes images
- Oracle server pulls latest images
- Docker Compose restarts the stack

This preserves the current operator deployment habit while improving architecture clarity.

---

## 9. Cutover checklist
The public cutover is ready when:

1. Next routes exist for every public MVP path.
2. visual quality is at or above the locked design direction.
3. start flow works against real backend data handling.
4. public SEO metadata exists in Next.
5. pricing and samples are no longer served from JTE.
6. Spring public-site controllers can be safely removed or retired.

---

## 10. Final lock
hood is migrating to:

- `Next.js frontend`
- `Spring Boot backend`

This is the target architecture.

Any temporary coexistence with JTE is transitional and should be removed after route parity is reached.
