# 17 Public Route Roles

## 1. Purpose

This file locks the public route roles so sample, delivery, builder, and export
links do not collapse into the same meaning.

---

## 2. Route Groups

### 2.1 Marketing pages

These pages explain the product to vendors.

- `/`
- `/axis-1`
- `/axis-2`
- `/pricing`
- `/samples`
- `/samples/axis-1`
- `/samples/axis-2`
- `/start`
- `/start/submitted`

Rule:
Marketing pages are vendor-facing. They can explain, compare, and sell, but they
should not be treated as the customer delivery surface.

---

### 2.2 Customer proof links

These pages are the packet links a restaurant customer or proof recipient can
open.

- `/p/sample-hood-cleaning`
- `/p/free`
- `/p/local/[packetId]`

Rule:
`/p/*` is the canonical customer proof-link namespace.

---

### 2.3 Builder and export pages

These pages are creation or document-generation surfaces.

- `/axis-1/tool`
- `/exports/axis-1-packet`

Rule:
Builder and export pages can create or preview outputs, but they are not the
canonical customer proof-link URLs.

---

### 2.4 Legacy report aliases

These routes are retained for compatibility only.

- `/reports/sample-hood-cleaning` redirects to `/p/sample-hood-cleaning`
- `/reports/free-axis-1` redirects to `/p/free`
- `/reports/local-axis-1/[packetId]` redirects to `/p/local/[packetId]`

Rule:
Do not add new customer-facing routes under `/reports/*`. Use `/p/*` instead.

---

## 3. Naming Rules

1. Use `/samples/*` for vendor-facing public demos.
2. Use `/p/*` for restaurant/customer proof links.
3. Use `/exports/*` for PDF and print-oriented output.
4. Use `/axis-1/tool` for free builder workflow.
5. Keep old `/reports/*` routes as redirects until existing shared links can
   expire safely.
