# 15 Axis 1 Builder Access Model

## 1. Purpose
This file locks the commercial boundary for the first public Axis 1 tool.

The tool is not a full field-service platform.
It is a `neutral packet builder` that lets a hood vendor feel the product before
brand, delivery, and persistence are unlocked.

Locked rule:
Do not give away the branded customer-facing packet system for free.

---

## 2. Product logic
The free layer should answer:

`Would this packet help me explain the job better?`

The paid layer should answer:

`Can I use this as my real customer document?`

That means the free tool proves the packet structure.
The paid unlock turns it into a real vendor asset.

---

## 3. Free tool definition
The first public tool is:

- Axis 1 only
- browser-based
- no-login
- neutral branding
- live preview first

It should feel fast enough for a busy owner or office lead to test in minutes.

It is not:

- a CRM
- a team portal
- a final branded export system
- a saved history platform

---

## 4. Free inputs
The free builder may accept:

- packet state: exception or clean close
- property or customer name
- site or city
- service date
- authorized by
- next-service cadence preset
- system or hood-line label
- service window
- exception chips
- short exception note only when needed
- follow-up stance
- optional wording override only when needed
- optional local proof photo uploads for preview

Why:

- normal jobs should not require manual packet writing
- the system should auto-write standard packet language from quick selections
- only exception jobs should expand the input depth
- this is enough to prove packet usefulness without giving away the full operating layer

---

## 4.1 Field photo intake lock
The first builder must treat field photos as a structured proof set, not as a
generic image gallery.

Default proof slots:

- before hood interior
- after hood interior
- filter bank reset
- access or exception condition
- rooftop fan or hinge line
- grease removed or containment path
- service label or notice

Required behavior:

- bulk add should be supported before manual slot editing
- filename and ordering heuristics may auto-map photos into slots
- auto-mapped photos should expose confidence: filename match, order match, or manual placement
- the UI should show missing required proof before the full slot list
- already mapped photos should collapse into a mapped-proof review area
- wrong auto-matches must be movable to another slot without re-uploading
- drag-and-drop and file picker should feed the same mapping path
- every slot must remain manually replaceable
- empty slots may fall back to sample images in the free preview
- uploaded files stay local in the browser for the free tool

Locked rule:
The builder should feel like `sort the field photos into proof slots`, not
`write a report and decorate it with photos`.

Paid boundary:
Real photo storage, saved proof archives, cross-browser retrieval, customer
history, and branded delivery are not part of the free local preview.

---

## 4.2 Builder flow lock
The free builder should not feel like a long form.

Default flow:

1. `Job`
   capture the job pattern, customer/site facts, service date, authorized-by,
   cadence, and only the exception fields needed for that pattern
2. `Photos`
   bulk add the phone batch first; proof-slot review stays collapsed until the
   vendor uploads photos or explicitly asks to review missing photos
3. `Report`
   review the customer-facing report and tune wording only if the auto-written
   language is not good enough

Locked rule:
Manual wording fields are last-mile controls. They should not be presented as
the main way to build the packet.

Proof-slot resolution states:

- `uploaded`: real local field photo is mapped to the slot
- `not captured`: the vendor confirms the proof was not captured on this visit
- `not applicable`: the proof slot does not apply to this visit
- `open`: the slot still needs a photo or resolution decision

Required proof is considered ready when it is either uploaded or intentionally
resolved as not captured / not applicable.

Default UX rule:
Do not show the full proof-slot queue on first entry. The first visible action
should be `add the visit photos`. Missing-proof controls are advanced review
controls, not the default experience.

Photo UX rule:
Before / after photos should be the easiest optional inputs. If the crew did
not capture them, the vendor should be able to continue without them. The tool
must not make missing photos feel like a blocking error. Before / after slots
are quick-start inputs, not final classification. The report preview must expose
a photo placement review so a vendor can move a mismatched photo to fan, access,
filter, grease, label, before, or after without re-uploading. The preferred
interaction is drag-to-role using a real drag library, with a dropdown fallback
for precise correction.

Duplicate-photo rule:
If multiple uploaded photos appear to match the same role, the first usable
photo may fill that role, but the later matching files must stay in an extra
photo tray. The system must not silently file same-label photos into unrelated
empty roles. The vendor can drag an extra photo onto a role to replace the
representative photo.

Preview editing rule:
The vendor should be able to edit the customer-facing summary, customer action,
and recorded note from the report preview step. These are live text overrides,
not required writing fields.

Customer-facing preview rule:
If a slot is intentionally marked not captured or not applicable, the free
preview should not show a sample image as if it were real proof.

