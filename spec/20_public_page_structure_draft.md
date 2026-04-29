# 20 Public Page Structure Draft

## 1. Purpose

This is a draft structure for reducing public-page confusion before the site is
fully reorganized.

The goal is to keep each page responsible for one job:

- explain the product
- show the sample
- deliver the customer artifact
- create a packet
- render the PDF
- show price / setup path

Rule:
The same page should not try to be SEO landing page, customer artifact, builder,
and pricing page at once.

---

## 2. Target Page Roles

### 2.1 Home

Route:

- `/`

Role:
High-level product entry.

This page should answer:

- What is this?
- Who is it for?
- What does the vendor get?
- What should I click next?

Primary CTAs:

- View sample packet
- Try input tool
- See pricing

Rule:
Home should orient, not explain every detail.

---

### 2.2 SEO / explanation page

Route:

- `/axis-1`

Role:
Problem and product explanation page for hood / kitchen exhaust vendors.

This page should explain:

- why loose photos and emails create customer confusion
- why a customer proof link is useful
- why a PDF service record matters
- how blocked / inaccessible areas stay clear
- how the input tool keeps vendor effort low
- what the free versus paid boundary is

Primary CTAs:

- View sample packet
- Try input tool
- See pricing

Rule:
`/axis-1` is the "why use this?" page.

---

### 2.3 Input tool page

Route:

- `/axis-1/tool`

Role:
Vendor-side packet creation surface.

This page should feel like:

- upload photos
- confirm result
- send / save

It should not feel like:

- a long report editor
- a marketing page
- a product documentation page

Primary actions:

- Drop job photos
- Continue without photos
- Confirm result
- Copy customer link
- Save PDF

Rule:
The input tool is the closeout machine. Marketing explanation should stay
minimal.

---

### 2.4 Sample explanation page

Route:

- `/samples/axis-1`

Role:
Explain the sample artifact and guide a vendor through what they are seeing.

This page should explain:

- what the customer sees first
- how photo evidence is organized
- how open / blocked items are separated
- what the PDF is for
- how to try the tool with their own photos

Primary CTAs:

- Open customer sample
- View sample PDF
- Try this with your photos

Rule:
`/samples/axis-1` is the "how to inspect the sample" page. It should not repeat
the full SEO sales explanation from `/axis-1`.

---

### 2.5 Customer sample artifact

Route:

- `/p/sample-hood-cleaning`

Role:
The final customer-facing web artifact.

This page should feel like something a restaurant customer receives after a
service visit.

It should not contain:

- product marketing
- "how the SaaS works" explanation
- vendor acquisition copy
- pricing copy

Rule:
`/p/sample-hood-cleaning` is the artifact itself. It should behave like a real
customer proof link.

---

### 2.6 PDF sample / export page

Route:

- `/exports/axis-1-packet`

Role:
Print / PDF rendering surface for the service evidence record.

This page should support:

- sample PDF generation
- print layout
- proof record review
- archive / insurance / landlord / manager submission use cases

It should not be treated as:

- the main landing page
- a general sample explanation page

Rule:
PDF is an output surface, not a navigation destination for casual browsing.

---

### 2.7 Pricing / money page

Route:

- `/pricing`

Role:
Simple pricing and plan boundary.

This page can be skeletal during MVP.

It should clarify:

- free preview limitations
- paid branding / delivery / history
- hosted links
- PDF / record retention
- setup or subscription CTA

Rule:
Pricing should stay simple until the product and ICP are tighter.

---

## 3. Cold Email Link Rules

### 3.1 First cold email

Recommended primary link:

- `/p/sample-hood-cleaning`

Reason:
The artifact is stronger than an explanation. The recipient can immediately see
what their customer would receive.

Supporting links:

- `/samples/axis-1` as "see how it works"
- `/axis-1/tool` as "try with your photos"

Rule:
If the email promise is "your customer would open something like this," use the
artifact link.

---

### 3.2 SEO or search traffic

Recommended landing page:

- `/axis-1`

Reason:
Search users need context before inspecting the sample.

Rule:
SEO traffic should not land directly on the raw customer artifact unless the
query is clearly sample-oriented.

---

### 3.3 Sample review context

Recommended page:

- `/samples/axis-1`

Reason:
This page can explain what makes the artifact useful without polluting the
customer artifact itself.

Rule:
Use the sample explanation page when the vendor needs interpretation, not just
the final artifact.

---

## 4. Pages To De-Emphasize During Axis 1 MVP

These pages can exist, but should not dominate primary navigation while Axis 1
is the active MVP:

- `/samples`
- `/axis-2`
- `/samples/axis-2`

These routes should remain redirects / compatibility paths only:

- `/reports/sample-hood-cleaning`
- `/reports/free-axis-1`
- `/reports/local-axis-1/[packetId]`

Rule:
Do not remove routes that are needed for compatibility, but do not let old or
secondary routes define the product structure.

---

## 5. Implementation Notes For Later

When reorganizing the site:

1. Keep `/axis-1` focused on problem, product, proof, and CTA.
2. Rewrite `/samples/axis-1` as sample-guided inspection, not another landing
   page.
3. Keep `/p/sample-hood-cleaning` free of vendor-acquisition copy.
4. Make `/axis-1/tool` photo-first and closeout-first.
5. Keep `/exports/axis-1-packet` reachable from the sample page, but avoid
   treating it as a marketing page.
6. Simplify `/pricing` to a plain plan boundary until real sales data exists.

Rule:
Route cleanup should happen after the input tool is locked enough that the main
CTA does not send users into a confusing creation flow.

---

## 6. Draft Verdict

Current public structure is not wrong, but it is too mixed.

The target structure is:

- `/` = product orientation
- `/axis-1` = why use this
- `/axis-1/tool` = create it
- `/samples/axis-1` = inspect the sample
- `/p/sample-hood-cleaning` = customer artifact
- `/exports/axis-1-packet` = PDF artifact
- `/pricing` = money / plan boundary

Rule:
The next product work should lock the input tool first, then reorganize the
public pages around this structure.