Why:

- busy vendors should not have to type normal report language
- missing photos must be explicit instead of silently replaced by polished
  sample imagery
- the tool should feel like `classify job -> sort proof -> review report`

---

## 5. Free output rules
Free output should allow:

- live HTML packet preview
- neutral packet masthead
- sample-safe technician and credential placeholders
- local preview of entered job details

Free output should not allow:

- real vendor branding
- live customer-facing CTA path
- durable saved packet history
- customer database behavior
- cross-browser retrieval
- full branded delivery workflow

### 5.1 Output surface split
The builder has two different output surfaces:

- `customer link preview`: the browser version of the customer-facing report
- `PDF / print layout`: a tighter Letter-style document version for saving,
  attaching, or printing

Locked rule:
Do not make the UI imply that the browser preview and the saved PDF are pixel-identical.
They share the same report content and brand system, but the PDF is allowed to reflow
into print columns and page breaks.

Why:

- the link view should feel readable and modern in a browser
- the PDF should feel like a real operating document
- vendors should not be surprised when print output is denser than the live preview

### 5.2 Hosted customer link model
A real customer link is a separate public report surface, not the builder page.

Required behavior:

- route shape should use an opaque unguessable token, such as `/r/[shareToken]`
- page must be `noindex,nofollow`
- the report link must not appear in sitemap, navigation, or generic public indexes
- the page should not include the marketing header, marketing footer, input form,
  builder controls, or internal preview chrome
- the page may include minimal vendor identity, customer report content, and an
  optional print/save action

Persistence rule:
If the customer link must work after the vendor closes the browser, opens another
device, or sends it to a customer, the report must be stored server-side.

Minimum stored data:

- normalized report JSON
- normalized/compressed report photos
- vendor identity used on the report
- share token
- created timestamp
- optional expiry and revoke status

Free local-preview rule:
The no-login free builder may remain browser-local. In that mode uploaded photos
and input state are not server-stored, and the output is limited to live preview
plus local print/save PDF.

Do not encode full reports and photos into public URLs.

MVP infrastructure lock:

- structured report/link metadata should use SQLite first
- report photos should use Cloudflare R2 when hosted links become real
- CSV may be used for manual export/import, but not as the live customer-link
  source of truth
- local disk storage may be used only as a temporary development fallback

Why:

- SQLite keeps the first server cheap and simple
- R2 keeps large image files out of the database
- customer links need token, expiry, revoke, and status fields that are unsafe
  to manage as loose CSV rows
- MySQL/PostgreSQL is not required until concurrency or paid-history scope grows

---

## 6. Paid unlock layer
The first paid unlock is `branded packet unlock`, not `CRM subscription`.

Paid unlock should control:

- vendor company name in packet
- logo or brand lockup
- direct phone
- dispatch email
- review link or branded CTA link
- certification or registration language
- branded PDF export
- branded clean-close and exception variants
- saved packet history
- reopen from another browser or device
- customer record reuse

Locked rule:
The paid unlock should make the packet operationally usable, not merely prettier.

---

## 7. Why branding is paid
Branding fields are not cosmetic.

They convert the packet from:

- a neutral tool demo

into:

- a real customer-facing revenue artifact

That includes:

- trust signal
- rebook path
- repair follow-up path
- direct reply path

So brand, CTA, and contact identity are commercial control points.

---

## 8. What should stay out of the free layer
Do not give the free layer:

- unlimited branded export
- saved history
- customer management
- team seats
- synced records across browsers
- permanent packet archive
- branded PDF download

Why:

- those move the product from proof-of-value to real operating system
- that operating system is what gets paid for

---

## 9. UX rules for the tool
The builder should feel usable by a busy vendor.

Required posture:

- one screen of high-signal fields
- plain-English labels
- live preview without a submit wall
- desktop should feel like `capture on the left, final tune on the right`
- no fake account requirement
- adaptive depth:
  clean jobs stay short
  exception jobs expand only when needed
- manual writing should be optional, not the default

The user should feel:

`I can tell what this does in under two minutes`

not:

`I am onboarding into software`

---

## 10. Commercial rule
Do not position the first paid layer as:

- generic subscription software
- field-service platform replacement

Position it as:

- branded packet unlock
- delivery unlock
- saved packet unlock

That framing matches the actual value.

---

## 11. Final lock
Axis 1 tool monetization should follow this ladder:

1. free neutral builder
2. branded packet unlock
3. saved history and customer reuse
4. broader operational layers only after repeated paid use exists

The current implementation target is `1 + the visible edge of 2`.
